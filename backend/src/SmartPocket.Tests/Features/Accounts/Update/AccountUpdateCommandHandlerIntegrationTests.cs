using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Configurations;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Accounts.Create;
using SmartPocket.Features.Accounts.Update;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.Accounts.Update
{
    [IntegrationTest]
    public class AccountUpdateCommandHandlerIntegrationTests : IClassFixture<IntegrationTestFixture>
    {
        private readonly IntegrationTestFixture _fixture;
        private readonly AccountCreateCommandHandler _createHandler;
        private readonly AccountUpdateCommandHandler _updateHandler;

        public AccountUpdateCommandHandlerIntegrationTests(IntegrationTestFixture fixture)
        {
            _fixture = fixture;
            _createHandler = fixture.GetHandler<AccountCreateCommandHandler>();
            _updateHandler = fixture.GetHandler<AccountUpdateCommandHandler>();
        }

        [Fact]
        public async Task Update_WithBalanceChange_PersistsNameAndAdjustment()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var createResult = await _createHandler.Create(new AccountCreateCommand
            {
                Name = "Cuenta integration update",
                CurrencyCode = Currency.ARS.Code,
                Balance = 100,
                IncludeInBalanceGlobal = true,
                Icon = new IconDTO
                {
                    Code = "wallet",
                    ColorHex = "#FFFFFF"
                }
            }, cancellationToken);

            Assert.True(createResult.IsSuccess);
            Assert.NotNull(createResult.Value);

            var accountId = createResult.Value.Id;

            _fixture.SmartPocketContext.DiscardAllChanges();

            var command = new AccountUpdateCommand
            {
                Id = accountId,
                Name = "Cuenta actualizada integration",
                CurrencyCode = Currency.ARS.Code,
                Balance = 250,
                IncludeInBalanceGlobal = true,
                Icon = new IconDTO
                {
                    Code = "wallet",
                    ColorHex = "#FFFFFF"
                }
            };

            // Act
            var errors = await _updateHandler.Update(command, cancellationToken);

            // Assert
            Assert.True(errors.IsEmpty);

            _fixture.SmartPocketContext.DiscardAllChanges();

            var accountName = await _fixture.SmartPocketContext.Query<Account>()
                .Where(x => x.Id == accountId)
                .Select(x => x.Name)
                .FirstAsync(cancellationToken);

            Assert.Equal(command.Name, accountName);

            var balance = await _fixture.SmartPocketContext.Query<Transaction>()
                .Where(x => x.AccountId == accountId)
                .SumAsync(x => x.SignedAmount, cancellationToken);

            Assert.Equal(250m, balance);
        }
    }
}
