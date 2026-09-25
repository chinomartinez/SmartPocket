using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardStatements.Suggestions
{
    public class CreditCardStatementSuggestionsQueryHandler : ICreditCardStatementSuggestionsQueryHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementSuggestionsQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<CreditCardStatementSuggestionsDTO> Get(
            int creditCardId,
            DateTime closingDate,
            CancellationToken cancellation)
        {
            var cutoff = DateOnly.FromDateTime(closingDate);
            var suggestedInstallments = await _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardPurchase.CreditCardId == creditCardId)
                .Where(x => x.CreditCardStatementId == null)
                .Where(x => x.CreditCardPurchase.EffectiveDate.AddMonths(x.Number - 1) < cutoff)
                .Select(x => new SuggestedInstallmentItemDTO
                {
                    Id = x.Id,
                    Amount = x.Amount,
                    CurrencyCode = x.CreditCardPurchase.CurrencyCode,
                    InstallmentNumber = x.Number,
                    Purchase = new PurchaseDTO
                    {
                        Id = x.CreditCardPurchase.Id,
                        Description = x.CreditCardPurchase.Description,
                        EffectiveDate = x.CreditCardPurchase.EffectiveDate,
                        Category = new CategoryDTO
                        {
                            Id = x.CreditCardPurchase.Category.Id,
                            Name = x.CreditCardPurchase.Category.Name,
                            Icon = new IconDTO
                            {
                                Code = x.CreditCardPurchase.Category.Icon.Code,
                                ColorHex = x.CreditCardPurchase.Category.Icon.ColorHex
                            }
                        }
                    }
                })
                .ToListAsync(cancellation);

            var subscriptions = await _smartPocketContext.Query<CreditCardSubscription>()
                .Where(x => x.CreditCardId == creditCardId)
                .Where(x => x.EffectiveDate < cutoff)
                .Select(x => new
                {
                    x.Id,
                    x.CurrencyCode,
                    x.InitialAmount,
                    x.EffectiveDate,
                    x.CancelledAt,
                    Subscription = new SubscriptionDTO
                    {
                        Id = x.Id,
                        Description = x.Description,
                        EffectiveDate = x.EffectiveDate,
                        Category = new CategoryDTO
                        {
                            Id = x.Category.Id,
                            Name = x.Category.Name,
                            Icon = new IconDTO
                            {
                                Code = x.Category.Icon.Code,
                                ColorHex = x.Category.Icon.ColorHex
                            }
                        }
                    },
                    Charges = x.Charges
                        .Select(c => new
                        {
                            c.ChargeNumber,
                            c.Amount,
                            StatementClosingDate = c.CreditCardStatement.ClosingDate
                        })
                        .ToList()
                })
                .ToListAsync(cancellation);

            var suggestedCharges = new List<SuggestedChargeItemDTO>();

            foreach (var subscription in subscriptions)
            {
                var existingChargeNumbers = subscription.Charges
                    .Select(x => x.ChargeNumber)
                    .ToHashSet();

                var lastAmount = subscription.Charges
                    .Where(x => x.StatementClosingDate < closingDate)
                    .OrderByDescending(x => x.StatementClosingDate)
                    .ThenByDescending(x => x.ChargeNumber)
                    .Select(x => (decimal?)x.Amount)
                    .FirstOrDefault() ?? subscription.InitialAmount;

                for (var chargeNumber = 1; ; chargeNumber++)
                {
                    var chargeDate = subscription.EffectiveDate.AddMonths(chargeNumber - 1);
                    if (chargeDate >= cutoff)
                    {
                        break;
                    }

                    if (subscription.CancelledAt.HasValue && subscription.CancelledAt.Value <= chargeDate)
                    {
                        continue;
                    }

                    if (existingChargeNumbers.Contains(chargeNumber))
                    {
                        continue;
                    }

                    suggestedCharges.Add(new SuggestedChargeItemDTO
                    {
                        Id = null,
                        Amount = lastAmount,
                        CurrencyCode = subscription.CurrencyCode,
                        ChargeNumber = chargeNumber,
                        Subscription = subscription.Subscription
                    });
                }
            }

            return new CreditCardStatementSuggestionsDTO
            {
                SuggestedInstallmentItems = suggestedInstallments,
                SuggestedChargeItems = suggestedCharges
            };
        }
    }
}
