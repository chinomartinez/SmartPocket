using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.CreditCards;

namespace SmartPocket.Persistence.EntityConfigurations.CreditCards
{
    internal class CreditCardStatement_EntityConfig : IEntityTypeConfiguration<CreditCardStatement>
    {
        public void Configure(EntityTypeBuilder<CreditCardStatement> builder)
        {
            // Configuraciones por defecto
            builder.Property(x => x.ClosingDate);
            builder.Property(x => x.DueDate);
            builder.Property(x => x.PeriodYear);
            builder.Property(x => x.PeriodMonth);

            builder.HasOne(s => s.CreditCard)
                .WithMany(c => c.Statements)
                .HasForeignKey(s => s.CreditCardId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.Installments)
                .WithOne(i => i.CreditCardStatement)
                .HasForeignKey(i => i.CreditCardStatementId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasMany(s => s.Payments)
                .WithOne(p => p.CreditCardStatement)
                .HasForeignKey(p => p.CreditCardStatementId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(s => s.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

        }
    }
}
