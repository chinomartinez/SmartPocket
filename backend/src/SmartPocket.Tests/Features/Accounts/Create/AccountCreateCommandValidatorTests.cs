using FluentValidation.TestHelper;
using SmartPocket.Features.Accounts.Create;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Tests.Infrastructures;
using SmartPocket.Tests.TestData;

namespace SmartPocket.Tests.Features.Accounts.Create
{
    public class AccountCreateCommandValidatorTests
    {
        [Fact]
        public async Task Validate_WithValidCommand_ReturnsNoErrors()
        {
            var cancellationToken = TestContext.Current.CancellationToken;
            var validator = new AccountCreateCommandValidator(new FakeSmartPocketContext());

            var result = await validator.TestValidateAsync(
                CreateCommand(),
                cancellationToken: cancellationToken);

            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public async Task Validate_WithEmptyName_ReturnsErrorForName()
        {
            var cancellationToken = TestContext.Current.CancellationToken;
            var validator = new AccountCreateCommandValidator(new FakeSmartPocketContext());

            var result = await validator.TestValidateAsync(
                CreateCommand(name: string.Empty),
                cancellationToken: cancellationToken);

            result.ShouldHaveValidationErrorFor(x => x.Name);
        }

        [Fact]
        public async Task Validate_WhenNameAlreadyExists_ReturnsErrorForName()
        {
            var cancellationToken = TestContext.Current.CancellationToken;
            var context = new FakeSmartPocketContext()
                .With(AccountTestData.Create(name: "Caja existente"));
            var validator = new AccountCreateCommandValidator(context);

            var result = await validator.TestValidateAsync(
                CreateCommand(name: "Caja existente"),
                cancellationToken: cancellationToken);

            result.ShouldHaveValidationErrorFor(x => x.Name);
        }

        [Fact]
        public async Task Validate_WithInvalidCurrencyCode_ReturnsErrorForCurrencyCode()
        {
            var cancellationToken = TestContext.Current.CancellationToken;
            var validator = new AccountCreateCommandValidator(new FakeSmartPocketContext());

            var result = await validator.TestValidateAsync(
                CreateCommand(currencyCode: "ars"),
                cancellationToken: cancellationToken);

            result.ShouldHaveValidationErrorFor(x => x.CurrencyCode);
        }

        [Fact]
        public async Task Validate_WithNegativeBalance_ReturnsErrorForBalance()
        {
            var cancellationToken = TestContext.Current.CancellationToken;
            var validator = new AccountCreateCommandValidator(new FakeSmartPocketContext());

            var result = await validator.TestValidateAsync(
                CreateCommand(balance: -1),
                cancellationToken: cancellationToken);

            result.ShouldHaveValidationErrorFor(x => x.Balance);
        }

        private static AccountCreateCommand CreateCommand(
            string name = "Cuenta nueva",
            string currencyCode = "ARS",
            decimal balance = 0)
        {
            return new AccountCreateCommand
            {
                Name = name,
                CurrencyCode = currencyCode,
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
