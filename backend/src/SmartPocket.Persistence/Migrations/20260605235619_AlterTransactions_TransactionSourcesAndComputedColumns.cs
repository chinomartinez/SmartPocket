using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlterTransactions_TransactionSourcesAndComputedColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Transfer_TransferId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfer_Transactions_DestinationTransactionId",
                table: "Transfer");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfer_Transactions_OriginTransactionId",
                table: "Transfer");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_TransferId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transfer",
                table: "Transfer");

            migrationBuilder.DropColumn(
                name: "TransferId",
                table: "Transactions");

            migrationBuilder.RenameTable(
                name: "Transfer",
                newName: "Transfers");

            migrationBuilder.RenameIndex(
                name: "IX_Transfer_OriginTransactionId",
                table: "Transfers",
                newName: "IX_Transfers_OriginTransactionId");

            migrationBuilder.RenameIndex(
                name: "IX_Transfer_DestinationTransactionId",
                table: "Transfers",
                newName: "IX_Transfers_DestinationTransactionId");

            migrationBuilder.AddColumn<int>(
                name: "TransactionSourceId",
                table: "Transactions",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<bool>(
                name: "IsSystemAdjustment",
                table: "Transactions",
                type: "INTEGER",
                nullable: false,
                computedColumnSql: "CASE WHEN TransactionSourceId = 3 THEN 1 ELSE 0 END",
                stored: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<bool>(
                name: "IsManualEntry",
                table: "Transactions",
                type: "INTEGER",
                nullable: false,
                computedColumnSql: "CASE WHEN TransactionSourceId = 1 THEN 1 ELSE 0 END",
                stored: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTransfer",
                table: "Transactions",
                type: "INTEGER",
                nullable: false,
                computedColumnSql: "CASE WHEN TransactionSourceId = 2 THEN 1 ELSE 0 END",
                stored: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transfers",
                table: "Transfers",
                column: "Id");

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

            migrationBuilder.InsertData(
                table: "TransactionSources",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "ManualEntry" },
                    { 2, "Transfer" },
                    { 3, "SystemAdjustment" }
                });

            migrationBuilder.Sql(@"
                UPDATE Transactions
                SET TransactionSourceId = 3
                WHERE CategoryId IS NULL
                  AND (Description LIKE '%Initial balance%' OR Description LIKE '%Balance adjustment%');
                
                UPDATE Transactions
                SET TransactionSourceId = 2
                WHERE Id IN (
                    SELECT OriginTransactionId FROM Transfers WHERE OriginTransactionId IS NOT NULL
                    UNION
                    SELECT DestinationTransactionId FROM Transfers WHERE DestinationTransactionId IS NOT NULL
                );
                
                UPDATE Transactions
                SET TransactionSourceId = 1
                WHERE TransactionSourceId = 0;");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TransactionSourceId",
                table: "Transactions",
                column: "TransactionSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionSources_Name",
                table: "TransactionSources",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_TransactionSources_TransactionSourceId",
                table: "Transactions",
                column: "TransactionSourceId",
                principalTable: "TransactionSources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transfers_Transactions_DestinationTransactionId",
                table: "Transfers",
                column: "DestinationTransactionId",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transfers_Transactions_OriginTransactionId",
                table: "Transfers",
                column: "OriginTransactionId",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_TransactionSources_TransactionSourceId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfers_Transactions_DestinationTransactionId",
                table: "Transfers");

            migrationBuilder.DropForeignKey(
                name: "FK_Transfers_Transactions_OriginTransactionId",
                table: "Transfers");

            migrationBuilder.DropTable(
                name: "TransactionSources");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_TransactionSourceId",
                table: "Transactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Transfers",
                table: "Transfers");

            migrationBuilder.DropColumn(
                name: "IsManualEntry",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "IsTransfer",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "TransactionSourceId",
                table: "Transactions");

            migrationBuilder.RenameTable(
                name: "Transfers",
                newName: "Transfer");

            migrationBuilder.RenameIndex(
                name: "IX_Transfers_OriginTransactionId",
                table: "Transfer",
                newName: "IX_Transfer_OriginTransactionId");

            migrationBuilder.RenameIndex(
                name: "IX_Transfers_DestinationTransactionId",
                table: "Transfer",
                newName: "IX_Transfer_DestinationTransactionId");

            migrationBuilder.AlterColumn<bool>(
                name: "IsSystemAdjustment",
                table: "Transactions",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER",
                oldComputedColumnSql: "CASE WHEN TransactionSourceId = 3 THEN 1 ELSE 0 END");

            migrationBuilder.AddColumn<int>(
                name: "TransferId",
                table: "Transactions",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Transfer",
                table: "Transfer",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TransferId",
                table: "Transactions",
                column: "TransferId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Transfer_TransferId",
                table: "Transactions",
                column: "TransferId",
                principalTable: "Transfer",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transfer_Transactions_DestinationTransactionId",
                table: "Transfer",
                column: "DestinationTransactionId",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transfer_Transactions_OriginTransactionId",
                table: "Transfer",
                column: "OriginTransactionId",
                principalTable: "Transactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
