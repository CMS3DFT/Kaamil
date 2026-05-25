namespace Kaamil.Api.Extensions;

/// <summary>
/// Ensures CORS headers on every response (including errors and OPTIONS preflight).
/// </summary>
public class KaamilCorsMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var origin = context.Request.Headers.Origin.FirstOrDefault();

        if (!string.IsNullOrEmpty(origin) && CorsOriginHelper.IsAllowed(origin))
        {
            context.Response.Headers["Access-Control-Allow-Origin"] = origin;
            context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
            context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept";
            context.Response.Headers["Vary"] = "Origin";
        }

        if (HttpMethods.IsOptions(context.Request.Method))
        {
            context.Response.StatusCode = StatusCodes.Status204NoContent;
            return;
        }

        await next(context);
    }
}

public static class CorsOriginHelper
{
    private static readonly string[] AlwaysAllowed =
    [
        "https://kaamil.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ];

    public static bool IsAllowed(string origin)
    {
        if (string.IsNullOrWhiteSpace(origin))
            return false;

        var normalized = origin.TrimEnd('/');

        foreach (var allowed in AlwaysAllowed)
        {
            if (normalized.Equals(allowed, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        if (!Uri.TryCreate(normalized, UriKind.Absolute, out var uri))
            return false;

        return uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);
    }

    public static string[] MergeConfiguredOrigins(IEnumerable<string> configured)
    {
        return configured
            .Concat(AlwaysAllowed)
            .Select(o => o.TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }
}
