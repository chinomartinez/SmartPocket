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

        public async Task<CreditCardPurchaseListResponse> Get(CreditCardPurchaseListRequest request,
            CancellationToken cancellation)
        {
            var queryBase = _smartPocketContext.Query<CreditCardPurchase>()
                .Where(x => x.CreditCardId == request.CreditCardId);

            var statusFilters = GetByFilters(request);

            if (statusFilters.Any())
                queryBase = queryBase.Where(x => statusFilters.Contains(x.Status));

            var installments = await queryBase
                .Where(x => x.PurchaseType == CreditCardPurchaseType.Installment)
                .Select(x => new CreditCardInstallmentPurchaseListItemDTO
                {
                    Id = x.Id,
                    CreditCard = new CreditCardCreditCardPurchaseListItemDTO
                    {
                        Id = x.CreditCard.Id,
                        Name = x.CreditCard.Name
                    },
                    Category = new CategoryCreditCardPurchaseListItemDTO
                    {
                        Id = x.Category.Id,
                        Name = x.Category.Name
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
                .Select(x => new CreditCardSubscriptionListItemDTO
                {
                    Id = x.Id,
                    CreditCard = new CreditCardCreditCardPurchaseListItemDTO
                    {
                        Id = x.CreditCard.Id,
                        Name = x.CreditCard.Name
                    },
                    Category = new CategoryCreditCardPurchaseListItemDTO
                    {
                        Id = x.Category.Id,
                        Name = x.Category.Name
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
                    IsActive = x.Status == CreditCardPurchaseStatus.InProgress
                })
                .ToListAsync(cancellation);

            return new CreditCardPurchaseListResponse
            {
                Installments = installments,
                Subscriptions = subscriptions
            };
        }

        private IEnumerable<CreditCardPurchaseStatus> GetByFilters(CreditCardPurchaseListRequest request)
        {
            var list = new List<CreditCardPurchaseStatus>();

            if (request.IncludePaidOff)
                list.Add(CreditCardPurchaseStatus.PaidOff);

            if (request.IncludeCancelled)
                list.Add(CreditCardPurchaseStatus.Cancelled);

            if (request.IncludePending)
                list.Add(CreditCardPurchaseStatus.InProgress);

            return list;
        }
    }
}
