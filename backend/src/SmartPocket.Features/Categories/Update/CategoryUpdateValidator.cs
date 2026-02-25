using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Categories.Update
{
    public class CategoryUpdateValidator : AbstractValidator<CategoryUpdateCommand>
    {
        public CategoryUpdateValidator(ISmartPocketContext context)
        {
            RuleFor(x => x.Id).SetIdValidations(context.Query<Category>());

            RuleFor(x => x.Name)
                .CascadeStop()
                .Apply(CategoryCoreValidations.NameValidations)
                .MustAsync(async (command, name, cancel) =>
                {
                    var exist = await context.Query<Category>()
                        .Where(x => x.Name == name)
                        .Where(x => x.IsIncome == command.IsIncome)
                        .Where(x => x.Id != command.Id)
                        .AnyAsync(cancel);

                    return !exist;
                })
                .WithMessage("Hay una o más categorías con el mismo nombre '{{PropertyName}}'."); ;

            RuleFor(x => x.Icon).SetValidator(new IconDTOValidator());
        }
    }
}
