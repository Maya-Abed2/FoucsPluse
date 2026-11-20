using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FoucsPulse.Data;
using FoucsPulse.DTOs;
using FoucsPulse.Models;

namespace FoucsPulse.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "البريد الإلكتروني وكلمة السر مطلوبان." });
            }

            // التحقق مما إذا كان البريد موجوداً مسبقاً
            if (await _context.users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "هذا البريد الإلكتروني مسجل بالفعل." });
            }

            var user = new Users
            {
                UserName = string.IsNullOrWhiteSpace(dto.Username) ? dto.Email.Split('@')[0] : dto.Username,
                Email = dto.Email,
                Password = HashPassword(dto.Password), // تخزين كلمة المرور مشفرة
                Level = 1,
                TotalXP = 0
            };

            await _context.users.AddAsync(user);
            await _context.SaveChangesAsync();

            string token = GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Id = user.Id,
                Token = token,
                Username = user.UserName,
                Email = user.Email,
                Level = user.Level,
                XP = user.TotalXP
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new { message = "يرجى إدخال البريد الإلكتروني وكلمة السر." });
            }

            string hashedPassword = HashPassword(dto.Password);
            var user = await _context.users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Password == hashedPassword);

            if (user == null)
            {
                return Unauthorized(new { message = "البريد الإلكتروني أو كلمة السر غير صحيحة." });
            }

            string token = GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Id = user.Id, // 👈 إضافة الـ Id هنا لكي يلتقطه الفرونت إند ويخزنه في الـ localStorage بشكل صحيح
                Token = token,
                Username = user.UserName,
                Email = user.Email,
                Level = user.Level,
                XP = user.TotalXP
            });
        }
        private string GenerateJwtToken(Users user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email)
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddDays(double.Parse(jwtSettings["ExpiryInDays"] ?? "7"));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }
}