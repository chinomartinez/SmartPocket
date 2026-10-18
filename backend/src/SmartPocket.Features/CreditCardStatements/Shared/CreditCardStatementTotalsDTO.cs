using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardStatements.Shared
{
    public class CreditCardStatementTotalsDTO
    {
        public List<CreditCardStatementCurrencySummaryDTO> CurrencySummaries { get; set; } = [];
    }

    public class CreditCardStatementCurrencySummaryDTO
    {
        public string CurrencyCode { get; set; } = string.Empty;
        public decimal IncludedAmount { get; set; }
        public MoneyDTO? Payment { get; set; }
    }
}
