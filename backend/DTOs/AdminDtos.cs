namespace Kaamil.Api.DTOs;

public record AdminUserDto(
    string Id,
    string Email,
    string FullName,
    string Role,
    bool IsActive,
    string CreatedAt);

public record CreateUserRequest(string Email, string Password, string FullName, string Role);

public record UpdateUserRequest(string Email, string FullName, string Role, bool IsActive);

public record ResetPasswordRequest(string NewPassword);

public record AdminStatsDto(int TotalUsers, int ActiveUsers, int TotalTransactions, int TotalReports);
