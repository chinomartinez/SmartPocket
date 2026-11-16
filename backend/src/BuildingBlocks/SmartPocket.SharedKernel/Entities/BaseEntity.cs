namespace SmartPocket.SharedKernel.Entities
{
    public abstract class BaseEntity
    {
        public abstract object GetId();
    }

    public abstract class BaseEntity<T> : BaseEntity
    {
        public T Id { get; init; } = default!;

        public override object GetId() => Id!;
    }
}
