using SmartPocket.Features.Currencies;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.SharedKernel.DTOs;

namespace SmartPocket.Features.Accounts.GetById
{
    public class AccountGetByIdDTO : BaseDTO<int>
    {
        public decimal Balance { get; set; }
        public CurrencyItemDTO Currency { get; set; } = default!;
        public IconDTO Icon { get; set; } = default!;
        public bool IncludeInBalanceGlobal { get; set; }
        public string Name { get; set; } = default!;
    }
}
