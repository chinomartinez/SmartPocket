using SmartPocket.Domain.Transactions;
using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Domain.Transfers
{
    public class Transfer : BaseAuditEntity<int>
    {
        private Transfer()
        {
            // PARA EF Core
        }

        public Transfer(int originAccountId, int destinationAccountId, decimal amount, DateTime effectiveDate,
            string? description = null)
        {
            EffectiveDate = DateTime.SpecifyKind(effectiveDate, DateTimeKind.Utc);
            Description = description;

            OriginTransaction = Transaction.CreateAsTransfer(
                accountId: originAccountId,
                amount: amount,
                effectiveDate: effectiveDate,
                isIncome: false,
                description: description
            );

            DestinationTransaction = Transaction.CreateAsTransfer(
                accountId: destinationAccountId,
                amount: amount,
                effectiveDate: effectiveDate,
                isIncome: true,
                description: description
            );
        }

        public Transaction OriginTransaction { get; private set; } = default!;
        public int OriginTransactionId { get; private set; }

        public Transaction DestinationTransaction { get; private set; } = default!;
        public int DestinationTransactionId { get; private set; }

        public DateTime EffectiveDate { get; private set; }

        public string? Description { get; set; }

        public void Update(int originAccountId, int destinationAccountId, decimal amount, DateTime effectiveDate,
            string? description = null)
        {
            if (OriginTransaction is null || DestinationTransaction is null)
            {
                var error = "Both OriginTransaction and DestinationTransaction must be set before updating the transfer.";
                throw new InvalidOperationException(error);
            }

            EffectiveDate = DateTime.SpecifyKind(effectiveDate, DateTimeKind.Utc);
            Description = description;

            OriginTransaction.Update(
                accountId: originAccountId,
                amount: amount,
                effectiveDate: effectiveDate,
                isIncome: false,
                description: description,
                categoryId: null
            );

            DestinationTransaction.Update(
                accountId: destinationAccountId,
                amount: amount,
                effectiveDate: effectiveDate,
                isIncome: true,
                description: description,
                categoryId: null
            );
        }
    }
}
