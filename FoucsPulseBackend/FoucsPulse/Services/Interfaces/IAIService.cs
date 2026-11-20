using FoucsPulse.Models;

namespace FoucsPulse.Services.Interfaces
{
    public interface IAIService
    {
        Task<List<MicroTasks>> GenerateMicroTasksWithAIAsync(string TaskTitle);

    }
}
