using FluentValidation;
using NSubstitute;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Accounts.Update;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Tests.Infrastructures;
using SmartPocket.Tests.TestData;

namespace SmartPocket.Tests.Features.Accounts.Update
{
    public class AccountUpdateCommandHandlerTests
    {
        [Fact]
        public async Task Update_WithExistingAccount_UpdatesNameAndSaves()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var account = AccountTestData.Create(id: 1, name: "Cuenta vieja");
            var context = new FakeSmartPocketContext().With(account);
            var handler = new AccountUpdateCommandHandler(
                context,
                new InlineValidator<AccountUpdateCommand>());

            var command = CreateCommand(id: account.Id, name: "Cuenta nueva");

            // Act
            var errors = await handler.Update(command, cancellationToken);

            // Assert
            Assert.True(errors.IsEmpty);
            Assert.Equal("Cuenta nueva", context.Saved<Account>().Single().Name);
            Assert.Empty(context.Saved<Transaction>());
        }

        [Fact]
        public async Task Update_WhenBalanceChanges_AddsAdjustmentTransaction()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var account = AccountTestData.Create(id: 7);
            var context = new FakeSmartPocketContext().With(account);
            var handler = new AccountUpdateCommandHandler(
                context,
                new InlineValidator<AccountUpdateCommand>());

            var command = CreateCommand(id: account.Id, balance: 250);

            // Act
            var errors = await handler.Update(command, cancellationToken);

            // Assert
            Assert.True(errors.IsEmpty);

            var adjustment = Assert.Single(context.Saved<Transaction>());
            Assert.Equal(account.Id, adjustment.AccountId);
            Assert.Equal(250, adjustment.SignedAmount);
            Assert.True(adjustment.IsSystemAdjustment);
        }

        [Fact]
        public async Task Update_WhenAccountDoesNotExist_ReturnsError()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var context = new FakeSmartPocketContext();
            var handler = new AccountUpdateCommandHandler(
                context,
                new InlineValidator<AccountUpdateCommand>());

            var command = CreateCommand(id: 99);

            // Act
            var errors = await handler.Update(command, cancellationToken);

            // Assert
            Assert.False(errors.IsEmpty);
            Assert.Contains(errors, error => error.Message.Contains("99"));
            Assert.Empty(context.Saved<Account>());
            Assert.Empty(context.Saved<Transaction>());
        }

        [Fact]
        public async Task Update_WhenValidationFails_ReturnsErrorsWithoutSaving()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var account = AccountTestData.Create(id: 1, name: "Cuenta original");
            var context = new FakeSmartPocketContext().With(account);

            var validator = new InlineValidator<AccountUpdateCommand>();
            validator.RuleFor(x => x.Name).Must(_ => false).WithMessage("Nombre inválido");

            var handler = new AccountUpdateCommandHandler(context, validator);
            var command = CreateCommand(id: account.Id, name: "Cuenta nueva");

            // Act
            var errors = await handler.Update(command, cancellationToken);

            // Assert
            Assert.False(errors.IsEmpty);
            Assert.Contains(errors, error => error.Message == "Nombre inválido");
            Assert.Equal("Cuenta original", context.Saved<Account>().Single().Name);
            Assert.Empty(context.Saved<Transaction>());
        }

        private static AccountUpdateCommand CreateCommand(
            int id,
            string name = "Cuenta actualizada",
            decimal balance = 0,
            string currencyCode = "ARS")
        {
            return new AccountUpdateCommand
            {
                Id = id,
                Name = name,
                Balance = balance,
                CurrencyCode = currencyCode,
                IncludeInBalanceGlobal = true,
                Icon = new IconDTO
                {
                    Code = "wallet",
                    ColorHex = "#FFFFFF"
                }
            };
        }
    }
}
