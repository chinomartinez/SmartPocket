using SmartPocket.Features.Abstractions.Handlers;

namespace SmartPocket.Features.CreditCardStatements.Suggestions
{
    public interface ICreditCardStatementSuggestionsQueryHandler : IHandler
    {
        Task<CreditCardStatementSuggestionsDTO> Get(
            int creditCardId,
            DateTime closingDate,
            CancellationToken cancellation);
    }
}
