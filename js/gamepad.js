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
 
var gamepadSupport = {
  // Remembers the connected gamepads at the last check; used in Chrome
  // to figure out when gamepads get connected or disconnected, since no
  // events are fired.
  prevRawGamepadType: undefined,

  // Previous timestamps for gamepad state; used in Chrome to not bother with
  // analyzing the polled data if nothing changed (timestamp is the same
  // as last time).
  prevTimestamp: undefined,

  /**
   * Initialize support for Gamepad API.
   */
  init: function() {
    var gamepadSupportAvailable = navigator.getGamepads;

    if (!gamepadSupportAvailable) {
      showNotSupported();
    } else {
      gamepadSupport.tick();
    }
  },

  /**
   * A function called with each requestAnimationFrame(). Polls the gamepad
   * status and schedules another poll.
   */
  tick: function() {
    gamepadSupport.pollStatus();
    window.requestAnimationFrame(gamepadSupport.tick);
  },

  /**
   * Checks for the gamepad status. Monitors the necessary data and notices
   * the differences from previous state (buttons for Chrome/Firefox,
   * new connects/disconnects for Chrome). If differences are noticed, asks
   * to update the display accordingly. Should run as close to 60 frames per
   * second as possible.
   */
  pollStatus: function() {
    // Poll to see if gamepads are connected or disconnected. Necessary
    // only on Chrome.
    // gamepadSupport.pollGamepads();
    gamepadSupport.gamepad = navigator.getGamepads()[0]
    // var gamepad = gamepadSupport.gamepad;
    // if (gamepad.timestamp &&
    //     (gamepad.timestamp == gamepadSupport.prevTimestamp)) {
    //   return;
    // }
    // gamepadSupport.prevTimestamp = gamepad.timestamp;
    draw(gamepadSupport.gamepad);
      

    // var gamepad = gamepadSupport.gamepad;
    // gamepadSupport.updateDisplay();

      // Don’t do anything if the current timestamp is the same as previous
      // one, which means that the state of the gamepad hasn’t changed.
      // This is only supported by Chrome right now, so the first check
      // makes sure we’re not doing anything if the timestamps are empty
      // or undefined.

  },

  // This function is called only on Chrome, which does not yet support
  // connection/disconnection events, but requires you to monitor
  // an array for changes.
  pollGamepads: function() {
    // Get the array of gamepads – the first method (getGamepads)
    // is the most modern one and is supported by Firefox 28+ and
    // Chrome 35+. The second one (webkitGetGamepads) is a deprecated method
    // used by older Chrome builds.
    var rawGamepad = navigator.getGamepads()[0];

    if (rawGamepad) {
      // We don’t want to use rawGamepads coming straight from the browser,
      // since it can have “holes” (e.g. if you plug two gamepads, and then
      // unplug the first one, the remaining one will be at index [1]).
      gamepadSupport.gamepad = undefined;

      // We only refresh the display when we detect some gamepads are new
      // or removed; we do it by comparing raw gamepad table entries to
      // “undefined.”
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

function showNotSupported() {
  alert("Gamepads not supported");
}