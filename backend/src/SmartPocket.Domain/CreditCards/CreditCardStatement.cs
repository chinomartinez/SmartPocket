using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardStatement : BaseAuditEntity<int>
    {
        public CreditCard CreditCard { get; private set; } = default!;
        public int CreditCardId { get; private set; }

        public string Description { get; private set; } = string.Empty;

        public DateTime ClosingDate { get; private set; }
        public DateTime DueDate { get; private set; }

        public CreditCardStatementStatus Status { get; private set; }

        public ICollection<CreditCardPurchaseInstallment> Installments { get; private set; } = new List<CreditCardPurchaseInstallment>();

        public ICollection<CreditCardSubscriptionCharge> SubscriptionCharges { get; private set; } = new List<CreditCardSubscriptionCharge>();

        /// <summary>
        /// Uno o más pagos, uno por moneda utilizada al saldar el resumen.
        /// Ej: una Transaction en USD + una en ARS si pagaste ambas secciones por separado.
        /// </summary>
        public ICollection<CreditCardStatementPayment> Payments { get; private set; } = new List<CreditCardStatementPayment>();

        private CreditCardStatement() { }

        public CreditCardStatement(int creditCardId, string description, DateTime closingDate, DateTime dueDate)
        {
            CreditCardId = creditCardId.GetIfNotNegativeOrZero(nameof(creditCardId));
            Description = description;
            ClosingDate = closingDate;
            DueDate = dueDate;
            Status = CreditCardStatementStatus.Closed;
        }

        public void Update(string description, DateTime closingDate, DateTime dueDate)
        {
            Description = description;
            ClosingDate = closingDate;
            DueDate = dueDate;
        }

        public void PaidStatement()
        {
            if (Status != CreditCardStatementStatus.Closed)
                throw new InvalidOperationException("Only closed statements can be paid.");

            Status = CreditCardStatementStatus.Paid;
        }

    }    
}
