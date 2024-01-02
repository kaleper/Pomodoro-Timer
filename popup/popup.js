// Link 'Start' button to html element
document.getElementById("startTimerButton").addEventListener('click', function () {
    chrome.runtime.sendMessage({ command: 'start' });
});

// Link 'Pause' button to html element
document.getElementById("pauseTimerButton").addEventListener('click', function () {
    chrome.runtime.sendMessage({ command: 'pause' });
});

// Link 'Reset' button to html element
document.getElementById("resetTimerButton").addEventListener('click', function () {
    chrome.runtime.sendMessage({ command: 'reset' });
});

//Link 'Break Time!' button to html element
document.getElementById('breakTimerButton').addEventListener('click', function () {
    chrome.runtime.sendMessage({ command: 'break' });
});

//Link 'Sound' checkbox to html element
document.getElementById('soundCheckbox').addEventListener('click', function () {
    console.log("Sent message from popup.js: before");
    chrome.runtime.sendMessage({ command: 'updateStorage', data: 'toggleSoundNotification' });
    console.log("Sent message from popup.js: after");
});

document.addEventListener('DOMContentLoaded', updatePopup);

// Updates timer - formats remaining time to be displayed 
function updateDisplay() {
    chrome.runtime.sendMessage({ command: 'getRemainingTime' }, function (response) {
        console.log(response.remainingTime);
        if (response && response.remainingTime) {
            const timerCircle = document.querySelector('.timer').querySelector('svg > circle + circle');
            document.querySelector('.timer').classList.add('animatable');
            timerCircle.style.strokeDashoffset = 1;
            const normalizedTime = (response.totalTime - response.remainingTime) / response.totalTime;
            timerCircle.style.strokeDashoffset = normalizedTime;
            const minutes = Math.floor(response.remainingTime / 60);
            const seconds = response.remainingTime % 60;
            document.getElementById('timeLeft').innerHTML = `${padZero(minutes)}:${padZero(seconds)}`;
        }
    });

}

// Pads with zero when timer <10 minutes
function padZero(num) {
    return num < 10 ? `0${num}` : num;
}

setInterval(updateDisplay, 1000);

// Updates the sound checkbox if user toggles in main
function updatePopup() {
    chrome.storage.sync.get(['soundNotification'], function (data) {
        document.getElementById("soundCheckbox").checked = data.soundNotification;
    });
}


// Opens tab to extension's page
document.getElementById("openMain").addEventListener('click', function () {
    chrome.tabs.create({
        url: "main/main.html"
    });
})
