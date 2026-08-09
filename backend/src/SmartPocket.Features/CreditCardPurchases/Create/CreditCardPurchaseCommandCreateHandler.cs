using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardPurchases.Create
{
    public class CreditCardPurchaseCommandCreateHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardPurchaseCreateCommand> _validator;

        public CreditCardPurchaseCommandCreateHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardPurchaseCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<Result<CreditCardPurchaseCreateResponse, ErrorDetailList>> Create(CreditCardPurchaseCreateCommand command,
            CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var entity = new CreditCardPurchase(
                creditCardId: command.CreditCardId,
                categoryId: command.CategoryId,
                description: command.Description,
                effectiveDate: command.EffectiveDate,
                currencyCode: command.PurchaseAmount.CurrencyCode,
                amount: command.PurchaseAmount.Amount,
                installmentCount: command.Installments);

            _smartPocketContext.AddEntity(entity);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return new CreditCardPurchaseCreateResponse(Id: entity.Id);
        }
    }
}
