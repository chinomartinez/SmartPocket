using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.CreditCardPurchases.Update
{
    public class CreditCardPurchaseUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardPurchaseUpdateCommand> _validator;

        public CreditCardPurchaseUpdateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardPurchaseUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Update(CreditCardPurchaseUpdateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var entity = await _smartPocketContext.Query<CreditCardPurchase>()
                .Include(x => x.Installments)
                .Where(x => x.Id == command.Id)
                .FirstOrDefaultAsync(cancellation);

            if (entity is null)
            {
                var error = $"Credit card purchase with id {command.Id} not found.";
                return new ErrorDetailList(error);
            }

            if (entity.PurchaseType == CreditCardPurchaseType.Installment && !command.IsInstallment)
            {
                if (entity.Installments.Any(x => x.CreditCardStatementId.HasValue))
                {
                    var error = "No se puede cambiar una compra en cuotas a suscripción si alguna de sus cuotas" +
                        " está asociada a un resumen cerrado o pagado.";
                    return new ErrorDetailList(error);
                }
            }

            if (entity.Status == CreditCardPurchaseStatus.PaidOff)
            {
                var error = "No se puede actualizar una compra con estado 'PaidOff'.";
                return new ErrorDetailList(error);
            }

            if (entity.Status == CreditCardPurchaseStatus.Cancelled)
            {
                var error = "No se puede actualizar una compra con estado 'Cancelled'.";
                return new ErrorDetailList(error);
            }

            entity.Update(
                creditCardId: command.CreditCardId,
                categoryId: command.CategoryId,
                description: command.Description,
                effectiveDate: command.EffectiveDate,
                currencyCode: command.PurchaseAmount.CurrencyCode,
                amount: command.PurchaseAmount.Amount,
                purchaseType: command.IsInstallment ? CreditCardPurchaseType.Installment : CreditCardPurchaseType.Subscription,
                installmentCount: command.Installments);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }
    }
}
