using Microsoft.AspNetCore.Mvc;
using SmartPocket.Features.Categories;
using SmartPocket.Features.Categories.Create;
using SmartPocket.Features.Categories.Get;
using SmartPocket.Features.Categories.GetById;
using SmartPocket.Features.Categories.Remove;
using SmartPocket.Features.Categories.Update;
using SmartPocket.WebApi.Extensions;

namespace SmartPocket.WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryExistsByIdQueryHandler _existsByIdQueryHandler;

        public CategoriesController(CategoryExistsByIdQueryHandler existsByIdQueryHandler)
        {
            _existsByIdQueryHandler = existsByIdQueryHandler;
        }

        [HttpGet]
        public async Task<List<CategoryGetDTO>> Get([FromQuery] bool isIncome,
            [FromServices] CategoryGetQueryHandler categoryGetHandler,
            CancellationToken cancellation)
        {
            var request = new CategoryGetQuery { IsIncome = isIncome };

            var result = await categoryGetHandler.GetAll(request, cancellation);

            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryGetByIdDTO>> GetById([FromRoute] int id,
            [FromServices] CategoryGetByIdQueryHandler categoryGetByIdQueryHandler,
            CancellationToken cancellation)
        {
            var result = await categoryGetByIdQueryHandler.TryGet(id, cancellation);

            if (result is null) return NotFound();

            return result;
        }

        [HttpPost]
        public async Task<ActionResult<CategoryCreateResponse>> Create([FromBody] CategoryCreateCommand command,
            [FromServices] CategoryCreateCommandHandler categoryCreateCommandHandler,
            CancellationToken cancellation)
        {
            var result = await categoryCreateCommandHandler.Create(command, cancellation);

            return result.ToActionResult();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update([FromRoute] int id,
            [FromBody] CategoryCreateCommand createCommand,
            [FromServices] CategoryUpdateCommandHandler categoryUpdateCommandHandler,
            CancellationToken cancellation)
        {
            if (await Exists(id, cancellation) is { } notFoundResult) return notFoundResult;

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
        public async Task<ActionResult> Remove([FromRoute] int id,
            [FromServices] CategoryRemoveCommandHandler categoryRemoveCommandHandler,
            CancellationToken cancellation)
        {
            if (await Exists(id, cancellation) is { } notFoundResult) return notFoundResult;

            var request = new CategoryRemoveCommand { Id = id };
            var result = await categoryRemoveCommandHandler.Remove(request, cancellation);

            return result.ToActionResult();
        }

        private async Task<NotFoundObjectResult?> Exists(int id, CancellationToken cancellation)
        {
            var exists = await _existsByIdQueryHandler.Exists(id, cancellation);
            return exists ? null : new NotFoundObjectResult($"Category with id {id} not found");
        }
    }
}
