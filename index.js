'use strict'

const Queue = require('./lib/queue').Queue;
const ngx_queue_init = require('./lib/queue').ngx_queue_init;
const ngx_queue_next = require('./lib/queue').ngx_queue_next;
const ngx_queue_sentinel = require('./lib/queue').ngx_queue_sentinel;
const ngx_queue_empty = require('./lib/queue').ngx_queue_empty;
const ngx_queue_insert_head = require('./lib/queue').ngx_queue_insert_head;
const ngx_queue_insert_after = require('./lib/queue').ngx_queue_insert_after;
const ngx_queue_insert_tail = require('./lib/queue').ngx_queue_insert_tail;
const ngx_queue_head = require('./lib/queue').ngx_queue_head;
const ngx_queue_last = require('./lib/queue').ngx_queue_last;
const ngx_queue_prev = require('./lib/queue').ngx_queue_prev;
const ngx_queue_remove = require('./lib/queue').ngx_queue_remove;
const ngx_queue_split = require('./lib/queue').ngx_queue_split;
const ngx_queue_add = require('./lib/queue').ngx_queue_add;
const ngx_queue_sort = require('./lib/queue').ngx_queue_sort;
const ngx_queue_pprint = require('./lib/queue').ngx_queue_pprint;

const Location = require('./lib/location').Location;
const ngx_http_add_location = require('./lib/location').ngx_http_add_location;

const LocationQueue = require('./lib/locationqueue').LocationQueue;


const locations = new Queue();
ngx_queue_init(locations);
const l1 = new Location("1");
const l2 = new Location("2");
const l3 = new Location("3");

ngx_http_add_location(locations, l3);
ngx_http_add_location(locations, l1);
ngx_http_add_location(locations, l2);

ngx_queue_pprint(locations);
ngx_queue_sort(locations, (q1, q2) => {
  console.log(q1);
  return q1.data.name > q2.data.name;
});
ngx_queue_pprint(locations);
