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

            RuleFor(x => x.DueDate)
                .Must(x => x != default)
                .WithMessage("La fecha de vencimiento es obligatoria.");

            RuleFor(x => x.InstallmentIds)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(id => id > 0))
                .WithMessage("Todos los IDs de las cuotas deben ser mayores que 0.")
                .Must(x => x.Distinct().Count() == x.Length)
                .WithMessage("Los IDs de las cuotas no deben contener duplicados.")
                .MustAsync(async(command, ids, cancellation) =>
                {
                    if (command.CreditCardId <= 0 || ids.Length == 0) return true;

                    var count = await _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                        .Where(x => x.CreditCardPurchase.CreditCardId == command.CreditCardId)
                        .Where(x => ids.Contains(x.Id))
                        .CountAsync(cancellation);

                    return count == ids.Length;
                })
                .WithMessage("Uno o mas IDs de las cuotas no existen o no estan asociadas a la tarjeta de credito especificada.");

            RuleFor(x => x.SubsChargesForUpdate)
                .CascadeStop()
                .NotNull()
                .Must(x => x.All(sc => sc.Id > 0 && sc.ChargeNumber > 0 && sc.Amount > 0))
                .WithMessage("Todos los cargos de suscripción deben tener un Id, ChargeNumber y Amount validos.")
                .Must(charges =>
                {
                    var duplicates = charges
                        .GroupBy(sc => sc.Id)
                        .Where(g => g.Count() > 1)
                        .Select(g => g.Key)
                        .ToList();

                    return duplicates.Count == 0;
                })
                .WithMessage("Los cargos de subscripcion no deben contener IDs duplicados.")
                .MustAsync(async(command, charges, cancellation) =>
                {
                    var ids = charges.Select(x => x.Id).ToHashSet();

                    if (ids.Count == 0) return true;

                    var existingChargesCount = await _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                        .Where(c => ids.Contains(c.Id))
                        .Where(c => c.CreditCardStatementId == command.Id)
                        .CountAsync(cancellation);

                    return existingChargesCount == ids.Count;
                })
                .WithMessage("Uno o más cargos de suscripción no existen o no pertenecen al resumen especificado.");


            RuleFor(x => x.SubsChargesForCreate)
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
