using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardInstallment_EntityConfig : IEntityTypeConfiguration<CreditCardInstallment>
    {
        public void Configure(EntityTypeBuilder<CreditCardInstallment> builder)
        {
            builder.HasOne(i => i.CreditCardPurchase)
                .WithMany(p => p.Installments)
                .HasForeignKey(i => i.CreditCardPurchaseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.CreditCardStatement)
                .WithMany(s => s.Installments)
                .HasForeignKey(i => i.CreditCardStatementId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configuraciones por defecto
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.InstallmentNumber);
            builder.Property(x => x.PeriodYear);
            builder.Property(x => x.PeriodMonth);

            builder.HasQueryFilter(x => !x.CreditCardPurchase.IsDeleted);
        }
    }
}
