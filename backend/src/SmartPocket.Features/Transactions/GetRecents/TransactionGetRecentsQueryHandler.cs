using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transactions.GetRecents
{
    public class TransactionGetRecentsQueryHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransactionGetRecentsQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<List<RecentTransactionItemDTO>> Get(TransactionGeRecentsRequest request,
            CancellationToken cancellation)
        {
            var transactions = await _smartPocketContext.Query<Transaction>()
                .Where(x => !x.IsSystemAdjustment)
                .Select(t => new RecentTransactionItemDTO
                {
                    Id = t.Id,
                    Description = t.Description,
                    EffectiveDate = t.EffectiveDate,
                    IsIncome = t.IsIncome,
                    Money = new MoneyDTO
                    {
                        Amount = t.AccountMoney.Amount,
                        CurrencyCode = t.AccountMoney.CurrencyCode,
                    },
                    Category = new CategoryRecentTransactionItemDTO
                    {
                        Id = t.Category.Id,
                        Name = t.Category.Name,
                        Icon = new()
                        {
                            Code = t.Category.Icon.Code,
                            ColorHex = t.Category.Icon.ColorHex,
                        },
                        IsIncome = t.Category.IsIncome,
                    },                    
                })
                .OrderByDescending(t => t.EffectiveDate)
                .Take(request.Count)
                .ToListAsync(cancellation);


            return transactions;
        }
    }
}
