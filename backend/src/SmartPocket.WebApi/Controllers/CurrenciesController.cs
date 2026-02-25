using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Currencies;

namespace SmartPocket.WebApi.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CurrenciesController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<CurrencyItemDTO> GetAll()
        {
            var result = CurrencyItemDTOMapper.GetAll();
            return result;
        }
    }
}
