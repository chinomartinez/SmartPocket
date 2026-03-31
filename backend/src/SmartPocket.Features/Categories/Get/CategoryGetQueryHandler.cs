using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Categories.Get
{
    public class CategoryGetQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CategoryGetQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<List<CategoryGetDTO>> GetAll(CategoryGetQuery request, CancellationToken cancellationToken)
        {
            var list = await _smartPocketContext.Query<Category>()
                .Where(x => x.IsIncome == request.IsIncome)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Id)
                .Select(x => new CategoryGetDTO
                {
                    Icon = new()
                    {
                        Code = x.Icon.Code,
                        ColorHex = x.Icon.ColorHex,
                    },
                    Id = x.Id,
                    IsDefault = x.IsDefault,
                    IsIncome = x.IsIncome,
                    Name = x.Name,
                    SortOrder = x.SortOrder,
                })
                .ToListAsync(cancellationToken);

            return list;
        }
    }
}
