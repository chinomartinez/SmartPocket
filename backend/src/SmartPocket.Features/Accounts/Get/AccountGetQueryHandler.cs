using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Currencies;
using SmartPocket.Persistence;
using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.Accounts.Get
{
    public class AccountGetQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public AccountGetQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<PagedListResponse<AccountGetDTO>> GetAll(AccountGetQuery request,
            CancellationToken cancellationToken)
        {
            var result = await _smartPocketContext.Query<Account>()
                .Select(x => new AccountGetDTO
                {
                    Id = x.Id,
                    Balance = x.Transactions.Sum(t => t.SignedAmount),
                    CreatedAt = x.CreatedAt,
                    Currency = CurrencyItemDTOMapper.GetByCode(x.CurrencyCode),
                    Icon = new()
                    {
                        Code = x.Icon.Code,
                        ColorHex = x.Icon.ColorHex,
                    },
                    IncludeInBalanceGlobal = x.IncludeInBalanceGlobal,
                    Name = x.Name,
                })
                .ToPagedListResponse(request, cancellationToken);

            return result;
        }
    }
}
