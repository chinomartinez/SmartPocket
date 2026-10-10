using Microsoft.AspNetCore.Mvc;
using SmartPocket.SharedKernel.Errors;
using SmartPocket.SharedKernel.Results;
using ISimpleResult = SmartPocket.SharedKernel.Results.ISimpleResult;

namespace SmartPocket.WebApi.Extensions
{
    internal static class ActionResultExtensions
    {
        internal static ActionResult<T> ToActionResult<T, E>(this ISimpleResult<T, E> result)
        {
            return result.ToActionResult(r => r);
        }

        internal static ActionResult<TValue> ToActionResult<T, E, TValue>(this ISimpleResult<T, E> result,
            Func<T, TValue> factory)
        {
            return result.IsSuccess
                ? new OkObjectResult(factory(result.Value))
                : new BadRequestResult();
        }

        internal static ActionResult ToActionResult<E>(this ISimpleResult<E> result)
        {
            return result.IsSuccess
                ? new OkResult()
                : new BadRequestObjectResult(result.Error);
        }

        internal static ActionResult ToActionResult(this ISimpleResult result)
        {
            return result.IsSuccess
                ? new OkResult()
                : new BadRequestResult();
        }

        internal static ActionResult ToActionResult(this ErrorDetailList result)
        {
            return result.IsEmpty
                ? new OkResult()
                : new BadRequestObjectResult(result);
        }        
    }
}
