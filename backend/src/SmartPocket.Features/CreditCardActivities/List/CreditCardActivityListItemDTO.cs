namespace SmartPocket.Features.CreditCardActivities.List
{
    public class CreditCardActivityListItemDTO
    {
        public int Id { get; set; }

        public string Type { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public CreditCardActivityCategoryDTO Category { get; set; } = default!;

        public decimal Amount { get; set; }

        public string CurrencyCode { get; set; } = string.Empty;

        public DateOnly EffectiveDate { get; set; }

        public string Status { get; set; } = string.Empty;

        public int? InstallmentsCount { get; set; }

        public int? InstallmentsPaidCount { get; set; }

        public int? ChargeCount { get; set; }
    }

    public class CreditCardActivityCategoryDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public CreditCardActivityIconDTO Icon { get; set; } = default!;
    }

    public class CreditCardActivityIconDTO
    {
        public string Code { get; set; } = string.Empty;

        public string ColorHex { get; set; } = string.Empty;
    }
}
