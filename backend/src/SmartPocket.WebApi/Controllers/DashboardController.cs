using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Dashboard.AccountBalances;
using SmartPocket.Features.Dashboard.MonthlyBalance;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        [HttpGet("accountBalances")]
        public async Task<AccountBalancesResponse> GetAccountBalances(
            [FromServices] AccountBalancesQueryHandler queryHandler,
            [FromQuery] int accountId,
            CancellationToken cancellation)
        {
            var response = await queryHandler.Get(accountId, cancellation);
            return response;
        }

        [HttpGet("monthlybalances")]
        public async Task<MonthlyBalanceDTO> GetMonthlyBalances(
            [FromServices] MonthlyBalancesQueryHandler queryHandler,
            [FromQuery] int accountId,
            CancellationToken cancellation)
        {
            var response = await queryHandler.Get(accountId, cancellation);
            return response;
        }
    }
}
