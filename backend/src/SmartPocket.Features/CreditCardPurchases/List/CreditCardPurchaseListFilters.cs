namespace SmartPocket.Features.CreditCardPurchases.List
{
    public class CreditCardPurchaseListFilters
    {
        public bool IncludePaidOff { get; set; } = false;

        public bool IncludeFinished { get; set; } = false;

        public bool IncludeActive { get; set; } = true;
    }
}
