using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardSubscriptionCharge : BaseEntity<int>
    {
        public CreditCardSubscription CreditCardSubscription { get; private set; } = default!;
        public int CreditCardSubscriptionId { get; private set; }

        public CreditCardStatement CreditCardStatement { get; private set; } = default!;
        public int CreditCardStatementId { get; private set; }

        /// <summary>
        /// Número de cargo (1, 2, 3...)
        /// </summary>
        public int ChargeNumber { get; private set; }

        public decimal Amount { get; private set; }
        

        private CreditCardSubscriptionCharge()
        {
            // Para EF Core
        }

        public CreditCardSubscriptionCharge(int creditCardSubscriptionId,
            int creditCardStatementId,
            int chargeNumber,
            decimal amount)
        {
            CreditCardSubscriptionId = creditCardSubscriptionId.GetIfNotNegativeOrZero(nameof(creditCardSubscriptionId));
            CreditCardStatementId = creditCardStatementId.GetIfNotNegativeOrZero(nameof(creditCardStatementId));

            Update(chargeNumber, amount);
            
        }

        public void Update(int chargeNumber, decimal amount)
        {
            ChargeNumber = chargeNumber.GetIfNotNegativeOrZero(nameof(chargeNumber));
            Amount = amount.GetIfNotNegativeOrZero(nameof(amount));
        }
    }
}
