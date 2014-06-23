/* http://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript */

var timeAliveInSec = 0;
var timeAliveSpan = document.getElementById("timeAlive");
window.setInterval(setTime, 1000);

function setTime() {
  if (!gameOptions.paused) {
    timeAliveSpan.innerHTML = timeAliveInSec + "";
    timeAliveInSec++;
  }
}

function boostCountdown () {
  boostModeDisplay.innerHTML = "Boost mode: " + (boostModeTimeLeft / 1000);
  boostModeTimeLeft -= 1000;
}

/* level up after 50 seconds */
// setInterval(levelUp, 50000);

// function levelUp() {
// }