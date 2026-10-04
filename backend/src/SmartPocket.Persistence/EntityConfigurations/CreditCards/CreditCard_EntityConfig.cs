using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCard_EntityConfig : IEntityTypeConfiguration<CreditCard>
    {
        public void Configure(EntityTypeBuilder<CreditCard> builder)
        {
            builder.Property(x => x.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.ConfigureIcon(x => x.Icon);
            builder.ConfigureCurrency(x => x.CurrencyCode);

            builder.Property(x => x.CreditLimit).IsNumeric().IsRequired();

            builder.ComplexProperty(x => x.StatementClosingRange, rangeBuilder =>
            {
                rangeBuilder.Property(x => x.StartDay).IsRequired();
                rangeBuilder.Property(x => x.EndDay).IsRequired();
            });

            builder.ComplexProperty(x => x.PaymentDueRange, rangeBuilder =>
            {
                rangeBuilder.Property(x => x.StartDay).IsRequired();
                rangeBuilder.Property(x => x.EndDay).IsRequired();
            });

            builder.HasMany(x => x.Purchases)
                .WithOne(x => x.CreditCard)
                .HasForeignKey(x => x.CreditCardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Subscriptions)
                .WithOne(x => x.CreditCard)
                .HasForeignKey(x => x.CreditCardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Statements)
                .WithOne(x => x.CreditCard)
                .HasForeignKey(x => x.CreditCardId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
