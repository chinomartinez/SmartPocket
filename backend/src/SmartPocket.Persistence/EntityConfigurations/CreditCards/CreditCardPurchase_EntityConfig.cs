using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardPurchase_EntityConfig : IEntityTypeConfiguration<CreditCardPurchase>
    {
        public void Configure(EntityTypeBuilder<CreditCardPurchase> builder)
        {
            builder.Property(e => e.Description)
                .HasMaxLength(500)
                .IsRequired();

            // Solo para saber que se mapea
            builder.Property(x => x.CancelledAt);
            builder.Property(x => x.EffectiveDate);
            builder.Property(x => x.PaidOffAt);

            builder.Property(x => x.OriginalAmount).HasPrecision(18, 2);

            builder.ComplexProperty(x => x.PurchaseAmount, complexBuilder =>
            {
                complexBuilder.Property(x => x.Amount).HasPrecision(18, 2);
                complexBuilder.Property(x => x.CurrencyCode).HasMaxLength(300).IsRequired();
            });

            builder.Property(x => x.PurchaseType)
                .HasConversion<string>()
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(x => x.Status)
                .HasConversion<string>()
                .HasMaxLength(100)
                .IsRequired();

            builder.HasOne(e => e.CreditCard)
                .WithMany(c => c.Purchases)
                .HasForeignKey(e => e.CreditCardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);


        }
    }
}
