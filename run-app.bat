@echo off
:: Ensure the working directory is the folder containing this batch script
cd /d "%~dp0"

echo ===================================================
echo   Starting DailyBite Tiffin Service App
echo   Single Port Mode (URL: http://localhost:5000)
echo ===================================================

:: Prepend the custom Node distribution path
set "PATH=C:\Users\shree\.gemini\antigravity\scratch\node-dist\node-v20.12.2-win-x64;%PATH%"

:: Check if db_data directory exists or is empty to auto-seed
if not exist "db_data" (
    echo [System] First run detected. Seeding the database with default accounts...
    call npm run seed
) else (
    set /p CHOICE="Do you want to re-seed the database with default test accounts? (y/N): "
    if /I "%CHOICE%"=="y" (
        echo Seeding database...
        call npm run seed
    )
)

:: Run npm with call so control returns to this script on exit/failure
call npm run start:single-port

pause
