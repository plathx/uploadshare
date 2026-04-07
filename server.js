/**
 * 🚀 UPLOADSHARE FULL SERVER
 * 
 * เซิร์ฟเวอร์เดียวที่ทั้งแล้ว:
 * 1. โฮสต์เว็บไซต์ (index.html, script.js, style.css)
 * 2. CORS Proxy สำหรับอัปโหลด (ทั้ง 8 บริการ!)
 * 
 * วิธีใช้:
 * npm install express busboy node-fetch form-data
 * node server.js
 * 
 * เปิด: http://localhost:3000
 */

const express = require('express');
const busboy = require('busboy');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS Headers ────────────────────────────────────────────
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ── Serve Static Files ──────────────────────────────────────
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'public')));

// ── Root Route ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Upload Proxy Endpoints ──────────────────────────────────

/**
 * POST /upload/gofile
 * Gofile อัปโหลด
 */
app.post('/upload/gofile', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            // ขั้นตอน 1: รับเซิร์ฟเวอร์ที่ว่างอยู่
            const serverRes = await fetch('https://api.gofile.io/servers');
            const serverData = await serverRes.json();
            
            if (serverData.status !== 'ok') {
                return res.status(400).json({ success: false, error: 'ไม่ได้รับรู้สึกจาก Gofile' });
            }

            const server = serverData.data.servers[0].name;

            // ขั้นตอน 2: อัปโหลดไปยังเซิร์ฟเวอร์นั้น
            const formData = new FormData();
            formData.append('file', file.buffer, file.filename);

            const uploadRes = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadRes.json();
            
            if (uploadData.status === 'ok') {
                res.json({
                    success: true,
                    url: uploadData.data.downloadPage,
                    service: 'gofile'
                });
            } else {
                res.status(400).json({ success: false, error: 'Gofile API ล้มเหลว' });
            }
        } catch (error) {
            console.error('Gofile error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

/**
 * POST /upload/catbox
 * Catbox อัปโหลด
 */
app.post('/upload/catbox', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            const formData = new FormData();
            formData.append('reqtype', 'fileupload');
            formData.append('fileToUpload', file.buffer, file.filename);

            const uploadRes = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: formData
            });

            const text = await uploadRes.text();

            if (text && text.includes('moe')) {
                res.json({
                    success: true,
                    url: text.trim(),
                    service: 'catbox'
                });
            } else {
                res.status(400).json({ success: false, error: 'Catbox API ล้มเหลว' });
            }
        } catch (error) {
            console.error('Catbox error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

/**
 * POST /upload/litterbox
 * Litterbox อัปโหลด
 */
app.post('/upload/litterbox', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            const formData = new FormData();
            formData.append('reqtype', 'fileupload');
            formData.append('time', '72h');
            formData.append('fileToUpload', file.buffer, file.filename);

            const uploadRes = await fetch('https://litterbox.catbox.moe/user/api.php', {
                method: 'POST',
                body: formData
            });

            const text = await uploadRes.text();

            if (text && text.includes('moe')) {
                res.json({
                    success: true,
                    url: text.trim(),
                    service: 'litterbox'
                });
            } else {
                res.status(400).json({ success: false, error: 'Litterbox API ล้มเหลว' });
            }
        } catch (error) {
            console.error('Litterbox error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

/**
 * POST /upload/tmpfiles
 * Tmpfiles อัปโหลด
 */
app.post('/upload/tmpfiles', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            const formData = new FormData();
            formData.append('file', file.buffer, file.filename);

            const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
                method: 'POST',
                body: formData
            });

            const data = await uploadRes.json();

            if (data.status === 'success' && data.data.url) {
                res.json({
                    success: true,
                    url: data.data.url,
                    service: 'tmpfiles'
                });
            } else {
                res.status(400).json({ success: false, error: 'Tmpfiles API ล้มเหลว' });
            }
        } catch (error) {
            console.error('Tmpfiles error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

/**
 * POST /upload/uguu
 * Uguu อัปโหลด
 */
app.post('/upload/uguu', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            const formData = new FormData();
            formData.append('files[]', file.buffer, file.filename);

            const uploadRes = await fetch('https://uguu.se/upload.php', {
                method: 'POST',
                body: formData
            });

            const data = await uploadRes.json();

            if (data.success && data.files && data.files[0]) {
                res.json({
                    success: true,
                    url: data.files[0].url,
                    service: 'uguu'
                });
            } else {
                res.status(400).json({ success: false, error: 'Uguu API ล้มเหลว' });
            }
        } catch (error) {
            console.error('Uguu error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

/**
 * POST /upload/fileio
 * File.io อัปโหลด
 */
app.post('/upload/fileio', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            const formData = new FormData();
            formData.append('file', file.buffer, file.filename);

            const uploadRes = await fetch('https://file.io/', {
                method: 'POST',
                body: formData
            });

            const data = await uploadRes.json();

            if (data.success && data.link) {
                res.json({
                    success: true,
                    url: data.link,
                    service: 'fileio'
                });
            } else {
                res.status(400).json({ success: false, error: 'File.io API ล้มเหลว' });
            }
        } catch (error) {
            console.error('File.io error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

/**
 * POST /upload/pomf
 * Pomf อัปโหลด
 */
app.post('/upload/pomf', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            const formData = new FormData();
            formData.append('files[]', file.buffer, file.filename);

            const uploadRes = await fetch('https://pomf.lain.la/upload.php', {
                method: 'POST',
                body: formData
            });

            const data = await uploadRes.json();

            if (data.success && data.files && data.files[0]) {
                res.json({
                    success: true,
                    url: data.files[0].url,
                    service: 'pomf'
                });
            } else {
                res.status(400).json({ success: false, error: 'Pomf API ล้มเหลว' });
            }
        } catch (error) {
            console.error('Pomf error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

/**
 * POST /upload/0x0
 * 0x0.st อัปโหลด
 */
app.post('/upload/0x0', async (req, res) => {
    const bb = busboy({ headers: req.headers });
    let file = null;

    bb.on('file', (fieldname, stream, info) => {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
            file = {
                filename: info.filename,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('close', async () => {
        try {
            const formData = new FormData();
            formData.append('file', file.buffer, file.filename);

            const uploadRes = await fetch('https://0x0.st', {
                method: 'POST',
                body: formData
            });

            const text = await uploadRes.text();

            if (text && (text.startsWith('https://') || text.startsWith('http://'))) {
                res.json({
                    success: true,
                    url: text.trim(),
                    service: '0x0'
                });
            } else {
                res.status(400).json({ success: false, error: '0x0.st API ล้มเหลว' });
            }
        } catch (error) {
            console.error('0x0 error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

// ── Health Check ────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        services: ['gofile', 'catbox', 'litterbox', 'tmpfiles', 'uguu', 'fileio', 'pomf', '0x0'],
        timestamp: new Date().toISOString()
    });
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                  UPLOADSHARE SERVER ONLINE                 ║
╚════════════════════════════════════════════════════════════╝

🚀 Server URL: http://localhost:${PORT}
📝 Web Interface: http://localhost:${PORT}

✅ Static Files: READY
✅ Gofile Proxy: READY
✅ Catbox Proxy: READY
✅ Litterbox Proxy: READY
✅ Tmpfiles Proxy: READY
✅ Uguu Proxy: READY
✅ File.io Proxy: READY
✅ Pomf Proxy: READY
✅ 0x0.st Proxy: READY

📊 Health Check: http://localhost:${PORT}/health

    `);
});

process.on('SIGINT', () => {
    console.log('\n\n🛑 Server stopped');
    process.exit(0);
});
