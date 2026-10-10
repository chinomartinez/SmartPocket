namespace SmartPocket.SharedKernel.Results
{
    public class SimpleResult<E> : SimpleResult, ISimpleResult<E>
    {
        public E Error { get; }

        public SimpleResult(E error) : base(true)
        {
            Error = error;
        }

        public SimpleResult() : base(false)
        {
            Error = default!;
        }

        public static implicit operator SimpleResult<E>(E error)
        {
            return Failure(error);
        }

        public static SimpleResult<E> Failure(E error) => new(error);

        public new static SimpleResult<E> Success() => new();
    }
}
