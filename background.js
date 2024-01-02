// background.js runs in chrome background. popup.js sends messages. popup.js sends messages to background.js to communicate.

//Tracks remaining timer time 
let remainingTime = 5;
// Time in milliseconds to decrement timer by
let timerInterval;

let defaultTime = 5;

// Flag for timer running and paused
let isTimerRunning = false;

// Handles messages, invokes function based on message. Checks whether 'start' and 'pause' flags are set to prevent unexpected results.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.command === 'start' && !isTimerRunning) {
      startTimer();
      sendResponse({ status: "Timer started" });
  } else if (request.command === 'pause') {
      pauseTimer();
      sendResponse({ status: "Timer paused" });
  } else if (request.command === 'reset') {
      resetTimer();
      sendResponse({ status: "Timer reset" });
  }
  // Sends remaining time to popup.js
  else if (request.command === 'getRemainingTime') {
      sendResponse({ remainingTime: remainingTime });
  }
  // Add a catch-all response for unhandled commands
  else {
      sendResponse({ status: "Command not recognized" });
  }
  return true; // Keep the message channel open for async response
});

// Starts timer countdown
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        remainingTime = remainingTime || defaultTime; // or your default time
        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                showNotification('Time is up!');
                remainingTime = defaultTime; // Reset to default or a defined work/break period
            }
        }, 1000);
    }
}

// Stops and clears the remaining time
function resetTimer() {
  clearInterval(timerInterval);
  remainingTime = defaultTime; // Reset to default time
  isTimerRunning = false;
}

// Pauses timer 
function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
  }

function showNotification(message) {
  chrome.notifications.create('', {
      title: 'Pomodoro Timer',
      message: message,
      type: 'basic',
      iconUrl: './images/light-bulb.png'
  });
}