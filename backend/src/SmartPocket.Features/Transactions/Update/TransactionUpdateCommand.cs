using SmartPocket.Features.Abstractions.Handlers;

namespace SmartPocket.Features.Transactions.Update
{
    public class TransactionUpdateCommand : ICommand<int>
    {
        public int Id { get; set; }
        public int AccountId { get; set; }
        public int CategoryId { get; set; }

        public decimal Amount { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string? Description { get; set; }
        public bool IsIncome { get; set; }
    }
}
