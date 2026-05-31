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

    
}
