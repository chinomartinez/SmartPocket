using SmartPocket.Domain.Transactions;
using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    /// <summary>
    /// Vincula un resumen con una transacción de pago y la moneda cubierta por esta.
    /// </summary>
    public class CreditCardStatementPayment : BaseEntity<int>
    {
        public CreditCardStatement CreditCardStatement { get; private set; } = default!;
        public int CreditCardStatementId { get; private set; }

        public Transaction Transaction { get; private set; } = default!;
        public int TransactionId { get; private set; }

        public string CoveredCurrencyCode { get; private set; } = string.Empty;

        private CreditCardStatementPayment() { }

        public CreditCardStatementPayment(
            CreditCardStatement creditCardStatement,
            Transaction transaction,
            string coveredCurrencyCode)
        {
            CreditCardStatement = creditCardStatement ?? throw new ArgumentNullException(nameof(creditCardStatement));
            CreditCardStatementId = creditCardStatement.Id;
            Transaction = transaction ?? throw new ArgumentNullException(nameof(transaction));
            TransactionId = transaction.Id;

            if (transaction.TransactionSourceId != TransactionSourceType.CreditCardStatementPayment)
            {
                throw new ArgumentException("La transacción debe tener origen de pago de resumen.", nameof(transaction));
            }

            if (transaction.IsIncome || transaction.CategoryId.HasValue)
            {
                throw new ArgumentException("El pago debe ser un gasto sin categoría.", nameof(transaction));
            }

            if (transaction.EffectiveDate <= creditCardStatement.ClosingDate)
            {
                throw new ArgumentException("La fecha de pago debe ser posterior al cierre del resumen.", nameof(transaction));
            }

            UpdateCoveredCurrencyCode(coveredCurrencyCode);
        }

        public void UpdateCoveredCurrencyCode(string coveredCurrencyCode)
        {
            CoveredCurrencyCode = coveredCurrencyCode.GetIfNotNullOrWhiteSpace(nameof(coveredCurrencyCode));
        }
    }
}
