using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FoucsPulse.Migrations
{
    /// <inheritdoc />
    public partial class AddingSounds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "SoundTraks",
                columns: new[] { "Id", "AudioUrl", "Category", "IsActive", "Title" },
                values: new object[,]
                {
                    { 1, "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg", "Nature", true, "Rain Sounds" },
                    { 2, "https://ia801502.us.archive.org/23/items/RainSoundEffect/Rain_sound.mp3]", "Lo-Fi", true, "Lo-Fi Focus Beats" },
                    { 3, "https://www.12hourwhitenoise.com/pink-noise-sleep-sound-12-hours/", "Binaural", true, "Pink Noise (ADHD Focus)" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "SoundTraks",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "SoundTraks",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "SoundTraks",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
