using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Transfers.List
{
    public class TransferListItemDTO
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string? Description { get; set; }
        public AccountTransferListItemDTO OriginAccount { get; set; } = default!;
        public AccountTransferListItemDTO DestinationAccount { get; set; } = default!;
    }

    public class AccountTransferListItemDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CurrencyCode { get; set; } = string.Empty;
        public IconDTO Icon { get; set; } = default!;
    }
}
