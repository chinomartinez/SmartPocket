using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardSubscriptions.CancelSubscriptions
{
    public class CancelSubscriptionCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CancelSubscriptionCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<Result<ErrorDetailList>> Cancel(int creditCardSubscriptionId, CancellationToken cancellation)
        {
            var entity = await _smartPocketContext.Query<CreditCardSubscription>()
                .Where(x => x.Id == creditCardSubscriptionId)
                .FirstOrDefaultAsync(cancellation);

            if (entity is null)
            {
                var error = $"Credit card subscription with ID {creditCardSubscriptionId} not found.";
                return new ErrorDetailList(error);
            }

            entity.Cancel();

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return Result<ErrorDetailList>.Success();
        }
    }
}
