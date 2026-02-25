using FluentValidation;
using SmartPocket.Features.Abstractions.Handlers;
using System.Reflection;

namespace SmartPocket.WebApi.Setup
{
    public static class FeatureSetup
    {
        public static Assembly FeatureAssembly => Assembly.Load("SmartPocket.Features");

        public static void AddFeatures(this IServiceCollection services)
        {
            services.AddFluentValidations();
            services.AddFeatureHandlers();
        }

        public static void AddFluentValidations(this IServiceCollection services)
        {
            services.AddValidatorsFromAssembly(FeatureAssembly);

            ValidatorOptions.Global.DefaultRuleLevelCascadeMode = CascadeMode.Stop;
        }

        public static void AddFeatureHandlers(this IServiceCollection services)
        {
            // Registra todos os handlers que implementam a interface IHandler
            var ihandlerType = typeof(IHandler);

            var implementations = FeatureAssembly.GetTypes()
                .Where(t => t is { IsClass: true, IsAbstract: false })
                .Where(t => ihandlerType.IsAssignableFrom(t))
                .ToList();

            foreach (var implementation in implementations)
            {
                var handlerInterfaces = implementation
                    .GetInterfaces()
                    .Where(i => i != ihandlerType && ihandlerType.IsAssignableFrom(i));

                if (!handlerInterfaces.Any())
                {
                    services.AddScoped(implementation);
                }

                foreach (var handlerInterface in handlerInterfaces)
                {
                    services.AddScoped(handlerInterface, implementation);
                }
            }
        }
    }
}
