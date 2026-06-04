using FluentValidation;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transfers.Update
{
    public class TransferUpdateCommandValidator : AbstractValidator<TransferUpdateCommand>
    {
        public TransferUpdateCommandValidator(ISmartPocketContext smartPocketContext)
        {
            RuleFor(x => x.Id).GreaterThan(0);

            RuleFor(x => x.Amount)
                .GreaterThan(0)
                .WithMessage("El monto debe ser mayor que cero.");

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage("La descripción no puede exceder los 1000 caracteres.");

            RuleFor(x => x.OriginAccountId)
                .CascadeStop()
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<Account>());

            RuleFor(x => x.DestinationAccountId)
                .CascadeStop()
                .GreaterThan(0)
                .ExistById(smartPocketContext.Query<Account>());

            RuleFor(x => x.EffectiveDate)
                .CascadeStop()
                .NotEmpty()
                .GreaterThan(DateTime.MinValue)
                .WithMessage("La fecha efectiva debe ser una fecha válida.")
                .LessThanOrEqualTo(DateTime.UtcNow)
                .WithMessage("La fecha efectiva no puede ser en el futuro.");
        }
    }
}
