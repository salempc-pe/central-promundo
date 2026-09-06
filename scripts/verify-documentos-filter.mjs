async function test(url) {
  const targetRes = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await targetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && callbacks.has(data.id)) callbacks.get(data.id)(data);
  };
  function send(method, params = {}) {
    return new Promise((r) => { const msgId = id++; callbacks.set(msgId, r); ws.send(JSON.stringify({ id: msgId, method, params })); });
  }
  await new Promise((r) => (ws.onopen = r));
  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise((r) => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr')).map(r => r.innerText.substring(0, 60));
      return { rowCount: rows.length, firstRow: rows[0] };
    })()`,
    returnByValue: true
  });
  console.log(`URL: ${url} ->`, res.result?.result?.value);
  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
}

await test('http://localhost:3000/documentos?estado=Por_Vencer');
await test('http://localhost:3000/documentos?estado=por_vencer');
