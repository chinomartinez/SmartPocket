namespace SmartPocket.Features.CreditCardStatements.Create
{
    public class CreditCardStatementCreateCommand
    {
        public int CreditCardId { get; set; }

        public string Description { get; set; } = default!;

        public DateTime ClosingDate { get; set; }

        public DateTime DueDate { get; set; }

        public int[] InstallmentIds { get; set; } = default!;

        public SubscriptionChargeStatementCreateCommand[] SubscriptionCharges { get; set; } = default!;
    }

    public class SubscriptionChargeStatementCreateCommand
    {
        public int SubscriptionId { get; set; }

        public int ChargeNumber { get; set; }

        public decimal Amount { get; set; }
    }
}
