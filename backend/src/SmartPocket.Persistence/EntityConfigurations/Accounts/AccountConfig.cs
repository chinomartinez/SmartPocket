using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain.Accounts;

namespace SmartPocket.Persistence.EntityConfigurations.Accounts
{
    internal class AccountConfig : IEntityTypeConfiguration<Account>
    {
        public void Configure(EntityTypeBuilder<Account> builder)
        {
            builder.Property(x => x.Name).HasMaxLength(200).IsRequired();

            builder.ConfigureIcon(x => x.Icon);
            
            builder.Property(x => x.InitialBalance).IsRequired();

            builder.Property(x => x.CurrencyCode).IsRequired().HasMaxLength(3);
        }
    }
}
