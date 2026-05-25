using Kaamil.Api.Data;
using Kaamil.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Services;

public static class DbSeeder
{
    private static readonly string[] DefaultCategories =
        ["Food", "Transport", "Bills", "Shopping", "Other"];

    private const string DefaultAdminEmail = "admin@kaamil.com";
    private const string DefaultAdminPassword = "Admin@123";

    public static async Task SeedAsync(KaamilDbContext db)
    {
        await db.Database.MigrateAsync();

        var admin = await db.Users.FirstOrDefaultAsync(u => u.Email == DefaultAdminEmail);
        if (admin is null)
        {
            db.Users.Add(new AppUser
            {
                Id = Guid.NewGuid(),
                Email = DefaultAdminEmail,
                FullName = "System Admin",
                Role = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultAdminPassword),
                IsActive = true,
            });
        }
        else
        {
            admin.Role = "Admin";
            admin.IsActive = true;
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultAdminPassword);
        }

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
