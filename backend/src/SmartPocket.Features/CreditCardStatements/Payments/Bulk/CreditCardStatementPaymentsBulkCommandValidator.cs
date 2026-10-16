using FluentValidation;
using SmartPocket.Features.Shared.Validators;

namespace SmartPocket.Features.CreditCardStatements.Payments.Bulk
{
    public class CreditCardStatementPaymentsBulkCommandValidator
        : AbstractValidator<CreditCardStatementPaymentsBulkCommand>
    {
        public CreditCardStatementPaymentsBulkCommandValidator()
        {
            RuleFor(x => x.StatementId)
                .GreaterThan(0);

            RuleFor(x => x.Payments)
                .NotNull()
                .Must(payments => payments is null ||
                    payments.Select(x => x.CoveredCurrencyCode).Distinct().Count() == payments.Length)
                .WithMessage("No puede existir más de un pago por moneda cubierta.")
                .Must(payments => payments is null ||
                    payments.Where(x => x.Id.HasValue).Select(x => x.Id!.Value).Distinct().Count() == payments.Count(x => x.Id.HasValue))
                .WithMessage("Los pagos no deben contener IDs duplicados.")
                .ForEach(x => x.SetValidator(new CreditCardStatementPaymentUpdateItemValidator()));
        }
    }

    internal class CreditCardStatementPaymentUpdateItemValidator
        : AbstractValidator<CreditCardStatementPaymentUpdateItem>
    {
        public CreditCardStatementPaymentUpdateItemValidator()
        {
            RuleFor(x => x.Id)
                .Must(id => !id.HasValue || id.Value > 0)
                .WithMessage("El ID del pago debe ser mayor que 0.");

            RuleFor(x => x.AccountId)
                .GreaterThan(0);

            RuleFor(x => x.Amount)
                .GreaterThan(0);

            RuleFor(x => x.EffectiveDate)
                .Must(x => x != default)
                .WithMessage("La fecha efectiva es obligatoria.")
                .Must(x => x <= DateTime.UtcNow)
                .WithMessage("La fecha efectiva no puede ser futura.");

            RuleFor(x => x.CoveredCurrencyCode)
                .CurrencyValidations();
        }
    }
}
