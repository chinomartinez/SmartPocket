using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.CreditCards.Update
{
    public class CreditCardUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<CreditCardUpdateCommand> _validator;

        public CreditCardUpdateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<CreditCardUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Update(CreditCardUpdateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var entity = await _smartPocketContext.Query<CreditCard>()
                .FirstOrDefaultAsync(x => x.Id == command.Id, cancellation);

            if (entity is null)
            {
                return new ErrorDetailList($"Tarjeta de crédito con ID {command.Id} no encontrada.");
            }

            entity.Update(
                name: command.Name,
                icon: command.Icon.ToDomainIcon(),
                currencyCode: command.CurrencyCode,
                creditLimit: command.CreditLimit,
                statementClosingRange: new DayRange(
                    command.StatementClosingRange.StartDay,
                    command.StatementClosingRange.EndDay),
                paymentDueRange: new DayRange(
                    command.PaymentDueRange.StartDay,
                    command.PaymentDueRange.EndDay));

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }
    }
}
