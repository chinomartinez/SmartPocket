using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain;
using System.Linq.Expressions;

namespace SmartPocket.Persistence.EntityConfigurations
{
    internal static class MapPropertyExtensions
    {
        internal static PropertyBuilder<T> IsNotRequired<T>(this PropertyBuilder<T> property)
            => property.IsRequired(false);

        internal static EntityTypeBuilder<T> ConfigureIcon<T>(this EntityTypeBuilder<T> entityTypeBuilder,
            Expression<Func<T, Icon>> expression)
            where T : class
        {
            return entityTypeBuilder.ComplexProperty(expression, builder =>
            {
                builder.Property(i => i.Code)
                    .IsRequired()
                    .HasMaxLength(100); // opcional

                builder.Property(i => i.ColorHex)
                    .IsRequired()
                    .HasMaxLength(7); // ej. "#FFFFFF"
            });
        }
    }
}
