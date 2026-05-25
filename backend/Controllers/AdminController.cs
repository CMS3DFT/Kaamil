using System.Security.Claims;
using Kaamil.Api.Data;
using Kaamil.Api.DTOs;
using Kaamil.Api.Models;
using Kaamil.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(KaamilDbContext db, ReportFileService files) : ControllerBase
{
    private Guid AdminId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> Stats()
    {
        var totalUsers = await db.Users.CountAsync(u => u.Role == "User");
        var activeUsers = await db.Users.CountAsync(u => u.Role == "User" && u.IsActive);
        var totalTransactions = await db.Transactions.CountAsync();
        var totalReports = await db.Reports.CountAsync();
        return Ok(new AdminStatsDto(totalUsers, activeUsers, totalTransactions, totalReports));
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetUsers()
    {
        var users = await db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto(
                u.Id.ToString(),
                u.Email,
                u.FullName,
                u.Role,
                u.IsActive,
                u.CreatedAt.ToString("yyyy-MM-dd")))
            .ToListAsync();
        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<ActionResult<AdminUserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email hore ayaa loo isticmaalay." });

        var role = string.IsNullOrWhiteSpace(request.Role) ? "User" : request.Role.Trim();
        if (role is not ("User" or "Admin"))
            return BadRequest(new { message = "Role waa inuu noqdaa User ama Admin." });

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            FullName = request.FullName.Trim(),
            Role = role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsActive = true,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        if (role == "User")
            await DbSeeder.EnsureUserDefaultsAsync(db, user.Id);

        return Ok(new AdminUserDto(
            user.Id.ToString(),
            user.Email,
            user.FullName,
            user.Role,
            user.IsActive,
            user.CreatedAt.ToString("yyyy-MM-dd")));
    }

    [HttpPut("users/{id}")]
    public async Task<ActionResult<AdminUserDto>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        if (!Guid.TryParse(id, out var guid))
            return NotFound();

        var user = await db.Users.FindAsync(guid);
        if (user is null) return NotFound();

        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email && u.Id != guid))
            return Conflict(new { message = "Email hore ayaa loo isticmaalay." });

        user.Email = email;
        user.FullName = request.FullName.Trim();
        user.Role = request.Role is "Admin" or "User" ? request.Role : user.Role;
        user.IsActive = request.IsActive;
        await db.SaveChangesAsync();

        return Ok(new AdminUserDto(
            user.Id.ToString(),
            user.Email,
            user.FullName,
            user.Role,
            user.IsActive,
            user.CreatedAt.ToString("yyyy-MM-dd")));
    }

    [HttpPut("users/{id}/password")]
    public async Task<IActionResult> ResetPassword(string id, [FromBody] ResetPasswordRequest request)
    {
        if (!Guid.TryParse(id, out var guid))
            return NotFound();

        var user = await db.Users.FindAsync(guid);
        if (user is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return BadRequest(new { message = "Password waa inuu ugu yaraan 6 xaraf yahay." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!Guid.TryParse(id, out var guid))
            return NotFound();

        if (guid == AdminId)
            return BadRequest(new { message = "Ma tirtiri kartid account-kaaga." });

        var user = await db.Users
            .Include(u => u.Transactions)
            .Include(u => u.Categories)
            .FirstOrDefaultAsync(u => u.Id == guid);

        if (user is null) return NotFound();

        db.Users.Remove(user);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var admin = await db.Users.FindAsync(AdminId);
        if (admin is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, admin.PasswordHash))
            return BadRequest(new { message = "Password-ka hadda waa khalad." });

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            return BadRequest(new { message = "Password cusub waa inuu ugu yaraan 6 xaraf yahay." });

        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("reports")]
    public async Task<ActionResult<IEnumerable<ReportDto>>> GetReports()
    {
        var items = await db.Reports
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReportDto(
                r.Id.ToString(),
                r.Title,
                r.Description,
                r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                r.User.Email,
                r.User.FullName))
            .ToListAsync();
        return Ok(items);
    }

    [HttpDelete("reports/{id}")]
    public async Task<IActionResult> DeleteReport(string id)
    {
        if (!Guid.TryParse(id, out var guid)) return NotFound();

        var report = await db.Reports.FindAsync(guid);
        if (report is null) return NotFound();

        if (!string.IsNullOrEmpty(report.StoredFileName))
            files.DeleteFile(report.UserId, report.StoredFileName);

        db.Reports.Remove(report);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
