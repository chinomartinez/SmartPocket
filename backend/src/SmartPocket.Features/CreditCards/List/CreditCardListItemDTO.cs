using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.CreditCards;

namespace SmartPocket.Features.CreditCards.List
{
    public class CreditCardListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public IconDTO Icon { get; set; } = null!;
        public string CurrencyCode { get; set; } = null!;
        public decimal CreditLimit { get; set; }
        public DayRangeDTO StatementClosingRange { get; set; } = null!;
        public DayRangeDTO PaymentDueRange { get; set; } = null!;
    }
}
