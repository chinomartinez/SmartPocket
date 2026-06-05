using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.Transactions;

namespace SmartPocket.Persistence.EntityConfigurations.Transactions
{
    internal class TransactionSourceConfig : IEntityTypeConfiguration<TransactionSource>
    {
        public void Configure(EntityTypeBuilder<TransactionSource> builder)
        {
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.Id).HasConversion<int>();

            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            builder.HasIndex(x => x.Name).IsUnique();

            var data = Enum
                .GetValues<TransactionSourceType>()
                .Order()
                .Where(x => x != TransactionSourceType.None)
                .Select(x => new TransactionSource(x, x.ToString()));

            builder.HasData(data);
        }
    }
}
