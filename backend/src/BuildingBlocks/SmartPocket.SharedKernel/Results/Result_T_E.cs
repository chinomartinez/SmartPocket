namespace SmartPocket.SharedKernel.Results
{
    public class Result<T, E> : Result<E>, IResult<T, E>
    {
        public T Value { get; }

        public Result(E error) : base(error)
        {
            Value = default!;
        }

        public Result(T value) : base()
        {
            Value = value;
        }

        public static implicit operator Result<T, E>(E error)
        {
            return Failure(error);
        }

        public static implicit operator Result<T, E>(T value)
        {
            return Success(value);
        }

        public new static Result<T, E> Failure(E error) => new(error);

        public static Result<T, E> Success(T value) => new(value);
    }
}
