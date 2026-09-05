using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardSubscription_EntityConfig : IEntityTypeConfiguration<CreditCardSubscription>
    {
        public void Configure(EntityTypeBuilder<CreditCardSubscription> builder)
        {
            builder.Property(x => x.Description)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(x => x.InitialAmount)
                .HasPrecision(18, 2);

            builder.ConfigureCurrency(x => x.CurrencyCode);

            builder.HasOne(x => x.CreditCard)
                .WithMany(x => x.Subscriptions)
                .HasForeignKey(x => x.CreditCardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.Charges)
                .WithOne(x => x.CreditCardSubscription)
                .HasForeignKey(x => x.CreditCardSubscriptionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
