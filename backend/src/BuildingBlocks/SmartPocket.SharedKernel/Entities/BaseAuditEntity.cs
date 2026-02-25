namespace SmartPocket.SharedKernel.Entities
{
    public class BaseAuditEntity<T> : BaseEntity<T>, ITimestampedEntity, IDeletable
    {
        public DateTime CreatedAt { get; protected set; }

        public DateTime? LastModifiedAt { get; protected set; }

        public bool IsDeleted { get; set; }

        public BaseAuditEntity()
        {
            IsDeleted = false;
        }

        public void SetCreated(DateTime? createdAt = null)
        {
            CreatedAt = createdAt ?? DateTime.UtcNow;
        }

        public void SetLastModified(DateTime? lastModifiedAt = null)
        {
            LastModifiedAt = lastModifiedAt ?? DateTime.UtcNow;
        }
    }
}
