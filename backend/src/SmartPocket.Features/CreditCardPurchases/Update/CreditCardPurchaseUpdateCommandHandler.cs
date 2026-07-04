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
                var notFoundError = $"Credit card purchase with id {command.Id} not found.";
                return new ErrorDetailList(notFoundError);
            }

            var newPurchaseType = command.IsInstallment
                ? CreditCardPurchaseType.Installment
                : CreditCardPurchaseType.Subscription;

            var updated = entity.TryUpdate(
                creditCardId: command.CreditCardId,
                categoryId: command.CategoryId,
                description: command.Description,
                effectiveDate: command.EffectiveDate,
                currencyCode: command.PurchaseAmount.CurrencyCode,
                amount: command.PurchaseAmount.Amount,
                purchaseType: newPurchaseType,
                installmentCount: command.Installments,
                error: out var error);

            if (!updated)
            {
                return new ErrorDetailList(error);
            }

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }
    }
}
