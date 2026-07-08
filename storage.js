// ==========================================
// ФАЙЛ: storage.js (Работа с текущей сессией и URL)
// ==========================================

function saveToStorage() {
    const data = {};
    
    document.querySelectorAll('.tier-column input[type="number"]').forEach(input => {
        const tierId = input.closest('.tier-column').id;
        data[`${tierId}_${input.className}`] = input.value;
    });

    document.querySelectorAll('.tier-column input[type="checkbox"]').forEach(check => {
        const tierId = check.closest('.tier-column').id;
        data[`${tierId}_${check.className}`] = check.checked;
    });

    data['global_tab_note'] = document.getElementById('tab-note').value;
    sessionStorage.setItem('albion_session_data', JSON.stringify(data));
}

function loadFromStorage() {
    const saved = sessionStorage.getItem('albion_session_data');
    if (!saved) return;

    const data = JSON.parse(saved);

    Object.keys(data).forEach(key => {
        const [tierId, className] = key.split('_');
        const col = document.getElementById(tierId);
        
        if (col) {
            const element = col.querySelector('.' + className);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        }
    });
    
    const savedNote = data['global_tab_note'] || '';
    const noteInput = document.getElementById('tab-note');
    if (noteInput) {
        noteInput.value = savedNote;
        document.title = savedNote ? savedNote : 'Albion Calc - Табличный вид';
    }
}

// Вынесли проверку URL в отдельную функцию для чистоты
function applySnapshotFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const snapshotId = urlParams.get('snapshot');

    if (snapshotId) {
        const savedHistory = localStorage.getItem('albion_calc_permanent_history');
        if (savedHistory) {
            const historyArray = JSON.parse(savedHistory);
            const targetEntry = historyArray.find(item => item.id === snapshotId);
            
            if (targetEntry && targetEntry.snapshot) {
                sessionStorage.setItem('albion_session_data', JSON.stringify(targetEntry.snapshot));
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }
}