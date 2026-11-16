using FluentValidation;
using NSubstitute;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Accounts.Create;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Persistence;
using SmartPocket.Persistence.DatabaseTransactions;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.Accounts.Create
{
    public class AccountCreateCommandHandlerTests
    {
        [Fact]
        public async Task Create_WhenValidationFails_ReturnsErrorsWithoutTransaction()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var context = new FakeSmartPocketContext();

            var validator = new InlineValidator<AccountCreateCommand>();
            validator.RuleFor(x => x.Name).Must(_ => false).WithMessage("Nombre inválido");

            var handler = new AccountCreateCommandHandler(context, validator);
            var command = CreateCommand();

            // Act
            var result = await handler.Create(command, cancellationToken);

            // Assert
            Assert.True(result.IsFailure);
            Assert.Contains(result.Error, error => error.Message == "Nombre inválido");
            Assert.Empty(context.Saved<Account>());
            Assert.Empty(context.Saved<Transaction>());
            await context.Transaction.DidNotReceive().CommitAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Create_WithZeroBalance_AddsAccountWithoutAdjustment()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var context = new FakeSmartPocketContext();
            var handler = new AccountCreateCommandHandler(
                context,
                new InlineValidator<AccountCreateCommand>());

            // El fake no genera identidades; el id real se verifica en integración.
            var command = CreateCommand(balance: 0);

            // Act
            var result = await handler.Create(command, cancellationToken);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.NotNull(result.Value);

            var account = Assert.Single(context.Saved<Account>());
            Assert.Equal(command.Name, account.Name);
            Assert.True(account.IsPrincipal);
            Assert.Empty(context.Saved<Transaction>());
            await context.Transaction.Received(1).CommitAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Create_WhenSaveChangesFails_RollsBackAndRethrows()
        {
            var cancellationToken = TestContext.Current.CancellationToken;

            // Arrange
            var context = Substitute.For<ISmartPocketContext>();
            var transaction = Substitute.For<IDatabaseContextTransaction>();

            context.BeginTransactionAsync(Arg.Any<CancellationToken>())
                .Returns(Task.FromResult(transaction));

            var emptyAccounts = QueryableMocker.Empty<Account>();
            context.Query<Account>().Returns(emptyAccounts);

            context.SaveChangesAsync(Arg.Any<CancellationToken>())
                .Returns(Task.FromException<int>(new InvalidOperationException("save failed")));

            var handler = new AccountCreateCommandHandler(
                context,
                new InlineValidator<AccountCreateCommand>());

            var command = CreateCommand(balance: 0);

            // Act
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => handler.Create(command, cancellationToken));

            // Assert
            Assert.Equal("save failed", exception.Message);
            await transaction.Received(1).RollbackAsync(Arg.Any<CancellationToken>());
            await transaction.DidNotReceive().CommitAsync(Arg.Any<CancellationToken>());
        }

        private static AccountCreateCommand CreateCommand(
            decimal balance = 100,
            string name = "Cuenta nueva")
        {
            return new AccountCreateCommand
            {
                Name = name,
                CurrencyCode = "ARS",
                Balance = balance,
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
