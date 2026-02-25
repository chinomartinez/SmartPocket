using Scalar.AspNetCore;

namespace SmartPocket.WebApi.Setup
{
    public static class OpenApiSetup
    {
        public static void AddSmartPocketOpenApi(this IServiceCollection services)
        {
            services.AddOpenApi();
        }

        public static void UseSmartPocketOpenApi(this WebApplication app)
        {
            if (!app.Environment.IsDevelopment()) return;

            app.MapOpenApi();

            app.MapScalarApiReference(opt =>
            {
                opt.DefaultHttpClient = new(ScalarTarget.JavaScript, ScalarClient.Axios);
            });
        }
    }
}
