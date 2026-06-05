using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Domain.Transactions
{
    public class TransactionSource : BaseEntity<TransactionSourceType>
    {
        public string Name { get; protected set; }

        public TransactionSource(TransactionSourceType id, string name)
        {
            Id = id;
            Name = name;
        }
    }

    public enum TransactionSourceType
    {
        None = 0,
        ManualEntry = 1,
        Transfer = 2,
        SystemAdjustment = 3
    }
}
