using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Categories.Create;
using SmartPocket.Features.Categories.Get;
using SmartPocket.Features.Categories.GetById;
using SmartPocket.Features.Categories.Remove;
using SmartPocket.Features.Categories.Reorder;
using SmartPocket.Features.Categories.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CategoriesController : ControllerBase
    {
        [HttpGet]
        public async Task<List<CategoryGetDTO>> Get([FromServices] CategoryGetQueryHandler categoryGetHandler,
            [FromQuery] bool isIncome,
            CancellationToken cancellation)
        {
            var request = new CategoryGetRequest { IsIncome = isIncome };

            var result = await categoryGetHandler.GetAll(request, cancellation);

            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryGetByIdDTO>> GetById([FromServices] CategoryGetByIdQueryHandler categoryGetByIdQueryHandler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await categoryGetByIdQueryHandler.TryGet(id, cancellation);

            if (result is null) return NotFound();

            return result;
        }

        [HttpPost]
        public async Task<ActionResult<CategoryCreateResponse>> Create([FromServices] CategoryCreateCommandHandler categoryCreateCommandHandler,
            [FromBody] CategoryCreateCommand command,
            CancellationToken cancellation)
        {
            var result = await categoryCreateCommandHandler.Create(command, cancellation);

            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update([FromServices] CategoryUpdateCommandHandler categoryUpdateCommandHandler,
            [FromRoute] int id,
            [FromBody] CategoryCreateCommand createCommand,
            CancellationToken cancellation)
        {
            var command = new CategoryUpdateCommand
            {
                Id = id,
                Name = createCommand.Name,
                IsIncome = createCommand.IsIncome,
                Icon = createCommand.Icon,
            };

            var result = await categoryUpdateCommandHandler.Update(command, cancellation);

            return result.ToActionResult();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Remove([FromServices] CategoryRemoveCommandHandler categoryRemoveCommandHandler,
            [FromRoute] int id,
            CancellationToken cancellation)
        {
            var result = await categoryRemoveCommandHandler.Remove(id, cancellation);

            return result.ToActionResult();
        }

        [HttpPut("reorder")]
        public async Task<ActionResult> Reorder([FromServices] CategoryReorderCommandHandler categoryReorderCommandHandler,
            [FromBody] CategoryReorderCommand command,
            CancellationToken cancellation)
        {
            var result = await categoryReorderCommandHandler.Reorder(command, cancellation);

            return result.ToActionResult();
        }
    }
}
