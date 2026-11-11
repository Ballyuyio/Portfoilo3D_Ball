@echo off
title Patanawan 3D Portfolio - STREET WALL
cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Node.js not found - opening index.html directly in your browser...
  start "" "%~dp0index.html"
  exit /b 0
)

echo Launching STREET WALL Portfolio at http://127.0.0.1:3000 ...
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://127.0.0.1:3000"
node server.js
pause

