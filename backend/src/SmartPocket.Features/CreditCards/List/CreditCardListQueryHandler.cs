using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCards.List
{
    public class CreditCardListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<List<CreditCardListItemDTO>> Get(CancellationToken cancellation)
        {
            return _smartPocketContext.Query<CreditCard>()
                .OrderBy(x => x.Name)
                .Select(x => new CreditCardListItemDTO
                {
                    Id = x.Id,
                    Name = x.Name,
                    Icon = new()
                    {
                        Code = x.Icon.Code,
                        ColorHex = x.Icon.ColorHex
                    },
                    CurrencyCode = x.CurrencyCode,
                    CreditLimit = x.CreditLimit,
                    StatementClosingDay = x.StatementClosingDay,
                    PaymentDueDay = x.PaymentDueDay
                })
                .ToListAsync(cancellation);
        }
    }
}
