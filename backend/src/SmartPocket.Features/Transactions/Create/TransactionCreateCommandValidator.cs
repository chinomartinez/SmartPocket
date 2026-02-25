using FluentValidation;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transactions.Create
{
    public class TransactionCreateCommandValidator : AbstractValidator<TransactionCreateCommand>
    {
        public TransactionCreateCommandValidator(ISmartPocketContext smartPocketContext)
        {
            RuleFor(x => x.AccountId)
                .CascadeStop()
                .NotEmpty()
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<Account>());

            RuleFor(x => x.CategoryId)
                .CascadeStop()
                .NotEmpty()
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<Category>());

            RuleFor(x => x.AccountMoney).SetValidator(new MoneyDTOValidator());

            RuleFor(x => x.EffectiveDate)
                .NotEmpty()
                .GreaterThan(DateTime.MinValue)
                .WithMessage("Effective date must be a valid date and greater than the minimum date.");

            RuleFor(x => x.Description)
                .MaximumLength(300);
        }
    }
}
