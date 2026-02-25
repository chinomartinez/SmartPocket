namespace SmartPocket.SharedKernel.Entities
{
    public interface ITimestampedEntity
    {
        DateTime CreatedAt { get; }

        DateTime? LastModifiedAt { get; }

        void SetCreated(DateTime? createdAt = null);

        void SetLastModified(DateTime? lastModifiedAt = null);
    }
}
