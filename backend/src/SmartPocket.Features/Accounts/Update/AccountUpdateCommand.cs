using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Accounts.Update
{
    public class AccountUpdateCommand : ICommand<int>
    {
        public int Id { get; set; }
        
        public decimal Balance { get; set; }
        public string CurrencyCode { get; set; } = default!;
        public IconDTO Icon { get; set; } = default!;
        public bool IncludeInBalanceGlobal { get; set; }
        public string Name { get; set; } = default!;
    }
}
