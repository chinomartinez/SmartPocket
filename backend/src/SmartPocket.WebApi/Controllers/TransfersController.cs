using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Transfers.Create;
using SmartPocket.Features.Transfers.Delete;
using SmartPocket.Features.Transfers.GetById;
using SmartPocket.Features.Transfers.List;
using SmartPocket.Features.Transfers.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TransfersController : ControllerBase
    {
        public record TransferCreateResponse(int Id);

        [HttpPost]
        public async Task<ActionResult<TransferCreateResponse>> Create(
            [FromServices] TransferCreateCommandHandler handler,
            [FromBody] TransferCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);
            return result.ToActionResult((v) => new TransferCreateResponse(v));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(
            [FromServices] TransferUpdateCommandHandler handler,
            [FromBody] TransferCreateCommand command,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var updateCommand = new TransferUpdateCommand
            {
                Id = id,
                Amount = command.Amount,
                EffectiveDate = command.EffectiveDate,
                Description = command.Description,
                DestinationAccountId = command.DestinationAccountId,
                OriginAccountId = command.OriginAccountId
            };

            var result = await handler.Update(updateCommand, cancellation);

            return result.ToActionResult();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransferGetByIdDTO>> Get(
            [FromServices] TransferGetByIdQueryHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.TryGet(id, cancellation);

            return result is null
                ? NotFound("Transfer not found")
                : Ok(result);
        }

        [HttpGet("list")]
        public async Task<ActionResult<List<TransferListItemDTO>>> GetList(
            [FromServices] TransferListQueryHandler handler,
            [FromQuery] TransferListRequest request,
            CancellationToken cancellation)
        {
            var result = await handler.Get(request, cancellation);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(
            [FromServices] TransferDeleteCommandHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.Delete(id, cancellation);
            return result.ToActionResult();
        }
    }
}
