using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Transactions.GetRecents
{
    public class RecentTransactionItemDTO
    {
        public int Id { get; set; }
        public AccountRecentTransactionItemDTO Account { get; set; } = default!;

        public CategoryRecentTransactionItemDTO Category { get; set; } = default!;

        public string? Description { get; set; } = default!;

        public DateTime EffectiveDate { get; set; }

        public bool IsIncome { get; set; }

        public MoneyDTO Money { get; set; } = default!;
    }

    public class AccountRecentTransactionItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public IconDTO Icon { get; set; } = default!;
    }

    public class CategoryRecentTransactionItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;

        public bool IsIncome { get; set; }

        public IconDTO Icon { get; set; } = default!;
    }

}
