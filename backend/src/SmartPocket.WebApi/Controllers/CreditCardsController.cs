using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.CreditCards.Create;
using SmartPocket.Features.CreditCards.Delete;
using SmartPocket.Features.CreditCards.List;
using SmartPocket.Features.CreditCards.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CreditCardsController : ControllerBase
    {
        [HttpGet]
        public async Task<List<CreditCardListItemDTO>> Get(
            [FromServices] CreditCardListQueryHandler handler,
            CancellationToken cancellation)
        {
            var result = await handler.Get(cancellation);
            return result;
        }

        [HttpPost]
        public async Task<ActionResult<CreditCardCreateResponse>> Create(
            [FromServices] CreditCardCreateCommandHandler handler,
            [FromBody] CreditCardCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);
            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(
            [FromServices] CreditCardUpdateCommandHandler handler,
            [FromRoute] int id,
            [FromBody] CreditCardCreateCommand command,
            CancellationToken cancellation)
        {
            var updateCommand = new CreditCardUpdateCommand
            {
                Id = id,
                Name = command.Name,
                Icon = command.Icon,
                CurrencyCode = command.CurrencyCode,
                CreditLimit = command.CreditLimit,
                StatementClosingDay = command.StatementClosingDay,
                PaymentDueDay = command.PaymentDueDay
            };

            var result = await handler.Update(updateCommand, cancellation);
            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(
            [FromServices] CreditCardDeleteCommandHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.Delete(id, cancellation);
            return result.ToActionResult();
        }
    }
}
