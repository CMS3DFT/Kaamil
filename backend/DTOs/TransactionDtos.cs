namespace Kaamil.Api.DTOs;

public record TransactionDto(
    string Id,
    string Description,
    string Category,
    decimal Amount,
    string Date,
    string Type);

public record CreateTransactionRequest(
    string Description,
    string Category,
    decimal Amount,
    string Date,
    string Type);

public record UpdateTransactionRequest(string Description, decimal Amount);

public record CategoryDto(string Name);

public record CreateCategoryRequest(string Name);

public record TotalsDto(decimal SavedIncome, decimal SavedExpense, decimal SavedSavings);
