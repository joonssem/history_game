// 1단원(고대~고려)·3단원(근현대) 정규 MUD 장면 SVG (사물·배경만, 인물 없음). gen_scene_art.js가 불러 쓴다.
// 핫스팟이 표준 위치(.22/.5/.78, .48/.65/.48)가 아닌 장면은 P(hx, hy)로 소품 위치를 잡는다(핫스팟 위 32px).
module.exports = function (scenes, h, U) {
  const { open, close, mountains, sea, ripples, panokseon, INK, W, H } = h;
  const { m, T, st, L, C, R, make, outdoor, river, room, courtyard, modernStreet, field, street, hall, maptex, palaceYard, roof, bays, stoneBase, dancheong } = U;
  const font = 'font-family="Noto Serif KR,Batang,serif"';
  const P = (hx, hy, dy = 32) => [Math.round(hx * W), Math.round(hy * H - dy)];
  const L3 = P(0.24, 0.43), C3 = P(0.5, 0.62), R3 = P(0.76, 0.43);
  const LB = P(0.2, 0.46), CB = P(0.5, 0.67), RB = P(0.8, 0.46);

  // ---------- 배경 ----------
  const tomb = () => open('', '', '#4a4038', '#3a322c') + `<g stroke="#2a221c" stroke-width="1.4" opacity=".8">${[0, 1, 2, 3, 4].map(i => `<path d="M0 ${34 + i * 36} H480"/>`).join('')}${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<path d="M${30 + i * 56} 0 V190"/>`).join('')}</g>`
    + `<rect y="176" width="${W}" height="54" fill="#6b5a46"/><path d="M0 176 H480" stroke="${INK}" opacity=".6"/>\n`;
  const darkRoom = () => open('', '', '#5a4a3a', '#46382c') + `<rect y="170" width="${W}" height="60" fill="#6b5640"/><path d="M0 170 H480" stroke="${INK}" opacity=".6"/>`
    + `<g stroke="#8a7355" stroke-width="2" opacity=".35">${[0, 60, 120, 180, 240, 300, 360, 420].map(x => `<path d="M${x} 24 V170"/>`).join('')}</g>\n`;
  const peninsulaA = () => open('', '', '#dfe8ea', '#cfdde0') + `<path d="M150 0 H330 C346 40 350 80 340 112 C350 140 352 160 334 186 C318 206 290 214 262 218 C226 208 200 196 176 176 C150 156 134 142 130 128 C128 108 144 92 140 70 C136 44 142 20 150 0 Z" fill="#cdbf94" stroke="${INK}" stroke-width="1.4"/>`
    + `<g fill="none" stroke="#a89870" stroke-width="1" opacity=".6"><path d="M180 30 q30 6 60 -2 t60 2"/><path d="M170 150 q40 -10 80 4"/></g>`
    + `<path d="M138 57 H344" stroke="#b83a2a" stroke-width="2" stroke-dasharray="6 5"/>\n`;
  const peninsulaB = () => open('', '', '#dfe8ea', '#cfdde0') + `<path d="M96 0 H420 C430 50 424 100 410 140 C400 180 380 214 350 230 H190 C150 210 110 190 96 150 C84 110 100 60 96 0 Z" fill="#cdbf94" stroke="${INK}" stroke-width="1.4"/>`
    + `<g fill="none" stroke="#a89870" stroke-width="1" opacity=".6"><path d="M140 40 q40 8 80 -2"/><path d="M290 170 q40 -10 80 4"/></g>`
    + `<path d="M104 30 L240 78 L380 130 L416 150" fill="none" stroke="#b83a2a" stroke-width="2" stroke-dasharray="6 5"/>\n`;
  // ---------- 실제 지도 (북쪽이 위, 경위도 → 화면) ----------
  // 해안선은 주요 지점을 이은 단순화 선이다(경도, 위도). 가로 축척 = 세로 축척 × cos(37.5°).
  const KOREA_W = [[124.35, 40.05], [124.75, 39.75], [125.1, 39.6], [125.45, 39.55], [125.35, 39.3], [125.2, 38.95], [125.3, 38.7], [125.0, 38.55], [124.75, 38.15], [125.1, 37.95], [125.6, 37.75], [125.95, 37.85], [126.2, 37.75], [126.55, 37.75], [126.6, 37.45], [126.75, 37.2], [126.85, 36.95], [126.4, 36.95], [126.15, 36.8], [126.3, 36.5], [126.5, 36.2], [126.7, 35.95], [126.5, 35.65], [126.45, 35.4], [126.35, 35.05], [126.35, 34.75], [126.45, 34.4], [126.55, 34.3]];
  const KOREA_S = [[126.85, 34.45], [127.25, 34.45], [127.5, 34.65], [127.75, 34.7], [128.05, 34.85], [128.45, 34.85], [128.65, 34.75], [128.8, 35.0], [129.05, 35.07]];
  const KOREA_E = [[129.3, 35.35], [129.45, 35.6], [129.55, 36.05], [129.45, 36.45], [129.4, 36.9], [129.25, 37.35], [129.0, 37.7], [128.6, 38.2], [128.35, 38.65], [127.95, 39.0], [127.55, 39.2], [127.45, 39.5], [127.65, 39.85], [128.2, 40.0], [128.75, 40.4], [129.25, 40.75], [129.7, 41.3], [129.85, 41.8], [130.25, 42.1], [130.7, 42.3]];
  const LIAODONG = [[116, 48], [116, 39], [118, 39.2], [119.5, 40.0], [120.5, 40.6], [121.5, 40.9], [122.3, 40.5], [121.8, 39.7], [121.3, 39.3], [121.6, 38.85], [122.2, 39.2], [122.9, 39.6], [123.6, 39.8]];
  const NORTHEAST = [[131.2, 42.6], [131.8, 43.0], [133, 43.0], [135, 44], [135, 48]];
  const CONTINENT = [...LIAODONG, ...KOREA_W, ...KOREA_S, ...KOREA_E, ...NORTHEAST];
  const SHANDONG = [[116, 37.5], [119, 37.2], [120.3, 37.7], [121.5, 37.6], [122.7, 37.4], [122.4, 36.9], [121, 36.6], [120, 36.0], [119.2, 35.2], [116, 35]];
  const JEJU = [[126.15, 33.3], [126.35, 33.2], [126.8, 33.25], [126.95, 33.45], [126.6, 33.55], [126.25, 33.48]];
  const JAPAN = [[[129.6, 33.3], [130.0, 33.6], [130.5, 33.9], [130.95, 33.95], [131.6, 33.6], [131.9, 32.8], [131.0, 31.3], [130.2, 31.3], [129.7, 32.6]],
    [[130.9, 34.0], [131.4, 34.4], [132.2, 35.0], [133.0, 35.55], [134.0, 35.6], [135.3, 35.75], [136.0, 35.95], [136.8, 36.9], [137.5, 37.5], [140, 38], [140, 33], [135.8, 33.5], [135.2, 34.3], [134.2, 34.7], [133.0, 34.3], [132.3, 34.2], [131.5, 33.95]],
    [[132.0, 33.9], [133.0, 34.2], [134.3, 34.2], [134.7, 33.85], [134.2, 33.3], [133.0, 32.8], [132.5, 32.9]],
    [[129.2, 34.15], [129.45, 34.3], [129.4, 34.7], [129.25, 34.6]]];
  const RIVERS = {
    amnok: [[128.07, 42.0], [127.5, 41.75], [127.0, 41.65], [126.5, 41.4], [126.2, 41.1], [125.6, 40.85], [125.0, 40.5], [124.6, 40.25], [124.35, 40.05]],
    tumen: [[128.07, 42.0], [128.6, 42.05], [129.2, 42.25], [129.75, 42.45], [130.0, 42.95], [130.4, 42.55], [130.7, 42.3]],
    daedong: [[126.9, 40.0], [126.4, 39.5], [125.75, 39.02], [125.45, 38.78], [125.3, 38.7]],
    han: [[128.6, 37.3], [128.0, 37.5], [127.5, 37.55], [127.0, 37.53], [126.8, 37.6], [126.6, 37.72], [126.55, 37.75]],
    liao: [[123.3, 42.3], [122.6, 41.5], [122.05, 40.7]]
  };
  const geoFrame = (lat0, lat1, lonC) => {
    const ky = H / (lat0 - lat1), kx = ky * Math.cos(37.5 * Math.PI / 180);
    const pt = (lon, lat) => [W / 2 + (lon - lonC) * kx, (lat0 - lat) * ky];
    const path = (pts, closed = true) => pts.map(([lo, la], i) => { const [px, py] = pt(lo, la); return `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`; }).join(' ') + (closed ? ' Z' : '');
    return { pt, path };
  };
  const geoMap = (f, opts = {}) => {
    const land = (pts) => `<path d="${f.path(pts)}" fill="#d9caa0" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
    const rivers = (opts.rivers || []).map(k => `<path d="${f.path(RIVERS[k], false)}" fill="none" stroke="#5c8190" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
    const label = (t, lo, la, size = 11) => { const [px, py] = f.pt(lo, la); return `<text x="${px.toFixed(0)}" y="${py.toFixed(0)}" font-size="${size}" text-anchor="middle" fill="#3f6577" stroke="none" ${font}>${t}</text>`; };
    return open('', '', '#c9dde2', '#bdd3d9')
      + land(CONTINENT) + land(SHANDONG) + land(JEJU) + (opts.japan ? JAPAN.map(land).join('') : '')
      + rivers + (opts.labels || []).map(a => label(...a)).join('')
      + `<g transform="translate(456 26)"><path d="M0 -14 L6 4 L0 0 L-6 4 Z" fill="${INK}"/><text y="16" font-size="10" text-anchor="middle" fill="${INK}" ${font}>북</text></g>\n`;
  };
  const FM = geoFrame(43.0, 33.6, 127.0);
  const MDL_PTS = [[126.65, 37.75], [126.68, 37.96], [127.0, 38.1], [127.3, 38.27], [127.6, 38.3], [128.0, 38.33], [128.2, 38.45], [128.37, 38.62]];
  let miniId = 0;
  const arrowHead = (x, y, ang, c = '#b83a2a') => `<path d="M-7 -5 L5 0 L-7 5 Z" fill="${c}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"/>`;
  const classroom = () => open('', '', '#ece3cf', '#e0d4b8') + `<rect y="172" width="${W}" height="58" fill="#a8895a"/><path d="M0 172 H480" stroke="${INK}" opacity=".5"/>\n`;

  // ---------- 소품 ----------
  const n = {
    water: (x, y, s = 1) => T(x, y, s, `<path d="M-32 0 Q-16 -10 0 0 T32 0 V18 H-32 Z" fill="#6e9aa6"/><path d="M-24 8 q6 -3 12 0 t12 0 t12 0" stroke="#d9e8e6" fill="none"/><path d="M-6 -6 L2 -14 L10 -6" fill="none" stroke="#5f7a2e" stroke-width="1.6"/>`),
    pitHouse: (x, y, s = 1) => T(x, y, s, `<path d="M-32 20 L-22 -2 Q0 -36 22 -2 L32 20 Z" fill="#c9ae6a"/><path d="M-18 0 L-14 16 M0 -14 V16 M14 0 L18 16" stroke-width=".9" opacity=".7"/><path d="M-7 20 V8 H7 V20" fill="#5a3a26"/>`),
    clay: (x, y, s = 1) => T(x, y, s, `<path d="M-26 18 Q-22 -10 0 -12 Q22 -10 26 18 Z" fill="#a8613f"/><path d="M-12 2 q12 -7 24 0 M-16 10 q16 -6 32 0" stroke="#7d452b" fill="none" stroke-width="1"/>`),
    pot: (x, y, s = 1, comb = true) => T(x, y, s, `<path d="M-18 -18 H18 Q22 4 6 24 H-6 Q-22 4 -18 -18 Z" fill="#c98a5a"/><ellipse cy="-18" rx="18" ry="4" fill="#8a5a3a"/>${comb ? [-8, 2, 12].map(yy => `<path d="M-16 ${yy} l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5" fill="none" stroke="#6b3f26" stroke-width="1"/>`).join('') : ''}`),
    spindle: (x, y, s = 1) => T(x, y, s, `<ellipse cy="10" rx="16" ry="5" fill="#b9ab90"/><ellipse cy="7" rx="16" ry="5" fill="#d8cfb8"/><circle cy="7" r="2.4" fill="#2a1d14"/><path d="M0 7 V-22" stroke-width="2.4"/><path d="M0 -20 C10 -14 -10 -8 0 -2" fill="none" stroke="#efe5c8" stroke-width="2.2"/>`),
    needle: (x, y, s = 1) => T(x, y, s, `<path d="M-14 18 L12 -22" stroke="#2a1d14" stroke-width="6" fill="none"/><path d="M-14 18 L12 -22" stroke="#e8dcba" stroke-width="4" fill="none"/><ellipse cx="9" cy="-16" rx="1.5" ry="3.4" transform="rotate(34 9 -16)" fill="#2a1d14"/>`),
    cloth: (x, y, s = 1) => T(x, y, s, `<path d="M-26 -14 H26 V14 Q13 8 0 14 T-26 14 Z" fill="#e8dcba"/><g stroke-width=".7" opacity=".55">${[-18, -10, -2, 6].map(yy => `<path d="M-26 ${yy} H26"/>`).join('')}${[-14, 0, 14].map(xx => `<path d="M${xx} -14 V12"/>`).join('')}</g>`),
    ingots: (x, y, s = 1) => T(x, y, s, `<path d="M-30 18 L-24 6 H-4 L2 18 Z" fill="#b8643a"/><path d="M-2 18 L4 6 H24 L30 18 Z" fill="#a9b0b4"/><path d="M-16 6 L-10 -6 H10 L16 6 Z" fill="#c9784a"/>`),
    moldFire: (x, y, s = 1) => T(x, y, s, `<rect x="-26" y="4" width="52" height="16" fill="#8a7355"/><path d="M-18 4 V-4 H18 V4" fill="#6b5f48"/><path d="M-4 -4 Q-12 -18 0 -30 Q6 -18 12 -10 Q16 -2 8 -4 Z" fill="#e8742a"/><path d="M0 -4 Q-4 -12 2 -18 Q6 -10 6 -4 Z" fill="#f6dc7a" stroke-width="0"/>`),
    // 비파형 동검: 위는 좁고 가운데 돌기가 있으며 아래가 비파처럼 둥글게 넓다.
    bronzeSword: (x, y, s = 1) => T(x, y, s, `<path d="M0 -28 C3 -20 5 -12 5 -6 L7.5 -2 L5.5 1 C10.5 5 10.5 14 3 18 V22 H-3 V18 C-10.5 14 -10.5 5 -5.5 1 L-7.5 -2 L-5 -6 C-5 -12 -3 -20 0 -28 Z" fill="#b8944a"/><path d="M0 -24 V16" stroke-width="1.2" opacity=".7"/><rect x="-3" y="22" width="6" height="5" fill="#6b4a30"/>`),
    dolmen: (x, y, s = 1) => T(x, y, s, `<rect x="-34" y="-14" width="68" height="13" rx="5" fill="#a3a39a"/><rect x="-26" y="-1" width="11" height="22" fill="#86867e"/><rect x="15" y="-1" width="11" height="22" fill="#86867e"/>`),
    ramp: (x, y, s = 1) => T(x, y, s, `<path d="M-34 20 L34 -8 V20 Z" fill="#a8905a"/><path d="M-20 14 L20 -2" stroke-width=".8" opacity=".5"/>`),
    logs: (x, y, s = 1) => T(x, y, s, `<rect x="-30" y="-18" width="60" height="16" rx="4" fill="#a3a39a"/>${[-22, -4, 14].map(xx => `<ellipse cx="${xx}" cy="6" rx="8" ry="10" fill="#8a6444"/><ellipse cx="${xx}" cy="6" rx="3" ry="4" fill="#c9a76a" stroke-width=".8"/>`).join('')}`),
    rope: (x, y, s = 1) => T(x, y, s, `<ellipse rx="18" ry="8" cy="4" fill="none" stroke="#b09870" stroke-width="4"/><ellipse rx="10" ry="4" cy="4" fill="none" stroke="#b09870" stroke-width="3"/><path d="M18 4 Q30 -6 36 -16" fill="none" stroke="#b09870" stroke-width="3"/>`),
    // 작은 실제 지도(북쪽 위). kind: 'bronze'=요동·한반도 서북부 동검·고인돌 분포, 'war'=군사분계선, 'regions'=여러 지역 점
    mapMini: (x, y, s = 1, kind = 'regions') => {
      const id = `mm${++miniId}`, k = 64 / 480;
      const extra = kind === 'bronze' ? (() => { const [cx, cy] = FM.pt(124.6, 40.6); return `<ellipse cx="${cx}" cy="${cy}" rx="70" ry="52" fill="#b8944a" fill-opacity=".45" stroke="#8a6a2a" stroke-width="5" stroke-dasharray="14 10"/>`; })()
        : kind === 'war' ? `<path d="${FM.path(MDL_PTS, false)}" fill="none" stroke="#b83a2a" stroke-width="16" stroke-dasharray="26 14"/>`
        : [[126.5, 37.0], [127.5, 35.6], [128.6, 36.6], [127.3, 38.0], [126.9, 35.0], [128.9, 37.5]].map(([lo, la]) => { const [px, py] = FM.pt(lo, la); return `<circle cx="${px}" cy="${py}" r="9" fill="#b83a2a"/>`; }).join('');
      return T(x, y, s, `<clipPath id="${id}"><rect x="-32" y="-20" width="64" height="40"/></clipPath><rect x="-32" y="-20" width="64" height="40" fill="#c9dde2"/><g clip-path="url(#${id})"><g transform="translate(-32 -15.3) scale(${k})" stroke="none"><path d="${FM.path(CONTINENT)}" fill="#d9caa0" stroke="${INK}" stroke-width="5"/><path d="${FM.path(SHANDONG)}" fill="#d9caa0"/>${extra}</g></g><rect x="-32" y="-20" width="64" height="40" fill="none"/>`);
    },
    stele: (x, y, s = 1) => T(x, y, s, `<path d="M-14 22 V-12 Q0 -26 14 -12 V22 Z" fill="#b9b3a2"/><g stroke-width=".8" opacity=".6">${[-8, -2, 4, 10].map(yy => `<path d="M-8 ${yy} H8"/>`).join('')}</g><rect x="-20" y="18" width="40" height="6" fill="#8d8a7e"/>`),
    // 칠지도: 몸체 좌우로 가지 세 개씩 엇갈려 위로 뻗는다(끝 7개).
    sevenSword: (x, y, s = 1) => T(x, y, s, `<path d="M0 -28 V22" stroke="#b8944a" stroke-width="3.4"/><path d="M0 -14 Q-8 -16 -12 -24 M0 -2 Q-8 -4 -12 -12 M0 10 Q-8 8 -12 0 M0 -8 Q8 -10 12 -18 M0 4 Q8 2 12 -6 M0 16 Q8 14 12 6" stroke="#b8944a" stroke-width="2.6" fill="none"/>`),
    horse: (x, y, s = 1, c = '#8a5a35') => T(x, y, s, `<ellipse cx="0" cy="2" rx="22" ry="10" fill="${c}"/><path d="M14 -2 L22 -22 L32 -18 L28 -6 Z" fill="${c}"/><path d="M-20 4 L-24 20 M-10 10 V22 M8 10 V22 M18 6 L22 20" stroke="${c}" stroke-width="3.4" fill="none"/><path d="M-22 0 Q-32 4 -28 16" fill="none" stroke-width="2"/><path d="M20 -20 l-4 4" stroke-width="1.6"/>`),
    bow: (x, y, s = 1) => T(x, y, s, `<path d="M-6 -24 Q22 0 -6 24" fill="none" stroke="#6b4a30" stroke-width="3.4"/><path d="M-6 -24 V24" stroke-width="1"/><path d="M-26 0 H12" stroke-width="1.8"/><path d="M12 0 l-6 -4 v8 Z" fill="#2a1d14"/>`),
    // 덩이쇠(철정): 가운데가 잘록하고 양끝이 넓은 납작한 쇳덩이를 포개 놓았다.
    ironBars: (x, y, s = 1) => T(x, y, s, `${[10, 0, -10].map((yy, i) => `<path d="M${-28 + i * 3} ${yy - 4} L${-16 + i * 3} ${yy - 1.5} H${16 - i * 3} L${28 - i * 3} ${yy - 4} V${yy + 4} L${16 - i * 3} ${yy + 1.5} H${-16 + i * 3} L${-28 + i * 3} ${yy + 4} Z" fill="#6b6f72"/>`).join('')}`),
    armor: (x, y, s = 1) => T(x, y, s, `<path d="M-14 -22 H14 L24 -10 L20 22 H-20 L-24 -10 Z" fill="#6b6f72"/><g stroke-width=".9" opacity=".7">${[-12, -4, 4, 12].map(yy => `<path d="M-20 ${yy} H20"/>`).join('')}</g><path d="M-6 -22 Q0 -14 6 -22" fill="#46494b"/>`),
    muralPanel: (x, y, s = 1) => T(x, y, s, `<rect x="-32" y="-22" width="64" height="44" fill="#d9c38a"/><circle cx="-14" cy="-8" r="6" fill="#c0392b"/><path d="M-30 20 L-14 4 L0 16 L14 2 L30 20 Z" fill="#6f8f5a"/><path d="M6 -14 q8 -6 16 0" fill="none" stroke="#4f7fa0" stroke-width="2"/>`),
    column: (x, y, s = 1) => T(x, y, s, `<path d="M-8 22 Q-12 0 -7 -22 H7 Q12 0 8 22 Z" fill="#a8613f"/><rect x="-12" y="-26" width="24" height="5" fill="#2f6b5a"/><rect x="-12" y="22" width="24" height="5" fill="#b9ab90"/>`),
    scales: (x, y, s = 1) => T(x, y, s, `<path d="M0 22 V-18 M-22 -14 H22 M-10 22 H10" stroke-width="2.4"/><path d="M-22 -14 L-30 6 H-14 Z M22 -14 L14 6 H30 Z" fill="#e8dcba"/>`),
    // 태극기(국기법 도안): 가로:세로 3:2, 태극 지름 = 세로/2, 빨강 위·파랑 아래, 태극 경계 양 끝은 건-곤 대각선 위.
    // 괘: 길이 = 세로/4, 막대 두께 = 세로/24, 간격 = 세로/48, 태극과 괘 사이 = 세로/8. 건 왼쪽 위, 감 오른쪽 위, 리 왼쪽 아래, 곤 오른쪽 아래.
    taegeuk: (x, y, s = 1) => {
      const Hf = 36, Wf = 54, r = Hf / 4, bl = Hf / 4, bw = Hf / 24, gap = Hf / 48;
      const tilt = Math.atan2(2, 3) * 180 / Math.PI;
      const dist = r + Hf / 8 + (3 * bw + 2 * gap) / 2;
      // 각 괘의 막대: 1=이어짐, 0=끊어짐(가운데가 gap만큼 빈다). 바깥쪽 막대부터 안쪽 순서지만 감·리는 대칭이라 순서 영향 없음.
      const tri = { geon: [1, 1, 1], gon: [0, 0, 0], gam: [0, 1, 0], ri: [1, 0, 1] };
      const place = [['geon', -3, -2], ['gam', 3, -2], ['ri', -3, 2], ['gon', 3, 2]];
      const bars = place.map(([k, dx, dy]) => {
        const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
        const cx = ux * dist, cy = uy * dist, ang = Math.atan2(uy, ux) * 180 / Math.PI - 90;
        const rects = tri[k].map((solid, i) => {
          const yy = (i - 1) * (bw + gap) - bw / 2;
          return solid ? `<rect x="${-bl / 2}" y="${yy}" width="${bl}" height="${bw}"/>`
            : `<rect x="${-bl / 2}" y="${yy}" width="${(bl - gap) / 2}" height="${bw}"/><rect x="${gap / 2}" y="${yy}" width="${(bl - gap) / 2}" height="${bw}"/>`;
        }).join('');
        return `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${ang.toFixed(2)})">${rects}</g>`;
      }).join('');
      return T(x, y, s, `<rect x="${-Wf / 2}" y="${-Hf / 2}" width="${Wf}" height="${Hf}" fill="#fffdf4" stroke-width="1"/>`
        + `<g transform="rotate(${tilt.toFixed(2)})" stroke="none"><circle r="${r}" fill="#2f4fa0"/><path d="M${-r} 0 A${r} ${r} 0 0 1 ${r} 0 A${r / 2} ${r / 2} 0 0 0 0 0 A${r / 2} ${r / 2} 0 0 1 ${-r} 0 Z" fill="#c8312b"/></g>`
        + `<g fill="#1b1b1b" stroke="none">${bars}</g>`);
    },
    taegeukFlag: (x, y, s = 1) => T(x, y, s, `<path d="M-14 26 V-24" stroke-width="2"/>`) + n.taegeuk(x + 0.5 * s, y - 13 * s, s * 0.5),
    flagsMany: (x, y, s = 1) => n.taegeukFlag(x - 26, y + 2, s * 0.9) + n.taegeukFlag(x, y, s) + n.taegeukFlag(x + 26, y + 2, s * 0.9),
    radio: (x, y, s = 1) => T(x, y, s, `<rect x="-24" y="-14" width="48" height="32" rx="3" fill="#8a6444"/><circle cx="-10" cy="4" r="9" fill="#d9c8a0"/><g stroke-width=".8" opacity=".7"><circle cx="-10" cy="4" r="5" fill="none"/></g><circle cx="14" cy="-4" r="3.4" fill="#2a1d14"/><circle cx="14" cy="8" r="3.4" fill="#2a1d14"/><path d="M12 -14 L24 -30" stroke-width="2"/>`),
    ballot: (x, y, s = 1) => T(x, y, s, `<rect x="-20" y="-22" width="40" height="44" fill="#f7f1de"/>${[0, 1, 2].map(i => `<rect x="-14" y="${-16 + i * 12}" width="28" height="9" fill="none" stroke-width="1"/><text x="-9" y="${-9 + i * 12}" font-size="8" stroke="none" fill="#2a1d14" ${font}>${i + 1}</text>`).join('')}<circle cx="6" cy="-11" r="3" fill="#b83a2a" stroke="none"/>`),
    ballotBox: (x, y, s = 1) => T(x, y, s, `<rect x="-22" y="-6" width="44" height="28" fill="#8a6444"/><rect x="-12" y="-10" width="24" height="5" fill="#2a1d14"/><rect x="-6" y="-26" width="12" height="18" fill="#f7f1de"/>`),
    cap: (x, y, s = 1) => T(x, y, s, `<path d="M-18 6 Q-18 -14 0 -14 Q18 -14 18 6 Z" fill="#3b3a38"/><rect x="-21" y="6" width="42" height="6" fill="#2a2420"/><circle cy="-3" r="3.4" fill="#c9a23b"/>`),
    board: (x, y, s = 1) => T(x, y, s, `<path d="M-20 24 V-4 M20 24 V-4" stroke-width="3"/><rect x="-28" y="-24" width="56" height="30" fill="#c9b98c"/>${[[-22, -20], [-4, -20], [14, -20]].map(([a, b], i) => `<rect x="${a}" y="${b}" width="14" height="20" fill="#f7f1de" transform="rotate(${[-4, 3, -2][i]} ${a + 7} ${b + 10})"/>`).join('')}`),
    transit: (x, y, s = 1) => T(x, y, s, `<path d="M0 -2 L-16 24 M0 -2 L16 24 M0 -2 V24" stroke-width="2.4"/><rect x="-12" y="-20" width="24" height="16" rx="2" fill="#6b4a30"/><circle cx="0" cy="-12" r="5" fill="#c9ccd1"/>`),
    landMap: (x, y, s = 1) => T(x, y, s, `<rect x="-30" y="-20" width="60" height="40" fill="#f3ead2"/>${[[-28, -18, 18, 14, '#a8b073'], [-8, -18, 20, 22, '#c9ae6a'], [14, -18, 14, 16, '#8fa86a'], [-28, -2, 18, 20, '#c9ae6a'], [14, 0, 14, 18, '#a8b073'], [-8, 6, 20, 12, '#8fa86a']].map(([a, b, c, d, f]) => `<rect x="${a}" y="${b}" width="${c}" height="${d}" fill="${f}" stroke-width=".9"/>`).join('')}`),
    nameTags: (x, y, s = 1) => T(x, y, s, `${[-14, 14].map(a => `<rect x="${a - 11}" y="-16" width="22" height="34" fill="#d9c8a0"/><path d="M${a - 6} -8 H${a + 6} M${a - 6} 0 H${a + 6} M${a - 6} 8 H${a + 2}" stroke-width="1.2"/>`).join('')}<path d="M-28 -6 L28 8" stroke="#b83a2a" stroke-width="2.6"/>`),
    blackboard: (x, y, s = 1, hangul = true) => T(x, y, s, `<rect x="-32" y="-22" width="64" height="40" fill="#3f5a4a" stroke="#8a5a35" stroke-width="3"/>${hangul ? `<text x="-18" y="-2" font-size="14" fill="#f3ead2" stroke="none" ${font}>ㄱㄴㄷ</text>` : ''}<path d="M-24 10 H8" stroke="#f3ead2" stroke-width="1.4" opacity="${hangul ? 1 : 0.35}"/>`),
    candles: (x, y, s = 1) => T(x, y, s, `${[[-16, 4], [0, -2], [16, 6]].map(([a, b]) => `<rect x="${a - 4}" y="${b}" width="8" height="${20 - b}" fill="#f3ead2"/><path d="M${a} ${b - 2} q-5 -8 0 -16 q5 8 0 16 Z" fill="#f6b84a"/>`).join('')}`),
    studentCap: (x, y, s = 1) => T(x, y, s, `<ellipse cy="6" rx="18" ry="5" fill="#161c30"/><path d="M-15 6 Q-15 -12 0 -12 Q15 -12 15 6 Z" fill="#22305a"/><circle cy="-2" r="3" fill="#c9a23b"/>`),
    magnifier: (x, y, s = 1) => T(x, y, s, `<circle cx="-4" cy="-6" r="14" fill="#e6f0f2" fill-opacity=".6" stroke-width="3"/><path d="M6 4 L22 20" stroke="#6b4a30" stroke-width="5"/>`),
    tent: (x, y, s = 1) => T(x, y, s, `<path d="M-32 20 L0 -22 L32 20 Z" fill="#c9bf9c"/><path d="M0 -22 V20" stroke-width=".9"/><path d="M-8 20 L0 4 L8 20 Z" fill="#6b5f48"/><path d="M-32 20 H32" stroke-width="1.6"/>`),
    shanty: (x, y, s = 1) => [[-26, 6, 0.55], [2, 0, 0.7], [28, 8, 0.5]].map(([a, b, k]) => T(x + a * s, y + b * s, s * k, `<path d="M-30 -6 L30 -14 L34 -4 L-26 4 Z" fill="#8c9096"/><rect x="-24" y="4" width="48" height="26" fill="#a8774a"/><rect x="-6" y="12" width="12" height="18" fill="#4a3220"/>`)).join(''),
    dmzFence: (x, y, s = 1) => T(x, y, s, `${[-26, -9, 8, 25].map(a => `<path d="M${a} 22 V-16" stroke-width="2.6"/>`).join('')}<path d="M-30 -10 Q-18 -4 -9 -10 T8 -10 T30 -10 M-30 2 Q-18 8 -9 2 T8 2 T30 2" fill="none" stroke-width="1.2"/><g stroke-width="1.2">${[-18, 0, 17].map(a => `<path d="M${a - 3} -13 l6 6 m0 -6 l-6 6"/>`).join('')}</g>`),
    dove: (x, y, s = 1) => T(x, y, s, `<path d="M-22 6 Q-8 -14 4 -6 Q14 -16 24 -8 Q14 -2 8 4 Q18 8 24 4 Q14 18 -4 14 Q-16 12 -22 6 Z" fill="#fffdf4"/><circle cx="18" cy="-4" r="1.6" fill="#2a1d14" stroke="none"/><path d="M20 -2 l8 2" stroke-width="2"/><path d="M-10 18 q10 6 22 0" fill="none" stroke="#5f7a2e" stroke-width="2"/>`),
    lotus: (x, y, s = 1) => T(x, y, s, `<circle cy="-8" r="17" fill="none" stroke="#c9a24a" stroke-width="2" stroke-dasharray="4 3"/><path d="M-26 20 Q-22 4 -12 8 Q-10 -2 0 4 Q10 -2 12 8 Q22 4 26 20 Z" fill="#e9c9d2"/><rect x="-20" y="20" width="40" height="5" fill="#b9ab90"/>`),
    dome: (x, y, s = 1) => T(x, y, s, `<path d="M-32 22 A32 32 0 0 1 32 22 Z" fill="#b9b3a2"/><g stroke-width=".9" opacity=".7">${[-24, -12, 0, 12, 24].map(a => `<path d="M${a} 22 L${a * 0.2} -8"/>`).join('')}${[10, 0, -10].map(b => `<path d="M${-30 + (10 - b) * 0.4} ${b} H${30 - (10 - b) * 0.4}"/>`).join('')}</g><circle cy="-8" r="5" fill="#e9c9d2"/>`),
    pagodaPlain: (x, y, s = 1) => T(x, y, s, `${[[22, 26, 18], [4, 20, 14], [-12, 14, 10]].map(([yy, w, hh]) => `<rect x="${-w / 2 + 2}" y="${yy - hh}" width="${w - 4}" height="${hh - 4}" fill="#cfc9b8"/><path d="M${-w / 2 - 5} ${yy - 4} H${w / 2 + 5} L${w / 2 + 1} ${yy - 9} H${-w / 2 - 1} Z" fill="#9a958a"/>`).join('')}<path d="M0 -20 V-30" stroke-width="2"/>`),
    pagodaOrnate: (x, y, s = 1) => T(x, y, s, `<rect x="-22" y="14" width="44" height="8" fill="#9a958a"/><rect x="-15" y="2" width="30" height="12" fill="#cfc9b8"/><path d="M-20 2 H20 L16 -4 H-16 Z" fill="#9a958a"/><path d="M-12 -4 L-9 -16 H9 L12 -4 Z" fill="#cfc9b8"/><path d="M-14 -16 H14 L10 -22 H-10 Z" fill="#9a958a"/><path d="M-6 -22 L0 -32 L6 -22 Z" fill="#b8944a"/><g stroke-width=".8">${[-10, -4, 2, 8].map(a => `<path d="M${a} 2 V14"/>`).join('')}</g>`),
    // 청운교·백운교: 석축 위 자하문으로 오르는 두 단 돌계단, 아래쪽 계단 밑에 무지개 모양 홍예
    stairs: (x, y, s = 1) => T(x, y, s, `<rect x="-36" y="-2" width="72" height="24" fill="#cfc9b8"/><g stroke-width=".6" opacity=".6">${[4, 10, 16].map(yy => `<path d="M-36 ${yy} H36"/>`).join('')}</g><path d="M-14 22 L-2 -2 H14 L2 22 Z" fill="#e4dfd0"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${-12 + i * 2} ${18 - i * 4} H${4 + i * 2}" stroke-width=".8"/>`).join('')}<path d="M-12 22 Q-6 12 0 22" fill="#6b6558"/><rect x="-10" y="-14" width="20" height="12" fill="#a8613f"/><path d="M-16 -14 H16 L10 -22 H-10 Z" fill="#3e4a42"/>`),
    grid9: (x, y, s = 1) => T(x, y, s, `<rect x="-24" y="-24" width="48" height="48" fill="#efe3bd"/>${[0, 1, 2].map(i => [0, 1, 2].map(j => `<rect x="${-24 + j * 16}" y="${-24 + i * 16}" width="16" height="16" fill="${['#c9d1a8', '#e8d9a0', '#bfd0c8'][(i + j) % 3]}" stroke-width=".9"/>`).join('')).join('')}`),
    fiveCities: (x, y, s = 1) => T(x, y, s, `<rect x="-26" y="-22" width="52" height="44" fill="#efe3bd"/>${[[-14, -10], [14, -12], [0, 0], [-14, 12], [14, 10]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="5" fill="#b83a2a"/>`).join('')}<path d="M-14 -10 L14 -12 L14 10 L-14 12 Z" fill="none" stroke-width=".9" stroke-dasharray="3 3"/>`),
    crown: (x, y, s = 1) => T(x, y, s, `<path d="M-22 14 L-24 -10 L-12 0 L0 -18 L12 0 L24 -10 L22 14 Z" fill="#c9a24a"/><circle cx="0" cy="2" r="3.4" fill="#2f6b5a"/><circle cx="-12" cy="6" r="2.4" fill="#b83a2a"/><circle cx="12" cy="6" r="2.4" fill="#b83a2a"/>`),
    ondol: (x, y, s = 1) => T(x, y, s, `<rect x="-32" y="-4" width="64" height="9" fill="#b9ab90"/><rect x="-32" y="5" width="64" height="16" fill="#8a6f4a"/><path d="M-26 14 H24 M-26 14 q0 -6 6 -6" fill="none" stroke="#e8742a" stroke-width="2.4"/><path d="M-30 20 Q-34 8 -26 12 Q-24 4 -20 12 Q-16 6 -18 20 Z" fill="#e8742a"/><path d="M26 -4 q4 -8 -2 -14 q6 -2 2 -10" fill="none" stroke="#a8a8a0" stroke-width="2"/>`),
    stoneLantern: (x, y, s = 1) => T(x, y, s, `<rect x="-16" y="16" width="32" height="6" fill="#9a958a"/><rect x="-5" y="2" width="10" height="14" fill="#cfc9b8"/><rect x="-12" y="-6" width="24" height="9" fill="#9a958a"/><rect x="-8" y="-16" width="16" height="10" fill="#e8dcba"/><path d="M-18 -16 H18 L10 -26 H-10 Z" fill="#9a958a"/>`),
    blocks: (x, y, s = 1) => T(x, y, s, `${[10, -2, -14].map((yy, i) => `<rect x="${-30 + i * 2}" y="${yy}" width="${56 - i * 4}" height="10" fill="#c9a76a"/><path d="M${-26 + i * 2} ${yy + 5} H${22 - i * 2}" stroke-width=".8" stroke-dasharray="2 2"/><rect x="${-36 + i * 2}" y="${yy + 2}" width="6" height="6" fill="#8a6444"/><rect x="${26 - i * 2}" y="${yy + 2}" width="6" height="6" fill="#8a6444"/>`).join('')}`),
    typeSet: (x, y, s = 1) => T(x, y, s, `<rect x="-28" y="-20" width="56" height="40" fill="#8a6444"/>${[0, 1, 2].map(i => [0, 1, 2, 3, 4].map(j => `<rect x="${-24 + j * 10}" y="${-16 + i * 12}" width="7" height="9" fill="#a9b0b4" stroke-width=".8"/>`).join('')).join('')}`),
    // 상감 청자: 둥근 테 안의 학과 구름 무늬
    celadon: (x, y, s = 1) => T(x, y, s, `<path d="M-6 -24 H6 Q6 -16 14 -6 Q20 12 8 22 H-8 Q-20 12 -14 -6 Q-6 -16 -6 -24 Z" fill="#8fb5a8"/><g fill="none" stroke="#f3f7f2" stroke-width="1"><circle cx="-4" cy="2" r="6"/><circle cx="7" cy="-6" r="4.5"/></g><g fill="none" stroke="#f3f7f2" stroke-width="1.2"><path d="M-8 2 L-4 0 L0 2 M-4 0 L-3 4"/><path d="M4 -6 L7 -7.5 L10 -6"/><path d="M-10 14 q3 -3 6 0 q3 -3 6 0 M2 12 q2 -2 4 0"/></g>`),
    notebook: (x, y, s = 1, t = '日記') => m.book(x, y, s, t),
    // 전통 배: 둥근 선체에 대나무 살이 든 네모 돛(근대 서양식 삼각돛과 구별)
    junk: (x, y, s = 1) => T(x, y, s, `<path d="M-32 4 Q0 10 32 2 L26 16 Q0 20 -26 16 Z" fill="#8a6444"/><path d="M-4 4 V-30 M14 4 V-20" stroke-width="2"/><rect x="-18" y="-28" width="26" height="28" fill="#e8dcba"/><g stroke-width=".8">${[-21, -14, -7].map(yy => `<path d="M-18 ${yy} H8"/>`).join('')}</g><rect x="8" y="-18" width="16" height="18" fill="#e8dcba"/><path d="M8 -9 H24" stroke-width=".8"/>`),
    // 홑처마 단층 건물(무량수전 등). col=기둥 색
    singleHall: (x, y, s = 1, col = '#a83a2a') => T(x, y, s, `${stoneBase(40, 18, 6)}${bays(34, 0, 18, 5, col, '#d9c38a')}<g transform="translate(0 0)">${dancheong(36, -4, 4)}</g><g transform="translate(0 -2)">${roof(46, 18, 26)}</g>`),
    // 장경판전: 낮고 긴 홑처마 건물, 벽에 살창
    storehouse: (x, y, s = 1) => T(x, y, s, `${stoneBase(46, 16, 5)}${bays(42, 0, 16, 7, '#6b4a30', '#d9c8a0')}<g stroke-width=".7">${[-30, -18, -6, 6, 18, 30].map(a => `<rect x="${a - 4}" y="4" width="8" height="7" fill="#efe5c8"/><path d="M${a - 2} 4 V11 M${a} 4 V11 M${a + 2} 4 V11"/>`).join('')}</g><g transform="translate(0 -2)">${roof(52, 12, 38)}</g>`),
    reeds: (x, y, s = 1) => T(x, y, s, `${[-14, -6, 2, 10].map((a, i) => `<path d="M${a} 18 Q${a + 2} 0 ${a + (i % 2 ? 6 : -4)} -14" fill="none" stroke="#5f7a2e" stroke-width="1.8"/><ellipse cx="${a + (i % 2 ? 6 : -4)}" cy="-16" rx="2" ry="5" fill="#8a6444" stroke-width=".6"/>`).join('')}`),
    // 청동기 집: 바닥이 직사각형인 움집. big=true이면 크게
    longHouse: (x, y, s = 1) => T(x, y, s, `<path d="M-34 18 L-26 -4 H26 L34 18 Z" fill="#c9ae6a"/><path d="M-26 -4 L-18 -18 H18 L26 -4" fill="#b89a58"/><g stroke-width=".8" opacity=".6"><path d="M-20 0 L-24 16 M0 -2 V16 M20 0 L24 16"/></g><path d="M-6 18 V8 H6 V18" fill="#5a3a26"/>`)
  };

  // ---------- 1단원 ----------
  const riverLeft = () => outdoor('#dfeaee', '#e8e2b7') + `<path d="M40 116 C90 150 20 178 70 230 L170 230 C120 182 180 150 120 116 Z" fill="#6e9aa6"/><g fill="none" stroke="#d9e8e6" stroke-width="1.6" opacity=".7"><path d="M70 160 q8 -4 16 0 t16 0"/><path d="M90 200 q8 -4 16 0 t16 0"/></g>
`;
  scenes['neolithic-village'] = make('강가의 갈대, 강 옆 밭, 움집이 있는 신석기 마을', riverLeft, [n.reeds(150, 84, 1.1), m.seedRows(...C, 1), n.pitHouse(...R, 1.1)]);
  scenes['bronze-village'] = make('벼를 기르는 논, 크기가 다른 집, 군장의 고인돌과 청동검', outdoor.bind(null, '#e4e4cc', '#efe3bd', '#a8b073'), [m.paddy(...L, 1.1), n.longHouse(206, 112, 1.2), n.longHouse(276, 120, 0.7), n.dolmen(360, 84, 0.9), n.bronzeSword(404, 76, 0.9)]);
  scenes['neolithic-pottery'] = make('진흙 덩이, 뾰족한 바닥의 빗살무늬 토기', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#b9a678'), [n.clay(...P(0.22, 0.65), 1.1), n.pot(...P(0.5, 0.45, 28), 1.3, false), n.pot(...P(0.78, 0.65), 1.1, true)]);
  scenes['neolithic-weaving'] = make('가락바퀴, 뼈바늘, 짜 놓은 옷감', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#b9a678'), [n.spindle(...L, 1.2), n.needle(...P(0.5, 0.38, 26), 1.3), n.cloth(...R, 1.1)]);
  scenes['neolithic-summary'] = make('움집, 빗살무늬 토기, 가락바퀴가 모인 정착 마을', river.bind(null, '#dfeaee', '#e8e2b7'), [n.pitHouse(110, 96, 1.2), n.pot(240, 108, 1.2), n.spindle(370, 100, 1.2), m.sprout(300, 148, 1)]);
  scenes['gojoseon-artifacts'] = make('구리·주석 덩이, 불과 거푸집, 청동 검', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.ingots(...L, 1.2), n.moldFire(...C, 1.2), n.bronzeSword(...R, 1.3)]);
  scenes['gojoseon-bronze-culture'] = make('비파형 동검, 탁자식 고인돌, 동검·고인돌이 나온 지역 지도', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.bronzeSword(...L, 1.3), n.dolmen(...C, 1.2), n.mapMini(...R, 1.3, 'bronze')]);
  scenes['bronze-dolmen-transport'] = make('흙 경사로, 통나무 굴림대 위의 큰 돌, 밧줄', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.ramp(...P(0.24, 0.56), 1.1), n.logs(...P(0.52, 0.48, 28), 1.3), n.rope(...P(0.78, 0.58), 1.2)]);
  const FN = geoFrame(42.3, 36.3, 126.4);
  const fort = (lo, la) => { const [px, py] = FN.pt(lo, la); return m.wall(px, py - 22, 0.45); };
  scenes['gojoseon-map'] = make('요동과 한반도 북부 지도, 위치가 확정되지 않은 도읍 아사달 표지', () => geoMap(FN, { rivers: ['liao', 'amnok', 'tumen', 'daedong'], labels: [['황해', 123.8, 38.3], ['동해', 130.5, 39.0], ['요하', 121.6, 41.6, 9]] }),
    [`<g><rect x="352" y="100" width="112" height="120" rx="6" fill="#f7f1de" stroke="#8a7355" stroke-width="1.4"/><text x="408" y="198" font-size="10" text-anchor="middle" fill="${INK}" ${font}>전해지는 도읍</text><text x="408" y="212" font-size="9" text-anchor="middle" fill="#6b5a4a" ${font}>(위치는 여러 설)</text></g>`, m.mount(408, 126, 0.7)]);
  scenes['gojoseon-law'] = make('여덟 가지 법 조항을 새긴 목판', room, [m.plaque(...L, 1, '殺'), m.plaque(...C, 1.1, '傷'), m.plaque(...R, 1, '盜'), n.scales(240, 56, 0.8)]);
  scenes['gojoseon-summary'] = make('건국 전승의 산, 8조법 목판, 비파형 동검', maptex, [m.mount(...LB, 1.2), m.plaque(...CB, 1.1, '八條'), n.bronzeSword(...RB, 1.3)]);
  scenes['three-kingdoms-baekje'] = make('한강 유역과 칠지도, 백제의 도성', river.bind(null, '#e4e4cc', '#efe3bd'), [m.hanokVillage(...L, 1), n.sevenSword(...C, 1.3), m.boat(...R, 1)]);
  scenes['three-kingdoms-goguryeo'] = make('평양성, 국내성, 한강이 실제 위치에 놓인 지도', () => geoMap(FN, { rivers: ['amnok', 'tumen', 'daedong', 'han'], labels: [['황해', 123.8, 38.3], ['동해', 130.5, 39.0]] }), [fort(125.75, 39.02), fort(126.19, 41.13)]);
  scenes['three-kingdoms-silla'] = make('한강 유역에 세운 비석과 강', river.bind(null, '#e4e4cc', '#efe3bd'), [n.stele(...L, 1.2), n.stele(...C, 1.4), m.boat(...R, 1)]);
  scenes['three-kingdoms-summary'] = make('칠지도, 비석, 성곽 깃발이 모인 삼국의 한강', outdoor.bind(null, '#e4dcc4', '#d4cbb0'), [n.sevenSword(110, 98, 1.2), n.stele(240, 104, 1.3), m.banners(370, 98, 1.1)]);
  scenes['goguryeo-mural-costume'] = make('고분 벽화 앞의 말, 활과 화살', tomb, [n.horse(...L, 1.2), n.bow(...C, 1.2), n.muralPanel(...R, 1.1)]);
  scenes['gaya-ironware'] = make('덩이쇠, 철제 판갑옷, 말갑옷', tomb, [n.ironBars(...L, 1.2), n.armor(...C, 1.3), n.horse(...R, 1.1, '#6b6f72')]);
  scenes['three-kingdoms-life-summary'] = make('벽화, 철갑옷, 말이 있는 고분', tomb, [n.muralPanel(110, 96, 1.3), n.armor(240, 100, 1.3), n.horse(370, 104, 1.2)]);
  scenes['goryeo-unification-map'] = make('지친 마을, 흩어진 깃발, 통합을 선언하는 문서', maptex, [m.houseBroken(...L, 1.1), m.banners(...C, 1.2), m.scroll(...R, 1.2)]);
  scenes['goryeo-balhae-refuge'] = make('발해 유민이 머문 마을과 고구려를 이은 산', outdoor.bind(null, '#dee3d8', '#eef0e7', '#a6b396'), [m.wall(...L, 1.1), m.hut(...C, 1.2), m.mount(...R, 1.1), m.flagpole(404, 92, 0.9)]);
  scenes['goryeo-hunyo'] = make('호족의 군사와 재산, 반란의 불씨, 훈요 문서', room, [m.spearRack(...L, 1.1), m.cracked(...C, 1), m.scroll(...R, 1.3)]);
  scenes['goryeo-founding-summary'] = make('송악의 마을과 강, 훈요 문서, 도성 성벽', river.bind(null, '#dfeaee', '#edf1dd'), [m.hanokVillage(...L, 1.1), m.scroll(...C, 1.3), m.wall(...R, 1.1), m.flagpole(404, 70, 0.9)]);
  scenes['goryeo-inheritance-trial'] = make('유서와 상속 문서, 공평한 저울', room, [m.scroll(...L, 1.2), m.letter(...C, 1.3), n.scales(...R, 1.2)]);
  scenes['goryeo-buseoksa'] = make('가운데가 불룩한 배흘림기둥과 단층 무량수전', courtyard, [n.column(...L, 1.3), n.column(...C, 1.6), n.singleHall(...R, 0.85)]);
  scenes['goryeo-society-summary'] = make('홍패와 상속 저울, 배흘림기둥', room, [m.scroll(110, 98, 1.2), n.scales(240, 100, 1.3), n.column(370, 98, 1.3)]);
  scenes['goryeo-seohui-negotiation'] = make('국서 문서, 압록강 교통로, 강동 6주의 성', outdoor.bind(null, '#e3ded0', '#efeadc', '#a9b090'), [m.scroll(...L, 1.2), m.mapRiver(...C, 1.4), m.wall(...R, 1.2)]);
  scenes['goryeo-heunghwajin'] = make('흥화진의 성, 삼교천 강물, 창 거치대', outdoor.bind(null, '#96a0ab', '#c7ccd0', '#71808a'), [m.wall(...L, 1.2), m.mapRiver(...C, 1.5), m.spearRack(...R, 1.1)]);
  scenes['goryeo-gwiju'] = make('귀주 벌판의 승전 깃발, 북쪽 성, 전쟁 뒤 문서', outdoor.bind(null, '#dfe6d8', '#edf0e5', '#819567'), [m.banners(...L, 1.1), m.wall(...C, 1.2), m.scroll(...R, 1.2)]);
  scenes['goryeo-war-evidence'] = make('서희의 문서, 강동 6주 지도, 다시 세운 집', outdoor.bind(null, '#e3ded0', '#efeadc', '#a9b090'), [m.scroll(...L, 1.2), m.mapRiver(...C, 1.4), m.hut(...R, 1.2)]);
  scenes['goryeo-tripitaka-carving'] = make('쌓아 둔 팔만대장경 경판', room, [n.blocks(110, 100, 1.3), n.blocks(240, 112, 1.5), n.blocks(370, 100, 1.3)]);
  scenes['goryeo-metal-type'] = make('금속활자 판과 직지 책', room, [n.typeSet(150, 106, 1.5), m.book(310, 108, 1.4, '直指'), m.lantern(410, 90, 1)]);
  scenes['goryeo-byeokrando'] = make('벽란도의 무역선, 직지를 찍은 흥덕사, 대장경을 둔 해인사 장경판전', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [n.junk(...P(0.22, 0.52), 1.2), m.book(...P(0.5, 0.68), 1.3, '直指'), n.storehouse(...P(0.78, 0.52, 22), 0.95)]);
  scenes['goryeo-culture-evidence'] = make('청자, 금속활자 책, 경판', room, [n.celadon(110, 98, 1.4), m.book(240, 104, 1.3, '直指'), n.blocks(370, 100, 1.3)]);
  scenes['unified-silla-government'] = make('아홉 주 상징도, 다섯 소경 상징도, 왕의 교서', maptex, [n.grid9(...L, 1.1), n.fiveCities(...C, 1.2), m.treatyDoc(...R, 1.1)]);
  scenes['unified-silla-bulguksa'] = make('석가탑, 다보탑, 청운교·백운교', courtyard, [n.pagodaPlain(...L, 1.3), n.pagodaOrnate(...C, 1.5), n.stairs(...R, 1.2)]);
  scenes['unified-silla-seokguram'] = make('석굴암의 돔 천장, 연꽃 좌대, 연꽃', tomb, [n.dome(...L, 1.2), n.lotus(...C, 1.4), n.lotus(...R, 1)]);
  scenes['unified-silla-summary'] = make('9주 5소경 상징도, 불국사 탑, 당과 오간 배', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [n.grid9(...L, 1.1), n.pagodaOrnate(...C, 1.4), n.junk(...R, 1.1)]);
  scenes['balhae-dongmosan'] = make('동모산의 새 나라 깃발과 마을', outdoor.bind(null, '#dfe3dc', '#ebe8d4', '#8e9a76'), [m.hut(...L, 1.1), m.hut(...C, 1.2), m.mount(...R, 1.2), m.flagpole(398, 90, 1)]);
  scenes['balhae-document'] = make('창 거치대, 외교 국서, 궁궐 건물', room, [m.spearRack(...L, 1.1), m.letter(...C, 1.3), n.singleHall(...R, 0.8)]);
  scenes['balhae-heritage'] = make('온돌 구조, 일본에 보낸 국서, 석등', courtyard, [n.ondol(...L, 1.2), m.letter(...C, 1.3), n.stoneLantern(...R, 1.2)]);
  scenes['balhae-evidence'] = make('온돌 구조, 국서, 주민 기록 장부', room, [n.ondol(...L, 1.2), m.letter(...C, 1.3), m.ledger(...R, 1.2)]);

  // ---------- 3단원 ----------
  scenes['gwangbok-radio-announcement'] = make('광복의 날짜를 알리는 달력, 라디오, 태극기', room, [m.calendar(...L, 1.2), n.radio(...C, 1.3), n.taegeuk(...R, 1.2)]);
  scenes['gwangbok-committee-office'] = make('치안·식량 장부, 곡식 자루, 태극기', room, [m.ledger(...L, 1.2), m.sacks(...C, 1.2), n.taegeuk(...R, 1.2)]);
  scenes['gwangbok-ballot-booth'] = make('투표용지, 투표함, 공평한 저울', classroom, [n.ballot(...L, 1.2), n.ballotBox(...C, 1.3), n.scales(...R, 1.2)]);
  scenes['tapgol-declaration'] = make('독립선언서, 여러 모자, 태극기', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a6b396'), [m.scroll(...L3, 1.2), m.gat(...C3, 1.2), n.taegeuk(...R3, 1.2), n.pagodaPlain(420, 128, 0.7)]);
  scenes['aunae-market-rally'] = make('학생 모자, 장터 좌판, 태극기', street, [n.studentCap(...L3, 1.3), m.stalls(...C3, 1), n.flagsMany(...R3, 1)]);
  scenes['shanghai-provisional-government'] = make('임시헌장 문서, 국민 주권, 민주공화제 현판', hall, [m.scroll(...L3, 1.2), m.plaque(...C3, 1.1, '主權'), m.plaque(...R3, 1.1, '共和')]);
  scenes['independence-evidence'] = make('독립선언서, 시위 기록, 임시헌장', room, [m.scroll(...L, 1.2), m.ledger(...C, 1.2), m.plaque(...R, 1, '憲章')]);
  const FO = geoFrame(40.7, 33.1, 127.5);
  const at = (f, lo, la) => f.pt(lo, la).map(v => +v.toFixed(1));
  scenes['korean-war-outbreak'] = () => {
    const y38 = FO.pt(127, 38)[1];
    const route = [[127.0, 37.4], [127.6, 36.9], [127.95, 36.4], [128.45, 35.8], [128.9, 35.3]];
    const [ex, ey] = FO.pt(128.9, 35.3), [px, py] = FO.pt(128.45, 35.8);
    const [sx, sy] = at(FO, 126.98, 37.56), [bx, by] = at(FO, 129.05, 35.1);
    return geoMap(FO, { rivers: ['amnok', 'tumen', 'daedong', 'han'], japan: true, labels: [['황해', 124.6, 36.0], ['동해', 131.0, 38.4]] }).replace(/aria-label=""/, 'aria-label="38선과 서울에서 부산 쪽으로 향한 피난 길이 그려진 한반도 지도"')
      + `<path d="M0 ${y38.toFixed(1)} H480" stroke="#b83a2a" stroke-width="1.8" stroke-dasharray="6 5"/>`
      + `<path d="${FO.path(route, false)}" fill="none" stroke="#b83a2a" stroke-width="2.4" stroke-dasharray="5 3"/>` + arrowHead(ex, ey, Math.atan2(ey - py, ex - px) * 180 / Math.PI)
      + `<circle cx="${sx}" cy="${sy}" r="3" fill="${INK}"/><text x="${sx - 6}" y="${sy + 12}" font-size="9" text-anchor="end" fill="${INK}" stroke="#fffdf4" stroke-width="2.5" paint-order="stroke" ${font}>서울</text><circle cx="${bx}" cy="${by}" r="3" fill="${INK}"/>`
      + close;
  };
  scenes['korean-war-front'] = make('낙동강 전선, 학생 일기, 피난 수레', field, [m.mapRiver(...L, 1.5), n.notebook(...C, 1.3), m.cart(...R, 1.2)]);
  const FA = geoFrame(39.0, 36.9, 127.4);
  const MDL = MDL_PTS;
  scenes['korean-war-armistice'] = () => {
    const y38 = FA.pt(127, 38)[1];
    const [sx, sy] = at(FA, 126.98, 37.56), [ix, iy] = at(FA, 126.63, 37.47), [px, py] = at(FA, 126.68, 37.96);
    return geoMap(FA, { rivers: ['han'], labels: [['황해', 125.6, 37.2], ['동해', 129.6, 38.3]] }).replace(/aria-label=""/, 'aria-label="서쪽 한강 하구에서 동쪽으로 갈수록 북쪽으로 올라가는 군사분계선, 판문점과 인천이 표시된 지도"')
      + `<path d="M0 ${y38.toFixed(1)} H480" stroke="#7a7466" stroke-width="1" stroke-dasharray="2 4"/><text x="472" y="${(y38 - 4).toFixed(0)}" font-size="9" text-anchor="end" fill="#5a5448" ${font}>북위 38도</text>`
      + `<path d="${FA.path(MDL, false)}" fill="none" stroke="#b83a2a" stroke-width="2.6" stroke-dasharray="7 4"/>`
      + `<circle cx="${sx}" cy="${sy}" r="3" fill="${INK}"/><text x="${sx + 6}" y="${sy + 3}" font-size="9" fill="${INK}" ${font}>서울</text><circle cx="${ix}" cy="${iy}" r="3" fill="${INK}"/>`
      + `<rect x="${px - 5}" y="${py - 14}" width="10" height="7" fill="#8a6444" stroke="${INK}" stroke-width=".8"/>`
      + close;
  };
  scenes['korean-war-exhibit'] = make('전쟁 지도, 기록 일기, 정전 문서', hall, [n.mapMini(...LB, 1.2, 'war'), n.notebook(...CB, 1.3), m.treatyDoc(...RB, 1.1)]);
  scenes['righteous-army-background'] = make('을사늑약 문서, 갓과 농기구, 여러 지역 지도', room, [m.treatyDoc(...LB, 1.1), m.gat(CB[0] - 16, CB[1], 1.1), m.hoe(CB[0] + 20, CB[1], 0.9), n.mapMini(...RB, 1.2)]);
  scenes['righteous-army-flag'] = make('유리 진열장 속 태극기와 이름 명단, 돋보기', hall, [n.taegeuk(...L3, 1.4), m.scroll(...P(0.5, 0.68), 1.2), n.magnifier(...R3, 1.2)]);
  scenes['righteous-army-trial'] = make('대한의군 현판, 재판 기록, 동양 평화 책', hall, [m.plaque(...LB, 1.1, '義軍'), m.scroll(...CB, 1.3), m.book(...RB, 1.2, '東洋')]);
  scenes['righteous-army-exhibit'] = make('의병 기록, 태극기, 동양평화론 전시', hall, [m.showcase(...LB, 1.1, m.scroll(0, 0, 0.8)), m.showcase(...CB, 1.2, n.taegeuk(0, 0, 0.7)), m.showcase(...RB, 1.1, m.book(0, 0, 0.9, '平和'))]);
  scenes['gendarme-rule-ordinance'] = make('헌병 모자, 즉결 처분 문서, 일상 통제 게시판', street, [n.cap(...L, 1.3), m.scroll(...C, 1.2), n.board(...R, 1.2)]);
  scenes['land-survey-office'] = make('측량 기구, 토지 지도, 곡식 자루', field, [n.transit(...L, 1.2), n.landMap(...C, 1.4), m.sacks(...R, 1.1)]);
  scenes['secret-society-oath'] = make('어두운 방의 등불, 서약 문서, 숨긴 궤', darkRoom, [m.lantern(...L, 1.3), m.scroll(...C, 1.2), m.chest(...R, 1.1)]);
  scenes['colonial-1910s-evidence'] = make('헌병 모자, 토지 지도, 비밀 결사 기록', hall, [n.cap(...L, 1.2), n.landMap(...C, 1.3), m.scroll(...R, 1.2)]);
  scenes['imperial-subject-policy'] = make('정책 문서, 이름표, 글씨 없는 학교 칠판', classroom, [m.scroll(...L, 1.2), n.nameTags(...C, 1.3), n.blackboard(...R, 1.1, false)]);
  scenes['memorial-candlelight'] = make('동원 기록 장부, 증언 편지, 추모 촛불', darkRoom, [m.ledger(...L, 1.2), m.letter(...C, 1.3), n.candles(...R, 1.3)]);
  scenes['korean-language-society'] = make('사전 원고, 한글 글자판, 맞춤법 책', room, [m.scroll(...L, 1.2), m.letters(...C, 1.1), m.book(...R, 1.2, '한글')]);
  scenes['colonial-1930s-evidence'] = make('정책 문서, 동원 장부, 한글 책', hall, [m.scroll(...L, 1.2), m.ledger(...C, 1.2), m.book(...R, 1.2, '한글')]);
  scenes['busan-shanty-rebuild'] = make('피난민 판잣집, 나눈 밥, 새 싹', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.shanty(...L, 1.3), m.rice(...C, 1.4), m.sprout(...R, 1.3)]);
  scenes['tent-classroom'] = make('천막 교실, 책, 칠판', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.tent(...L, 1.3), m.book(...C, 1.3, '國語'), n.blackboard(...R, 1.1)]);
  scenes['dmz-reunion-peace'] = make('이산가족 편지, 철조망 울타리, 평화의 비둘기', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [m.letter(...L, 1.3), n.dmzFence(...C, 1.5), n.dove(...R, 1.3)]);
  scenes['post-war-evidence'] = make('피난 생활 기록, 천막 교실, 이산가족 편지', hall, [n.shanty(...L, 1.2), n.tent(...C, 1.3), m.letter(...R, 1.3)]);
};
