using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using SmartPocket.SharedKernel.Errors;

namespace SmartPocket.WebApi.Errors
{
    public class ErrorResultFilter : IResultFilter
    {
        private readonly ProblemDetailsFactory _factory;

        public ErrorResultFilter(ProblemDetailsFactory factory)
        {
            _factory = factory;
        }

        public void OnResultExecuted(ResultExecutedContext context)
        {
            return;
        }

        public void OnResultExecuting(ResultExecutingContext context)
        {
            var result = context.Result;

            if (result is not ObjectResult objR)
                return;

            if (objR.StatusCode is null or < 400 or >= 500)
                return;

            if (objR.Value is null) 
                return;

            if (objR.Value is ProblemDetails)
                return;

            if (TryConvertToErrors(objR.Value, out var errors) is false)
                return;

            var problem = _factory.CreateProblemDetails(
                httpContext: context.HttpContext,
                statusCode: objR.StatusCode,
                title: "One or more errors occurred.",
                detail: "See the errors property for more details.");

            var apiProblem = new ApiProblemDetails
            {
                Type = problem.Type,
                Title = problem.Title,
                Status = problem.Status,
                Detail = problem.Detail,
                Instance = problem.Instance,
                Extensions = problem.Extensions,
                Errors = errors
            };

            objR.Value = apiProblem;
        }

        private static bool TryConvertToErrors(object value, out ErrorDetails result)
        {
            if (value is string strValue)
            {
                value = new ErrorDetail(strValue);
            }

            if (value is ErrorDetail errorResult)
            {
                value = new ErrorDetails([errorResult]);
            }

            if (value is ErrorDetails errors && errors.IsEmpty == false)
            {
                result = errors;
                return true;
            }

            result = default!;
            return false;
        }
    }
}
