
using Microsoft.EntityFrameworkCore.Storage;

namespace SmartPocket.Persistence.DatabaseTransactions
{
    internal class DatabaseContextTransaction : IDatabaseContextTransaction
    {
        private readonly IDbContextTransaction _dbContextTransaction;

        public DatabaseContextTransaction(IDbContextTransaction dbContextTransaction)
        {
            _dbContextTransaction = dbContextTransaction;
        }

        public void Dispose()
        {
            _dbContextTransaction.Dispose();
        }

        public ValueTask DisposeAsync()
        {
            return _dbContextTransaction.DisposeAsync();
        }

        public void Commit()
        {
            _dbContextTransaction.Commit();
        }

        public Task CommitAsync(CancellationToken cancellationToken = default)
        {
            return _dbContextTransaction.CommitAsync(cancellationToken);
        }

        public void Rollback()
        {
            _dbContextTransaction.Rollback();
        }

        public Task RollbackAsync(CancellationToken cancellationToken = default)
        {
            return _dbContextTransaction.RollbackAsync(cancellationToken);
        }
    }
}
