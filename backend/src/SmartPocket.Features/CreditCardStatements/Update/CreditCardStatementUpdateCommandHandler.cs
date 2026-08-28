using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.CreditCardStatements.Update
{
    public class CreditCardStatementUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardStatementUpdateCommand> _validator;

        public CreditCardStatementUpdateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardStatementUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Update(CreditCardStatementUpdateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var statement = await _smartPocketContext.Query<CreditCardStatement>()
                    .Include(x => x.Installments)
                    .Include(x => x.SubscriptionCharges)
                    .Where(x => x.Id == command.Id)
                    .FirstOrDefaultAsync(cancellation);

            if (statement is null)
            {
                var notFoundError = $"Credit card Statement with id {command.Id} not found.";
                return new ErrorDetailList(notFoundError);
            }

            if (statement.CreditCardId != command.CreditCardId)
            {
                return new ErrorDetailList("No se puede cambiar la tarjeta del resumen.");
            }

            statement.Update(command.Description, command.ClosingDate);

            var installmentsError = await SyncInstallments(statement, command, cancellation);
            if (installmentsError is not null) return installmentsError;

            var chargesError = await SyncSubscriptionCharges(statement, command, cancellation);
            if (chargesError is not null) return chargesError;

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }

        private async Task<ErrorDetailList?> SyncInstallments(CreditCardStatement statement,
            CreditCardStatementUpdateCommand command,
            CancellationToken cancellation)
        {
            var desiredInstallmentIds = new HashSet<int>(command.InstallmentIds);

            foreach (var installment in statement.Installments.Where(x => !desiredInstallmentIds.Contains(x.Id)))
            {
                installment.UnlinkFromStatement();
            }

            var linkedInstallmentIds = statement.Installments.Select(x => x.Id);
            var installmentIdsToAdd = command.InstallmentIds
                .Except(linkedInstallmentIds)
                .ToArray();

            if (installmentIdsToAdd.Length == 0) return null;

            var installmentsToAdd = await _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardPurchase.CreditCardId == statement.CreditCardId)
                .Where(x => installmentIdsToAdd.Contains(x.Id))
                .ToListAsync(cancellation);

            if (installmentsToAdd.Count != installmentIdsToAdd.Length)
            {
                return new ErrorDetailList("Alguna cuota no existe o no pertenece a la tarjeta del resumen.");
            }

            var linkedToOtherStatement = installmentsToAdd.Any(x => x.CreditCardStatementId.HasValue);

            if (linkedToOtherStatement)
            {
                return new ErrorDetailList("Existen cuotas asociadas a otros resúmenes.");
            }

            foreach (var installment in installmentsToAdd)
            {
                installment.LinkToStatement(statement.Id);
            }

            return null;
        }

        private async Task<ErrorDetailList?> SyncSubscriptionCharges(CreditCardStatement statement,
            CreditCardStatementUpdateCommand command,
            CancellationToken cancellation)
        {
            var desiredIds = command.SubsChargesForUpdate.Select(x => x.Id).ToHashSet();

            _smartPocketContext.DeleteRange(statement.SubscriptionCharges.Where(x => !desiredIds.Contains(x.Id)));

            var existingChargesById = statement.SubscriptionCharges.ToDictionary(x => x.Id);

            foreach (var desiredCharge in command.SubsChargesForUpdate)
            {
                var existingCharge = existingChargesById[desiredCharge.Id];
                
                existingCharge.Update(desiredCharge.ChargeNumber, desiredCharge.Amount);
            }

            var chargesToAdd = command.SubsChargesForCreate
                .Select(x => new CreditCardSubscriptionCharge(
                    creditCardSubscriptionId: x.SubscriptionId,
                    creditCardStatementId: statement.Id,
                    chargeNumber: x.ChargeNumber,
                    amount: x.Amount))
                .ToArray();

            var anyDuplicatedCharges = existingChargesById
                .Values
                .Where(x => desiredIds.Contains(x.Id)) // Considerar solo los cargos existentes que se están actualizando. Los eliminados no se consideran
                .Concat(chargesToAdd)
                .GroupBy(x => new { x.CreditCardSubscriptionId, x.ChargeNumber })
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .Any();
            
            if (anyDuplicatedCharges)
            {
                return new ErrorDetailList("En este resumen se intenta agregar cargos duplicados para la misma suscripción y número de cargo.");
            }

            if (chargesToAdd.Length > 0)
            {
                _smartPocketContext.AddRange(chargesToAdd);
            }

            return null;
        }
    }
}
