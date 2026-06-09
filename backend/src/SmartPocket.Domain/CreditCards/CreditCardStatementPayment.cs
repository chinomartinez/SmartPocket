using SmartPocket.Domain.Transactions;
using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Domain.CreditCards
{
    /// <summary>
    /// Puente entre el resumen y las transacciones reales de pago.
    /// Permite múltiples pagos en distintas monedas para un mismo resumen.
    /// </summary>
    public class CreditCardStatementPayment : BaseEntity<int>
    {
        public CreditCardStatement CreditCardStatement { get; private set; } = default!;
        public int CreditCardStatementId { get; private set; }

        public Transaction Transaction { get; private set; } = default!;
        public int TransactionId { get; private set; }

        private CreditCardStatementPayment() { }

        public CreditCardStatementPayment(CreditCardStatement creditCardStatement, Transaction transaction)
        {
            CreditCardStatement = creditCardStatement ?? throw new ArgumentNullException(nameof(creditCardStatement));
            CreditCardStatementId = creditCardStatement.Id;
            Transaction = transaction ?? throw new ArgumentNullException(nameof(transaction));
            TransactionId = transaction.Id;
        }

        public CreditCardStatementPayment(int creditCardStatementId, int transactionId)
        {
            CreditCardStatementId = creditCardStatementId;
            TransactionId = transactionId;
        }
    }
}
