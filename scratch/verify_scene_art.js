// 2단원 정규 MUD 전 단계: SVG 장면이 그려지는지, 핫스팟을 모두 누르면 완료되는지, 콘솔 오류가 없는지 확인한다.
// 사용: node scratch/verify_scene_art.js <창 크기 예: 820,1180>
const { spawn } = require('child_process'); const fs=require('fs'),os=require('os'),path=require('path');
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe'; const profile=fs.mkdtempSync(path.join(os.tmpdir(),'v-'));
const port=9336; const proc=spawn(chrome,['--headless=new','--remote-debugging-port='+port,'--user-data-dir='+profile,'--window-size='+(process.argv[2]||'820,1180'),'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{let ws,id=0;const pend=new Map();const errs=[];
for(let i=0;i<50;i++){try{const l=await (await fetch('http://127.0.0.1:'+port+'/json')).json();const p=l.find(t=>t.type==='page');if(p){ws=new WebSocket(p.webSocketDebuggerUrl);await new Promise((a,b)=>{ws.onopen=a;ws.onerror=b});break}}catch(e){}await sleep(200)}
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d);pend.delete(d.id)}
 if(d.method==='Runtime.exceptionThrown')errs.push(JSON.stringify(d.params.exceptionDetails).slice(0,200));
 if(d.method==='Log.entryAdded'&&d.params.entry.level==='error')errs.push(d.params.entry.text+' '+(d.params.entry.url||''))};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true})).result?.result?.value;
await send('Page.enable');await send('Runtime.enable');await send('Log.enable');
await send('Page.navigate',{url:'http://localhost:8791/index.html?v='+Date.now()}); await sleep(2500);
const muds=['joseon_founding','myeongnyang','joseon_economy','joseon_silhak','sejong','joseon_folk','modern_open','joseon_status','joseon_diplomacy'];
let ok=0,bad=[];
for(const mud of muds){
 await ev(`window.MudEngine.openMUD('regular_${mud}')`); await sleep(900);
 const stages=JSON.parse(await ev(`JSON.stringify(Object.keys(window.MudEngine.currentMudData.stages))`));
 for(const sid of stages){
  await ev(`window.MudEngine.renderStage('${sid}')`); await sleep(900);
  const r=JSON.parse(await ev(`(()=>{const s=window.MudEngine.currentSimulator||{};const c=document.getElementById('mn-canvas');
    if(!s.scene||!c) return JSON.stringify({scene:s.scene||null});
    const art=window.SceneArt.available.has(s.scene);const ready=window.SceneArt.has(s.scene);
    const hs=s.hotspots||[];let found=null;
    if(hs.length&&window.MudEngine.simulatorState&&Array.isArray(window.MudEngine.simulatorState.found)){const rc=c.getBoundingClientRect();
      hs.forEach(h=>window.MudSimulators.handleCanvasTouch(rc.left+h.x*rc.width,rc.top+h.y*rc.height));found=window.MudEngine.simulatorState.found.length}
    return JSON.stringify({scene:s.scene,art,ready,n:hs.length,found})})()`));
  if(!r.scene) continue;
  const good = r.art ? (r.ready && (r.n===0 || r.found===r.n)) : true;
  if(good){ok++} else bad.push(mud+':'+sid+' '+JSON.stringify(r));
  if(r.art===false) bad.push('(no art) '+mud+':'+sid+' '+r.scene);
 }
}
console.log('ok scenes:',ok,'\nproblems:',bad.length?bad.join('\n'):'none','\nconsole errors:',errs.filter(e=>!/AudioContext/.test(e)).length?errs.filter(e=>!/AudioContext/.test(e)).join('\n'):'none');
proc.kill();process.exit(0);})();
