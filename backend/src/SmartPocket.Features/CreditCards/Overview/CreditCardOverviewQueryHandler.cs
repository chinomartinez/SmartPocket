using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCards.Overview
{
    public class CreditCardOverviewQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardOverviewQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<CreditCardOverviewDTO?> Get(int creditCardId, CancellationToken cancellation)
        {
            var card = await _smartPocketContext.Query<CreditCard>()
                .Where(x => x.Id == creditCardId)
                .Select(x => new
                {
                    x.Id,
                    x.CurrencyCode,
                    x.CreditLimit
                })
                .FirstOrDefaultAsync(cancellation);

            if (card is null) return null;

            var pendingInstallmentsQuery = _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardPurchase.CreditCardId == creditCardId)
                .Where(x => x.CreditCardPurchase.CurrencyCode == card.CurrencyCode)
                .Where(x => x.CreditCardPurchase.PaidOffAt == null)
                .Where(x => x.CreditCardPurchase.FinishedAt == null)
                .Where(x => x.CreditCardStatementId == null || x.CreditCardStatement.Status == CreditCardStatementStatus.Closed);

            var pendingInstallmentsAmount = await pendingInstallmentsQuery
                .SumAsync(x => (decimal?)x.Amount, cancellation) ?? 0m;

            var pendingInstallmentsCount = await pendingInstallmentsQuery
                .CountAsync(cancellation);

            var pendingSubscriptionChargesAmount = await _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                .Where(x => x.CreditCardSubscription.CreditCardId == creditCardId)
                .Where(x => x.CreditCardSubscription.CurrencyCode == card.CurrencyCode)
                .Where(x => x.CreditCardStatement.Status == CreditCardStatementStatus.Closed)
                .SumAsync(x => (decimal?)x.Amount, cancellation) ?? 0m;

            var unpaidStatementsCount = await _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => x.CreditCardId == creditCardId)
                .Where(x => x.Status == CreditCardStatementStatus.Closed)
                .CountAsync(cancellation);

            var pendingAmount = pendingInstallmentsAmount + pendingSubscriptionChargesAmount;

            return new CreditCardOverviewDTO
            {
                CreditCardId = card.Id,
                CurrencyCode = card.CurrencyCode,
                CreditLimit = card.CreditLimit,
                PendingAmount = pendingAmount,
                EstimatedAvailableAmount = Math.Max(0m, card.CreditLimit - pendingAmount),
                PendingInstallmentsCount = pendingInstallmentsCount,
                UnpaidStatementsCount = unpaidStatementsCount
            };
        }
    }
}
