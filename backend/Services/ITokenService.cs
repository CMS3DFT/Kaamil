using Kaamil.Api.Models;

namespace Kaamil.Api.Services;

public interface ITokenService
{
    string CreateToken(AppUser user);
}
