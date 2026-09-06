const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000/comisiones', { method: 'PUT' });
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
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);

const rectRes = await send('Runtime.evaluate', {
  expression: `(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const brokerBtn = btns.find(b => b.innerText.includes('Brokers'));
    if (!brokerBtn) return null;
    const r = brokerBtn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, r };
  })()`,
  returnByValue: true
});
const coords = rectRes.result?.result?.value;
console.log('Broker button at 1440x900:', coords);

await send('Input.dispatchMouseEvent', {
  type: 'mousePressed',
  x: coords.x,
  y: coords.y,
  button: 'left',
  clickCount: 1
});
await send('Input.dispatchMouseEvent', {
  type: 'mouseReleased',
  x: coords.x,
  y: coords.y,
  button: 'left',
  clickCount: 1
});

await sleep(500);

const menuRes = await send('Runtime.evaluate', {
  expression: `(() => {
    const menu = document.querySelector('[role="menu"]');
    const items = Array.from(document.querySelectorAll('[role="menuitemcheckbox"]')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        text: el.innerText,
        state: el.getAttribute('data-state'),
        coords: { x: r.x + r.width / 2, y: r.y + r.height / 2 }
      };
    });
    return { hasMenu: Boolean(menu), items };
  })()`,
  returnByValue: true
});
console.log('Menu content at 1440x900:', menuRes.result?.result?.value);

const firstItem = menuRes.result?.result?.value?.items?.[0];
if (firstItem) {
  console.log('Clicking first menu item:', firstItem.text);
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: firstItem.coords.x,
    y: firstItem.coords.y,
    button: 'left',
    clickCount: 1
  });
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: firstItem.coords.x,
    y: firstItem.coords.y,
    button: 'left',
    clickCount: 1
  });
  await sleep(500);

  const afterClickRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const menu = document.querySelector('[role="menu"]');
      const badge = document.querySelector('button .bg-blue-600');
      return {
        menuStillOpen: Boolean(menu),
        badgeText: badge?.innerText
      };
    })()`,
    returnByValue: true
  });
  console.log('After item click:', afterClickRes.result?.result?.value);
}

await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
ws.close();
