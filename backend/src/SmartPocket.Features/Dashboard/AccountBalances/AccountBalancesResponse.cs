using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Dashboard.AccountBalances
{
    public class AccountBalancesResponse
    {
        public decimal TotalBalance { get; set; }
        public decimal PreviousMonthTotalBalance { get; set; }
        public decimal MonthlyVariation { get; set; }
        public IEnumerable<AccountBalanceDTO> Accounts { get; set; } = Enumerable.Empty<AccountBalanceDTO>();
    }

    public class AccountBalanceDTO
    {
        public int Id { get; set; }
        public decimal Balance { get; set; }
        public string CurrencyCode { get; set; } = default!;
        public IconDTO Icon { get; set; } = default!;
        public string Name { get; set; } = default!;
    }
}
