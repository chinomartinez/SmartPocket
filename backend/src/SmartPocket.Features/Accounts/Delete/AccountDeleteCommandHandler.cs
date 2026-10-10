using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Accounts;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.Accounts.Delete
{
    public class AccountDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public AccountDeleteCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<SimpleResult<ErrorDetail>> SoftDelete(int id, CancellationToken cancellation)
        {
            var account = await _smartPocketContext.Query<Account>()
                .FirstOrDefaultAsync(a => a.Id == id, cancellation);

            if (account == null)
            {
                return new ErrorDetail($"Cuenta con ID {id} no encontrada.");
            }

            _smartPocketContext.DeleteEntity(account);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return SimpleResult<ErrorDetail>.Success();
        }
    }
}
