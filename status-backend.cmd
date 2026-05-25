@echo off
echo Hubinta backend-ka (port 5177)...
curl -s -o nul -w "HTTP %%{http_code}\n" http://localhost:5177/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"x\",\"password\":\"x\"}" 2>nul
if errorlevel 1 (
  echo Backend MA SOCDO. Fur start-backend.cmd
) else (
  echo Backend WUU SOCdaa — ha mar kale dotnet run!
  echo Kaliya fur start-frontend.cmd oo isticmaal browser.
)
pause
