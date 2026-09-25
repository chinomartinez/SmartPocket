using SmartPocket.Domain.Configurations;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.CreditCardStatements.List
{
    public class CreditCardStatementListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<PagedListResponse<CreditCardStatementListItemDTO>> Get(CreditCardStatementListRequest request, CancellationToken cancellation)
        {
            var statements = _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => x.CreditCardId == request.CreditCardId)
                .Select(x => new CreditCardStatementListItemDTO
                {
                    Id = x.Id,
                    CreditCardId = x.CreditCardId,
                    Description = x.Description,
                    ClosingDate = x.ClosingDate,
                    DueDate = x.DueDate,
                    Status = x.Status.ToString(),
                    TotalItemsInCardCurrency =
                        x.Installments
                            .Where(i => i.CreditCardPurchase.CurrencyCode == x.CreditCard.CurrencyCode)
                            .Sum(i => i.Amount)
                        + x.SubscriptionCharges
                            .Where(c => c.CreditCardSubscription.CurrencyCode == x.CreditCard.CurrencyCode)
                            .Sum(c => c.Amount),
                    TotalItemsInUsd = 
                        x.Installments
                            .Where(i => i.CreditCardPurchase.CurrencyCode == Currency.USD.Code)
                            .Sum(i => i.Amount)
                        + x.SubscriptionCharges
                            .Where(c => c.CreditCardSubscription.CurrencyCode == Currency.USD.Code)
                            .Sum(c => c.Amount),
                    InstallmentsCount = x.Installments.Count,
                    ChargesCount = x.SubscriptionCharges.Count
                })
                .OrderByDescending(x => x.ClosingDate)
                .ThenByDescending(x => x.Id);

            return statements.ToPagedListResponse(request, cancellation);
        }
    }
}
