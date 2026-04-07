# 🚀 Deploy ไป Vercel - สำหรับสาธารณะ

ทำให้เว็บไซต์ของคุณเข้าถึงได้จากทั่วโลก!

---

## ✨ 2 วิธีด่วน

### **วิธี A: GitHub + Vercel (แนะนำ)**
```
GitHub → Vercel (Auto Deploy)
         ↓
    your-site.vercel.app
```

### **วิธี B: Drag & Drop (เร็วที่สุด)**
```
โฟลเดอร์ → Drag to Vercel
           ↓
      your-site.vercel.app
```

---

## 📌 วิธี A: GitHub + Vercel (แบบปกติ)

### ขั้นตอนที่ 1-2: GitHub Setup (5 นาที)

```bash
# 1. สร้าง Git repository เฉพาะที่ (Local)
cd uploadshare-main
git init

# 2. เพิ่มไฟล์ทั้งหมด
git add .

# 3. บันทึก
git commit -m "Initial commit - uploadshare v2.0.1 🚀"

# 4. เปลี่ยนชื่อ branch เป็น main
git branch -M main

# 5. เชื่อมต่อ GitHub
git remote add origin https://github.com/YOUR_USERNAME/uploadshare.git

# 6. อัปโหลดขึ้น GitHub
git push -u origin main
```

**หมายเหตุ:** ต้องสมัคร GitHub ก่อนหากยังไม่มี: https://github.com/signup

### ขั้นตอนที่ 3: Vercel Setup (2 นาที)

1. ไปที่ **https://vercel.com**
2. คลิก "Sign Up" หรือ "Log In"
3. เลือก "Continue with GitHub"
4. Authorize Vercel
5. คลิก "Import Project"
6. เลือก "uploadshare" repository
7. คลิก "Import"

### ขั้นตอนที่ 4: ตั้งค่า Environment

ปล่อยไว้แบบนี้:
```
Framework Preset: Node.js
Root Directory: ./
Build Command: (ปล่อยว่าง)
Output Directory: (ปล่อยว่าง)
Environment Variables: (ไม่ต้องใส่)
```

### ขั้นตอนที่ 5: คลิก Deploy 🎯

```
Opening Deployments... --> Building... --> 
Initializing... --> Analytics... --> DONE! ✅
```

**ผลลัพธ์:** `https://uploadshare-xxx.vercel.app` 🎉

---

## 📌 วิธี B: Drag & Drop (ง่ายทีเดียว)

### ขั้นตอนที่ 1: จัดเตรียมไฟล์

สร้างโฟลเดอร์ใหม่ `uploadshare-deploy` แล้วคัดลอก:

```
uploadshare-deploy/
├── index.html
├── script.js
├── style.css
├── server.js
├── package.json
└── vercel.json          (สำคัญ!)
```

### ขั้นตอนที่ 2: Drag & Drop ลง Vercel

1. ไปที่ https://vercel.com/dashboard
2. คลิก **"Add New..."** → **"Project"**
3. **Drag & Drop** โฟลเดอร์ `uploadshare-deploy` ลงไป
4. Vercel ทำการวิเคราะห์และ Deploy อัตโนมัติ

```
[Drag & Drop Here]
        ↓
    Uploading... (30%)
        ↓
    Building... (60%)
        ↓
    Ready! ✅
```

---

## 🔧 ไฟล์ vercel.json (ต้องมี!)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/upload/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/health",
      "dest": "/server.js"
    },
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**บทบาท:** บอก Vercel ว่า Express Server ทำงานไง

---

## 📊 ผลลัพธ์

| ขั้นตอน | เวลา | ผลลัพธ์ |
|--------|------|--------|
| **1. สมัคร/ล็อกอิน** | 5 นาที | GitHub + Vercel Account |
| **2. Push Code** | 1 นาที | Repository บน GitHub |
| **3. Deploy** | 2 นาที | Live URL สาธารณะ ✅ |

**รวม: 8 นาที แล้วเสร็จ!**

---

## 🌐 URL ของคุณจะเป็นแบบนี้

```
https://uploadshare.vercel.app
https://uploadshare-yourname.vercel.app
```

**ใช้ได้จากที่ไหนก็ได้ 🌍**

---

## ✅ เช็คสถานะ

หลังจากอัปโหลด:

```bash
# ตรวจสอบว่า Server ทำงาน
curl https://uploadshare.vercel.app/health

# ควรได้:
{
  "status": "OK",
  "services": ["gofile", "catbox", "litterbox", ...],
  "timestamp": "2025-04-07T..."
}
```

---

## 🐛 Troubleshooting

### ❌ Build Failed?
**สาเหตุ:** ไม่มี `package.json`
**แก้:** ตรวจสอบ package.json ในโฟลเดอร์

### ❌ Upload Error?
**สาเหตุ:** ไม่มี `vercel.json`
**แก้:** คัดลอกไฟล์ vercel.json ลงไป

### ❌ Cannot POST /upload/gofile?
**สาเหตุ:** ไม่มี `server.js`
**แก้:** ตรวจสอบ server.js อยู่ในโฟลเดอร์หลัก

---

## 📱 ทดสอบเว็บไซต์

1. เปิด: `https://uploadshare.vercel.app`
2. เลือกบริการ
3. อัปโหลดไฟล์ทดสอบ
4. ควรได้ลิงก์แชร์ ✅

---

## 🎯 ข้อดีของ Vercel

✅ **ฟรี** (ไม่มีค่าใช้งาน)
✅ **รวดเร็ว** (CDN ทั่วโลก)
✅ **HTTPS** (ปลอดภัย)
✅ **Auto Deploy** (GitHub)
✅ **No Uptime** (ไม่ต้องเปิด PC ตลอดเวลา)

---

## 🚀 หารหลัก

**สรุป:**
1. สร้าง GitHub Account
2. Push Code ขึ้น GitHub  
3. เชื่อมต่อ Vercel
4. Deploy!

**เสร็จ! เว็บไซต์สาธารณะแล้ว 🎉**

---

**Version:** 2.0.1 Production Ready
**Last Updated:** 2025-04-07
