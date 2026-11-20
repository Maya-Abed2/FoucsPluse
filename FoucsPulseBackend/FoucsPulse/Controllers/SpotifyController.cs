using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;
using FoucsPulse.DTOs;

namespace FoucsPulse.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpotifyController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public SpotifyController(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        // 1. توجيه المستخدم لصفحة تسجيل الدخول في Spotify
        [HttpGet("login")]
        public IActionResult SpotifyLogin()
        {
            var clientId = _configuration["SpotifySettings:ClientId"];
            var redirectUri = _configuration["SpotifySettings:RedirectUri"];

            Console.WriteLine("====== ACTUAL REDIRECT URI FROM CONFIG: " + redirectUri + " ======");

            var scope = "user-read-private user-read-email playlist-read-private playlist-read-collaborative";

            var spotifyAuthUrl = $"https://accounts.spotify.com/authorize?" +
                                 $"client_id={clientId}" +
                                 $"&response_type=code" +
                                 $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                                 $"&scope={Uri.EscapeDataString(scope)}" +
                                 $"&show_dialog=true";
            Console.WriteLine("====== FULL SPOTIFY AUTH URL: " + spotifyAuthUrl + " ======");

            return Ok(new { url = spotifyAuthUrl });
        }

        // 2. استقبال الكود من سبوتيفاي واستبداله بـ Access Token
        [HttpGet("callback")]
        public async Task<IActionResult> SpotifyCallback([FromQuery] string code)
        {
            var clientId = _configuration["SpotifySettings:ClientId"];
            var clientSecret = _configuration["SpotifySettings:ClientSecret"];
            var redirectUri = _configuration["SpotifySettings:RedirectUri"];

            var tokenRequestData = new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", code },
                { "redirect_uri", redirectUri! }
            };

            var requestContent = new FormUrlEncodedContent(tokenRequestData);
            var authHeader = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

            // استخدام HttpRequestMessage محلي لتجنب تداخل الـ Headers المشتركة
            using var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token");
            tokenRequest.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeader);
            tokenRequest.Content = requestContent;

            var response = await _httpClient.SendAsync(tokenRequest);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new { message = "فشل المصادقة مع Spotify." });
            }

            var jsonString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonString);
            var accessToken = doc.RootElement.GetProperty("access_token").GetString();

            // إعادة توجيه المستخدم للفرونت إند مع الـ Token
            return Redirect($"http://localhost:3000?spotifyToken={accessToken}");
        }

        // مسار لجلب قوائم التشغيل الافتراضية (Default Playlists للتركيز)
        [HttpGet("default-playlists")]
        public IActionResult GetDefaultPlaylists()
        {
            var defaultPlaylists = new List<SpotifyPlaylistDtos>
            {
                
                new SpotifyPlaylistDtos { Id = "37i9dQZF1DX8Uebhn9wzrS", Name = "Peaceful Piano", ExternalUrl = "https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS" },
                new SpotifyPlaylistDtos { Id = "37i9dQZF1DWZeKCadgRdKQ", Name = "Deep Focus", ExternalUrl = "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ" }
            };

            return Ok(defaultPlaylists);
        }

        // مسار لجلب قوائم المستخدم الخاصة (يتطلب Token الخاص بـ Spotify للمستخدم)
        [HttpGet("user-playlists")]
        public async Task<IActionResult> GetUserPlaylists([FromHeader(Name = "Spotify-Token")] string spotifyToken)
        {
            if (string.IsNullOrWhiteSpace(spotifyToken))
            {
                return BadRequest(new { message = "مطلوب ربط حساب Spotify أولاً." });
            }

            // إنشاء طلب محلي منفصل لضمان إرسال Bearer Token الصحيح وعدم تداخل الـ Headers
            using var apiRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.spotify.com/v1/me/playlists");
            apiRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", spotifyToken);

            var response = await _httpClient.SendAsync(apiRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorDetails = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"====== SPOTIFY API ERROR: {response.StatusCode} - {errorDetails} ======");
                return Unauthorized(new { message = "فشل جلب قوائم التشغيل من Spotify. يرجى إعادة تسجيل الدخول.", details = errorDetails });
            }

            var jsonString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonString);
            var items = doc.RootElement.GetProperty("items");

            var playlists = new List<SpotifyPlaylistDtos>();
            foreach (var item in items.EnumerateArray())
            {
                var images = item.GetProperty("images");
                string imageUrl = images.GetArrayLength() > 0 ? images[0].GetProperty("url").GetString() ?? "" : "";

                playlists.Add(new SpotifyPlaylistDtos
                {
                    Id = item.GetProperty("id").GetString() ?? "",
                    Name = item.GetProperty("name").GetString() ?? "",
                    ImageUrl = imageUrl,
                    ExternalUrl = item.GetProperty("external_urls").GetProperty("spotify").GetString() ?? ""
                });
            }

            return Ok(playlists);
        }
    }
}