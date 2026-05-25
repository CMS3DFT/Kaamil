using System.Security.Claims;
using Kaamil.Api.Data;
using Kaamil.Api.DTOs;
using Kaamil.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController(KaamilDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll()
    {
        var items = await db.Transactions
            .Where(t => t.UserId == UserId)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .Select(t => ToDto(t))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionRequest request)
    {
        if (!DateOnly.TryParse(request.Date, out var date))
            return BadRequest(new { message = "Invalid date." });

        var entity = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            Amount = request.Amount,
            Date = date,
            Type = request.Type.ToLowerInvariant(),
        };

        db.Transactions.Add(entity);
        await db.SaveChangesAsync();
        return Ok(ToDto(entity));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> Update(string id, [FromBody] UpdateTransactionRequest request)
    {
        if (!Guid.TryParse(id, out var guid))
            return NotFound();

        var entity = await db.Transactions.FirstOrDefaultAsync(t => t.Id == guid && t.UserId == UserId);
        if (entity is null) return NotFound();

        entity.Description = request.Description.Trim();
        entity.Amount = request.Amount;
        await db.SaveChangesAsync();
        return Ok(ToDto(entity));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        if (!Guid.TryParse(id, out var guid))
            return NotFound();

        var entity = await db.Transactions.FirstOrDefaultAsync(t => t.Id == guid && t.UserId == UserId);
        if (entity is null) return NotFound();

        db.Transactions.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static TransactionDto ToDto(Transaction t) =>
        new(t.Id.ToString(), t.Description, t.Category, t.Amount, t.Date.ToString("yyyy-MM-dd"), t.Type);
}
