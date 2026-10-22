const fs=require('fs');let s=fs.readFileSync('js/sceneArt.js','utf8');
const ids=fs.readdirSync('assets/scenes').filter(f=>f.endsWith('.svg')).map(f=>f.slice(0,-4)).sort();
const body=ids.map(i=>`    '${i}'`).join(',\n');
s=s.replace(/available: new Set\(\[[\s\S]*?\n  \]\),/,`available: new Set([\n${body}\n  ]),`);
fs.writeFileSync('js/sceneArt.js',s);console.log(ids.length);
