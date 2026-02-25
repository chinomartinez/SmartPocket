using SmartPocket.SharedKernel;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.Transactions
{
    public class Money : ValueObject
    {
        public decimal Amount { get; private set; }

        public string CurrencyCode { get; private set; }

        public Money(decimal amount, string currencyCode)
        {
            Amount = amount;
            CurrencyCode = currencyCode.GetIfNotNullOrWhiteSpace(nameof(currencyCode));

            if (CurrencyCode.Length != 3)
            {
                throw new ArgumentException("El código de moneda debe tener exactamente 3 caracteres.",
                    nameof(currencyCode));
            }
        }

        protected override IEnumerable<object> GetAtomicValues()
        {
            yield return Amount;
            yield return CurrencyCode;
        }
    }
}
