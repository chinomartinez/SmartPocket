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

            builder.OwnsOne(x => x.AccountMoney, moneyBuilder =>
            {
                moneyBuilder.Property(m => m.Amount)
                    .HasColumnName("AccountMoney_Amount");

                moneyBuilder.Property(m => m.CurrencyCode)
                    .CurrencyCodeMap()
                    .HasColumnName("AccountMoney_CurrencyCode");
            });

            string sql = "CASE WHEN IsIncome = 1 THEN AccountMoney_Amount ELSE -AccountMoney_Amount END";

            builder.Property(x => x.SignedAmount)
                .HasComputedColumnSql(sql, stored: true)
                .ValueGeneratedOnAddOrUpdate();
        }
    }
}
