@echo off
echo ===========================================
echo   OkokTechie Installer and Launcher
echo ===========================================
echo.

echo [1/2] Installing and Starting Backend...
cd "%~dp0backend"
call npm install
call npx prisma db push
start "OkokTechie Backend Server" cmd /k "npm run dev"

echo.
echo [2/2] Installing and Starting Frontend...
cd "%~dp0frontend"
call npm install
start "OkokTechie Frontend Server" cmd /k "npm run dev"

echo.
echo ===========================================
echo   All systems go!
echo   Frontend: http://localhost:5173
echo   Admin Dashboard: http://localhost:5173/admin
echo ===========================================
pause
