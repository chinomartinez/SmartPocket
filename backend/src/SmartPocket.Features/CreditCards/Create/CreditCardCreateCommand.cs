using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.CreditCards.Create
{
    public class CreditCardCreateCommand
    {
        public string Name { get; set; } = default!;

        public IconDTO Icon { get; set; } = default!;

        public string CurrencyCode { get; set; } = default!;

        public decimal CreditLimit { get; set; }

        public int StatementClosingDay { get; set; }

        public int PaymentDueDay { get; set; }
    }
}
