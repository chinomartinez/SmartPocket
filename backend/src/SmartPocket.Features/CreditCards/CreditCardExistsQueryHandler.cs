using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCards
{
    public class CreditCardExistsQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardExistsQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<bool> Exists(int id, CancellationToken cancellation)
        {
            return _smartPocketContext.Query<CreditCard>()
                    .AnyAsync(a => a.Id == id, cancellation);
        }
    }
}
