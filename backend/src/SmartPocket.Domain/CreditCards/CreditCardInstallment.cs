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

        /// <summary>
        /// Fecha de facturación de la subscripción. Es posible que una subscripcion se facture 2 veces en un mismo resumen.
        /// </summary>
        public DateOnly? DueDate { get; private set; }

        public CreditCardStatement CreditCardStatement { get; private set; } = default!;
        public int? CreditCardStatementId { get; private set; }

        private CreditCardInstallment()
        {
            // Para EF Core
        }

        public CreditCardInstallment(CreditCardPurchase creditCardPurchase,
            int installmentNumber,
            decimal amount,
            DateOnly? dueDate)
        {
            CreditCardPurchase = creditCardPurchase ?? throw new ArgumentNullException(nameof(creditCardPurchase));
            CreditCardPurchaseId = creditCardPurchase.Id;
            InstallmentNumber = installmentNumber;
            Amount = amount;
            DueDate = dueDate;
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
