using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Accounts.Create
{
    public class AccountCreateCommand
    {
        public decimal Balance { get; set; }
        public string CurrencyCode { get; set; } = default!;
        public IconDTO Icon { get; set; } = default!;
        public bool IncludeInBalanceGlobal { get; set; }
        public string Name { get; set; } = default!;
    }
}
