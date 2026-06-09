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

            // Los coloco solamente para saber que estas props tambien se configuran en la tabla
            builder.Property(x => x.CreditLimit);
            builder.Property(x => x.StatementClosingDay);
            builder.Property(x => x.PaymentDueDay);

            builder.HasMany(x => x.Purchases)
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
