using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardPurchases.List
{
    public class CreditCardPurchaseListItemDTO
    {
        public int Id { get; set; }

        public CreditCardCreditCardPurchaseListItemDTO CreditCard { get; set; } = default!;

        public CategoryCreditCardPurchaseListItemDTO Category { get; set; } = default!;

        public string Description { get; set; } = string.Empty;

        public MoneyDTO PurchaseAmount { get; set; } = default!;

        public DateOnly EffectiveDate { get; set; } = default!;

        public DateOnly? PaidOffAt { get; set; }
        public DateOnly? CancelledAt { get; set; }

        public string PurchaseType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public int InstallmentsCount { get; set; }

        public int InstallmentsPaid { get; set; }

        public int InstallmentsRemaining => InstallmentsCount - InstallmentsPaid;
    }

    public class CreditCardCreditCardPurchaseListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class CategoryCreditCardPurchaseListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
