using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Domain.CreditCards.Enums;
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

        public async Task<CreditCardPurchaseListResponse> Get(
            int creditCardId,
            CreditCardPurchaseListFilters filters,
            CancellationToken cancellation)
        {
            var queryBase = _smartPocketContext.Query<CreditCardPurchase>()
                .Where(x => x.CreditCardId == creditCardId);

            var statusFilters = GetByFilters(filters);

            if (statusFilters.Any())
                queryBase = queryBase.Where(x => statusFilters.Contains(x.Status));

            var installments = await queryBase
                .Where(x => x.PurchaseType == CreditCardPurchaseType.Installment)
                .OrderByDescending(x => x.EffectiveDate)
                    .ThenBy(x => x.CurrencyCode)
                    .ThenBy(x => x.TotalAmount)
                .Select(x => new CreditCardInstallmentPurchaseListItemDTO
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
                    CancelledAt = x.CancelledAt,
                    PurchaseType = x.PurchaseType.ToString(),
                    Status = x.Status.ToString(),
                    InstallmentsCount = x.Installments.Count,
                    InstallmentsPaid = x.Installments
                        .Where(i => i.CreditCardStatementId.HasValue)
                        .Where(i => i.CreditCardStatement.Status == CreditCardStatementStatus.Paid)
                        .Count(),
                })
                .ToListAsync(cancellation);

            var subscriptions = await queryBase
                .Where(x => x.PurchaseType == CreditCardPurchaseType.Subscription)
                .OrderByDescending(x => x.EffectiveDate)
                    .ThenBy(x => x.CurrencyCode)
                    .ThenBy(x => x.TotalAmount)
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
                    PurchaseAmount = new MoneyDTO
                    {
                        Amount = x.TotalAmount,
                        CurrencyCode = x.CurrencyCode
                    },
                    EffectiveDate = x.EffectiveDate,
                    PaidOffAt = x.PaidOffAt,
                    CancelledAt = x.CancelledAt,
                    PurchaseType = x.PurchaseType.ToString(),
                    Status = x.Status.ToString(),

                    ChargesCount = x.Installments.Count,
                    LastChargeAmount = x.Installments
                        .OrderByDescending(i => i.InstallmentNumber)
                        .Select(i => i.Amount)
                        .FirstOrDefault(),
                })
                .ToListAsync(cancellation);

            return new CreditCardPurchaseListResponse
            {
                Installments = installments,
                Subscriptions = subscriptions
            };
        }

        private IEnumerable<CreditCardPurchaseStatus> GetByFilters(CreditCardPurchaseListFilters filters)
        {
            var list = new List<CreditCardPurchaseStatus>();

            if (filters.IncludePaidOff)
                list.Add(CreditCardPurchaseStatus.PaidOff);

            if (filters.IncludeCancelled)
                list.Add(CreditCardPurchaseStatus.Cancelled);

            if (filters.IncludePending)
                list.Add(CreditCardPurchaseStatus.InProgress);

            return list;
        }
    }
}
