namespace Kaamil.Api.Models;

public class UserTotals
{
    public Guid UserId { get; set; }
    public decimal SavedIncome { get; set; }
    public decimal SavedExpense { get; set; }
    public decimal SavedSavings { get; set; }

    public AppUser User { get; set; } = null!;
}
