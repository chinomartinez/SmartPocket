using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.Transactions;

namespace SmartPocket.Persistence.EntityConfigurations.Transactions
{
    internal class CategoryConfig : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.Property(x => x.Name)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(x => x.SortOrder)
                .HasDefaultValue(0);

            builder.ConfigureIcon(x => x.Icon);
        }
    }
}
