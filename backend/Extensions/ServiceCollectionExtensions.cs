using System.Text;
using Kaamil.Api.Data;
using Kaamil.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Kaamil.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKaamilServices(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = DatabaseExtensions.ResolveConnectionString(config);

        services.AddDbContext<KaamilDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<ITokenService, TokenService>();
        services.AddSingleton<ReportFileService>();

        var jwtKey = config["Jwt:Key"]
            ?? Environment.GetEnvironmentVariable("JWT_KEY")
            ?? throw new InvalidOperationException("JWT key missing. Set Jwt__Key or JWT_KEY.");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = config["Jwt:Issuer"] ?? "Kaamil.Api",
                    ValidAudience = config["Jwt:Audience"] ?? "Kaamil.Frontend",
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                };
            });

        services.AddAuthorization();

        var corsRaw = config["Cors:Origins"]
            ?? Environment.GetEnvironmentVariable("CORS_ORIGINS")
            ?? "http://localhost:5173,https://kaamil.vercel.app";

        var origins = corsRaw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(o => o.TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
            {
                policy.SetIsOriginAllowed(origin =>
                {
                    if (string.IsNullOrWhiteSpace(origin))
                        return false;

                    var normalized = origin.TrimEnd('/');
                    if (origins.Contains(normalized, StringComparer.OrdinalIgnoreCase))
                        return true;

                    if (Uri.TryCreate(normalized, UriKind.Absolute, out var uri)
                        && (uri.Host.Equals("kaamil.vercel.app", StringComparison.OrdinalIgnoreCase)
                            || uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase)))
                        return true;

                    return false;
                });
                policy.AllowAnyHeader().AllowAnyMethod();
            });
        });

        services.AddControllers();
        return services;
    }
}
