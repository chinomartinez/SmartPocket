using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardSubscriptions.Update
{
    public class CreditCardSubscriptionUpdateCommand
    {
        public int Id { get; set; }

        public int CreditCardId { get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; } = default!;
        public DateOnly EffectiveDate { get; set; }
        public MoneyDTO SubscriptionAmount { get; set; } = default!;
    }
}
