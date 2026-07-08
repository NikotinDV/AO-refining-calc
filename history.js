// ==========================================
// ФАЙЛ: history.js (Сохранение снимков и рендер истории)
// ==========================================

function addToHistory() {
    const note = document.getElementById('tab-note').value || "Общая ветка";
    const savedHistory = localStorage.getItem('albion_calc_permanent_history');
    let historyArray = savedHistory ? JSON.parse(savedHistory) : [];

    const currentSessionData = sessionStorage.getItem('albion_session_data');
    if (!currentSessionData) return; 
    
    const snapshotId = 'snap_' + Date.now(); 
    
    const historyEntry = {
        id: snapshotId,
        date: new Date().toLocaleDateString('ru-RU', {hour: '2-digit', minute:'2-digit'}),
        note: note,
        snapshot: JSON.parse(currentSessionData) 
    };

    historyArray.unshift(historyEntry);
    localStorage.setItem('albion_calc_permanent_history', JSON.stringify(historyArray));
    renderHistory();
}

function renderHistory() {
    const savedHistory = localStorage.getItem('albion_calc_permanent_history');
    const historyLog = document.getElementById('history-log');
    if (!historyLog) return;

    if (!savedHistory) {
        historyLog.innerHTML = '<div style="color:#555; padding: 10px; text-align:center;">История пуста</div>';
        return;
    }

    const historyArray = JSON.parse(savedHistory);
    historyLog.innerHTML = ''; 

    historyArray.forEach(entry => {
        const row = document.createElement('div');
        row.className = 'history-row-link';
        row.innerHTML = `
            <span class="hist-time">${entry.date}</span>
            <span class="hist-note-link" title="Открыть этот расчет">${entry.note}</span>
            <div class="hist-actions">
                <button class="open-snap-btn" onclick="openSnapshot('${entry.id}')">📂 Открыть</button>
                <button class="delete-hist-btn" onclick="deleteHistoryItem('${entry.id}')">✕</button>
            </div>
        `;
        historyLog.appendChild(row);
    });
}

function deleteHistoryItem(id) {
    const savedHistory = localStorage.getItem('albion_calc_permanent_history');
    if (!savedHistory) return;
    let historyArray = JSON.parse(savedHistory);
    historyArray = historyArray.filter(item => item.id !== id);
    
    if (historyArray.length === 0) {
        localStorage.removeItem('albion_calc_permanent_history');
    } else {
        localStorage.setItem('albion_calc_permanent_history', JSON.stringify(historyArray));
    }
    renderHistory();
}

function openSnapshot(snapshotId) {
    const url = new URL(window.location.href);
    url.searchParams.set('snapshot', snapshotId);
    window.open(url.toString(), '_blank');
}