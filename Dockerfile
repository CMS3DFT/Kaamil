# Railway: use when Root Directory = repo root (not set to backend/)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/Kaamil.Api.csproj backend/
RUN dotnet restore backend/Kaamil.Api.csproj
COPY backend/ backend/
WORKDIR /src/backend
RUN dotnet publish Kaamil.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "Kaamil.Api.dll"]
