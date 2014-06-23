var currItem = 0;
var totalItems = 4;

var blockGamepad = false;

if (navigator.getGamepads()[0]) {
  console.log("gamepad connected");
} else {
  console.log("gamepad NOT connected");
}

function drawBorderAroundCurrent() {
  console.log("called draw border, currItem " + currItem);
  var menuItem = document.getElementById("menu" + currItem);
  menuItem.style.border = "2px solid red";
  menuItem.style.borderRadius = "20px";

  for (var i = 0; i < totalItems; i++) {
    if (i != currItem) {
      document.getElementById("menu" + (i%totalItems))
              .style
              .border = "";
    }
  };
}

function selectMenuItem() {
  // document.getElementById("debugger").innerHTML = currItem;
  var gamepadSnap = navigator.getGamepads()[0];
  if (gamepadSnap.axes[1] > 0.4 && !blockGamepad) {
    currItem++;
    if (currItem >= totalItems) currItem -= totalItems;
    blockGamepad = true;
    window.setTimeout(function () { blockGamepad = false; }, 400);
    drawBorderAroundCurrent();
  } else if (gamepadSnap.axes[1] < -0.4 && !blockGamepad) {
    currItem--;
    if (currItem < 0) currItem += totalItems;
    blockGamepad = true;
    window.setTimeout(function () { blockGamepad = false; }, 400);
    drawBorderAroundCurrent();
  } else if (gamepadSnap.buttons[0].pressed) {
    window.location.replace("game.html");
  }
  requestAnimationFrame(selectMenuItem);
}

selectMenuItem();
drawBorderAroundCurrent();