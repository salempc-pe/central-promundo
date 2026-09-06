const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000/pipeline?q=neg-001', { method: 'PUT' });
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);

const test1 = await send('Runtime.evaluate', {
  expression: `(() => {
    const input = document.querySelector('input[placeholder*="Buscar"]');
    // Find deal cards in kanban
    const dealCards = document.querySelectorAll('.cursor-pointer.rounded-xs');
    const text = document.body.innerText;
    return { inputVal: input?.value, cardCount: dealCards.length, textSnippet: text.substring(0, 300) };
  })()`,
  returnByValue: true
});
console.log('Result for /pipeline?q=neg-001:', test1.result.result.value);

// Now test with /pipeline?q=tr-001
await send('Page.navigate', { url: 'http://localhost:3000/pipeline?q=tr-001' });
await sleep(2000);

const test2 = await send('Runtime.evaluate', {
  expression: `(() => {
    const input = document.querySelector('input[placeholder*="Buscar"]');
    const dealCards = document.querySelectorAll('.cursor-pointer.rounded-xs');
    return { inputVal: input?.value, cardCount: dealCards.length };
  })()`,
  returnByValue: true
});
console.log('Result for /pipeline?q=tr-001:', test2.result.result.value);

// Now test with /pipeline?terrenoId=tr-001
await send('Page.navigate', { url: 'http://localhost:3000/pipeline?terrenoId=tr-001' });
await sleep(2000);

const test3 = await send('Runtime.evaluate', {
  expression: `(() => {
    const input = document.querySelector('input[placeholder*="Buscar"]');
    const sheet = document.querySelector('[role="dialog"]');
    return { inputVal: input?.value, sheetOpen: Boolean(sheet), sheetText: sheet?.innerText?.substring(0, 100) };
  })()`,
  returnByValue: true
});
console.log('Result for /pipeline?terrenoId=tr-001:', test3.result.result.value);

await fetch('http://127.0.0.1:9222/json/close/' + target.id);
ws.close();
