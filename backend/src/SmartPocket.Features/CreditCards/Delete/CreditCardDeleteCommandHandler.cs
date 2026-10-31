using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCards.Delete
{
    public class CreditCardDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardDeleteCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<SimpleResult<ErrorDetail>> Delete(int id, CancellationToken cancellation)
        {
            var entity = await _smartPocketContext.Query<CreditCard>()
                .Include(x => x.Purchases)
                .Include(x => x.Subscriptions)
                .Include(x => x.Statements)
                .FirstOrDefaultAsync(x => x.Id == id, cancellation);

            if (entity is null)
            {
                return new ErrorDetail($"Tarjeta de crédito con ID {id} no encontrada.");
            }

            var payments = await _smartPocketContext.Query<CreditCardStatementPayment>()
                .Where(x => x.CreditCardStatement.CreditCardId == id)
                .Include(x => x.Transaction)
                .ToListAsync(cancellation);

            _smartPocketContext.DeleteRange(entity.Purchases);
            _smartPocketContext.DeleteRange(entity.Subscriptions);
            _smartPocketContext.DeleteRange(entity.Statements);
            _smartPocketContext.DeleteRange(payments);
            _smartPocketContext.DeleteRange(payments.Select(x => x.Transaction));
            _smartPocketContext.DeleteEntity(entity);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return SimpleResult<ErrorDetail>.Success();
        }
    }
}
