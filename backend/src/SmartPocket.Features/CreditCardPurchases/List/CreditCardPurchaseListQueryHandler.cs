using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardPurchases.List
{
    public class CreditCardPurchaseListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardPurchaseListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<List<CreditCardPurchaseListItemDTO>> Get(
            int creditCardId,
            CreditCardPurchaseListFilters filters,
            CancellationToken cancellation)
        {
            var query = _smartPocketContext.Query<CreditCardPurchase>()
                .Where(x => x.CreditCardId == creditCardId);

            query = query
                .Where(x =>
                    x.IsActive == filters.IncludeActive ||
                    x.IsPaidOff == filters.IncludePaidOff ||
                    x.IsFinished == filters.IncludeFinished
                );

            return query
                .OrderByDescending(x => x.EffectiveDate)
                    .ThenBy(x => x.CurrencyCode)
                    .ThenBy(x => x.TotalAmount)
                .Select(x => new CreditCardPurchaseListItemDTO
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
                    PurchaseAmount = new MoneyDTO
                    {
                        Amount = x.TotalAmount,
                        CurrencyCode = x.CurrencyCode
                    },
                    EffectiveDate = x.EffectiveDate,
                    PaidOffAt = x.PaidOffAt,
                    FinishedAt = x.FinishedAt,
                    IsActive = x.IsActive,

                    InstallmentsCount = x.Installments.Count,
                    InstallmentsPaidCount = x.Installments
                        .Where(i => i.CreditCardStatementId.HasValue)
                        .Where(i => i.CreditCardStatement.Status == CreditCardStatementStatus.Paid)
                        .Count(),
                    RemainingInstallments = x.Installments
                        .Where(i => !i.CreditCardStatementId.HasValue)
                        .Select(i => new CredictCardPurchaseInstallmentListItemDTO
                        {
                            Id = i.Id,
                            Number = i.Number,
                            Amount = i.Amount
                        })
                })
                .ToListAsync(cancellation);
        }
    }
}
