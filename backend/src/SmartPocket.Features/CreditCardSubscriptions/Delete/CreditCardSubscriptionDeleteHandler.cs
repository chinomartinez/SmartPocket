using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardSubscriptions.Delete
{
    public class CreditCardSubscriptionDeleteHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardSubscriptionDeleteHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<SimpleResult<ErrorDetail>> Delete(int id, CancellationToken cancellation)
        {
            var entity = await _smartPocketContext.Query<CreditCardSubscription>()
                .FirstOrDefaultAsync(x => x.Id == id, cancellation);

            if (entity is null)
            {
                return new ErrorDetail($"Suscripción de tarjeta de crédito con ID {id} no encontrada.");
            }

            _smartPocketContext.DeleteEntity(entity);
            await _smartPocketContext.SaveChangesAsync(cancellation);

            return SimpleResult<ErrorDetail>.Success();
        }
    }
}
