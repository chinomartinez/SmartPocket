using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Accounts
{
    public class AccountExistsQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public AccountExistsQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<bool> Exists(int id, CancellationToken cancellation)
        {
            return _smartPocketContext.Query<Account>().AnyAsync(a => a.Id == id, cancellation);
        }
    }
}
