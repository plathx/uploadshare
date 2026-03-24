const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const removeFileBtn = document.getElementById('remove-file');
const uploadBtn = document.getElementById('upload-btn');
const progressArea = document.getElementById('progress-area');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const resultArea = document.getElementById('result-area');
const resultLink = document.getElementById('result-link');
const copyBtn = document.getElementById('copy-btn');
const resetBtn = document.getElementById('reset-btn');
const errorMessage = document.getElementById('error-message');
const qrcodeContainer = document.getElementById('qrcode');

let selectedFile = null;

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function handleFile(file) {
    if (!file) return;
    selectedFile = file;
    errorMessage.classList.add('hidden');
    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    uploadBtn.removeAttribute('disabled');
}

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});

removeFileBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    dropZone.classList.remove('hidden');
    uploadBtn.setAttribute('disabled', 'true');
});

uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    uploadBtn.classList.add('hidden');
    fileInfo.classList.add('hidden');
    progressArea.classList.remove('hidden');
    try {
        const serverRes = await fetch('https://api.gofile.io/servers', { method: 'GET' });
        const serverData = await serverRes.json();
        if (serverData.status !== 'ok') throw new Error("Server Gofile มีปัญหา กรุณาลองใหม่");
        const server = serverData.data.servers[0].name;
        const formData = new FormData();
        formData.append('file', selectedFile);
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
                progressPercent.textContent = percent + '%';
            }
        });
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                if (response.status === 'ok') showSuccess(response.data.downloadPage);
                else handleError(response.error || "อัปโหลดล้มเหลว");
            } else handleError("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
        });
        xhr.open('POST', `https://${server}.gofile.io/contents/uploadfile`);
        xhr.send(formData);
    } catch (error) { handleError(error.message); }
});

function showSuccess(link) {
    progressArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    resultLink.value = link;
    qrcodeContainer.innerHTML = "";
    new QRCode(qrcodeContainer, { text: link, width: 140, height: 140, correctLevel: QRCode.CorrectLevel.H });
}

function handleError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
    uploadBtn.classList.remove('hidden');
    progressArea.classList.add('hidden');
}

copyBtn.addEventListener('click', () => {
    resultLink.select();
    document.execCommand('copy');
    const icon = copyBtn.querySelector('i');
    icon.className = 'fa-solid fa-check';
    copyBtn.classList.replace('bg-gray-900', 'bg-green-600');
    setTimeout(() => { 
        icon.className = 'fa-regular fa-copy'; 
        copyBtn.classList.replace('bg-green-600', 'bg-gray-900');
    }, 2000);
});

resetBtn.addEventListener('click', () => location.reload());

window.addEventListener('click', (e) => {
    const emojis = ['พ่อมึงตาย', 'แม่มึงตาย', 'พ่อมึงตาย', 'แม่มึงตาย', 'พ่อมึงตาย', 'แม่มึงตาย', 'พ่อมึงตาย', 'แม่มึงตาย'];
    const emoji = document.createElement('div');
    emoji.className = 'click-emoji';
    emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    emoji.style.left = e.clientX + 'px';
    emoji.style.top = e.clientY + 'px';
    document.body.appendChild(emoji);
    setTimeout(() => emoji.remove(), 1000);
});
