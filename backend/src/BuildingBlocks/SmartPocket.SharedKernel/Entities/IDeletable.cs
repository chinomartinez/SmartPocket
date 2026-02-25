namespace SmartPocket.SharedKernel.Entities
{
    public interface IDeletable
    {
        bool IsDeleted { get; set; }
    }
}
