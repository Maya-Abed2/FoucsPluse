namespace FoucsPulse.DTOs
{
    public class CreateTaskDto
    {
        public int UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int RequiredEnergy { get; set; } = 2;

        // ⏱️ الحقول الجديدة الخاصة بشريك التحفيز والوقت
        public string? PartnerName { get; set; }
        public string? PartnerPhone { get; set; }
        public int EstimatedDurationMinutes { get; set; } // إجمالي الوقت المقترح

        // قائمة المهام الصغيرة التابعة للمهمة الكبيرة مع وقتها المقترح
        public List<CreateMicroTaskDto> MicroTasks { get; set; } = new();
    }

    public class CreateMicroTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int EstimatedMinutes { get; set; } // الوقت المقترح بالدقائق لهذه المهمة الصغيرة (من الـ AI)
    }
}