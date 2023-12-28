// Variables 
let timeLeft = document.getElementById("time");
let musicToggle = document.getElementById("toggle");
let newTab = document.getElementById("openMain");
let workTime = true;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let time = workDuration;
let timerInterval;

// Listeners for Buttons
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "start") {
        startTimer();
    } else if (request.command === "stop") {
        endOfTimer();
    }
});

// Link start button to function
document.getElementById("startTimerButton").addEventListener('click', function() {
    startTimer();
})
document.getElementById("pauseTimerButton").addEventListener('click', function() {
    pauseTimer();
})

document.getElementById("stopTimerButton").addEventListener('click', function() {
    stopTimer();
})


// Functions 
// Start the timer count down
function startTimer() {
    chrome.runtime.sendMessage({command:'start'});
    updateTimer();
    timerInterval  = setInterval(updateTimer,1000);
}

function pauseTimer() {
    chrome.runtime.sendMessage({command:'start'});
    clearInterval(timerInterval);
    updateTimer();
}

//End the timer count down
function stopTimer() {
    chrome.runtime.sendMessage({command:'stop'});
    clearInterval(timerInterval);
    updateTimer();
}

// Update the timer
// basically get the remaining time and format it into the text to display + update the time to see 
function updateTimer(){
    chrome.runtime.sendMessage({command:'getRemainingTime'},(response) =>{
        if (response && response.remainingTime){
            const minutes = Math.floor(response.remainingTime /60);
            const seconds = response.remainingTime % 60;
            document.getElementById('time').textContent=`${padZero(minutes)}:${padZero(seconds)}`; 
        }
        else{
            document.getElementById('time').textContent=`00:00`;
        }
    })
}

// Used for formatting time
function padZero(num){
    return num < 10 ?`0${num}` : num;
}


//Opening Tab
document.getElementById("openMain").addEventListener('click', function() {
    chrome.tabs.create({
        url: "main.html"
      });
})


