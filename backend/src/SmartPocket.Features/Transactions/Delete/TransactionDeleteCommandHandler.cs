using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Transactions.Delete
{
    public class TransactionDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<TransactionDeleteCommand> _validator;

        public TransactionDeleteCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<TransactionDeleteCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetailList> Delete(TransactionDeleteCommand command, CancellationToken cancellationToken)
        {
            var validations = await _validator.ValidateCommand(command, cancellationToken);
            if (validations.IsNotValid) return validations.Errors;

            var entity = await _smartPocketContext.Query<Transaction>()
                .FirstOrDefaultAsync(x => x.Id == command.Id, cancellationToken);

            if (entity is null)
            {
                validations.Errors.Add($"Transaction with id {command.Id} not found");
                return validations.Errors;
            }

            _smartPocketContext.DeleteEntity(entity);
            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return ErrorDetailList.Empty;
        }
    }
}
