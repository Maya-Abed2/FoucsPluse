using System.Text;
using System.Text.Json;
using FoucsPulse.Models;
using FoucsPulse.Services.Interfaces;

namespace FoucsPulse.Services
{
    public class AIService : IAIService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public AIService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<List<MicroTasks>> GenerateMicroTasksWithAIAsync(string TaskTitle)
        {
            // 1. جلب المفتاح والتأكد أنه ليس فارغاً
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                throw new Exception("Gemini API Key is missing or not configured properly in appsettings.json!");
            }

            var model = _configuration["Gemini:Model"] ?? "gemini-2.5-flash";

            // 2. بناء الرابط بحيث يحتوي على مفتاح الـ API بوضوح تام
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var prompt = $"أنت مساعد ذكي لتقسيم المهام لتخفيف شلل البدء لمصابي اضطراب فرط الحركة وتشتت الانتباه (ADHD). " +
             $"المستخدم كتب هذه المهمة: \"{TaskTitle}\". " +
             $"قم بتقسيمها إلى **3 إلى 5 خطوات مصغرة** (Micro-Tasks).\n\n" +
             $"**قاعدة صارمة:** حدد مستوى الطاقة RequiredEnergy لكل خطوة بالنص الحرفي حصراً من الخيارات التالية: \"Low\" أو \"Medium\" أو \"High\".\n" +
             $"- اجعل الخطوة الأولى دائماً \"Low\" لكسر شلل البدء.\n" +
             $"- نوع باقي الخطوات بين \"Medium\" و \"High\" حسب صعوبتها.\n\n" +
             $"أجب حصرياً بصيغة JSON Array بالشكل التالي بدون أي رموز إضافية:\n" +
             $"[\n" +
             $"  {{\"Title\": \"تجهيز بيئة العمل\", \"Description\": \"وصف قصير\", \"OrderIndex\": 1, \"RequiredEnergy\": \"Low\"}},\n" +
             $"  {{\"Title\": \"قراءة العناوين الرئيسية\", \"Description\": \"وصف قصير\", \"OrderIndex\": 2, \"RequiredEnergy\": \"Medium\"}},\n" +
             $"  {{\"Title\": \"دراسة الجزء الأكثر صعوبة\", \"Description\": \"وصف قصير\", \"OrderIndex\": 3, \"RequiredEnergy\": \"High\"}}\n" +
             $"]";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorDetails = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API failed with status {response.StatusCode}: {errorDetails}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(jsonResponse);
            var textContent = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            textContent = textContent?.Replace("```json", "").Replace("```", "").Trim();

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                // طباعة ما يرسله الـ AI تماماً لنراه في الـ Output / Terminal
                Console.WriteLine($"=== AI RAW RESPONSE ===\n{textContent}\n=======================");

                var aiDtos = JsonSerializer.Deserialize<List<AiMicroTaskDto>>(textContent ?? "[]", options);

                var microTasksList = new List<MicroTasks>();

                if (aiDtos != null)
                {
                    foreach (var dto in aiDtos)
                    {
                        // تحديد الرقم بناءً على النص القادم بكل بساطة
                        int energyCode = 2; // افتراضي متوسط

                        if (dto.RequiredEnergy != null)
                        {
                            string text = dto.RequiredEnergy.Trim().ToLower();
                            if (text.Contains("low"))
                            {
                                energyCode = 1;
                            }
                            else if (text.Contains("high"))
                            {
                                energyCode = 3;
                            }
                            else
                            {
                                energyCode = 2;
                            }
                        }

                        microTasksList.Add(new MicroTasks
                        {
                            Title = dto.Title,
                            Description = dto.Description,
                            OrderIndex = dto.OrderIndex,
                            
                        });
                    }
                }

                return microTasksList;
            }
            catch (JsonException ex)
            {
                throw new Exception($"Failed to deserialize AI response: {ex.Message}. Response content: {textContent}");
            }
        }
    }
}