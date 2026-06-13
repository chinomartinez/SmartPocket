using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardPurchases.Create
{
    public class CreditCardPurchaseCommand
    {
        public int CreditCardId { get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; } = default!;
        public DateOnly EffectiveDate { get; set; }
        public MoneyDTO PurchaseAmount { get; set; } = default!;
        public decimal? OriginalAmount { get; set; }
        public int? Installments { get; set; }
        public bool IsInstallment { get; set; }
    }
}
