namespace SmartPocket.Features.Transfers.Update
{
    public class TransferUpdateCommand
    {
        public int Id { get; set; }

        public decimal Amount { get; set; }

        public string? Description { get; set; } = string.Empty;

        public int OriginAccountId { get; set; }

        public int DestinationAccountId { get; set; }

        public DateTime EffectiveDate { get; set; }
    }
}
