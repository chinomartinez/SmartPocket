using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.CreditCardStatements.Create;
using SmartPocket.Features.CreditCardStatements.Delete;
using SmartPocket.Features.CreditCardStatements.GetById;
using SmartPocket.Features.CreditCardStatements.List;
using SmartPocket.Features.CreditCardStatements.Suggestions;
using SmartPocket.Features.CreditCardStatements.Update;
using SmartPocket.Persistence.PagedQuery;
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

        [HttpGet]
        public async Task<PagedListResponse<CreditCardStatementListItemDTO>> List(
            [FromServices] CreditCardStatementListQueryHandler handler,
            [FromQuery] CreditCardStatementListRequest query,
            CancellationToken cancellation)
        {
            return await handler.Get(query, cancellation);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CreditCardStatementGetByIdDTO>> Detail(
            [FromServices] CreditCardStatementGetByIdQueryHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.GetById(id, cancellation);
            return result is null ? NotFound($"Credit card statement with ID {id} not found.") : Ok(result);
        }

        [HttpGet("/CreditCards/{creditCardId}/[controller]/suggestions")]
        public async Task<CreditCardStatementSuggestionsDTO> Suggestions(
            [FromServices] ICreditCardStatementSuggestionsQueryHandler handler,
            [FromRoute] int creditCardId,
            [FromQuery] DateTime closingDate,
            CancellationToken cancellation)
        {
            return await handler.Get(creditCardId, closingDate, cancellation);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(
            [FromServices] CreditCardStatementDeleteCommandHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.Delete(id, cancellation);
            return result.ToActionResult();
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
                DueDate = body.DueDate,
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

            public DateTime DueDate { get; set; }

            public int[] InstallmentIds { get; set; } = default!;

            public SubsChargeForUpdateStatementUpdateCommand[] SubsChargesForUpdate { get; set; } = default!;

            public SubsChargeForCreateStatementUpdateCommand[] SubsChargesForCreate { get; set; } = default!;
        }

        #endregion

    }
}
