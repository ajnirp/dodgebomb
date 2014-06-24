function GameEvent(temp) {
  
  this.callback = temp.callback;
  this.timeout  = temp.timeout;
  this.type     = temp.type || gameEventEnum.TIMEOUT;

}

var gameEventEnum = {

  TIMEOUT:  0,
  INTERVAL: 1

}