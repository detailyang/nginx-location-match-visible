const LocationQueue = require('./LocationQueue').LocationQueue;
const Queue = require('./queue').Queue;
const ngx_queue_init = require('./queue').ngx_queue_init;
const ngx_queue_next = require('./queue').ngx_queue_next;
const ngx_queue_sentinel = require('./queue').ngx_queue_sentinel;
const ngx_queue_empty = require('./queue').ngx_queue_empty;
const ngx_queue_insert_head = require('./queue').ngx_queue_insert_head;
const ngx_queue_insert_after = require('./queue').ngx_queue_insert_after;
const ngx_queue_insert_tail = require('./queue').ngx_queue_insert_tail;
const ngx_queue_head = require('./queue').ngx_queue_head;
const ngx_queue_last = require('./queue').ngx_queue_last;
const ngx_queue_prev = require('./queue').ngx_queue_prev;
const ngx_queue_remove = require('./queue').ngx_queue_remove;
const ngx_queue_split = require('./queue').ngx_queue_split;
const ngx_queue_add = require('./queue').ngx_queue_add;
const ngx_queue_sort = require('./queue').ngx_queue_sort;
const ngx_queue_pprint = require('./queue').ngx_queue_pprint;


function Location(name) {
  this.name = name;
  this.noname = false;
  this.named = false;
  this.exact_match = false;
  this.noregex = false;
  this.regex = null;
}


function ngx_http_add_location(locations, location) {
  const lq = new LocationQueue(location.name);

  if (location.exact_match || location.regex ||
      location.named || location.noname) {
    lq.exact = location;
    lq.inclusive = null;
  } else {
    lq.exact = null;
    lq.inclusive = location;
  }

  const q = new Queue(lq);
  ngx_queue_init(lq.list);
  ngx_queue_insert_tail(locations, q);
}


module.exports = {
  Location,
  ngx_http_add_location,
};
