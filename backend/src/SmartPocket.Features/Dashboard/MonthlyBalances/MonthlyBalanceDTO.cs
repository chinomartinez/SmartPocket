namespace SmartPocket.Features.Dashboard.MonthlyBalance
{
    public class MonthlyBalanceDTO
    {
        public MonthlyBalanceTypeDTO Income { get; set; } = default!;

        public MonthlyBalanceTypeDTO Expense { get; set; } = default!;

        public MonthlyBalanceTypeDTO Savings => new()
        {
            Amount = Income.Amount - Expense.Amount,
            MonthlyVariation = Income.MonthlyVariation - Expense.MonthlyVariation
        };
    }

    public class MonthlyBalanceTypeDTO
    {
        public decimal Amount { get; set; }
        public decimal PreviousAmount { get; set; }
        public decimal MonthlyVariation { get; set; } = 0;
    }
}
