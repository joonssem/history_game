// 한지 채색화풍 장면 SVG 생성기 (인물 없음). 사용: node scratch/gen_scene_art.js  → assets/scenes/<scene-id>.svg
// 480×230 viewBox는 시뮬레이터 캔버스(약 2.09:1)와 같다. 핫스팟 원·라벨은 캔버스가 그리므로 SVG에는 넣지 않는다.
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets', 'scenes');
fs.mkdirSync(OUT, { recursive: true });
const W = 480, H = 230;
const INK = '#2a1d14';

const open = (id, label, sky1, sky2) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.25  0 0 0 0.16 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="wash"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.08" numOctaves="3" seed="7" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="6"/></filter>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c8190"/><stop offset="1" stop-color="#3f6577"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
`;
const close = `<rect width="${W}" height="${H}" fill="#fff" filter="url(#paper)"/>
</svg>
`;

const mountains = (y) => `<g filter="url(#wash)">
<path d="M0 ${y} L60 ${y - 40} L110 ${y - 14} L170 ${y - 52} L230 ${y - 12} L0 ${y - 12} Z" fill="#95a28f" opacity=".85"/>
<path d="M250 ${y - 6} L320 ${y - 48} L380 ${y - 18} L430 ${y - 56} L480 ${y - 22} L480 ${y} Z" fill="#95a28f" opacity=".85"/>
<path d="M0 ${y + 8} L70 ${y - 24} L140 ${y + 2} L200 ${y - 18} L260 ${y + 6} L0 ${y + 12} Z" fill="#7b8c78"/>
<path d="M230 ${y + 8} L300 ${y - 20} L370 ${y + 4} L440 ${y - 26} L480 ${y - 6} L480 ${y + 12} L230 ${y + 12} Z" fill="#7b8c78"/></g>
`;
const sea = (y) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="url(#sea)"/>
`;
const ripples = (y0, n, seed = 0) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const yy = y0 + i * 7, xx = ((i + seed) * 67) % 380 + 20;
    s += `<path d="M${xx} ${yy} q10 -4 20 0 t20 0 t20 0" fill="none" stroke="#d7e4e4" stroke-width="1.6" opacity=".55"/>\n`;
  }
  return s;
};
const panokseon = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round">
<path d="M-46 0 L46 0 L38 14 L-36 14 Z" fill="#6b4a30"/><rect x="-40" y="-8" width="80" height="8" fill="#8a6444"/><rect x="-24" y="-24" width="48" height="16" fill="#8a6444"/>
<path d="M-30 -24 L0 -36 L30 -24 Z" fill="#3e4a42"/><line x1="0" y1="-36" x2="0" y2="-52" stroke-width="2"/>
<path d="M0 -52 L18 -48 L0 -44 Z" fill="#c0392b" stroke="none"/>
<g stroke="none" fill="${INK}"><circle cx="-32" cy="-3.5" r="2.2"/><circle cx="-20" cy="-3.5" r="2.2"/><circle cx="20" cy="-3.5" r="2.2"/><circle cx="32" cy="-3.5" r="2.2"/></g></g>
`;
const wae = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#1b1b1b" stroke-width="1.2" stroke-linejoin="round">
<path d="M-34 0 L34 0 L28 11 L-28 11 Z" fill="#3b3a38"/><rect x="-18" y="-13" width="36" height="13" fill="#5a5047"/>
<line x1="0" y1="-13" x2="0" y2="-30" stroke-width="1.6"/><rect x="0" y="-30" width="14" height="9" fill="#e8e2d2" stroke-width=".8"/></g>
`;

const scenes = {};

