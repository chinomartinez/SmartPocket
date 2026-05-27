using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlterAccounts_IsPrincipal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPrincipal",
                table: "Accounts",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            var updateSql = @"
                UPDATE Accounts
                SET IsPrincipal = 1
                WHERE Id IN (
                    SELECT Id
                    FROM Accounts
                    WHERE IsDeleted = 0
                    ORDER BY CreatedAt DESC
                    LIMIT 1
                );";
            migrationBuilder.Sql(updateSql);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPrincipal",
                table: "Accounts");
        }
    }
}
