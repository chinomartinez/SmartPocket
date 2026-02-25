using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Security;
using SmartPocket.Domain.Transactions;
using SmartPocket.Persistence.EntityConfigurations;
using SmartPocket.SharedKernel.Entities;
using System.Reflection;

namespace SmartPocket.Persistence
{
    internal class SmartPocketContext : DbContext, ISmartPocketContext
    {
        internal DbSet<Account> Accounts { get; private set; }

        internal DbSet<User> Users { get; private set; }

        internal DbSet<Category> Categories { get; private set; }

        internal DbSet<Transaction> Transactions { get; private set; }

        public SmartPocketContext(DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            var sqlTimestamped = Database.IsSqlite()
                ? "datetime('now', 'utc')"
                : throw new InvalidOperationException("Unsupported database provider for timestamped entities.");

            modelBuilder.ApplyCommonConfigs(userId: 0, sqlTimestamped: sqlTimestamped);

            //if (Database.IsSqlite())
            //    ApplyDecimalToLongConversion(modelBuilder);
        }                

        private void ApplyDecimalToLongConversion(ModelBuilder modelBuilder)
        {
            var decimalConverter = new ValueConverter<decimal, long>(
                v => (long)(v * 100m),
                v => v / 100m);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(decimal))
                    {
                        property.SetValueConverter(decimalConverter);
                    }
                }
            }
        }

        public IQueryable<T> Query<T>() where T : BaseEntity
        {
            return base.Set<T>();
        }

        public T AddEntity<T>(T entity) where T : BaseEntity
        {
            return base.Set<T>().Add(entity).Entity;
        }

        public void AddRange<T>(IEnumerable<T> entities) where T : BaseEntity
        {
            base.Set<T>().AddRange(entities);
        }

        public T UpdateEntity<T>(T entity) where T : BaseEntity
        {
            return base.Set<T>().Update(entity).Entity;
        }

        public T DeleteEntity<T>(T entity) where T : BaseEntity
        {
            return base.Set<T>().Remove(entity).Entity;
        }

        public void DiscardAllChanges()
        {
            ChangeTracker.Clear();
        }

        public async ValueTask<T> FindAsyncOrThrow<T>(object Id, CancellationToken cancellation) where T : BaseEntity
        {
            var entity = await FindAsync<T>(Id, cancellation);

            if (entity == null)
            {
                var m = $"Entity '{typeof(T).Name}' with id '{Id}' could not be found.";
                throw new InvalidOperationException(m);
            }

            return entity;
        }

        public async ValueTask<T?> FindAsync<T>(object Id, CancellationToken cancellation) where T : BaseEntity
        {
            var parameters = new object[] { Id };
            var entity = await base.Set<T>().FindAsync(parameters, cancellationToken: cancellation);

            return entity;
        }

        public async Task<T> AddAndSaveChangesAsync<T>(T entity, CancellationToken cancellationToken = default)
            where T : BaseEntity
        {
            var result = AddEntity(entity);

            await SaveChangesAsync(cancellationToken);

            return result;
        }

        public async Task<T> UpdateAndSaveChangesAsync<T>(T entity, CancellationToken cancellationToken = default)
            where T : BaseEntity
        {
            var result = UpdateEntity(entity);

            await SaveChangesAsync(cancellationToken);

            return result;
        }

        public async Task<T> DeleteAndSaveChangesAsync<T>(T entity, CancellationToken cancellationToken = default)
            where T : BaseEntity
        {
            var result = DeleteEntity(entity);

            await SaveChangesAsync(cancellationToken);

            return result;
        }
    }
}
