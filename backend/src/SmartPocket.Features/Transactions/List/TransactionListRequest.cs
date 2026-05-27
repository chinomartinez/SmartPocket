using SmartPocket.Persistence.PagedQuery;

namespace SmartPocket.Features.Transactions.List
{
    public class TransactionListRequest
    {
        public int AccountId { get; set; }

        public bool IsIncome { get; set; }

        public DateTime From { get; set; }
        public DateTime To { get; set; }

        public string? Search { get; set; }
    }
}
