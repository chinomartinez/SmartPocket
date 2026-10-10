namespace SmartPocket.SharedKernel.Results
{
    public class SimpleResult : ISimpleResult
    {
        public bool IsFailure { get; }

        public bool IsSuccess { get => !IsFailure; }

        protected SimpleResult(bool isFailure)
        {
            IsFailure = isFailure;
        }

        public static SimpleResult Failure() => new(true);

        public static SimpleResult Success() => new(false);
    }
}
