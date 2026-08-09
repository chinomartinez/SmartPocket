using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.CreditCardPurchases.Create;
using SmartPocket.Features.CreditCardPurchases.Delete;
using SmartPocket.Features.CreditCardPurchases.List;
using SmartPocket.Features.CreditCardPurchases.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CreditCardPurchasesController : ControllerBase
    {
        [HttpGet("creditCards/{creditCardId}")]
        public async Task<List<CreditCardPurchaseListItemDTO>> Get(
            [FromServices] CreditCardPurchaseListQueryHandler queryHandler,
            [FromRoute] int creditCardId,
            [FromQuery] CreditCardPurchaseListFilters filters,
            CancellationToken cancellation)
        {
            var result = await queryHandler.Get(creditCardId, filters, cancellation);
            return result;
        }

        [HttpPost]
        public async Task<ActionResult<CreditCardPurchaseCreateResponse>> Create(
            [FromServices] CreditCardPurchaseCommandCreateHandler handler,
            [FromBody] CreditCardPurchaseCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(
            [FromServices] CreditCardPurchaseUpdateCommandHandler handler,
            [FromRoute] int id,
            [FromBody] CreditCardPurchaseCreateCommand command,
            CancellationToken cancellation)
        {
            var updateCommand = new CreditCardPurchaseUpdateCommand
            {
                Id = id,
                CreditCardId = command.CreditCardId,
                CategoryId = command.CategoryId,
                Description = command.Description,
                EffectiveDate = command.EffectiveDate,
                PurchaseAmount = command.PurchaseAmount,
                Installments = command.Installments,
            };

            var result = await handler.Update(updateCommand, cancellation);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(
            [FromServices] CreditCardPurchaseDeleteHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.Delete(id, cancellation);
            return result.ToActionResult();
        }
    }
}
