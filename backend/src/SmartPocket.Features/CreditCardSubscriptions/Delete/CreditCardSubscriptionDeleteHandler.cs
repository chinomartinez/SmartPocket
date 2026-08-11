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

        public async Task<Result<ErrorDetail>> Delete(int id, CancellationToken cancellation)
        {
            var entity = await _smartPocketContext.Query<CreditCardSubscription>()
                .FirstOrDefaultAsync(x => x.Id == id, cancellation);

            if (entity is null)
            {
                return new ErrorDetail($"Credit card Subscription with id {id} not found.");
            }

            _smartPocketContext.DeleteEntity(entity);
            await _smartPocketContext.SaveChangesAsync(cancellation);

            return Result<ErrorDetail>.Success();
        }
    }
}
