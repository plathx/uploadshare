!function() {
    "use strict";

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
            if (serverData.status !== 'ok') throw new Error("API Error");
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
                    else handleError(response.error || "Upload failed");
                } else handleError("Server Error");
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
        new QRCode(qrcodeContainer, { text: link, width: 140, height: 140 });
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

    function Branch(parent, level, x, y) {
        this.parent = parent;
        this.branches = [];
        this.p0 = parent ? parent.p1 : new Point(x, y);
        this.p1 = new Point(x, y);
        this.level = level;
        this.life = 20;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
    }

    Branch.prototype.grow = function() {
        for (var i = 0; i < this.branches.length; i++) this.branches[i].grow();
        if (this.life > 1) {
            this.p1.x += this.vx;
            this.p1.y += this.vy;
            ctx.beginPath();
            ctx.lineCap = "round";
            if (this.level) {
                ctx.lineWidth = this.level * 6 - 5;
                ctx.strokeStyle = "#6366f1"; 
                if (this.parent) {
                    ctx.moveTo(this.parent.p0.x, this.parent.p0.y);
                    ctx.quadraticCurveTo(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
                }
                ctx.stroke();
            } else {
                ctx.lineWidth = 10;
                ctx.strokeStyle = "#a855f7"; 
                ctx.moveTo(this.p0.x, this.p0.y);
                ctx.lineTo(this.p1.x, this.p1.y);
                ctx.stroke();
            }
        }
        if (this.life === 1 && this.level > 0 && this.level < maxLevels) {
            this.branches.push(newBranch(this));
            this.branches.push(newBranch(this));
        }
        this.life--;
    };

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function newBranch(parent) {
        var branch = new Branch(parent, parent.level - 1, parent.p1.x, parent.p1.y);
        branch.angle = (autorun && parent.level === maxLevels) ? Math.random() * 2 * Math.PI : Math.atan2(
            parent.p1.y - parent.p0.y,
            parent.p1.x - parent.p0.x
        ) + (Math.random() * 1.4 - 0.7);
        branch.vx = Math.cos(branch.angle) * 12;
        branch.vy = Math.sin(branch.angle) * 12;
        branch.life = branch.level === 1 ? 5 : Math.round(Math.random() * (branch.level * 2)) + 2;
        return branch;
    }

    function run() {
        requestAnimationFrame(run);
        if (++frame % 2) {
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = "rgba(255,255,255,0.01)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = "source-over";
        }
        current.p1.x = pointer.x;
        current.p1.y = pointer.y;
        root.grow();
        if ((autorun && Math.random() > 0.8) || pointer.moveDistance > 20) {
            pointer.moveDistance = 0;
            var branch = new Branch(current, current.level, current.p1.x, current.p1.y);
            current.branches.push(branch);
            if (Math.random() > 0.8) current.branches.push(newBranch(current));
            current = branch;
            nBranches++;
        }
        if (nBranches > maxBranches) {
            root = root.branches[0];
            nBranches--;
        }
    }

    var canvasElement = document.getElementById('canvas');
    var ctx = canvasElement.getContext("2d");
    var canvas = {
        width: 0,
        height: 0,
        resize: function() {
            this.width = canvasElement.width = canvasElement.offsetWidth;
            this.height = canvasElement.height = canvasElement.offsetHeight;
        }
    };

    window.addEventListener('resize', canvas.resize.bind(canvas), false);
    canvas.resize();

    var pointer = {
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        px: 0,
        py: 0,
        moveDistance: 0,
        move: function(e) {
            var p = e.targetTouches ? e.targetTouches[0] : e;
            this.x = p.clientX;
            this.y = p.clientY;
            var dx = this.x - this.px;
            var dy = this.y - this.py;
            this.moveDistance += Math.sqrt(dx * dx + dy * dy);
            if (this.moveDistance > 40) {
                this.x = this.px + dx * 0.1;
                this.y = this.py + dy * 0.1;
            }
            if (autorun) {
                this.x = p.clientX;
                this.y = p.clientY;
                root = new Branch(false, maxLevels, this.x, this.y);
                current = root;
                autorun = false;
            }
            this.px = this.x;
            this.py = this.y;
        }
    };

    window.addEventListener("mousemove", pointer.move.bind(pointer), false);
    window.addEventListener("touchmove", pointer.move.bind(pointer), false);
    window.addEventListener("pointerdown", (e) => {
        const emojis = ['พ่อมึงตาย', 'แม่มึงตาย';
        const emoji = document.createElement('div');
        emoji.className = 'click-emoji';
        emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = e.clientX + 'px';
        emoji.style.top = e.clientY + 'px';
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 800);
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    var maxLevels = 7;
    var nBranches = 0;
    var maxBranches = 200;
    var autorun = true;
    var frame = 0;
    var root = new Branch(false, maxLevels, pointer.x, pointer.y);
    var current = root;

    run();
}();
