var currItem = 0;
var totalItems = 3;

var blockGamepad = false;

if (navigator.getGamepads()[0]) {
  console.log("gamepad connected");
}
else {
  console.log("gamepad NOT connected");
}

function drawBorderAroundCurrent() {

  var menuItem = document.getElementById("menu" + currItem);
  menuItem.style.border = "2px solid red";
  menuItem.style.borderRadius = "20px";

  for (var i = 0; i < totalItems; i++) {

    if (i != currItem) {
      document.getElementById("menu" + (i%totalItems))
              .style
              .border = "";
    }

  }

}

/* A quick hack to get around the fact that a gamepad button press
 * can register multiple times. The first time the buttonpress is
 * registered, this variable is set to true and a timeout for it to
 * get reset to false is set */
var blockToggleSound = false;

function selectMenuItem() {

  // document.getElementById("debugger").innerHTML = currItem;
  var gamepadSnap = navigator.getGamepads()[0];

  if (gamepadSnap.axes[1] > 0.4 && !blockGamepad) {

    currItem++;
    if (currItem >= totalItems) currItem -= totalItems;
    blockGamepad = true;
    window.setTimeout(function () { blockGamepad = false; }, 400);
    drawBorderAroundCurrent();

  }

  else if (gamepadSnap.axes[1] < -0.4 && !blockGamepad) {

    currItem--;
    if (currItem < 0) currItem += totalItems;
    blockGamepad = true;
    window.setTimeout(function () { blockGamepad = false; }, 400);
    drawBorderAroundCurrent();

  }

  else if (gamepadSnap.buttons[0].pressed) {

    switch(currItem) {

    case 0:
      /* toggle sound */

      if (!blockToggleSound) {

        blockToggleSound = true;
        window.setTimeout(function () { blockToggleSound = false; }, 400);

        localStorage.dodgeBombMute = !localStorage.dodgeBombMute;

        var soundStatusDisplayDiv  = document.getElementById('menu0');

        if (localStorage.dodgeBombMute) {
          soundStatusDisplayDiv.innerHTML = "Sounds: Off";
        } else if (!localStorage.dodgeBombMute) {
          soundStatusDisplayDiv.innerHTML = "Sounds: On";
        }

      }

      break;

    case 1:
      /* reset highscore */
      localStorage.dodgeBombHighScore = 0;
      document.getElementById('highscore').innerHTML = 0;
      break;

    case 2:
      /* back */
      window.location.replace("index.html");
      break;

    }

  }

  requestAnimationFrame(selectMenuItem);

}

selectMenuItem();
drawBorderAroundCurrent();