// 울돌목(명량): 위쪽(북)이 해남, 아래쪽이 진도. 두 땅 사이 좁고 긴 물목에 소용돌이. 서쪽(왼쪽) 출구에 판옥선 13척, 동쪽(오른쪽)에서 많은 왜선이 들어온다.
scenes['namhae-suguninmul'] = () => {
  const top = 'M0 0 H480 V40 C455 60 440 100 420 100 H150 C120 100 80 50 0 30 Z';
  const bot = 'M0 230 V210 C70 200 120 170 150 170 H420 C440 170 455 200 480 215 V230 Z';
  const hills = [[200, 70], [250, 60], [300, 72], [350, 62], [400, 76]].map(([x, y]) => `<path d="M${x - 26} ${y + 14} L${x} ${y - 12} L${x + 26} ${y + 14} Z" fill="#7b8c68" opacity=".8"/>`).join('')
    + [[210, 196], [290, 190], [370, 198]].map(([x, y]) => `<path d="M${x - 24} ${y + 12} L${x} ${y - 10} L${x + 24} ${y + 12} Z" fill="#7b8c68" opacity=".8"/>`).join('');
  const joseon = [[20, 70], [50, 70], [80, 72], [15, 96], [45, 96], [20, 130], [45, 130], [20, 160], [50, 160], [80, 162], [112, 160], [30, 186], [62, 186]];
  const japan = [[300, 128], [326, 150], [352, 126], [378, 152], [404, 128], [430, 150], [440, 110], [456, 132], [466, 160], [448, 184], [470, 92], [462, 72], [470, 196]];
  return open('', '해남과 진도 사이 좁은 울돌목, 서쪽 출구의 판옥선 13척과 동쪽에서 몰려오는 왜선', '#5c8190', '#4b7183')
    + sea(0) + ripples(112, 7, 2)
    + `<path d="${top}" fill="#b4ab82" stroke="${INK}" stroke-width="1.2"/><path d="${bot}" fill="#b4ab82" stroke="${INK}" stroke-width="1.2"/>` + hills
    + `<text x="300" y="30" font-size="12" text-anchor="middle" fill="${INK}" font-family="Noto Serif KR,Batang,serif">해남</text><text x="300" y="222" font-size="12" text-anchor="middle" fill="${INK}" font-family="Noto Serif KR,Batang,serif">진도</text>`
    + `<g fill="none" stroke="#e6efee" opacity=".8" stroke-width="1.8" transform="translate(240 150)"><ellipse rx="30" ry="9"/><ellipse rx="19" ry="5.5"/><ellipse rx="9" ry="2.6"/></g>`
    + joseon.map(([x, y]) => panokseon(x, y, 0.3)).join('') + japan.map(([x, y]) => wae(x, y, 0.42)).join('')
    + close;
};

// 한산도 학익진: 판옥선이 학의 날개처럼 반원으로 벌려 오목한 안쪽에 왜선을 감싼다. 오른쪽 끝 배에서 화포 연기.
scenes['hansando-hakikjin'] = () => {
  const q = (t) => [70 * (1 - t) ** 2 + 480 * t * (1 - t) + 410 * t * t, 112 * (1 - t) ** 2 + 520 * t * (1 - t) + 112 * t * t];
  return open('', '반원으로 벌린 판옥선 대형 안쪽에 왜선이 갇혀 있고, 끝의 배에서 화포를 쏘는 한산도 바다', '#e4dcc4', '#d4cbb0')
    + mountains(70) + sea(70) + ripples(84, 20, 3)
    + `<path d="M70 112 Q240 260 410 112" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="5 5" opacity=".4"/>`
    + [[195, 98], [240, 92], [285, 100]].map(([x, y]) => wae(x, y, 0.5)).join('')
    + [0, 0.2, 0.5, 0.8, 1].map(t => panokseon(...q(t), 0.55)).join('')
    + `<g fill="#e8e4da" stroke="#9a958a" stroke-width="1" opacity=".9"><circle cx="384" cy="102" r="7"/><circle cx="372" cy="98" r="5"/><circle cx="96" cy="102" r="7"/><circle cx="108" cy="98" r="5"/></g>`
    + close;
};

