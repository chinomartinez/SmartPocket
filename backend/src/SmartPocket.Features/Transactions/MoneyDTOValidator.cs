using FluentValidation;

namespace SmartPocket.Features.Transactions
{
    public class MoneyDTOValidator : AbstractValidator<MoneyDTO>
    {
        public MoneyDTOValidator()
        {
            RuleFor(x => x.Amount)
                .NotEmpty()
                .GreaterThan(0);

            RuleFor(x => x.CurrencyCode)
                .NotEmpty()
                .Length(3, 3);
        }
    }
}
