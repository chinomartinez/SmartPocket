using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Categories.GetById
{
    public class CategoryGetByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CategoryGetByIdQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<CategoryGetByIdDTO?> TryGet(int id, CancellationToken cancellationToken)
        {
            var result = await _smartPocketContext.Query<Category>()
                .Where(x => x.Id == id)
                .Select(x => new CategoryGetByIdDTO
                {
                    Id = x.Id,
                    Icon = new()
                    {
                        Code = x.Icon.Code,
                        ColorHex = x.Icon.ColorHex,
                    },
                    IsDefault = x.IsDefault,
                    IsIncome = x.IsIncome,
                    Name = x.Name,
                })
                .FirstOrDefaultAsync(cancellationToken);

            return result;
        }
    }
}
