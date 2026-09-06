using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CreateCreditCardTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CreditCard",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CurrencyCode = table.Column<string>(type: "TEXT", maxLength: 3, nullable: false),
                    CreditLimit = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    Icon_Code = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Icon_ColorHex = table.Column<string>(type: "TEXT", maxLength: 7, nullable: false),
                    PaymentDueRange_EndDay = table.Column<int>(type: "INTEGER", nullable: false),
                    PaymentDueRange_StartDay = table.Column<int>(type: "INTEGER", nullable: false),
                    StatementClosingRange_EndDay = table.Column<int>(type: "INTEGER", nullable: false),
                    StatementClosingRange_StartDay = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCard", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardPurchase",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardId = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    CurrencyCode = table.Column<string>(type: "TEXT", maxLength: 3, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    PaidOffAt = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    FinishedAt = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardPurchase", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchase_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchase_CreditCard_CreditCardId",
                        column: x => x.CreditCardId,
                        principalTable: "CreditCard",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardStatement",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardId = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ClosingDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    DueDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardStatement", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardStatement_CreditCard_CreditCardId",
                        column: x => x.CreditCardId,
                        principalTable: "CreditCard",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardSubscription",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardId = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    CurrencyCode = table.Column<string>(type: "TEXT", maxLength: 3, nullable: false),
                    InitialAmount = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    CancelledAt = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    IsCancelled = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardSubscription", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscription_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscription_CreditCard_CreditCardId",
                        column: x => x.CreditCardId,
                        principalTable: "CreditCard",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardPurchaseInstallment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardPurchaseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Number = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    CreditCardStatementId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardPurchaseInstallment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchaseInstallment_CreditCardPurchase_CreditCardPurchaseId",
                        column: x => x.CreditCardPurchaseId,
                        principalTable: "CreditCardPurchase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchaseInstallment_CreditCardStatement_CreditCardStatementId",
                        column: x => x.CreditCardStatementId,
                        principalTable: "CreditCardStatement",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardStatementPayment",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardStatementId = table.Column<int>(type: "INTEGER", nullable: false),
                    TransactionId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardStatementPayment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardStatementPayment_CreditCardStatement_CreditCardStatementId",
                        column: x => x.CreditCardStatementId,
                        principalTable: "CreditCardStatement",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardStatementPayment_Transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardSubscriptionCharge",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardSubscriptionId = table.Column<int>(type: "INTEGER", nullable: false),
                    CreditCardStatementId = table.Column<int>(type: "INTEGER", nullable: false),
                    ChargeNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    Amount = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardSubscriptionCharge", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscriptionCharge_CreditCardStatement_CreditCardStatementId",
                        column: x => x.CreditCardStatementId,
                        principalTable: "CreditCardStatement",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscriptionCharge_CreditCardSubscription_CreditCardSubscriptionId",
                        column: x => x.CreditCardSubscriptionId,
                        principalTable: "CreditCardSubscription",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchase_CategoryId",
                table: "CreditCardPurchase",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchase_CreditCardId",
                table: "CreditCardPurchase",
                column: "CreditCardId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchaseInstallment_CreditCardPurchaseId_Number",
                table: "CreditCardPurchaseInstallment",
                columns: new[] { "CreditCardPurchaseId", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchaseInstallment_CreditCardStatementId",
                table: "CreditCardPurchaseInstallment",
                column: "CreditCardStatementId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatement_CreditCardId",
                table: "CreditCardStatement",
                column: "CreditCardId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayment_CreditCardStatementId",
                table: "CreditCardStatementPayment",
                column: "CreditCardStatementId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayment_TransactionId",
                table: "CreditCardStatementPayment",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscription_CategoryId",
                table: "CreditCardSubscription",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscription_CreditCardId",
                table: "CreditCardSubscription",
                column: "CreditCardId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscriptionCharge_CreditCardStatementId",
                table: "CreditCardSubscriptionCharge",
                column: "CreditCardStatementId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscriptionCharge_CreditCardSubscriptionId_ChargeNumber",
                table: "CreditCardSubscriptionCharge",
                columns: new[] { "CreditCardSubscriptionId", "ChargeNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CreditCardPurchaseInstallment");

            migrationBuilder.DropTable(
                name: "CreditCardStatementPayment");

            migrationBuilder.DropTable(
                name: "CreditCardSubscriptionCharge");

            migrationBuilder.DropTable(
                name: "CreditCardPurchase");

            migrationBuilder.DropTable(
                name: "CreditCardStatement");

            migrationBuilder.DropTable(
                name: "CreditCardSubscription");

            migrationBuilder.DropTable(
                name: "CreditCard");
        }
    }
}
