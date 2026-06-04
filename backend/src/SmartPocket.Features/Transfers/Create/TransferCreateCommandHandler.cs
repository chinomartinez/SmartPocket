using FluentValidation;
using SmartPocket.Domain.Transactions;
using SmartPocket.Domain.Transfers;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.Transfers.Create
{
    public class TransferCreateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<TransferCreateCommand> _validator;

        public TransferCreateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<TransferCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ResultWithErrors<int>> Create(TransferCreateCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var transfer = new Transfer(
                originAccountId: command.OriginAccountId,
                destinationAccountId: command.DestinationAccountId,
                amount: command.Amount,
                effectiveDate: command.EffectiveDate,
                description: command.Description);

            _smartPocketContext.AddEntity(transfer);
            await _smartPocketContext.SaveChangesAsync(cancellation);

            return transfer.Id;
        }
    }
}
