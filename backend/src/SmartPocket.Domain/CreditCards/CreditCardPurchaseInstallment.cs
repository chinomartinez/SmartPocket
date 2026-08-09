using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.CreditCards
{
    public class CreditCardPurchaseInstallment : BaseEntity<int>
    {
        public CreditCardPurchase CreditCardPurchase { get; private set; } = default!;
        public int CreditCardPurchaseId { get; private set; }

        /// <summary>
        /// Para Installment: 1..N.
        /// </summary>
        public int Number { get; private set; }

        public decimal Amount { get; private set; }

        public CreditCardStatement CreditCardStatement { get; private set; } = default!;
        public int? CreditCardStatementId { get; private set; }

        private CreditCardPurchaseInstallment()
        {
            // Para EF Core
        }

        public CreditCardPurchaseInstallment(CreditCardPurchase creditCardPurchase,
            int number,
            decimal amount)
        {
            CreditCardPurchase = creditCardPurchase ?? throw new ArgumentNullException(nameof(creditCardPurchase));
            CreditCardPurchaseId = creditCardPurchase.Id;
            Number = number.GetIfNotNegativeOrZero(nameof(number));
            Amount = amount.GetIfNotNegativeOrZero(nameof(amount));
        }

        public void UpdateAmount(decimal newAmount)
        {
            Amount = newAmount.GetIfNotNegativeOrZero(nameof(newAmount));
        }

        public void UpdateInstallmentNumber(int newNumber)
        {
            Number = newNumber.GetIfNotNegativeOrZero(nameof(newNumber));
        }

        public void LinkToStatement(int statementId)
        {
            if (CreditCardStatementId != null)
                throw new InvalidOperationException("Esta cuota ya está vinculada a un resumen.");

            CreditCardStatementId = statementId.GetIfNotNegativeOrZero(nameof(statementId));
        }
    }
}
