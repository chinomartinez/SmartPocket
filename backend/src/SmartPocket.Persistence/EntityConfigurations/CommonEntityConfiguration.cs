using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Security;
using SmartPocket.SharedKernel.Entities;
using System.Reflection;

namespace SmartPocket.Persistence.EntityConfigurations
{
    internal static class CommonEntityConfiguration
    {
        private delegate void ApplyActiveDelegate(ModelBuilder builder);
        private static MethodInfo ActiveMethod = GetMethod(nameof(ApplyDeleteQuery));

        private delegate void ApplyTimeDelegate(ModelBuilder builder, string sqlTimestamped);
        private static MethodInfo TimeMethod = GetMethod(nameof(ApplyTimestamped));

        private delegate void ApplyTenantDelegate(ModelBuilder builder, int userId);
        private static MethodInfo TenantMethod = GetMethod(nameof(ApplyTenant));

        internal static void ApplyCommonConfigs(this ModelBuilder modelBuilder, int userId,
            string sqlTimestamped)
        {
            var active = typeof(IDeletable);
            var time = typeof(ITimestampedEntity);
            var tenant = typeof(ITenantEntity);

            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                var clrType = entity.ClrType;

                if (IsAssignableTo<ApplyActiveDelegate>(clrType, active, ActiveMethod, out var activeDelegate))
                    activeDelegate(modelBuilder);

                if (IsAssignableTo<ApplyTimeDelegate>(clrType, time, TimeMethod, out var timeDelegate))
                    timeDelegate(modelBuilder, sqlTimestamped);

                //if (IsAssignableTo<ApplyTenantDelegate>(clrType, tenant, TenantMethod, out var tenantDelegate))
                //    tenantDelegate(modelBuilder, userId);
            }
        }

        private static void ApplyDeleteQuery<T>(ModelBuilder modelBuilder)
            where T : class, IDeletable
        {
            modelBuilder.Entity<T>().HasQueryFilter(x => !x.IsDeleted);
        }

        private static void ApplyTimestamped<T>(ModelBuilder modelBuilder, string sqlTimestamped)
            where T : class, ITimestampedEntity
        {
            var entitybuilder = modelBuilder.Entity<T>();

            entitybuilder.Property(x => x.CreatedAt)
                .HasDefaultValueSql(sqlTimestamped)
                .ValueGeneratedOnAdd();

            entitybuilder.Property(x => x.LastModifiedAt)
                .HasDefaultValueSql(sqlTimestamped)
                .ValueGeneratedOnUpdate();
        }

        private static void ApplyTenant<T>(ModelBuilder builder, int userId)
            where T : class, ITenantEntity
        {
            var entitybuilder = builder.Entity<T>();

            entitybuilder.HasOne(x => x.User)
                .WithMany()
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            entitybuilder.HasQueryFilter(x => x.UserId == userId);
        }

        private static bool IsAssignableTo<T>(Type clrType, Type interfacee, MethodInfo method, out T function)
            where T : Delegate
        {
            if (!clrType.IsAssignableTo(interfacee))
            {
                function = default!;
                return false;
            }

            function = CreateDelegate<T>(method, clrType);
            return true;
        }


        private static MethodInfo GetMethod(string name)
        {
            return typeof(CommonEntityConfiguration).GetMethod(name, BindingFlags.Static | BindingFlags.NonPublic)!;
        }

        private static T CreateDelegate<T>(MethodInfo method, Type genericParameter)
            where T : Delegate
        {
            return method.MakeGenericMethod(genericParameter).CreateDelegate<T>();
        }
    }
}
