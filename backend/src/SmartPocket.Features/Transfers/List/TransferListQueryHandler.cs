using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transfers;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transfers.List
{
    public class TransferListQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransferListQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<List<TransferListItemDTO>> Get(TransferListRequest request, CancellationToken cancellation)
        {
            var transfers = await _smartPocketContext.Query<Transfer>()
                .Where(t => t.EffectiveDate >= request.From && t.EffectiveDate <= request.To)
                .OrderByDescending(t => t.EffectiveDate)
                .ThenByDescending(t => t.Id)
                .Select(t => new TransferListItemDTO
                {
                    Id = t.Id,
                    Amount = t.OriginTransaction.Amount,
                    EffectiveDate = t.EffectiveDate,
                    Description = t.Description,
                    OriginAccount = new AccountTransferListItemDTO
                    {
                        Id = t.OriginTransaction.AccountId,
                        Name = t.OriginTransaction.Account.Name,
                        CurrencyCode = t.OriginTransaction.Account.CurrencyCode,
                        Icon = new()
                        {
                            Code = t.OriginTransaction.Account.Icon.Code,
                            ColorHex = t.OriginTransaction.Account.Icon.ColorHex
                        }
                    },
                    DestinationAccount = new AccountTransferListItemDTO
                    {
                        Id = t.DestinationTransaction.AccountId,
                        Name = t.DestinationTransaction.Account.Name,
                        CurrencyCode = t.DestinationTransaction.Account.CurrencyCode,
                        Icon = new()
                        {
                            Code = t.DestinationTransaction.Account.Icon.Code,
                            ColorHex = t.DestinationTransaction.Account.Icon.ColorHex
                        }
                    }
                })
                .ToListAsync(cancellation);

            return transfers;
        }
    }
}
