using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Accounts.Create
{
    public class AccountCreateValidator : AbstractValidator<AccountCreateCommand>
    {
        public AccountCreateValidator(ISmartPocketContext context)
        {
            RuleFor(x => x.CurrencyCode).CurrencyValidations();

            RuleFor(x => x.Name)
                .CascadeStop()
                .Apply(AccountCoreValidations.NameValidations)
                .MustAsync(async (name, cancel) =>
                {
                    var exist = await context.Query<Account>()
                        .Where(x => x.Name == name)
                        .AnyAsync(cancel);

                    return !exist;
                })
                .WithMessage("Existe una o más cuentas con el mismo nombre '{{PropertyName}}'.");

            RuleFor(x => x.Icon).SetValidator(new IconDTOValidator());

            RuleFor(x => x.Balance)
                .Apply(AccountCoreValidations.BalanceValidations);
        }
    }
}
