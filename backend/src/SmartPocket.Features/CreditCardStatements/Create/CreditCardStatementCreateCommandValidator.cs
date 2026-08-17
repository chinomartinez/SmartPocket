using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardStatements.Create
{
    public class CreditCardStatementCreateCommandValidator : AbstractValidator<CreditCardStatementCreateCommand>
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementCreateCommandValidator(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;

            RuleFor(x => x.CreditCardId)
                .CascadeStop()
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<CreditCard>());

            RuleFor(x => x.Description)
                .CascadeStop()
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.InstallmentIds)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(id => id > 0))
                .WithMessage("All installment IDs must be greater than 0.");

            RuleFor(x => x.SubscriptionCharges)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(sc => sc.SubscriptionId > 0 && sc.ChargeNumber > 0 && sc.Amount > 0))
                .WithMessage("All subscription charges must have valid SubscriptionId, ChargeNumber, and Amount.")
                .CustomAsync(async (charges, ctx, cancellation) =>
                {
                    var subscriptionIds = charges.Select(sc => sc.SubscriptionId).Distinct().ToArray();

                    if (subscriptionIds.Length == 0) return;

                    var existingSubscriptions = await _smartPocketContext.Query<CreditCardSubscription>()
                        .Where(s => subscriptionIds.Contains(s.Id))
                        .Select(s => new { s.Id })
                        .CountAsync(cancellation);

                    if (existingSubscriptions != subscriptionIds.Length)
                    {
                        ctx.AddFailure("One or more subscription IDs do not exist in the database.");
                    }

                    var chargeNumbers = charges.Select(sc => sc.ChargeNumber).ToArray();

                    var existingDuplicates = await _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                        .Where(c => subscriptionIds.Contains(c.CreditCardSubscriptionId) && chargeNumbers.Contains(c.ChargeNumber))
                        .Select(c => new { c.CreditCardSubscriptionId, c.ChargeNumber })
                        .CountAsync(cancellation);

                    if (existingDuplicates > 0)
                    {
                        ctx.AddFailure("One or more subscription charges numbers already exist in the database.");
                    }
                });

        }
    }
}
