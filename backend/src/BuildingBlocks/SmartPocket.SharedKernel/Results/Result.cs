namespace SmartPocket.SharedKernel.Results
{
    public class Result : IResult
    {
        public bool IsFailure { get; }

        public bool IsSuccess { get => !IsFailure; }

        protected Result(bool isFailure)
        {
            IsFailure = isFailure;
        }

        public static Result Failure() => new(true);

        public static Result Success() => new(false);
    }
}
