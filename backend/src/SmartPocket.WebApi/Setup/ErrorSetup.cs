using SmartPocket.WebApi.Errors;

namespace SmartPocket.WebApi.Setup
{
    internal static class ErrorSetup
    {
        internal static void AddErrors(this IServiceCollection services)
        {
            services.AddScoped<ErrorResultFilter>();
            services.AddProblemDetails();
        }

        internal static void UseErrorMiddlewares(this IApplicationBuilder app, bool isDevelopment)
        {
            if (isDevelopment)
                app.UseDeveloperExceptionPage();
            else
                app.UseExceptionHandler();
        }
    }
}
