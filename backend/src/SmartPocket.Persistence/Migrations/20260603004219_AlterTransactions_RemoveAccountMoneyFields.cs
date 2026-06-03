using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlterTransactions_RemoveAccountMoneyFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountMoney_CurrencyCode",
                table: "Transactions");

            migrationBuilder.RenameColumn(
                name: "AccountMoney_Amount",
                table: "Transactions",
                newName: "Amount");

            migrationBuilder.AlterColumn<decimal>(
                name: "SignedAmount",
                table: "Transactions",
                type: "TEXT",
                nullable: false,
                computedColumnSql: "CASE WHEN IsIncome = 1 THEN Amount ELSE -Amount END",
                stored: true,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldComputedColumnSql: "CASE WHEN IsIncome = 1 THEN AccountMoney_Amount ELSE -AccountMoney_Amount END",
                oldStored: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "Transactions",
                newName: "AccountMoney_Amount");

            migrationBuilder.AddColumn<string>(
                name: "AccountMoney_CurrencyCode",
                table: "Transactions",
                type: "TEXT",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<decimal>(
                name: "SignedAmount",
                table: "Transactions",
                type: "TEXT",
                nullable: false,
                computedColumnSql: "CASE WHEN IsIncome = 1 THEN AccountMoney_Amount ELSE -AccountMoney_Amount END",
                stored: true,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldComputedColumnSql: "CASE WHEN IsIncome = 1 THEN Amount ELSE -Amount END",
                oldStored: true);
        }
    }
}
