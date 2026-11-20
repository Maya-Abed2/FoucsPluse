using FocusPulse.Models;
using FoucsPulse.Models;
using Microsoft.EntityFrameworkCore;

namespace FoucsPulse.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Users> users { get; set; }
        public DbSet<Tasks> tasks { get; set; }
        public DbSet<MicroTasks> microTasks { get; set; }
        public DbSet<Achievements> achievements { get; set; }
        public DbSet<SoundTrack> SoundTraks { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // العلاقة بين User و Task (1 : N)
            modelBuilder.Entity<Tasks>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // العلاقة بين Task و MicroTask (1 : N)
            modelBuilder.Entity<MicroTasks>()
                .HasOne(mt => mt.Task)
                .WithMany(t => t.MicroTasks)
                .HasForeignKey(mt => mt.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            // العلاقة بين User و Achievement (1 : N)
            modelBuilder.Entity<Achievements>()
                .HasOne(a => a.User)
                .WithMany(u => u.Achievements)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SoundTrack>()
                .HasData(
                    new SoundTrack
                    {
                        Id = 1,
                        Title = "Rain Sounds",
                        Category = "Nature",
                        AudioUrl = "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
                        IsActive = true
                    },
                    new SoundTrack
                    {
                        Id = 2,
                        Title = "Lo-Fi Focus Beats",
                        Category = "Lo-Fi",
                        AudioUrl = "https://ia801502.us.archive.org/23/items/RainSoundEffect/Rain_sound.mp3]",
                        IsActive = true
                    },
                    new SoundTrack
                    {
                        Id = 3,
                        Title = "Pink Noise (ADHD Focus)",
                        Category = "Binaural",
                        AudioUrl = "https://www.12hourwhitenoise.com/pink-noise-sleep-sound-12-hours/",
                        IsActive = true
                    });
        }


    }
}
