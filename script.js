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
    const cancelUploadBtn = document.getElementById('cancel-upload-btn');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    
    const openHistoryBtn = document.getElementById('open-history-btn');
    const closeHistoryBtn = document.getElementById('close-history-btn');
    const historyModal = document.getElementById('history-modal');
    const historyModalContent = document.getElementById('history-modal-content');
    const historyList = document.getElementById('history-list');
    const emptyHistory = document.getElementById('empty-history');
    
    const searchHistoryInput = document.getElementById('search-history-input');
    const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const noSearchResults = document.getElementById('no-search-results');

    let selectedFile = null;
    let uploadAbortController = null;
    let selectedProvider = 'gofile';
    const uploadLimitText    = document.getElementById('upload-limit-text');
    const providerNameBadge  = document.getElementById('provider-name-badge');

    // ── Provider data ──────────────────────────────────────────────
    const PROVIDERS = [
        { id: 'gofile',    name: 'Gofile',    icon: 'fa-cloud',           iconColor: '#6366f1', limit: 'Unlimited', limitColor: '#6366f1', life: 'ถาวร',              badge: 'แนะนำ' },
        { id: 'catbox',    name: 'Catbox',    icon: 'fa-cat',             iconColor: '#f59e0b', limit: '200 MB',    life: 'ถาวร' },
        { id: 'litterbox', name: 'Litterbox', icon: 'fa-box-open',        iconColor: '#f97316', limit: '1 GB',      life: '3 วัน (72ชม.)' },
        { id: 'tmpfiles',  name: 'Tmpfiles',  icon: 'fa-stopwatch',       iconColor: '#ef4444', limit: '5 GB',      life: '60 นาที' },
        { id: 'uguu',      name: 'Uguu',      icon: 'fa-frog',            iconColor: '#22c55e', limit: '128 MB',    life: '24 ชม.' },
        { id: 'fileio',    name: 'File.io',   icon: 'fa-share-nodes',     iconColor: '#3b82f6', limit: '2 GB',      life: '1 ครั้งทิ้ง' },
        { id: 'pomf',      name: 'Pomf',      icon: 'fa-feather-pointed', iconColor: '#ec4899', limit: '512 MB',    life: 'ถาวร' },
        { id: '0x0',       name: '0x0.st',    icon: 'fa-terminal',        iconColor: '#374151', limit: '512 MB',    life: '30–365 วัน' },
    ];
    const LIMITS_TEXT = {
        'gofile':'Limit: Unlimited','catbox':'Limit: 200 MB','litterbox':'Limit: 1 GB',
        'tmpfiles':'Limit: 5 GB','uguu':'Limit: 128 MB','fileio':'Limit: 2 GB',
        'pomf':'Limit: 512 MB','0x0':'Limit: 512 MB'
    };
    const N        = PROVIDERS.length; // 8
    const CLONE    = 3;                // clones per side
    const CARD_W   = 130;
    const GAP      = 12;
    const SLOT     = CARD_W + GAP;    // 142

    // ── DOM refs ───────────────────────────────────────────────────
    const pcOuter  = document.getElementById('pc-outer');
    const pcClip   = pcOuter ? pcOuter.querySelector('.pc-clip') : null;
    const track    = document.getElementById('provider-track');
    const dotsEl   = document.getElementById('provider-dots');
    const prevBtn  = document.getElementById('pc-prev');
    const nextBtn  = document.getElementById('pc-next');

    // absolute index in extended array (CLONE..CLONE+N-1 = real items)
    let absIdx     = CLONE;      // starts at real[0]
    let canNav     = true;

    // ── Build extended list for seamless infinite loop ─────────────
    function extendedList() {
        const last  = PROVIDERS.slice(N - CLONE);
        const first = PROVIDERS.slice(0, CLONE);
        return [...last, ...PROVIDERS, ...first]; // total = N + 2*CLONE
    }
    const EXT = extendedList();

    // ── Offset helper ──────────────────────────────────────────────
    function centerOffset() {
        const clipW = pcClip ? pcClip.clientWidth : (pcOuter ? pcOuter.clientWidth : 300);
        return clipW / 2 - CARD_W / 2;
    }

    // ── Apply transform (with or without transition) ───────────────
    function moveTo(idx, animate) {
        if (!track) return;
        track.style.transition = animate
            ? 'transform 0.38s cubic-bezier(0.4,0,0.2,1)'
            : 'none';
        const x = centerOffset() - idx * SLOT;
        track.style.transform = `translateY(-50%) translateX(${x}px)`;
    }

    // ── Navigate by delta (+1 / -1) ───────────────────────────────
    function goBy(delta) {
        if (!canNav) return;
        canNav = false;
        absIdx += delta;
        moveTo(absIdx, true);
        const realIdx = realOf(absIdx);
        refreshUI(realIdx);
    }

    // ── Jump directly to a real index ─────────────────────────────
    function goToReal(realIdx) {
        absIdx = realIdx + CLONE;
        moveTo(absIdx, true);
        refreshUI(realIdx);
        if (!canNav) canNav = true; // allow nav even mid-transition
    }

    // ── Convert absolute idx → real 0..N-1 ────────────────────────
    function realOf(idx) {
        return ((idx - CLONE) % N + N) % N;
    }

    // ── Update cards & dots & labels ──────────────────────────────
    function refreshUI(realIdx) {
        if (!track) return;
        track.querySelectorAll('.pc-card').forEach((c, i) => {
            const r     = ((i - CLONE) % N + N) % N;
            const isAct = r === realIdx;
            const isAdj = r === (realIdx + 1) % N || r === ((realIdx - 1) + N) % N;
            c.classList.toggle('is-active',   isAct);
            c.classList.toggle('is-adjacent', !isAct && isAdj);
        });
        dotsEl.querySelectorAll('.pc-dot').forEach((d, i) =>
            d.classList.toggle('active', i === realIdx));
        selectedProvider = PROVIDERS[realIdx].id;
        if (uploadLimitText)   uploadLimitText.textContent   = LIMITS_TEXT[selectedProvider];
        if (providerNameBadge) providerNameBadge.textContent = PROVIDERS[realIdx].name;
    }

    // ── Build track DOM ────────────────────────────────────────────
    function buildCarousel() {
        if (!track || !dotsEl) return;
        track.innerHTML = '';
        dotsEl.innerHTML = '';

        EXT.forEach((p, i) => {
            const card = document.createElement('div');
            card.className = 'pc-card';
            card.innerHTML = `
                ${p.badge ? `<div class="pc-badge">${p.badge}</div>` : ''}
                <div class="pc-head">
                    <i class="fa-solid ${p.icon} pc-icon" style="color:${p.iconColor}"></i>
                    <span class="pc-name">${p.name}</span>
                </div>
                <div class="pc-row">
                    <i class="fa-solid fa-hard-drive" style="color:#c7d2fe;font-size:0.55rem"></i>
                    <b style="color:${p.limitColor||'#374151'}">${p.limit}</b>
                </div>
                <div class="pc-row">
                    <i class="fa-regular fa-clock" style="color:#d1d5db;font-size:0.55rem"></i>
                    <span class="pc-life">${p.life}</span>
                </div>`;
            card.addEventListener('click', () => {
                const r = ((i - CLONE) % N + N) % N;
                goToReal(r);
            });
            track.appendChild(card);
        });

        PROVIDERS.forEach((p, i) => {
            const dot = document.createElement('div');
            dot.className = 'pc-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToReal(i));
            dotsEl.appendChild(dot);
        });

        moveTo(absIdx, false);
        refreshUI(realOf(absIdx));
    }

    // ── Infinite-loop jump after transition ends ───────────────────
    if (track) {
        track.addEventListener('transitionend', () => {
            canNav = true;
            if (absIdx < CLONE) {
                absIdx += N;
                moveTo(absIdx, false);
            } else if (absIdx >= CLONE + N) {
                absIdx -= N;
                moveTo(absIdx, false);
            }
        });
    }

    // ── Arrow buttons ──────────────────────────────────────────────
    if (prevBtn) prevBtn.addEventListener('click', e => { e.stopPropagation(); goBy(-1); });
    if (nextBtn) nextBtn.addEventListener('click', e => { e.stopPropagation(); goBy(1); });

    // ── Mouse wheel ────────────────────────────────────────────────
    if (pcOuter) {
        pcOuter.addEventListener('wheel', e => {
            e.preventDefault();
            const d = e.deltaX || e.deltaY;
            if (Math.abs(d) > 8) goBy(d > 0 ? 1 : -1);
        }, { passive: false });

        // ── Mouse drag ─────────────────────────────────────────────
        let dragX = 0, dragging = false;
        pcOuter.addEventListener('mousedown', e => {
            dragging = true; dragX = e.clientX;
        });
        document.addEventListener('mouseup', e => {
            if (!dragging) return; dragging = false;
            const diff = dragX - e.clientX;
            if (Math.abs(diff) > 30) goBy(diff > 0 ? 1 : -1);
        });

        // ── Touch swipe ────────────────────────────────────────────
        let touchX = 0;
        pcOuter.addEventListener('touchstart', e => {
            touchX = e.touches[0].clientX;
        }, { passive: true });
        pcOuter.addEventListener('touchend', e => {
            const diff = touchX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 30) goBy(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // ── Recalculate position on resize ────────────────────────────
    window.addEventListener('resize', () => moveTo(absIdx, false));

    buildCarousel();


    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    }

    function saveToHistory(name, size, link) {
        let history = JSON.parse(localStorage.getItem('gofile_history') || '[]');
        history.unshift({
            id: Date.now().toString(),
            name: name,
            size: size,
            link: link,
            date: new Date().toISOString()
        });
        localStorage.setItem('gofile_history', JSON.stringify(history));
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('gofile_history') || '[]');
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            emptyHistory.classList.remove('hidden');
            emptyHistory.classList.add('flex');
            searchHistoryInput.disabled = true;
            clearAllHistoryBtn.disabled = true;
            clearAllHistoryBtn.classList.add('opacity-50', 'cursor-not-allowed');
            return;
        }

        emptyHistory.classList.add('hidden');
        emptyHistory.classList.remove('flex');
        searchHistoryInput.disabled = false;
        clearAllHistoryBtn.disabled = false;
        clearAllHistoryBtn.classList.remove('opacity-50', 'cursor-not-allowed');

        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item bg-white border border-gray-100 rounded-2xl p-4 shadow-sm transition-all duration-300';
            
            historyItem.innerHTML = `
                <div class="flex justify-between items-center cursor-pointer select-none group" onclick="toggleHistoryItem('${item.id}')">
                    <div class="flex items-center overflow-hidden w-full pr-2">
                        <div class="mr-3 flex items-center" onclick="event.stopPropagation()">
                            <input type="checkbox" id="cb-${item.id}" class="history-checkbox w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm transition-colors" value="${item.id}" onchange="window.updateSelection()">
                        </div>
                        <div class="bg-indigo-50 p-2.5 rounded-xl mr-3 text-indigo-500 shrink-0">
                            <i class="fa-solid fa-file-lines"></i>
                        </div>
                        <div class="overflow-hidden w-full">
                            <p class="text-sm font-semibold text-gray-800 truncate history-item-name">${item.name}</p>
                            <div class="flex items-center text-[11px] text-gray-400 mt-0.5">
                                <span>${item.size}</span>
                                <span class="mx-1.5">•</span>
                                <span>${formatDate(item.date)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1 shrink-0 text-gray-300 transition-all duration-300">
                        <button onclick="deleteHistoryItem(event, '${item.id}')" class="text-gray-300 hover:text-red-500 active:bg-red-50 hover:bg-red-50 w-7 h-7 rounded-full flex items-center justify-center transition-colors" title="ลบรายการนี้">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                        <div class="chevron-icon shrink-0 w-5 flex justify-center">
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                    </div>
                </div>
                <div class="history-item-content border-t border-gray-50 mt-3 pt-0" id="content-${item.id}">
                    <div class="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center mb-4 mt-3">
                        <div id="qr-${item.id}" class="p-1 bg-white rounded-lg shadow-sm"></div>
                        <button onclick="downloadHistoryQr('${item.id}', '${item.name}')" class="mt-3 text-[10px] bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center shadow-sm">
                            <i class="fa-solid fa-download mr-1"></i> โหลด QR
                        </button>
                    </div>
                    <div class="relative group">
                        <input type="text" id="link-${item.id}" readonly value="${item.link}" class="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 block p-3 pr-12 outline-none transition select-text">
                        <button onclick="copyHistoryLink('${item.id}')" id="copybtn-${item.id}" class="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-900 hover:bg-black text-white px-3 rounded-lg transition duration-200 flex items-center justify-center">
                            <i class="fa-regular fa-copy text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
        
        selectAllCheckbox.checked = false;
        window.updateSelection();
    }

    window.toggleHistoryItem = function(id) {
        const itemContent = document.getElementById(`content-${id}`);
        const parentItem = itemContent.closest('.history-item');
        const isExpanded = parentItem.classList.contains('expanded');
        
        document.querySelectorAll('.history-item.expanded').forEach(el => {
            el.classList.remove('expanded');
        });

        if (!isExpanded) {
            parentItem.classList.add('expanded');
            const qrContainer = document.getElementById(`qr-${id}`);
            const linkInput = document.getElementById(`link-${id}`);
            if (qrContainer.innerHTML === "") {
                new QRCode(qrContainer, { text: linkInput.value, width: 100, height: 100 });
            }
        }
    };

    window.copyHistoryLink = function(id) {
        const linkInput = document.getElementById(`link-${id}`);
        const copyBtn = document.getElementById(`copybtn-${id}`);
        const icon = copyBtn.querySelector('i');
        
        linkInput.select();
        document.execCommand('copy');
        
        icon.className = 'fa-solid fa-check text-xs';
        copyBtn.classList.replace('bg-gray-900', 'bg-green-600');
        
        setTimeout(() => { 
            icon.className = 'fa-regular fa-copy text-xs'; 
            copyBtn.classList.replace('bg-green-600', 'bg-gray-900');
        }, 2000);
    };

    window.downloadHistoryQr = function(id, name) {
        const qrContainer = document.getElementById(`qr-${id}`);
        const qrCanvas = qrContainer.querySelector('canvas');
        const defaultName = name ? name.replace(/\.[^/.]+$/, "") : 'Gofile_QR';
        
        if (qrCanvas) {
            const dataURL = qrCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `QR_${defaultName}.png`;
            link.click();
        } else {
            const qrImg = qrContainer.querySelector('img');
            if (qrImg && qrImg.src) {
                const link = document.createElement('a');
                link.href = qrImg.src;
                link.download = `QR_${defaultName}.png`;
                link.click();
            }
        }
    };
    
    window.deleteHistoryItem = function(e, id) {
        e.stopPropagation();
        if (confirm('คุณต้องการลบประวัตินี้ใช่หรือไม่?')) {
            let history = JSON.parse(localStorage.getItem('gofile_history') || '[]');
            history = history.filter(item => item.id !== id);
            localStorage.setItem('gofile_history', JSON.stringify(history));
            loadHistory();
            
            if (searchHistoryInput.value) {
                searchHistoryInput.dispatchEvent(new Event('input'));
            }
        }
    };

    searchHistoryInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = historyList.querySelectorAll('.history-item');
        let visibleCount = 0;
        
        items.forEach(item => {
            const name = item.querySelector('.history-item-name').innerText.toLowerCase();
            if (name.includes(searchTerm)) {
                item.style.display = 'block';
                visibleCount++;
            } else {
                item.style.display = 'none';
                const cb = item.querySelector('.history-checkbox');
                if (cb) cb.checked = false;
            }
        });

        if (visibleCount === 0 && items.length > 0) {
            noSearchResults.classList.remove('hidden');
            noSearchResults.classList.add('flex');
        } else {
            noSearchResults.classList.add('hidden');
            noSearchResults.classList.remove('flex');
        }
        
        selectAllCheckbox.checked = false;
        window.updateSelection();
    });

    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.history-checkbox');
        checkboxes.forEach(cb => {
            const item = cb.closest('.history-item');
            if (item.style.display !== 'none') {
                cb.checked = e.target.checked;
            }
        });
        window.updateSelection();
    });

    window.updateSelection = function() {
        const checkedBoxes = document.querySelectorAll('.history-checkbox:checked');
        const count = checkedBoxes.length;
        if (count > 0) {
            clearAllHistoryBtn.innerHTML = `<i class="fa-solid fa-trash-can mr-1.5"></i> ลบที่เลือก (${count})`;
            clearAllHistoryBtn.classList.add('bg-red-50', 'border-red-100');
            clearAllHistoryBtn.dataset.mode = 'selected';
        } else {
            clearAllHistoryBtn.innerHTML = `<i class="fa-solid fa-trash-can mr-1.5"></i> ลบทั้งหมด`;
            clearAllHistoryBtn.classList.remove('bg-red-50', 'border-red-100');
            clearAllHistoryBtn.dataset.mode = 'all';
            selectAllCheckbox.checked = false;
        }
    };

    clearAllHistoryBtn.addEventListener('click', () => {
        const mode = clearAllHistoryBtn.dataset.mode || 'all';
        if (mode === 'selected') {
            const checkedBoxes = document.querySelectorAll('.history-checkbox:checked');
            const idsToDelete = Array.from(checkedBoxes).map(cb => cb.value);
            if (confirm(`คุณต้องการลบประวัติที่เลือกจำนวน ${idsToDelete.length} รายการใช่หรือไม่?`)) {
                let history = JSON.parse(localStorage.getItem('gofile_history') || '[]');
                history = history.filter(item => !idsToDelete.includes(item.id));
                localStorage.setItem('gofile_history', JSON.stringify(history));
                loadHistory();
                if (searchHistoryInput.value) searchHistoryInput.dispatchEvent(new Event('input'));
            }
        } else {
            if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการอัปโหลด "ทั้งหมด"? ข้อมูลนี้ไม่สามารถกู้คืนได้')) {
                localStorage.removeItem('gofile_history');
                loadHistory();
                searchHistoryInput.value = '';
                noSearchResults.classList.add('hidden');
                noSearchResults.classList.remove('flex');
            }
        }
    });

    openHistoryBtn.addEventListener('click', () => {
        loadHistory();
        historyModal.classList.remove('opacity-0', 'pointer-events-none');
        historyModalContent.classList.remove('scale-95');
        historyModalContent.classList.add('scale-100');
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyModal.classList.add('opacity-0', 'pointer-events-none');
        historyModalContent.classList.remove('scale-100');
        historyModalContent.classList.add('scale-95');
        setTimeout(() => {
            document.querySelectorAll('.history-item.expanded').forEach(el => el.classList.remove('expanded'));
        }, 300);
    });

    // ───── Upload Functions ──────────────────────────────────────
    async function uploadToGofile(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadRes = await fetch('/upload/gofile', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const uploadData = await uploadRes.json();
            if (uploadData.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return uploadData.url;
            }
            throw new Error(uploadData.error || "Gofile API error");
        } catch (error) {
            throw new Error(`Gofile: ${error.message}`);
        }
    }

    async function uploadToCatbox(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/upload/catbox', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const data = await res.json();
            
            if (data.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return data.url;
            }
            throw new Error(data.error || "Catbox error");
        } catch (error) {
            throw new Error(`Catbox: ${error.message}`);
        }
    }

    async function uploadToLitterbox(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/upload/litterbox', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const data = await res.json();
            
            if (data.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return data.url;
            }
            throw new Error(data.error || "Litterbox error");
        } catch (error) {
            throw new Error(`Litterbox: ${error.message}`);
        }
    }

    async function uploadToTmpfiles(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/upload/tmpfiles', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const data = await res.json();
            
            if (data.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return data.url;
            }
            throw new Error(data.error || "Tmpfiles error");
        } catch (error) {
            throw new Error(`Tmpfiles: ${error.message}`);
        }
    }

    async function uploadToUguu(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/upload/uguu', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const data = await res.json();
            
            if (data.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return data.url;
            }
            throw new Error(data.error || "Uguu error");
        } catch (error) {
            throw new Error(`Uguu: ${error.message}`);
        }
    }

    async function uploadToFileio(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/upload/fileio', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const data = await res.json();
            
            if (data.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return data.url;
            }
            throw new Error(data.error || "File.io error");
        } catch (error) {
            throw new Error(`File.io: ${error.message}`);
        }
    }

    async function uploadToPomf(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/upload/pomf', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const data = await res.json();
            
            if (data.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return data.url;
            }
            throw new Error(data.error || "Pomf error");
        } catch (error) {
            throw new Error(`Pomf: ${error.message}`);
        }
    }

    async function uploadTo0x0(file) {
        try {
            progressPercent.textContent = '30%';
            progressBar.style.width = '30%';
            
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/upload/0x0', {
                method: 'POST',
                body: formData,
                signal: uploadAbortController?.signal
            });
            
            progressPercent.textContent = '80%';
            progressBar.style.width = '80%';
            
            const data = await res.json();
            
            if (data.success) {
                progressBar.style.width = '100%';
                progressPercent.textContent = '100%';
                return data.url;
            }
            throw new Error(data.error || "0x0 error");
        } catch (error) {
            throw new Error(`0x0.st: ${error.message}`);
        }
    }

    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            closeHistoryBtn.click();
        }
    });

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
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
        
        uploadAbortController = new AbortController();
        
        try {
            let finalLink = null;
            
            switch(selectedProvider) {
                case 'gofile':
                    finalLink = await uploadToGofile(selectedFile);
                    break;
                case 'catbox':
                    finalLink = await uploadToCatbox(selectedFile);
                    break;
                case 'litterbox':
                    finalLink = await uploadToLitterbox(selectedFile);
                    break;
                case 'tmpfiles':
                    finalLink = await uploadToTmpfiles(selectedFile);
                    break;
                case 'uguu':
                    finalLink = await uploadToUguu(selectedFile);
                    break;
                case 'fileio':
                    finalLink = await uploadToFileio(selectedFile);
                    break;
                case 'pomf':
                    finalLink = await uploadToPomf(selectedFile);
                    break;
                case '0x0':
                    finalLink = await uploadTo0x0(selectedFile);
                    break;
            }

            if (finalLink) {
                showSuccess(finalLink);
                saveToHistory(selectedFile.name, formatBytes(selectedFile.size), finalLink);
            } else {
                handleError("การอัปโหลดล้มเหลว กรุณาลองใหม่");
            }
        } catch (error) { 
            if (error.name === 'AbortError') {
                handleError("ยกเลิกการอัปโหลด");
            } else {
                handleError(error.message); 
            }
        } finally {
            uploadAbortController = null;
        }

    cancelUploadBtn.addEventListener('click', () => {
        if (uploadAbortController) {
            uploadAbortController.abort();
            uploadAbortController = null;
        }
        progressArea.classList.add('hidden');
        uploadBtn.classList.remove('hidden');
        fileInfo.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
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
        fileInfo.classList.remove('hidden');
        progressArea.classList.add('hidden');
        progressBar.style.width = '0%';
        progressPercent.textContent = '0%';
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

    downloadQrBtn.addEventListener('click', () => {
        const qrCanvas = qrcodeContainer.querySelector('canvas');
        const defaultName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : 'Gofile_QR';
        
        if (qrCanvas) {
            const dataURL = qrCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `QR_${defaultName}.png`;
            link.click();
        } else {
            const qrImg = qrcodeContainer.querySelector('img');
            if (qrImg && qrImg.src) {
                const link = document.createElement('a');
                link.href = qrImg.src;
                link.download = `QR_${defaultName}.png`;
                link.click();
            }
        }
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
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            const ripple2 = document.createElement('div');
            ripple2.className = 'click-ripple';
            ripple2.style.left = e.clientX + 'px';
            ripple2.style.top = e.clientY + 'px';
            ripple2.style.animationDuration = '0.8s';
            ripple2.style.borderColor = 'rgba(168, 85, 247, 0.6)';
            document.body.appendChild(ripple2);
            setTimeout(() => ripple2.remove(), 800);
        }, 120);

        setTimeout(() => ripple.remove(), 600);
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
