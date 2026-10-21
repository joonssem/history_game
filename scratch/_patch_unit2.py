p='scratch/gen_scene_art.js'
s=open(p,encoding='utf-8').read()
i=s.index('// 남해 수군통제사'); j=s.index('// 김홍도 화실')
new=r"""// 울돌목(명량): 위쪽(북)이 해남, 아래쪽이 진도. 두 땅 사이 좁고 긴 물목에 소용돌이. 서쪽(왼쪽) 출구에 판옥선 13척, 동쪽(오른쪽)에서 많은 왜선이 들어온다.
scenes['namhae-suguninmul'] = () => {
  const top = 'M0 0 H480 V40 C455 60 440 100 420 100 H150 C120 100 80 50 0 30 Z';
  const bot = 'M0 230 V210 C70 200 120 170 150 170 H420 C440 170 455 200 480 215 V230 Z';
  const hills = [[200, 70], [250, 60], [300, 72], [350, 62], [400, 76]].map(([x, y]) => `<path d="M${x - 26} ${y + 14} L${x} ${y - 12} L${x + 26} ${y + 14} Z" fill="#7b8c68" opacity=".8"/>`).join('')
    + [[210, 196], [290, 190], [370, 198]].map(([x, y]) => `<path d="M${x - 24} ${y + 12} L${x} ${y - 10} L${x + 24} ${y + 12} Z" fill="#7b8c68" opacity=".8"/>`).join('');
  const joseon = [[20, 70], [50, 70], [80, 72], [15, 96], [45, 96], [20, 130], [45, 130], [20, 160], [50, 160], [80, 162], [112, 160], [30, 186], [62, 186]];
  const japan = [[300, 128], [326, 150], [352, 126], [378, 152], [404, 128], [430, 150], [440, 110], [456, 132], [466, 160], [448, 184], [470, 92], [425, 76], [472, 200]];
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

"""
s=s[:i]+new+s[j:]
open(p,'w',encoding='utf-8').write(s)
