using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardSubscriptionCharge_EntityConfig : IEntityTypeConfiguration<CreditCardSubscriptionCharge>
    {
        public void Configure(EntityTypeBuilder<CreditCardSubscriptionCharge> builder)
        {
            builder.Property(x => x.Amount)
                .HasPrecision(18, 2);

            builder.Property(x => x.ChargeNumber);

            builder.HasOne(x => x.CreditCardSubscription)
                .WithMany(x => x.Charges)
                .HasForeignKey(x => x.CreditCardSubscriptionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.CreditCardStatement)
                .WithMany(x => x.SubscriptionCharges)
                .HasForeignKey(x => x.CreditCardStatementId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.CreditCardSubscriptionId, x.ChargeNumber })
                .IsUnique();

            builder.HasQueryFilter(x => !x.CreditCardSubscription.IsDeleted && !x.CreditCardStatement.IsDeleted);
        }
    }
}
