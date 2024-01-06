// background.js runs in chrome background. popup.js sends messages. popup.js sends messages to background.js to communicate.

// Tracks total time of the timer
let totalTime = 1500;

// Tracks remaining time on timer
let remainingTime = 1500;

let workTime = 1500;
let breakTime = 300;

// Time in milliseconds to decrement timer by
let timerInterval;

let soundNotification = true;

// Flag for timer running and paused
let isTimerRunning = false;

// Flag for current state
let isWorkPeriod = true;
let isBreakPeriod = false;

// Required to communicate checked sound box between main & extension
chrome.storage.sync.set({'soundNotification': soundNotification});

// Handles messages, invokes function based on message. Checks whether 'start' and 'pause' flags are set to prevent unexpected results.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.command === 'updateTimes' && request.workTime && request.breakTime) {
    // Update work and break times, converting minutes to milliseconds
    workTime = parseInt(request.workTime) * 60;
    breakTime = parseInt(request.breakTime) * 60;
    console.log(`Updated times: Work - ${workTime/60000} mins, Break - ${breakTime/60000} mins`);
    resetTimer();
  }
  
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
      else{
        sendResponse({ remainingTime: remainingTime, totalTime: breakTime });
      }
      
  } 
  // Add a catch-all response for unhandled commands
  else {
      sendResponse({ status: "Command not recognized" });
  }
  return true; // Keep the message channel open for async response
});

// Updates soundNotification storage 
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === 'updateStorage' && request.data === 'toggleSoundNotification') {

        // Update the storage with sound data
        chrome.storage.sync.get('soundNotification', function(data) {
            let newSoundSetting = !data.soundNotification;

            // Manual update required  because playSound is asynchronous
            soundNotification = newSoundSetting;
            
            chrome.storage.sync.set({ 'soundNotification': newSoundSetting });

            // ??? Get understanding of why this shows the opposite of the status of the Sound checkbox - probably due to async nature. Still,works perfectly and pages communicate appropriately 
            console.log('Current soundNotification value in chrome.,storage.sync.get:', data.soundNotification);
            
        });
    
    }
});


// Starts timer countdown
function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        if (!isBreakPeriod){
            isWorkPeriod = true;
            totalTime = workTime;
        }
        else{
            totalTime = breakTime;
        }
        //totalTime = breakTime || workTime;
        remainingTime = remainingTime || workTime; // or your default time
        console.log("starting time:" + remainingTime + " | totalTime: "+ totalTime );
        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                showNotification('Work time is up!');
        
                playSound();
               
                setDefault(); // Reset to default or a defined work/break period
            }
        }, 1000);
    }
}

// Considered combining this with startTimer() but thought function would become too complicated once different durations were passed in as args
function breakTimer() {
    clearInterval(timerInterval)
    if (!isTimerRunning) {
        isTimerRunning = true;
        isWorkPeriod = false;
        isBreakPeriod = true;
        totalTime = breakTime || workTime;
        remainingTime = breakTime || workTime;
        timerInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                showNotification('Break time is up!');
                if (soundNotification) {
                    playSound();
                }
                setDefault(); // Reset to default or a defined work/break period
            }
        }, 1000);
    }
}

// Stops and clears the remaining time
function resetTimer() {
    //   if (isWorkPeriod) {
    //     clearInterval(timerInterval);
    //     setDefaultDefined(workTime); // Reset to default time
    //   }
    //   else {
    //     clearInterval(timerInterval);
    //     setDefaultDefined(breakTime); // Reset to default time
    //   }
    // Instead of resetting break time + worktime just reset back to default worktime
    clearInterval(timerInterval)
    setDefaultDefined(workTime)
    isWorkPeriod =true;
    isBreakPeriod = false;
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
        justification: 'play timer notification' //
    });
}

function setDefault(){
    remainingTime = workTime; // Reset to default time
    totalTime = workTime; // Reset Total time to default time
}

function setDefaultDefined(definedTime){
    remainingTime = definedTime; // Reset to default time
    totalTime = definedTime; // Reset Total time to default time
    isTimerRunning = false;
}

