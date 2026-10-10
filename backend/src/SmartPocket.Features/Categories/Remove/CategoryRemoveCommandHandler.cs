using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.Categories.Remove
{
    public class CategoryRemoveCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CategoryRemoveCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<SimpleResult<ErrorDetail>> Remove(int id, CancellationToken cancellationToken)
        {
            var entity = await _smartPocketContext.Query<Category>()
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            if (entity is null) 
                return new ErrorDetail($"No existe categoria con Id '{id}'.");

            _smartPocketContext.DeleteEntity(entity);

            await _smartPocketContext.SaveChangesAsync(cancellationToken);

            return SimpleResult<ErrorDetail>.Success();
        }
    }
}
