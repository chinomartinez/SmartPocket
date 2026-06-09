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

        /// <summary>
        /// Calculado: el resumen está completamente pagado cuando todos los pagos cubren todas las cuotas
        /// </summary>
        public bool IsFullyPaid => Status == CreditCardStatementStatus.Paid;

        private CreditCardStatement() { }

        public CreditCardStatement(int creditCardId, int periodYear, int periodMonth, DateOnly closingDate, DateOnly dueDate)
        {
            CreditCardId = creditCardId;
            PeriodYear = periodYear;
            PeriodMonth = periodMonth;
            ClosingDate = closingDate;
            DueDate = dueDate;
            Status = CreditCardStatementStatus.Open;
        }

        public void Update(DateOnly closingDate, DateOnly dueDate)
        {
            if (Status != CreditCardStatementStatus.Open)
                throw new InvalidOperationException("Only open statements can be updated.");

            ClosingDate = closingDate;
            DueDate = dueDate;
        }

        public void CloseStatement()
        {
            if (Status != CreditCardStatementStatus.Open)
                throw new InvalidOperationException("Only open statements can be closed.");
            Status = CreditCardStatementStatus.Closed;
        }

        public void PaidStatement()
        {
            if (Status == CreditCardStatementStatus.Paid)
                throw new InvalidOperationException("Statement is already paid.");

            if (Status == CreditCardStatementStatus.Open)
                throw new InvalidOperationException("Only closed statements can be marked as paid.");

            Status = CreditCardStatementStatus.Paid;
        }

        public void PaidPartiallyStatement()
        {
            if (Status == CreditCardStatementStatus.Paid)
                throw new InvalidOperationException("Statement is already paid.");
            if (Status != CreditCardStatementStatus.Closed)
                throw new InvalidOperationException("Only closed statements can be marked as partially paid.");

            Status = CreditCardStatementStatus.PartiallyPaid;
        }
    }

    public enum CreditCardStatementStatus
    {
        Open = 1,
        Closed = 2,
        Paid = 3,
        PartiallyPaid = 4   // Pagaste la sección USD pero no la ARS, o viceversa
    }
}
