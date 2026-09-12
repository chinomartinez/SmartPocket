namespace SmartPocket.Features.Dashboard.AccountBalances
{
    public class AccountBalancesResponse
    {
        public decimal TotalBalance { get; set; }
        public decimal PreviousMonthTotalBalance { get; set; }
        public decimal MonthlyVariation { get; set; }
    }
}
