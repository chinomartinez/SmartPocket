using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardSubscriptions.Create
{
    public class CreditCardSubscriptionCommandCreateHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardSubscriptionCreateCommand> _validator;

        public CreditCardSubscriptionCommandCreateHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardSubscriptionCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<Result<CreditCardSubscriptionCreateResponse, ErrorDetailList>> Create(CreditCardSubscriptionCreateCommand command,
            CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var entity = new CreditCardSubscription(
                creditCardId: command.CreditCardId,
                categoryId: command.CategoryId,
                description: command.Description,
                effectiveDate: command.EffectiveDate,
                currencyCode: command.SubscriptionAmount.CurrencyCode,
                initialAmount: command.SubscriptionAmount.Amount);

            _smartPocketContext.AddEntity(entity);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return new CreditCardSubscriptionCreateResponse(Id: entity.Id);
        }
    }
}
