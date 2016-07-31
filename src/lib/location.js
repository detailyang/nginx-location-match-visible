'use strict'


const LocationQueue = require('./locationqueue').LocationQueue;
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


function makeid(len)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < len; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function Location(name) {
  this.id = makeid(20);
  this.name = name;
  this.noname = false;
  this.named = false;
  this.exact_match = false;
  this.noregex = false;
  this.regex = false;
  this.rcaseless = false;
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


function parse(str) {
  const regex = /location/g;
  const indices = [];
  let result;
  while ( (result = regex.exec(str)) ) {
      indices.push(result.index);
  }

  const locations = new Queue();
  ngx_queue_init(locations);

  for (let i = 0; i < indices.length; i ++) {
      const index = indices[i];
      const newstr = str.substring(index+'location'.length);
      const locationlines = newstr.split('{');
      if (locationlines == 1) {
          throw new Error('nginx conf format error');
          continue;
      }
      const locationline = locationlines[0];
      const args = locationline.replace(/\s+/g, ' ').trim().split(' ');
      if (args.length == 1) {
        const location = new Location(args[0]);
        ngx_http_add_location(locations, location);
      } else if (args.length == 2) {
        const location = new Location(args[1]);

        const type = args[0];
        switch(type) {
          case '~':
            location.regex = true;
            break;
          case '=':
            location.exact_match = true;
            break;
          case '^~':
            location.noregex = true;
            break;
          case '@':
            location.named = true;
            break;
          case '~*':
            location.regex = true;
            location.rcaseless = true;
            break;
          default:
            throw new Error(`only support "~ = ^~ @" but you "${locationline}" is ${type}`);
            break;
        }

        ngx_http_add_location(locations, location);
      } else {
        throw new Error('nginx conf unknow location format');
      }
  }

  return locations;
}


function unserialize(location) {
  if (location.named) {
    return `location @${location.name}`;
  } else if (location.exact_match) {
    return `location = ${location.name}`;
  } else if (location.noregex) {
    return `location ^~ ${location.name}`;
  } else if (location.regex) {
    return location.rcaseless ? `location ~* ${location.name}` : `location ~ ${location.name}`;
  } else {
    return `location ${location.name}`;
  }
}


module.exports = {
  Location,
  ngx_http_add_location,
  parse,
  unserialize,
};
