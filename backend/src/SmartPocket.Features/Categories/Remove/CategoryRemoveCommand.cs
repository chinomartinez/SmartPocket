using SmartPocket.Features.Abstractions.Handlers;

namespace SmartPocket.Features.Categories.Remove
{
    public class CategoryRemoveCommand : ICommand<int>
    {
        public int Id { get; set; }
    }
}
