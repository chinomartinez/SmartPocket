using SmartPocket.SharedKernel.DTOs;

namespace SmartPocket.Features.Transactions.GetById
{
    public class TransactionGetByIdDTO : BaseDTO<int>
    {
        public string? Description { get; set; }
        public MoneyDTO AccountMoney { get; set; } = default!;
        public DateOnly EffectiveDate { get; set; }
        public int AccountId { get; set; }
        public int CategoryId { get; set; }
        public bool IsIncome { get; set; }
    }
}
