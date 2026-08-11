/**
 * True full-page screenshot via Chrome DevTools Protocol (captureBeyondViewport).
 * Handles h-screen heroes correctly (viewport stays normal; capture spans full scroll height).
 * Usage: node fullshot.js <url> <outfile.png> [width]
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');

const URL = process.argv[2] || 'http://localhost:3000/en';
const OUT = process.argv[3] || 'fullpage.png';
const WIDTH = parseInt(process.argv[4] || '1440', 10);
const PORT = 9333;

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
const CHROME = CHROME_CANDIDATES.find((c) => fs.existsSync(c));
if (!CHROME) { console.error('No Chrome found'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(ws, id, method, params) {
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id === id) { ws.removeEventListener('message', onMsg); resolve(m.result); }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params: params || {} }));
    setTimeout(() => reject(new Error('CDP timeout ' + method)), 30000);
  });
}

(async () => {
  const child = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, '--disable-gpu',
    '--hide-scrollbars', '--no-first-run', '--user-data-dir=/tmp/fullshot-profile', 'about:blank',
  ], { detached: true, stdio: 'ignore' });

  // wait for debugger endpoint
  let wsUrl;
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) { wsUrl = page.webSocketDebuggerUrl; break; }
    } catch (e) { /* not up yet */ }
    await sleep(250);
  }
  if (!wsUrl) { console.error('debugger not reachable'); child.kill(); process.exit(1); }

  const ws = new WebSocket(wsUrl);
  await new Promise((res) => { ws.addEventListener('open', res, { once: true }); });

  let id = 1;
  await cdp(ws, id++, 'Page.enable');
  await cdp(ws, id++, 'Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp(ws, id++, 'Page.navigate', { url: URL });
  await sleep(4000);
  // scroll to bottom to trigger lazy content, then back to top
  await cdp(ws, id++, 'Runtime.evaluate', { expression: 'for(let y=0;y<document.body.scrollHeight;y+=700)window.scrollTo(0,y);window.scrollTo(0,0);' });
  await sleep(2500);
  const res = await cdp(ws, id++, 'Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(OUT, Buffer.from(res.data, 'base64'));
  const { size } = fs.statSync(OUT);
  console.log(`✓ ${OUT} (${Math.round(size / 1024)} KB)`);
  ws.close();
  try { process.kill(-child.pid); } catch (e) { child.kill(); }
  process.exit(0);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
