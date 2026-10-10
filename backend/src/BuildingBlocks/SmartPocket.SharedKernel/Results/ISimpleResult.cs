namespace SmartPocket.SharedKernel.Results
{
    public interface ISimpleResult
    {
        bool IsFailure { get; }
        bool IsSuccess { get; }
    }

    public interface ISimpleResult<out E> : ISimpleResult
    {
        E Error { get; }
    }

    public interface ISimpleResult<out T, out E> : ISimpleResult<E>
    {
        T Value { get; }
    }
}
