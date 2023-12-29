// Time in milliseconds to decrement timer by
let timerInterval;

// Flags for 'Start' and 'Pause' buttons
let started = false;
let paused = false;

// 40 Minutes - ** Change this to 3 seconds for testing **
let defaultTime = 2400;

// Listeners for Buttons. Checks whether 'start' and 'pause' flags are set to prevent unexpected results.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "start") {
        if (started === false) {
            startTimer();
            started = true;
            paused = false;
        }
    } else if(request.command == 'pause'){
        if (paused === false) {
            pauseTimer();
            paused = true;
            started = false;
          }
      }else if (request.command === 'reset') {
        resetTimer();
      }
});

// Link 'Start' button to html element
document.getElementById("startTimerButton").addEventListener('click', function() {
    startTimer();
})

// Link 'Start' button to html element
document.getElementById("pauseTimerButton").addEventListener('click', function() {
    pauseTimer();
})

// Link 'Reset' button to html element
document.getElementById("resetTimerButton").addEventListener('click', function() {
    resetTimer();
})


// Starts timer countdown
function startTimer() {
    chrome.runtime.sendMessage({command:'start'});
    updateTimer();

    // Decrements by 1 second
    timerInterval  = setInterval(updateTimer,1000);

}
// Pauses timer, preserving time 
function pauseTimer() {
    chrome.runtime.sendMessage({command:'pause'});
    clearInterval(timerInterval);
    updateTimer();
}

// Resets timer to default
function resetTimer() {
    chrome.runtime.sendMessage({command:'reset'});
    // Resets 'Start' and 'Pause' button flags 
    started = false;
    paused = false;

    // Resets remaining time 
    remainingTime = defaultTime;
    updateTimer();
    pauseTimer();
}

// Updates timer - formats remaining time to be displayed 
function updateTimer(){
    chrome.runtime.sendMessage({command:'getRemainingTime'},(response) =>{
        if (response && response.remainingTime){
            const minutes = Math.floor(response.remainingTime /60);
            const seconds = response.remainingTime % 60;
            document.getElementById('time').textContent=`${padZero(minutes)}:${padZero(seconds)}`; 
        }
        // If timer has reached zero, displays zero.
        else{
            document.getElementById('time').textContent=`00:00`;
        }
    })
}

// Pads with zero when timer <10 minutes
function padZero(num){
    return num < 10 ?`0${num}` : num;
}

// Opens tab to extenion's page
document.getElementById("openMain").addEventListener('click', function() {
    console.log("test");
    chrome.tabs.create({
        url: "main.html"
      });
})