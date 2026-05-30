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
            CancellationToken cancellation)
        {
            var response = await queryHandler.Get(cancellation);
            return response;
        }

        [HttpGet("monthlybalances")]
        public async Task<MonthlyBalanceDTO> GetMonthlyBalances(
            [FromServices] MonthlyBalancesQueryHandler queryHandler,
            CancellationToken cancellation)
        {
            var response = await queryHandler.Get(cancellation);
            return response;
        }
    }
}
