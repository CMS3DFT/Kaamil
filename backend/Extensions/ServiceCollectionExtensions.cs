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
            ?? "http://localhost:5173";

        var origins = corsRaw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        services.AddCors(options =>
        {
            options.AddPolicy("Frontend", policy =>
                policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod());
        });

        services.AddControllers();
        return services;
    }
}
