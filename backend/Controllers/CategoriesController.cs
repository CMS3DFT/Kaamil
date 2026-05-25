using System.Security.Claims;
using Kaamil.Api.Data;
using Kaamil.Api.DTOs;
using Kaamil.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController(KaamilDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
    {
        var items = await db.Categories
            .Where(c => c.UserId == UserId)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Name))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request)
    {
        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { message = "Category name required." });

        var exists = await db.Categories.AnyAsync(c =>
            c.UserId == UserId && c.Name.ToLower() == name.ToLower());
        if (exists)
            return Conflict(new { message = "Category already exists." });

        var entity = new Category { Id = Guid.NewGuid(), UserId = UserId, Name = name };
        db.Categories.Add(entity);
        await db.SaveChangesAsync();
        return Ok(new CategoryDto(name));
    }
}
