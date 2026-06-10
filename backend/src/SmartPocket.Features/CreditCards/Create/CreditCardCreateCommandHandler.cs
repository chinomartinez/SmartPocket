using FluentValidation;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCards.Create
{
    public class CreditCardCreateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardCreateCommand> _validator;

        public CreditCardCreateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<Result<CreditCardCreateResponse, ErrorDetailList>> Create(CreditCardCreateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var entity = new CreditCard(
                name: command.Name,
                icon: command.Icon.ToDomainIcon(),
                currencyCode: command.CurrencyCode,
                creditLimit: command.CreditLimit,
                statementClosingDay: command.StatementClosingDay,
                paymentDueDay: command.PaymentDueDay);

            _smartPocketContext.AddEntity(entity);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return new CreditCardCreateResponse(entity.Id);
        }
    }
}
