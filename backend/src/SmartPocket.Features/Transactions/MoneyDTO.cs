using SmartPocket.Domain.Transactions;

namespace SmartPocket.Features.Transactions
{
    public class MoneyDTO
    {
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;

        public Money ToDomainMoney()
        {
            return new Money(Amount, CurrencyCode);
        }
    }
}
