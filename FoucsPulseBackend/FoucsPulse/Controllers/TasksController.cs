using FocusPulse.Models;
using FoucsPulse.Data;
using FoucsPulse.DTOs;
using FoucsPulse.Models;
using FoucsPulse.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoucsPulse.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly AppDbContext _context;

        public TasksController(ITaskService taskService, AppDbContext context)
        {
            _taskService = taskService;
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTask(
                    [FromBody] CreateTaskDto dto,
                    [FromServices] IAIService aiService)
        {
            try
            {
                // 1. توليد الخطوات المصغرة ذكياً باستخدام خدمة الـ AI بناءً على عنوان المهمة
                List<MicroTasks> generatedMicroTasks;
                try
                {
                    generatedMicroTasks = await aiService.GenerateMicroTasksWithAIAsync(dto.Title);
                }
                catch (Exception ex)
                {
                    // خطوة احتياطية آمنة في حال فشل الـ AI لكي لا يتعطل إنشاء المهمة
                    generatedMicroTasks = new List<MicroTasks>
                    {
                        new MicroTasks
                        {
                            Title = "البدء بالخطوة الأولى للمهمة",
                            Description = dto.Title,
                            OrderIndex = 1,
                            IsCompleted = false
                        }
                    };
                }

                // 2. إنشاء المهمة الرئيسية مع ربط الخطوات المولدة ذكياً وحقول الوقت والشريك
                var newTask = new Tasks
                {
                    UserId = dto.UserId,
                    Title = dto.Title,
                    Description = dto.Description,
                    RequiredEnergy = dto.RequiredEnergy,
                    PartnerName = dto.PartnerName,
                    PartnerPhone = dto.PartnerPhone,
                    EstimatedDurationMinutes = dto.EstimatedDurationMinutes,
                    CreatedAt = DateTime.UtcNow,
                    MicroTasks = generatedMicroTasks
                };

                _context.tasks.Add(newTask);
                await _context.SaveChangesAsync();

                return Ok(newTask);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserTasks(int userId)
        {
            var tasks = await _context.tasks
                .Where(t => t.UserId == userId)
                .Include(t => t.MicroTasks)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tasks);
        }

        // 1. حذف مهمة كاملة مع كافة خطواتها المصغرة
        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            var task = await _context.tasks
                .Include(t => t.MicroTasks)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                return NotFound(new { message = "المهمة غير موجودة أو تم حذفها مسبقاً." });

            try
            {
                _context.tasks.Remove(task);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // في حال تم حذفها مسبقاً بالتزامن، نعتبر العملية ناجحة ولا نكاشف المستخدم بالخطأ
                return Ok(new { message = "تم حذف المهمة بنجاح 🗑️" });
            }

            return Ok(new { message = "تم حذف المهمة بنجاح 🗑️" });
        }

        [HttpPut("{id}/complete-with-timer")]
        public async Task<IActionResult> CompleteTaskWithTimer(
            int id,
            [FromBody] UpdateTaskProgressDto dto,
            [FromServices] IEmailService emailService)
        {
            var task = await _context.tasks
                .Include(t => t.MicroTasks)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { message = "المهمة غير موجودة." });
            }

            // 1. تحديث حالة المهمة والوقت الفعلي
            task.ActualDurationMinutes = dto.ActualDurationMinutes;
            task.IsCompleted = true;
            foreach (var micro in task.MicroTasks)
            {
                micro.IsCompleted = true;
            }

            // 2. استخدام الـ UserId المرسل من المستخدم الحالي الفعلي الذي أتم المهمة (أو الاعتماد على صاحب المهمة كاحتياط)
            int activeUserId = dto.UserId != 0 ? dto.UserId : task.UserId;

            var currentUser = await _context.users.FirstOrDefaultAsync(u => u.Id == activeUserId);
            string actorName = currentUser?.UserName ?? "صديقك";

            string? recipientEmail = null;
            Users? partnerUser = null;

            // 3. التحقق من مدخلات الشريك (إيميل أو اسم مستخدم)
            if (!string.IsNullOrEmpty(task.PartnerName))
            {
                string partnerInput = task.PartnerName.Trim();

                if (partnerInput.Contains("@"))
                {
                    recipientEmail = partnerInput;
                    partnerUser = await _context.users
                        .FirstOrDefaultAsync(u => u.Email.ToLower() == partnerInput.ToLower());
                }
                else
                {
                    partnerUser = await _context.users
                        .FirstOrDefaultAsync(u => u.UserName.ToLower() == partnerInput.ToLower());

                    if (partnerUser != null)
                    {
                        recipientEmail = partnerUser.Email;
                    }
                }
            }

            // 4. إضافة إشعار داخلي للشريك باسم المستخدم الحالي الفعلي
            if (partnerUser != null)
            {
                var notification = new Notification
                {
                    UserId = partnerUser.Id,
                    Title = $"🎯 إنجاز جديد من {actorName}!",
                    Message = $"أنهى صديقك {actorName} مهمة ({task.Title}) بوقت {task.ActualDurationMinutes} دقيقة!"
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            // 5. إرسال البريد الإلكتروني باسم المستخدم الفعلي صراحةً في النص
            if (!string.IsNullOrEmpty(recipientEmail))
            {
                try
                {
                    string emailSubject = $"🎯 FocusPulse: تقرير إنجاز جديد من {actorName}";
                    string emailBody = $@"
                <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right;'>
                    <h2>مرحباً! 👋</h2>
                    <p>قام صديقك <b>{actorName}</b> للتو بإنهاء مهمته بنجاح عبر تطبيق <b>FocusPulse</b>:</p>
                    <ul>
                        <li><b>المهمة:</b> {task.Title}</li>
                        <li><b>الوقت الفعلي المستغرق:</b> {task.ActualDurationMinutes} دقيقة</li>
                        <li><b>الوقت التقديري:</b> {task.EstimatedDurationMinutes} دقيقة</li>
                    </ul>
                    <p>واصل تشجيعه وتحفيزه! 🚀</p>
                </div>";

                    await emailService.SendEmailAsync(recipientEmail, emailSubject, emailBody);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Failed to send email: {ex.Message}");
                }
            }

            return Ok(new { message = "تم إنهاء المهمة وإرسال التقرير للشريك بنجاح! 🎉" });
        }
        [HttpGet("panic-task/{userId}")]
        public async Task<IActionResult> GetPanicTask(int userId)
        {
            try
            {
                var panicMicroTask = await _taskService.GetPanicMicroTaskAsync(userId);

                if (panicMicroTask == null)
                {
                    return Ok(new { message = "ممتاز! لا يوجد أي مهام متبقية عليك حالياً 🎉", task = (object?)null });
                }

                return Ok(new
                {
                    message = "خذ نفساً عميقاً... ركز فقط على هذه الخطوة البسيطة الآن 🌿",
                    microTaskId = panicMicroTask.Id,
                    title = panicMicroTask.Title,
                    description = panicMicroTask.Description,
                    parentTaskTitle = panicMicroTask.Task?.Title ?? ""
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        [HttpPost("microtask/toggle/{microTaskId}")]
        public async Task<IActionResult> ToggleMicroTask(int microTaskId)
        {
            var microTask = await _context.microTasks
                .Include(m => m.Task)
                .FirstOrDefaultAsync(m => m.Id == microTaskId);

            if (microTask == null)
            {
                return NotFound(new { message = "الخطوة المصغرة غير موجودة." });
            }

            microTask.IsCompleted = !microTask.IsCompleted;

            var user = await _context.users.FirstOrDefaultAsync(u => u.Id == microTask.Task.UserId);
            if (user != null)
            {
                if (microTask.IsCompleted)
                {
                    user.TotalXP += 10;
                }
                else
                {
                    user.TotalXP = Math.Max(0, user.TotalXP - 10);
                }
                user.Level = (user.TotalXP / 100) + 1;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "تم تحديث حالة الخطوة بنجاح",
                isCompleted = microTask.IsCompleted,
                totalXP = user?.TotalXP ?? 0,
                level = user?.Level ?? 1
            });
        }
    }
}