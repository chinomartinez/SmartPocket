namespace SmartPocket.Features.CreditCardPurchases.List
{
    public class CreditCardPurchaseListFilters
    {
        public bool IncludePaidOff { get; set; } = false;

        public bool IncludeCancelled { get; set; } = false;

        public bool IncludePending { get; set; } = true;
    }
}
