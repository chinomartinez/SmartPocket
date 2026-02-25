using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Accounts;
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
        private readonly AccountExistsQueryHandler _accountExistsQueryHandler;

        public AccountsController(AccountExistsQueryHandler accountExistsQueryHandler)
        {
            _accountExistsQueryHandler = accountExistsQueryHandler;
        }

        [HttpGet]
        public async Task<PagedListResponse<AccountGetDTO>> Get(
            [FromServices] AccountGetQueryHandler handler,
            CancellationToken cancellation)
        {
            var result = await handler.GetAll(new AccountGetQuery(), cancellation);

            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AccountGetByIdDTO>> GetById([FromRoute] int id,
            [FromServices] AccountGetByIdQueryHandler handler,
            CancellationToken cancellation)
        {
            var result = await handler.TryGet(id, cancellation);

            if (result is null) return NotFound("Account with given id not found.");

            return result;
        }

        [HttpPost]
        public async Task<ActionResult<AccountCreateResponse>> Create(
            [FromBody] AccountCreateCommand command,
            [FromServices] AccountCreateCommandHandler handler,
            CancellationToken cancellation)
        {
            var result = await handler.Create(command, cancellation);

            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update([FromRoute] int id,
            [FromBody] AccountCreateCommand createCommand,
            [FromServices] AccountUpdateCommandHandler handler,
            CancellationToken cancellation)
        {
            if (await IsAccountNotFound(id, cancellation) is { } notFoundResult)
                return notFoundResult;

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
        public async Task<ActionResult> Delete([FromRoute] int id,
            [FromServices] AccountDeleteCommandHandler handler,
            CancellationToken cancellation)
        {
            if (await IsAccountNotFound(id, cancellation) is { } notFoundResult)
                return notFoundResult;

            var command = new AccountDeleteCommand
            {
                Id = id
            };

            var result = await handler.SoftDelete(command, cancellation);

            return result.ToActionResult();
        }

        private async Task<NotFoundObjectResult?> IsAccountNotFound(int id, CancellationToken cancellation)
        {
            var exists = await _accountExistsQueryHandler.Exists(id, cancellation);

            if (!exists) return NotFound($"Account with id '{id}' not found.");

            return null;
        }
    } 
}
