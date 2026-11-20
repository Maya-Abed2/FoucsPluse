namespace FoucsPulse.Models
{
    public class MicroTasks
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public int OrderIndex { get; set; }

        // ⏱️ الوقت المقترح بالدقائق لهذه المهمة الصغيرة
        public int EstimatedMinutes { get; set; }

        // علاقة المهمة الرئيسية
        public int TaskId { get; set; }
        public Tasks? Task { get; set; }
    }
}