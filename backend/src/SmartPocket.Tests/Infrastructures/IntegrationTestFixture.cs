using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SmartPocket.Features.Abstractions.Handlers;
using SmartPocket.Persistence;
using SmartPocket.Persistence.Interceptors;
using SmartPocket.WebApi.Setup;

namespace SmartPocket.Tests.Infrastructures
{
    public class IntegrationTestFixture : IAsyncLifetime
    {        
        private SqliteConnection? _connection;
        private ServiceProvider? _serviceProvider;

        public IServiceProvider ServiceProvider => CheckProvider();
        public ISmartPocketContext SmartPocketContext => CheckProvider().GetRequiredService<ISmartPocketContext>();

        public IntegrationTestFixture()
        {

        }

        private IServiceProvider CheckProvider()
        {
            if (_serviceProvider is null)
                throw new InvalidOperationException($"{nameof(_serviceProvider)} was not instantiated.");

            return _serviceProvider;
        }

        public async Task InitializeAsync()
        {
            _connection = new SqliteConnection("Data Source=:memory:;Foreign Keys=True");
            await _connection.OpenAsync();

            var services = new ServiceCollection();

            services.AddFeatures();

            services.AddDbContext<ISmartPocketContext, SmartPocketContext>((options) =>
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
                options.LogTo(Console.WriteLine, LogLevel.Debug);
                options.UseSqlite(_connection);

                options.AddInterceptors(new SoftDeleteSaveChangesInterceptor());

                options.UseSmartPocketSeeding();
            });

            _serviceProvider = services.BuildServiceProvider();

            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<SmartPocketContext>();

            await context.Database.EnsureCreatedAsync();
        }

        public async Task DisposeAsync()
        {
            _serviceProvider?.Dispose();

            if (_connection is not null)
            {
                await _connection.CloseAsync();
                _connection.Dispose();
                _connection = null;
            }
        }

        public T GetHandler<T>() where T : IHandler
        {
            return ServiceProvider.GetRequiredService<T>();
        }
    }
}
