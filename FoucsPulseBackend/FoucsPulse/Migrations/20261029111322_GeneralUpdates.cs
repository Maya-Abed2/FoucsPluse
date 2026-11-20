using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FoucsPulse.Migrations
{
    /// <inheritdoc />
    public partial class GeneralUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RequiredEnergy",
                table: "microTasks",
                newName: "EstimatedMinutes");

            migrationBuilder.AddColumn<int>(
                name: "ActualDurationMinutes",
                table: "tasks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedDurationMinutes",
                table: "tasks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PartnerName",
                table: "tasks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PartnerPhone",
                table: "tasks",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "microTasks",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualDurationMinutes",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "EstimatedDurationMinutes",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "PartnerName",
                table: "tasks");

            migrationBuilder.DropColumn(
                name: "PartnerPhone",
                table: "tasks");

            migrationBuilder.RenameColumn(
                name: "EstimatedMinutes",
                table: "microTasks",
                newName: "RequiredEnergy");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "microTasks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
