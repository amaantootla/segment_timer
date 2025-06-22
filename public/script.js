document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('time-input');
    const startBtn = document.getElementById('start-btn');
    const timeLeft = document.getElementById('time-left');
    const timerProgress = document.querySelector('.timer-progress');
    const circumference = 2 * Math.PI * 45; // 45 is the radius of our circle

    let countdownInterval;
    timerProgress.style.strokeDasharray = circumference;
    timerProgress.style.strokeDashoffset = circumference;

    function updateProgress(timeRemaining, totalTime) {
        const progress = timeRemaining / totalTime;
        const offset = circumference * (1 - progress);
        timerProgress.style.strokeDashoffset = offset;
    }

    function startTimer(duration) {
        let timeRemaining = duration;
        timeLeft.textContent = timeRemaining;

        clearInterval(countdownInterval);
        updateProgress(timeRemaining, duration);

        countdownInterval = setInterval(() => {
            timeRemaining--;
            timeLeft.textContent = timeRemaining;
            updateProgress(timeRemaining, duration);

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                startBtn.disabled = false;
                timeInput.disabled = false;
            }
        }, 1000);
    }

    startBtn.addEventListener('click', () => {
        const duration = parseInt(timeInput.value);
        if (duration > 0) {
            startBtn.disabled = true;
            timeInput.disabled = true;
            startTimer(duration);
        }
    });
});
