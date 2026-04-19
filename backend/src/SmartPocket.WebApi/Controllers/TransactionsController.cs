using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Transactions.Create;
using SmartPocket.Features.Transactions.GetById;
using SmartPocket.Features.Transactions.GetRecents;
using SmartPocket.Features.Transactions.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        public record TransactionCreateResponse(int Id);

        [HttpPost]
        public async Task<ActionResult<TransactionCreateResponse>> Create(
            [FromServices] TransactionCreateCommandHandler handler,
            [FromBody] TransactionCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);
            return result.ToActionResult((v) => new TransactionCreateResponse(v));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(
            [FromServices] TransactionUpdateCommandHandler handler,
            [FromBody] TransactionCreateCommand command,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var updateCommand = new TransactionUpdateCommand
            {
                Id = id,
                AccountId = command.AccountId,
                CategoryId = command.CategoryId,
                AccountMoney = command.AccountMoney,
                EffectiveDate = command.EffectiveDate,
                Description = command.Description,
                IsIncome = command.IsIncome
            };

            var result = await handler.Update(updateCommand, cancellation);

            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionGetByIdDTO>> Get(
            [FromServices] TransactionGetByIdQueryHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.GetById(id, cancellation);

            return result is null 
                ? NotFound("Transaction not found")
                : Ok(result);
        }

        [HttpGet("recents")]
        public async Task<List<RecentTransactionItemDTO>> GetRecents(
            [FromServices] TransactionGetRecentsQueryHandler handler,
            [FromQuery] int count = 5,
            CancellationToken cancellation = default)
        {
            var request = new TransactionGeRecentsRequest
            {
                Count = count
            };

            var result = await handler.Get(request, cancellation);
            return result;
        }
    }
}
