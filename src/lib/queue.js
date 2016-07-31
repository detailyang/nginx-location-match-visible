'use strict'


function Queue(data) {
  this.prev = null;
  this.next = null;
  this.data = data;
}


function ngx_queue_init(q) {
  q.prev = q;
  q.next = q;
}


function ngx_queue_next(q) {
  return q.next;
}


function ngx_queue_sentinel(q) {
  return q;
}


function ngx_queue_empty(h) {
  return h === h.prev;
}


function ngx_queue_insert_head(h, x) {
  x.next = h.next;
  x.next.prev = x;
  x.prev = h;
  h.next = x;
}


function ngx_queue_insert_after(h, x) {
  x.next = h.next;
  x.next.prev = x;
  x.prev = h;
  h.next = x;
}


function ngx_queue_insert_tail(h, x) {
  x.prev = h.prev;
  x.prev.next = x;
  x.next = h;
  h.prev = x;
}


function ngx_queue_head(h) {
  return h.next;
}


function ngx_queue_last(h) {
  return h.prev;
}


function ngx_queue_prev(q) {
  return q.prev;
}


function ngx_queue_remove(x) {
  x.next.prev = x.prev;
  x.prev.next = x.next;
  x.prev = null;
  x.next = null;
}


function ngx_queue_split(h, q, n) {
  n.prev = h.prev;
  n.prev.next = n;
  n.next = q;
  h.prev = q.prev;
  h.prev.next = h;
  q.prev = n;
}


function ngx_queue_add(h, n) {
  h.prev.next = n.next;
  n.next.prev = h.prev;
  h.prev = n.prev;
  h.prev.next = h;
}


function ngx_queue_sort(queue, cmp) {
  let q, prev, next;

  q = ngx_queue_head(queue);
  if (q == ngx_queue_last(queue)) {
    return;
  }

  for (q = ngx_queue_next(q); q != ngx_queue_sentinel(queue); q = next) {
    prev = ngx_queue_prev(q);
    next = ngx_queue_next(q);
    ngx_queue_remove(q);

    do {
      if (cmp(prev, q) <= 0) {
        break;
      }
      prev = ngx_queue_prev(prev);

    } while (prev != ngx_queue_sentinel(queue));

    ngx_queue_insert_after(prev, q);
  }
}


function ngx_queue_pprint(queue) {
  let q;

  for (q = ngx_queue_next(queue); q != ngx_queue_sentinel(queue); q = ngx_queue_next(q)) {
    console.log(q.data);
  }
}

function ngx_queue_middle(queue) {
  let middle = ngx_queue_head(queue);

  if (middle == ngx_queue_last(queue)) {
    return middle;
  }

  let next = ngx_queue_head(queue);
  for (;;) {
    middle = ngx_queue_next(middle);
    next = ngx_queue_next(next);

    if (next == ngx_queue_last(queue)) {
      return middle;
    }

    next = ngx_queue_next(next);
    if (next == ngx_queue_last(queue)) {
      return middle;
    }
  }
}


module.exports = {
  Queue,
  ngx_queue_init,
  ngx_queue_next,
  ngx_queue_sentinel,
  ngx_queue_empty,
  ngx_queue_insert_head,
  ngx_queue_insert_after,
  ngx_queue_insert_tail,
  ngx_queue_head,
  ngx_queue_last,
  ngx_queue_prev,
  ngx_queue_remove,
  ngx_queue_split,
  ngx_queue_add,
  ngx_queue_sort,
  ngx_queue_middle,
  ngx_queue_pprint,
}
