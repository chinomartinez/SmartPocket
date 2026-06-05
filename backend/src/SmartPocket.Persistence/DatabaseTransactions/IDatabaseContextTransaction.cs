namespace SmartPocket.Persistence.DatabaseTransactions
{
    public interface IDatabaseContextTransaction : IDisposable, IAsyncDisposable
    {
        void Commit();
        void Rollback();

        Task CommitAsync(CancellationToken cancellationToken = default);

        Task RollbackAsync(CancellationToken cancellationToken = default);
    }
}
