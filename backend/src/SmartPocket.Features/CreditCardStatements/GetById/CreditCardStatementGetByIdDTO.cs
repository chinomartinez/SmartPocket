namespace SmartPocket.Features.CreditCardStatements.GetById
{
    public class CreditCardStatementGetByIdDTO
    {
        public int Id { get; set; }
        public int CreditCardId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ClosingDate { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int InstallmentsCount { get; set; }
        public int ChargesCount { get; set; }
        public List<IncludedInstallmentItemDTO> IncludedInstallmentItems { get; set; } = [];
        public List<IncludedChargeItemDTO> IncludedChargeItems { get; set; } = [];
        public CreditCardStatementTotalsDTO Totals { get; set; } = new();
    }

    public class IncludedInstallmentItemDTO
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public int InstallmentNumber { get; set; }
        public IncludedPurchaseDTO Purchase { get; set; } = default!;
    }

    public class IncludedChargeItemDTO
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; } = string.Empty;
        public int ChargeNumber { get; set; }
        public IncludedSubscriptionDTO Subscription { get; set; } = default!;
    }

    public class CreditCardStatementTotalsDTO
    {
        public decimal TotalItemsInCardCurrency { get; set; }
        public decimal? TotalItemsInUsd { get; set; }
        public decimal? TotalPaidInCardCurrency { get; set; }
        public decimal? TotalPaidInUsd { get; set; }
    }

    public class IncludedPurchaseDTO
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateOnly EffectiveDate { get; set; }
        public IncludedCategoryDTO Category { get; set; } = default!;
    }

    public class IncludedSubscriptionDTO
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateOnly EffectiveDate { get; set; }
        public IncludedCategoryDTO Category { get; set; } = default!;
    }

    public class IncludedCategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public IncludedIconDTO Icon { get; set; } = default!;
    }

    public class IncludedIconDTO
    {
        public string Code { get; set; } = string.Empty;
        public string ColorHex { get; set; } = string.Empty;
    }
}