// 김홍도 화실: 걸린 그림, 책상 위 펼친 그림, 붓·벼루, 병풍(인물 없음)
scenes['kim-hongdo-studio'] = () => open('', '붓과 벼루, 걸린 그림과 병풍이 있는 조선 후기 화실 장면', '#efe4cc', '#e4d6b4')
  + `<rect y="170" width="${W}" height="60" fill="#b99a66"/><path d="M0 170 H480" stroke="${INK}" stroke-width="1.2" opacity=".5"/>`
  + `<g stroke="#8a7355" stroke-width="2" opacity=".5">${[0, 60, 120, 180, 240, 300, 360, 420].map(x => `<path d="M${x} 24 V170"/>`).join('')}</g>`
  // 걸린 그림(초가지붕·나무·담)
  + `<g transform="translate(66 42)"><path d="M0 0 V90" stroke="#8a5a35" stroke-width="3"/><rect x="0" y="6" width="80" height="86" fill="#f7f1de" stroke="#8a5a35" stroke-width="3"/>
<g stroke="${INK}" stroke-width="1.4" fill="none"><path d="M10 76 H70"/><path d="M14 76 V60 L38 44 L62 60 V76" fill="#d9c38a"/><path d="M60 76 V50"/><circle cx="60" cy="44" r="9" fill="#7a8a3c" stroke="none"/></g></g>`
  // 병풍
  + `<g transform="translate(350 52)" stroke="#5c4a34" stroke-width="2.4">${[0, 36, 72].map((x, i) => `<path d="M${x} 6 L${x + 36} ${i % 2 ? 6 : 0} V100 H${x} Z" fill="${i % 2 ? '#e8dcba' : '#efe5c8'}"/>`).join('')}
<g stroke="#8a7355" stroke-width="1.4" fill="none"><path d="M10 80 q12 -30 24 0"/><path d="M48 40 q10 14 24 4"/><path d="M84 70 q10 -22 22 0"/></g></g>`
  // 책상과 펼친 그림
  + `<rect x="150" y="146" width="180" height="14" fill="#6b4a30" stroke="${INK}" stroke-width="1.4"/><path d="M162 160 V204 M318 160 V204" stroke="${INK}" stroke-width="5"/>`
  + `<path d="M168 118 L312 118 L324 146 L156 146 Z" fill="#f7f1de" stroke="#8a7355" stroke-width="2"/>`
  + `<g stroke="${INK}" stroke-width="1.4" fill="none"><path d="M196 138 H284"/><path d="M200 138 V126 L220 116 L240 126 V138" fill="#d9c38a"/><path d="M262 138 V122"/><circle cx="262" cy="118" r="8" fill="#7a8a3c" stroke="none"/></g>`
  + `<g transform="translate(166 122)"><rect x="0" y="12" width="22" height="12" rx="2" fill="#2a1d14"/><path d="M4 12 L16 -6" stroke="#8a5a35" stroke-width="3"/><path d="M16 -6 l3 -9" stroke="#2a1d14" stroke-width="3"/></g>`
  + `<g transform="translate(400 172)"><rect x="0" y="0" width="30" height="8" rx="3" fill="#e8dcba" stroke="#8a7355" stroke-width="1.4"/><rect x="2" y="9" width="30" height="8" rx="3" fill="#efe5c8" stroke="#8a7355" stroke-width="1.4"/></g>`
  + close;

const hp = { open, close, mountains, sea, ripples, panokseon, INK, W, H };
const U2 = require('./gen_scene_art_unit2')(scenes, hp);
require('./gen_scene_art_unit13')(scenes, hp, U2);
require('./gen_scene_art_paleo')(scenes, hp, U2);

for (const [id, fn] of Object.entries(scenes)) {
  fs.writeFileSync(path.join(OUT, id + '.svg'), fn());
  console.log('wrote', id + '.svg');
}
