// 2단원 나머지 장면(사물·배경만, 인물 없음). gen_scene_art.js가 불러 쓴다.
// 핫스팟 기준 위치(480×230): 왼쪽 링 (106,110), 가운데 링 (240,150), 오른쪽 링 (374,110). 라벨 알약은 링 아래 19px라서
// 소품은 링 위쪽(왼·오른 y≈78, 가운데 y≈112)에 두고 알약 자리는 비워 둔다.
module.exports = function (scenes, h) {
  const { open, close, mountains, sea, ripples, panokseon, INK, W, H } = h;
  const L = [106, 80], C = [240, 112], R = [374, 80];
  const L2 = [96, 80], R2 = [384, 80];
  const st = `stroke="${INK}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;
  const T = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})" ${st}>${inner}</g>\n`;
  const font = 'font-family="Noto Serif KR,Batang,serif"';

  // ---------- 한옥 지붕·단청 헬퍼 ----------
  // 처마 끝이 위로 들린 기와지붕. a=처마 반폭, t=지붕 높이, r=용마루 반폭. 아랫면이 y≈+4, 용마루가 y=-t.
  const roof = (a, t, r, fill = '#3e4a42') => `<path d="M${-r} ${-t} H${r} Q${a * 0.62} ${-t * 0.15} ${a + 7} -5 Q${a + 2} 3 ${a - 8} 4 H${-a + 8} Q${-a - 2} 3 ${-a - 7} -5 Q${-a * 0.62} ${-t * 0.15} ${-r} ${-t} Z" fill="${fill}"/>`
    + `<path d="M${-r - 2} ${-t + 2} H${r + 2}" stroke="#1d2420" stroke-width="2.6"/><path d="M${-r - 3} ${-t - 3} v5 M${r + 3} ${-t - 3} v5" stroke="#1d2420" stroke-width="2.2"/>`
    + `<g stroke="#232c27" stroke-width=".8" opacity=".75">${[-0.85, -0.55, -0.25, 0.05, 0.35, 0.65, 0.9].map(q => `<path d="M${q * r} ${-t + 4} L${q * (a - 4)} 2"/>`).join('')}</g>`;
  // 처마 밑 단청 띠
  const dancheong = (w, y, h = 5) => `<rect x="${-w}" y="${y}" width="${w * 2}" height="${h}" fill="#2f6b5a" stroke-width="1"/>`
    + `<g stroke-width=".5">${Array.from({ length: Math.floor(w / 3) }, (_, i) => `<rect x="${-w + 1 + i * 6}" y="${y + 1}" width="4" height="${h - 2}" fill="${['#c0392b', '#e0b84a', '#4f7fa0'][i % 3]}"/>`).join('')}</g>`;
  // 기둥과 창살. 기둥은 n+1개
  const bays = (w, y0, y1, n, col = '#a83a2a', wall = '#d9c38a') => `<rect x="${-w}" y="${y0}" width="${w * 2}" height="${y1 - y0}" fill="${wall}"/>`
    + `<g stroke="#8a7355" stroke-width=".7" opacity=".7">${Array.from({ length: n * 3 + 1 }, (_, i) => `<path d="M${-w + i * (w * 2 / (n * 3))} ${y0} V${y1}"/>`).join('')}<path d="M${-w} ${(y0 + y1) / 2} H${w}"/></g>`
    + `<g stroke="${col}" stroke-width="3.2">${Array.from({ length: n + 1 }, (_, i) => `<path d="M${-w + i * (w * 2 / n)} ${y0} V${y1}"/>`).join('')}</g>`;
  const stoneBase = (w, y, h = 6) => `<rect x="${-w}" y="${y}" width="${w * 2}" height="${h}" fill="#c9c0aa"/><path d="M${-w} ${y + h / 2} H${w}" stroke-width=".8" opacity=".6"/>${Array.from({ length: Math.floor(w / 9) }, (_, i) => `<path d="M${-w + 6 + i * 18} ${y} v${h}" stroke-width=".7" opacity=".5"/>`).join('')}`;

  // ---------- 배경 ----------
  const outdoor = (a = '#e4dcc4', b = '#d4cbb0', ground = '#9fb07a') => open('', '', a, b) + mountains(116)
    + `<rect x="0" y="116" width="${W}" height="${H - 116}" fill="${ground}"/><g filter="url(#wash)" opacity=".35"><path d="M0 150 Q120 134 240 152 T480 146 V230 H0 Z" fill="#7b8c68"/></g>\n`;
  const river = (a, b) => outdoor(a, b) + `<path d="M150 116 C190 150 130 176 210 230 L300 230 C240 180 300 150 210 116 Z" fill="#6e9aa6"/><g fill="none" stroke="#d9e8e6" stroke-width="1.6" opacity=".7"><path d="M190 150 q8 -4 16 0 t16 0"/><path d="M200 184 q8 -4 16 0 t16 0"/></g>\n`;
  const room = () => open('', '', '#efe4cc', '#e4d6b4') + `<rect y="176" width="${W}" height="54" fill="#b99a66"/><path d="M0 176 H480" stroke="${INK}" stroke-width="1.2" opacity=".5"/>`
    + `<g stroke="#8a7355" stroke-width="2" opacity=".45">${[0, 60, 120, 180, 240, 300, 360, 420].map(x => `<path d="M${x} 24 V176"/>`).join('')}</g>\n`;
  const courtyard = () => open('', '', '#dfe6e4', '#efe6cd') + `<g opacity=".8" ${st}><path d="M0 98 L60 80 L120 98 Z" fill="#6b7a70"/><rect x="0" y="98" width="130" height="22" fill="#a8613f"/><path d="M350 98 L420 76 L480 98 Z" fill="#6b7a70"/><rect x="350" y="98" width="130" height="22" fill="#a8613f"/></g>`
    + `<rect y="120" width="${W}" height="110" fill="#b9ab90"/><g stroke="#8d8068" stroke-width="1.2" opacity=".5">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0 ${128 + i * 20} H480"/>`).join('')}${[40, 120, 200, 280, 360, 440].map(x => `<path d="M${x} 120 L${x < 240 ? x - 50 : x + 50} 230"/>`).join('')}</g>\n`;
  const palaceYard = () => open('', '', '#dfe6e4', '#efe6cd') + mountains(98).replace('<g filter="url(#wash)">', '<g filter="url(#wash)" opacity=".55">')
    + `<g opacity=".55" ${st}><g transform="translate(120 104) scale(1.1 .8)">${roof(130, 10, 90)}</g><g transform="translate(370 104) scale(1.1 .8)">${roof(130, 10, 90)}</g></g>`
    + `<rect y="116" width="${W}" height="114" fill="#b9ab90"/><path d="M200 116 H280 L330 230 H150 Z" fill="#cfc5ab"/><g stroke="#8d8068" stroke-width="1.2" opacity=".5">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0 ${124 + i * 20} H480"/>`).join('')}${[40, 120, 200, 280, 360, 440].map(x => `<path d="M${x} 116 L${x < 240 ? x - 50 : x + 50} 230"/>`).join('')}</g>\n`;
  // 근대 거리: 서양식 벽돌 건물이 이어진 거리와 전차 선로
  const modernStreet = () => open('', '', '#dfe6ea', '#ece6d2')
    + `<g ${st}>${[[0, 56, 96, '#b4644a'], [96, 44, 84, '#c9b98c'], [180, 62, 100, '#b4644a'], [280, 48, 90, '#a9b0b4'], [370, 58, 110, '#b4644a']].map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${128 - y}" fill="${c}"/><rect x="${x}" y="${y - 4}" width="${w}" height="5" fill="#e8e2d0"/>${Array.from({ length: Math.floor(w / 24) }, (_, i) => `<rect x="${x + 8 + i * 24}" y="${y + 10}" width="10" height="16" fill="#e6f0f2" stroke-width="1"/>`).join('')}`).join('')}</g>`
    + `<rect y="128" width="${W}" height="102" fill="#a8a294"/><g stroke="#6b6558" stroke-width="2" opacity=".6"><path d="M0 188 H480 M0 198 H480"/></g><g stroke="#6b6558" stroke-width="1" opacity=".4">${Array.from({ length: 24 }, (_, i) => `<path d="M${i * 20 + 6} 186 v14"/>`).join('')}</g>\n`;
  const field = () => open('', '', '#e4e4c4', '#efe3bd') + mountains(110) + `<rect y="110" width="${W}" height="120" fill="#a8b073"/>`
    + `<g stroke="#8a9650" stroke-width="3" opacity=".6">${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M0 ${124 + i * 15} Q240 ${118 + i * 15} 480 ${124 + i * 15}"/>`).join('')}</g>\n`;
  const street = () => open('', '', '#e4dcc4', '#efe3bd') + `<g ${st}>${[[0, 70, 150], [150, 84, 120], [270, 66, 140], [410, 80, 120]].map(([x, y, w], i) => {
    const cx = x + w / 2, ry = y + 24;
    return `<g transform="translate(${cx} 0)">${bays(w / 2 - 4, ry + 6, 130, Math.max(2, Math.round(w / 40)), '#6b4a30', '#e4d6b4')}</g><g transform="translate(${cx} ${ry})">${roof(w / 2 + 6, 15, Math.max(w / 2 - 28, 14), i === 1 ? '#c9ae6a' : '#3e4a42')}</g>`;
  }).join('')}</g>`
    + `<rect y="130" width="${W}" height="100" fill="#b09870"/>\n`;
  const hall = () => open('', '', '#ece3cf', '#e0d4b8') + `<rect y="170" width="${W}" height="60" fill="#8a6f4e"/><path d="M0 170 H480" stroke="${INK}" opacity=".5"/>\n`;
  const maptex = () => open('', '', '#efe3bd', '#e4d6a8') + `<g fill="none" stroke="#b9a27a" stroke-width="1.2" opacity=".55">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0 ${40 + i * 34} Q120 ${24 + i * 34} 240 ${44 + i * 34} T480 ${36 + i * 34}"/>`).join('')}</g>\n`;

  // ---------- 소품 (중심 기준 약 ±30) ----------
  const m = {
    palace: (x, y, s = 1) => T(x, y, s, `<path d="M-34 -4 L0 -24 L34 -4 Z" fill="#3e4a42"/><rect x="-28" y="-4" width="56" height="22" fill="#b5593b"/><rect x="-6" y="4" width="12" height="14" fill="#5a3a26"/><path d="M-40 18 H40" stroke-width="2.2"/>`),
    wall: (x, y, s = 1) => T(x, y, s, `<path d="M-42 20 L-36 -4 H36 L42 20 Z" fill="#b9ab90"/><g stroke-width=".9" opacity=".6"><path d="M-39 4 H39 M-41 12 H41"/>${[-28, -8, 14, 30].map(p => `<path d="M${p} -4 V4"/>`).join('')}${[-18, 4, 24, -36].map(p => `<path d="M${p} 4 V12"/>`).join('')}${[-30, -10, 10, 30].map(p => `<path d="M${p} 12 V20"/>`).join('')}</g>${[-28, -12, 4, 20].map(p => `<rect x="${p - 6}" y="-13" width="12" height="9" fill="#b9ab90"/><path d="M${p} -11 V-6" stroke-width="1"/>`).join('')}<path d="M-8 20 V10 Q0 2 8 10 V20 Z" fill="#3a2c20"/>`),
    boat: (x, y, s = 1) => T(x, y, s, `<path d="M-30 4 H30 L22 16 H-22 Z" fill="#8a6444"/><path d="M0 4 V-22" stroke-width="2"/><path d="M0 -20 L20 2 H0 Z" fill="#efe5c8"/>`),
    book: (x, y, s = 1, label = '') => T(x, y, s, `<rect x="-20" y="-16" width="40" height="32" rx="2" fill="#e8dcba"/><path d="M-20 -16 H-16 V16 H-20" fill="#8c3b26"/><path d="M-8 -6 H12 M-8 2 H12 M-8 10 H4" stroke-width="1"/>${label ? `<text x="2" y="-8" font-size="9" text-anchor="middle" stroke="none" fill="${INK}" ${font}>${label}</text>` : ''}`),
    scroll: (x, y, s = 1) => T(x, y, s, `<rect x="-26" y="-14" width="52" height="28" fill="#f3ead2"/><rect x="-30" y="-17" width="8" height="34" rx="3" fill="#8a5a35"/><rect x="22" y="-17" width="8" height="34" rx="3" fill="#8a5a35"/><path d="M-16 -4 H16 M-16 4 H16" stroke-width="1"/>`),
    plaque: (x, y, s = 1, text = '仁義禮智') => T(x, y, s, `<rect x="-34" y="-14" width="68" height="28" fill="#2f3b34"/><rect x="-34" y="-14" width="68" height="28" fill="none" stroke="#b08a3e" stroke-width="2.4"/><text x="0" y="6" font-size="17" text-anchor="middle" stroke="none" fill="#e7c872" ${font}>${text}</text>`),
    gate: (x, y, s = 1) => T(x, y, s, `<path d="M-36 -6 L0 -26 L36 -6 Z" fill="#3e4a42"/><rect x="-32" y="-6" width="64" height="8" fill="#8a3a2a"/><rect x="-26" y="2" width="8" height="22" fill="#8a3a2a"/><rect x="18" y="2" width="8" height="22" fill="#8a3a2a"/><path d="M-18 24 V8 Q0 -2 18 8 V24 Z" fill="#4a3322"/>`),
    // 근정전: 월대 위의 중층 전각, 단청 띠와 붉은 기둥
    palaceHall: (x, y, s = 0.8) => T(x, y, s, `${stoneBase(56, 26)}${stoneBase(48, 20)}<rect x="-9" y="26" width="18" height="6" fill="#d3cbb5"/>`
      + `<rect x="-24" y="-22" width="48" height="14" fill="#b5593b"/><g transform="translate(0 -26)">${roof(32, 11, 18)}</g>${dancheong(26, -22, 4)}`
      + `${bays(40, 6, 20, 5)}${dancheong(42, 0, 6)}<g transform="translate(0 -4)">${roof(50, 13, 30)}</g>`),
    // 광화문 같은 궁궐 정문: 돌 축대의 홍예문 위에 붉은 문루와 겹처마 지붕
    palaceGate: (x, y, s = 0.85) => T(x, y, s, `<path d="M-46 26 L-42 6 H42 L46 26 Z" fill="#b9b4a4"/><g stroke-width=".8" opacity=".5"><path d="M-44 12 H44 M-45 19 H45"/></g>`
      + [-24, 0, 24].map((c, i) => `<path d="M${c - (i === 1 ? 9 : 7)} 26 V${i === 1 ? 14 : 16} Q${c} ${i === 1 ? 4 : 8} ${c + (i === 1 ? 9 : 7)} ${i === 1 ? 14 : 16} V26 Z" fill="#3a2c20"/>`).join('')
      + `<rect x="-26" y="-22" width="52" height="8" fill="#a8402e"/><g transform="translate(0 -34)">${roof(30, 10, 16)}</g>${dancheong(24, -26, 4)}`
      + `${bays(36, -6, 6, 4, '#8a2f20', '#a8402e')}${dancheong(38, -11, 5)}<g transform="translate(0 -14)">${roof(46, 12, 26)}</g>`),
    // 성균관 명륜당: 단청 없이 소박한 지붕, 흰 벽과 나무 기둥, 편액, 은행나무
    seonggyungwan: (x, y, s = 0.8) => T(x, y, s, `${stoneBase(56, 22, 7)}<rect x="-10" y="22" width="20" height="9" fill="#d3cbb5"/>`
      + `${bays(46, 4, 22, 6, '#6b4a30', '#efe6cf')}<rect x="-46" y="-1" width="92" height="5" fill="#7a5a3c"/><g transform="translate(0 -3)">${roof(56, 14, 32)}</g>`
      + `<rect x="-19" y="5" width="38" height="10" fill="#2f3b34" stroke="#b08a3e" stroke-width="1.4"/><text x="0" y="13.4" font-size="8.6" text-anchor="middle" stroke="none" fill="#e7c872" ${font}>明倫堂</text>`
      + `<path d="M70 24 V2" stroke="#6b4a30" stroke-width="5"/><g fill="#e0b84a" stroke-width="1"><circle cx="70" cy="-6" r="14"/><circle cx="58" cy="2" r="10"/><circle cx="82" cy="2" r="10"/></g>`),
    // 한양 민가: 처마가 들린 작은 기와집 세 채
    hanokVillage: (x, y, s = 1) => [[-40, 2, 0.5], [0, 8, 0.6], [42, -2, 0.45]].map(([a, b, k]) => T(x + a * s, y + b * s, s * k * 1.5, `${stoneBase(30, 20, 4)}${bays(26, 6, 20, 3, '#6b4a30', '#efe6cf')}<g transform="translate(0 4)">${roof(34, 13, 18)}</g>`)).join(''),
    // 개항기 서양식 벽돌 건물: 수평 줄, 아치창, 기둥 현관과 삼각 박공, 굴뚝
    western: (x, y, s = 1) => T(x, y, s, `<rect x="-34" y="-18" width="68" height="40" fill="#b4644a"/><rect x="-36" y="-22" width="72" height="5" fill="#e8e2d0"/><path d="M-34 -22 L-26 -30 H26 L34 -22 Z" fill="#59616a"/><rect x="14" y="-40" width="7" height="12" fill="#8a4a38"/>`
      + `<g stroke-width="1" fill="#e6f0f2">${[-26, -14, 14, 26].map(c => [-12, 6].map(r => `<path d="M${c - 4} ${r + 10} V${r + 2} Q${c} ${r - 4} ${c + 4} ${r + 2} V${r + 10} Z"/>`).join('')).join('')}</g>`
      + `<rect x="-14" y="-2" width="28" height="24" fill="#e8e2d0"/><path d="M-17 -2 L0 -13 L17 -2 Z" fill="#f3efe2"/><path d="M-10 22 V4 Q0 -2 10 4 V22 Z" fill="#4a3322"/><path d="M-12 -2 V22 M12 -2 V22" stroke-width="2.2"/><path d="M-38 22 H38" stroke-width="2.2"/>`),
    // 근대 상점 거리: 서양식 가게 둘과 간판
    westernShops: (x, y, s = 1) => T(x, y, s, [[-30, '#b4644a'], [4, '#c9b98c']].map(([c, f], i) => `<rect x="${c - 2}" y="${-14 - i * 6}" width="30" height="${36 + i * 6}" fill="${f}"/><rect x="${c - 4}" y="${-18 - i * 6}" width="34" height="5" fill="#e8e2d0"/><rect x="${c + 4}" y="${-6 - i * 6}" width="8" height="12" fill="#e6f0f2" stroke-width="1"/><rect x="${c + 16}" y="${-6 - i * 6}" width="8" height="12" fill="#e6f0f2" stroke-width="1"/><path d="M${c - 2} 10 h30 l-3 8 h-24 Z" fill="${i ? '#4f7fa0' : '#2f6b5a'}"/>`).join('') + `<rect x="36" y="-10" width="10" height="32" fill="#8a6f4a"/><rect x="31" y="-12" width="20" height="9" fill="#f3ead2" stroke-width="1"/>`),
    mount: (x, y, s = 1) => T(x, y, s, `<path d="M-40 18 L-14 -18 L2 0 L16 -22 L40 18 Z" fill="#7b8c78"/><path d="M-40 18 H40" stroke-width="2"/><path d="M-6 18 q6 -10 12 0" fill="#6e9aa6" stroke-width="1"/>`),
    coin: (x, y, s = 1) => T(x, y, s, `<circle r="13" fill="#c9a24a"/><rect x="-4" y="-4" width="8" height="8" fill="#efe3bd"/>`),
    coins: (x, y, s = 1) => T(x, y, s, `<g fill="#c9a24a"><circle cx="-14" cy="6" r="10"/><circle cx="8" cy="6" r="10"/><circle cx="-3" cy="-8" r="10"/></g><g fill="#efe3bd" stroke-width="1"><rect x="-17" y="3" width="6" height="6"/><rect x="5" y="3" width="6" height="6"/><rect x="-6" y="-11" width="6" height="6"/></g>`),
    sack: (x, y, s = 1) => T(x, y, s, `<path d="M-14 16 Q-20 -2 -8 -12 H8 Q20 -2 14 16 Z" fill="#d9c38a"/><path d="M-8 -12 L0 -18 L8 -12" fill="#c9ae6a"/><path d="M-10 -4 H10" stroke-width="1.2"/>`),
    sacks: (x, y, s = 1) => m.sack(x - 18, y + 4, s * 0.9) + m.sack(x + 14, y + 4, s) + m.sack(x - 2, y - 10, s * 0.8),
    stall: (x, y, s = 1) => T(x, y, s, `<path d="M-34 -8 L-28 -22 H28 L34 -8 Z" fill="#b5593b"/><path d="M-30 -8 V18 M30 -8 V18" stroke-width="2"/><rect x="-30" y="8" width="60" height="10" fill="#8a6444"/><g stroke-width="1"><circle cx="-16" cy="4" r="6" fill="#d9c38a"/><circle cx="0" cy="4" r="6" fill="#7a8a3c"/><circle cx="16" cy="4" r="6" fill="#c0392b"/></g>`),
    stalls: (x, y, s = 1) => m.stall(x - 32, y, s * 0.8) + m.stall(x + 32, y, s * 0.8),
    sprout: (x, y, s = 1) => T(x, y, s, `<path d="M0 16 V-2" stroke="#5f7a2e" stroke-width="2.4" fill="none"/><path d="M0 4 Q-14 -2 -16 -14 Q-2 -10 0 4 Z" fill="#7a8a3c"/><path d="M0 -2 Q14 -8 16 -20 Q2 -16 0 -2 Z" fill="#8ea04a"/><path d="M-14 16 H14" stroke-width="1.6"/>`),
    seedRows: (x, y, s = 1) => T(x, y, s, `<rect x="-36" y="-14" width="72" height="30" fill="#8a6f4a"/>${[-24, -8, 8, 24].map(p => `<path d="M${p} -10 V12" stroke="#d9c38a" stroke-dasharray="1 5" stroke-width="3"/>`).join('')}`),
    paddy: (x, y, s = 1) => T(x, y, s, `<rect x="-36" y="-14" width="72" height="30" fill="#8fb0b6"/>${[-26, -14, -2, 10, 22].map(p => `<path d="M${p} 8 V-4 M${p - 3} -1 L${p} -4 L${p + 3} -1" stroke="#5f7a2e" stroke-width="1.6" fill="none"/>`).join('')}`),
    hoe: (x, y, s = 1) => T(x, y, s, `<path d="M-18 -16 L16 16" stroke="#8a5a35" stroke-width="3.4" fill="none"/><path d="M-26 -22 L-12 -22 L-14 -10 Z" fill="#6b6f73"/>`),
    crop: (x, y, s = 1) => T(x, y, s, `<path d="M0 18 V-6" stroke="#5f7a2e" stroke-width="2.6" fill="none"/>${[[-12, 4], [12, 0], [-10, -8], [10, -10]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="9" ry="5" fill="#7a8a3c" transform="rotate(${a < 0 ? -25 : 25} ${a} ${b})"/>`).join('')}<circle cx="0" cy="-10" r="6" fill="#f6f1e2"/>`),
    globe: (x, y, s = 1) => T(x, y, s, `<path d="M-18 22 H18 M0 14 V22" stroke-width="2.4"/><circle cy="-2" r="18" fill="#7fa7b8"/><path d="M-14 -8 Q-6 -16 2 -8 Q-2 0 -10 2 Z M4 4 Q12 0 14 8 Q8 12 4 4 Z" fill="#9fb07a" stroke-width="1"/><ellipse cy="-2" rx="18" ry="6" fill="none" stroke-width="1"/>`),
    crane: (x, y, s = 1) => T(x, y, s, `<path d="M-28 22 L-8 -22 L12 22 M-8 -22 L28 22" fill="none" stroke-width="3"/><path d="M-8 -22 L-8 -4" stroke-width="1.6"/><circle cx="-8" cy="-22" r="5" fill="#d9c38a"/><rect x="-14" y="-4" width="12" height="10" fill="#8a6f4a"/>`),
    pulley: (x, y, s = 1) => T(x, y, s, `<path d="M-30 -22 H30" stroke-width="3"/><circle cx="-10" cy="-8" r="12" fill="#d9c38a"/><circle cx="-10" cy="-8" r="3" fill="#6b4a30"/><path d="M-22 -8 V16 M2 -8 V10" stroke-width="1.6"/><rect x="-10" y="10" width="24" height="12" fill="#8a6f4a"/>`),
    hut: (x, y, s = 1) => T(x, y, s, `<path d="M-30 0 Q0 -26 30 0 Z" fill="#c9ae6a"/><rect x="-22" y="0" width="44" height="22" fill="#d9c8a0"/><rect x="-6" y="6" width="12" height="16" fill="#5a3a26"/>`),
    lantern: (x, y, s = 1) => T(x, y, s, `<path d="M0 -26 V-16" stroke-width="2"/><rect x="-10" y="-16" width="20" height="26" rx="8" fill="#e8b84a"/><path d="M-10 -4 H10" stroke-width="1"/><path d="M-5 10 V16 M5 10 V16" stroke-width="1.6"/>`),
    cracked: (x, y, s = 1) => T(x, y, s, `<rect x="-36" y="-14" width="72" height="30" fill="#b9a27a"/><path d="M-30 -6 L-10 0 L-18 10 M2 -12 L10 -2 L4 14 M18 -4 L30 4" fill="none" stroke-width="1.4"/><path d="M-4 4 V-6 M-7 -3 L-4 -6 L-1 -3" stroke="#8a7a3c" fill="none"/>`),
    letters: (x, y, s = 1, ch = ['ㄱ', 'ㄴ', 'ㅁ', 'ㅅ', 'ㅇ']) => T(x, y, s, `${ch.map((c, i) => `<rect x="${-32 + i * 13}" y="-10" width="12" height="20" fill="#f7f1de" stroke-width="1"/><text x="${-26 + i * 13}" y="5" font-size="12" text-anchor="middle" stroke="none" fill="${INK}" ${font}>${c}</text>`).join('')}`),
    armillary: (x, y, s = 1) => T(x, y, s, `<path d="M-14 22 H14 M0 12 V22" stroke-width="2.4"/><circle cy="-4" r="18" fill="none" stroke-width="2.2"/><ellipse cy="-4" rx="18" ry="6" fill="none"/><ellipse cy="-4" rx="6" ry="18" fill="none"/><path d="M-12 -18 L14 10" stroke-width="2"/>`),
    tower: (x, y, s = 1) => T(x, y, s, `<path d="M-16 22 L-10 -10 H10 L16 22 Z" fill="#b9ab90"/><rect x="-14" y="-18" width="28" height="10" fill="#8a6444"/><path d="M-20 -18 L0 -30 L20 -18 Z" fill="#3e4a42"/>`),
    calendar: (x, y, s = 1) => T(x, y, s, `<rect x="-20" y="-18" width="40" height="36" fill="#f7f1de"/><rect x="-20" y="-18" width="40" height="9" fill="#b83a2a"/>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${-16 + c * 9}" y="${-4 + r * 7}" width="6" height="4" fill="#d9c38a" stroke-width=".6"/>`).join('')).join('')}`),
    sundial: (x, y, s = 1) => T(x, y, s, `<path d="M-26 6 H26 Q22 22 0 22 Q-22 22 -26 6 Z" fill="#b9ab90"/><ellipse cy="6" rx="26" ry="7" fill="#d8cfb8"/><path d="M0 6 L-8 -14" stroke-width="2.4"/><path d="M-14 4 L-8 8 M-4 3 L0 8 M8 4 L12 8" stroke-width="1"/><path d="M-22 22 V28 M22 22 V28" stroke-width="3"/>`),
    tabletMarks: (x, y, s = 1) => T(x, y, s, `<rect x="-30" y="-16" width="60" height="32" rx="2" fill="#2f3b34"/>${['子', '丑', '寅', '卯'].map((c, i) => `<text x="${-21 + i * 14}" y="6" font-size="13" text-anchor="middle" stroke="none" fill="#e7c872" ${font}>${c}</text>`).join('')}`),
    drum: (x, y, s = 1) => T(x, y, s, `<path d="M-18 -6 Q-22 4 -18 14 H18 Q22 4 18 -6 Z" fill="#a8613f"/><ellipse cy="-6" rx="18" ry="6" fill="#f0e3c2"/><path d="M-14 -4 L-10 14 M-4 -2 L-2 14 M6 -2 L4 14 M14 -4 L10 14" stroke-width="1"/>`),
    fan: (x, y, s = 1) => T(x, y, s, `<path d="M0 18 L-26 -10 Q0 -26 26 -10 Z" fill="#f3ead2"/><path d="M0 18 L-14 -16 M0 18 L0 -18 M0 18 L14 -16" stroke-width="1" fill="none"/><path d="M-26 -10 Q0 -26 26 -10" fill="none" stroke="#b83a2a" stroke-width="3"/>`),
    mat: (x, y, s = 1) => T(x, y, s, `<rect x="-34" y="-8" width="68" height="18" fill="#d9c38a"/>${[-24, -12, 0, 12, 24].map(p => `<path d="M${p} -8 V10" stroke-width=".8"/>`).join('')}`),
    gat: (x, y, s = 1) => T(x, y, s, `<ellipse rx="22" ry="6" cy="6" fill="#2a2420"/><path d="M-10 6 Q-10 -14 0 -14 Q10 -14 10 6 Z" fill="#3a332c"/><path d="M-8 4 H8" stroke="#8a7355"/>`),
    mask: (x, y, s = 1, hat = false) => T(x, y, s, `${hat ? `<ellipse rx="22" ry="5" cy="-14" fill="#2a2420"/><path d="M-10 -14 Q-10 -28 0 -28 Q10 -28 10 -14 Z" fill="#3a332c"/>` : ''}<path d="M-14 -12 Q0 -18 14 -12 Q16 10 0 20 Q-16 10 -14 -12 Z" fill="#efe3c2"/><path d="M-9 -4 q3 -3 6 0 M3 -4 q3 -3 6 0" fill="none"/><path d="M-6 8 q6 4 12 0" fill="none"/><circle cx="-9" cy="2" r="2" fill="#c0392b" stroke="none"/><circle cx="9" cy="2" r="2" fill="#c0392b" stroke="none"/>`),
    masks: (x, y, s = 1) => m.mask(x - 28, y, s * 0.7) + m.mask(x, y, s * 0.8) + m.mask(x + 28, y, s * 0.7),
    paintingHang: (x, y, s = 1) => T(x, y, s, `<path d="M0 -26 V-20" stroke-width="2"/><rect x="-22" y="-20" width="44" height="46" fill="#f7f1de" stroke="#8a5a35" stroke-width="3"/><path d="M-16 14 H16" stroke-width="1.2"/><path d="M-14 14 V4 L-2 -4 L10 4 V14" fill="#d9c38a"/><circle cx="14" cy="-6" r="6" fill="#7a8a3c" stroke="none"/>`),
    chest: (x, y, s = 1) => T(x, y, s, `<rect x="-26" y="-18" width="52" height="38" fill="#8a6444"/>${[-18, 0, 18].map(a => [-10, 6].map(b => `<rect x="${a - 7}" y="${b - 2}" width="14" height="12" fill="#a8774a" stroke-width="1"/><circle cx="${a}" cy="${b + 4}" r="1.4" fill="${INK}" stroke="none"/>`).join('')).join('')}`),
    letter: (x, y, s = 1) => T(x, y, s, `<rect x="-24" y="-14" width="48" height="30" fill="#f7f1de"/><path d="M-24 -14 L0 4 L24 -14" fill="none"/><circle cx="14" cy="10" r="5" fill="#b83a2a" stroke="none"/>`),
    tablet: (x, y, s = 1) => T(x, y, s, `<path d="M-12 -20 H12 V20 H-12 Z" fill="#d9c8a0"/><path d="M-12 -14 H12" stroke-width="1"/><circle cx="0" cy="-7" r="3" fill="#b83a2a" stroke="none"/><path d="M-6 2 H6 M-6 8 H6 M-6 14 H3" stroke-width="1"/>`),
    banners: (x, y, s = 1) => T(x, y, s, `${[['#c0392b', -27], ['#d9a53b', -9], ['#4f7fa0', 9], ['#3b3a38', 27]].map(([c, p]) => `<path d="M${p - 6} -20 H${p + 6} V16 L${p} 10 L${p - 6} 16 Z" fill="${c}"/>`).join('')}<path d="M-36 -22 H36" stroke-width="2.4"/>`),
    ledger: (x, y, s = 1) => T(x, y, s, `<rect x="-26" y="-14" width="22" height="28" fill="#e8dcba"/><rect x="2" y="-14" width="22" height="28" fill="#d9c8a0"/><path d="M-22 -6 H-8 M-22 2 H-8 M6 -6 H20 M6 2 H20" stroke-width="1"/>`),
    flagpole: (x, y, s = 1) => T(x, y, s, `<path d="M-8 22 V-24" stroke-width="2.4"/><path d="M-8 -22 L18 -16 L-8 -8 Z" fill="#3b5d7c"/>`),
    spearRack: (x, y, s = 1) => T(x, y, s, `<path d="M-30 18 H30 M-30 4 H30" stroke-width="2"/>${[-22, -10, 2, 14, 26].map(p => `<path d="M${p} 20 V-18" stroke-width="2"/><path d="M${p} -18 l-3 6 h6 Z" fill="#c9ccd1" stroke-width="1"/>`).join('')}`),
    tram: (x, y, s = 1) => T(x, y, s, `<rect x="-34" y="-12" width="68" height="28" rx="4" fill="#4f7fa0"/>${[-24, -8, 8, 24].map(p => `<rect x="${p - 6}" y="-6" width="12" height="10" fill="#e6f0f2" stroke-width="1"/>`).join('')}<path d="M0 -12 V-22 M-10 -22 H10" stroke-width="2"/><circle cx="-22" cy="18" r="4" fill="${INK}"/><circle cx="22" cy="18" r="4" fill="${INK}"/>`),
    bulb: (x, y, s = 1) => T(x, y, s, `<path d="M0 -28 V-12" stroke-width="2"/><circle cy="-2" r="12" fill="#f6dc7a"/><rect x="-5" y="9" width="10" height="7" fill="#8a7355"/><g stroke="#e8b84a" stroke-width="2"><path d="M-20 -2 H-16 M16 -2 H20 M-14 -16 L-11 -13 M14 -16 L11 -13"/></g>`),
    pole: (x, y, s = 1) => T(x, y, s, `<path d="M0 26 V-26 M-14 -18 H14 M-10 -10 H10" stroke-width="2.6"/><path d="M-60 -14 Q-30 -4 0 -18 Q30 -4 60 -14" fill="none" stroke-width="1"/>`),
    city: (x, y, s = 1) => T(x, y, s, `${[[-30, 16, 18, 26], [-8, 22, 20, 34], [16, 14, 18, 22]].map(([a, b, c, d], i) => `<rect x="${a}" y="${b - d}" width="${c}" height="${d}" fill="${['#d9c8a0', '#c9b98c', '#e4d6b4'][i]}"/><path d="M${a - 3} ${b - d} L${a + c / 2} ${b - d - 8} L${a + c + 3} ${b - d} Z" fill="#3e4a42"/>`).join('')}`),
    ship: (x, y, s = 1) => T(x, y, s, `<path d="M-34 4 H34 L26 18 H-26 Z" fill="#3b3a38"/><path d="M-6 4 V-24 M14 4 V-18" stroke-width="2.2"/><path d="M-6 -22 L-24 0 H-6 Z M14 -16 L28 0 H14 Z" fill="#efe5c8"/>`),
    mapRiver: (x, y, s = 1, flip = 1) => T(x, y, s, `<path d="M${-34 * flip} -16 C${-10 * flip} -10 ${-20 * flip} 6 ${10 * flip} 10 S${30 * flip} 16 ${34 * flip} 20" fill="none" stroke="#5c8190" stroke-width="6"/>`),
    cart: (x, y, s = 1) => T(x, y, s, `<rect x="-24" y="-8" width="40" height="16" fill="#8a6444"/><circle cx="-12" cy="12" r="9" fill="#d9c8a0"/><circle cx="8" cy="12" r="9" fill="#d9c8a0"/><path d="M16 0 H34" stroke-width="2.4"/><path d="M-20 -8 V-18 H8 V-8" fill="#c9ae6a"/>`),
    rice: (x, y, s = 1) => T(x, y, s, `<path d="M-14 4 H14 Q12 16 0 16 Q-12 16 -14 4 Z" fill="#efe5c8"/><path d="M-14 4 Q0 -6 14 4" fill="#fffdf4"/>`),
    houseBroken: (x, y, s = 1) => T(x, y, s, `<path d="M-30 0 Q-10 -20 6 -14 L12 -4 L30 0 Z" fill="#c9ae6a"/><rect x="-22" y="0" width="44" height="22" fill="#d9c8a0"/><path d="M-6 6 h10 v16 h-10 Z" fill="#5a3a26"/><path d="M12 -4 l6 -6" stroke-width="1"/>`),
    fenceGap: (x, y, s = 1) => T(x, y, s, `${[-26, -14, -2, 22].map(p => `<path d="M${p} 16 V-10"/>`).join('')}<path d="M-30 -2 H-8 M16 -2 H30" stroke-width="1.6"/>`),
    showcase: (x, y, s = 1, inner = '') => T(x, y, s, `<rect x="-30" y="-22" width="60" height="44" fill="#e6f0f2" fill-opacity=".5" stroke-width="2"/><path d="M-30 22 H30" stroke-width="3"/>${inner}`),
    desk: (x, y, s = 1) => T(x, y, s, `<rect x="-60" y="-4" width="120" height="12" fill="#6b4a30"/><path d="M-52 8 V34 M52 8 V34" stroke-width="5"/>`),
    treatyDoc: (x, y, s = 1) => T(x, y, s, `<rect x="-30" y="-22" width="60" height="44" fill="#f3ead2"/><path d="M-20 -12 H20 M-20 -4 H20 M-20 4 H20 M-20 12 H6" stroke-width="1"/><circle cx="20" cy="14" r="6" fill="#b83a2a" stroke="none"/>`)
  };

  // ---------- 장면 정의 ----------
  const put = (items) => items.join('');
  const make = (label, bg, body) => () => bg().replace(/aria-label=""/, `aria-label="${label}"`) + put(body) + close;

  scenes['hanyang-site-selection'] = make('산과 강이 둘러싼 한양 터와 도성, 강을 오가는 배', river.bind(null, '#e4e4cc', '#efe3bd'), [m.hanokVillage(...L, 1), m.boat(...C, 1.1), m.wall(...R, 1)]);
  scenes['gyeongbokgung-naming'] = make('궁궐 마당의 편액, 궁궐 정문, 문서', palaceYard, [m.plaque(...L, 1), m.palaceGate(240, 100, 1.2), m.scroll(...R, 1)]);
  scenes['hanyang-gates-pavement'] = make('근정전 앞마당과 햇빛, 거친 돌 박석', palaceYard, [m.palaceHall(106, 78, 0.95), `<circle cx="240" cy="92" r="18" fill="#f6dc7a" opacity=".9"/><g stroke="#e8b84a" stroke-width="2.4"><path d="M240 62 V68 M214 92 H208 M272 92 H266 M222 74 L218 70 M258 74 L262 70"/></g>`, `<g ${st}>${[0, 1, 2, 3].map(i => `<path d="M${340 + i * 16} ${74 + (i % 2) * 10} l14 -3 l4 12 l-14 4 Z" fill="#a9a08c"/>`).join('')}</g>`]);
  scenes['joseon-founding-evidence'] = make('산과 강, 도성과 궁궐, 성균관 명륜당', river.bind(null, '#e4e4cc', '#efe3bd'), [m.mount(96, 80, 1), m.palaceHall(240, 100, 1.0), m.seonggyungwan(356, 80, 0.9)]);
  scenes['ianbeop-farming'] = make('씨앗을 뿌린 논, 호미, 모내기한 논', field, [m.seedRows(...L, 1), m.hoe(...C, 1.1), m.paddy(...R, 1)]);
  scenes['sangpum-crops'] = make('호미, 장터 좌판, 상품 작물', field, [m.hoe(...L, 1), m.stall(...C, 1.1), m.crop(...R, 1)]);
  scenes['sangpyeongtongbo-market'] = make('곡식 자루, 여러 장터 좌판, 상평통보', street, [m.sacks(...L, 1), m.stalls(...C, 1), m.coins(...R, 1.1)]);
  scenes['hanyang-commerce-summary'] = make('한양 시장 거리의 좌판과 엽전', street, [m.stalls(110, 112, 1.2), m.stall(300, 110, 1.2), m.coins(400, 106, 1.3), m.sacks(190, 150, 1)]);
  scenes['hongdaeyong-globe'] = make('책과 지구의, 서로 다른 두 지도', room, [m.book(...L, 1.1), m.globe(...C, 1.2), m.scroll(...R, 1)]);
  scenes['hwaseong-geojunggi'] = make('성곽 공사의 도르래와 거중기, 품삯, 달력', outdoor.bind(null, '#e4dcc4', '#d4cbb0'), [m.pulley(...L, 1.1), m.crane(...C, 1.2), m.calendar(...R, 1)].concat([m.wall(300, 128, 1.1)]));
  scenes['donghak-yongdamjeong'] = make('메마른 논밭, 등불 아래의 용담정, 사람이 곧 하늘이라는 글', outdoor.bind(null, '#dfe6d4', '#e8e0c0'), [m.cracked(...L, 1), m.hut(...C, 1.2), m.plaque(...R, 0.9, '人乃天')]);
  scenes['silhak-summary'] = make('실학자들의 책, 지구의, 거중기', room, [m.book(120, 108, 1.2), m.globe(240, 106, 1.3), m.crane(360, 108, 1.2)]);
  scenes['hunminjeongeum-lab'] = make('자음 글자판, 하늘·땅·사람 글자, 훈민정음 책', room, [m.letters(...L, 1), m.letters(...C, 1, ['ㆍ', 'ㅡ', 'ㅣ']), m.book(...R, 1.1, '訓民')]);
  scenes['chiljeongsan-observatory'] = make('관측 기구, 달력, 새싹', outdoor.bind(null, '#dfe3ea', '#e8e6d4'), [m.armillary(...L, 1.1), m.calendar(...C, 1.2), m.sprout(...R, 1.1)]);
  scenes['angbuilgu-street'] = make('그림자 눈금이 있는 해시계, 글자판, 거리의 해시계', street, [m.sundial(...L, 1), m.tabletMarks(...C, 1), m.sundial(...R, 1.1)]);
  scenes['sejong-evidence'] = make('해례 책, 천문 두루마리, 앙부일구', room, [m.book(...L, 1.1, '解例'), m.scroll(...C, 1.2), m.sundial(...R, 1.1)]);
  scenes['pansori-performance'] = make('부채와 돗자리, 북, 관객의 갓', courtyard, [m.fan(...L, 1.1), m.drum(...C, 1.2), m.gat(344, 74, 1), m.gat(404, 80, 0.9)]);
  scenes['talchum-dance'] = make('지역마다 다른 탈, 양반탈, 탈놀이 마당', courtyard, [m.masks(...L, 1.1), m.mask(...C, 1.3, true), m.lantern(344, 80, 1), m.lantern(404, 80, 1)]);
  scenes['joseon-folk-evidence'] = make('풍속화, 북과 부채, 탈', room, [m.paintingHang(...L, 1.1), m.drum(...C, 1.2), m.mask(...R, 1.2, true)]);
  scenes['ganghwa-treaty-hall'] = make('조약 문서가 놓인 책상과 항구의 배', hall, [`<g ${st}><rect x="40" y="40" width="130" height="90" fill="#8fb0b6"/><path d="M40 90 H170" /></g>`, m.ship(105, 92, 0.9), m.desk(300, 138, 1.4), m.treatyDoc(300, 100, 1.5), m.flagpole(420, 120, 1.3)]);
  scenes['jejungwon-postal'] = make('근대 병원과 우체국 건물, 우편함', modernStreet, [m.western(150, 98, 1.45), m.letter(330, 112, 1.3), m.pole(420, 100, 1)]);
  scenes['hanyang-tram-street'] = make('전차, 전등, 도시의 건물', modernStreet, [m.tram(...L, 1.1), m.bulb(...C, 1.3), m.westernShops(...R, 1.2)]);
  scenes['modern-open-evidence'] = make('항구의 배, 전신주, 문서', modernStreet, [m.ship(110, 100, 1.2), m.pole(240, 96, 1.2), m.treatyDoc(370, 100, 1)]);
  scenes['hopae-registration'] = make('호적 장부, 신분을 나타내는 깃발, 호패', room, [m.ledger(...L, 1.1), m.banners(...C, 1.2), m.tablet(...R, 1.1)]);
  scenes['jungin-medicine'] = make('약장, 외국과 주고받은 편지, 의학 책', room, [m.chest(...L, 1.1), m.letter(...C, 1.2), m.book(...R, 1.1, '醫')]);
  scenes['commoner-harvest'] = make('곡식 자루, 깃발과 창, 지역별 논밭', field, [m.sacks(...L, 1.1), m.spearRack(...C, 1.1), m.paddy(...R, 1.1)]);
  scenes['joseon-status-evidence'] = make('장부, 약장, 호적 문서', room, [m.ledger(...L, 1.1), m.chest(...C, 1.1), m.scroll(...R, 1.1)]);
  // 북쪽 국경 지도(북쪽이 위): 두 강 모두 백두산에서 시작한다. 압록강은 남서쪽으로 흘러 황해, 두만강은 북동쪽을 거쳐 동해로 흐른다.
  scenes['joseon-border'] = () => {
    const arrow = (x, y, a) => `<path d="M-6 -4 L6 0 L-6 4 Z" fill="#2f5d70" transform="translate(${x} ${y}) rotate(${a})"/>`;
    return open('', '백두산에서 시작해 압록강은 남서쪽 황해로, 두만강은 북동쪽을 거쳐 동해로 흐르는 국경 지도', '#efe3bd', '#e4d6a8')
      + `<g fill="none" stroke="#b9a27a" stroke-width="1.2" opacity=".5">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M0 ${40 + i * 34} Q120 ${24 + i * 34} 240 ${44 + i * 34} T480 ${36 + i * 34}"/>`).join('')}</g>`
      + `<path d="M0 150 C40 156 62 168 66 190 C70 210 40 222 0 230 Z" fill="#8fb0b6"/><path d="M480 108 L440 112 C418 120 410 138 414 158 C420 184 444 208 480 230 Z" fill="#8fb0b6"/>`
      + `<g fill="none" stroke="#d9e8e6" stroke-width="1.6" opacity=".8"><path d="M10 188 q8 -4 16 0 t16 0"/><path d="M440 170 q8 -4 16 0 t16 0"/></g>`
      + `<g ${st}><path d="M222 70 L236 46 L250 70 Z" fill="#9aa890"/><path d="M230 56 L236 46 L242 56 Z" fill="#fffdf4" stroke-width="1"/></g><ellipse cx="236" cy="70" rx="9" ry="3" fill="#6e9aa6" stroke="${INK}" stroke-width="1"/>`
      + `<path d="M228 72 C208 74 182 84 156 96 C134 108 114 122 98 138 C84 152 72 164 64 182" fill="none" stroke="#5c8190" stroke-width="6" stroke-linecap="round"/>`
      + `<path d="M244 72 C268 64 304 66 340 78 C372 90 396 106 418 130" fill="none" stroke="#5c8190" stroke-width="6" stroke-linecap="round"/>`
      + arrow(184, 83, 160) + arrow(108, 130, 132) + arrow(304, 68, 12) + arrow(388, 100, 36)
      + m.hut(206, 118, 0.85) + m.hut(242, 122, 0.75) + m.cart(284, 118, 0.85)
      + `<path d="M236 100 V88" stroke="#b83a2a" stroke-width="2" stroke-dasharray="4 4"/><path d="M230 90 L236 78 L242 90 Z" fill="#b83a2a"/>`
      + close;
  };
  scenes['joseon-namhansanseong'] = make('산 위의 성곽, 곡식이 줄어든 자루, 피해를 입은 집', outdoor.bind(null, '#d4d8dc', '#dcd8c8', '#8e9a86'), [m.wall(96, 82, 1.2), m.rice(...C, 1.3), m.houseBroken(384, 84, 1)]);
  scenes['joseon-postwar'] = make('국경 문서, 창 거치대, 다시 일군 논과 집', outdoor.bind(null, '#e4e4cc', '#efe3bd'), [m.scroll(96, 80, 1.1), m.spearRack(...C, 1), m.hut(384, 84, 1)]);
  scenes['joseon-diplomacy-exhibit'] = make('지도, 문서, 새싹이 놓인 전시 진열장', hall, [m.showcase(96, 78, 1.1, m.mapRiver(0, 0, 0.7)), m.showcase(240, 108, 1.2, m.scroll(0, 0, 0.8)), m.showcase(384, 78, 1.1, m.sprout(0, 0, 1))]);
};
