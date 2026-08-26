using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardStatements.Update
{
    public class CreditCardStatementUpdateCommandValidator : AbstractValidator<CreditCardStatementUpdateCommand>
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementUpdateCommandValidator(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;

            RuleFor(x => x.Id)
                .GreaterThan(0);

            RuleFor(x => x.CreditCardId)
                .GreaterThan(0);

            RuleFor(x => x.Description)
                .CascadeStop()
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.ClosingDate)
                .CascadeStop()
                .Must(x => x != default)
                .WithMessage("La fecha de cierre es obligatoria.");

            RuleFor(x => x.InstallmentIds)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(id => id > 0))
                .WithMessage("Todos los IDs de las cuotas deben ser mayores que 0.")
                .Must(x => x.Distinct().Count() == x.Length)
                .WithMessage("Los IDs de las cuotas no deben contener duplicados.");

            RuleFor(x => x.SubscriptionCharges)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(sc => sc.SubscriptionId > 0 && sc.ChargeNumber > 0 && sc.Amount > 0))
                .WithMessage("Todos los cargos de suscripción deben tener un SubscriptionId, ChargeNumber y Amount válidos.")
                .Must(x => x.All(sc => !sc.Id.HasValue || sc.Id.Value > 0))
                .WithMessage("Todos los IDs de los cargos de suscripción deben ser mayores que 0.")
                .Custom((charges, ctx) =>
                {
                    var hasDuplicatedIds = charges
                        .Where(sc => sc.Id.HasValue)
                        .GroupBy(sc => sc.Id!.Value)
                        .Any(g => g.Count() > 1);

                    if (hasDuplicatedIds)
                    {
                        ctx.AddFailure("Los cargos de suscripción no deben contener IDs duplicados.");
                    }

                    var duplicateKeys = charges
                        .GroupBy(sc => new { sc.SubscriptionId, sc.ChargeNumber })
                        .Where(g => g.Count() > 1)
                        .ToList();

                    if (duplicateKeys.Count > 0)
                    {
                        ctx.AddFailure("Los cargos de suscripción no deben contener pares duplicados de SubscriptionId y ChargeNumber.");
                    }
                })
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
                        ctx.AddFailure("Uno o más IDs de suscripción no existen en la base de datos.");
                    }

                    var chargeNumbers = charges.Select(sc => sc.ChargeNumber).ToArray();

                    var existingDuplicates = await _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                        .Where(c => subscriptionIds.Contains(c.CreditCardSubscriptionId))
                        .Where(c => chargeNumbers.Contains(c.ChargeNumber))
                        .Where(c => c.CreditCardStatementId != ctx.InstanceToValidate.Id)
                        .CountAsync(cancellation);

                    if (existingDuplicates > 0)
                    {
                        ctx.AddFailure("Uno o más números de cargo de suscripción existen en otros resúmenes.");
                    }
                });
        }
    }
}
