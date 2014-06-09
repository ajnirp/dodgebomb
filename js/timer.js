/* http://stackoverflow.com/questions/5517597/plain-count-up-timer-in-javascript */

var timeAliveInSec = 0;
var timeAliveSpan = document.getElementById("timeAlive");
setInterval(setTime, 1000);

function setTime() {
	if (ballAlive) {
		timeAliveSpan.innerHTML = timeAliveInSec + "";
		timeAliveInSec++;
	}
}