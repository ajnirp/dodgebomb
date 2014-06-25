var IntervalManager = {

  timeLastKnown: new Date().getTime(),

  idToIntervalMap: {},

  setInterval: function (temp_callback, temp_time) {

    /* create a window interval, create a corresponding Interval object
     * and update idToIntervalMap */
    var intervalId = window.setInterval(temp_callback, temp_time);
    var newInterval = new Interval(temp_callback, temp_time, intervalId);
    this.idToIntervalMap[intervalId] = newInterval;

  },

  clearInterval: function (tId) {

    window.clearInterval(tId);
    delete idToIntervalMap[tId];

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

    for (var tId in idToIntervalMap) {
      /* this is the important part - we only clear the interval from
       * the window object, not from the idToIntervalMap! */
      window.clearInterval(tId);
    }

    /* remember the time when we were paused */
    this.timeLastKnown = new Date().getTime();

  },

  unpause: function () {

    for (var tId in idToIntervalMap) {

      /* get the interval */
      var interval = idToIntervalMap[tId];

      var elapsedTime = this.timeLastKnown - interval.start;
      var elapsedDuration = elapsedTime % interval.duration;

      var timeLeft = interval.duration - elapsedDuration;

      TimeoutManager.setTimeout(function () {
        interval.callback();
        interval.start = new Date().getTime();
        window.setInterval(interval.callback, interval.duration);
      }, timeLeft);

    }

  }

}