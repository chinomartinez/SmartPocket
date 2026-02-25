using FluentValidation;

namespace SmartPocket.Features.Categories
{
    internal static class CategoryCoreValidations
    {
        internal static IRuleBuilderOptions<T, string> NameValidations<T>(IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder
                .NotEmpty()
                .MaximumLength(100);
        }
    }
}
