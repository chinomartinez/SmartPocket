using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.Transactions;

namespace SmartPocket.Persistence.EntityConfigurations.Transactions
{
    public class TransactionConfig : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.Property(x => x.Description).HasMaxLength(300);

            builder
                .HasOne(x => x.Account)
                .WithMany(x => x.Transactions)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasOne(x => x.Category)
                .WithMany()
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasOne(x => x.Transfer)
                .WithMany()
                .HasForeignKey(x => x.TransferId)
                .OnDelete(DeleteBehavior.Restrict);

            // Para cuando quiera mapear NativeMoney como moneda diferente a la moneda de la cuenta
            // Ejemplo, la cuenta es en pesos y quiero guardar el monto en dolares.
            //builder.ComplexProperty(x => x.AccountMoney, moneyBulder =>
            //{
            //    moneyBulder.Property(m => m.CurrencyCode)
            //        .IsRequired()
            //        .HasMaxLength(3);
            //});

            var amountName = nameof(Transaction.Amount);
            string sql = $"CASE WHEN IsIncome = 1 THEN {amountName} ELSE -{amountName} END";

            builder.Property(x => x.SignedAmount)
                .HasComputedColumnSql(sql, stored: true)
                .ValueGeneratedOnAddOrUpdate();
        }
    }
}
