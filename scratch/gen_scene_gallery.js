// 장면 점검판 생성: 정규 MUD 전체(1~3단원)의 장면 SVG와 핫스팟을 한 페이지에 모은다. 사용: node scratch/gen_scene_gallery.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const out = path.join(root, 'docs/prototypes/scene_gallery.html');
const old = fs.readFileSync(out, 'utf8').split('\n');
const style = old[1];
const idx = JSON.parse(fs.readFileSync(path.join(root, 'data/mud/_index.json'), 'utf8'));
const svgs = new Set(fs.readdirSync(path.join(root, 'assets/scenes')).map(f => f.replace(/\.svg$/, '')));
const done = new Set(); let total = 0; const secs = [];
for (const unit of [1, 2, 3]) {
  for (const md of idx.muds.filter(x => x.tier === 'regular' && x.unitId === unit)) {
    const d = JSON.parse(fs.readFileSync(path.join(root, 'data/mud', md.file), 'utf8'));
    const cand = new Map();
    (function w(o) { if (o && typeof o === 'object') { if (typeof o.scene === 'string' && svgs.has(o.scene) && !(cand.has(o.scene) && cand.get(o.scene).n >= (o.hotspots || []).length)) { const hs = (o.hotspots || []).map(h => `<i class="r" style="left:${h.x * 100}%;top:${h.y * 100}%"></i><b class="p" style="left:${h.x * 100}%;top:${h.y * 100}%">${h.label}</b>`).join(''); cand.set(o.scene, { n: (o.hotspots || []).length, f: `<figure><div class="s"><img src="../../assets/scenes/${o.scene}.svg" alt="">${hs}</div><figcaption>${o.scene}</figcaption></figure>` }); } for (const k in o) w(o[k]); } })(d);
    const figs = [...cand.values()].map(c => c.f);
    if (!figs.length) continue;
    secs.push(`<h2>${unit}단원 · ${md.title.split(':')[0]} <small>${md.mudId}</small></h2><div class="g">${figs.join('')}</div>`);
    figs.forEach(() => total++);
  }
}
const html = `${old[0]}\n${style}\n<h1>장면 그림 점검판 (정규 MUD 1~3단원, ${total}장면 표시)</h1><p>실제 앱의 핫스팟 위치(원)와 라벨을 겹쳐 보여 줍니다. 그림이 교과서 소재와 맞는지 확인하는 용도입니다. 고칠 장면은 장면 이름(그림 아래 영문)과 함께 알려 주세요.</p>\n<label><input type="checkbox" id="t" checked> 핫스팟 표시</label>\n${secs.join('')}</main><script>document.getElementById('t').onchange=function(e){document.querySelectorAll('.r,.p').forEach(function(x){x.style.display=e.target.checked?'':'none'})}</script></body></html>\n`;
fs.writeFileSync(out, html); console.log('sections', secs.length, 'figures', total);
