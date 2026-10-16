using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.CreditCardStatements.Payments.Bulk
{
    public class CreditCardStatementPaymentsBulkCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardStatementPaymentsBulkCommand> _validator;

        public CreditCardStatementPaymentsBulkCommandHandler(
            ISmartPocketContext smartPocketContext,
            IValidator<CreditCardStatementPaymentsBulkCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Update(CreditCardStatementPaymentsBulkCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid)
            {
                return validations.Errors;
            }

            var statement = await _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => x.Id == command.StatementId)
                .FirstOrDefaultAsync(cancellation);

            if (statement is null)
            {
                return new ErrorDetailList($"Resumen de tarjeta de crédito con ID {command.StatementId} no encontrado.");
            }

            var payments = await _smartPocketContext.Query<CreditCardStatementPayment>()
                .Where(x => x.CreditCardStatementId == statement.Id)
                .Include(x => x.Transaction)
                .ToDictionaryAsync(x => x.Id, cancellation);

            var itemCurrencies = await GetItemCurrencies(statement.Id, cancellation);
            var paymentCurrencies = command.Payments
                .Select(x => x.CoveredCurrencyCode)
                .ToHashSet(StringComparer.Ordinal);

            var validationError = await ValidateSynchronization(
                statement: statement,
                existingPaymentIds: payments.Keys.ToHashSet(),
                itemCurrencies: itemCurrencies,
                paymentCurrencies: paymentCurrencies,
                desiredPayments: command.Payments,
                cancellation: cancellation);

            if (validationError.HasValue)
            {
                return new ErrorDetailList(validationError.Value);
            }
            var desiredPaymentIds = command.Payments
                .Where(x => x.Id.HasValue)
                .Select(x => x.Id!.Value)
                .ToHashSet();

            foreach (var payment in payments.Where(x => !desiredPaymentIds.Contains(x.Value.Id)))
            {
                _smartPocketContext.DeleteEntity(payment.Value);
                _smartPocketContext.DeleteEntity(payment.Value.Transaction);
            }

            foreach (var desiredPayment in command.Payments)
            {
                if (desiredPayment.Id is int paymentId)
                {
                    var payment = payments[paymentId];

                    payment.Update(
                        accountId: desiredPayment.AccountId,
                        amount: desiredPayment.Amount,
                        effectiveDate: desiredPayment.EffectiveDate,
                        coveredCurrencyCode: desiredPayment.CoveredCurrencyCode);
                }
                else
                {
                    var payment = new CreditCardStatementPayment(
                        creditCardStatementId: statement.Id,
                        accountId: desiredPayment.AccountId,
                        amount: desiredPayment.Amount,
                        effectiveDate: desiredPayment.EffectiveDate,
                        coveredCurrencyCode: desiredPayment.CoveredCurrencyCode);

                    _smartPocketContext.AddEntity(payment);
                }
            }

            statement.UpdatePaymentStatus(
                hasPayments: command.Payments.Length > 0,
                allItemCurrenciesCovered: itemCurrencies.All(paymentCurrencies.Contains));

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }

        private async Task<ErrorDetail?> ValidateSynchronization(
            CreditCardStatement statement,
            ISet<int> existingPaymentIds,
            IReadOnlyCollection<string> itemCurrencies,
            IReadOnlySet<string> paymentCurrencies,
            IReadOnlyCollection<CreditCardStatementPaymentUpdateItem> desiredPayments,
            CancellationToken cancellation)
        {
            var unknownPaymentId = desiredPayments
                .Where(x => x.Id.HasValue)
                .Select(x => x.Id!.Value)
                .FirstOrDefault(id => !existingPaymentIds.Contains(id));

            if (unknownPaymentId != 0)
            {
                return new ErrorDetail(
                    $"El pago con ID {unknownPaymentId} no existe o no pertenece al resumen especificado.");
            }

            var unknownCurrency = paymentCurrencies
                .FirstOrDefault(currency => !itemCurrencies.Contains(currency));

            if (unknownCurrency is not null)
            {
                return new ErrorDetail(
                    $"La moneda cubierta '{unknownCurrency}' no existe entre los items del resumen.");
            }

            var accountIds = desiredPayments
                .Select(x => x.AccountId)
                .Distinct()
                .ToArray();

            var existingAccountCount = await _smartPocketContext.Query<Account>()
                .Where(x => accountIds.Contains(x.Id))
                .CountAsync(cancellation);

            if (existingAccountCount != accountIds.Length)
            {
                return new ErrorDetail("Una o más cuentas no existen.");
            }

            var invalidDate = desiredPayments
                .FirstOrDefault(x => x.EffectiveDate <= statement.ClosingDate);

            if (invalidDate is not null)
            {
                return new ErrorDetail(
                    "La fecha efectiva de cada pago debe ser posterior a la fecha de cierre del resumen.");
            }

            return null;
        }

        private async Task<List<string>> GetItemCurrencies(
            int statementId,
            CancellationToken cancellation)
        {
            var installmentCurrencies = _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardStatementId == statementId)
                .Select(x => x.CreditCardPurchase.CurrencyCode);

            var chargeCurrencies = _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                .Where(x => x.CreditCardStatementId == statementId)
                .Select(x => x.CreditCardSubscription.CurrencyCode);

            return await installmentCurrencies
                .Concat(chargeCurrencies)
                .Distinct()
                .ToListAsync(cancellation);
        }
    }
}
