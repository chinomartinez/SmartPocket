using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Accounts.Create;
using SmartPocket.Features.Dashboard.AccountBalances;
using SmartPocket.Features.Dashboard.MonthlyBalance;
using SmartPocket.Features.Transactions.Create;
using SmartPocket.Persistence;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.DateOnlyQueries
{
    public class DateOnlyDashboardQueryTest : IClassFixture<IntegrationTestFixture>
    {
        private readonly IntegrationTestFixture _testFixture;
        private readonly AccountCreateCommandHandler _accountCreateHandler;
        private readonly TransactionCreateCommandHandler _transactionCreateHandler;
        private readonly MonthlyBalancesQueryHandler _monthlyBalancesHandler;
        private readonly AccountBalancesQueryHandler _accountBalancesHandler;

        public DateOnlyDashboardQueryTest(IntegrationTestFixture testFixture)
        {
            _testFixture = testFixture;
            _accountCreateHandler = testFixture.GetHandler<AccountCreateCommandHandler>();
            _transactionCreateHandler = testFixture.GetHandler<TransactionCreateCommandHandler>();
            _monthlyBalancesHandler = testFixture.GetHandler<MonthlyBalancesQueryHandler>();
            _accountBalancesHandler = testFixture.GetHandler<AccountBalancesQueryHandler>();
        }

        [Fact]
        public async Task DashboardQueries_TranslateDateOnlyMonthAndYear()
        {
            var cancellation = TestContext.Current.CancellationToken;

            await SmartPocketSeeder.SeedAsync(_testFixture.SmartPocketContext, cancellation);

            var accountResult = await _accountCreateHandler.Create(new AccountCreateCommand
            {
                Name = "DateOnly dashboard",
                CurrencyCode = "ARS",
                Balance = 0,
                Icon = new()
                {
                    Code = "empty",
                    ColorHex = "#FFF"
                }
            }, cancellation);

            Assert.True(accountResult.IsSuccess);
            var accountId = accountResult.Value!.Id;

            var categoryId = await _testFixture.SmartPocketContext.Query<Category>()
                .Select(x => x.Id)
                .FirstAsync(cancellation);

            var transactionResult = await _transactionCreateHandler.Create(new TransactionCreateCommand
            {
                AccountId = accountId,
                CategoryId = categoryId,
                Amount = 250,
                EffectiveDate = DateOnly.FromDateTime(DateTime.UtcNow),
                IsIncome = true
            }, cancellation);

            Assert.True(transactionResult.IsSuccess);

            var monthly = await _monthlyBalancesHandler.Get(accountId, cancellation);

            Assert.Equal(250, monthly.Income.Amount);
            Assert.Equal(0, monthly.Expense.Amount);

            var balances = await _accountBalancesHandler.Get(accountId, cancellation);

            Assert.Equal(250, balances.TotalBalance);
            Assert.Equal(0, balances.PreviousMonthTotalBalance);
        }
    }
}
