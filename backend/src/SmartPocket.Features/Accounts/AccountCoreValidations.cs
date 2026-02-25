using FluentValidation;

namespace SmartPocket.Features.Accounts
{
    internal static class AccountCoreValidations
    {
        internal static IRuleBuilderOptions<T, string> NameValidations<T>(IRuleBuilder<T, string> ruleBuilder)
        {
            return ruleBuilder
                .NotEmpty()
                .MaximumLength(100);
        }

        internal static IRuleBuilderOptions<T, decimal> BalanceValidations<T>(IRuleBuilder<T, decimal> ruleBuilder)
        {
            return ruleBuilder.GreaterThanOrEqualTo(0);
        }
    }
}
