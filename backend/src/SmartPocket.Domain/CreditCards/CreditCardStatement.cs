using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardStatement : BaseAuditEntity<int>
    {
        public CreditCard CreditCard { get; private set; } = default!;
        public int CreditCardId { get; private set; }

        public string Description { get; private set; } = string.Empty;

        public DateOnly ClosingDate { get; private set; }
        public DateOnly DueDate { get; private set; }

        public CreditCardStatementStatus Status { get; private set; }

        public ICollection<CreditCardPurchaseInstallment> Installments { get; private set; } = new List<CreditCardPurchaseInstallment>();

        public ICollection<CreditCardSubscriptionCharge> SubscriptionCharges { get; private set; } = new List<CreditCardSubscriptionCharge>();

        /// <summary>
        /// Como máximo un pago por cada moneda incluida en el resumen.
        /// La moneda real de la transacción puede diferir de la moneda cubierta.
        /// </summary>
        public ICollection<CreditCardStatementPayment> Payments { get; private set; } = new List<CreditCardStatementPayment>();

        private CreditCardStatement() { }

        public CreditCardStatement(int creditCardId, string description, DateOnly closingDate, DateOnly dueDate)
        {
            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            Description = description;
            ClosingDate = closingDate;
            DueDate = dueDate;
            Status = CreditCardStatementStatus.Closed;
        }

        public void Update(string description, DateOnly closingDate, DateOnly dueDate)
        {
            Description = description;
            ClosingDate = closingDate;
            DueDate = dueDate;
        }

        public void UpdatePaymentStatus(bool hasPayments, bool allItemCurrenciesCovered)
        {
            Status = !hasPayments
                ? CreditCardStatementStatus.Closed
                : allItemCurrenciesCovered
                    ? CreditCardStatementStatus.Paid
                    : CreditCardStatementStatus.PartiallyPaid;
        }
    }    
}
