using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transactions;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transactions.GetById
{
    public class TransactionGetByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransactionGetByIdQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<TransactionGetByIdDTO?> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _smartPocketContext.Query<Transaction>()
                .Where(x => x.Id == id)
                .Select(x => new TransactionGetByIdDTO
                {
                    Id = x.Id,
                    AccountId = x.AccountId,
                    AccountMoney = new MoneyDTO
                    {
                        Amount = x.AccountMoney.Amount,
                        CurrencyCode = x.AccountMoney.CurrencyCode
                    },
                    CategoryId = x.CategoryId.GetValueOrDefault(),
                    EffectiveDate = x.EffectiveDate,
                    Description = x.Description,
                    IsIncome = x.IsIncome
                })
                .FirstOrDefaultAsync(cancellationToken);

            return result;
        }
    }
}
