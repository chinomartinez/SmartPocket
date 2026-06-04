using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transfers;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transfers
{
    public class TransferExistsByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransferExistsByIdQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<bool> Exists(int id, CancellationToken cancellation)
        {
            return _smartPocketContext.Query<Transfer>()
                .AnyAsync(x => x.Id == id, cancellation);
        }
    }
}
