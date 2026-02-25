using FluentValidation;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.Transactions.Create
{
    public class TransactionCreateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<TransactionCreateCommand> _validator;

        public TransactionCreateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<TransactionCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ResultWithErrors<int>> Create(TransactionCreateCommand request, CancellationToken cancellationToken)
        {
            var validations = await _validator.ValidateCommand(request, cancellationToken);
            if (validations.IsNotValid) return validations.Errors;

            var entity = new Transaction(
                accountId: request.AccountId,
                categoryId: request.CategoryId,
                accountMoney: request.AccountMoney.ToDomainMoney(),
                effectiveDate: request.EffectiveDate,
                isIncome: request.IsIncome,
                description: request.Description);

            await _smartPocketContext.AddAndSaveChangesAsync(entity, cancellationToken);

            return entity.Id;
        }
    }
}
