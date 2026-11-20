namespace FoucsPulse.Models
{
    public class Tasks
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int RequiredEnergy { get; set; } = 2;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ⏱️ حقول الوقت وشريك التحفيز الجديدة
        public int EstimatedDurationMinutes { get; set; } // الوقت الإجمالي المقترح
        public int ActualDurationMinutes { get; set; }   // الوقت الفعلي عبر الـ Stopwatch
        public string? PartnerName { get; set; }          // اسم شريك التحفيز
        public string? PartnerPhone { get; set; }         // رقم الواتساب للشريك

        // علاقة المستخدم
        public int UserId { get; set; }
        public Users? User { get; set; }

        // علاقة المهام الصغيرة
        public ICollection<MicroTasks> MicroTasks { get; set; } = new List<MicroTasks>();
    }
}