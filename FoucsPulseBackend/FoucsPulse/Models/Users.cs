namespace FoucsPulse.Models
{
    public class Users
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int TotalXP { get; set; }
        public int Level { get; set; }

        public ICollection<Tasks> Tasks { get; set; } = new List<Tasks>();
        public ICollection<Achievements> Achievements { get; set; } = new List<Achievements>();

    }
}
