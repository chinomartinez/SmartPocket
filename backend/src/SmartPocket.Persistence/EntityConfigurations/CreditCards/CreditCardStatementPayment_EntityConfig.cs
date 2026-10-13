using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardStatementPayment_EntityConfig : IEntityTypeConfiguration<CreditCardStatementPayment>
    {
        public void Configure(EntityTypeBuilder<CreditCardStatementPayment> builder)
        {
            builder.ConfigureCurrency(x => x.CoveredCurrencyCode);

            builder.HasIndex(x => x.TransactionId)
                .IsUnique();

            builder.HasIndex(x => new { x.CreditCardStatementId, x.CoveredCurrencyCode })
                .IsUnique();

            builder.HasOne(p => p.CreditCardStatement)
                .WithMany(s => s.Payments)
                .HasForeignKey(p => p.CreditCardStatementId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(p => p.Transaction)
                .WithMany()
                .HasForeignKey(p => p.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(x => !x.CreditCardStatement.IsDeleted && !x.Transaction.IsDeleted);
        }
    }
}
