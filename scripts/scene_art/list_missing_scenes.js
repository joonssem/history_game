const fs=require('fs');const dir='data/mud';const art=new Set(fs.readFileSync('js/sceneArt.js','utf8').match(/'[a-z0-9-]+'(?=,|\s*\n\s*\]\))/g).map(s=>s.slice(1,-1)));
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.json'))){const d=JSON.parse(fs.readFileSync(dir+'/'+f,'utf8'));const out=[];
 const walk=(o,p)=>{if(o&&typeof o==='object'){if(typeof o.scene==='string')out.push(o.scene+(o.type?'('+o.type+')':''));for(const k in o)walk(o[k])}};walk(d);
 const u=[...new Set(out)];console.log(f,u.length,u.filter(x=>!art.has(x.split('(')[0])).join(' '));}
