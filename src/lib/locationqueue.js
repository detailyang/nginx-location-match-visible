const Queue = require('./queue').Queue;


function LocationQueue(name) {
  this.name = name;
  this.queue = null;
  this.exact = null;
  this.inclusive = null;
  this.list = new Queue();
}


module.exports = {
  LocationQueue,
};
