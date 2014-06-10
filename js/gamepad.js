/* https://developer.mozilla.org/en-US/docs/Web/API/navigator.getGamepads */
/* http://www.w3.org/TR/gamepad/ */
/* really good: https://developer.mozilla.org/en-US/docs/Web/Guide/API/Gamepad */

// if (onMobile && !(GamepadEvent in window)) {
// 	var interval = setInterval(pollGamepads, 500);
// }

/* which function should be used as the parameter to requestAnimationFrame? */
var rAFCallback = pollGamepads;

var aliveAnnouncementDiv = document.getElementById("aliveAnnouncement");
aliveAnnouncementDiv.innerHTML = "You are using a " + (onMobile ? "mobile" : "non-mobile") + " device";

var gamepad;

function pollGamepads() {
    console.log('here4');
	/* if setup function not called yet, return without doing anything */
	if (typeof(setupDone) == 'undefined' || !setupDone) {
		return;
	}

	var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
	for (var i = 0 ; i < gamepads.length ; i++) {
		gamepad = gamepads[i];
		if (gamepad) {
			console.log("Gamepad connected at " + gamepad.index + ": " + gamepad.id + ". It has " + gamepad.buttons.length + " buttons and " + gamepad.axes.length + " axes.");
			draw();
			// clearInterval(interval);
			break;
		}
	}
	if (i === gamepads.length) {
		/* no gamepads connected, defer to keyboard */
		console.log("no gamepad found, using keyboard")
		currentControls = "keyboard";
		rAFCallback = draw;
		draw();
		// clearInterval(interval);
	}
}

function buttonPressed(b) {
	if (typeof(b) == 'object') {
		return b.pressed;
	}
	return b == 1.0;
}