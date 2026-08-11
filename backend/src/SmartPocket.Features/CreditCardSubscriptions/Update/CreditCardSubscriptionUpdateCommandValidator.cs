using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardSubscriptions.Update
{
    public class CreditCardSubscriptionUpdateCommandValidator : AbstractValidator<CreditCardSubscriptionUpdateCommand>
    {
        public CreditCardSubscriptionUpdateCommandValidator(ISmartPocketContext smartPocketContext)
        {
            RuleFor(x => x.Id).GreaterThan(0);

            RuleFor(x => x.CreditCardId)
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<CreditCard>());

            RuleFor(x => x.CategoryId)
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<Category>());

            RuleFor(x => x.Description)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.EffectiveDate)
                .NotEmpty()
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow));

            RuleFor(x => x.SubscriptionAmount)
                .NotNull()
                .SetValidator(new MoneyDTOValidator());
        }
    }
}
