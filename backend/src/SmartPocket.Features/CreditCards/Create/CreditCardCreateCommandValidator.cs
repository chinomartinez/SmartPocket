using FluentValidation;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.Shared.Validators;

namespace SmartPocket.Features.CreditCards.Create
{
    public class CreditCardCreateCommandValidator : AbstractValidator<CreditCardCreateCommand>
    {
        public CreditCardCreateCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(100);

            RuleFor(x => x.Icon)
                .NotNull()
                .SetValidator(new IconDTOValidator());

            RuleFor(x => x.CurrencyCode).CurrencyValidations();

            RuleFor(x => x.CreditLimit)
                .GreaterThanOrEqualTo(0);

            RuleFor(x => x.StatementClosingDay)
                .InclusiveBetween(1, 31);

            RuleFor(x => x.PaymentDueDay)
                .InclusiveBetween(1, 31);
        }
    }
}
