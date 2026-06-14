using System.Collections;

namespace SmartPocket.SharedKernel.Errors
{
    public class ErrorDetailList : IEnumerable<ErrorDetail>
    {
        private readonly List<ErrorDetail> _errors = new();

        private ErrorDetailList()
        {
        }

        public ErrorDetailList(IEnumerable<ErrorDetail> errors)
        {
            ArgumentNullException.ThrowIfNull(errors);

            if (!errors.Any())
                return;

            _errors.AddRange(errors);
        }

        public ErrorDetailList(params ErrorDetail[] errors)
        {
            ArgumentNullException.ThrowIfNull(errors);

            if (!errors.Any())
                return;

            _errors.AddRange(errors);
        }

        public ErrorDetailList(params string[] errorMessages)
        {
            ArgumentNullException.ThrowIfNull(errorMessages);

            if (!errorMessages.Any())
                return;

            _errors.AddRange(errorMessages.Select(m => new ErrorDetail(m)));
        }

        public IEnumerator<ErrorDetail> GetEnumerator()
        {
            return _errors.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public void Add(ErrorDetail error)
        {
            _errors.Add(error);
        }

        public void Add(string message, ErrorSeverity severity = ErrorSeverity.Danger, string? propertyName = null)
        {
            _errors.Add(new ErrorDetail(message) { Severity = severity, PropertyName = propertyName });
        }

        public void Clear()
        {
            _errors.Clear();
        }

        public bool IsEmpty => _errors.Count == 0;

        public static ErrorDetailList Empty => new();
    }
}
