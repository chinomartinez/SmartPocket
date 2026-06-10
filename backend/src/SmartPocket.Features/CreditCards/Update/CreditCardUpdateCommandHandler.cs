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
                var error = $"Credit card with id {command.Id} not found.";
                validations.Errors.Add(error);

                return validations.Errors;
            }

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }
    }
}
