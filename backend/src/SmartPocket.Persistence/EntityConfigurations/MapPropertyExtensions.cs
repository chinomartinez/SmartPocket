using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartPocket.Domain;
using System.Linq.Expressions;

namespace SmartPocket.Persistence.EntityConfigurations
{
    internal static class MapPropertyExtensions
    {
        internal static PropertyBuilder<T> IsNotRequired<T>(this PropertyBuilder<T> property)
            => property.IsRequired(false);

        internal static PropertyBuilder<string> ConfigureCurrency<T>(this EntityTypeBuilder<T> entityTypeBuilder,
            Expression<Func<T, string>> expression)
            where T : class
        {
            return entityTypeBuilder.Property(expression)
                .HasMaxLength(3)
                .IsRequired();
        }

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

        /// <summary>
        /// Centraliza la configuración de propiedades numéricas (decimal) para que tengan una precisión y escala consistente en toda la aplicación.
        /// Esto es util para tener una centralización para todas las configuraciones de propiedades numéricas.
        /// </summary>
        /// <param name="property"></param>
        /// <param name="precision"></param>
        /// <param name="scale"></param>
        /// <returns></returns>
        internal static PropertyBuilder<decimal> IsNumeric(this PropertyBuilder<decimal> property, int precision = 18, int scale = 2)
        {
            // Es posible que esto cambie en el futuro. Hoy por hoy, utilizamos Sqlite.
            // Si cambio a PostgreSQL o SQL Server, es posible que requiera usar HasColumnType u otras configuraciones específicas.
            return property.HasPrecision(precision, scale);
        }
    }
}
