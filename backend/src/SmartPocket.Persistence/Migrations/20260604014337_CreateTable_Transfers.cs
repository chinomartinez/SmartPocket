using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CreateTable_Transfers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TransferId",
                table: "Transactions",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Transfer",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OriginTransactionId = table.Column<int>(type: "INTEGER", nullable: false),
                    DestinationTransactionId = table.Column<int>(type: "INTEGER", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "datetime('now', 'utc')"),
                    LastModifiedAt = table.Column<DateTime>(type: "TEXT", nullable: true, defaultValueSql: "datetime('now', 'utc')"),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transfer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transfer_Transactions_DestinationTransactionId",
                        column: x => x.DestinationTransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transfer_Transactions_OriginTransactionId",
                        column: x => x.OriginTransactionId,
                        principalTable: "Transactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TransferId",
                table: "Transactions",
                column: "TransferId");

            migrationBuilder.CreateIndex(
                name: "IX_Transfer_DestinationTransactionId",
                table: "Transfer",
                column: "DestinationTransactionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transfer_OriginTransactionId",
                table: "Transfer",
                column: "OriginTransactionId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Transfer_TransferId",
                table: "Transactions",
                column: "TransferId",
                principalTable: "Transfer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Transfer_TransferId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "Transfer");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_TransferId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "TransferId",
                table: "Transactions");
        }
    }
}
