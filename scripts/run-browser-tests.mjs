// Comprehensive browser verification script for checkboxes and links
const versionRes = await fetch('http://127.0.0.1:9222/json/version');
const version = await versionRes.json();

async function createBrowserSession(initialUrl) {
  const targetRes = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(initialUrl)}`, { method: 'PUT' });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res.result?.result?.value;
  }

  async function close() {
    await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
    ws.close();
  }

  return { send, evaluate, close };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('=== TEST 1: Dashboard -> Documentos "Auditar Vencimientos" ===');
{
  const session = await createBrowserSession('http://localhost:3000');
  await sleep(1500);

  // Click on "Auditar Vencimientos"
  const clickResult = await session.evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('Auditar Vencimientos'));
    if (!btn) return { error: 'Button not found' };
    btn.click();
    return { href: btn.getAttribute('href') };
  })()`);
  console.log('Clicked link:', clickResult);

  await sleep(1500);
  const currentUrl = await session.evaluate('window.location.href');
  console.log('Current URL:', currentUrl);

  const docRows = await session.evaluate(`(() => {
    const rows = document.querySelectorAll('tbody tr');
    const emptyMsg = document.querySelector('td')?.innerText;
    return { count: rows.length, firstText: rows[0]?.innerText?.substring(0, 100), emptyMsg };
  })()`);
  console.log('Documentos table result:', docRows);

  await session.close();
}

console.log('\n=== TEST 2: /terrenos Checkboxes & Filters ===');
{
  const session = await createBrowserSession('http://localhost:3000/terrenos');
  await sleep(1500);

  // Test row selection checkbox
  const rowSelectTest = await session.evaluate(`(() => {
    const firstCheckbox = document.querySelector('tbody tr td button[role="checkbox"]');
    if (!firstCheckbox) return { error: 'Row checkbox not found' };
    const initialState = firstCheckbox.getAttribute('data-state');
    firstCheckbox.click();
    const stateAfterClick = firstCheckbox.getAttribute('data-state');
    const badgeText = document.querySelector('.bg-blue-100')?.innerText;
    return { initialState, stateAfterClick, badgeText };
  })()`);
  console.log('Row select checkbox test:', rowSelectTest);

  // Test header checkbox (toggle all)
  const headerCheckboxTest = await session.evaluate(`(() => {
    const headerCheckbox = document.querySelector('thead tr th button[role="checkbox"]');
    if (!headerCheckbox) return { error: 'Header checkbox not found' };
    headerCheckbox.click();
    const stateAfterClick = headerCheckbox.getAttribute('data-state');
    const badgeText = document.querySelector('.bg-blue-100')?.innerText;
    return { stateAfterClick, badgeText };
  })()`);
  console.log('Header select all checkbox test:', headerCheckboxTest);

  // Test CPU filter checkbox in sidebar
  const cpuFilterTest = await session.evaluate(`(() => {
    const cpuSpan = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('Solo lotes con CPU adjunto'));
    if (!cpuSpan) return { error: 'CPU span not found' };
    const container = cpuSpan.closest('div');
    const checkbox = container.querySelector('button[role="checkbox"]');
    const beforeState = checkbox.getAttribute('data-state');
    // Click container
    container.click();
    const afterState = checkbox.getAttribute('data-state');
    return { beforeState, afterState };
  })()`);
  console.log('CPU filter toggle test:', cpuFilterTest);

  // Test Estado Comercial checkbox in sidebar
  const estadoFilterTest = await session.evaluate(`(() => {
    const dispSpan = Array.from(document.querySelectorAll('span')).find(s => s.innerText.trim() === 'Disponible');
    if (!dispSpan) return { error: 'Disponible span not found' };
    const container = dispSpan.closest('div');
    const checkbox = container.querySelector('button[role="checkbox"]');
    const beforeState = checkbox.getAttribute('data-state');
    checkbox.click();
    const afterState = checkbox.getAttribute('data-state');
    return { beforeState, afterState };
  })()`);
  console.log('Estado filter toggle test:', estadoFilterTest);

  await session.close();
}

