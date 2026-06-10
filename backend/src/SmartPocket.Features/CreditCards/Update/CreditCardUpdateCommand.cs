using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.CreditCards.Update
{
    public class CreditCardUpdateCommand
    {
        public int Id { get; set; }

        public string Name { get; set; } = default!;

        public IconDTO Icon { get; set; } = default!;

        public string CurrencyCode { get; set; } = default!;

        public decimal CreditLimit { get; set; }

        public int StatementClosingDay { get; set; }

        public int PaymentDueDay { get; set; }
    }
}
