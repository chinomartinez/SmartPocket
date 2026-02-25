using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace SmartPocket.WebApi.Errors
{
    public class ApiProducesConvention : IApplicationModelConvention
    {
        private readonly ProducesResponseTypeAttribute _serverError = new(typeof(ProblemDetails), 500);

        public void Apply(ApplicationModel application)
        {
            var actions = application.Controllers.SelectMany(c => c.Actions);

            foreach (var action in actions)
            {
                var (returnType, fromActionResult) = GetReturn(action);
                
                ApplyResponseTypes(action, returnType, fromActionResult);
            }            
        }

        private (Type returnType, bool FromActionResult) GetReturn(ActionModel action)
        {
            var returnType = action.ActionMethod.ReturnType;

            // Manejar Task o ValueTask sin genérico
            if (returnType == typeof(Task) || returnType == typeof(ValueTask))
            {
                return (typeof(void), false);
            }

            // Unwrap Task<T> o ValueTask<T>
            if (returnType.IsGenericType)
            {
                var genericTypeDef = returnType.GetGenericTypeDefinition();

                if (genericTypeDef == typeof(Task<>) || genericTypeDef == typeof(ValueTask<>))
                {
                    returnType = returnType.GetGenericArguments()[0];
                }
            }

            // Verificar si es ActionResult (sin genérico) o IActionResult
            if (returnType == typeof(ActionResult) || returnType == typeof(IActionResult))
            {
                return (typeof(void), true);
            }

            // Unwrap ActionResult<T>
            if (returnType.IsGenericType && returnType.GetGenericTypeDefinition() == typeof(ActionResult<>))
            {
                var innerType = returnType.GetGenericArguments()[0];
                return (innerType, true);
            }

            // No es ActionResult, retornar el tipo directo
            return (returnType, false);
        }

        private void ApplyResponseTypes(ActionModel action, Type responseType, bool applyApiProblen)
        {
            var hasOkProduces = GetProduces(action, p => p.StatusCode >= 200 && p.StatusCode < 300).Length != 0;

            if (!hasOkProduces)
            {
                var produceOk = responseType == typeof(void)
                    ? new ProducesResponseTypeAttribute(200)
                    : new ProducesResponseTypeAttribute(responseType, 200);

                action.Filters.Add(produceOk);
            }

            if (applyApiProblen)
            {
                var errorProduces = GetProduces(action, p => p.StatusCode >= 400 && p.StatusCode < 500);

                for (var i = 0; i < errorProduces.Length; i++)
                {
                    var errorProduce = errorProduces[i];
                    action.Filters.Remove(errorProduce);

                    action.Filters.Add(CreateProduceError(errorProduce.StatusCode));
                }

                if (errorProduces.Length == 0)
                {
                    action.Filters.Add(CreateProduceError(400));
                }
            }

            var hasServerError = GetProduces(action, p => p.StatusCode == 500).Length != 0;

            if (!hasServerError)
            {
                action.Filters.Add(_serverError);
            }
        }

        private ProducesResponseTypeAttribute[] GetProduces(ActionModel action, 
            Func<ProducesResponseTypeAttribute, bool> predicate)
        {
            return [.. action.Filters
                .OfType<ProducesResponseTypeAttribute>()
                .Where(predicate)];
        }

        private ProducesResponseTypeAttribute CreateProduceError(int statusCode)
        {
            return new ProducesResponseTypeAttribute(typeof(ApiProblemDetails), statusCode);
        }
    }
}
