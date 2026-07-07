using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardPurchases.CancelSubscriptions
{
    public class CancelSubscriptionCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CancelSubscriptionCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<Result<ErrorDetailList>> Cancel(int creditCardPurchaseId, CancellationToken cancellation)
        {
            var entity = await _smartPocketContext.Query<CreditCardPurchase>()
                .Include(x => x.Installments)
                .Where(x => x.Id == creditCardPurchaseId)
                .FirstOrDefaultAsync(cancellation);

            if (entity is null)
            {
                var error = $"Credit card purchase with ID {creditCardPurchaseId} not found.";
                return new ErrorDetailList(error);
            }

            if (entity.TryCancelSubscription(DateOnly.FromDateTime(DateTime.UtcNow), out var errorCancel))
            {
                await _smartPocketContext.SaveChangesAsync(cancellation);
                return Result<ErrorDetailList>.Success();
            }

            return new ErrorDetailList(errorCancel);
        }
    }
}
