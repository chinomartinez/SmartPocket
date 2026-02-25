namespace SmartPocket.SharedKernel.DTOs
{
    public abstract class BaseDTO<TId>
    {
        public TId Id { get; set; } = default!;
    }
}
