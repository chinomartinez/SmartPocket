using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.Shared.Icons;
using SmartPocket.Persistence;

namespace SmartPocket.Features.CreditCardStatements.Payments.Get
{
    public class CreditCardStatementPaymentsQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementPaymentsQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public Task<List<CreditCardStatementPaymentDTO>> Get(
            int statementId,
            CancellationToken cancellation)
        {
            return _smartPocketContext.Query<CreditCardStatementPayment>()
                .Where(x => x.CreditCardStatementId == statementId)
                .OrderBy(x => x.Transaction.EffectiveDate)
                    .ThenBy(x => x.Transaction.CreatedAt)
                    .ThenBy(x => x.CoveredCurrencyCode)
                .Select(x => new CreditCardStatementPaymentDTO
                {
                    Id = x.Id,
                    TransactionId = x.TransactionId,
                    Account = new CreditCardStatementPaymentAccountDTO
                    {
                        Id = x.Transaction.Account.Id,
                        Name = x.Transaction.Account.Name,
                        CurrencyCode = x.Transaction.Account.CurrencyCode,
                        Icon = new IconDTO
                        {
                            Code = x.Transaction.Account.Icon.Code,
                            ColorHex = x.Transaction.Account.Icon.ColorHex
                        }
                    },
                    Amount = x.Transaction.Amount,
                    EffectiveDate = x.Transaction.EffectiveDate,
                    CoveredCurrencyCode = x.CoveredCurrencyCode
                })
                .ToListAsync(cancellation);
        }
    }
}
