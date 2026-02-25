using FluentValidation;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.Features.Shared.Validators
{
    public static class ValidationExtensions
    {
        public record ValidationWithErrors(bool IsValid, ErrorDetails Errors)
        {
            public bool IsNotValid { get => !IsValid; }
        }

        public static async Task<ValidationWithErrors> ValidateCommand<T>(this IValidator<T> validator,
            T command,
            CancellationToken cancellationToken = default)
            where T : class
        {
            var result = await validator.ValidateAsync(command, cancellationToken);

            var errors = result
                .Errors
                .Select(e => new ErrorDetail(e.ErrorMessage)
                {
                    PropertyName = e.PropertyName
                });

            return new(result.IsValid, new(errors));
        }
    }
}
