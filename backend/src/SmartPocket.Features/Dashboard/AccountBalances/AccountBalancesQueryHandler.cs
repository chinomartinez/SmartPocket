using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Dashboard.AccountBalances
{
    public class AccountBalancesQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public AccountBalancesQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<AccountBalancesResponse> Get(CancellationToken cancellation)
        {
            var accounts = await _smartPocketContext.Query<Account>()
                .Where(x => x.IncludeInBalanceGlobal)
                .Select(x => new AccountBalanceDTO
                {
                    Id = x.Id,
                    Name = x.Name,
                    CurrencyCode = x.CurrencyCode,
                    Icon = new()
                    {
                        Code = x.Icon.Code,
                        ColorHex = x.Icon.ColorHex
                    },
                    Balance = x.Transactions.Sum(t => t.SignedAmount)                        
                })
                .ToListAsync(cancellation);

            var previousMonth = DateTime.UtcNow.AddMonths(-1).Month;
            var previousMonthYear = DateTime.UtcNow.AddMonths(-1).Year;

            var previousMonthTotalBalance = await _smartPocketContext.Query<Transaction>()
                .Where(x => x.Account.IncludeInBalanceGlobal)
                .Where(x => x.EffectiveDate.Month == previousMonth && x.EffectiveDate.Year == previousMonthYear)
                .SumAsync(x => x.SignedAmount, cancellation);

            var totalBalance = accounts.Sum(x => x.Balance);
            var variationPercent = CalculateMonthlyVariation(totalBalance, previousMonthTotalBalance);

            return new AccountBalancesResponse
            {
                Accounts = accounts,
                TotalBalance = totalBalance,
                PreviousMonthTotalBalance = previousMonthTotalBalance,
                MonthlyVariation = variationPercent
            };
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
