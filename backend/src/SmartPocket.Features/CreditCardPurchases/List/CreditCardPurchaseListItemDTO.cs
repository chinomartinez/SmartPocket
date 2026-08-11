using SmartPocket.Features.Shared.Icons;
using SmartPocket.Features.Transactions;

namespace SmartPocket.Features.CreditCardPurchases.List
{
    public class CreditCardPurchaseListItemDTO
    {
        public int Id { get; set; }

        public CategoryCreditCardPurchaseListItemDTO Category { get; set; } = default!;

        public string Description { get; set; } = string.Empty;

        public MoneyDTO PurchaseAmount { get; set; } = default!;

        public DateOnly EffectiveDate { get; set; } = default!;

        public DateOnly? PaidOffAt { get; set; }
        public DateOnly? FinishedAt { get; set; }

        public bool IsActive { get; set; }

        public int InstallmentsCount { get; set; }

        public int InstallmentsPaidCount { get; set; }

        public IEnumerable<CredictCardPurchaseInstallmentListItemDTO> RemainingInstallments { get; set; } = default!;
    }

    public class CategoryCreditCardPurchaseListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public IconDTO Icon { get; set; } = default!;
    }

    public class CredictCardPurchaseInstallmentListItemDTO
    {
        public int Id { get; set; }
        public int Number { get; set; }
    
        public decimal Amount { get; set; }
    }
}
