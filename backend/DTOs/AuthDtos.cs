namespace Kaamil.Api.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Email, string Password, string FullName);

public record LoginResponse(string Token, string Email, string Role, string FullName);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
