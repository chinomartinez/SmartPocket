using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardStatements.Payments.Get
{
    public class CreditCardStatementPaymentDTO
    {
        public int Id { get; set; }
        public int TransactionId { get; set; }
        public int AccountId { get; set; }
        public MoneyDTO Money { get; set; } = default!;
        public DateOnly EffectiveDate { get; set; }
        public string CoveredCurrencyCode { get; set; } = string.Empty;
    }
}
