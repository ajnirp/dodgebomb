/* Priority queue with the ability to delete arbitrary elements within the queue */

function GameEventQueue() {

  this.array = [];
  this.currSize = 0;

}

////////////////////////////////////////////////////////////////////////////////

/* returns the index where the new element was inserted */
GameEventQueue.prototype.insert = function (newEvent) {

  var hole = this.currSize++;
  this.array.push(newEvent);

  var parent, temp;

  while (hole > 0) {

    parent = Math.floor((hole - 1) >> 1);

    /* early exit, no more percolating up to do */
    if (this.array[parent].timeout <= this.array[hole].timeout) {
      break;
    }

    /* swap values at [hole] and [parent] */
    var temp = this.array[hole];
    this.array[hole] = this.array[parent];
    this.array[parent] = temp;

    /* percolate up */
    hole = parent;

  }

  return hole;

}

////////////////////////////////////////////////////////////////////////////////

GameEventQueue.prototype.findHelper = function (event1, currIndex) {

  var eventTimeout = event1.timeout;

  while (currIndex < this.currSize) {

    if (this.array[currIndex].timeout > eventTimeout) {
      return -1;
    }
    else if (this.array[currIndex].timeout == eventTimeout) {
      return currIndex;
    }

    var leftChild = (currIndex << 1) + 1;
    var rightChild = leftChild + 1;

    var leftSearch = -1;
    var rightSearch = -1;

    if (leftChild < this.currSize) {
      leftSearch = findHelper(eventTimeout, leftChild);
      if (rightChild < this.currSize) {
        rightSearch = findHelper(eventTimeout, rightChild);
      }
    }

    /* in JS, -1 is represented as all bits = 1
     * so if leftSearch is -1, rightSearch is returned */
    return leftSearch & rightSearch;

  }

}
GameEventQueue.prototype.find = function (event1) {

  return this.findHelper(event1, 0);

}

////////////////////////////////////////////////////////////////////////////////

GameEventQueue.prototype.peek = function () {

  return this.array[0];

}

////////////////////////////////////////////////////////////////////////////////

GameEventQueue.prototype.deleteMin = function () {

  /* return the deleted element */
  var returnVal = this.array[0];

  /* move last element to the top */
  this.array[0] = this.array[this.currSize - 1];

  /* update size */
  this.currSize--;

  var hole = 0;

  while (hole < this.currSize) {

    var leftChild = (hole << 1) + 1;
    var rightChild = leftChild + 1;

    if (leftChild >= this.currSize) {
      /* this node has no children, so break and return */
      break;
    }

    /* this node might have 2 children, so we check which one is smaller */
    var smallerChild = leftChild;

    if (rightChild < this.currSize) {
      if (this.array[smallerChild].timeout > this.array[rightChild].timeout) {
        smallerChild = rightChild;
      }
    }

    /* early exit - check if further percolation needs to be done */
    if (this.array[hole].timeout <= this.array[smallerChild].timeout) {
      break;
    }

    /* swap with the smaller child */
    var temp = this.array[smallerChild];
    this.array[smallerChild] = this.array[hole];
    this.array[hole] = temp;

    /* percolate down */
    hole = smallerChild;

  }

  return returnVal;

}

////////////////////////////////////////////////////////////////////////////////

GameEventQueue.prototype.deleteByIndex = function (index) {

  var hole = index;

  /* decide which direction to percolate in */
  var parent = Math.floor((hole - 1) >> 1);

  // TODO
  // if (this.array[hole].timeout )

}

////////////////////////////////////////////////////////////////////////////////

GameEventQueue.prototype.print = function () {
  
  for (var i = 0 ; i < this.currSize ; i++) {

    console.log(this.array[i]);

  }

}