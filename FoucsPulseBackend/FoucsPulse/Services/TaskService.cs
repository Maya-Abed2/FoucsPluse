using FoucsPulse.Data;
using FoucsPulse.Models;
using FoucsPulse.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using FoucsPulse.DTOs;
namespace FoucsPulse.Services
{
    public class TaskService : ITaskService
    {
        private readonly AppDbContext _context;
        private readonly IAIService _aiService;
        public TaskService(AppDbContext context,IAIService aIService )
        {
            _context = context;
            _aiService = aIService;
        }
        public async Task<Tasks> CreateTaskWithMircoTasksAsync(int userId, string title, string description, int requiredEnergy)
        {
            // 1. إنشاء المهمة الرئيسية مع الطاقة التي اختارها المستخدم
            var task = new Tasks
            {
                Title = title,
                Description = description,
                UserId = userId,
                RequiredEnergy = requiredEnergy // الحفظ هنا
            };

            _context.tasks.Add(task);
            await _context.SaveChangesAsync();

            // 2. استدعاء خدمة الذكاء الاصطناعي لجلب الخطوات الفرعية وطاقاتها
            var aiMicroTasks = await _aiService.GenerateMicroTasksWithAIAsync(title);


            foreach (var dto in aiMicroTasks)
            {
                int energyCode = 2;

                // إذا كانت dto.RequiredEnergy تعود كـ int أصلاً (لأن الدالة ترجع MicroTasks):
                // يمكنك استخدامها مباشرة بدون Trim و ToLower لأنها رقم وليست نص!

                var microTask = new MicroTasks
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    OrderIndex = dto.OrderIndex,
                    
                    TaskId = task.Id
                };

                _context.microTasks.Add(microTask);
            }

            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<MicroTasks?> GetPanicMicroTaskAsync(int userId)
        {
            // البحث عن أسهل خطوة فرعية غير منجزة للمستخدم (نبدأ بالطاقة المنخفضة = 1)
            var panicTask = await _context.microTasks
                .Include(mt => mt.Task)
                .Where(mt => mt.Task.UserId == userId && !mt.IsCompleted)
                .FirstOrDefaultAsync();

            return panicTask;
        }
    }
}
