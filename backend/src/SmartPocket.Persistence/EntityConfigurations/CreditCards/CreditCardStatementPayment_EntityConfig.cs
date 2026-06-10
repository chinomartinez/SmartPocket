using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardStatementPayment_EntityConfig : IEntityTypeConfiguration<CreditCardStatementPayment>
    {
        public void Configure(EntityTypeBuilder<CreditCardStatementPayment> builder)
        {
            builder.HasOne(p => p.CreditCardStatement)
                .WithMany(s => s.Payments)
                .HasForeignKey(p => p.CreditCardStatementId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(p => p.Transaction)
                .WithMany()
                .HasForeignKey(p => p.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(x => !x.CreditCardStatement.IsDeleted && !x.Transaction.IsDeleted);
        }
    }
}
