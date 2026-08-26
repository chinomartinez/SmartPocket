namespace SmartPocket.Features.CreditCardStatements.Update
{
    public class CreditCardStatementUpdateCommand
    {
        public int Id { get; set; }

        public int CreditCardId { get; set; }

        public string Description { get; set; } = default!;

        public DateTime ClosingDate { get; set; }

        public int[] InstallmentIds { get; set; } = default!;

        public SubscriptionChargeStatementUpdateCommand[] SubscriptionCharges { get; set; } = default!;
    }

    public class SubscriptionChargeStatementUpdateCommand
    {
        public int? Id { get; set; }

        public int SubscriptionId { get; set; }

        public int ChargeNumber { get; set; }

        public decimal Amount { get; set; }
    }
}
