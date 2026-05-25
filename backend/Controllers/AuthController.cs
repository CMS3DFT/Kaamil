using Kaamil.Api.Data;
using Kaamil.Api.DTOs;
using Kaamil.Api.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableCors("Frontend")]
public class AuthController(KaamilDbContext db, ITokenService tokenService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Fadlan geli email iyo password." });

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !user.IsActive)
            return Unauthorized(new { message = "Email ama password waa khalad." });

        var passwordValid = false;
        try
        {
            passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            return Unauthorized(new { message = "Email ama password waa khalad." });
        }

        if (!passwordValid)
            return Unauthorized(new { message = "Email ama password waa khalad." });

        if (user.Role != "Admin")
            await DbSeeder.EnsureUserDefaultsAsync(db, user.Id);

        var token = tokenService.CreateToken(user);
        return Ok(new LoginResponse(token, user.Email, user.Role, user.FullName));
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var fullName = request.FullName.Trim();

        if (string.IsNullOrWhiteSpace(fullName))
            return BadRequest(new { message = "Fadlan geli magacaaga." });

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return BadRequest(new { message = "Password waa inuu ugu yaraan 6 xaraf yahay." });

        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email-kan hore ayaa loo diiwaangeliyay." });

        var user = new Models.AppUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            FullName = fullName,
            Role = "User",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();
        await DbSeeder.EnsureUserDefaultsAsync(db, user.Id);

        var token = tokenService.CreateToken(user);
        return Ok(new LoginResponse(token, user.Email, user.Role, user.FullName));
    }
}
