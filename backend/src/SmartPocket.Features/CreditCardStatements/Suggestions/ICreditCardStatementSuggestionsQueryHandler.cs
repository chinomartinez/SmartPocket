namespace SmartPocket.Features.CreditCardStatements.Suggestions
{
    public interface ICreditCardStatementSuggestionsQueryHandler
    {
        Task<CreditCardStatementSuggestionsDTO> Get(
            int creditCardId,
            DateOnly closingDate,
            CancellationToken cancellation);
    }
}
