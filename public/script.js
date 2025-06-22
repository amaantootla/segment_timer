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
            renderTimersList();
        };
    }

    function renderTimersList() {
        if (timers.length === 0) {
            timersListDiv.innerHTML = '<div style="text-align:center;color:#888;">No timers added.</div>';
        } else {
            timersListDiv.innerHTML = timers.map((t, i) => `
                <div class="timer-row${running && i === currentTimerIndex ? ' active' : ''}">
                    <span class="timer-label">${t.name ? t.name : '<i>Unnamed</i>'}</span>
                    <span class="timer-duration">${t.duration}s</span>
                    <button class="timer-delete" data-index="${i}" title="Delete"${running ? ' disabled' : ''}>&#128465;</button>
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
});
