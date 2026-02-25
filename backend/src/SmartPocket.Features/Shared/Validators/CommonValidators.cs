using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Features.Shared.Validators
{
    public static class CommonValidators
    {
        public static IRuleBuilderOptions<T, int> SetIdValidations<T, TEntity>(
            this IRuleBuilderInitial<T, int> ruleBuilderInitial,
            IQueryable<TEntity> query)
            where T : class
            where TEntity : BaseEntity<int>
        {
            return ruleBuilderInitial
                .CascadeStop()
                .GreaterThan(0)
                .ExistById(query);
        }

        public static IRuleBuilderOptions<T, TProperty> ExistById<T, TProperty, TEntity>(
            this IRuleBuilder<T, TProperty> ruleBuilder,
            IQueryable<TEntity> query)
            where T : class
            where TEntity : BaseEntity<TProperty>
        {
            var builder = ruleBuilder.MustAsync(async (value, cancel) =>
            {
                var result = await query.AnyAsync(x => x.Id != null && x.Id.Equals(value), cancel);

                return result;
            });

            return builder.WithMessage((x, value) =>
            {
                var name = typeof(TEntity).Name;
                return $"There is no entity '{name}' with Id '{value}'.";
            });
        }

        public static IRuleBuilderInitial<T, TProperty> CascadeStop<T, TProperty>(
            this IRuleBuilderInitial<T, TProperty> ruleBuilderInitial)
        {
            return ruleBuilderInitial.Cascade(CascadeMode.Stop);
        }

        public static IRuleBuilderOptions<T, TProperty> Apply<T, TProperty>(
            this IRuleBuilder<T, TProperty> ruleBuilder,
            Func<IRuleBuilder<T, TProperty>, IRuleBuilderOptions<T, TProperty>> applyAction)
        {
            return applyAction(ruleBuilder);
        }

        public static IRuleBuilderOptions<T, string> CurrencyValidations<T>(this IRuleBuilderInitial<T, string> ruleBuilderInitial)
        {
            return ruleBuilderInitial
                .CascadeStop()
                .NotEmpty()
                .Length(3)
                .Must(value => value.All(char.IsUpper))
                    .WithMessage("Currency code must be 3 uppercase letters.");
        }
    }
}
