using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Configurations;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.CreditCardStatements.Suggestions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardStatements.GetById
{
    public class CreditCardStatementGetByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly ICreditCardStatementSuggestionsQueryHandler _suggestionsQueryHandler;

        public CreditCardStatementGetByIdQueryHandler(
            ISmartPocketContext smartPocketContext,
            ICreditCardStatementSuggestionsQueryHandler suggestionsQueryHandler)
        {
            _smartPocketContext = smartPocketContext;
            _suggestionsQueryHandler = suggestionsQueryHandler;
        }

        public async Task<CreditCardStatementGetByIdDTO?> GetById(int id, CancellationToken cancellation)
        {
            var statement = await _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.CreditCardId,
                    x.Description,
                    x.ClosingDate,
                    x.DueDate,
                    x.Status,
                    CardCurrencyCode = x.CreditCard.CurrencyCode
                })
                .FirstOrDefaultAsync(cancellation);

            if (statement is null)
            {
                return null;
            }

            var includedInstallments = await _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardStatementId == id)
                .Select(x => new IncludedInstallmentItemDTO
                {
                    Id = x.Id,
                    Amount = x.Amount,
                    CurrencyCode = x.CreditCardPurchase.CurrencyCode,
                    InstallmentNumber = x.Number,
                    Purchase = new IncludedPurchaseDTO
                    {
                        Id = x.CreditCardPurchase.Id,
                        Description = x.CreditCardPurchase.Description,
                        EffectiveDate = x.CreditCardPurchase.EffectiveDate,
                        Category = new IncludedCategoryDTO
                        {
                            Id = x.CreditCardPurchase.Category.Id,
                            Name = x.CreditCardPurchase.Category.Name,
                            Icon = new IncludedIconDTO
                            {
                                Code = x.CreditCardPurchase.Category.Icon.Code,
                                ColorHex = x.CreditCardPurchase.Category.Icon.ColorHex
                            }
                        }
                    }
                })
                .ToListAsync(cancellation);

            var includedCharges = await _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                .Where(x => x.CreditCardStatementId == id)
                .Select(x => new IncludedChargeItemDTO
                {
                    Id = x.Id,
                    Amount = x.Amount,
                    CurrencyCode = x.CreditCardSubscription.CurrencyCode,
                    ChargeNumber = x.ChargeNumber,
                    Subscription = new IncludedSubscriptionDTO
                    {
                        Id = x.CreditCardSubscription.Id,
                        Description = x.CreditCardSubscription.Description,
                        EffectiveDate = x.CreditCardSubscription.EffectiveDate,
                        Category = new IncludedCategoryDTO
                        {
                            Id = x.CreditCardSubscription.Category.Id,
                            Name = x.CreditCardSubscription.Category.Name,
                            Icon = new IncludedIconDTO
                            {
                                Code = x.CreditCardSubscription.Category.Icon.Code,
                                ColorHex = x.CreditCardSubscription.Category.Icon.ColorHex
                            }
                        }
                    }
                })
                .ToListAsync(cancellation);

            var suggestions = await _suggestionsQueryHandler.Get(statement.CreditCardId, statement.ClosingDate, cancellation);

            var includedAmounts = includedInstallments
                .Select(x => new { x.Amount, x.CurrencyCode })
                .Concat(includedCharges.Select(x => new { x.Amount, x.CurrencyCode }))
                .ToList();

            return new CreditCardStatementGetByIdDTO
            {
                Id = statement.Id,
                CreditCardId = statement.CreditCardId,
                Description = statement.Description,
                ClosingDate = statement.ClosingDate,
                DueDate = statement.DueDate,
                Status = statement.Status.ToString(),
                InstallmentsCount = includedInstallments.Count,
                ChargesCount = includedCharges.Count,
                IncludedInstallmentItems = includedInstallments,
                IncludedChargeItems = includedCharges,
                SuggestedInstallmentItems = suggestions.SuggestedInstallmentItems,
                SuggestedChargeItems = suggestions.SuggestedChargeItems,
                Totals = new CreditCardStatementTotalsDTO
                {
                    TotalItemsInCardCurrency = includedAmounts
                        .Where(x => x.CurrencyCode == statement.CardCurrencyCode)
                        .Sum(x => x.Amount),
                    TotalItemsInUsd = includedAmounts
                        .Where(x => x.CurrencyCode == Currency.USD.Code)
                        .Sum(x => (decimal?)x.Amount)
                }
            };
        }
    }
}
