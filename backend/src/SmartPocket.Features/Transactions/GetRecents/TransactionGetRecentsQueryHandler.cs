using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transactions.GetRecents
{
    public class TransactionGetRecentsQueryHandler : IHandler
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
                    Account =  new AccountRecentTransactionItemDTO
                    {
                        Id = t.Account.Id,
                        Name = t.Account.Name,
                        Icon = new()
                        {
                            Code = t.Account.Icon.Code,
                            ColorHex = t.Account.Icon.ColorHex,
                        },
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
                    Money = new MoneyDTO
                    {
                        Amount = t.AccountMoney.Amount,
                        CurrencyCode = t.AccountMoney.CurrencyCode,
                    },
                })
                .OrderByDescending(t => t.EffectiveDate)
                .Take(request.Count)
                .ToListAsync(cancellation);


            return transactions;
        }
    }
}
