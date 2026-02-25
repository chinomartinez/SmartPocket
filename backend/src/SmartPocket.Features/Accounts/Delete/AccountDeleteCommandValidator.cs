using FluentValidation;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Accounts.Delete
{
    public class AccountDeleteCommandValidator : AbstractValidator<AccountDeleteCommand>
    {
        public AccountDeleteCommandValidator(ISmartPocketContext context)
        {
            RuleFor(x => x.Id)
                .CascadeStop()
                .NotEmpty()
                .GreaterThan(0)
                .ExistById(context.Query<Account>());
        }
    }
}
