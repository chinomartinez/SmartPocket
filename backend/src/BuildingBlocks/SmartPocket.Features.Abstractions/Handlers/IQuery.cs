namespace SmartPocket.Features.Abstractions.Handlers
{
    public interface IQuery<TId> 
    {
        TId Id { get; set; }
    }
}
