/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mwichary@google.com (Marcin Wichary)
 */

 /* Significant changes made by Rohan Prinja (rs.prinja@samsung.com)
  * in order to make the SBrowser game Dodgebomb
  * including: stripping away all non-Chrome stuff
  */
 
var gamepadSupport = {

  prevRawGamepadType: undefined,

  prevTimestamp: undefined,

  tick: function() {

    gamepadSupport.pollGamepads();
    var gamepadSnap = navigator.getGamepads()[0];

    if (gamepadSnap.buttons[7].pressed) {

      gameOptions.togglePause();
      // TimeoutManager.togglePause();
      // IntervalManager.togglePause();
      
    }

    if (!gameOptions.gameOver) {

      if (!gameOptions.paused) {
        run(gamepadSnap);
      }
      
    }

    else {

      if (gamepadSnap.buttons[0].pressed ||
          gamepadSnap.buttons[1].pressed ||
          gamepadSnap.buttons[2].pressed ||
          gamepadSnap.buttons[3].pressed ||

          gamepadSnap.buttons[4].pressed ||
          gamepadSnap.buttons[5].pressed ||
          gamepadSnap.buttons[6].pressed ||
          gamepadSnap.buttons[7].pressed ||

          gamepadSnap.buttons[8].pressed ||
          gamepadSnap.buttons[9].pressed ||
          gamepadSnap.buttons[10].pressed ||
          gamepadSnap.buttons[11].pressed)
      {

        reset.game(navigator.getGamepads()[0]);

      }

    }

    window.requestAnimationFrame(gamepadSupport.tick);

  },

  pollGamepads: function() {

    var rawGamepad = navigator.getGamepads()[0];

    if (rawGamepad) {

      gamepadSupport.gamepad = undefined;
      var gamepadChanged = false;

      // This condition is true when exactly one of the LHS and RHS
      // is undefined
      if (typeof rawGamepad != gamepadSupport.prevRawGamepadType) {
        gamepadChanged = true;
        gamepadSupport.prevRawGamepadType = typeof rawGamepad;
      }

      gamepadSupport.gamepad = rawGamepad;

    }

  }

};