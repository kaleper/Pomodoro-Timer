// Link 'Start' button to html element
document.getElementById("startTimerButton").addEventListener('click', function() {
    chrome.runtime.sendMessage({command: 'start'});
});

// Link 'Pause' button to html element
document.getElementById("pauseTimerButton").addEventListener('click', function() {
    chrome.runtime.sendMessage({command: 'pause'});
});

// Link 'Reset' button to html element
document.getElementById("resetTimerButton").addEventListener('click', function() {
    chrome.runtime.sendMessage({command: 'reset'});
});

// Updates timer - formats remaining time to be displayed 
function updateDisplay() {
    chrome.runtime.sendMessage({ command: 'getRemainingTime' }, function(response) {
        if (response && response.remainingTime) {
            const minutes = Math.floor(response.remainingTime / 60);
            const seconds = response.remainingTime % 60;
            document.getElementById('timerDisplay').textContent = `${padZero(minutes)}:${padZero(seconds)}`;
        }
    });
}

// Pads with zero when timer <10 minutes
function padZero(num){
    return num < 10 ?`0${num}` : num;
}

setInterval(updateDisplay, 1000);

// Opens tab to extenion's page
document.getElementById("openMain").addEventListener('click', function() {
    console.log("test");
    chrome.tabs.create({
        url: "main.html"
      });
})