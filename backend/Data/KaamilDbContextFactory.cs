using Kaamil.Api.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Kaamil.Api.Data;

public class KaamilDbContextFactory : IDesignTimeDbContextFactory<KaamilDbContext>
{
    public KaamilDbContext CreateDbContext(string[] args)
    {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{env}.json", optional: true)
            .AddJsonFile("appsettings.Development.local.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = DatabaseExtensions.ResolveConnectionString(config);

        var options = new DbContextOptionsBuilder<KaamilDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new KaamilDbContext(options);
    }
}
