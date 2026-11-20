namespace FoucsPulse.DTOs
{
    public class VoiceInteractionDto
    {
        public string SpokenText { get; set; } = string.Empty; // النص الناتج من تحويل صوت المستخدم
        public string CurrentState { get; set; } = "focusing";
    }
}
