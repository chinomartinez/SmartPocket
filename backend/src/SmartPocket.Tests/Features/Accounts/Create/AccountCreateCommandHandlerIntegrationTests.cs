using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Configurations;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Accounts.Create;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.Accounts.Create
{
    [IntegrationTest]
    public class AccountCreateCommandHandlerIntegrationTests : IClassFixture<IntegrationTestFixture>
    {
        private readonly IntegrationTestFixture _fixture;
        private readonly AccountCreateCommandHandler _handler;

        public AccountCreateCommandHandlerIntegrationTests(IntegrationTestFixture fixture)
        {
            _fixture = fixture;
            _handler = fixture.GetHandler<AccountCreateCommandHandler>();
        }

        [Fact]
        public async Task Create_WithInitialBalance_PersistsAccountAndAdjustmentTransaction()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var command = new AccountCreateCommand
            {
                Name = "Cuenta integration create",
                CurrencyCode = Currency.ARS.Code,
                Balance = 10000,
                IncludeInBalanceGlobal = true,
                Icon = new IconDTO
                {
                    Code = "wallet",
                    ColorHex = "#FFFFFF"
                }
            };

            // Act
            var result = await _handler.Create(command, cancellationToken);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);

            var accountId = result.Value.Id;
            Assert.True(accountId > 0);

            _fixture.SmartPocketContext.DiscardAllChanges();

            var accountName = await _fixture.SmartPocketContext.Query<Account>()
                .Where(x => x.Id == accountId)
                .Select(x => x.Name)
                .FirstAsync(cancellationToken);

            Assert.Equal(command.Name, accountName);

            var balance = await _fixture.SmartPocketContext.Query<Transaction>()
                .Where(x => x.AccountId == accountId)
                .SumAsync(x => x.SignedAmount, cancellationToken);

            Assert.Equal(10000m, balance);
        }
    }
}
