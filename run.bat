@echo off
cd /d "%~dp0"
title Trading Dashboard

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo         Install the LTS version from https://nodejs.org and run again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [1/2] Installing packages. This runs only once...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed. Check your internet connection.
    pause
    exit /b 1
  )
)

echo [2/2] Starting the dashboard. Your browser will open automatically.
echo       Press Ctrl+C to stop.
call npm run dev
pause
