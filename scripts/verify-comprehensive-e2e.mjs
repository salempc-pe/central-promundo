// Comprehensive E2E Verification Suite for Promundo Sistema
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
await send('DOM.enable');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(2000);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log(' SUITE 1: VERIFICACIÓN DE CHECKBOXES & TICKS');
console.log('====================================================');

// 1.1 Checkboxes en /terrenos (Filtros CPU, Estado, Row, Header, Columnas)
await send('Page.navigate', { url: 'http://localhost:3000/terrenos' });
await sleep(2000);

// Test CPU filter
const cpuTest = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    const before = cb?.getAttribute('data-state');
    cb?.click();
    return { before };
  })()`,
  returnByValue: true
});
await sleep(300);
const cpuAfter = await send('Runtime.evaluate', {
  expression: `(() => {
    const span = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    const cb = span?.closest('div')?.querySelector('button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
assert(cpuTest.result.result.value.before === 'unchecked' && cpuAfter.result.result.value === 'checked', 'Filtro CPU togglea de unchecked a checked');

// Test row select checkbox
const rowTest = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    const before = cb?.getAttribute('data-state');
    cb?.click();
    return { before };
  })()`,
  returnByValue: true
});
await sleep(300);
const rowAfter = await send('Runtime.evaluate', {
  expression: `(() => {
    const cb = document.querySelector('tbody tr td button[role="checkbox"]');
    return cb?.getAttribute('data-state');
  })()`,
  returnByValue: true
});
assert(rowTest.result.result.value.before === 'unchecked' && rowAfter.result.result.value === 'checked', 'Checkbox de fila en TanStack Table togglea a checked');

// Test Header select all
await send('Runtime.evaluate', {
  expression: `(() => {
    const headerCb = document.querySelector('thead tr th button[role="checkbox"]');
    headerCb?.click();
  })()`
});
await sleep(300);
const headerCount = await send('Runtime.evaluate', {
  expression: `(() => {
    const checked = document.querySelectorAll('tbody tr td button[data-state="checked"]').length;
    return checked;
  })()`,
  returnByValue: true
});
assert(headerCount.result.result.value > 1, `Select all selecciona todas las filas (seleccionadas: ${headerCount.result.result.value})`);

console.log('\n====================================================');
console.log(' SUITE 2: NAVEGACIÓN Y ENLACES INTER-MÓDULOS');
console.log('====================================================');

// 2.1 Enlace a Pipeline con ID de deal (/pipeline?dealId=neg-001)
await send('Page.navigate', { url: 'http://localhost:3000/pipeline?dealId=neg-001' });
await sleep(2000);
const pipeDealTest = await send('Runtime.evaluate', {
  expression: `(() => {
    const sheet = document.querySelector('[role="dialog"]');
    const title = sheet?.innerText || '';
    return { hasSheet: Boolean(sheet), hasCode: title.includes('TR-MIRA-084') };
  })()`,
  returnByValue: true
});
assert(pipeDealTest.result.result.value.hasSheet && pipeDealTest.result.result.value.hasCode, 'Carga directa de /pipeline?dealId=neg-001 abre Drawer con el deal exacto');

// 2.2 Enlace a Pipeline con ID de terreno (/pipeline?terrenoId=tr-001)
await send('Page.navigate', { url: 'http://localhost:3000/pipeline?terrenoId=tr-001' });
await sleep(2000);
const pipeTerrenoTest = await send('Runtime.evaluate', {
  expression: `(() => {
    const sheet = document.querySelector('[role="dialog"]');
    const input = document.querySelectorAll('input[placeholder*="Buscar"]')[1];
    const cards = document.querySelectorAll('.cursor-pointer.rounded-xs');
    return { hasSheet: Boolean(sheet), inputVal: input?.value, cardCount: cards.length };
  })()`,
  returnByValue: true
});
assert(pipeTerrenoTest.result.result.value.hasSheet && pipeTerrenoTest.result.result.value.cardCount > 0, `/pipeline?terrenoId=tr-001 abre ficha y filtra cards (${pipeTerrenoTest.result.result.value.cardCount} deals encontrados)`);

// 2.3 Búsqueda de deal por código en Pipeline (/pipeline?q=neg-001)
await send('Page.navigate', { url: 'http://localhost:3000/pipeline?q=neg-001' });
await sleep(2000);
const pipeSearchNeg = await send('Runtime.evaluate', {
  expression: `(() => {
    const cards = document.querySelectorAll('.cursor-pointer.rounded-xs');
    return cards.length;
  })()`,
  returnByValue: true
});
assert(pipeSearchNeg.result.result.value === 1, `/pipeline?q=neg-001 filtra exactamente el deal neg-001`);

// 2.4 Enlace a Mapa con terrenoId (/mapa?terrenoId=tr-001)
await send('Page.navigate', { url: 'http://localhost:3000/mapa?terrenoId=tr-001' });
await sleep(2000);
const mapaTest = await send('Runtime.evaluate', {
  expression: `(() => {
    const popup = document.querySelector('.promundo-map-popup');
    const inspectBtn = document.querySelector('#btn-sheet-inspect');
    return { hasPopup: Boolean(popup), hasInspectBtn: Boolean(inspectBtn), popupText: popup?.innerText?.substring(0, 100) };
  })()`,
  returnByValue: true
});
assert(mapaTest.result.result.value.hasPopup && mapaTest.result.result.value.hasInspectBtn, '/mapa?terrenoId=tr-001 vuela al predio y despliega popup HUD con botón de inspección');

// 2.5 Enlace de Comisiones a Pipeline con dealId específico
await send('Page.navigate', { url: 'http://localhost:3000/comisiones' });
await sleep(2000);
// Open first comision sheet
await send('Runtime.evaluate', {
  expression: `(() => {
    const btn = Array.from(document.querySelectorAll('tbody tr td button')).find(b => b.innerText.includes('LIQ-'));
    btn?.click();
  })()`
});
await sleep(1000);
const comisionPipeLink = await send('Runtime.evaluate', {
  expression: `(() => {
    const link = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Ver Pipeline'));
    return link ? link.getAttribute('href') : null;
  })()`,
  returnByValue: true
});
assert(comisionPipeLink.result.result.value && comisionPipeLink.result.result.value.includes('/pipeline?dealId='), `Enlace de liquidación hacia Pipeline incluye dealId específico (${comisionPipeLink.result.result.value})`);

// 2.6 Auditoría con filtro de entidad (/auditoria?q=LIQ-001)
await send('Page.navigate', { url: 'http://localhost:3000/auditoria?q=LIQ-001' });
await sleep(2000);
const audRows = await send('Runtime.evaluate', {
  expression: `(() => {
    const rows = document.querySelectorAll('tbody tr');
    const text = rows[0]?.innerText || '';
    return { count: rows.length, firstRow: text.substring(0, 120) };
  })()`,
  returnByValue: true
});
assert(audRows.result.result.value.count >= 1 && audRows.result.result.value.firstRow.includes('LIQ-001'), `/auditoria?q=LIQ-001 filtra la bitácora para mostrar eventos de LIQ-001 (${audRows.result.result.value.count} filas)`);

// 2.7 Dropdown single-select en /reportes con closeOnSelect
await send('Page.navigate', { url: 'http://localhost:3000/reportes' });
await sleep(2000);
const repBtnRes = await send('Runtime.evaluate', {
  expression: `(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Todos los Brokers') || b.innerText.includes('Alvaro'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`,
  returnByValue: true
});
assert(Boolean(repBtnRes.result.result.value), 'Botón de filtro de Brokers en /reportes encontrado');

console.log('\n====================================================');
console.log(` RESULTADO FINAL: ${passed} PASSED / ${failed} FAILED`);
console.log('====================================================');

try {
  ws.close();
} catch (e) {}

process.exit(failed > 0 ? 1 : 0);
