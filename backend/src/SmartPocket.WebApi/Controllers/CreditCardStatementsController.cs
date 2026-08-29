using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.CreditCardStatements.Create;
using SmartPocket.Features.CreditCardStatements.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CreditCardStatementsController : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<CreditCardStatementCreateResponse>> Create(
            [FromServices] CreditCardStatementCreateCommandHandler handler,
            [FromBody] CreditCardStatementCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);
            return result.ToActionResult(value => new CreditCardStatementCreateResponse(value));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(
            [FromServices] CreditCardStatementUpdateCommandHandler handler,
            [FromRoute] int id,
            [FromBody] CreditCardStatementUpdateBody body,
            CancellationToken cancellation)
        {
            var command = new CreditCardStatementUpdateCommand
            {
                ClosingDate = body.ClosingDate,
                CreditCardId = body.CreditCardId,
                Description = body.Description,
                Id = id,
                InstallmentIds = body.InstallmentIds,
                SubsChargesForCreate = body.SubsChargesForCreate,
                SubsChargesForUpdate = body.SubsChargesForUpdate
            };

            var result = await handler.Update(command, cancellation);
            return result.ToActionResult();
        }

        #region Records

        public record CreditCardStatementCreateResponse(int CreditCardStatementId);

        public record CreditCardStatementUpdateBody
        {
            public int CreditCardId { get; set; }

            public string Description { get; set; } = default!;

            public DateTime ClosingDate { get; set; }

            public int[] InstallmentIds { get; set; } = default!;

            public SubsChargeForUpdateStatementUpdateCommand[] SubsChargesForUpdate { get; set; } = default!;

            public SubsChargeForCreateStatementUpdateCommand[] SubsChargesForCreate { get; set; } = default!;
        }

        #endregion

    }
}
