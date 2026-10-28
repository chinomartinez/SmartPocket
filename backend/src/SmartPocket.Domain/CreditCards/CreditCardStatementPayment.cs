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
            int creditCardStatementId,
            int accountId,
            decimal amount,
            DateOnly effectiveDate,
            string coveredCurrencyCode)
        {
            CreditCardStatementId = creditCardStatementId.GetIfNotNegativeOrZero(nameof(creditCardStatementId));
            CoveredCurrencyCode = coveredCurrencyCode.GetIfNotNullOrWhiteSpace(nameof(coveredCurrencyCode));

            Transaction = Transaction.CreateAsCreditCardStatementPayment(
                accountId: accountId,
                amount: amount,
                effectiveDate: effectiveDate);
        }

        public void Update(
            int accountId,
            decimal amount,
            DateOnly effectiveDate,
            string coveredCurrencyCode)
        {
            if (Transaction is null)
            {
                throw new InvalidOperationException("La transacción del pago debe establecerse antes de actualizarlo.");
            }

            CoveredCurrencyCode = coveredCurrencyCode.GetIfNotNullOrWhiteSpace(nameof(coveredCurrencyCode));

            Transaction.Update(
                accountId: accountId,
                amount: amount,
                effectiveDate: effectiveDate,
                isIncome: false,
                description: null,
                categoryId: null);
        }
    }
}
