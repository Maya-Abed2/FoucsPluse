using FoucsPulse.Data;
using FoucsPulse.Models;
using Microsoft.EntityFrameworkCore;
namespace FoucsPulse.Services.Interfaces
{
    public interface ITaskService
    {
        Task<Tasks> CreateTaskWithMircoTasksAsync(int userId, string title, string description, int requiredEnergy);
        Task<MicroTasks?> GetPanicMicroTaskAsync(int userId);
    }
}
