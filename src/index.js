'use strict'
const tree = require('./tree');

// begin
const canvas = document.getElementById('tree');
const ctx = canvas.getContext('2d');
const goDom = document.getElementById('go');
const uriDom = document.getElementById('uri');
const confDom = document.getElementById('conf');
goDom.onclick = () => {
    const uri = uriDom.value;
    const conf = confDom.value;
    if (!uri.length) {
        alert(`please input uri you want to match like "/abcd"`);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const node = tree.render(ctx, uri, conf);
    if (node == null) {
        return alert(`do not match the uri ${uri}`);
    }

    alert(`your uri ${uri} => ${tree.unserialize(node)}`);
}

const node = tree.render(ctx, '/abc', confDom.value);
