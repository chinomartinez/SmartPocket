using FluentValidation;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transactions.Update
{
    public class TransactionUpdateCommandValidator : AbstractValidator<TransactionUpdateCommand>
    {
        public TransactionUpdateCommandValidator(ISmartPocketContext smartPocketContext)
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<Transaction>());

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

            RuleFor(x => x.Amount)
                .NotEmpty()
                .GreaterThan(0);

            RuleFor(x => x.EffectiveDate)
                .NotEmpty()
                .GreaterThan(DateTime.MinValue)
                    .WithMessage("{EffectiveDate} debe ser una fecha válida y mayor que la fecha mínima.")
                .LessThanOrEqualTo(DateTime.UtcNow)
                    .WithMessage("{EffectiveDate} no puede ser una fecha futura.");

            RuleFor(x => x.Description)
                .MaximumLength(300);
        }
    }
}
