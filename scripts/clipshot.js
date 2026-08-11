// Capture a clip around an element matching text, at desktop width, via CDP.
// Usage: node clipshot.js <url> <outfile> <matchText> [width]
const { spawn } = require('child_process');
const fs = require('fs');
const URL = process.argv[2], OUT = process.argv[3], MATCH = process.argv[4] || 'SUMMER DEALS', WIDTH = parseInt(process.argv[5] || '1440', 10);
const PORT = 9334;
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Chromium.app/Contents/MacOS/Chromium'].find(c=>fs.existsSync(c));
const sleep = ms => new Promise(r=>setTimeout(r,ms));
async function cdp(ws,id,method,params){return new Promise((res,rej)=>{const on=e=>{const m=JSON.parse(e.data);if(m.id===id){ws.removeEventListener('message',on);res(m.result);}};ws.addEventListener('message',on);ws.send(JSON.stringify({id,method,params:params||{}}));setTimeout(()=>rej(new Error('timeout '+method)),30000);});}
(async()=>{
  const child = spawn(CHROME,['--headless=new',`--remote-debugging-port=${PORT}`,'--disable-gpu','--hide-scrollbars','--no-first-run','--user-data-dir=/tmp/clipshot-profile','about:blank'],{detached:true,stdio:'ignore'});
  let wsUrl;
  for(let i=0;i<40;i++){try{const l=await(await fetch(`http://localhost:${PORT}/json`)).json();const p=l.find(t=>t.type==='page');if(p&&p.webSocketDebuggerUrl){wsUrl=p.webSocketDebuggerUrl;break;}}catch(e){}await sleep(250);}
  const ws=new WebSocket(wsUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=1;
  await cdp(ws,id++,'Page.enable');
  await cdp(ws,id++,'Emulation.setDeviceMetricsOverride',{width:WIDTH,height:1000,deviceScaleFactor:1,mobile:false});
  await cdp(ws,id++,'Page.navigate',{url:URL});
  await sleep(4500);
  const rectRes = await cdp(ws,id++,'Runtime.evaluate',{expression:`(()=>{const el=Array.from(document.querySelectorAll('h2')).find(x=>x.textContent.trim().includes(${JSON.stringify(MATCH)}));if(!el)return null;const row=el.closest('div[class*="flex-row"]')||el.closest('div[class*="justify-center"]')||el.parentElement.parentElement.parentElement;const r=row.getBoundingClientRect();return JSON.stringify({x:Math.max(0,r.left),y:r.top+window.scrollY,w:r.width,h:r.height});})()`,returnByValue:true});
  const rect = rectRes.result.value ? JSON.parse(rectRes.result.value) : {x:0,y:0,w:WIDTH,h:1000};
  const res = await cdp(ws,id++,'Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:rect.x,y:rect.y,width:Math.min(rect.w,WIDTH),height:rect.h,scale:1}});
  fs.writeFileSync(OUT,Buffer.from(res.data,'base64'));
  console.log(`✓ ${OUT} clip=${JSON.stringify(rect)}`);
  ws.close(); try{process.kill(-child.pid);}catch(e){child.kill();} process.exit(0);
})().catch(e=>{console.error('ERR',e.message);process.exit(1);});
