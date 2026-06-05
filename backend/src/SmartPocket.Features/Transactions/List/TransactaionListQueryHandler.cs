using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transactions.List
{
    public class TransactaionListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransactaionListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<List<TransactionListItemDTO>> Get(TransactionListRequest request,
            CancellationToken cancellation)
        {
            var query = _smartPocketContext.Query<Transaction>()
                .Where(x => x.IsSystemAdjustment == false)
                .Where(x => !x.TransferId.HasValue)
                .Where(x => x.CategoryId.HasValue)
                .Where(x => x.AccountId == request.AccountId)
                .Where(x => x.IsIncome == request.IsIncome)
                .Where(x => x.EffectiveDate >= request.From && x.EffectiveDate <= request.To);

            if (!string.IsNullOrEmpty(request.Search))
            {
                query = query.Where(x => x.Description != null && x.Description.Contains(request.Search));
            }

            var result = await query
                .OrderByDescending(x => x.EffectiveDate)
                .ThenByDescending(x => x.CreatedAt)
                .Select(x => new TransactionListItemDTO
                {
                    Id = x.Id,
                    Account = new()
                    {
                        Id = x.Account.Id,
                        Name = x.Account.Name,
                        Icon = new IconDTO()
                        {
                            Code = x.Account.Icon.Code,
                            ColorHex = x.Account.Icon.ColorHex,
                        }
                    },
                    Category = new()
                    {
                        Id = x.Category.Id,
                        Name = x.Category.Name,
                        Icon = new IconDTO()
                        {
                            Code = x.Category.Icon.Code,
                            ColorHex = x.Category.Icon.ColorHex,
                        }
                    },
                    Description = x.Description,
                    EffectiveDate = x.EffectiveDate,
                    IsIncome = x.IsIncome,
                    Money = new MoneyDTO
                    {
                        Amount = x.Amount,
                        CurrencyCode = x.Account.CurrencyCode
                    }
                })
                .ToListAsync(cancellation);

            return result;
        }
    }
}
