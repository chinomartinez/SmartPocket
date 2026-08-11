namespace SmartPocket.Features.CreditCardSubscriptions.List
{
    public class CreditCardSubscriptionListFilters
    {
        public bool IncludeCancelled { get; set; }

        public bool IncludeActive { get; set; } = true;
    }
}
