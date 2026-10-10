namespace SmartPocket.SharedKernel.Results
{
    public class SimpleResult<T, E> : SimpleResult<E>, ISimpleResult<T, E>
    {
        public T Value { get; }

        public SimpleResult(E error) : base(error)
        {
            Value = default!;
        }

        public SimpleResult(T value) : base()
        {
            Value = value;
        }

        public static implicit operator SimpleResult<T, E>(E error)
        {
            return Failure(error);
        }

        public static implicit operator SimpleResult<T, E>(T value)
        {
            return Success(value);
        }

        public new static SimpleResult<T, E> Failure(E error) => new(error);

        public static SimpleResult<T, E> Success(T value) => new(value);
    }
}
