using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardPurchases.Update
{
    public class CreditCardPurchaseUpdateCommandValidator : AbstractValidator<CreditCardPurchaseUpdateCommand>
    {
        public CreditCardPurchaseUpdateCommandValidator(ISmartPocketContext smartPocketContext)
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

            RuleFor(x => x.PurchaseAmount)
                .NotNull()
                .SetValidator(new MoneyDTOValidator());

            RuleFor(x => x.OriginalAmount)
                .GreaterThan(0)
                .When(x => x.IsInstallment);

            When(x => x.IsInstallment, () =>
            {
                RuleFor(x => x.Installments)
                    .NotEmpty()
                    .GreaterThanOrEqualTo(1);
            }).Otherwise(() =>
            {
                RuleFor(x => x.Installments)
                    .Null();
            });
        }
    }
}
