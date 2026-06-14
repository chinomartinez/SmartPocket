using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.CreditCardPurchases.Create;
using SmartPocket.Features.CreditCardPurchases.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CreditCardPurchasesController : ControllerBase
    {
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
                IsInstallment = command.IsInstallment,
                Installments = command.Installments,
                OriginalAmount = command.OriginalAmount
            };

            var result = await handler.Update(updateCommand, cancellation);
            return result.ToActionResult();
        }
    }
}
