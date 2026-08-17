using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardStatements.Create
{
    public class CreditCardStatementCreateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardStatementCreateCommand> _validator;

        public CreditCardStatementCreateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardStatementCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ResultWithErrors<int>> Create(CreditCardStatementCreateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            using var transaction = await _smartPocketContext.BeginTransactionAsync(cancellation);

            try
            {
                var installmentsResult = await GetInstallments(command, cancellation);
                if (installmentsResult.IsFailure)
                {
                    validations.Errors.Add(installmentsResult.Error);
                    return validations.Errors;
                }

                var statement = new CreditCardStatement(
                    creditCardId: command.CreditCardId,
                    description: command.Description);

                _smartPocketContext.AddEntity(statement);

                await _smartPocketContext.SaveChangesAsync(cancellation);

                foreach (var installment in installmentsResult.Value)
                {
                    installment.LinkToStatement(statement.Id);
                }

                var subscriptions = command.SubscriptionCharges
                    .Select(x => new CreditCardSubscriptionCharge(
                        creditCardSubscriptionId: x.SubscriptionId,
                        creditCardStatementId: statement.Id,
                        chargeNumber: x.ChargeNumber,
                        amount: x.Amount));

                _smartPocketContext.AddRange(subscriptions);

                await _smartPocketContext.SaveChangesAsync(cancellation);

                await transaction.CommitAsync(cancellation);

                return statement.Id;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync(cancellation);
                throw;
            }
            
        }

        private async Task<ResultWithError<List<CreditCardPurchaseInstallment>>> GetInstallments(CreditCardStatementCreateCommand command,
            CancellationToken cancellation)
        {
            var installments = await _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardPurchase.CreditCardId == command.CreditCardId)
                .Where(x => command.InstallmentIds.Contains(x.Id))
                .ToListAsync(cancellation);

            if (installments.Count != command.InstallmentIds.Length)
            {
                return $"{nameof(command.InstallmentIds)} invalid.";
            }

            if (installments.Any(x => x.CreditCardStatementId.HasValue))
            {
                return $"Existe cuotas asociadas a resumenes";
            }

            return installments;
        }
    }
}
