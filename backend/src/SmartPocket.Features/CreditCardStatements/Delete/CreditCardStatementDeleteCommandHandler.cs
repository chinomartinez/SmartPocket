using Microsoft.EntityFrameworkCore;
using SmartPocket.Domain.CreditCards;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;

namespace SmartPocket.Features.CreditCardStatements.Delete
{
    public class CreditCardStatementDeleteCommandHandler : IHandler
    {
        private readonly ISmartPocketContext _smartPocketContext;

        public CreditCardStatementDeleteCommandHandler(ISmartPocketContext smartPocketContext)
        {
            _smartPocketContext = smartPocketContext;
        }

        public async Task<Result<ErrorDetail>> Delete(int id, CancellationToken cancellation)
        {
            var statement = await _smartPocketContext.Query<CreditCardStatement>()
                .Where(x => x.Id == id)
                .FirstOrDefaultAsync(cancellation);

            if (statement is null)
            {
                return new ErrorDetail($"Credit card Statement with id {id} not found.");
            }

            var installments = await _smartPocketContext.Query<CreditCardPurchaseInstallment>()
                .Where(x => x.CreditCardStatementId == id)
                .ToListAsync(cancellation);

            var charges = await _smartPocketContext.Query<CreditCardSubscriptionCharge>()
                .Where(x => x.CreditCardStatementId == id)
                .ToListAsync(cancellation);

            foreach (var installment in installments)
            {
                installment.UnlinkFromStatement();
            }

            _smartPocketContext.DeleteRange(charges);
            _smartPocketContext.DeleteEntity(statement);
            
            await _smartPocketContext.SaveChangesAsync(cancellation);

            return Result<ErrorDetail>.Success();
        }
    }
}
