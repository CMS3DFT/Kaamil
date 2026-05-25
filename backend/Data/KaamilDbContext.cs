using Kaamil.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Kaamil.Api.Data;

public class KaamilDbContext(DbContextOptions<KaamilDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<UserTotals> UserTotals => Set<UserTotals>();
    public DbSet<Report> Reports => Set<Report>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.FullName).HasMaxLength(200);
            e.Property(x => x.Role).HasMaxLength(32);
        });

        modelBuilder.Entity<Transaction>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.Category).HasMaxLength(120);
            e.Property(x => x.Type).HasMaxLength(16);
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.HasOne(x => x.User).WithMany(u => u.Transactions).HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(120);
            e.HasIndex(x => new { x.UserId, x.Name }).IsUnique();
            e.HasOne(x => x.User).WithMany(u => u.Categories).HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<UserTotals>(e =>
        {
            e.HasKey(x => x.UserId);
            e.Property(x => x.SavedIncome).HasPrecision(18, 2);
            e.Property(x => x.SavedExpense).HasPrecision(18, 2);
            e.Property(x => x.SavedSavings).HasPrecision(18, 2);
            e.HasOne(x => x.User).WithOne(u => u.Totals).HasForeignKey<UserTotals>(x => x.UserId);
        });

        modelBuilder.Entity<Report>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.FileName).HasMaxLength(260);
            e.Property(x => x.StoredFileName).HasMaxLength(260);
            e.Property(x => x.ContentType).HasMaxLength(128);
            e.HasOne(x => x.User).WithMany(u => u.Reports).HasForeignKey(x => x.UserId);
        });
    }
}
