using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.CreditCardPurchases.List;
using SmartPocket.Features.Transactions;
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

        public async Task<List<CreditCardStatementPaymentSummaryDTO>> Get(
            int statementId,
            CancellationToken cancellation)
        {
            var cardCurrencyCode = await _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => x.Id == statementId)
                .Select(x => x.CreditCard.CurrencyCode)
                .FirstOrDefaultAsync(cancellation);

            if (string.IsNullOrEmpty(cardCurrencyCode))
            {
                return new List<CreditCardStatementPaymentSummaryDTO>();
            }

            var paymentsByCurrency = await _smartPocketContext.Query<CreditCardStatementPayment>()
                .Where(x => x.CreditCardStatementId == statementId)
                .Select(x => new CreditCardStatementPaymentDTO
                {
                    Id = x.Id,
                    TransactionId = x.TransactionId,
                    AccountId = x.Transaction.AccountId,
                    Money = new MoneyDTO
                    {
                        Amount = x.Transaction.Amount,
                        CurrencyCode = x.Transaction.Account.CurrencyCode
                    },
                    EffectiveDate = x.Transaction.EffectiveDate,
                    CoveredCurrencyCode = x.CoveredCurrencyCode
                })
                .ToDictionaryAsync(x => x.CoveredCurrencyCode, StringComparer.Ordinal, cancellation);

            var installmentsQuery = _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardStatementId == statementId)
                .Select(x => new
                {
                    CurrencyCode = x.CreditCardPurchase.CurrencyCode,
                    x.Amount
                });
            
            var chargesQuery = _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                .Where(x => x.CreditCardStatementId == statementId)
                .Select(x => new
                {
                    CurrencyCode = x.CreditCardSubscription.CurrencyCode,
                    x.Amount
                });

            var includedAmounts = installmentsQuery.Concat(chargesQuery)
                .GroupBy(x => x.CurrencyCode)
                .Select(x => new
                {
                    CurrencyCode = x.Key,
                    Amount = x.Sum(y => y.Amount)
                })
                .OrderBy(x => x.CurrencyCode == cardCurrencyCode ? 0 : 1)
                .ThenBy(x => x.CurrencyCode)
                .AsAsyncEnumerable();

            var result = new List<CreditCardStatementPaymentSummaryDTO>();

            await foreach (var x in includedAmounts.WithCancellation(cancellation))
            {
                result.Add(new CreditCardStatementPaymentSummaryDTO
                {
                    CoveredCurrencyCode = x.CurrencyCode,
                    IncludedAmount = x.Amount,
                    Payment = paymentsByCurrency.GetValueOrDefault(x.CurrencyCode)
                });
            }

            return result;
        }
    }
}
