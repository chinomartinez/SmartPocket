using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transfers;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.Transfers.Delete
{
    public class TransferDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransferDeleteCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<Result<ErrorDetail>> Delete(int id, CancellationToken cancellation)
        {
            var transfer = await _smartPocketContext.Query<Transfer>()
                .Where(t => t.Id == id)
                .FirstOrDefaultAsync(cancellation);

            if (transfer is null)
            {
                return new ErrorDetail($"Transfer with id {id} not found.");
            }

            _smartPocketContext.DeleteEntity(transfer);

            await _smartPocketContext.SaveChangesAsync(cancellation);

            return Result<ErrorDetail>.Success();
        }
    }
}
