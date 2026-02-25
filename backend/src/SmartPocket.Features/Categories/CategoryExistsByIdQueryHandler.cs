using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Categories
{
    public class CategoryExistsByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CategoryExistsByIdQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<bool> Exists(int id, CancellationToken cancellation)
        {
            var result = await _smartPocketContext.Query<Category>()
                .AnyAsync(x => x.Id == id, cancellation);

            return result;
        }
    }
}
