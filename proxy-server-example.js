/**
 * CORS Proxy Server สำหรับ uploadshare
 * ใช้ในกรณีที่บริการอัปโหลดบริการบางส่วนแสดงข้อผิดพลาด CORS
 * 
 * การติดตั้ง:
 * 1. npm install express busboy node-fetch form-data
 * 2. node proxy-server-example.js
 * 3. เปลี่ยน uploadUrl ใน script.js เป็น http://localhost:5000/proxy/{service}
 */

const express = require('express');
const busboy = require('busboy');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

/**
 * อัปโหลดแบบพร็อกซี
 * POST /proxy/catbox
 * POST /proxy/litterbox
 * POST /proxy/pomf
 * เป็นต้น
 */
app.post('/proxy/:service', (req, res) => {
    const service = req.params.service;
    const bb = busboy({ headers: req.headers });
    
    let fileData = null;
    let fields = {};

    bb.on('file', (fieldname, file, info) => {
        const chunks = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
            fileData = {
                fieldname,
                filename: info.filename,
                encoding: info.encoding,
                mimetype: info.mimeType,
                buffer: Buffer.concat(chunks)
            };
        });
    });

    bb.on('field', (fieldname, val) => {
        fields[fieldname] = val;
    });

    bb.on('close', async () => {
        try {
            let response;

            switch(service) {
                case 'catbox':
                    response = await uploadToCatboxProxy(fileData, fields);
                    break;
                case 'litterbox':
                    response = await uploadToLitterboxProxy(fileData, fields);
                    break;
                case 'pomf':
                    response = await uploadToPomfProxy(fileData, fields);
                    break;
                case 'uguu':
                    response = await uploadToUguuProxy(fileData, fields);
                    break;
                case '0x0':
                    response = await uploadTo0x0Proxy(fileData, fields);
                    break;
                default:
                    return res.status(400).json({ success: false, error: 'Unknown service' });
            }

            res.json(response);
        } catch (error) {
            console.error(`Proxy error for ${service}:`, error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    req.pipe(bb);
});

async function uploadToCatboxProxy(fileData, fields) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', fileData.buffer, fileData.filename);
    
    const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
    });

    const text = await response.text();
    return {
        success: text.includes('moe'),
        url: text.trim(),
        service: 'catbox'
    };
}

async function uploadToLitterboxProxy(fileData, fields) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('time', fields.time || '72h');
    formData.append('fileToUpload', fileData.buffer, fileData.filename);
    
    const response = await fetch('https://litterbox.catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
    });

    const text = await response.text();
    return {
        success: text.includes('moe'),
        url: text.trim(),
        service: 'litterbox'
    };
}

async function uploadToPomfProxy(fileData, fields) {
    const formData = new FormData();
    formData.append('files[]', fileData.buffer, fileData.filename);
    
    const response = await fetch('https://pomf.lain.la/upload.php', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return {
        success: data.success,
        url: data.files?.[0]?.url || '',
        service: 'pomf'
    };
}

async function uploadToUguuProxy(fileData, fields) {
    const formData = new FormData();
    formData.append('files[]', fileData.buffer, fileData.filename);
    
    const response = await fetch('https://uguu.se/upload.php', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return {
        success: data.success,
        url: data.files?.[0]?.url || '',
        service: 'uguu'
    };
}

async function uploadTo0x0Proxy(fileData, fields) {
    const formData = new FormData();
    formData.append('file', fileData.buffer, fileData.filename);
    
    const response = await fetch('https://0x0.st', {
        method: 'POST',
        body: formData
    });

    const text = await response.text();
    return {
        success: text.startsWith('http'),
        url: text.trim(),
        service: '0x0'
    };
}

// ตรวจสอบสุขภาพ
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'uploadshare-proxy' });
});

app.listen(PORT, () => {
    console.log(`✅ Proxy server running on http://localhost:${PORT}`);
    console.log(`📝 Use this in script.js:`);
    console.log(`   Update upload functions to use: http://localhost:${PORT}/proxy/{service}`);
});
