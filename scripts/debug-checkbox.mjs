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

async function clickAt(selector) {
  const rectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('${selector}');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    })()`,
    returnByValue: true
  });
  const rect = rectRes.result?.result?.value;
  if (!rect) throw new Error('Element not found: ' + selector);

  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
    button: 'left',
    clickCount: 1
  });
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
    button: 'left',
    clickCount: 1
  });
  await sleep(300);
}

// 1. Test CPU Filter Checkbox
console.log('--- Testing CPU Filter Checkbox ---');
const cpuBefore = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('CPU filter before click:', cpuBefore.result?.result?.value);

// Click directly on CPU checkbox
await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    cb?.click();
  })()`
});
await sleep(500);

const cpuAfter = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    const chip = Array.from(document.querySelectorAll('.rounded-xs')).find(c => c.innerText.includes('Solo con CPU'));
    return { cbState: cb?.getAttribute('data-state'), chipPresent: Boolean(chip) };
  })()`,
  returnByValue: true
});
console.log('CPU filter after click on checkbox:', cpuAfter.result?.result?.value);

// Click on the text label (span)
await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    span?.click();
  })()`
});
await sleep(500);

const cpuAfterSpan = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return { cbState: cb?.getAttribute('data-state') };
  })()`,
  returnByValue: true
});
console.log('CPU filter after click on span text:', cpuAfterSpan.result?.result?.value);

// 2. Test Columnas Popover
console.log('\n--- Testing Columnas Popover ---');
await send('Runtime.evaluate', {
  expression: `(() => {
    const colBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Columnas'));
    colBtn?.click();
  })()`
});
await sleep(500);

const colPop = await send('Runtime.evaluate', {
  expression: `(() => {
    const pop = document.querySelector('[role="dialog"]');
    const items = Array.from(document.querySelectorAll('[role="dialog"] button[role="checkbox"]'));
    return { isOpen: Boolean(pop), checkboxCount: items.length };
  })()`,
  returnByValue: true
});
console.log('Columnas popover opened:', colPop.result?.result?.value);

if (colPop.result?.result?.value?.checkboxCount > 0) {
  // Click first column checkbox
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cb = document.querySelector('[role="dialog"] button[role="checkbox"]');
      cb?.click();
    })()`
  });
  await sleep(500);

  const colAfter = await send('Runtime.evaluate', {
    expression: `(() => {
      const cb = document.querySelector('[role="dialog"] button[role="checkbox"]');
      return { cbState: cb?.getAttribute('data-state') };
    })()`,
    returnByValue: true
  });
  console.log('Column checkbox after click:', colAfter.result?.result?.value);
}

await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
ws.close();
