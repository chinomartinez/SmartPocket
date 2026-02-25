using SmartPocket.SharedKernel.Guards;
using System.Collections;
using System.Text.Json.Serialization;

namespace SmartPocket.SharedKernel.Errors
{
    public enum ErrorSeverity
    {
        Danger,
        Warning
    }

    public readonly record struct ErrorDetail
    {
        public string Message { get; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ErrorSeverity Severity { get; init; } = ErrorSeverity.Danger;

        public string? PropertyName { get; init; }

        public ErrorDetail(string message)
        {
            Message = message.GetIfNotNullOrWhiteSpace(nameof(message));
        }

        public static implicit operator ErrorDetail(string message) 
            => new(message);
    }

    public class ErrorDetails : IEnumerable<ErrorDetail>
    {
        private readonly List<ErrorDetail> _errors = new();

        public ErrorDetails(IEnumerable<ErrorDetail> errors)
        {
            if (errors is null)
                throw new ArgumentNullException(nameof(errors));

            if (!errors.Any())
                return;

            _errors.AddRange(errors);
        }

        public IEnumerator<ErrorDetail> GetEnumerator()
        {
            return _errors.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public bool IsEmpty => _errors.Count == 0;

        public static ErrorDetails Empty => new([]);
    }
}
