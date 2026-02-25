using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain;

namespace SmartPocket.Persistence.EntityConfigurations
{
    internal static class MapPropertyExtensions
    {
        internal static PropertyBuilder<T> IsNotRequired<T>(this PropertyBuilder<T> property)
            => property.IsRequired(false);

        internal static PropertyBuilder<string> CurrencyCodeMap(this PropertyBuilder<string> property)
        {
            return property.IsRequired().HasMaxLength(3);
        }

        public static OwnedNavigationBuilder<T, Icon> ConfigureIcon<T>(this OwnedNavigationBuilder<T, Icon> builder)
            where T : class
        {
            builder.Property(i => i.Code)
                .IsRequired()
                .HasMaxLength(100); // opcional

            builder.Property(i => i.ColorHex)
                .IsRequired()
                .HasMaxLength(7); // ej. "#FFFFFF"

            return builder;
        }
    }
}
