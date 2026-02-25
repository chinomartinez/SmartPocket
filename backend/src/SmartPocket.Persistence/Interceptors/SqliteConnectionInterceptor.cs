using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;

namespace SmartPocket.Persistence.Interceptors
{
    public class SqliteConnectionInterceptor : DbConnectionInterceptor
    {
        public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
        {
            base.ConnectionOpened(connection, eventData);

            using var command = CreateDbCommand(connection);
            command.ExecuteNonQuery();
        }

        public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData, CancellationToken cancellationToken = default)
        {
            await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);

            using var command = CreateDbCommand(connection);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        private DbCommand CreateDbCommand(DbConnection connection)
        {
            var command = connection.CreateCommand();
            command.CommandText = "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;";
            return command;
        } 
    }
}
