using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardStatement : BaseAuditEntity<int>
    {
        public CreditCard CreditCard { get; private set; } = default!;
        public int CreditCardId { get; private set; }

        public int PeriodYear { get; private set; }
        public int PeriodMonth { get; private set; }

        public DateOnly ClosingDate { get; private set; }
        public DateOnly DueDate { get; private set; }

        public CreditCardStatementStatus Status { get; private set; }

        public ICollection<CreditCardInstallment> Installments { get; private set; } = new List<CreditCardInstallment>();

        /// <summary>
        /// Uno o más pagos, uno por moneda utilizada al saldar el resumen.
        /// Ej: una Transaction en USD + una en ARS si pagaste ambas secciones por separado.
        /// </summary>
        public ICollection<CreditCardStatementPayment> Payments { get; private set; } = new List<CreditCardStatementPayment>();

        private CreditCardStatement() { }

        public CreditCardStatement(int creditCardId, int periodYear, int periodMonth, DateOnly closingDate, DateOnly dueDate)
        {
            CreditCardId = creditCardId;
            PeriodYear = periodYear;
            PeriodMonth = periodMonth;
            ClosingDate = closingDate;
            DueDate = dueDate;
            Status = CreditCardStatementStatus.Closed;
        }

        public void Update(DateOnly closingDate, DateOnly dueDate)
        {
            if (Status != CreditCardStatementStatus.Closed)
                throw new InvalidOperationException("Only closed statements can be updated.");

            ClosingDate = closingDate;
            DueDate = dueDate;
        }

        public void PaidStatement()
        {
            if (Status != CreditCardStatementStatus.Closed)
                throw new InvalidOperationException("Only closed statements can be paid.");

            Status = CreditCardStatementStatus.Paid;
        }

        public void PaidPartiallyStatement()
        {
            if (Status != CreditCardStatementStatus.Closed)
                throw new InvalidOperationException("Only closed statements can be marked as partially paid.");

            Status = CreditCardStatementStatus.PartiallyPaid;
        }
    }

    public enum CreditCardStatementStatus
    {
        Closed = 2, // El resumen se cerró pero aún no se pagó
        Paid = 3, // Pagaste el resumen completo
        PartiallyPaid = 4   // Pagaste la sección USD pero no la ARS, o viceversa
    }
}
