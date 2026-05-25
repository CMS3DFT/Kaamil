using Kaamil.Api.Data;
using Kaamil.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Services;

public static class DbSeeder
{
    private static readonly string[] DefaultCategories =
        ["Food", "Transport", "Bills", "Shopping", "Other"];

    public static async Task SeedAsync(KaamilDbContext db)
    {
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync(u => u.Role == "Admin"))
            return;

        var admin = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "admin@kaamil.com",
            FullName = "System Admin",
            Role = "Admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            IsActive = true,
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }

    public static async Task EnsureUserDefaultsAsync(KaamilDbContext db, Guid userId)
    {
        if (!await db.Categories.AnyAsync(c => c.UserId == userId))
        {
            foreach (var name in DefaultCategories)
            {
                db.Categories.Add(new Category
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = name,
                });
            }
        }

        if (!await db.UserTotals.AnyAsync(t => t.UserId == userId))
        {
            db.UserTotals.Add(new UserTotals { UserId = userId });
        }

        await db.SaveChangesAsync();
    }
}
