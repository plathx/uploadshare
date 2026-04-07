@echo off
REM ===============================================
REM UPLOADSHARE QUICK START SCRIPT (Windows)
REM ===============================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         🚀 UPLOADSHARE - FULL SETUP (Windows)             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM ตรวจสอบว่า Node.js ติดตั้งแล้วไหม
echo [1/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js ไม่พบ!
    echo 📥 ดาวน์โหลดจาก: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js OK

REM ติดตั้ง Dependencies
echo.
echo [2/3] Installing dependencies...
echo This may take a minute...
call npm install
if errorlevel 1 (
    echo ❌ เกิดข้อผิดพลาดในการติดตั้ง
    pause
    exit /b 1
)
echo ✅ Dependencies installed

REM รัน Server
echo.
echo [3/3] Starting server...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  UPLOADSHARE ONLINE  🟢                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📝 Open: http://localhost:3000
echo 🉑 All 8 services ready (Gofile, Catbox, Litterbox, etc)
echo ⏹️  Stop: Ctrl + C
echo.

node server.js

pause
