using Microsoft.AspNetCore.Mvc;
using FoucsPulse.DTOs;
using System.Text;
using System.Text.Json;

namespace FoucsPulse.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiCompanionController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public AiCompanionController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
        }

        [HttpPost("voice-interact")]
        public async Task<IActionResult> VoiceInteract([FromBody] VoiceInteractionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.SpokenText))
            {
                return BadRequest(new { message = "لم يتم التقاط أي نص بوضوح." });
            }

            try
            {
                string? apiKey = _configuration["Gemini"]
                              ?? _configuration["Gemini:ApiKey"]
                              ?? _configuration["GeminiSettings:ApiKey"]
                              ?? _configuration["ApiKey"];

                if (string.IsNullOrEmpty(apiKey))
                {
                    return Ok(new
                    {
                        robotReplyText = "مفتاح Gemini غير موجود في appsettings.json",
                        robotMood = "supportive"
                    });
                }

                string systemPrompt = @"You are Emo Robot, a smart, empathetic desktop companion for ADHD & focus support in FocusPulse.
CRITICAL RULE: Always reply in the EXACT SAME LANGUAGE as the user's message (If the user speaks Arabic, reply in warm, concise Arabic. If the user speaks English, reply in friendly, concise English).
Keep your answers very short (1-2 sentences maximum), encouraging, warm, direct, and without any markdown symbols or formatting.";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = $"{systemPrompt}\n\nUser message: {dto.SpokenText}" }
                            }
                        }
                    }
                };

                var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

                // تنفيذ محاولتين مع انتظار بسيط في حال حدوث Too Many Requests (429)
                HttpResponseMessage response = null;
                string jsonResponse = string.Empty;

                for (int attempt = 1; attempt <= 2; attempt++)
                {
                    response = await _httpClient.PostAsync(url, jsonContent);
                    jsonResponse = await response.Content.ReadAsStringAsync();

                    if (response.IsSuccessStatusCode)
                    {
                        break;
                    }

                    // إذا كان الخطأ Too Many Requests (429)، ننتظر ثانية ونعيد المحاولة
                    if ((int)response.StatusCode == 429 && attempt < 2)
                    {
                        Console.WriteLine("Rate limit hit (429). Retrying after 1.5 seconds...");
                        await Task.Delay(1500);
                        continue;
                    }
                    break;
                }

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Gemini API Error Status: {response.StatusCode}");
                    Console.WriteLine($"Gemini API Error Body: {jsonResponse}");

                    if ((int)response.StatusCode == 429)
                    {
                        return Ok(new
                        {
                            robotReplyText = "لقد قمنا بإرسال طلبات كثيرة في وقت قصير. يرجى الانتظار ثوانٍ قليلة والمحاولة مرة أخرى! 🌿 / Too many requests, please wait a moment.",
                            robotMood = "supportive"
                        });
                    }

                    return Ok(new
                    {
                        robotReplyText = $"حدث خطأ في الاتصال بالذكاء الاصطناعي (Status: {response.StatusCode})",
                        robotMood = "supportive"
                    });
                }

                using var doc = JsonDocument.Parse(jsonResponse);
                var reply = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return Ok(new
                {
                    userSpokenText = dto.SpokenText,
                    robotReplyText = reply?.Trim() ?? "I am here with you!",
                    robotMood = "encouraging"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in Controller: {ex.Message}");
                return Ok(new
                {
                    robotReplyText = "أنا بجانبكِ يا مايا، فلنأخذ استراحة قصيرة ونستمر!",
                    robotMood = "supportive"
                });
            }
        }
    }
}