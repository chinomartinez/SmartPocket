using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.CreditCardSubscriptions.Update
{
    public class CreditCardSubscriptionUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardSubscriptionUpdateCommand> _validator;

        public CreditCardSubscriptionUpdateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardSubscriptionUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Update(CreditCardSubscriptionUpdateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var entity = await _smartPocketContext.Query<CreditCardSubscription>()
                .Where(x => x.Id == command.Id)
                .FirstOrDefaultAsync(cancellation);

            if (entity is null)
            {
                var notFoundError = $"Credit card Subscription with id {command.Id} not found.";
                return new ErrorDetailList(notFoundError);
            }

            entity.Update(
                creditCardId: command.CreditCardId,
                categoryId: command.CategoryId,
                description: command.Description,
                effectiveDate: command.EffectiveDate,
                currencyCode: command.SubscriptionAmount.CurrencyCode,
                initialAmount: command.SubscriptionAmount.Amount);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }
    }
}
