using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.CreditCardStatements.Shared;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardStatements.GetById
{
    public class CreditCardStatementGetByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementGetByIdQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
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
                    x.Status
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

            var paymentsByCoveredCurrency = await _smartPocketContext.Query<CreditCardStatementPayment>()
                .AsNoTracking()
                .Where(x => x.CreditCardStatementId == id)
                .ToDictionaryAsync(
                    x => x.CoveredCurrencyCode,
                    x => new MoneyDTO
                    {
                        Amount = x.Transaction.Amount,
                        CurrencyCode = x.Transaction.Account.CurrencyCode
                    },
                    cancellation);

            var currencySummaries = includedInstallments
                .Select(x => new { x.Amount, x.CurrencyCode })
                .Concat(includedCharges.Select(x => new { x.Amount, x.CurrencyCode }))
                .GroupBy(x => x.CurrencyCode)
                .OrderBy(x => x.Key)
                .Select(currencyGroup => new CreditCardStatementCurrencySummaryDTO
                {
                    CurrencyCode = currencyGroup.Key,
                    IncludedAmount = currencyGroup.Sum(x => x.Amount),
                    Payment = paymentsByCoveredCurrency.GetValueOrDefault(currencyGroup.Key)
                })
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
                Totals = new CreditCardStatementTotalsDTO
                {
                    CurrencySummaries = currencySummaries
                }
            };
        }
    }
}
