namespace SmartPocket.Features.Abstractions.Handlers
{
    public interface ICommand<TId>
    {
        TId Id { get; set; }
    }
}
