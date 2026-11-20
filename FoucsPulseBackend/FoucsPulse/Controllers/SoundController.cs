using FoucsPulse.Data;
using FoucsPulse.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoucsPulse.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SoundController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SoundController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet("traks")]
        public async Task<IActionResult> GetASoundTraks()
        {
            var traks = await _context.SoundTraks.Where(s=>s.IsActive).ToListAsync();
            return Ok(traks);
        }
        [HttpPost("add")]
        public async Task<IActionResult> AddSoundTrack([FromBody] SoundTrack track)
        {
            _context.SoundTraks.Add(track);
            await _context.SaveChangesAsync();
            return Ok(new { message = "تم إضافة الصوت بنجاح! 🎵", track });
        }
    }
}
