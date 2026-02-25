using Microsoft.AspNetCore.Mvc;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.WebApi.Errors
{
    public class ApiProblemDetails : ProblemDetails
    {
        public ErrorDetails Errors { get; init; } = default!;
    }
}
