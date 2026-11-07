using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    CurrencyCode = table.Column<string>(type: "TEXT", maxLength: 3, nullable: false),
                    InitialBalance = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    IncludeInBalanceGlobal = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsPrincipal = table.Column<bool>(type: "INTEGER", nullable: false),
                    Icon_Code = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Icon_ColorHex = table.Column<string>(type: "TEXT", maxLength: 7, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    IsIncome = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsDefault = table.Column<bool>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false, defaultValue: 0),
                    Icon_Code = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Icon_ColorHex = table.Column<string>(type: "TEXT", maxLength: 7, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditCards",
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
                    table.PrimaryKey("PK_CreditCards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransactionSources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransactionSources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Email = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    Surname = table.Column<string>(type: "TEXT", maxLength: 256, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardPurchases",
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
                    table.PrimaryKey("PK_CreditCardPurchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchases_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchases_CreditCards_CreditCardId",
                        column: x => x.CreditCardId,
                        principalTable: "CreditCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardStatements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardId = table.Column<int>(type: "INTEGER", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ClosingDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardStatements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardStatements_CreditCards_CreditCardId",
                        column: x => x.CreditCardId,
                        principalTable: "CreditCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardSubscriptions",
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
                    table.PrimaryKey("PK_CreditCardSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscriptions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscriptions_CreditCards_CreditCardId",
                        column: x => x.CreditCardId,
                        principalTable: "CreditCards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AccountId = table.Column<int>(type: "INTEGER", nullable: false),
                    CategoryId = table.Column<int>(type: "INTEGER", nullable: true),
                    Amount = table.Column<decimal>(type: "TEXT", precision: 18, scale: 2, nullable: false),
                    SignedAmount = table.Column<decimal>(type: "TEXT", nullable: false, computedColumnSql: "CASE WHEN IsIncome = 1 THEN Amount ELSE -Amount END", stored: true),
                    EffectiveDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 300, nullable: true),
                    IsIncome = table.Column<bool>(type: "INTEGER", nullable: false),
                    TransactionSourceId = table.Column<int>(type: "INTEGER", nullable: false),
                    IsSystemAdjustment = table.Column<bool>(type: "INTEGER", nullable: false, computedColumnSql: "CASE WHEN TransactionSourceId = 3 THEN 1 ELSE 0 END", stored: false),
                    IsTransfer = table.Column<bool>(type: "INTEGER", nullable: false, computedColumnSql: "CASE WHEN TransactionSourceId = 2 THEN 1 ELSE 0 END", stored: false),
                    IsManualEntry = table.Column<bool>(type: "INTEGER", nullable: false, computedColumnSql: "CASE WHEN TransactionSourceId = 1 THEN 1 ELSE 0 END", stored: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Transactions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Transactions_TransactionSources_TransactionSourceId",
                        column: x => x.TransactionSourceId,
                        principalTable: "TransactionSources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardPurchaseInstallments",
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
                    table.PrimaryKey("PK_CreditCardPurchaseInstallments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchaseInstallments_CreditCardPurchases_CreditCardPurchaseId",
                        column: x => x.CreditCardPurchaseId,
                        principalTable: "CreditCardPurchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CreditCardPurchaseInstallments_CreditCardStatements_CreditCardStatementId",
                        column: x => x.CreditCardStatementId,
                        principalTable: "CreditCardStatements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardSubscriptionCharges",
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
                    table.PrimaryKey("PK_CreditCardSubscriptionCharges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscriptionCharges_CreditCardStatements_CreditCardStatementId",
                        column: x => x.CreditCardStatementId,
                        principalTable: "CreditCardStatements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardSubscriptionCharges_CreditCardSubscriptions_CreditCardSubscriptionId",
                        column: x => x.CreditCardSubscriptionId,
                        principalTable: "CreditCardSubscriptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditCardStatementPayments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CreditCardStatementId = table.Column<int>(type: "INTEGER", nullable: false),
                    TransactionId = table.Column<int>(type: "INTEGER", nullable: false),
                    CoveredCurrencyCode = table.Column<string>(type: "TEXT", maxLength: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditCardStatementPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditCardStatementPayments_CreditCardStatements_CreditCardStatementId",
                        column: x => x.CreditCardStatementId,
                        principalTable: "CreditCardStatements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CreditCardStatementPayments_Transactions_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Transfers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OriginTransactionId = table.Column<int>(type: "INTEGER", nullable: false),
                    DestinationTransactionId = table.Column<int>(type: "INTEGER", nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transfers_Transactions_DestinationTransactionId",
                        column: x => x.DestinationTransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transfers_Transactions_OriginTransactionId",
                        column: x => x.OriginTransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "TransactionSources",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "ManualEntry" },
                    { 2, "Transfer" },
                    { 3, "SystemAdjustment" },
                    { 4, "CreditCardStatementPayment" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchaseInstallments_CreditCardPurchaseId_Number",
                table: "CreditCardPurchaseInstallments",
                columns: new[] { "CreditCardPurchaseId", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchaseInstallments_CreditCardStatementId",
                table: "CreditCardPurchaseInstallments",
                column: "CreditCardStatementId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchases_CategoryId",
                table: "CreditCardPurchases",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardPurchases_CreditCardId",
                table: "CreditCardPurchases",
                column: "CreditCardId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayments_CreditCardStatementId_CoveredCurrencyCode",
                table: "CreditCardStatementPayments",
                columns: new[] { "CreditCardStatementId", "CoveredCurrencyCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatementPayments_TransactionId",
                table: "CreditCardStatementPayments",
                column: "TransactionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardStatements_CreditCardId",
                table: "CreditCardStatements",
                column: "CreditCardId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscriptionCharges_CreditCardStatementId",
                table: "CreditCardSubscriptionCharges",
                column: "CreditCardStatementId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscriptionCharges_CreditCardSubscriptionId_ChargeNumber",
                table: "CreditCardSubscriptionCharges",
                columns: new[] { "CreditCardSubscriptionId", "ChargeNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscriptions_CategoryId",
                table: "CreditCardSubscriptions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditCardSubscriptions_CreditCardId",
                table: "CreditCardSubscriptions",
                column: "CreditCardId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_AccountId",
                table: "Transactions",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CategoryId",
                table: "Transactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TransactionSourceId",
                table: "Transactions",
                column: "TransactionSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionSources_Name",
                table: "TransactionSources",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_DestinationTransactionId",
                table: "Transfers",
                column: "DestinationTransactionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transfers_OriginTransactionId",
                table: "Transfers",
                column: "OriginTransactionId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CreditCardPurchaseInstallments");

            migrationBuilder.DropTable(
                name: "CreditCardStatementPayments");

            migrationBuilder.DropTable(
                name: "CreditCardSubscriptionCharges");

            migrationBuilder.DropTable(
                name: "Transfers");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "CreditCardPurchases");

            migrationBuilder.DropTable(
                name: "CreditCardStatements");

            migrationBuilder.DropTable(
                name: "CreditCardSubscriptions");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "CreditCards");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "TransactionSources");
        }
    }
}
