using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.CreditCardSubscriptions.Cancel;
using SmartPocket.Features.CreditCardSubscriptions.Create;
using SmartPocket.Features.CreditCardSubscriptions.Delete;
using SmartPocket.Features.CreditCardSubscriptions.List;
using SmartPocket.Features.CreditCardSubscriptions.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CreditCardSubscriptionsController : ControllerBase
    {
        [HttpGet("creditCards/{creditCardId}")]
        public async Task<List<CreditCardSubscriptionListItemDTO>> Get(
            [FromServices] CreditCardSubscriptionListQueryHandler queryHandler,
            [FromRoute] int creditCardId,
            [FromQuery] CreditCardSubscriptionListFilters filters,
            CancellationToken cancellation)
        {
            var result = await queryHandler.Get(creditCardId, filters, cancellation);
            return result;
        }

        [HttpPost]
        public async Task<ActionResult<CreditCardSubscriptionCreateResponse>> Create(
            [FromServices] CreditCardSubscriptionCommandCreateHandler handler,
            [FromBody] CreditCardSubscriptionCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(
            [FromServices] CreditCardSubscriptionUpdateCommandHandler handler,
            [FromRoute] int id,
            [FromBody] CreditCardSubscriptionCreateCommand command,
            CancellationToken cancellation)
        {
            var updateCommand = new CreditCardSubscriptionUpdateCommand
            {
                Id = id,
                CreditCardId = command.CreditCardId,
                CategoryId = command.CategoryId,
                Description = command.Description,
                EffectiveDate = command.EffectiveDate,
                SubscriptionAmount = command.SubscriptionAmount,
            };

            var result = await handler.Update(updateCommand, cancellation);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(
            [FromServices] CreditCardSubscriptionDeleteHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.Delete(id, cancellation);
            return result.ToActionResult();
        }

        [HttpPatch("{id}/cancel")]
        public async Task<ActionResult> Cancel(
            [FromServices] CreditCardSubscriptionCancelCommandHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.Cancel(id, cancellation);
            return result.ToActionResult();
        }
    }
}
