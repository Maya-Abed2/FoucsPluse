namespace FoucsPulse.Models
{
    public class Achievements
    {
        public int Id { get; set; }
        public string BadgeName { get; set; }
        public string IconUrl { get; set; }
        public DateTime UnlockedAt { get; set; }
        // Foreign key for the user who unlocked the achievement
        
        public int UserId { get; set; }
        public Users User { get; set; }
    }
}
