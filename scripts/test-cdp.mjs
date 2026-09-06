const versionRes = await fetch('http://127.0.0.1:9222/json/version');
const version = await versionRes.json();
console.log('CDP Browser:', version.Browser);

const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000', { method: 'PUT' });
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

await new Promise((r) => setTimeout(r, 2000));

const titleRes = await send('Runtime.evaluate', { expression: 'document.title' });
console.log('Page Title:', titleRes.result?.result?.value);

const h1Res = await send('Runtime.evaluate', { expression: 'document.querySelector("h1")?.innerText' });
console.log('Dashboard H1:', h1Res.result?.result?.value);

await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
ws.close();
