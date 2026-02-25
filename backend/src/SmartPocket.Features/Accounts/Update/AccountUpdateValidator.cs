using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Accounts.Update
{
    public class AccountUpdateValidator : AbstractValidator<AccountUpdateCommand>
    {
        public AccountUpdateValidator(ISmartPocketContext context)
        {
            RuleFor(x => x.Id).SetIdValidations(context.Query<Account>());

            RuleFor(x => x.Icon).SetValidator(new IconDTOValidator());

            RuleFor(x => x.CurrencyCode).CurrencyValidations();

            RuleFor(x => x.Name)
                .CascadeStop()
                .Apply(AccountCoreValidations.NameValidations)
                .MustAsync(async (command, name, cancel) =>
                {
                    var exist = await context.Query<Account>()
                        .Where(x => x.Name == name)
                        .Where(x => x.Id != command.Id)
                        .AnyAsync(cancel);

                    return !exist;
                })
                .WithMessage("Existe una o más cuentas con el mismo nombre '{{PropertyName}}'.");

            RuleFor(x => x.Balance)
                .Apply(AccountCoreValidations.BalanceValidations);
        }
    }
}
