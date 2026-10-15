using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.CreditCardStatements.Payments.Update
{
    public class CreditCardStatementPaymentsUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardStatementPaymentsUpdateCommand> _validator;

        public CreditCardStatementPaymentsUpdateCommandHandler(
            ISmartPocketContext smartPocketContext,
            IValidator<CreditCardStatementPaymentsUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Update(
            CreditCardStatementPaymentsUpdateCommand command,
            CancellationToken cancellation)
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
                .ToListAsync(cancellation);

            var itemCurrencies = await GetItemCurrencies(statement.Id, cancellation);
            var paymentCurrencies = command.Payments
                .Select(x => x.CoveredCurrencyCode)
                .ToHashSet(StringComparer.Ordinal);

            var validationError = await ValidateSynchronization(
                statement,
                payments,
                itemCurrencies,
                paymentCurrencies,
                command.Payments,
                cancellation);

            if (validationError is not null)
            {
                return validationError;
            }

            var paymentsById = payments.ToDictionary(x => x.Id);
            var desiredPaymentIds = command.Payments
                .Where(x => x.Id.HasValue)
                .Select(x => x.Id!.Value)
                .ToHashSet();

            foreach (var payment in payments.Where(x => !desiredPaymentIds.Contains(x.Id)))
            {
                _smartPocketContext.DeleteEntity(payment);
                _smartPocketContext.DeleteEntity(payment.Transaction);
            }

            foreach (var desiredPayment in command.Payments)
            {
                if (desiredPayment.Id is int paymentId)
                {
                    paymentsById[paymentId].Update(
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

        private async Task<ErrorDetailList?> ValidateSynchronization(
            CreditCardStatement statement,
            IReadOnlyCollection<CreditCardStatementPayment> payments,
            IReadOnlyCollection<string> itemCurrencies,
            IReadOnlySet<string> paymentCurrencies,
            IReadOnlyCollection<CreditCardStatementPaymentUpdateItem> desiredPayments,
            CancellationToken cancellation)
        {
            var existingPaymentIds = payments
                .Select(x => x.Id)
                .ToHashSet();

            var unknownPaymentId = desiredPayments
                .Where(x => x.Id.HasValue)
                .Select(x => x.Id!.Value)
                .FirstOrDefault(id => !existingPaymentIds.Contains(id));

            if (unknownPaymentId != 0)
            {
                return new ErrorDetailList(
                    $"El pago con ID {unknownPaymentId} no existe o no pertenece al resumen especificado.");
            }

            var unknownCurrency = paymentCurrencies
                .FirstOrDefault(currency => !itemCurrencies.Contains(currency));

            if (unknownCurrency is not null)
            {
                return new ErrorDetailList(
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
                return new ErrorDetailList("Una o más cuentas no existen.");
            }

            var invalidDate = desiredPayments
                .FirstOrDefault(x => x.EffectiveDate <= statement.ClosingDate);

            if (invalidDate is not null)
            {
                return new ErrorDetailList(
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
