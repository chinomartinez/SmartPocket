using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.SharedKernel.Results
{
    public class ResultWithErrors<T> : SimpleResult<T, ErrorDetailList>
    {
        public ResultWithErrors(ErrorDetailList error) : base(error)
        {
        }

        public ResultWithErrors(T value) : base(value)
        {
        }

        public static implicit operator ResultWithErrors<T>(ErrorDetailList errors)
        {
            return new(errors);
        }

        public static implicit operator ResultWithErrors<T>(T value)
        {
            return new(value);
        }
    }
}
