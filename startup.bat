@echo off
setlocal EnableDelayedExpansion
title SmartOnse v2 - Application Launcher

:: Ensure we run in the project directory
cd /d "%~dp0"

echo ===================================================
echo             SmartOnse v2 - Startup Launcher
echo ===================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found in your system PATH!
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: 2. Check if .env exists
if not exist ".env" (
    echo [WARNING] No .env file detected in this directory!
    echo Make sure environment variables are configured if needed.
    echo.
)

:: 3. Check if node_modules exists, install dependencies if missing
if not exist "node_modules\" (
    echo [INFO] node_modules folder not found.
    echo Running "npm install"...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] "npm install" failed. Please review errors above.
        pause
        exit /b 1
    )
)

:: 4. Ensure Prisma Client is generated
if not exist "node_modules\.prisma\client\" (
    echo [INFO] Prisma Client not generated yet.
    echo Running "npx prisma generate"...
    echo.
    call npx prisma generate
    if %errorlevel% neq 0 (
        echo [WARNING] Prisma generate failed. Attempting to continue...
    )
)

:: 5. Open browser after a brief delay
echo [INFO] Opening default browser at http://localhost:3001 ...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3001"

:: 6. Launch Next.js dev server
echo [INFO] Starting Next.js development server...
echo.
echo ---------------------------------------------------
echo  App URL: http://localhost:3001
echo  Press [Ctrl + C] in this window to stop the server.
echo ---------------------------------------------------
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly or exited with an error.
    pause
)
