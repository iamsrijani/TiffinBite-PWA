@echo off
:: Ensure the working directory is the folder containing this batch script
cd /d "%~dp0"

echo ===================================================
echo   Starting DailyBite Tiffin Service App
echo   Single Port Mode (URL: http://localhost:5000)
echo ===================================================

:: Prepend the custom Node distribution path
set "PATH=C:\Users\shree\.gemini\antigravity\scratch\node-dist\node-v20.12.2-win-x64;%PATH%"

:: Run npm with call so control returns to this script on exit/failure
call npm run start:single-port

pause
