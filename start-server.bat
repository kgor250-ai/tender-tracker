@echo off
title Tender Tracker Local Web Server (Port 3000)
cd /d "%~dp0"
echo ========================================================
echo Starting Tender Corrigendum ^& Amendment Tracker Server
echo URL: http://localhost:3000/
echo Close this window only when you want to stop the server.
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
