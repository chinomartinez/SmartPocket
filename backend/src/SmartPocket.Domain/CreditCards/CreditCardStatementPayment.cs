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

        public void UpdateCoveredCurrencyCode(string coveredCurrencyCode)
        {
            CoveredCurrencyCode = coveredCurrencyCode.GetIfNotNullOrWhiteSpace(nameof(coveredCurrencyCode));
        }        
    }
}
