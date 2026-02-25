using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Accounts.Update
{
    public class AccountUpdateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<AccountUpdateCommand> _validator;

        public AccountUpdateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<AccountUpdateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetails> Update(AccountUpdateCommand request,
            CancellationToken cancellationToken)
        {
            var validation = await _validator.ValidateCommand(request);
            if (validation.IsNotValid) return validation.Errors;

            var entity = await _smartPocketContext.FindAsyncOrThrow<Account>(request.Id, cancellationToken);

            entity.Update(
                name: request.Name,
                icon: request.Icon.ToDomainIcon(),
                currencyCode: request.CurrencyCode,
                includeInBalanceGlobal: request.IncludeInBalanceGlobal);

            var currentBalance = await _smartPocketContext.Query<Transaction>()
                .Where(t => t.AccountId == request.Id)
                .SumAsync(t => t.SignedAmount, cancellationToken);

            if (currentBalance != request.Balance)
            {
                var newAdjustment = request.Balance - currentBalance;

                var adjustmentTransaction = Transaction.CreateSystemAdjustment(
                    accountId: entity.Id,
                    currencyCode: entity.CurrencyCode,
                    amount: newAdjustment,
                    description: "Balance adjustment");

                _smartPocketContext.AddEntity(adjustmentTransaction);
            }

            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return ErrorDetails.Empty;
        }
    }
}
