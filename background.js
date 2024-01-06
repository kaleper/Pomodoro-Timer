// background.js runs in chrome background, sent messages from popup.js and main.js. 

// Tracks total time of the timer. Used in timer animation
let totalTime = 1500;

// Tracks remaining time on timer
let remainingTime = 1500;

// Default work and break times 
let workTime = 1500;
let breakTime = 300;

// Time in milliseconds to decrement timer by
let timerInterval;

// Play notification when timer is up 
let soundNotification = true;

// Flag for timer running and paused
let isTimerRunning = false;

// Flag for current state
let isWorkPeriod = true;
let isBreakPeriod = false;

// Required to communicate checked sound box between main & extension
chrome.storage.sync.set({'soundNotification': soundNotification});

// Handles messages, invokes function based on message. Checks whether 'start', 'pause', 'work' or 'break' flags are set to prevent unexpected results.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    // User entered custom work/ break times
  if(request.command === 'updateTimes' && request.workTime && request.breakTime) {

    workTime = parseInt(request.workTime) * 60;
    breakTime = parseInt(request.breakTime) * 60;
    console.log(`Updated times: Work - ${workTime/60000} mins, Break - ${breakTime/60000} mins`);
    resetTimer();
  }
  
  //  User clicked action button 
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
      pauseTimer();
      breakTimer();
      isWorkPeriod = false;
      sendResponse({ status: "Break timer started" });
  }
  // Sends remaining time to popup.js
  else if (request.command === 'getRemainingTime') {
      if (isWorkPeriod){
        sendResponse({ remainingTime: remainingTime, totalTime: workTime });
      }
      else {
        sendResponse({ remainingTime: remainingTime, totalTime: breakTime });
      }
  } 

  // Add a catch-all response for unhandled commands
  else {
      sendResponse({ status: "Command not recognized" });
  }

});

// Updates soundNotification storage 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === 'updateStorage' && request.data === 'toggleSoundNotification') {

        // Update the storage with sound data
        chrome.storage.sync.get('soundNotification', function(data) {

            let newSoundSetting = !data.soundNotification;

            // Manual update required  because playSound is asynchronous
            soundNotification = newSoundSetting;
            
            // Update storage with setting
            chrome.storage.sync.set({ 'soundNotification': newSoundSetting });
            
        });
    
    }
});

// Starts timer countdown
function startTimer() {
    // Update flag if not running
    if (!isTimerRunning) {
        isTimerRunning = true;
        // Start work period
        if (!isBreakPeriod){
            isWorkPeriod = true;
            totalTime = workTime;
        }
        // Start break period 
        else {
            totalTime = breakTime;
        }

        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                showNotification('Work time is up!');
        
                playSound();
               
                // Reset to default work time
                setDefault(); 
            }
        }, 1000);
    }
}

function breakTimer() {
    clearInterval(timerInterval)
    if (!isTimerRunning) {
        isTimerRunning = true;
        isWorkPeriod = false;
        isBreakPeriod = true;
        remainingTime = breakTime 

        totalTime = breakTime 

        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                showNotification('Break time is up!');
                if (soundNotification) {
                    playSound();
                }
                // Reset to default work time
                setDefault(); 
            }
        }, 1000);
    }
}

// Resets time and flags 
function resetTimer() {
    
    clearInterval(timerInterval)
    setDefaultDefined(workTime)
    isWorkPeriod = true;
    isBreakPeriod = false;
}

// Pauses timer 
function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
  }

// Display visual notification when timer is up
function showNotification(message) {
  chrome.notifications.create('', {
      title: 'Pomodoro Timer',
      message: message,
      type: 'progress',
      iconUrl: './images/light-bulb.png'
  });
}

// Redirects to offscreen.html, service workers don't have access to DOM APIs
async function playSound(source = 'audio/bong.mp3', volume = 1) {
    console.log("at time played, soundNotification in background.js= " + soundNotification)
    if (soundNotification) {
        await createOffscreen();
        await chrome.runtime.sendMessage({ play: { source, volume } });
    }
}

// Document closes after 30 seconds without audio playing due to chrome's 'lifetime limit'
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'play timer notification' 
    });
}

// Reset timer to default settings 
function setDefault(){

    remainingTime = workTime; 
    totalTime = workTime; 
}

// Sets timer to custom user settings 
function setDefaultDefined(definedTime){

    remainingTime = definedTime; 
    totalTime = definedTime;

    isTimerRunning = false;
}