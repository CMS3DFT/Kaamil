namespace Kaamil.Api.Services;

public class ReportFileService(IWebHostEnvironment env, IConfiguration config)
{
    private static readonly HashSet<string> AllowedExtensions =
        [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".png", ".jpg", ".jpeg", ".txt", ".csv"];

    private readonly string _uploadRoot = Path.Combine(
        env.ContentRootPath,
        config["Reports:UploadPath"] ?? "uploads/reports");

    private readonly long _maxBytes = config.GetValue<long>("Reports:MaxFileSizeBytes", 10 * 1024 * 1024);

    public string UploadRoot => _uploadRoot;

    public void EnsureUploadDirectory()
    {
        Directory.CreateDirectory(_uploadRoot);
    }

    public async Task<(string storedFileName, string contentType, long size)> SaveAsync(
        Guid userId,
        IFormFile file,
        CancellationToken ct = default)
    {
        if (file.Length == 0)
            throw new InvalidOperationException("Faylka waa madhan.");

        if (file.Length > _maxBytes)
            throw new InvalidOperationException("Faylka aad buu u weyn yahay (ugu badnaan 10MB).");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Nooca faylka lama ogola. PDF, Word, Excel, sawir, TXT.");

        var userDir = Path.Combine(_uploadRoot, userId.ToString());
        Directory.CreateDirectory(userDir);

        var storedFileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(userDir, storedFileName);

        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream, ct);

        return (storedFileName, file.ContentType, file.Length);
    }

    public string? GetFullPath(Guid userId, string storedFileName)
    {
        var path = Path.Combine(_uploadRoot, userId.ToString(), storedFileName);
        return File.Exists(path) ? path : null;
    }

    public void DeleteFile(Guid userId, string storedFileName)
    {
        var path = Path.Combine(_uploadRoot, userId.ToString(), storedFileName);
        if (File.Exists(path)) File.Delete(path);
    }
}
