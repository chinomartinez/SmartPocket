namespace SmartPocket.Features.CreditCardPurchases.List
{
    public class CreditCardPurchaseListRequest
    {
        public int CreditCardId { get; set; }

        public bool IncludePaidOff { get; set; } = false;

        public bool IncludeCancelled { get; set; } = false;

        public bool IncludePending { get; set; } = true;
    }
}
