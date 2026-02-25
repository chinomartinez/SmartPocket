using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Configurations;
using SmartPocket.Features.Accounts.Create;
using SmartPocket.Features.Accounts.Update;
using SmartPocket.Persistence;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.AccountCRUD
{
    public class AccountCreateUpdateHandlerTest : IClassFixture<IntegrationTestFixture>
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly AccountCreateCommandHandler _accountCreateCommandHandler;
        private readonly AccountUpdateCommandHandler _accountUpdateCommandHandler;

        public AccountCreateUpdateHandlerTest(IntegrationTestFixture testFixture)
        {
            _smartPocketContext = testFixture.SmartPocketContext;
            _accountCreateCommandHandler = testFixture.GetHandler<AccountCreateCommandHandler>();
            _accountUpdateCommandHandler = testFixture.GetHandler<AccountUpdateCommandHandler>();
        }

        [Fact]
        public async Task CanCreate()
        {
            //Arrage
            var command = new AccountCreateCommand
            {
                CurrencyCode = Currency.ARS.Code,
                Icon = new()
                {
                    Code = "empty",
                    ColorHex = "#FFF"
                },
                Balance = 10000,
                Name = "Test Account",
            };

            //Act
            var result = await _accountCreateCommandHandler.Create(command, default);

            //Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);

            var newId = result.Value.Id;

            Assert.True(newId > 0);

            var list = await _smartPocketContext.Query<Account>()
                .Where(x => x.Id == newId)
                .ToListAsync();

            Assert.NotEmpty(list);
        }

        [Fact]
        public async Task CanUpdate()
        {
            //Arrage
            await CanCreate();

            _smartPocketContext.DiscardAllChanges();

            var id = await _smartPocketContext
                .Query<Account>()
                .Select(x => x.Id)
                .OrderByDescending(x => x)
                .FirstAsync();

            var command = new AccountUpdateCommand
            {
                CurrencyCode = Currency.ARS.Code,
                Icon = new()
                {
                    Code = "empty",
                    ColorHex = "#FFF"
                },
                Id = id,
                Balance = 100,
                Name = "Account Update test"
            };

            var errors = await _accountUpdateCommandHandler.Update(command, default);

            //Assert
            Assert.Empty(errors);            

            var currentName = await _smartPocketContext
                .Query<Account>()
                .Where(x => x.Id == id)
                .Select(x => x.Name)
                .FirstAsync();

            Assert.Equal(currentName, command.Name);
        }
    }
}
