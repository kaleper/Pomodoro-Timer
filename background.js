// background.js runs in chrome background. popup.js sends messages. popup.js sends messages to background.js to communicate.

//Tracks remaining timer time 
let remainingTime;
// Time in milliseconds to decrement timer by
let timerInterval;

// Flags for 'Start' and 'Pause' buttons
let started = false;
let paused = false;

// 40 Minutes - ** Change this to 3 seconds for testing**
let defaultTime = 2400;

// Handles messages, invokes function based on message. Checks whether 'start' and 'pause' flags are set to prevent unexpected results.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === 'start') {
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
  } else if (request.command === 'getRemainingTime') {
    sendResponse({ remainingTime });
  }
});

// Starts timer countdown
function startTimer() {
  // Set to default time to initialize
  if (remainingTime === undefined){
    remainingTime = defaultTime;
  } 
  sendRemainingTime();
  timerInterval = setInterval(function () {
    if (remainingTime <= 0){
        clearInterval(timerInterval);
    }else{
        remainingTime--;
        sendRemainingTime();
    }
  }, 1000);

}

// Stops and clears the remaining time
function resetTimer() {
  started = false;
  paused = false;
  remainingTime = defaultTime;
}

// Pauses timer 
function pauseTimer() {
    clearInterval(timerInterval);
    sendRemainingTime();
  }

  // Set the remaining time left
function sendRemainingTime() {
  chrome.runtime.sendMessage({ command: 'updateTimer', remainingTime });
}