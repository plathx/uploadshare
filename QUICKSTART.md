# 🚀 UPLOADSHARE QUICK START - ทั้ง 8 บริการใช้ได้เล ย!

## ✨ สิ่งที่ดีเกี่ยวกับ Version 2.0.1

✅ **ทั้ง 8 บริการทำงาน** (Gofile, Catbox, Litterbox, Tmpfiles, Uguu, File.io, Pomf, 0x0.st)
✅ **ไม่มี CORS Error** อีกต่อไป
✅ **ใช้ 1 เซิร์ฟเวอร์เดียว** สำหรับทั้งเว็บไซต์ + Proxy

---

## 📋 ขั้นตอนการติดตั้ง (3 ขั้นแค่นี้)

### **ขั้นที่ 1: ติดตั้ง Node.js Dependencies**

```bash
npm install
```

หรือถ้ากำลังใช้เป็นครั้งแรก:
```bash
npm run setup
```

### **ขั้นที่ 2: รันเซิร์ฟเวอร์**

```bash
npm start
```

หรือ:
```bash
node server.js
```

### **ขั้นที่ 3: เปิดในเบราว์เซอร์**

```
http://localhost:3000
```

---

## 🎯 อันนี้แล้ว! ทำงานเต็มที่!

### ✅ ตัวอักษร Server Log จะแสดง:

```
╔════════════════════════════════════════════════════════════╗
║                  UPLOADSHARE SERVER ONLINE                 ║
╚════════════════════════════════════════════════════════════╝

🚀 Server URL: http://localhost:3000
📝 Web Interface: http://localhost:3000

✅ Static Files: READY
✅ Gofile Proxy: READY
✅ Catbox Proxy: READY
✅ Litterbox Proxy: READY
✅ Tmpfiles Proxy: READY
✅ Uguu Proxy: READY
✅ File.io Proxy: READY
✅ Pomf Proxy: READY
✅ 0x0.st Proxy: READY
```

---

## 💡 ทำไมใช้เซิร์ฟเวอร์ Express?

| ปัญหา | วิธีแก้ |
|-------|--------|
| ❌ CORS Error | ✅ Express ทำเหมือนเป็นกลาง |
| ❌ Catbox/Litterbox/Pomf ไม่ทำงาน | ✅ ทำงานผ่าน Proxy |
| ❌ ต้องตั้งหลายตัว | ✅ เซิร์ฟเวอร์เดียวทำได้ทั้งหมด |

เซิร์ฟเวอร์ Express:
1. **โฮสต์เว็บไซต์** (index.html, script.js, style.css)
2. **Proxy สำหรับแต่ละบริการ** (/upload/gofile, /upload/catbox ฯลฯ)

---

## 🧪 ทดสอบบริการ

### Health Check
```bash
curl http://localhost:3000/health
```

**ผลลัพธ์:**
```json
{
  "status": "OK",
  "services": [
    "gofile", "catbox", "litterbox", "tmpfiles", 
    "uguu", "fileio", "pomf", "0x0"
  ],
  "timestamp": "2025-04-07T..."
}
```

---

## 📁 โครงสร้างไฟล์ที่เปลี่ยน

```
uploadshare-main/
├── index.html           (เว็บไซต์)
├── script.js            (อัปเดตให้ใช้ /upload/...)
├── style.css            (ไม่เปลี่ยน)
├── server.js            ✨ ใหม่! Proxy Server
├── package.json         ✨ ใหม่! Dependencies
├── README.md            (อัปเดต)
├── FIXES.md             (อัปเดต)
├── QUICKSTART.md        ✨ ใหม่! (ไฟล์นี้)
└── proxy-server-example.js (เก่า ไม่ต้องใช้แล้ว)
```

---

## 🛑 จะหยุดเซิร์ฟเวอร์ยังไง?

```
Ctrl + C
```

หรือจากอีกหน้าต่าง Terminal:
```bash
# ใน PowerShell
Get-Process node | Stop-Process -Force

# ใน Bash
pkill -f "node server.js"
```

---

## ❓ FAQ

### Q: ทำไมต้องตั้ง npm install?
A: เซิร์ฟเวอร์ใช้ 4 library สำคัญ (express, busboy, node-fetch, form-data)

### Q: หากมี Pport 3000 taken?
A: แก้ไข server.js บรรทัด 12:
```javascript
const PORT = process.env.PORT || 3001; // เปลี่ยน 3000 เป็น 3001
```

### Q: ใช้ได้ไหมใน Vercel/Heroku?
A: ได้! เพียงสร้าง `.env` หรือ deploy ได้เลย (ดูเอกสาร deployment)

### Q: ฉันต้องโฮสต์ online ไหม?
A: ไม่ต้อง! ใช้ localhost:3000 ได้เลย (เฉพาะคอมพิวเตอร์ของคุณ)

---

## 📦 Dependencies ที่ติดตั้ง

| Package | เวอร์ชัน | ใช้สำหรับ |
|---------|---------|----------|
| express | 4.18.2 | Web Server |
| busboy | 1.0.0 | ประมวลผล File Upload |
| node-fetch | 2.7.0 | Fetch API (Node.js) |
| form-data | 4.0.0 | FormData (Proxy) |

---

## 🎉 เสร็จแล้ว!

```bash
npm start
# เปิด http://localhost:3000
# ลองอัปโหลดไฟล์
# ✨ ใช้ได้ 8 บริการแล้ว!
```

---

## 📝 หมายเหตุ

- ไฟล์จะเก็บบนเซิร์ฟเวอร์ของบริการนั้นๆ (ไม่ใช่เซิร์ฟเวอร์ของคุณ)
- ประวัติจะเก็บใน Browser LocalStorage (เครื่องของคุณเท่านั้น)
- ไม่มีการส่งข้อมูลออกไปที่อื่น ปลอดภัย!

---

**📅 Updated: 2025-04-07**  
**🏷️ Version: 2.0.1 FINAL**
