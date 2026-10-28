using SmartPocket.Features.CreditCardStatements.Payments.Bulk;
using SmartPocket.Features.CreditCardStatements.Update;
using SmartPocket.Features.Transactions.Create;
using SmartPocket.Features.Transfers.Create;
using SmartPocket.Tests.Infrastructures;

namespace SmartPocket.Tests.Features.DateOnlyValidation
{
    public class DateOnlyValidatorTest : IClassFixture<IntegrationTestFixture>
    {
        private static readonly DateOnly Today = DateOnly.FromDateTime(DateTime.UtcNow);

        private readonly IntegrationTestFixture _testFixture;

        public DateOnlyValidatorTest(IntegrationTestFixture testFixture)
        {
            _testFixture = testFixture;
        }

        [Fact]
        public async Task TransactionValidator_AcceptsToday()
        {
            var validator = new TransactionCreateCommandValidator(_testFixture.SmartPocketContext);
            var command = CreateTransactionCommand(Today);

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.DoesNotContain(result.Errors,
                error => error.PropertyName == nameof(TransactionCreateCommand.EffectiveDate));
        }

        [Fact]
        public async Task TransactionValidator_RejectsFutureDate()
        {
            var validator = new TransactionCreateCommandValidator(_testFixture.SmartPocketContext);
            var command = CreateTransactionCommand(Today.AddDays(1));

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.Contains(result.Errors,
                error => error.PropertyName == nameof(TransactionCreateCommand.EffectiveDate));
        }

        [Fact]
        public async Task TransactionValidator_RejectsDefaultDate()
        {
            var validator = new TransactionCreateCommandValidator(_testFixture.SmartPocketContext);
            var command = CreateTransactionCommand(DateOnly.MinValue);

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.Contains(result.Errors,
                error => error.PropertyName == nameof(TransactionCreateCommand.EffectiveDate));
        }

        [Fact]
        public async Task TransferValidator_AcceptsToday()
        {
            var validator = new TransferCreateCommandValidator(_testFixture.SmartPocketContext);
            var command = CreateTransferCommand(Today);

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.DoesNotContain(result.Errors,
                error => error.PropertyName == nameof(TransferCreateCommand.EffectiveDate));
        }

        [Fact]
        public async Task TransferValidator_RejectsFutureDate()
        {
            var validator = new TransferCreateCommandValidator(_testFixture.SmartPocketContext);
            var command = CreateTransferCommand(Today.AddDays(1));

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.Contains(result.Errors,
                error => error.PropertyName == nameof(TransferCreateCommand.EffectiveDate));
        }

        [Fact]
        public async Task StatementValidator_RejectsDueDateBeforeClosingDate()
        {
            var validator = new CreditCardStatementUpdateCommandValidator(_testFixture.SmartPocketContext);
            var command = CreateStatementCommand(
                closingDate: new DateOnly(2026, 10, 21),
                dueDate: new DateOnly(2026, 10, 21));

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.Contains(result.Errors,
                error => error.PropertyName == nameof(CreditCardStatementUpdateCommand.DueDate));
        }

        [Fact]
        public async Task StatementValidator_AcceptsDueDateAfterClosingDate()
        {
            var validator = new CreditCardStatementUpdateCommandValidator(_testFixture.SmartPocketContext);
            var command = CreateStatementCommand(
                closingDate: new DateOnly(2026, 10, 21),
                dueDate: new DateOnly(2026, 11, 5));

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.DoesNotContain(result.Errors,
                error => error.PropertyName == nameof(CreditCardStatementUpdateCommand.DueDate));
        }

        [Fact]
        public async Task PaymentValidator_AcceptsToday()
        {
            var validator = new CreditCardStatementPaymentsBulkCommandValidator();
            var command = CreatePaymentCommand(Today);

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.True(result.IsValid);
        }

        [Fact]
        public async Task PaymentValidator_RejectsFutureDate()
        {
            var validator = new CreditCardStatementPaymentsBulkCommandValidator();
            var command = CreatePaymentCommand(Today.AddDays(1));

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.Contains(result.Errors, error => error.PropertyName.EndsWith("EffectiveDate"));
        }

        [Fact]
        public async Task PaymentValidator_RejectsDefaultDate()
        {
            var validator = new CreditCardStatementPaymentsBulkCommandValidator();
            var command = CreatePaymentCommand(DateOnly.MinValue);

            var result = await validator.ValidateAsync(command, TestContext.Current.CancellationToken);

            Assert.Contains(result.Errors, error => error.PropertyName.EndsWith("EffectiveDate"));
        }

        private static TransactionCreateCommand CreateTransactionCommand(DateOnly effectiveDate) =>
            new()
            {
                AccountId = 1,
                CategoryId = 1,
                Amount = 100,
                EffectiveDate = effectiveDate,
                IsIncome = false
            };

        private static TransferCreateCommand CreateTransferCommand(DateOnly effectiveDate) =>
            new()
            {
                Amount = 100,
                OriginAccountId = 1,
                DestinationAccountId = 2,
                EffectiveDate = effectiveDate
            };

        private static CreditCardStatementUpdateCommand CreateStatementCommand(
            DateOnly closingDate,
            DateOnly dueDate) =>
            new()
            {
                Id = 1,
                CreditCardId = 1,
                Description = "Resumen",
                ClosingDate = closingDate,
                DueDate = dueDate,
                InstallmentIds = [],
                SubsChargesForUpdate = [],
                SubsChargesForCreate = []
            };

        private static CreditCardStatementPaymentsBulkCommand CreatePaymentCommand(DateOnly effectiveDate) =>
            new()
            {
                StatementId = 1,
                Payments =
                [
                    new CreditCardStatementPaymentUpdateItem
                    {
                        AccountId = 1,
                        Amount = 100,
                        EffectiveDate = effectiveDate,
                        CoveredCurrencyCode = "ARS"
                    }
                ]
            };
    }
}
