using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Persistence
{
    public interface ISmartPocketContext
    {
        IQueryable<T> Query<T>() where T : BaseEntity;

        ValueTask<T> FindAsyncOrThrow<T>(object id, CancellationToken cancellation) where T : BaseEntity;

        ValueTask<T?> FindAsync<T>(object id, CancellationToken cancellation) where T : BaseEntity;

        T AddEntity<T>(T entity) where T : BaseEntity;

        void AddRange<T>(IEnumerable<T> entities) where T : BaseEntity;

        Task<T> AddAndSaveChangesAsync<T>(T entity, CancellationToken cancellationToken = default)
            where T : BaseEntity;


        T UpdateEntity<T>(T entity) where T : BaseEntity;
        Task<T> UpdateAndSaveChangesAsync<T>(T entity, CancellationToken cancellationToken = default)
            where T : BaseEntity;

        T DeleteEntity<T>(T entity) where T : BaseEntity;
        Task<T> DeleteAndSaveChangesAsync<T>(T entity, CancellationToken cancellationToken = default)
            where T : BaseEntity;

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        void DiscardAllChanges();
    }
}
