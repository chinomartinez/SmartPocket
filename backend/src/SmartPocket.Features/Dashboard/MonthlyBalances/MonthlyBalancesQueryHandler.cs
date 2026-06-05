using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Dashboard.MonthlyBalance
{
    public class MonthlyBalancesQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public MonthlyBalancesQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<MonthlyBalanceDTO> Get(CancellationToken cancellation)
        {
            var currentDate = DateTime.UtcNow;
            var currentMonth = currentDate.Month;
            var currentYear = currentDate.Year;

            var previousMonth = currentDate.AddMonths(-1).Month;
            var previousYear = currentDate.AddMonths(-1).Year;

            var currentMonthBalance = await GetMonthlyBalance(currentMonth, currentYear, cancellation);
            var previousMonthBalance = await GetMonthlyBalance(previousMonth, previousYear, cancellation);

            var incomeVariation = CalculateMonthlyVariation(
                currentMonthBalance.Income,
                previousMonthBalance.Income);

            var expenseVariation = CalculateMonthlyVariation(
                currentMonthBalance.Expense,
                previousMonthBalance.Expense);

            return new MonthlyBalanceDTO
            {
                Income = new MonthlyBalanceTypeDTO
                {
                    Amount = currentMonthBalance.Income,
                    PreviousAmount = previousMonthBalance.Income,
                    MonthlyVariation = incomeVariation,
                },
                Expense = new MonthlyBalanceTypeDTO
                {
                    Amount = currentMonthBalance.Expense,
                    PreviousAmount = previousMonthBalance.Expense,
                    MonthlyVariation = expenseVariation,
                }
            };
        }

        private async Task<(decimal Income, decimal Expense)> GetMonthlyBalance(int month, int year, CancellationToken cancellation)
        {
            var rv = await _smartPocketContext.Query<Transaction>()
                .Where(x => x.Account.IncludeInBalanceGlobal)
                .Where(x => x.IsManualEntry)
                .Where(x => x.EffectiveDate.Month == month && x.EffectiveDate.Year == year)
                .GroupBy(x => 1)
                .Select(g => new
                {
                    Income = g.Sum(t => t.IsIncome ? t.Amount : 0),
                    Expense = g.Sum(t => !t.IsIncome ? t.Amount : 0)
                })
                .ToListAsync(cancellation);

            if (rv.Count > 1)
                throw new InvalidOperationException("No puede haber mas de uno");

            return rv.Count == 0 ? (0, 0) : (rv[0].Income, rv[0].Expense);
        }

        private decimal CalculateMonthlyVariation(decimal currentAmount, decimal previousAmount)
        {
            if (previousAmount == 0)
            {
                return currentAmount == 0 ? 0 : 100;
            }

            return ((currentAmount - previousAmount) / previousAmount) * 100;
        }
    }
}
