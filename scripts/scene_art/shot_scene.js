const { spawn } = require('child_process'); const fs=require('fs'),os=require('os'),path=require('path');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const profile=fs.mkdtempSync(path.join(os.tmpdir(),'shot-'));
const port=9335; const proc=spawn(chrome,['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+profile,'--window-size='+(process.argv[3]||'1180,1000'),'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const out=process.argv[2];
(async()=>{let ws,id=0;const pend=new Map();
for(let i=0;i<50;i++){try{const l=await (await fetch('http://127.0.0.1:'+port+'/json')).json();const p=l.find(t=>t.type==='page');if(p){ws=new WebSocket(p.webSocketDebuggerUrl);await new Promise((a,b)=>{ws.onopen=a;ws.onerror=b});break}}catch(e){}await sleep(200)}
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id)}if(d.method==='Runtime.exceptionThrown'||d.method==='Log.entryAdded')console.log(JSON.stringify(d.params).slice(0,300))};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');await send('Log.enable'); await send('Page.navigate',{url:'http://localhost:8791/index.html?v='+Date.now()}); await sleep(2500);
const jobs=[['regular_myeongnyang',0,'a'],['regular_myeongnyang',3,'b'],['regular_joseon_folk',0,'c']];
for(const [mud,stage,tag] of jobs){
 await ev(`window.MudEngine.openMUD('${mud}')`); await sleep(1200);
 if(stage) await ev(`window.MudEngine.renderStage('${stage}')`); await sleep(1500);
 const info=await ev(`JSON.stringify({scene:window.MudEngine.currentSimulator?.scene,stage:window.MudEngine.currentStage})`);
 console.log(tag,info);
 const r=await ev(`(()=>{const r=document.getElementById('mn-canvas').getBoundingClientRect();return JSON.stringify([r.x,r.y,r.width,r.height])})()`);
 const [x,y,w,h]=JSON.parse(r);
 const clicks=await ev(`(()=>{const c=document.getElementById('mn-canvas');const r=c.getBoundingClientRect();const hs=window.MudEngine.currentSimulator.hotspots;hs.forEach(h=>window.MudSimulators.handleCanvasTouch(r.left+h.x*r.width,r.top+h.y*r.height));return JSON.stringify({found:window.MudEngine.simulatorState.found,n:hs.length})})()`);
 console.log(tag,'clicks',clicks); await sleep(500);
 const s=await send('Page.captureScreenshot',{format:'png',clip:{x,y,width:w,height:h,scale:2}}); fs.writeFileSync(out+'/scene_'+tag+'.png',Buffer.from(s.result.data,'base64'));
}
proc.kill(); process.exit(0);})();
