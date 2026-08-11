using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardSubscriptions.List
{
    public class CreditCardSubscriptionListItemDTO
    {
        public int Id { get; set; }

        public CategoryCreditCardSubscriptionListItemDTO Category { get; set; } = default!;

        public string Description { get; set; } = string.Empty;

        public MoneyDTO SubscriptionAmount { get; set; } = default!;

        public DateOnly EffectiveDate { get; set; } = default!;

        public DateOnly? CancelledAt { get; set; }

        public bool IsActive { get; set; }

        public int ChargeCount { get; set; }

        public int ChargePaidCount { get; set; }

        public decimal LastChargeAmount { get; set; }
    }

    public class CategoryCreditCardSubscriptionListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public IconDTO Icon { get; set; } = default!;
    }
}
