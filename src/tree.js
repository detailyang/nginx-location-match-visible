const Queue = require('./lib/queue').Queue;
const ngx_queue_init = require('./lib/queue').ngx_queue_init;
const ngx_queue_pprint = require('./lib/queue').ngx_queue_pprint;
const Location = require('./lib/location').Location;
const parse = require('./lib/location').parse;
const unserialize = require('./lib/location').unserialize;
const ngx_http_add_location = require('./lib/location').ngx_http_add_location;
const LocationQueue = require('./lib/locationqueue').LocationQueue;
const LocationTree = require('./lib/locationtree').LocationTree;
const ngx_http_init_locations = require('./lib/locationtree').ngx_http_init_locations;
const ngx_http_find_static_location = require('./lib/locationtree').ngx_http_find_static_location;
const ngx_http_init_static_location_trees = require('./lib/locationtree').ngx_http_init_static_location_trees;
const ngx_http_create_locations_list = require('./lib/locationtree').ngx_http_create_locations_list;
const ngx_http_core_find_location = require('./lib/locationtree').ngx_http_core_find_location;
const Stage = require('./lib/stage').default;

const RED = "#dc322f";
const BLUE = "#268bd2";
const YELLOW = '#b58900';
const VIOLET = '#6c71c4';
const MAGENTA = '#d33682';
const CYAN = '#2aa198';


function static_locations_pprint_with_stage(stage, tracknodes, node, x, y, offset, px, py) {
    const r = 30;
    if (node == null) {
        return;
    }
    if (!node.len) {
        return;
    }
    if (px != null && py != null) {
        stage.drawLine(px, py, x, y);
    }

    stage.drawCircle(x, y, r);
    let type = "";
    if (node.exact) {
     type = "=";
     if (node.inclusive) {
      type = `${node.name} and ${type}`;
     }
    } else {
        if (node.inclusive.noregex) {
          type = "^~";
        } else if (node.inclusive.named) {
          type = "@";
        } else if (node.inclusive.regex) {
          type = node.inclusive.rcaseless ? "~*" : "~";
        } else {
          type = " ";
        }
    }
    stage.drawText(x, y, `${type} ${node.name}`);

    tracknodes.push({x,y, name: node.name, id: node.inclusive ? node.inclusive.id : node.exact.id});

    if (node.left) {
        static_locations_pprint_with_stage(stage, tracknodes, node.left, x-offset, y+offset, offset, x, y);
    }

    if (node.tree) {
        static_locations_pprint_with_stage(stage, tracknodes, node.tree, x, y+offset, offset, x, y);
    }

    if (node.right) {
        static_locations_pprint_with_stage(stage, tracknodes, node.right, x+offset, y+offset, offset, x, y);
    }
}


function regex_locations_pprint_with_stage(stage, tracknodes, regex_locations, x, y, offset) {
    let lastx = x;
    for (let i = 0; i < regex_locations.length; i++) {
        const node = regex_locations[i];

        tracknodes.push({x,y, name: node.name, id: node.id});
        stage.drawLine(lastx, y, x, y);
        stage.drawCircle(x, y, 30);
        let type = "";
        if (node.exact) {
         type = "=";
        } else {
            if (node.noregex) {
              type = "^~";
            } else if (node.named) {
              type = "@";
            } else if (node.regex) {
              type = node.rcaseless ? "~*" : "~";
            } else {
              type = "";
            }

        }
        stage.drawText(x, y, `${type} ${node.name}`);
        lastx = x;
        x += offset;
    }
}


function find_max_y(tracknodes) {
    let max_y = 0;
    for (let i = 0; i < tracknodes.length; i ++) {
        const node = tracknodes[i];
        if (node.y > max_y) {
            max_y = node.y;
        }
    }

    return max_y;
}


module.exports = {
    unserialize,
    render: (ctx, uri, conf) => {
        let locations = null;
        try {
            locations = parse(conf);
        } catch (e) {
            alert(e.message);
            return e;
        }
        const regex_locations = [];
        const named_locations = [];
        const tracknodes = [];

        ngx_http_init_locations(locations, regex_locations, named_locations);
        const static_locations = ngx_http_init_static_location_trees(locations);
        /* set stage */
        const s = new Stage(ctx);
        s.setFont("20px Arial");
        s.setStrokeStyle(VIOLET)
        s.drawText(0, 40, "nginx static location tree")

        s.setFont("10px Arial");
        s.setStrokeStyle(BLUE);

        static_locations_pprint_with_stage(s, tracknodes, static_locations, 300, 40, 100, null, null);
        let max_y = find_max_y(tracknodes);
        max_y = max_y == 0 ? 100 : max_y;

        s.setFont("20px Arial");
        s.setStrokeStyle(VIOLET)
        s.drawText(0, max_y+50, "nginx static regex list");

        s.setFont("10px Arial");
        s.setStrokeStyle(MAGENTA);
        regex_locations_pprint_with_stage(s, tracknodes, regex_locations, 100, max_y + 100, 100);

        const trackID = [];
        const track = (id) => {
            trackID.push(id);
        }
        const x = ngx_http_core_find_location(uri, static_locations, regex_locations, named_locations, track);

        let lastx = 0;
        let lasty = 0;
        s.setStrokeStyle(CYAN);
        let tick = 0;
        for (let i = 0; i < trackID.length; i++) {
            for (let j = 0; j < tracknodes.length; j ++) {
                let node = tracknodes[j];
                if (node.id == trackID[i]) {
                    s.drawLineWithText(lastx, lasty, node.x, node.y, `${tick++}`);
                    lastx = node.x;
                    lasty = node.y;
                }
            }
        }

        if (x == null) {
            s.drawLineWithText(lastx, lasty, 666, 0, `${tick} do not match ${uri}`);
        }

        return x;
    }
}
