using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SmartPocket.Persistence.Interceptors;
using SmartPocket.Persistence.PagedQuery;
using System.Reflection;
using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("SmartPocket.Tests")]

namespace SmartPocket.Persistence
{    
    public static class DbContextStartup
    {
        private static Assembly CurrentAssembly => typeof(SmartPocketContext).Assembly;

        public static void AddSmartPocketContext(this IServiceCollection services,
            string connectionString,
            bool isProduction)
        {
            services.AddDbContext<ISmartPocketContext, SmartPocketContext>((x) => {

                x.UseSqlite(connectionString, opt =>
                {
                    opt.MigrationsAssembly(CurrentAssembly);                  
                });

                x.AddInterceptors(new SoftDeleteSaveChangesInterceptor());
                x.UseSmartPocketSeeding(true);

            // Añadir interceptor solo si la cadena NO es una DB en memoria
            if (!IsInMemoryConnectionString(connectionString))
                {
                    x.AddInterceptors(new SqliteConnectionInterceptor());                    
                }                              

                if (!isProduction)
                {
                    x.EnableSensitiveDataLogging();
                    x.EnableDetailedErrors();
                }
            }); 
        }

        private static bool IsInMemoryConnectionString(string connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                return false;

            var comparison = StringComparison.OrdinalIgnoreCase;

            // Detecta patrones comunes de SQLite in-memory
            if (connectionString.Contains(":memory:", comparison))
                return true;

            // Ejemplos: "Mode=Memory" o "mode=memory"
            if (connectionString.IndexOf("mode=memory", comparison) >= 0)
                return true;

            return false;
        }

        public static void UseSmartPocketSeeding(this DbContextOptionsBuilder options, bool useSeedingSync = false)
        {
            options.UseAsyncSeeding(async (ctx, wasSeed, cancellationToken) =>
            {
                //El argumento bool del delegado indica si se realizó alguna
                //operación de administración de tienda
                if (ctx is ISmartPocketContext spCtx && wasSeed)
                    await SmartPocketSeeder.SeedAsync(spCtx, cancellationToken);
            });

            /// Proporciona una opción para usar el seeding de forma síncrona, aunque no es recomendado
            /// Es para solucionar el siguiente error:
            ///  A synchronous store managment operation was performed and no synchronous seed delegate has been provided, however an asynchronous seed delegate was. Set 'UseSeeding' option with a delegate equivalent to the one supplied in 'UseAsyncSeeding'.
            ///  Esto ocurre por el hecho de que el seeding se ejecuta en una migración, y las migraciones se ejecutan de forma síncrona, por lo que no pueden ejecutar el seeding asíncrono.
            if (useSeedingSync)
            {
                options.UseSeeding((ctx, wasSeed) =>
                {
                    if (ctx is ISmartPocketContext spCtx && wasSeed)
                        SmartPocketSeeder.SeedAsync(spCtx, CancellationToken.None).GetAwaiter().GetResult();
                });
            }
        }
    }
}
