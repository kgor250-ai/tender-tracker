@echo off
title Tender Tracker - Push to GitHub
echo ========================================================
echo   Updating Tender Corrigendum Tracker on GitHub & Vercel
echo ========================================================
echo.
cd /d "C:\project\project 2"
git push origin main
echo.
echo ========================================================
echo   Done! Vercel will now automatically deploy the update.
echo ========================================================
pause
