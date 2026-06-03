namespace SmartPocket.Features.Transactions.Create
{
    public class TransactionCreateCommand
    {
        public int AccountId { get; set; }
        public int CategoryId { get; set; }

        public decimal Amount { get; set; }

        public DateTime EffectiveDate { get; set; }
        public string? Description { get; set; }
        public bool IsIncome { get; set; }
    }
}
