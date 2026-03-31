using FluentValidation;

namespace SmartPocket.Features.Categories.Reorder
{
    public class CategoryReorderValidator : AbstractValidator<CategoryReorderCommand>
    {
        public CategoryReorderValidator()
        {
            RuleFor(x => x.Items)
                .NotEmpty()
                .WithMessage("La lista de categorías a reordenar no puede estar vacía.");

            RuleFor(x => x.Items)
                .Must(items => items.Select(i => i.Id).Distinct().Count() == items.Count)
                .When(x => x.Items.Count > 0)
                .WithMessage("No se permiten IDs duplicados en la lista de reordenamiento.");

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.Id)
                    .GreaterThan(0)
                    .WithMessage("El ID de categoría debe ser mayor a 0.");

                item.RuleFor(i => i.SortOrder)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("El SortOrder debe ser mayor o igual a 0.");
            });
        }
    }
}
