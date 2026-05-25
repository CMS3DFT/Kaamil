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
[Route("api/reports")]
[Authorize]
public class ReportsController(KaamilDbContext db, ReportFileService files) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReportDto>>> GetMine()
    {
        var items = await db.Reports
            .Where(r => r.UserId == UserId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => ToDto(r))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<ReportDto>> Send([FromBody] CreateReportRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Fadlan qor waxa aad rabto inaad u sheegto admin-ka." });

        var text = request.Message.Trim();
        var title = !string.IsNullOrWhiteSpace(request.Title)
            ? request.Title.Trim()
            : text.Length > 80 ? text[..80] + "…" : text;

        var report = new Report
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            Title = title,
            Description = text,
            FileName = string.Empty,
            StoredFileName = string.Empty,
            ContentType = string.Empty,
            FileSize = 0,
        };

        db.Reports.Add(report);
        await db.SaveChangesAsync();
        return Ok(ToDto(report));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!Guid.TryParse(id, out var guid)) return NotFound();

        var report = await db.Reports.FirstOrDefaultAsync(r => r.Id == guid && r.UserId == UserId);
        if (report is null) return NotFound();

        if (!string.IsNullOrEmpty(report.StoredFileName))
            files.DeleteFile(report.UserId, report.StoredFileName);

        db.Reports.Remove(report);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ReportDto ToDto(Report r) =>
        new(
            r.Id.ToString(),
            r.Title,
            r.Description,
            r.CreatedAt.ToString("yyyy-MM-dd HH:mm"));
}
