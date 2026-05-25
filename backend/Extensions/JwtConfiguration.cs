using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Kaamil.Api.Extensions;

public static class JwtConfiguration
{
    private const int MinKeyBytes = 32; // HS256 requires >= 256 bits

    public static string ResolveJwtKey(IConfiguration config)
    {
        var key = config["Jwt:Key"]
            ?? Environment.GetEnvironmentVariable("JWT_KEY")
            ?? Environment.GetEnvironmentVariable("Jwt__Key");

        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("JWT key missing. Set Jwt__Key or JWT_KEY on Railway.");

        return key;
    }

    public static SymmetricSecurityKey GetSigningKey(IConfiguration config)
    {
        return new SymmetricSecurityKey(GetSigningKeyBytes(config));
    }

    public static byte[] GetSigningKeyBytes(IConfiguration config)
    {
        var bytes = Encoding.UTF8.GetBytes(ResolveJwtKey(config));
        if (bytes.Length >= MinKeyBytes)
            return bytes;

        // Short Railway secrets: stretch to 256-bit key (HS256 requirement)
        return SHA256.HashData(bytes);
    }
}
