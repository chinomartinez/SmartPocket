using FluentValidation;
using SmartPocket.Domain.Accounts;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.Accounts.Create
{
    public class AccountCreateCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<AccountCreateCommand> _validator;

        public AccountCreateCommandHandler(ISmartPocketContext smartPocketContext,
            IValidator<AccountCreateCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ResultWithErrors<AccountCreateResponse>> Create(AccountCreateCommand request,
            CancellationToken cancellationToken)
        {
            var validation = await _validator.ValidateCommand(request);
            if (validation.IsNotValid) return validation.Errors;

            var account = new Account(
                name: request.Name,
                icon: request.Icon.ToDomainIcon(),
                currencyCode: request.CurrencyCode,
                initialBalance: request.Balance,
                includeInBalanceGlobal: request.IncludeInBalanceGlobal);            

            if (request.Balance != 0)
            {
                var transaction = Transaction.CreateSystemAdjustment(accountId: account.Id,
                    currencyCode: account.CurrencyCode,
                    amount: request.Balance,
                    description: "Initial balance");

                account.Transactions.Add(transaction);
            }

            _smartPocketContext.AddEntity(account);

            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return new AccountCreateResponse(account.Id);
        }
    }
}
