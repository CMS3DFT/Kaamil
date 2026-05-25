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
                    IssuerSigningKey = JwtConfiguration.GetSigningKey(config),
                };
            });

        services.AddAuthorization();

        var corsRaw = config["Cors:Origins"]
            ?? Environment.GetEnvironmentVariable("CORS_ORIGINS")
            ?? "http://localhost:5173,https://kaamil.vercel.app";

        var origins = CorsOriginHelper.MergeConfiguredOrigins(
            corsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));

        services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
            {
                policy.SetIsOriginAllowed(CorsOriginHelper.IsAllowed);
                policy.AllowAnyHeader().AllowAnyMethod();
            });

            options.AddDefaultPolicy(policy =>
            {
                policy.SetIsOriginAllowed(CorsOriginHelper.IsAllowed);
                policy.AllowAnyHeader().AllowAnyMethod();
            });
        });

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            });

        return services;
    }
}
