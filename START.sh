#!/bin/bash

################################
# UPLOADSHARE QUICK START (Mac/Linux)
################################

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 UPLOADSHARE - FULL SETUP (Mac/Linux)           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ตรวจสอบว่า Node.js ติดตั้งแล้วไหม
echo "[1/3] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ไม่พบ!"
    echo "📥 ดาวน์โหลดจาก: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js OK"
echo "   Version: $(node --version)"

# ติดตั้ง Dependencies
echo ""
echo "[2/3] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ เกิดข้อผิดพลาดในการติดตั้ง"
    exit 1
fi
echo "✅ Dependencies installed"

# รัน Server
echo ""
echo "[3/3] Starting server..."
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  UPLOADSHARE ONLINE  🟢                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Open: http://localhost:3000"
echo "✨ All 8 services ready (Gofile, Catbox, Litterbox, etc)"
echo "⏹️  Stop: Ctrl + C"
echo ""

node server.js
