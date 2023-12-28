// Purpose of background.js is to be run in the background of chrome. popup.js sends messages
// to the background to run certain functions.

// Variables 
let timerInterval;
let remainingTime;

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
  remainingTime = 30 * 60; // 30 minutes
  sendRemainingTime();
  timerInterval = setInterval(function () {
    if (remainingTime <= 0){
        playNotificationSound();
        clearInterval(timerInterval);
        stopTimer();
    }else{
        remainingTime--;
        sendRemainingTime();
    }
  }, 1000);
  
}

//TODO: function to play noise
function playNotificationSound() {
    let notificationSound = new Audio('');
    notificationSound.play();
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

function sendRemainingTime() {
  chrome.runtime.sendMessage({ command: 'updateTimer', remainingTime });
}





