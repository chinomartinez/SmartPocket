using FluentValidation;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Transactions.Update
{
    public class TransactionUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<TransactionUpdateCommand> _validator;

        public TransactionUpdateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<TransactionUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetails> Update(TransactionUpdateCommand request, CancellationToken cancellationToken)
        {
            var validations = await _validator.ValidateCommand(request, cancellationToken);
            if (validations.IsNotValid) return validations.Errors;

            var entity = await _smartPocketContext.FindAsyncOrThrow<Transaction>(request.Id, cancellationToken);

            entity.Update(
                accountId: request.AccountId,
                categoryId: request.CategoryId,
                accountMoney: request.AccountMoney.ToDomainMoney(),
                effectiveDate: request.EffectiveDate,
                isIncome: request.IsIncome,
                description: request.Description);            

            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return ErrorDetails.Empty;
        }
    }
}
