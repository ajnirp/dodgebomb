/* http://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript */

var timeAliveInSec = 0;
var timeAliveSpan = document.getElementById("timeAlive");
setInterval(setTime, 1000);

function setTime() {
  timeAliveSpan.innerHTML = timeAliveInSec + "";
  timeAliveInSec++;
}

function boostCountdown () {
  boostModeTimeLeft -= 1000;
  boostModeDisplay.innerHTML = "Boost mode: " + (boostModeTimeLeft / 1000);
}

/* level up after 50 seconds */
// setInterval(levelUp, 50000);

// function levelUp() {
// }