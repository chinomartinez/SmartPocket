using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Transactions.List
{
    public class TransactionListItemDTO
    {
        public int Id { get; set; }
        public AccountTransactionListItemDTO Account { get; set; } = default!;

        public CategoryTransactionListItemDTO Category { get; set; } = default!;

        public string? Description { get; set; } = default!;

        public DateTime EffectiveDate { get; set; }

        public bool IsIncome { get; set; }

        public MoneyDTO Money { get; set; } = default!;
    }

    public class AccountTransactionListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public IconDTO Icon { get; set; } = default!;
    }

    public class CategoryTransactionListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;

        public bool IsIncome { get; set; }

        public IconDTO Icon { get; set; } = default!;
    }
}
