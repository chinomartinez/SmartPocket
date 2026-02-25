using Microsoft.AspNetCore.Mvc;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;
using IResult = SmartPocket.SharedKernel.Results.IResult;

namespace SmartPocket.WebApi.Extensions
{
    internal static class ActionResultExtensions
    {
        internal static ActionResult<T> ToActionResult<T, E>(this IResult<T, E> result)
        {
            return result.IsSuccess
                ? new OkObjectResult(result.Value)
                : new BadRequestObjectResult(result.Error);
        }

        internal static ActionResult ToActionResult<E>(this IResult<E> result)
        {
            return result.IsSuccess
                ? new OkResult()
                : new BadRequestObjectResult(result.Error);
        }

        internal static ActionResult ToActionResult(this IResult result)
        {
            return result.IsSuccess
                ? new OkResult()
                : new BadRequestResult();
        }

        internal static ActionResult ToActionResult(this ErrorDetails result)
        {
            return result.IsEmpty
                ? new OkResult()
                : new BadRequestObjectResult(result);
        }        
    }
}
