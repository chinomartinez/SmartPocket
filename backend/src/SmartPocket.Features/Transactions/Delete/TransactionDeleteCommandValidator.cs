using FluentValidation;

namespace SmartPocket.Features.Transactions.Delete
{
    public class TransactionDeleteCommandValidator : AbstractValidator<TransactionDeleteCommand>
    {
        public TransactionDeleteCommandValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Transaction Id debe ser mayor que 0.");
        }
    }
}
