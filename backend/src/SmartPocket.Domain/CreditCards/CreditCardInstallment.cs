using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardInstallment : BaseEntity<int>
    {
        public CreditCardPurchase CreditCardPurchase { get; private set; } = default!;
        public int CreditCardPurchaseId { get; private set; }

        /// <summary>
        /// Para Installment: 1..N. Para Subscription: número de ciclo (1, 2, 3...)
        /// </summary>
        public int InstallmentNumber { get; private set; }

        public decimal Amount { get; private set; }

        public int PeriodYear { get; private set; }
        public int PeriodMonth { get; private set; }

        public CreditCardStatement CreditCardStatement { get; private set; } = default!;
        public int? CreditCardStatementId { get; private set; }

        private CreditCardInstallment()
        {
            // Para EF Core
        }

        public CreditCardInstallment(int creditPurchaseId,
            int installmentNumber,
            decimal amount,
            int periodYear,
            int periodMonth)
        {
            CreditCardPurchaseId = creditPurchaseId;
            InstallmentNumber = installmentNumber;
            Amount = amount;
            PeriodYear = periodYear;
            PeriodMonth = periodMonth;
        }

        public void Update(
            int creditPurchaseId,
            int installmentNumber,
            decimal amount,
            int periodYear,
            int periodMonth)
        {
            CreditCardPurchaseId = creditPurchaseId;
            InstallmentNumber = installmentNumber;
            Amount = amount;
            PeriodYear = periodYear;
            PeriodMonth = periodMonth;
        }

        public void LinkToStatement(int statementId)
        {
            if (CreditCardStatementId != null)
                throw new InvalidOperationException("Esta cuota ya está vinculada a un resumen.");

            if (statementId <= 0)
                throw new ArgumentException("El statementId debe ser un entero positivo.", nameof(statementId));

            CreditCardStatementId = statementId;
        }
    }
}
