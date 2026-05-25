using Kaamil.Api.Data;
using Kaamil.Api.Extensions;
using Kaamil.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile(
    "appsettings.Development.local.json",
    optional: true,
    reloadOnChange: true);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddKaamilServices(builder.Configuration);

var app = builder.Build();

app.UseCors("Frontend");

app.MapKaamilHealth();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<KaamilDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
    scope.ServiceProvider.GetRequiredService<ReportFileService>().EnsureUploadDirectory();
    app.Logger.LogInformation("Database migration and seed completed.");
}
catch (Exception ex)
{
    app.Logger.LogError(ex,
        "Database setup failed at startup. API is running — check GET /health/db on Railway.");
}

app.Run();
