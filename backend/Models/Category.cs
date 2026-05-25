namespace Kaamil.Api.Models;

public class Category
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;

    public AppUser User { get; set; } = null!;
}