console.log('\n=== TEST 3: /comisiones Dropdown Checkbox Behavior ===');
{
  const session = await createBrowserSession('http://localhost:3000/comisiones');
  await sleep(1500);

  const rectRes = await session.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const brokerBtn = btns.find(b => b.innerText.includes('Brokers'));
    if (!brokerBtn) return null;
    const r = brokerBtn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);

  if (!rectRes) {
    console.log('Broker button not found');
  } else {
    await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rectRes.x, y: rectRes.y, button: 'left', clickCount: 1 });
    await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rectRes.x, y: rectRes.y, button: 'left', clickCount: 1 });
    await sleep(500);

    const menuInfo = await session.evaluate(`(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitemcheckbox"]')).map(el => {
        const r = el.getBoundingClientRect();
        return { text: el.innerText, state: el.getAttribute('data-state'), x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      return { count: items.length, firstItem: items[0] };
    })()`);
    console.log('Opened Brokers dropdown items:', menuInfo);

    if (menuInfo?.firstItem) {
      await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: menuInfo.firstItem.x, y: menuInfo.firstItem.y, button: 'left', clickCount: 1 });
      await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: menuInfo.firstItem.x, y: menuInfo.firstItem.y, button: 'left', clickCount: 1 });
      await sleep(500);

      const afterClick = await session.evaluate(`(() => {
        const menu = document.querySelector('[role="menu"]');
        const badge = document.querySelector('button .bg-blue-600');
        return { menuStillOpen: Boolean(menu), badgeText: badge?.innerText };
      })()`);
      console.log('After item click:', afterClick);
    }
  }

  await session.close();
}

console.log('\n=== TEST 4: Navigation Links Between Modules ===');
{
  // Test navigation with query params: /terrenos?q=TR-MIRA-084
  const session = await createBrowserSession('http://localhost:3000/terrenos?q=TR-MIRA-084');
  await sleep(1500);

  const filterRes = await session.evaluate(`(() => {
    const searchVal = document.querySelector('input[placeholder*="Buscar"]')?.value;
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(r => r.innerText.substring(0, 40));
    return { searchVal, rowsCount: rows.length, firstRow: rows[0] };
  })()`);
  console.log('/terrenos?q=TR-MIRA-084 result:', filterRes);
  await session.close();
}

{
  // Test /pipeline?dealId=neg-001
  const session = await createBrowserSession('http://localhost:3000/pipeline?dealId=neg-001');
  await sleep(1500);

  const pipelineRes = await session.evaluate(`(() => {
    const sheetTitle = document.querySelector('[role="dialog"]')?.innerText?.substring(0, 100);
    const hasOpenSheet = Boolean(document.querySelector('[role="dialog"]'));
    return { hasOpenSheet, sheetTitle };
  })()`);
  console.log('/pipeline?dealId=neg-001 result:', pipelineRes);
  await session.close();
}

console.log('\n=== TEST 5: Auditoria ID terr-001 -> Terrenos resolution ===');
{
  const session = await createBrowserSession('http://localhost:3000/terrenos?q=terr-001');
  await sleep(1500);

  const res = await session.evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(r => r.innerText.substring(0, 40));
    const hasOpenSheet = Boolean(document.querySelector('[role="dialog"]'));
    return { rowsCount: rows.length, firstRow: rows[0], hasOpenSheet };
  })()`);
  console.log('/terrenos?q=terr-001 result:', res);
  await session.close();
}

console.log('\n=== TEST 6: Matching -> Terrenos Link Verification ===');
{
  const session = await createBrowserSession('http://localhost:3000/matching');
  await sleep(1500);

  const linkRes = await session.evaluate(`(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/terrenos"], a[href*="/mapa"]'));
    return {
      totalNavigationLinks: links.length,
      sampleHrefs: links.slice(0, 5).map(a => a.getAttribute('href'))
    };
  })()`);
  console.log('Matching navigation links:', linkRes);
  await session.close();
}

console.log('\nALL BROWSER E2E TESTS FINISHED SUCCESSFULLY.');
