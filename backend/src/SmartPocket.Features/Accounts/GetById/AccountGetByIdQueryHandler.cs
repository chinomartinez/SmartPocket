using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Currencies;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Accounts.GetById
{
    public class AccountGetByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public AccountGetByIdQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<AccountGetByIdDTO?> TryGet(int id, CancellationToken cancellationToken)
        {
            var result = await _smartPocketContext.Query<Account>()
                .Where(x => x.Id == id)
                .Select(x => new AccountGetByIdDTO
                {
                    Id = x.Id,
                    Balance = x.Transactions.Sum(t => t.SignedAmount),
                    Currency = CurrencyItemDTOMapper.GetByCode(x.CurrencyCode),
                    Icon = new()
                    {
                        Code = x.Icon.Code,
                        ColorHex = x.Icon.ColorHex,
                    },
                    IncludeInBalanceGlobal = x.IncludeInBalanceGlobal,
                    Name = x.Name
                })
                .FirstOrDefaultAsync(cancellationToken);

            return result;  
        }
    }
}
