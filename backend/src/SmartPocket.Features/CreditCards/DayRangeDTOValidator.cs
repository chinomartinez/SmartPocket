using FluentValidation;

namespace SmartPocket.Features.CreditCards
{
    public class DayRangeDTOValidator : AbstractValidator<DayRangeDTO>
    {
        public DayRangeDTOValidator()
        {
            RuleFor(x => x.StartDay)
                .InclusiveBetween(1, 31);

            RuleFor(x => x.EndDay)
                .InclusiveBetween(1, 31);
        }
    }
}
