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



function ngx_filename_cmp(s1, s2, n) {
  let i = 0;

  while (n) {
    let c1 = s1.charCodeAt(i);
    let c2 = s2.charCodeAt(i);
    c1 = isNaN(c1) ? 0 : c1;
    c2 = isNaN(c2) ? 0 : c2;
    i = i + 1;

    // ignore caseless filesystem
    if (c1 == c2) {
      if (c1) {
        n = n - 1;
        continue;
      }

      return 0;
    }

    if (c1 == 0 || c2 == 0) {
      return c1 - c2;
    }

    c1 = (c1 == '/'.charCodeAt(0)) ? 0 : c1;
    c2 = (c2 == '/'.charCodeAt(0)) ? 0 : c2;

    return c1 - c2;
  }

  return 0;
}

function ngx_min(first, second) {
  return first < second ? first : second;
}

function ngx_http_cmp_locations(one, two) {
  const lq1 = one.data;
  const lq2 = two.data;

  const first = lq1.exact ? lq1.exact : lq1.inclusive;
  const second = lq2.exact ? lq2.exact : lq2.inclusive;

  if (first.noname && !second.noname) {
    return 1;
  }

  if (!first.noname && second.noname) {
    return -1;
  }

  if (first.noname || second.noname) {
    return 0;
  }

  if (first.named && !second.named) {
    return 1;
  }

  if (!first.named && second.named) {
    return -1;
  }

  if (first.named && second.named) {
    return first.name >= second.name;
  }

  if (first.regex && !second.regex) {
    return 1;
  }

  if (!first.regex && second.regex) {
    return -1;
  }

  if (first.regex || second.regex) {
    return 0;
  }

  const rc = ngx_filename_cmp(first.name, second.name, ngx_min(first.name.length, second.name.length) + 1);

  if (rc == 0 && !first.exact_match && second.exact_match) {
    return 1;
  }

  return rc;
}

function ngx_http_init_locations(locations) {
  ngx_queue_sort(locations, ngx_http_cmp_locations);

  let r = 0;
  let n = 0;
  let regex = null;
  let named = null;
  let q = null;
  let lq = null;
  let l = null;
  for (q = ngx_queue_head(locations); q != ngx_queue_sentinel(locations); q = ngx_queue_next(q)) {
    lq = q.data;
    l = lq.exact ? lq.exact : lq.inclusive;
    // nest locations

    if (l.regex) {
      r++;
      if (regex == null) {
        regex = q;
      }

      continue;
    }

    if (l.named) {
      n++;

      if (named == null) {
        name = q;
      }

      continue;
    }

    if (l.noname) {
      break;
    }
  }

  let tail;
  if (q != ngx_queue_sentinel(locations)) {
    ngx_queue_split(locations, q, tail);
  }

  if (named) {
    for (q = named;
         q != ngx_queue_sentinel(locations);
         q = ngx_queue_nex(q))
    {
      lq = q.data;
      named_locations.push(lq.exact);
    }
    ngx_queue_split(locations, named, tail);
  }

  if (regex) {
    for (q = regex;
         q != ngx_queue_sentinel(locations);
         q = ngx_queue_nex(q))
    {
      lq = q.data;
      regex_locations.push(lq.exact);
    }
    ngx_queue_split(locations, regex, tail);
  }

  return 0;
}


function ngx_http_init_static_location_trees(locations) {
  if (locations == null) {
    return 0;
  }

  if (ngx_queue_empty(locations)) {
    return 0;
  }

  let q = null;
  let lq = null;
  let l = null;
  for (q = ngx_queue_head(locations); q != ngx_queue_sentinel(locations); q = ngx_queue_next(q)) {
    lq = q.data;
    l = lq.exact ? lq.exact : lq.inclusive;
    // nest location
  }

  ngx_http_join_exact_locations(locations);
  ngx_http_create_locations_list(locations, ngx_queue_head(locations));
}

function ngx_http_create_locations_list(locations, q) {
  if (q == ngx_queue_last(locations)) {
    return;
  }

  let lq = q.data;
  if (lq.inclusive == null) {
    ngx_http_create_locations_list(locations, ngx_queue_next(q));
    return;
  }

  let len = lq.name.length;
  let name = lq.name;
  let x = null;
  for (x = ngx_queue_next(q); x != ngx_queue_sentinel(locations); x = ngx_queue_next(x)) {
    let lx = x.data;

    if (len > lx.name.length || ngx_filename_cmp(name, lx.name, len) != 0) {
      break;
    }
  }

  q = ngx_queue_next(q);
  if (q == x) {
    ngx_http_create_locations_list(locations, x);
    return;
  }

  let tail = new Queue();
  ngx_queue_split(locations, q, tail);
  ngx_queue_add(lq.list, tail);

  if (x == ngx_queue_sentinel(locations)) {
    ngx_http_create_locations_list(lq.list, ngx_queue_head(lq.list));
    return;
  }

  ngx_queue_split(lq.list, x, tail);
  ngx_queue_add(locations, tail);
  ngx_http_create_locations_list(lq.list, ngx_queue_head(lq.list));

  ngx_http_create_locations_list(locations, x);
}

function ngx_http_join_exact_locations(locations) {
  let q = ngx_queue_head(locations);
  while (q != ngx_queue_last(locations)) {
    let x = ngx_queue_next(q);

    let lq = q.data;
    let lx = x.data;

    if (lq.name.length == lx.name.length && ngx_filename_cmp(lq.name, lx.name, lx.name.length) == 0) {
      if ((q.exact && x.exact) || (q.inclusive && x.inclusive)) {
        console.log('duplicate');

        return -1;
      }
      q.inclusive = x.inclusive;
      ngx_queue_remove(x);

      continue;
    }

    q = ngx_queue_next(q);
  }

  return 0;
}

const named_locations = [];
const regex_locations = [];
// console.log(ngx_filename_cmp('1', '3', 2));
const locations = new Queue();
ngx_queue_init(locations);
const l1 = new Location("a");
l1.exact_match = false;
const l2 = new Location("a1");
l2.exact_match = false;
const l3 = new Location("a2");
l3.exact_match = false;

ngx_http_add_location(locations, l3);
ngx_http_add_location(locations, l1);
ngx_http_add_location(locations, l2);
// ngx_queue_sort(locations, ngx_http_cmp_locations);
// ngx_queue_pprint(locations);

ngx_http_init_locations(locations);
ngx_http_init_static_location_trees(locations);
