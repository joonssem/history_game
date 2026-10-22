const { spawn } = require('child_process'); const fs=require('fs'),os=require('os'),path=require('path');
const [mud,stage,out]=process.argv.slice(2);
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const profile=fs.mkdtempSync(path.join(os.tmpdir(),'s-'));
const port=9337; const proc=spawn(chrome,['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+profile,'--window-size=1180,1000','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{let ws,id=0;const pend=new Map();
for(let i=0;i<50;i++){try{const l=await (await fetch('http://127.0.0.1:'+port+'/json')).json();const p=l.find(t=>t.type==='page');if(p){ws=new WebSocket(p.webSocketDebuggerUrl);await new Promise((a,b)=>{ws.onopen=a;ws.onerror=b});break}}catch(e){}await sleep(200)}
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id)}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true})).result?.result?.value;
await send('Page.enable'); await send('Page.navigate',{url:'http://localhost:8791/index.html?v='+Date.now()}); await sleep(2500);
await ev(`window.MudEngine.openMUD('${mud}')`); await sleep(1000); await ev(`window.MudEngine.renderStage('${stage}')`); await sleep(1500);
const r=JSON.parse(await ev(`(()=>{const r=document.getElementById('mn-canvas').getBoundingClientRect();return JSON.stringify([r.x,r.y,r.width,r.height])})()`));
const s=await send('Page.captureScreenshot',{format:'png',clip:{x:r[0],y:r[1],width:r[2],height:r[3],scale:2}}); fs.writeFileSync(out,Buffer.from(s.result.data,'base64'));
proc.kill();process.exit(0);})();
