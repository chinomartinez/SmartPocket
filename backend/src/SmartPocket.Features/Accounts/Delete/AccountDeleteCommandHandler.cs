using FluentValidation;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Validators;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Accounts.Delete
{
    public class AccountDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;
        private readonly IValidator<AccountDeleteCommand> _validator;

        public AccountDeleteCommandHandler(ISmartPocketContext smartPocketContext, IValidator<AccountDeleteCommand> validator)
        {
            _smartPocketContext = smartPocketContext;
            _validator = validator;
        }

        public async Task<ErrorDetails> SoftDelete(AccountDeleteCommand command, CancellationToken cancellation)
        {
            var validations = await _validator.ValidateCommand(command, cancellation);
            if (validations.IsNotValid) return validations.Errors;

            var account = await _smartPocketContext.FindAsyncOrThrow<Account>(command.Id, cancellation);
            
            await _smartPocketContext.DeleteAndSaveChangesAsync(account, cancellation);

            return ErrorDetails.Empty;
        }
    }
}
