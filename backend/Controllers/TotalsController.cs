using System.Security.Claims;
using Kaamil.Api.Data;
using Kaamil.Api.DTOs;
using Kaamil.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Controllers;

[ApiController]
[Route("api/totals")]
[Authorize]
public class TotalsController(KaamilDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<TotalsDto>> Get()
    {
        var totals = await GetOrCreateTotalsAsync();
        return Ok(ToDto(totals));
    }

    [HttpPut]
    public async Task<ActionResult<TotalsDto>> Update([FromBody] TotalsDto request)
    {
        var totals = await GetOrCreateTotalsAsync();
        totals.SavedIncome = request.SavedIncome;
        totals.SavedExpense = request.SavedExpense;
        totals.SavedSavings = request.SavedSavings;
        await db.SaveChangesAsync();
        return Ok(ToDto(totals));
    }

    private async Task<UserTotals> GetOrCreateTotalsAsync()
    {
        var totals = await db.UserTotals.FirstOrDefaultAsync(t => t.UserId == UserId);
        if (totals is not null) return totals;

        totals = new UserTotals { UserId = UserId };
        db.UserTotals.Add(totals);
        await db.SaveChangesAsync();
        return totals;
    }

    private static TotalsDto ToDto(UserTotals t) =>
        new(t.SavedIncome, t.SavedExpense, t.SavedSavings);
}
