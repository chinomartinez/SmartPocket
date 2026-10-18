using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.CreditCardStatements.Shared;
using SmartPocket.Features.Transactions;
using SmartPocket.Persistence;
using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.CreditCardStatements.List
{
    public class CreditCardStatementListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<PagedListResponse<CreditCardStatementListItemDTO>> Get(
            CreditCardStatementListRequest request,
            CancellationToken cancellation)
        {
            var statements = _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => x.CreditCardId == request.CreditCardId)
                .Select(x => new CreditCardStatementListItemDTO
                {
                    Id = x.Id,
                    CreditCardId = x.CreditCardId,
                    Description = x.Description,
                    ClosingDate = x.ClosingDate,
                    DueDate = x.DueDate,
                    Status = x.Status.ToString(),
                    InstallmentsCount = x.Installments.Count,
                    ChargesCount = x.SubscriptionCharges.Count
                })
                .OrderByDescending(x => x.ClosingDate)
                .ThenByDescending(x => x.Id);

            var response = await statements.ToPagedListResponse(request, cancellation);
            await PopulateTotals(response.Data, cancellation);

            return response;
        }

        private async Task PopulateTotals(
            IReadOnlyCollection<CreditCardStatementListItemDTO> statements,
            CancellationToken cancellation)
        {
            if (statements.Count == 0)
            {
                return;
            }

            var statementIds = statements.Select(x => x.Id).ToArray();

            var cardCurrencies = await _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => statementIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    CurrencyCode = x.CreditCard.CurrencyCode
                })
                .ToDictionaryAsync(x => x.Id, x => x.CurrencyCode, cancellation);

            var installmentAmounts = _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardStatementId.HasValue)
                .Where(x => statementIds.Contains(x.CreditCardStatementId!.Value))
                .Select(x => new
                {
                    StatementId = x.CreditCardStatementId!.Value,
                    CurrencyCode = x.CreditCardPurchase.CurrencyCode,
                    x.Amount
                });

            var chargeAmounts = _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                .Where(x => statementIds.Contains(x.CreditCardStatementId))
                .Select(x => new
                {
                    StatementId = x.CreditCardStatementId,
                    CurrencyCode = x.CreditCardSubscription.CurrencyCode,
                    x.Amount
                });

            var itemAmounts = await installmentAmounts
                .Concat(chargeAmounts)
                .GroupBy(x => new { x.StatementId, x.CurrencyCode })
                .Select(x => new
                {
                    StatementId = x.Key.StatementId,
                    CurrencyCode = x.Key.CurrencyCode,
                    Amount = x.Sum(y => y.Amount)
                })
                .ToListAsync(cancellation);

            var payments = await _smartPocketContext.Query<CreditCardStatementPayment>()
                .AsNoTracking()
                .Where(x => statementIds.Contains(x.CreditCardStatementId))
                .Select(x => new
                {
                    StatementId = x.CreditCardStatementId,
                    x.CoveredCurrencyCode,
                    Amount = x.Transaction.Amount,
                    CurrencyCode = x.Transaction.Account.CurrencyCode
                })
                .ToDictionaryAsync(
                    x => (x.StatementId, x.CoveredCurrencyCode),
                    x => new MoneyDTO
                    {
                        Amount = x.Amount,
                        CurrencyCode = x.CurrencyCode
                    },
                    cancellation);

            foreach (var statement in statements)
            {
                statement.Totals = new CreditCardStatementTotalsDTO
                {
                    CurrencySummaries = itemAmounts
                        .Where(x => x.StatementId == statement.Id)
                        .OrderBy(x => x.CurrencyCode == cardCurrencies[statement.Id] ? 0 : 1)
                        .ThenBy(x => x.CurrencyCode)
                        .Select(currencyGroup => new CreditCardStatementCurrencySummaryDTO
                        {
                            CurrencyCode = currencyGroup.CurrencyCode,
                            IncludedAmount = currencyGroup.Amount,
                            Payment = payments.GetValueOrDefault((statement.Id, currencyGroup.CurrencyCode))
                        })
                        .ToList()
                };
            }
        }
    }
}
