using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.CreditCards;

namespace SmartPocket.Features.CreditCards.Create
{
    public class CreditCardCreateCommand
    {
        public string Name { get; set; } = default!;

        public IconDTO Icon { get; set; } = default!;

        public string CurrencyCode { get; set; } = default!;

        public decimal CreditLimit { get; set; }

        public DayRangeDTO StatementClosingRange { get; set; } = default!;

        public DayRangeDTO PaymentDueRange { get; set; } = default!;
    }
}
