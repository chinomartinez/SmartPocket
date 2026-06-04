using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.Transfers;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;

namespace SmartPocket.Features.Transfers.GetById
{
    public class TransferGetByIdQueryHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public TransferGetByIdQueryHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<TransferGetByIdDTO?> TryGet(int id, CancellationToken cancellationToken)
        {
            var result = await _smartPocketContext.Query<Transfer>()
                .Where(x => x.Id == id)
                .Select(x => new TransferGetByIdDTO
                {
                    Id = x.Id,
                    Amount = x.OriginTransaction.Amount,
                    Description = x.Description,
                    EffectiveDate = x.EffectiveDate,
                    OriginAcount = new()
                    {
                        Id = x.OriginTransaction.AccountId,
                        Name = x.OriginTransaction.Account.Name,
                        CurrencyCode = x.OriginTransaction.Account.CurrencyCode,
                        Icon = new()
                        {
                            Code = x.OriginTransaction.Account.Icon.Code,
                            ColorHex = x.OriginTransaction.Account.Icon.ColorHex
                        }
                    },
                    DestinationAccount = new()
                    {
                        Id = x.DestinationTransaction.AccountId,
                        Name = x.DestinationTransaction.Account.Name,
                        CurrencyCode = x.DestinationTransaction.Account.CurrencyCode,
                        Icon = new()
                        {
                            Code = x.DestinationTransaction.Account.Icon.Code,
                            ColorHex = x.DestinationTransaction.Account.Icon.ColorHex
                        }
                    },
                })
                .FirstOrDefaultAsync(cancellationToken);

            return result;
        }
    }
}
