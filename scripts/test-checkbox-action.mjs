const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000/terrenos', { method: 'PUT' });
const target = await targetRes.json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 1;
const callbacks = new Map();
ws.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.id && callbacks.has(data.id)) {
    callbacks.get(data.id)(data);
    callbacks.delete(data.id);
  }
};
function send(method, params = {}) {
  return new Promise((resolve) => {
    const msgId = id++;
    callbacks.set(msgId, resolve);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}
await new Promise((resolve) => (ws.onopen = resolve));
await send('Page.enable');
await send('Runtime.enable');
await send('DOM.enable');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);

// Check initial state of row checkbox
const initial = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    return cb ? cb.getAttribute('data-state') : 'not found';
  })()`,
  returnByValue: true
});
console.log('Initial row cb:', initial.result.result.value);

// Dispatch a real mouse click to the row checkbox coordinates
const rectRes = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    if (!cb) return null;
    const r = cb.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`,
  returnByValue: true
});
const pos = rectRes.result.result.value;
console.log('Row cb position:', pos);

await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
await sleep(500);

const afterMouseClick = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    const badge = document.querySelector('.bg-blue-100')?.innerText;
    return { cbState: cb?.getAttribute('data-state'), badge };
  })()`,
  returnByValue: true
});
console.log('After mouse click:', afterMouseClick.result.result.value);

// Now test clicking it with .click()
await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    cb?.click();
  })()`
});
await sleep(500);

const afterDirectClick = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    const badge = document.querySelector('.bg-blue-100')?.innerText;
    return { cbState: cb?.getAttribute('data-state'), badge };
  })()`,
  returnByValue: true
});
console.log('After .click():', afterDirectClick.result.result.value);

// Now test clicking the div wrapping the checkbox
await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    const div = cb?.closest('div');
    div?.click();
  })()`
});
await sleep(500);

const afterDivClick = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    const badge = document.querySelector('.bg-blue-100')?.innerText;
    return { cbState: cb?.getAttribute('data-state'), badge };
  })()`,
  returnByValue: true
});
console.log('After div.click():', afterDivClick.result.result.value);

await fetch('http://127.0.0.1:9222/json/close/' + target.id);
ws.close();
