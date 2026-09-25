namespace SmartPocket.Features.CreditCardStatements.List
{
    public class CreditCardStatementListItemDTO
    {
        public int Id { get; set; }
        public int CreditCardId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ClosingDate { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalItemsInCardCurrency { get; set; }
        public decimal? TotalItemsInUsd { get; set; }
        public int InstallmentsCount { get; set; }
        public int ChargesCount { get; set; }
    }
}
