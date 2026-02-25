using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.SharedKernel.Results
{
    public class ResultWithErrors<T> : Result<T, ErrorDetails>
    {
        public ResultWithErrors(ErrorDetails error) : base(error)
        {
        }

        public ResultWithErrors(T value) : base(value)
        {
        }

        public static implicit operator ResultWithErrors<T>(ErrorDetails errors)
        {
            return new(errors);
        }

        public static implicit operator ResultWithErrors<T>(T value)
        {
            return new(value);
        }
    }

    public class ResultWithError<T> : Result<T, ErrorDetail>
    {
        public ResultWithError(ErrorDetail error) : base(error)
        {
        }

        public ResultWithError(T value) : base(value)
        {
        }

        public static implicit operator ResultWithError<T>(string errorMessage)
        {
            return new(new ErrorDetail(errorMessage));
        }


        public static implicit operator ResultWithError<T>(ErrorDetail error)
        {
            return new(error);
        }

        public static implicit operator ResultWithError<T>(T value)
        {
            return new(value);
        }
    }
}
