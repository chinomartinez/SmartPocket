using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPocket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase2_DateOnlyBusinessDates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // EF Core guarda DateOnly y DateTime como TEXT en SQLite, por lo que el
            // esquema no cambia. La limpieza debe ejecutarse antes de que la app lea
            // estas columnas con el modelo nuevo: un valor con hora no se puede
            // deserializar como DateOnly.
            migrationBuilder.Sql(
                "UPDATE CreditCardStatement SET ClosingDate = substr(ClosingDate, 1, 10), DueDate = substr(DueDate, 1, 10);");
            migrationBuilder.Sql(
                "UPDATE Transactions SET EffectiveDate = substr(EffectiveDate, 1, 10);");
            migrationBuilder.Sql(
                "UPDATE Transfers SET EffectiveDate = substr(EffectiveDate, 1, 10);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // La hora original no se puede reconstruir.
        }
    }
}
