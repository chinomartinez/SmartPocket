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

            RuleFor(x => x.ClosingDate)
                .Must(x => x != default)
                .WithMessage("La fecha de cierre es obligatoria.");

            RuleFor(x => x.DueDate)
                .Must(x => x != default)
                .WithMessage("La fecha de vencimiento es obligatoria.");

            RuleFor(x => x.InstallmentIds)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(id => id > 0))
                .WithMessage("Todos los IDs de las cuotas deben ser mayores que 0.")
                .Must(ids => ids.Distinct().Count() == ids.Length)
                .WithMessage("Los IDs de las cuotas no deben contener duplicados.");

            RuleFor(x => x.SubscriptionCharges)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(sc => sc.SubscriptionId > 0 && sc.ChargeNumber > 0 && sc.Amount > 0))
                    .WithMessage("Todos los cargos de suscripción deben tener un SubscriptionId, ChargeNumber y Amount válidos.")
                .Must(charges => charges.Select(sc => (sc.SubscriptionId, sc.ChargeNumber)).Distinct().Count() == charges.Length)
                    .WithMessage("Los cargos de suscripción no deben contener duplicados en la combinación de SubscriptionId y ChargeNumber.")
                .CustomAsync(async (charges, ctx, cancellation) =>
                {
                    var command = ctx.InstanceToValidate;
                    var subscriptionIds = charges.Select(sc => sc.SubscriptionId).Distinct().ToArray();

                    if (subscriptionIds.Length == 0) return;

                    var existingSubscriptions = await _smartPocketContext.Query<CreditCardSubscription>()
                        .Where(s => s.CreditCardId == command.CreditCardId)
                        .Where(s => subscriptionIds.Contains(s.Id))
                        .Select(s => new { s.Id })
                        .CountAsync(cancellation);

                    if (existingSubscriptions != subscriptionIds.Length)
                    {
                        ctx.AddFailure("Uno o más IDs de suscripción no existen en BD o no estan asociados a la tarjeta de credito especificada.");
                    }

                    var chargeNumbers = charges.Select(sc => sc.ChargeNumber).ToArray();

                    var existingDuplicates = await _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                        .Where(c => c.CreditCardSubscription.CreditCardId == command.CreditCardId)
                        .Where(c => subscriptionIds.Contains(c.CreditCardSubscriptionId))
                        .Where(c => chargeNumbers.Contains(c.ChargeNumber))
                        .CountAsync(cancellation);

                    if (existingDuplicates > 0)
                    {
                        ctx.AddFailure("Uno o más números de cargo de suscripción estan asociados a resumenes existentes.");
                    }
                });

        }
    }
}
