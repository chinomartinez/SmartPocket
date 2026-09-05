namespace SmartPocket.Features.CreditCards.Overview
{
    public class CreditCardOverviewDTO
    {
        public int CreditCardId { get; set; }
        public string CurrencyCode { get; set; } = null!;
        public decimal CreditLimit { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal EstimatedAvailableAmount { get; set; }
        public int PendingInstallmentsCount { get; set; }
        public int UnpaidStatementsCount { get; set; }
        public bool IsEstimate { get; set; } = true;
    }
}
