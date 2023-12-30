// background.js runs in chrome background. popup.js sends messages. popup.js sends messages to background.js to communicate.

// Tracks remaining timer time 
let remainingTime = 5

let defaultTime = 5;

let breakTime = 7;

// Time in milliseconds to decrement timer by
let timerInterval;

let soundNotification = true;

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
  } else if (request.command === 'break') {
      breakTimer();
      sendResponse({ status: "Break timer started" });
  }
  // Sends remaining time to popup.js
  else if (request.command === 'getRemainingTime') {
      sendResponse({ remainingTime: remainingTime });
  } else if (request.command === 'sound') {
     toggleSound();
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
                showNotification('Work time is up!');
                if (soundNotification) {
                    playSound();
                }
                remainingTime = defaultTime; // Reset to default or a defined work/break period
            }
        }, 1000);
    }
}

// Considered combining this with startTimer() but thought function would become too complicated once different durations were passed in as args
function breakTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        remainingTime = breakTime || defaultTime;
        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                showNotification('Break time is up!');
                if (soundNotification) {
                    playSound();
                }
                remainingTime = defaultTime; // Reset to default or a defined work/break period
            }
        }, 1000);
    }
}

// Stops and clears the remaining time
function resetTimer() {
  clearInterval(timerInterval);
  remainingTime = defaultTime; // Reset to default time
  
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
      type: 'progress',
      iconUrl: './images/light-bulb.png'
  });
}

// Sound checkbox
function toggleSound() {
    console.log("test");
    !soundNotification;
}

// Redirects to offscreen.html, service workers don't have access to DOM APIs
async function playSound(source = 'bong.mp3', volume = 1) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source, volume } });
}

// Document closes after 30 seconds without audio playing due to chrome's 'lifetime limit'
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'play timer notification' //
    });
}

