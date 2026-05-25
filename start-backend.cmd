@echo off
title Kaamil Backend (port 5177)
cd /d "%~dp0backend"

echo ========================================
echo  KAAMIL BACKEND - dotnet run
echo  Typo: isticmaal DOTNET (ma aha notnet)
echo ========================================
echo.
echo Joojinta backend hore (haddii uu socdo)...
taskkill /IM Kaamil.Api.exe /F >nul 2>&1
timeout /t 2 /nobreak >nul

if not exist "appsettings.Development.local.json" (
  if "%DATABASE_URL%"=="" (
    echo.
    echo QALAD: Database connection ma jirto!
    echo   1^) Copy appsettings.Development.local.json.example
    echo      -^> appsettings.Development.local.json oo geli Neon password
    echo   AMA 2^) set DATABASE_URL=postgresql://...
    echo.
    pause
    exit /b 1
  )
) else (
  echo Isticmaalaya appsettings.Development.local.json ^(Neon^)
)

echo Bilowga backend...
echo Marka aragto: Now listening on: http://localhost:5177
echo HA XIRIN daa window-kan inta aad isticmaalayso app-ka!
echo.
dotnet run
pause
