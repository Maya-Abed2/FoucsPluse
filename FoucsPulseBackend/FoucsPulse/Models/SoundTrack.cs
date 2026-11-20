namespace FoucsPulse.Models
{
    public class SoundTrack
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;       // اسم الصوت (مثلاً: Lo-Fi Beats)
        public string Category { get; set; } = string.Empty;    // التصنيف (Rain, Lo-Fi, Pink Noise)
        public string AudioUrl { get; set; } = string.Empty;    // رابط الملف الصوتي أو الـ Stream
        public bool IsActive { get; set; } = true;
    }
}
