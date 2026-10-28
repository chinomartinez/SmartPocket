using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.Transactions.List
{
    public class TransactionListRequest
    {
        public int AccountId { get; set; }

        public bool IsIncome { get; set; }

        public DateOnly From { get; set; }
        public DateOnly To { get; set; }

        public string? Search { get; set; }
    }
}
