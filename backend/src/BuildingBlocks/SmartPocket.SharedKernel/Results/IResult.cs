namespace SmartPocket.SharedKernel.Results
{
    public interface IResult
    {
        bool IsFailure { get; }
        bool IsSuccess { get; }
    }

    public interface IResult<out E> : IResult
    {
        E Error { get; }
    }

    public interface IResult<out T, out E> : IResult<E>
    {
        T Value { get; }
    }
}
