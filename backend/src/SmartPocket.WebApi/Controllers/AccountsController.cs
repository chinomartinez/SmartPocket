using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Accounts.Create;
using SmartPocket.Features.Accounts.Delete;
using SmartPocket.Features.Accounts.Get;
using SmartPocket.Features.Accounts.GetById;
using SmartPocket.Features.Accounts.Update;
using SmartPocket.Persistence.PagedQuery;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public partial class AccountsController : ControllerBase
    {
        [HttpGet]
        public async Task<PagedListResponse<AccountGetDTO>> Get(
            [FromServices] AccountGetQueryHandler handler,
            CancellationToken cancellation)
        {
            var result = await handler.GetAll(new AccountGetRequest(), cancellation);

            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AccountGetByIdDTO>> GetById([FromServices] AccountGetByIdQueryHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.TryGet(id, cancellation);

            if (result is null) return NotFound("Account with given id not found.");

            return result;
        }

        [HttpPost]
        public async Task<ActionResult<AccountCreateResponse>> Create([FromServices] AccountCreateCommandHandler handler,
            [FromBody] AccountCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);

            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update([FromServices] AccountUpdateCommandHandler handler,
            [FromRoute] int id,
            [FromBody] AccountCreateCommand createCommand,
            CancellationToken cancellation)
        {
            var command = new AccountUpdateCommand
            {
                Id = id,
                Name = createCommand.Name,
                Balance = createCommand.Balance,
                CurrencyCode = createCommand.CurrencyCode,
                Icon = createCommand.Icon,
                IncludeInBalanceGlobal = createCommand.IncludeInBalanceGlobal
            };

            var result = await handler.Update(command, cancellation);

            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete([FromServices] AccountDeleteCommandHandler handler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await handler.SoftDelete(id, cancellation);

            return result.ToActionResult();
        }
    } 
}
