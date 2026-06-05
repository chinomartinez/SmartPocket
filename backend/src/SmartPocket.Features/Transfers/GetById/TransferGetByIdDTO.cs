using SmartPocket.Features.Shared.Icons;

namespace SmartPocket.Features.Transfers.GetById
{
    public class TransferGetByIdDTO
    {
        public int Id { get; set; }

        public AccountTransferGetByIdDTO OriginAccount { get; set; } = default!;
        public AccountTransferGetByIdDTO DestinationAccount { get; set; } = default!;

        public decimal Amount { get; set; }

        public DateTime EffectiveDate { get; set; }

        public string? Description { get; set; }
    }

    public class AccountTransferGetByIdDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CurrencyCode { get; set; } = string.Empty;
        public IconDTO Icon { get; set; } = default!;
    }
}
