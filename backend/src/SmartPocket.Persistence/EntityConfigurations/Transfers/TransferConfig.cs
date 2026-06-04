using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.Transfers;

namespace SmartPocket.Persistence.EntityConfigurations.Transfers
{
    internal class TransferConfig : IEntityTypeConfiguration<Transfer>
    {
        public void Configure(EntityTypeBuilder<Transfer> builder)
        {
            builder.HasOne(x => x.OriginTransaction)
                .WithOne()
                .HasForeignKey<Transfer>(x => x.OriginTransactionId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.DestinationTransaction)
                .WithOne()
                .HasForeignKey<Transfer>(x => x.DestinationTransactionId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.EffectiveDate)
                .IsRequired();

            builder.Property(x => x.Description)
                .HasMaxLength(1000);
        }
    }
}
