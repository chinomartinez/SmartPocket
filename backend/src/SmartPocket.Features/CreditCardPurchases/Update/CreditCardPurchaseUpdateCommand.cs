using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardPurchases.Update
{
    public class CreditCardPurchaseUpdateCommand
    {
        public int Id { get; set; }

        public int CreditCardId { get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; } = default!;
        public DateOnly EffectiveDate { get; set; }
        public MoneyDTO PurchaseAmount { get; set; } = default!;
        public int Installments { get; set; }
    }
}
