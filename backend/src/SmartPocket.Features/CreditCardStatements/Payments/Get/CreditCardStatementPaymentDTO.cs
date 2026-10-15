using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.CreditCardStatements.Payments.Get
{
    public class CreditCardStatementPaymentDTO
    {
        public int Id { get; set; }
        public int TransactionId { get; set; }
        public CreditCardStatementPaymentAccountDTO Account { get; set; } = default!;
        public decimal Amount { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string CoveredCurrencyCode { get; set; } = string.Empty;
    }

    public class CreditCardStatementPaymentAccountDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CurrencyCode { get; set; } = string.Empty;
        public IconDTO Icon { get; set; } = default!;
    }
}
