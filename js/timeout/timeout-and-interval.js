function Timeout(temp_callback, temp_duration, temp_id) {

  this.start     = new Date().getTime();
  this.callback  = temp_callback;
  this.duration  = temp_duration;
  this.timeoutId = temp_id;

}

function Interval(temp_callback, temp_duration, temp_id) {

  this.start     = new Date().getTime();
  this.callback  = temp_callback;
  this.duration  = temp_duration;
  this.timeoutId = temp_id;

}