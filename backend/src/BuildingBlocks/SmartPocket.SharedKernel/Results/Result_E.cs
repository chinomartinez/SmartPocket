namespace SmartPocket.SharedKernel.Results
{
    public class Result<E> : Result, IResult<E>
    {
        public E Error { get; }

        public Result(E error) : base(true)
        {
            Error = error;
        }

        public Result() : base(false)
        {
            Error = default!;
        }

        public static implicit operator Result<E>(E error)
        {
            return Failure(error);
        }

        public static Result<E> Failure(E error) => new(error);

        public new static Result<E> Success() => new();
    }
}
