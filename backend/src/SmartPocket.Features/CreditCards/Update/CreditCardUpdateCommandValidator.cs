using FluentValidation;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.Shared.Validators;

namespace SmartPocket.Features.CreditCards.Update
{
    public class CreditCardUpdateCommandValidator : AbstractValidator<CreditCardUpdateCommand>
    {
        public CreditCardUpdateCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .GreaterThan(0);

            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Icon)
                .NotNull()
                .SetValidator(new IconDTOValidator());

            RuleFor(x => x.CurrencyCode).CurrencyValidations();

            RuleFor(x => x.CreditLimit)
                .GreaterThanOrEqualTo(0);

            RuleFor(x => x.StatementClosingRange)
                .NotNull()
                .SetValidator(new DayRangeDTOValidator());

            RuleFor(x => x.PaymentDueRange)
                .NotNull()
                .SetValidator(new DayRangeDTOValidator());
        }
    }
}
