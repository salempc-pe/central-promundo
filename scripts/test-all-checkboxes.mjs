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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);

async function clickElement(selector) {
  const rectRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('${selector}');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`,
    returnByValue: true
  });
  const pos = rectRes.result?.result?.value;
  if (!pos) throw new Error('Not found: ' + selector);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await sleep(400);
}

// 1. Test CPU checkbox button click vs text click
console.log('=== TEST CPU FILTER ===');
const cpuInitial = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('CPU initial:', cpuInitial.result.result.value);

// Click directly on button
await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    cb?.click();
  })()`
});
await sleep(400);
const cpuAfterBtn = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('CPU after button click (expected: checked):', cpuAfterBtn.result.result.value);

// Click directly on span
await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    span?.click();
  })()`
});
await sleep(400);
const cpuAfterSpan = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('CPU after span click (expected: unchecked):', cpuAfterSpan.result.result.value);

// 2. Test Estado filter
console.log('\n=== TEST ESTADO FILTER ===');
const estadoInitial = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.trim() === 'Disponible');
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('Estado initial:', estadoInitial.result.result.value);

await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.trim() === 'Disponible');
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    cb?.click();
  })()`
});
await sleep(400);
const estadoAfterBtn = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.trim() === 'Disponible');
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('Estado after button click (expected: checked):', estadoAfterBtn.result.result.value);

// 3. Test Table row selection
console.log('\n=== TEST TABLE ROW SELECTION ===');
const rowInitial = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('Row cb initial:', rowInitial.result.result.value);

await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    cb?.click();
  })()`
});
await sleep(400);
const rowAfterBtn = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
console.log('Row cb after click (expected: checked):', rowAfterBtn.result.result.value);

// 4. Test Table Header Select All
console.log('\n=== TEST HEADER SELECT ALL ===');
await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('thead tr th button[role="checkbox"]');
    cb?.click();
  })()`
});
await sleep(400);
const headerAfter = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('thead tr th button[role="checkbox"]');
    const count = document.querySelectorAll('tbody tr td button[data-state="checked"]').length;
    return { headerState: cb?.getAttribute('data-state'), checkedRows: count };
  })()`,
  returnByValue: true
});
console.log('Header select all result:', headerAfter.result.result.value);

// 5. Test Column Visibility Popover
console.log('\n=== TEST COLUMN VISIBILITY ===');
await send('Runtime.evaluate', {
  expression: `(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Columnas'));
    btn?.click();
  })()`
});
await sleep(500);
const colToggle = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('[role="dialog"] button[role="checkbox"]');
    const initial = cb?.getAttribute('data-state');
    cb?.click();
    return { initial };
  })()`,
  returnByValue: true
});
await sleep(400);
const colAfter = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('[role="dialog"] button[role="checkbox"]');
    return { after: cb?.getAttribute('data-state') };
  })()`,
  returnByValue: true
});
console.log('Column visibility toggle:', colToggle.result.result.value, colAfter.result.result.value);

// 6. Test /auditoria Dropdown Menus
console.log('\n=== TEST AUDITORIA DROPDOWNS ===');
await send('Page.navigate', { url: 'http://localhost:3000/auditoria' });
await sleep(2000);

const audBtn = await send('Runtime.evaluate', {
  expression: `(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Módulos'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`,
  returnByValue: true
});
if (audBtn.result.result.value) {
  const pos = audBtn.result.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await sleep(500);

  const audItemRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const item = document.querySelector('[role="menuitemcheckbox"]');
      if (!item) return { error: 'No menuitemcheckbox found' };
      const before = item.getAttribute('data-state');
      const r = item.getBoundingClientRect();
      return { before, text: item.innerText, x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`,
    returnByValue: true
  });
  console.log('Auditoria dropdown item before:', audItemRes.result.result.value);
  const itemPos = audItemRes.result.result.value;
  if (itemPos?.x) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: itemPos.x, y: itemPos.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: itemPos.x, y: itemPos.y, button: 'left', clickCount: 1 });
    await sleep(500);

    const audItemAfter = await send('Runtime.evaluate', {
      expression: `(() => {
        const item = document.querySelector('[role="menuitemcheckbox"]');
        return { after: item?.getAttribute('data-state'), stillOpen: Boolean(item) };
      })()`,
      returnByValue: true
    });
    console.log('Auditoria dropdown item after:', audItemAfter.result.result.value);
  }
}

// 7. Test /reportes Dropdown Menus
console.log('\n=== TEST REPORTES DROPDOWNS ===');
await send('Page.navigate', { url: 'http://localhost:3000/reportes' });
await sleep(2000);

const repBtn = await send('Runtime.evaluate', {
  expression: `(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Brokers'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`,
  returnByValue: true
});
if (repBtn.result.result.value) {
  const pos = repBtn.result.result.value;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
  await sleep(500);

  const repItemRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitemcheckbox"]'));
      return items.map(it => {
        const r = it.getBoundingClientRect();
        return { text: it.innerText, state: it.getAttribute('data-state'), x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
    })()`,
    returnByValue: true
  });
  console.log('Reportes dropdown items:', repItemRes.result.result.value);
  const secondItem = repItemRes.result.result.value?.[1];
  if (secondItem?.x) {
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: secondItem.x, y: secondItem.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: secondItem.x, y: secondItem.y, button: 'left', clickCount: 1 });
    await sleep(500);

    const repAfter = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Alvaro'));
        const activeBroker = btn ? btn.innerText : 'not found';
        return { activeBroker };
      })()`,
      returnByValue: true
    });
    console.log('Reportes after selecting broker:', repAfter.result.result.value);
  }
}

await fetch('http://127.0.0.1:9222/json/close/' + target.id);
ws.close();
