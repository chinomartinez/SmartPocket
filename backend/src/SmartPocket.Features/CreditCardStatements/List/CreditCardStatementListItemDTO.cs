using SmartPocket.Features.CreditCardStatements.Shared;

namespace SmartPocket.Features.CreditCardStatements.List
{
    public class CreditCardStatementListItemDTO
    {
        public int Id { get; set; }
        public int CreditCardId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateOnly ClosingDate { get; set; }
        public DateOnly DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public CreditCardStatementTotalsDTO Totals { get; set; } = new();
        public int InstallmentsCount { get; set; }
        public int ChargesCount { get; set; }
    }
}
