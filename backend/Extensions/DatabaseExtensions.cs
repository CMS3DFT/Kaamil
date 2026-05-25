using Microsoft.AspNetCore.WebUtilities;
using Npgsql;

namespace Kaamil.Api.Extensions;

public static class DatabaseExtensions
{
    public static string ResolveConnectionString(IConfiguration config)
    {
        var fromConfig = config.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(fromConfig))
            return NormalizeConnectionString(fromConfig.Trim());

        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrWhiteSpace(databaseUrl))
            return NormalizeConnectionString(databaseUrl.Trim());

        throw new InvalidOperationException(
            "Database connection missing. Set ConnectionStrings__DefaultConnection or DATABASE_URL.");
    }

    /// <summary>
    /// Converts Railway/Neon postgresql:// URLs to an Npgsql key=value connection string.
    /// </summary>
    public static string NormalizeConnectionString(string raw)
    {
        if (!raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            && !raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            return raw;

        var uri = new Uri(raw);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');
        if (string.IsNullOrEmpty(database))
            database = "neondb";

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = database,
            Username = username,
            Password = password,
            SslMode = SslMode.Require,
        };

        var query = QueryHelpers.ParseQuery(uri.Query);
        if (query.TryGetValue("sslmode", out var sslValues)
            && Enum.TryParse<SslMode>(sslValues.ToString(), ignoreCase: true, out var mode))
            builder.SslMode = mode;

        return builder.ConnectionString;
    }

    public static (string Host, string Database) GetSafeConnectionInfo(IConfiguration config)
    {
        try
        {
            var raw = config.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(raw))
                raw = Environment.GetEnvironmentVariable("DATABASE_URL");

            if (string.IsNullOrWhiteSpace(raw))
                return ("not-configured", "not-configured");

            if (raw.StartsWith("postgres", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(raw);
                var database = uri.AbsolutePath.TrimStart('/');
                return (uri.Host, string.IsNullOrEmpty(database) ? "neondb" : database);
            }

            var cs = new NpgsqlConnectionStringBuilder(raw);
            return (cs.Host ?? "unknown", cs.Database ?? "unknown");
        }
        catch
        {
            return ("invalid-connection-string", "unknown");
        }
    }
}
