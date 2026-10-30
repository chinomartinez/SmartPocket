namespace SmartPocket.Features.CreditCardStatements.Payments.Get
{
    public class CreditCardStatementPaymentSummaryDTO
    {
        public string CoveredCurrencyCode { get; set; } = string.Empty;
        public decimal IncludedAmount { get; set; }
        public CreditCardStatementPaymentDTO? Payment { get; set; }
    }
}
