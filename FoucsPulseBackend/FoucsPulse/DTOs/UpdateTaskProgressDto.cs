namespace FoucsPulse.DTOs
{
    public class UpdateTaskProgressDto
    {
        public int ActualDurationMinutes { get; set; }
        public bool IsCompleted { get; set; }
        public int UserId { get; set; }
    }
}