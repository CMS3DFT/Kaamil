namespace Kaamil.Api.Extensions;

public static class JwtConfiguration
{
    public static string ResolveJwtKey(IConfiguration config)
    {
        var key = config["Jwt:Key"]
            ?? Environment.GetEnvironmentVariable("JWT_KEY")
            ?? Environment.GetEnvironmentVariable("Jwt__Key");

        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("JWT key missing. Set Jwt__Key or JWT_KEY on Railway.");

        return key;
    }
}
