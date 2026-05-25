using Kaamil.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Extensions;

public static class HealthEndpoints
{
    public static WebApplication MapKaamilHealth(this WebApplication app)
    {
        app.MapGet("/health", () => Results.Ok(new
        {
            status = "ok",
            service = "Kaamil.Api",
            time = DateTime.UtcNow,
        }));

        app.MapGet("/health/db", async (KaamilDbContext db, IConfiguration config) =>
        {
            var info = DatabaseExtensions.GetSafeConnectionInfo(config);

            try
            {
                var canConnect = await db.Database.CanConnectAsync();
                if (!canConnect)
                {
                    return Results.Json(new
                    {
                        status = "error",
                        message = "Cannot connect to PostgreSQL",
                        host = info.Host,
                        database = info.Database,
                    }, statusCode: 503);
                }

                var applied = await db.Database.GetAppliedMigrationsAsync();
                var pending = await db.Database.GetPendingMigrationsAsync();
                var userCount = await db.Users.CountAsync();

                return Results.Ok(new
                {
                    status = "ok",
                    host = info.Host,
                    database = info.Database,
                    migrationsApplied = applied.ToArray(),
                    pendingMigrations = pending.ToArray(),
                    userCount,
                    time = DateTime.UtcNow,
                });
            }
            catch (Exception ex)
            {
                return Results.Json(new
                {
                    status = "error",
                    message = ex.Message,
                    host = info.Host,
                    database = info.Database,
                }, statusCode: 503);
            }
        });

        return app;
    }
}
