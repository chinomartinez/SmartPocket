using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCards.Delete
{
    public class CreditCardDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardDeleteCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<Result<ErrorDetail>> Delete(int id, CancellationToken cancellation)
        {
            var entity = await _smartPocketContext.Query<CreditCard>()
                .FirstOrDefaultAsync(x => x.Id == id, cancellation);

            if (entity is null)
            {
                return new ErrorDetail($"Credit card with id {id} not found.");
            }

            _smartPocketContext.DeleteEntity(entity);
            await _smartPocketContext.SaveChangesAsync(cancellation);

            return Result<ErrorDetail>.Success();
        }
    }
}
