// Purpose of background.js is to be run in the background of chrome. popup.js sends messages
// to the background to run certain functions.

// Variables 
let remainingTime;
let timerInterval;

// Message function handler
// Will tell which function to call when the message is send
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === 'start') {
    startTimer();
  } else if(request.command == 'pause'){
    pauseTimer();
  }else if (request.command === 'stop') {
    stopTimer();
  } else if (request.command === 'getRemainingTime') {
    sendResponse({ remainingTime });
  }
});

// Function to start the countdown: minutes 1 second every interval
function startTimer() {
  if (remainingTime === undefined){
    remainingTime = 60;
  } // 30 minutes
  sendRemainingTime();
  timerInterval = setInterval(function () {
    if (remainingTime <= 0){
        chrome.runtime.sendMessage({ command: 'playNoise' });
        // if(playSound === true) {
        //     playNotificationSound();
        // }
        clearInterval(timerInterval);
        stopTimer();
    }else{
        remainingTime--;
        sendRemainingTime();
    }
  }, 1000);
  
}

// Stops and clears the remaining time
function stopTimer() {
  clearInterval(timerInterval);
  remainingTime = 0;
  sendRemainingTime();
}

// TODO: fix the pause time as its not saving the remaining time and reseting to 30mins again.
function pauseTimer() {
    clearInterval(timerInterval);
    sendRemainingTime();
  }

  // Set the remaining time left
function sendRemainingTime() {
  chrome.runtime.sendMessage({ command: 'updateTimer', remainingTime });
}

/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
async function playSound(source = 'default.wav', volume = 1) {
    await createOffscreen();
    await chrome.runtime.sendMessage({ play: { source, volume } });
}

/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
async function playSound(source = 'bong.mp3', volume = 5) {

    await chrome.runtime.sendMessage({ play: { source, volume } });
}






