document.addEventListener('DOMContentLoaded', () => {
    const timersInput = document.getElementById('timers-input');
    const startBtn = document.getElementById('start-btn');
    const doneBtn = document.getElementById('done-btn');
    const timeLeft = document.getElementById('time-left');
    const timerProgress = document.querySelector('.timer-progress');
    const resultsDiv = document.getElementById('results');
    const timerValue = document.getElementById('timer-value');
    const timerUnit = document.getElementById('timer-unit');
    const addTimerBtn = document.getElementById('add-timer-btn');
    const timersListDiv = document.getElementById('timers-list');
    const timerName = document.getElementById('timer-name');
    const circumference = 2 * Math.PI * 45;

    let timers = [];
    let currentTimerIndex = 0;
    let countdownInterval;
    let timerStartTime;
    let timerEndTime;
    let timerDuration;
    let timerDone = false;
    let results = [];
    let running = false;
    let selectedUnit = 's';
    const unitToggle = document.getElementById('unit-toggle');
    let showingResults = false;

    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = circumference;

    function updateProgress(timeRemaining, totalTime, overtime = false) {
        let progress, offset;
        if (!overtime) {
            progress = timeRemaining / totalTime;
            offset = circumference * (1 - progress);
        } else {
            // Overtime: keep going counterclockwise, offset increases
            const overtimeSeconds = -timeRemaining;
            offset = circumference * (1 + (overtimeSeconds / totalTime));
        }
        timerProgress.style.strokeDashoffset = offset;
        if (overtime) {
            timerProgress.classList.add('overtime');
        } else {
            timerProgress.classList.remove('overtime');
        }
    }

    function showResults() {
        showingResults = true;
        // Hide all controls except results
        document.querySelector('.input-row').style.display = 'none';
        document.getElementById('add-timer-btn').style.display = 'none';
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('timers-list').style.display = 'none';
        // Calculate total time including overtime/undertime
        const totalSeconds = results.reduce((sum, r) => sum + (parseInt(r.timer) || 0) + (parseInt(r.underovertime) || 0), 0);
        const min = Math.floor(Math.abs(totalSeconds) / 60);
        const sec = Math.abs(totalSeconds) % 60;
        let sign = totalSeconds < 0 ? '-' : '';
        document.getElementById('time-left').textContent = `${sign}${min > 0 ? min + 'm ' : ''}${sec}s`;
        let html = '<h3>Results</h3><div id="results-list">';
        results.forEach((r, i) => {
            html += `<div class="result-row">
                <span class="result-label">${r.name ? r.name : '<i>Unnamed</i>'}</span>
                <span class="result-duration">${r.timer}s</span>
                <span class="result-status ${r.underovertime > 0 ? 'overtime' : 'undertime'}">
                    ${r.underovertime > 0 ? '+' : ''}${r.underovertime}s
                </span>
            </div>`;
        });
        html += '</div>';
        html += '<button id="results-done-btn" class="results-done-btn">Done</button>';
        resultsDiv.innerHTML = html;
        // Add event listener for Done button
        document.getElementById('results-done-btn').onclick = () => {
            resultsDiv.innerHTML = '';
            document.getElementById('time-left').textContent = '0';
            document.querySelector('.input-row').style.display = '';
            document.getElementById('add-timer-btn').style.display = '';
            document.getElementById('start-btn').style.display = '';
            document.getElementById('timers-list').style.display = '';
            showingResults = false;
            renderTimersList();
            setManageSetsBtnVisibility();
        };
    }

    function renderTimersList() {
        if (timers.length === 0) {
            timersListDiv.innerHTML = '<div style="text-align:center;color:#888;">No timers added.</div>';
        } else {
            timersListDiv.innerHTML = timers.map((t, i) => `
                <div class="timer-row${running && i === currentTimerIndex ? ' active' : ''}" data-row="${i}">
                    <span class="timer-label">${t.name ? t.name : '<i>Unnamed</i>'}</span>
                    <span class="timer-duration">${t.duration}s</span>
                    ${!running ? `<button class="timer-delete" data-index="${i}" title="Delete">&#128465;</button>` : ''}
                </div>
            `).join('');
            if (!running) {
                timersListDiv.querySelectorAll('.timer-delete').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(btn.getAttribute('data-index'));
                        timers.splice(idx, 1);
                        renderTimersList();
                    });
                });
                // Scroll to last timer when adding
                setTimeout(() => {
                    const lastRow = timersListDiv.querySelector('.timer-row:last-child');
                    if (lastRow) lastRow.scrollIntoView({ block: 'center', behavior: 'auto' });
                }, 0);
            }
            // Auto-scroll to active timer if running
            if (running) {
                setTimeout(() => {
                    const activeRow = timersListDiv.querySelector('.timer-row.active');
                    if (activeRow) activeRow.scrollIntoView({ block: 'center', behavior: 'auto' });
                }, 0);
            }
        }
    }

    if (unitToggle) {
        unitToggle.addEventListener('click', (e) => {
            if (e.target.classList.contains('unit-btn')) {
                document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                selectedUnit = e.target.getAttribute('data-unit');
            }
        });
    }

    function startNextTimer() {
        renderTimersList(); // Always update list and highlight
        if (currentTimerIndex >= timers.length) {
            timeLeft.textContent = '0';
            doneBtn.style.display = 'none';
            running = false;
            setInputVisibility();
            startBtn.textContent = 'Start';
            startBtn.classList.remove('stop-btn');
            startBtn.disabled = false;
            addTimerBtn.disabled = false;
            timerValue.disabled = false;
            // Enable unit toggle buttons
            document.querySelectorAll('.unit-btn').forEach(btn => btn.disabled = false);
            timerName.disabled = false;
            timers = [];
            renderTimersList();
            showResults();
            return;
        }
        const timerObj = timers[currentTimerIndex];
        timerDuration = timerObj.duration;
        let timeRemaining = timerDuration;
        timeLeft.textContent = timeRemaining;
        updateProgress(timeRemaining, timerDuration);
        doneBtn.style.display = 'inline-block';
        timerDone = false;
        timerStartTime = Date.now();
        timerEndTime = timerStartTime + timerDuration * 1000;
        clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            if (timerDone) return;
            let now = Date.now();
            timeRemaining = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
            let overtime = false;
            if (now > timerEndTime) {
                overtime = true;
                timeRemaining = Math.ceil((timerEndTime - now) / 1000);
                timeLeft.textContent = Math.abs(timeRemaining);
                updateProgress(timeRemaining, timerDuration, true);
            } else {
                timeLeft.textContent = timeRemaining;
                updateProgress(timeRemaining, timerDuration, false);
            }
            renderTimersList(); // Update highlight on every tick
        }, 100);
    }

    addTimerBtn.addEventListener('click', () => {
        let value = parseInt(timerValue.value);
        let name = timerName.value.trim();
        let unit = selectedUnit;
        if (!isNaN(value) && value > 0) {
            if (unit === 'm') value = value * 60;
            timers.push({ duration: value, name });
            renderTimersList();
            timerValue.value = '';
            timerName.value = '';
            timerValue.focus();
        }
    });

    function setInputVisibility() {
        const inputRow = document.querySelector('.input-row');
        const addBtn = document.getElementById('add-timer-btn');
        if (running) {
            if (inputRow) inputRow.style.display = 'none';
            if (addBtn) addBtn.style.display = 'none';
        } else {
            if (inputRow) inputRow.style.display = '';
            if (addBtn) addBtn.style.display = '';
        }
    }

    // Hide Manage Sets button if not in edit mode
    function updateManageSetsBtnVisibility() {
        const manageSetsBtn = document.getElementById('manage-sets-btn');
        if (!manageSetsBtn) return;
        // Only show if input row, add button, and timers list are visible
        const inputRow = document.querySelector('.input-row');
        const addBtn = document.getElementById('add-timer-btn');
        const timersList = document.getElementById('timers-list');
        // If any of these are hidden, hide the button
        if (
            inputRow && inputRow.style.display !== 'none' &&
            addBtn && addBtn.style.display !== 'none' &&
            timersList && timersList.style.display !== 'none'
        ) {
            manageSetsBtn.style.display = '';
        } else {
            manageSetsBtn.style.display = 'none';
        }
    }
    // Patch all UI state changes to call this
    const origShowResults = showResults;
    showResults = function (...args) {
        const res = origShowResults.apply(this, args);
        updateManageSetsBtnVisibility();
        return res;
    };
    const origSetInputVisibility = setInputVisibility;
    setInputVisibility = function (...args) {
        const res = origSetInputVisibility.apply(this, args);
        updateManageSetsBtnVisibility();
        return res;
    };
    const origRenderTimersList = renderTimersList;
    renderTimersList = function (...args) {
        const res = origRenderTimersList.apply(this, args);
        updateManageSetsBtnVisibility();
        return res;
    };
    // Initial call
    updateManageSetsBtnVisibility();

    startBtn.addEventListener('click', () => {
        if (!running) {
            if (timers.length > 0) {
                currentTimerIndex = 0;
                results = [];
                running = true;
                setInputVisibility();
                startBtn.textContent = 'STOP';
                startBtn.classList.add('stop-btn');
                addTimerBtn.disabled = true;
                timerValue.disabled = true;
                document.querySelectorAll('.unit-btn').forEach(btn => btn.disabled = true);
                timerName.disabled = true;
                resultsDiv.innerHTML = '';
                renderTimersList();
                startNextTimer();
            }
        } else {
            // STOP pressed
            clearInterval(countdownInterval);
            timers = [];
            currentTimerIndex = 0;
            running = false;
            setInputVisibility();
            startBtn.textContent = 'Start';
            startBtn.classList.remove('stop-btn');
            startBtn.disabled = false;
            addTimerBtn.disabled = false;
            timerValue.disabled = false;
            document.querySelectorAll('.unit-btn').forEach(btn => btn.disabled = false);
            timerName.disabled = false;
            doneBtn.style.display = 'none';
            timeLeft.textContent = '0';
            resultsDiv.innerHTML = '<b>All timers stopped.</b>';
            renderTimersList();
        }
    });
    doneBtn.addEventListener('click', () => {
        if (currentTimerIndex >= timers.length) return;
        timerDone = true;
        clearInterval(countdownInterval);
        const now = Date.now();
        const scheduledEnd = timerEndTime;
        const underovertime = Math.round((now - scheduledEnd) / 1000); // + = overtime, - = undertime
        results.push({
            timer: timers[currentTimerIndex].duration,
            name: timers[currentTimerIndex].name,
            underovertime
        });
        currentTimerIndex++;
        startNextTimer();
    });
    // Call setInputVisibility on load
    setInputVisibility();
    // Modal for managing sets
    const manageSetsBtn = document.getElementById('manage-sets-btn');
    const setsModal = document.getElementById('sets-modal');
    const closeSetsModal = document.getElementById('close-sets-modal');
    const modalSetName = document.getElementById('modal-set-name');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalSavedSets = document.getElementById('modal-saved-sets');
    function getSavedSets() {
        return JSON.parse(localStorage.getItem('savedTimerSets') || '{}');
    }
    function setSavedSets(obj) {
        localStorage.setItem('savedTimerSets', JSON.stringify(obj));
    }
    function renderModalSavedSets() {
        const sets = getSavedSets();
        if (Object.keys(sets).length === 0) {
            modalSavedSets.innerHTML = '<div style="color:#888;text-align:center;">No saved sets</div>';
        } else {
            modalSavedSets.innerHTML = Object.keys(sets).map(name =>
                `<div class="set-row">
                    <span class="set-label">${name}</span>
                    <span class="set-actions">
                        <button data-action="load" data-set="${encodeURIComponent(name)}">Load</button>
                        <button data-action="delete" data-set="${encodeURIComponent(name)}">Delete</button>
                    </span>
                </div>`
            ).join('');
            modalSavedSets.querySelectorAll('button[data-action="load"]').forEach(btn => {
                btn.onclick = () => {
                    const sets = getSavedSets();
                    const name = decodeURIComponent(btn.getAttribute('data-set'));
                    if (sets[name]) {
                        timers = sets[name];
                        renderTimersList();
                        setsModal.style.display = 'none';
                    }
                };
            });
            modalSavedSets.querySelectorAll('button[data-action="delete"]').forEach(btn => {
                btn.onclick = () => {
                    const sets = getSavedSets();
                    const name = decodeURIComponent(btn.getAttribute('data-set'));
                    if (sets[name]) {
                        delete sets[name];
                        setSavedSets(sets);
                        renderModalSavedSets();
                    }
                };
            });
        }
    }
    if (manageSetsBtn) {
        manageSetsBtn.onclick = () => {
            console.log('Manage Sets button clicked'); // DEBUG
            setsModal.style.display = 'flex';
            renderModalSavedSets();
        };
    }
    if (closeSetsModal) {
        closeSetsModal.onclick = () => {
            setsModal.style.display = 'none';
        };
    }
    if (modalSaveBtn) {
        modalSaveBtn.onclick = () => {
            const name = (modalSetName && modalSetName.value.trim()) || 'Untitled';
            if (timers.length > 0 && name) {
                const sets = getSavedSets();
                sets[name] = timers;
                setSavedSets(sets);
                renderModalSavedSets();
                modalSaveBtn.textContent = 'Saved!';
                setTimeout(() => { modalSaveBtn.textContent = 'Save Current'; }, 1200);
            }
        };
    }
    renderModalSavedSets();
});
