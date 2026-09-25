namespace SmartPocket.Features.CreditCardStatements.Suggestions
{
    public class CreditCardStatementSuggestionsDTO
    {
        public List<SuggestedInstallmentItemDTO> SuggestedInstallmentItems { get; set; } = [];
        public List<SuggestedChargeItemDTO> SuggestedChargeItems { get; set; } = [];
    }

    public class SuggestedInstallmentItemDTO
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public int InstallmentNumber { get; set; }
        public PurchaseDTO Purchase { get; set; } = default!;
    }

    public class SuggestedChargeItemDTO
    {
        public int? Id { get; set; }
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public int ChargeNumber { get; set; }
        public SubscriptionDTO Subscription { get; set; } = default!;
    }

    public class PurchaseDTO
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateOnly EffectiveDate { get; set; }
        public CategoryDTO Category { get; set; } = default!;
    }

    public class SubscriptionDTO
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateOnly EffectiveDate { get; set; }
        public CategoryDTO Category { get; set; } = default!;
    }

    public class CategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public IconDTO Icon { get; set; } = default!;
    }

    public class IconDTO
    {
        public string Code { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
    }
}
