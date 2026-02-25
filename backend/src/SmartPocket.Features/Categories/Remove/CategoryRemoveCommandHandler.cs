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

        public async Task<Result<ErrorDetail>> Remove(CategoryRemoveCommand request, CancellationToken cancellationToken)
        {
            var entity = await _smartPocketContext.FindAsync<Category>(request.Id, cancellationToken);

            if (entity is null) 
                return new ErrorDetail($"No existe categoria con Id '{request.Id}'.");

            await _smartPocketContext.DeleteAndSaveChangesAsync(entity, cancellationToken);

            return Result<ErrorDetail>.Success();
        }
    }
}
