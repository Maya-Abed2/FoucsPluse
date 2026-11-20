namespace FoucsPulse.Models
{
    public class AiMicroTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string RequiredEnergy { get; set; } = "Medium";
    }
}
