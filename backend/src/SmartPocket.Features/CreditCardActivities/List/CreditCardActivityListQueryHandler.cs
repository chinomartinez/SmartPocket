using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.CreditCardActivities.List
{
    public class CreditCardActivityListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardActivityListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<PagedListResponse<CreditCardActivityListItemDTO>> Get(
            int creditCardId,
            CreditCardActivityListFilters filters,
            CancellationToken cancellation)
        {
            var purchases = _smartPocketContext.Query<CreditCardPurchase>()
                .Where(x => x.CreditCardId == creditCardId)
                .Select(x => new CreditCardActivityListItemDTO
                {
                    Id = x.Id,
                    Type = "Purchase",
                    Description = x.Description,
                    Category = new()
                    {
                        Id = x.Category.Id,
                        Name = x.Category.Name,
                        Icon = new()
                        {
                            Code = x.Category.Icon.Code,
                            ColorHex = x.Category.Icon.ColorHex,
                        },
                    },
                    Amount = x.TotalAmount,
                    CurrencyCode = x.CurrencyCode,
                    EffectiveDate = x.EffectiveDate,
                    Status = x.FinishedAt.HasValue
                        ? "Finished"
                        : x.PaidOffAt.HasValue
                            ? "Paid"
                            : "InProgress",
                    InstallmentsCount = x.Installments.Count,
                    InstallmentsPaidCount = x.Installments.Count(i =>
                        i.CreditCardStatementId.HasValue &&
                        i.CreditCardStatement.Status == CreditCardStatementStatus.Paid),
                    ChargeCount = null,
                });

            var subscriptions = _smartPocketContext.Query<CreditCardSubscription>()
                .Where(x => x.CreditCardId == creditCardId)
                .Select(x => new CreditCardActivityListItemDTO
                {
                    Id = x.Id,
                    Type = "Subscription",
                    Description = x.Description,
                    Category = new()
                    {
                        Id = x.Category.Id,
                        Name = x.Category.Name,
                        Icon = new()
                        {
                            Code = x.Category.Icon.Code,
                            ColorHex = x.Category.Icon.ColorHex,
                        },
                    },
                    Amount = x.Charges
                        .OrderByDescending(c => c.CreditCardStatement.DueDate)
                        .ThenByDescending(c => c.ChargeNumber)
                        .Select(c => (decimal?)c.Amount)
                        .FirstOrDefault() ?? x.InitialAmount,
                    CurrencyCode = x.CurrencyCode,
                    EffectiveDate = x.EffectiveDate,
                    Status = x.IsCancelled ? "Cancelled" : "Active",
                    InstallmentsCount = null,
                    InstallmentsPaidCount = null,
                    ChargeCount = x.Charges.Count,
                });

            var activities = purchases.Concat(subscriptions);

            if (!string.IsNullOrWhiteSpace(filters.Type))
            {
                activities = activities.Where(x => x.Type == filters.Type);
            }

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                activities = activities.Where(x => x.Status == filters.Status);
            }

            if (!string.IsNullOrWhiteSpace(filters.Search))
            {
                var search = filters.Search.Trim();
                activities = activities.Where(x =>
                    x.Description.Contains(search) || x.Category.Name.Contains(search));
            }

            return activities
                .OrderByDescending(x => x.EffectiveDate)
                .ThenBy(x => x.Type)
                .ThenBy(x => x.Id)
                .ToPagedListResponse(filters, cancellation);
        }
    }
}
