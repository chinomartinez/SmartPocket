using SmartPocket.Persistence;
using SmartPocket.WebApi.Errors;
using SmartPocket.WebApi.Setup;

namespace SmartPocket.WebApi
{
    public class Program
    {
        private static readonly string _PREFIX = "/api";

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            AddServices(builder.Services, builder.Configuration, builder.Environment);

            var app = builder.Build();
            AddApplication(app);

            app.Run();
        }

        private static void AddServices(IServiceCollection services, ConfigurationManager configuration,
            IWebHostEnvironment env)
        {
            services.AddEndpointsApiExplorer();
            services.AddControllers(x => 
            {
                x.Conventions.Add(new ApiProducesConvention());
                x.Filters.AddService<ErrorResultFilter>();
            });
            services.AddSmartPocketOpenApi();

            services.AddErrors();
            AddDbContext(services, configuration, env);
            services.AddFeatures();
        }

        private static void AddDbContext(IServiceCollection services, ConfigurationManager configuration,
            IWebHostEnvironment env)
        {
            var connectionString = configuration.GetConnectionString("SmartPocketContext")
                ?? throw new InvalidOperationException("Connection string 'SmartPocketContext' not found.");

            services.AddSmartPocketContext(
                connectionString: connectionString,
                isProduction: env.IsProduction());
        }

        private static void AddApplication(WebApplication app)
        {
            app.UseErrorMiddlewares(isDevelopment: app.Environment.IsDevelopment());
            app.UseSmartPocketOpenApi();

            var origins = app.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
                ?? Array.Empty<string>();

            if (origins.Length > 0)
            {
                app.UseCors(builder =>
                {
                    builder.WithOrigins(origins)
                        .AllowCredentials()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .WithExposedHeaders("Content-Disposition");
                });
            }

            app.UseRouting();
            app.UsePathBase(_PREFIX);

            app.UseAuthorization();
            app.MapControllers();
        }
    }
}
