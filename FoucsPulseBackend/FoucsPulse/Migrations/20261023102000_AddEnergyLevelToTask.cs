using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoucsPulse.Migrations
{
    /// <inheritdoc />
    public partial class AddEnergyLevelToTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RequiredEnergy",
                table: "tasks",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequiredEnergy",
                table: "tasks");
        }
    }
}
