var TimeoutManager = {

  timeLastKnown: new Date().getTime(),

  idToTimeoutMap: {},

  setTimeout: function (temp_callback, temp_time) {

    /* create a window timeout, create a corresponding Timeout object
     * and update idToTimeoutMap */
    var timeoutId = window.setTimeout(temp_callback, temp_time);
    var newTimeout = new Timeout(temp_callback, temp_time, timeoutId);
    this.idToTimeoutMap[timeoutId] = newTimeout;

  },

  clearTimeout: function (tId) {

    window.clearTimeout(tId);
    delete idToTimeoutMap[tId];

  },

  togglePause: function () {

    if (gameOptions.paused) {
      this.unpause();
    }

    else {
      this.pause();
    }

  },

  pause: function () {

    for (var tId in idToTimeoutMap) {
      /* this is the important part - we only clear the timeout from
       * the window object, not from the idToTimeoutMap! */
      window.clearTimeout(tId);
    }

    /* remember the time when we were paused */
    this.timeLastKnown = new Date().getTime();

  },

  unpause: function () {

    for (var tId in idToTimeoutMap) {

      /* get the timeout */
      var timeout = idToTimeoutMap[tId];

      /* how much time is left in the timeout */
      var timeLeft = timeout.start + timeout.duration - this.timeLastKnown;
      
      /* update the attributes of the timeout */
      timeout.duration = timeLeft;
      timeout.start = new Date.getTime();
      
      /* set the window event
       * no need to create a new timeout in the idToTimeoutMap */
      window.setTimeout(timeout.callback, timeLeft);

    }

  }

}