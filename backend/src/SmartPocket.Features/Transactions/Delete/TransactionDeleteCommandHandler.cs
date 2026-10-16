using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Transactions.Delete
{
    public class TransactionDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransactionDeleteCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<ErrorDetailList> Delete(int id, CancellationToken cancellationToken)
        {
            var entity = await _smartPocketContext.Query<Transaction>()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (entity is null)
            {
                return new ErrorDetailList($"Transacción con ID {id} no encontrada.");
            }

            if (entity.TransactionSourceId != TransactionSourceType.ManualEntry)
            {
                return new ErrorDetailList($"La transacción con ID {id} no puede ser eliminada porque no es de tipo 'ManualEntry'.");
            }

            _smartPocketContext.DeleteEntity(entity);
            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return ErrorDetailList.Empty;
        }
    }
}
