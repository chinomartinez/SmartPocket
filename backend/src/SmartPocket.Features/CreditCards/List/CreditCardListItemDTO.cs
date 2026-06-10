using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.CreditCards.List
{
    public class CreditCardListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public IconDTO Icon { get; set; } = null!;
        public string CurrencyCode { get; set; } = null!;
        public decimal CreditLimit { get; set; }
        public int StatementClosingDay { get; set; }
        public int PaymentDueDay { get; set; }
    }
}
