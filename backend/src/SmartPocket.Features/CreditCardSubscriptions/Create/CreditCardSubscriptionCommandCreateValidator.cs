using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardSubscriptions.Create
{
    public class CreditCardSubscriptionCommandCreateValidator : AbstractValidator<CreditCardSubscriptionCreateCommand>
    {
        public CreditCardSubscriptionCommandCreateValidator(ISmartPocketContext smartPocketContext)
        {
            RuleLevelCascadeMode = CascadeMode.Stop;

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
