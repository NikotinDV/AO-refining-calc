const tierConfig = {
    't4': { rawRatio: 2 },
    't5': { rawRatio: 3, prev: 't4' },
    't6': { rawRatio: 4, prev: 't5' },
    't7': { rawRatio: 5, prev: 't6' },
    't8': { rawRatio: 5, prev: 't7' }
};



function updateCalc() {
    Object.keys(tierConfig).forEach(tierId => {

        const col = document.getElementById(tierId);
        if (!col) return; // Проверка, если вдруг какой-то тир не добавлен в HTML

        const config = tierConfig[tierId];
        
        // Элементы управления возвратом
        const rrrInput = col.querySelector('.rrr');
        const focusCheck = col.querySelector('.useFocus');

        const resetBtn = col.querySelector('.reset-btn');
        if (resetBtn && !resetBtn.dataset.initialized) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Чтобы клик не триггерил другие события
        
        // Сбрасываем текстовые поля в дефолтные нули (или твои стартовые значения)
                col.querySelector('.target').value = 0;
                col.querySelector('.rawPrice').value = 0;
                col.querySelector('.matPrice').value = 0;
                col.querySelector('.rrr').value = 36.7;
                const sellPriceInput = col.querySelector('.sellPrice');
                if (sellPriceInput) sellPriceInput.value = 0;

        // Снимаем чекбоксы
            const focusCheck = col.querySelector('.useFocus');
            if (focusCheck) focusCheck.checked = false;
        
            const usePrevCheck = col.querySelector('.usePrev');
            if (usePrevCheck) usePrevCheck.checked = false;

        // Разблокируем поле материала, если оно было заморожено связью тиров
            col.querySelector('.matPrice').disabled = false;
            col.querySelector('.matPrice').classList.remove('linked-value');

        // Пересчитываем и сохраняем обновленное состояние
        updateCalc();
                });
        resetBtn.dataset.initialized = "true";
        }

        // 1. Логика Фокуса (установка слушателя, если еще не установлен)
        if (focusCheck && !focusCheck.dataset.initialized) {
            focusCheck.addEventListener('change', () => {
                rrrInput.value = focusCheck.checked ? 53.9 : 36.7;
                updateCalc(); 
            });
            focusCheck.dataset.initialized = "true"; // Чтобы не вешать событие дважды
        }

        const rrr = parseFloat(rrrInput.value) || 0;
        const target = parseFloat(col.querySelector('.target').value) || 0;
        const rawPrice = parseFloat(col.querySelector('.rawPrice').value) || 0;
        
        let matPriceInput = col.querySelector('.matPrice');
        let matPrice = parseFloat(matPriceInput.value) || 0;
        const usePrevCheck = col.querySelector('.usePrev');

        // 2. Логика использования себестоимости предыдущего тира
        if (usePrevCheck && usePrevCheck.checked && config.prev) {
            const prevCol = document.getElementById(config.prev);
            // Забираем число из текстового поля предыдущей колонки
            const prevCostText = prevCol.querySelector('.costPerUnit').innerText.replace(/\s/g, '');
            matPrice = parseFloat(prevCostText) || 0;
            
            matPriceInput.disabled = true;
            matPriceInput.value = matPrice;
            matPriceInput.classList.add('linked-value');
        } else {
            matPriceInput.disabled = false;
            matPriceInput.classList.remove('linked-value');
        }


        // --- ЛОГИКА НАЛОГА СТАНКА ---
        // const baseTaxInput = document.querySelector('.craftTaxBase');
        // const baseTax = baseTaxInput ? parseFloat(baseTaxInput.value) || 800 : 800;

        // const tierNum = tierId.replace('t', ''); // 't4' -> '4'
        // const enchant = parseFloat(col.querySelector('.enchant').value || 0);

        // const taxPerItem = calculateTax(baseTax, tierNum, enchant);

        // const totalTax = taxPerItem * target;
        // const taxDisplayElem = col.querySelector('.taxDisplay');
        // if (taxDisplayElem) taxDisplayElem.innerText = totalTax.toLocaleString()


        // 3. Формулы расчета (твои из Excel)
        const rawQty = Math.ceil(target * config.rawRatio * (1 - (rrr / 100)));
        const matQty = Math.ceil(target * 1 * (1 - (rrr / 100)));

        const rawTotal = rawQty * rawPrice;
        const matTotal = matQty * matPrice;
        const finalSum = rawTotal + matTotal;
        const costPerUnit = target > 0 ? Math.round(finalSum / target) : 0;

        // 4. Вывод результатов
        col.querySelector('.rawQty').innerText = rawQty.toLocaleString();
        col.querySelector('.rawTotal').innerText = rawTotal.toLocaleString();
        col.querySelector('.matQty').innerText = matQty.toLocaleString();
        col.querySelector('.matTotal').innerText = matTotal.toLocaleString();
        col.querySelector('.finalSum').innerText = finalSum.toLocaleString();
        col.querySelector('.costPerUnit').innerText = costPerUnit.toLocaleString();

        const sellPrice = parseFloat(col.querySelector('.sellPrice').value) || 0;
        const profitAbs = sellPrice - costPerUnit;
        let profitPerc = 0;
        
        if (sellPrice > 0) {
            profitPerc = (profitAbs / sellPrice) * 100;
        }

        const profitAbsElem = col.querySelector('.profitAbs');
        const profitPercElem = col.querySelector('.profitPerc');

        profitAbsElem.innerText = profitAbs.toLocaleString();
        profitPercElem.innerText = profitPerc.toFixed(2) + '%';

        if (profitAbs > 0) {
            profitPercElem.style.color = "#4caf50"; // Зеленый
        } else if (profitAbs < 0) {
            profitPercElem.style.color = "#ff5252"; // Красный
        } else {
        profitPercElem.style.color = "#888";    // Серый
        }
    });

    saveToStorage();
}

// ------------------------------------------
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ------------------------------------------

// 1. Проверяем URL (функция из storage.js)
applySnapshotFromUrl();

// 2. Загружаем данные сессии (функция из storage.js)
loadFromStorage();

// 3. Вешаем слушатели событий
document.addEventListener('input', (e) => {
    // Особая логика для RRR остается
    if (e.target.classList.contains('rrr')) {
        const col = e.target.closest('.tier-column');
        const focusCheck = col.querySelector('.useFocus');
        if (focusCheck) focusCheck.checked = false;
    }
    
    // ПЕРЕСЧИТЫВАЕМ ВСЕГДА, если произошло любое изменение input
    updateCalc();
});

document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        updateCalc();
    }
});

const noteInput = document.getElementById('tab-note');
if (noteInput) {
    noteInput.addEventListener('input', () => {
        const val = noteInput.value;
        document.title = val ? val : 'Albion Calc - Табличный вид';
        saveToStorage();
    });
}

const histBtn = document.getElementById('add-to-history');
if (histBtn) {
    histBtn.addEventListener('click', addToHistory); // функция из history.js
}

// Автоматическое выделение текста при фокусе на числовом поле
document.addEventListener('focusin', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
        e.target.select();
    }
});

// 4. Первичная отрисовка экрана
updateCalc();
renderHistory(); // функция из history.js