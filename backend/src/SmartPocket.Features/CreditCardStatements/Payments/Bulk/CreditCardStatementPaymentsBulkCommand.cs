namespace SmartPocket.Features.CreditCardStatements.Payments.Bulk
{
    public class CreditCardStatementPaymentsBulkCommand
    {
        public int StatementId { get; set; }
        public CreditCardStatementPaymentUpdateItem[] Payments { get; set; } = [];
    }

    public class CreditCardStatementPaymentUpdateItem
    {
        public int? Id { get; set; }
        public int AccountId { get; set; }
        public decimal Amount { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string CoveredCurrencyCode { get; set; } = string.Empty;
    }
}
