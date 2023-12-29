// Variables 
let timerInterval;
let playSound = true

// Listeners for Buttons
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "start") {
        startTimer();
    } else if (request.command === "stop") {
        endOfTimer();
    }
    else if (request.command ==="playNoise"){
        playNotificationSound();
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
document.getElementById("soundNotification").addEventListener('change', function() {
    toggleSoundNotification();
})


// Functions 
// Start the timer count down
function startTimer() {
    chrome.runtime.sendMessage({command:'start'});
    updateTimer();
    timerInterval  = setInterval(updateTimer,1000);
}
// Pause the timer but dont clear the time
function pauseTimer() {
    chrome.runtime.sendMessage({command:'pause'});
    clearInterval(timerInterval);
    updateTimer();
}

//End the timer count down
function stopTimer() {
    chrome.runtime.sendMessage({command:'stop'});
    clearInterval(timerInterval);
    updateTimer();
}

function toggleSoundNotification() {
    playSound = !playSound;
}


function playNotificationSound() {
    let notificationSound = new Audio('./bong.mp3');
    notificationSound.play();
    // var sound = document.getElementById('sound');
    // sound.play();
    // document.write('<audio id="player" src="bong.mp3">');
    // document.getElementById('player').play();
    
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


