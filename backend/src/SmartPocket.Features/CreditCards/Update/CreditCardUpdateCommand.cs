using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.CreditCards;

namespace SmartPocket.Features.CreditCards.Update
{
    public class CreditCardUpdateCommand
    {
        public int Id { get; set; }

        public string Name { get; set; } = default!;

        public IconDTO Icon { get; set; } = default!;

        public string CurrencyCode { get; set; } = default!;

        public decimal CreditLimit { get; set; }

        public DayRangeDTO StatementClosingRange { get; set; } = default!;

        public DayRangeDTO PaymentDueRange { get; set; } = default!;
    }
}
