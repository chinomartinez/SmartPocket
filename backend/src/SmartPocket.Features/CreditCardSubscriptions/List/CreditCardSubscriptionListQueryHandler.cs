using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardSubscriptions.List
{
    public class CreditCardSubscriptionListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardSubscriptionListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<List<CreditCardSubscriptionListItemDTO>> Get(
            int creditCardId,
            CreditCardSubscriptionListFilters filters,
            CancellationToken cancellation)
        {
            var query = _smartPocketContext.Query<CreditCardSubscription>()
                .Where(x => x.CreditCardId == creditCardId);

            query = query
                .Where(x =>
                    (filters.IncludeActive && !x.IsCancelled) ||
                    (filters.IncludeCancelled && x.IsCancelled)
                );

            return query
                .OrderByDescending(x => x.EffectiveDate)
                    .ThenBy(x => x.CurrencyCode)
                    .ThenBy(x => x.InitialAmount)
                .Select(x => new CreditCardSubscriptionListItemDTO
                {
                    Id = x.Id,
                    Category = new()
                    {
                        Id = x.Category.Id,
                        Name = x.Category.Name,
                        Icon = new()
                        {
                            Code = x.Category.Icon.Code,
                            ColorHex = x.Category.Icon.ColorHex
                        }
                    },
                    Description = x.Description,
                    SubscriptionAmount = new MoneyDTO
                    {
                        Amount = x.InitialAmount,
                        CurrencyCode = x.CurrencyCode
                    },
                    EffectiveDate = x.EffectiveDate,
                    CancelledAt = x.CancelledAt,
                    IsActive = x.IsActive,

                    ChargeCount = x.Charges.Count,
                    ChargePaidCount = x.Charges.Count(x => x.CreditCardStatement.Status == CreditCardStatementStatus.Paid),
                    LastChargeAmount = x.Charges
                        .OrderByDescending(c => c.CreditCardStatement.DueDate)
                        .ThenByDescending(c => c.ChargeNumber)
                        .Select(c => c.Amount)
                        .Take(1)
                        .Sum()
                })
                .ToListAsync(cancellation);
        }
    }
}
