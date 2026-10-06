using FluentValidation;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Features.CreditCardStatements.Suggestions;
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

            services.AddScoped<ICreditCardStatementSuggestionsQueryHandler, CreditCardStatementSuggestionsQueryHandler>();
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
                services.AddScoped(implementation);
            }
        }
    }
}
