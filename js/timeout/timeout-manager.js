var TimeoutManager = {

  timeoutId: 0,

  timeLastKnown: undefined,

  idToTimeoutMap: {},

  setTimeout: function (temp_callback, temp_time) {

    /* create a window timeout, create a corresponding Timeout object
     * and update idToTimeoutMap */
    this.timeoutId = window.setTimeout(temp_callback, temp_time);
    var newTimeout = new Timeout(temp_callback, temp_time, timeoutId);
    this.idToTimeoutMap[timeoutId] = newTimeout;

    this.timeoutId++;

  },

  clearTimeout: function (tId) {

    window.clearTimeout(tId);
    delete idToTimeoutMap[tId];

  }

  pauseAllTimeouts: function () {

    for (var tId in idToTimeoutMap) {
      /* this is the important part - we only clear the timeout from
       * the window object, not from the idToTimeoutMap! */
      window.clearTimeout(tId);
    }

    /* remember the time when we were paused */
    this.timeLastKnown = new Date().getTime();

  }

  unpauseAllTimeouts: function () {

    for (var tId in idToTimeoutMap) {

      var timeout = idToTimeoutMap[tId];
      var timeLeft = timeout.start + timeout.duration - this.timeLastKnown;
      
      this.setTimeout(timeout.callback, timeLeft);

    }

  }

}