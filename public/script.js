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

    function updateProgress(timeRemaining, totalTime) {
        const progress = timeRemaining / totalTime;
        const offset = circumference * (1 - progress);
        timerProgress.style.strokeDashoffset = offset;
    }

    function showResults() {
        let html = '<h3>Results</h3><ul>';
        results.forEach((r, i) => {
            html += `<li>${r.name ? r.name + ': ' : ''}${r.timer}s - ${r.underovertime > 0 ? 'Overtime' : 'Undertime'}: ${Math.abs(r.underovertime)}s</li>`;
        });
        html += '</ul>';
        resultsDiv.innerHTML = html;
    }

    function renderTimersList() {
        if (timers.length === 0) {
            timersListDiv.textContent = 'No timers added.';
        } else {
            timersListDiv.innerHTML = 'Timers: ' + timers.map((t, i) => `<span>${t.name ? t.name + ' (' + t.duration + 's)' : t.duration + 's'}</span>`).join(', ');
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
        if (currentTimerIndex >= timers.length) {
            timeLeft.textContent = '0';
            doneBtn.style.display = 'none';
            running = false;
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
            timeRemaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
            timeLeft.textContent = timeRemaining;
            updateProgress(timeRemaining, timerDuration);
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
            }
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

    startBtn.addEventListener('click', () => {
        if (!running) {
            if (timers.length > 0) {
                currentTimerIndex = 0;
                results = [];
                running = true;
                startBtn.textContent = 'STOP';
                startBtn.classList.add('stop-btn');
                addTimerBtn.disabled = true;
                timerValue.disabled = true;
                // Disable unit toggle buttons
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
            startBtn.textContent = 'Start';
            startBtn.classList.remove('stop-btn');
            startBtn.disabled = false;
            addTimerBtn.disabled = false;
            timerValue.disabled = false;
            // Enable unit toggle buttons
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
});
