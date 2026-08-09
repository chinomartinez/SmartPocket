using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardInstallment_EntityConfig : IEntityTypeConfiguration<CreditCardPurchaseInstallment>
    {
        public void Configure(EntityTypeBuilder<CreditCardPurchaseInstallment> builder)
        {
            builder.HasOne(i => i.CreditCardPurchase)
                .WithMany(p => p.Installments)
                .HasForeignKey(i => i.CreditCardPurchaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.CreditCardStatement)
                .WithMany(s => s.Installments)
                .HasForeignKey(i => i.CreditCardStatementId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasIndex(i => new { i.CreditCardPurchaseId, i.Number })
                .IsUnique();

            // Configuraciones por defecto
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Number);

            builder.HasQueryFilter(x => !x.CreditCardPurchase.IsDeleted);
        }
    }
}
