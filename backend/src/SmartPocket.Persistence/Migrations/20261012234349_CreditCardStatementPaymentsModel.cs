using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CreditCardStatementPaymentsModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CreditCardStatementPayment_CreditCardStatementId",
                table: "CreditCardStatementPayment");

            migrationBuilder.DropIndex(
                name: "IX_CreditCardStatementPayment_TransactionId",
                table: "CreditCardStatementPayment");

            migrationBuilder.AddColumn<string>(
                name: "CoveredCurrencyCode",
                table: "CreditCardStatementPayment",
                type: "TEXT",
                maxLength: 3,
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "TransactionSources",
                columns: new[] { "Id", "Name" },
                values: new object[] { 4, "CreditCardStatementPayment" });

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayment_CreditCardStatementId_CoveredCurrencyCode",
                table: "CreditCardStatementPayment",
                columns: new[] { "CreditCardStatementId", "CoveredCurrencyCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayment_TransactionId",
                table: "CreditCardStatementPayment",
                column: "TransactionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CreditCardStatementPayment_CreditCardStatementId_CoveredCurrencyCode",
                table: "CreditCardStatementPayment");

            migrationBuilder.DropIndex(
                name: "IX_CreditCardStatementPayment_TransactionId",
                table: "CreditCardStatementPayment");

            migrationBuilder.DeleteData(
                table: "TransactionSources",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DropColumn(
                name: "CoveredCurrencyCode",
                table: "CreditCardStatementPayment");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayment_CreditCardStatementId",
                table: "CreditCardStatementPayment",
                column: "CreditCardStatementId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayment_TransactionId",
                table: "CreditCardStatementPayment",
                column: "TransactionId");
        }
    }
}
