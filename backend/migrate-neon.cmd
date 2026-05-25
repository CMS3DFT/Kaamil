@echo off
REM Ku dheji Neon connection string (ha commit-garin password-ka)
if "%DATABASE_URL%"=="" (
  echo ERROR: Set DATABASE_URL first, tusaale:
  echo set DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-still-feather-aphg4h81-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
  exit /b 1
)
cd /d "%~dp0"
dotnet ef database update
echo Done. Tables waa la abuuray Neon neondb.
