using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transfers;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Transfers.Update
{
    public class TransferUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<TransferUpdateCommand> _validator;

        public TransferUpdateCommandHandler(ISmartPocketContext smartPocketContext, IValidator<TransferUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Update(TransferUpdateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var transfer = await _smartPocketContext.Query<Transfer>()
                .Include(x => x.OriginTransaction)
                .Include(x => x.DestinationTransaction)
                .Where(x => x.Id == command.Id)
                .FirstOrDefaultAsync(cancellation);

            if (transfer is null)
            {
                validations.Errors.Add($"Transfer with ID {command.Id} not found.");
                return validations.Errors;
            }

            transfer.Update(
                originAccountId: command.OriginAccountId,
                destinationAccountId: command.DestinationAccountId,
                amount: command.Amount,
                effectiveDate: command.EffectiveDate,
                description: command.Description);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return ErrorDetailList.Empty;
        }
    }
}
