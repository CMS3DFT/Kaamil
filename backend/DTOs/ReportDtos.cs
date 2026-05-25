namespace Kaamil.Api.DTOs;

public record CreateReportRequest(string Message, string? Title = null);

public record ReportDto(
    string Id,
    string Title,
    string? Message,
    string CreatedAt,
    string? UserEmail = null,
    string? UserFullName = null);
