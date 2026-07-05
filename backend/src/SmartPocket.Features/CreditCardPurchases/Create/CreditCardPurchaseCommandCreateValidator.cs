using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardPurchases.Create
{
    public class CreditCardPurchaseCommandCreateValidator : AbstractValidator<CreditCardPurchaseCreateCommand>
    {
        public CreditCardPurchaseCommandCreateValidator(ISmartPocketContext smartPocketContext)
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

                When(x => x.InstallmentNumberStart.HasValue, () =>
                {
                    RuleFor(x => x.InstallmentNumberStart)
                        .GreaterThanOrEqualTo(1)
                        .LessThan(x => x.Installments.GetValueOrDefault(1));
                });

            }).Otherwise(() =>
            {
                RuleFor(x => x.Installments)
                    .Null();
            });
        }
    }
}
