var GameEventManager = {

  currTime: 0,

  events: new GameEventQueue(),

  /* given an event id, return the index in the array where it is located */
  idToIndexMap: {},

  tick: function (gamepadSnapshot) {

    this.handleEvents();

    /* advance the clock */
    this.currTime++;

    /* run the game itself */
    run(gamepadSnapshot);

  },

  /* pop events from the priority queue and deal with them */
  handleEvents: function () {

    var now = this.currTime;

    while (this.events.peek().timeout >= now) {

      var closestEvent = this.popQueueAndRun();

      /* if it's an interval event, re-add it into the queue */
      if (closestEvent.type == gameEventEnum.INTERVAL) {

        var newEvent = new GameEvent({

          callback:   closestEvent.callback,
          timeout:    this.currTime + closestEvent.timeout,
          type:       gameEventEnum.INTERVAL,
          eventId:    closestEvent.eventId /* same id for the new event */

        });

        this.addEvent(newEvent);

      }

    }

  },

  addEvent: function (newEvent) {

    idToIndexMap[eventId] = this.events.insert(newEvent);

  },

  /* remove the highest priority event from the queue, and run it */
  popQueueAndRun: function () {

    var closestEvent = this.events.deleteMin();

    closestEvent.callback();

    delete idToIndexMap[closestEvent.eventId];

    return closestEvent;

  }

  removeEvent: function (eventId) {

    var locatedAt = idToIndexMap[eventId];

    this.events.deleteByIndex(locatedAt);

    delete idToIndexMap[eventId];

  },

  /* return the index in the event queue where the event is located */
  getEventIndex: function (eventId) {

    return idToIndexMap[eventId] || -1;

  }

}