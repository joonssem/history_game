// 1단원(고대~고려)·3단원(근현대) 정규 MUD 장면 SVG (사물·배경만, 인물 없음). gen_scene_art.js가 불러 쓴다.
// 핫스팟이 표준 위치(.22/.5/.78, .48/.65/.48)가 아닌 장면은 P(hx, hy)로 소품 위치를 잡는다(핫스팟 위 32px).
module.exports = function (scenes, h, U) {
  const { open, close, mountains, sea, ripples, panokseon, INK, W, H } = h;
  const { m, T, st, L, C, R, make, outdoor, river, room, courtyard, modernStreet, field, street, hall, maptex, palaceYard } = U;
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
    bronzeSword: (x, y, s = 1) => T(x, y, s, `<path d="M0 -28 C10 -14 9 -6 4 0 C8 4 8 8 2 10 V20 H-2 V10 C-8 8 -8 4 -4 0 C-9 -6 -10 -14 0 -28 Z" fill="#b8944a"/><path d="M0 -24 V8" stroke-width=".8" opacity=".6"/><rect x="-5" y="20" width="10" height="4" fill="#6b4a30"/>`),
    dolmen: (x, y, s = 1) => T(x, y, s, `<rect x="-34" y="-14" width="68" height="13" rx="5" fill="#a3a39a"/><rect x="-26" y="-1" width="11" height="22" fill="#86867e"/><rect x="15" y="-1" width="11" height="22" fill="#86867e"/>`),
    ramp: (x, y, s = 1) => T(x, y, s, `<path d="M-34 20 L34 -8 V20 Z" fill="#a8905a"/><path d="M-20 14 L20 -2" stroke-width=".8" opacity=".5"/>`),
    logs: (x, y, s = 1) => T(x, y, s, `<rect x="-30" y="-18" width="60" height="16" rx="4" fill="#a3a39a"/>${[-22, -4, 14].map(xx => `<ellipse cx="${xx}" cy="6" rx="8" ry="10" fill="#8a6444"/><ellipse cx="${xx}" cy="6" rx="3" ry="4" fill="#c9a76a" stroke-width=".8"/>`).join('')}`),
    rope: (x, y, s = 1) => T(x, y, s, `<ellipse rx="18" ry="8" cy="4" fill="none" stroke="#b09870" stroke-width="4"/><ellipse rx="10" ry="4" cy="4" fill="none" stroke="#b09870" stroke-width="3"/><path d="M18 4 Q30 -6 36 -16" fill="none" stroke="#b09870" stroke-width="3"/>`),
    mapMini: (x, y, s = 1) => T(x, y, s, `<rect x="-26" y="-20" width="52" height="40" fill="#dfe8ea"/><path d="M-8 -20 H12 C16 -6 14 6 8 14 C2 20 -6 16 -12 6 C-14 -4 -10 -12 -8 -20 Z" fill="#cdbf94"/><path d="M-12 -6 H14" stroke="#b83a2a" stroke-dasharray="3 3" fill="none"/>`),
    stele: (x, y, s = 1) => T(x, y, s, `<path d="M-14 22 V-12 Q0 -26 14 -12 V22 Z" fill="#b9b3a2"/><g stroke-width=".8" opacity=".6">${[-8, -2, 4, 10].map(yy => `<path d="M-8 ${yy} H8"/>`).join('')}</g><rect x="-20" y="18" width="40" height="6" fill="#8d8a7e"/>`),
    sevenSword: (x, y, s = 1) => T(x, y, s, `<path d="M0 -26 V22" stroke="#b8944a" stroke-width="3.4"/><path d="M0 -14 L-14 -22 M0 -4 L14 -12 M0 6 L-14 -2 M0 -14 L14 -22 M0 -4 L-14 -12 M0 6 L14 -2" stroke="#b8944a" stroke-width="2.6" fill="none"/>`),
    horse: (x, y, s = 1, c = '#8a5a35') => T(x, y, s, `<ellipse cx="0" cy="2" rx="22" ry="10" fill="${c}"/><path d="M14 -2 L22 -22 L32 -18 L28 -6 Z" fill="${c}"/><path d="M-20 4 L-24 20 M-10 10 V22 M8 10 V22 M18 6 L22 20" stroke="${c}" stroke-width="3.4" fill="none"/><path d="M-22 0 Q-32 4 -28 16" fill="none" stroke-width="2"/><path d="M20 -20 l-4 4" stroke-width="1.6"/>`),
    bow: (x, y, s = 1) => T(x, y, s, `<path d="M-6 -24 Q22 0 -6 24" fill="none" stroke="#6b4a30" stroke-width="3.4"/><path d="M-6 -24 V24" stroke-width="1"/><path d="M-26 0 H12" stroke-width="1.8"/><path d="M12 0 l-6 -4 v8 Z" fill="#2a1d14"/>`),
    ironBars: (x, y, s = 1) => T(x, y, s, `${[[-26, 8], [-26, -2], [-26, -12], [-2, 8], [-2, -2]].map(([a, b]) => `<rect x="${a}" y="${b}" width="${a < -10 ? 40 : 28}" height="8" rx="1.5" fill="#6b6f72"/>`).join('')}`),
    armor: (x, y, s = 1) => T(x, y, s, `<path d="M-14 -22 H14 L24 -10 L20 22 H-20 L-24 -10 Z" fill="#6b6f72"/><g stroke-width=".9" opacity=".7">${[-12, -4, 4, 12].map(yy => `<path d="M-20 ${yy} H20"/>`).join('')}</g><path d="M-6 -22 Q0 -14 6 -22" fill="#46494b"/>`),
    muralPanel: (x, y, s = 1) => T(x, y, s, `<rect x="-32" y="-22" width="64" height="44" fill="#d9c38a"/><circle cx="-14" cy="-8" r="6" fill="#c0392b"/><path d="M-30 20 L-14 4 L0 16 L14 2 L30 20 Z" fill="#6f8f5a"/><path d="M6 -14 q8 -6 16 0" fill="none" stroke="#4f7fa0" stroke-width="2"/>`),
    column: (x, y, s = 1) => T(x, y, s, `<path d="M-8 22 Q-12 0 -7 -22 H7 Q12 0 8 22 Z" fill="#a8613f"/><rect x="-12" y="-26" width="24" height="5" fill="#2f6b5a"/><rect x="-12" y="22" width="24" height="5" fill="#b9ab90"/>`),
    scales: (x, y, s = 1) => T(x, y, s, `<path d="M0 22 V-18 M-22 -14 H22 M-10 22 H10" stroke-width="2.4"/><path d="M-22 -14 L-30 6 H-14 Z M22 -14 L14 6 H30 Z" fill="#e8dcba"/>`),
    taegeuk: (x, y, s = 1) => T(x, y, s, `<rect x="-27" y="-19" width="54" height="38" fill="#fffdf4"/><path d="M-9 0 A9 9 0 0 1 9 0 Z" fill="#c0392b"/><path d="M-9 0 A9 9 0 0 0 9 0 Z" fill="#2f5d9c"/><g stroke-width="2" stroke="#2a1d14">${[[-20, -12, 1], [20, -12, -1], [-20, 12, -1], [20, 12, 1]].map(([a, b, d]) => `<path d="M${a - 4} ${b - 3} h8 M${a - 4} ${b} h8 M${a - 4} ${b + 3} h8" transform="rotate(${d * 30} ${a} ${b})"/>`).join('')}</g>`),
    flagsMany: (x, y, s = 1) => m.flagpole(x - 24, y, s * 0.9) + m.flagpole(x, y + 2, s) + m.flagpole(x + 24, y, s * 0.9),
    radio: (x, y, s = 1) => T(x, y, s, `<rect x="-24" y="-14" width="48" height="32" rx="3" fill="#8a6444"/><circle cx="-10" cy="4" r="9" fill="#d9c8a0"/><g stroke-width=".8" opacity=".7"><circle cx="-10" cy="4" r="5" fill="none"/></g><circle cx="14" cy="-4" r="3.4" fill="#2a1d14"/><circle cx="14" cy="8" r="3.4" fill="#2a1d14"/><path d="M12 -14 L24 -30" stroke-width="2"/>`),
    ballot: (x, y, s = 1) => T(x, y, s, `<rect x="-20" y="-22" width="40" height="44" fill="#f7f1de"/>${[0, 1, 2].map(i => `<rect x="-14" y="${-16 + i * 12}" width="28" height="9" fill="none" stroke-width="1"/><text x="-9" y="${-9 + i * 12}" font-size="8" stroke="none" fill="#2a1d14" ${font}>${i + 1}</text>`).join('')}<circle cx="6" cy="-11" r="3" fill="#b83a2a" stroke="none"/>`),
    ballotBox: (x, y, s = 1) => T(x, y, s, `<rect x="-22" y="-6" width="44" height="28" fill="#8a6444"/><rect x="-12" y="-10" width="24" height="5" fill="#2a1d14"/><rect x="-6" y="-26" width="12" height="18" fill="#f7f1de"/>`),
    cap: (x, y, s = 1) => T(x, y, s, `<path d="M-18 6 Q-18 -14 0 -14 Q18 -14 18 6 Z" fill="#3b3a38"/><rect x="-21" y="6" width="42" height="6" fill="#2a2420"/><circle cy="-3" r="3.4" fill="#c9a23b"/>`),
    board: (x, y, s = 1) => T(x, y, s, `<path d="M-20 24 V-4 M20 24 V-4" stroke-width="3"/><rect x="-28" y="-24" width="56" height="30" fill="#c9b98c"/>${[[-22, -20], [-4, -20], [14, -20]].map(([a, b], i) => `<rect x="${a}" y="${b}" width="14" height="20" fill="#f7f1de" transform="rotate(${[-4, 3, -2][i]} ${a + 7} ${b + 10})"/>`).join('')}`),
    transit: (x, y, s = 1) => T(x, y, s, `<path d="M0 -2 L-16 24 M0 -2 L16 24 M0 -2 V24" stroke-width="2.4"/><rect x="-12" y="-20" width="24" height="16" rx="2" fill="#6b4a30"/><circle cx="0" cy="-12" r="5" fill="#c9ccd1"/>`),
    landMap: (x, y, s = 1) => T(x, y, s, `<rect x="-30" y="-20" width="60" height="40" fill="#f3ead2"/>${[[-28, -18, 18, 14, '#a8b073'], [-8, -18, 20, 22, '#c9ae6a'], [14, -18, 14, 16, '#8fa86a'], [-28, -2, 18, 20, '#c9ae6a'], [14, 0, 14, 18, '#a8b073'], [-8, 6, 20, 12, '#8fa86a']].map(([a, b, c, d, f]) => `<rect x="${a}" y="${b}" width="${c}" height="${d}" fill="${f}" stroke-width=".9"/>`).join('')}`),
    nameTags: (x, y, s = 1) => T(x, y, s, `${[-14, 14].map(a => `<rect x="${a - 11}" y="-16" width="22" height="34" fill="#d9c8a0"/><path d="M${a - 6} -8 H${a + 6} M${a - 6} 0 H${a + 6} M${a - 6} 8 H${a + 2}" stroke-width="1.2"/>`).join('')}<path d="M-28 -6 L28 8" stroke="#b83a2a" stroke-width="2.6"/>`),
    blackboard: (x, y, s = 1) => T(x, y, s, `<rect x="-32" y="-22" width="64" height="40" fill="#3f5a4a" stroke="#8a5a35" stroke-width="3"/><text x="-18" y="-2" font-size="14" fill="#f3ead2" stroke="none" ${font}>ㄱㄴㄷ</text><path d="M-24 10 H8" stroke="#f3ead2" stroke-width="1.4"/>`),
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
    stairs: (x, y, s = 1) => T(x, y, s, `<path d="M-34 22 L-24 -8 H24 L34 22 Z" fill="#cfc9b8"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${-33 + i * 2} ${22 - i * 6} H${33 - i * 2}" stroke-width=".9"/>`).join('')}<path d="M-12 22 Q0 4 12 22" fill="#9a958a"/>`),
    grid9: (x, y, s = 1) => T(x, y, s, `<rect x="-24" y="-24" width="48" height="48" fill="#efe3bd"/>${[0, 1, 2].map(i => [0, 1, 2].map(j => `<rect x="${-24 + j * 16}" y="${-24 + i * 16}" width="16" height="16" fill="${['#c9d1a8', '#e8d9a0', '#bfd0c8'][(i + j) % 3]}" stroke-width=".9"/>`).join('')).join('')}`),
    fiveCities: (x, y, s = 1) => T(x, y, s, `<rect x="-26" y="-22" width="52" height="44" fill="#efe3bd"/>${[[-14, -10], [14, -12], [0, 0], [-14, 12], [14, 10]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="5" fill="#b83a2a"/>`).join('')}<path d="M-14 -10 L14 -12 L14 10 L-14 12 Z" fill="none" stroke-width=".9" stroke-dasharray="3 3"/>`),
    crown: (x, y, s = 1) => T(x, y, s, `<path d="M-22 14 L-24 -10 L-12 0 L0 -18 L12 0 L24 -10 L22 14 Z" fill="#c9a24a"/><circle cx="0" cy="2" r="3.4" fill="#2f6b5a"/><circle cx="-12" cy="6" r="2.4" fill="#b83a2a"/><circle cx="12" cy="6" r="2.4" fill="#b83a2a"/>`),
    ondol: (x, y, s = 1) => T(x, y, s, `<rect x="-32" y="-4" width="64" height="9" fill="#b9ab90"/><rect x="-32" y="5" width="64" height="16" fill="#8a6f4a"/><path d="M-26 14 H24 M-26 14 q0 -6 6 -6" fill="none" stroke="#e8742a" stroke-width="2.4"/><path d="M-30 20 Q-34 8 -26 12 Q-24 4 -20 12 Q-16 6 -18 20 Z" fill="#e8742a"/><path d="M26 -4 q4 -8 -2 -14 q6 -2 2 -10" fill="none" stroke="#a8a8a0" stroke-width="2"/>`),
    stoneLantern: (x, y, s = 1) => T(x, y, s, `<rect x="-16" y="16" width="32" height="6" fill="#9a958a"/><rect x="-5" y="2" width="10" height="14" fill="#cfc9b8"/><rect x="-12" y="-6" width="24" height="9" fill="#9a958a"/><rect x="-8" y="-16" width="16" height="10" fill="#e8dcba"/><path d="M-18 -16 H18 L10 -26 H-10 Z" fill="#9a958a"/>`),
    blocks: (x, y, s = 1) => T(x, y, s, `${[10, -2, -14].map((yy, i) => `<rect x="${-30 + i * 2}" y="${yy}" width="${56 - i * 4}" height="10" fill="#c9a76a"/><path d="M${-26 + i * 2} ${yy + 5} H${22 - i * 2}" stroke-width=".8" stroke-dasharray="2 2"/><rect x="${-36 + i * 2}" y="${yy + 2}" width="6" height="6" fill="#8a6444"/><rect x="${26 - i * 2}" y="${yy + 2}" width="6" height="6" fill="#8a6444"/>`).join('')}`),
    typeSet: (x, y, s = 1) => T(x, y, s, `<rect x="-28" y="-20" width="56" height="40" fill="#8a6444"/>${[0, 1, 2].map(i => [0, 1, 2, 3, 4].map(j => `<rect x="${-24 + j * 10}" y="${-16 + i * 12}" width="7" height="9" fill="#a9b0b4" stroke-width=".8"/>`).join('')).join('')}`),
    celadon: (x, y, s = 1) => T(x, y, s, `<path d="M-6 -24 H6 Q6 -16 14 -6 Q20 12 8 22 H-8 Q-20 12 -14 -6 Q-6 -16 -6 -24 Z" fill="#8fb5a8"/><path d="M-12 4 q12 6 24 0" fill="none" stroke="#e0efe9" stroke-width="1.2"/><circle cx="-4" cy="-4" r="2.4" fill="#e0efe9" stroke="none"/><circle cx="5" cy="-6" r="2.4" fill="#e0efe9" stroke="none"/>`),
    notebook: (x, y, s = 1, t = '日記') => m.book(x, y, s, t)
  };

  // ---------- 1단원 ----------
  scenes['neolithic-village'] = make('강가와 농경지, 움집이 있는 신석기 마을', river.bind(null, '#dfeaee', '#e8e2b7'), [n.water(...L, 1.1), m.sprout(...C, 1.2), n.pitHouse(...R, 1.1)]);
  scenes['neolithic-pottery'] = make('진흙 덩이, 뾰족한 바닥의 빗살무늬 토기', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#b9a678'), [n.clay(...P(0.22, 0.65), 1.1), n.pot(...P(0.5, 0.45, 28), 1.3, false), n.pot(...P(0.78, 0.65), 1.1, true)]);
  scenes['neolithic-weaving'] = make('가락바퀴, 뼈바늘, 짜 놓은 옷감', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#b9a678'), [n.spindle(...L, 1.2), n.needle(...P(0.5, 0.38, 26), 1.3), n.cloth(...R, 1.1)]);
  scenes['neolithic-summary'] = make('움집, 빗살무늬 토기, 가락바퀴가 모인 정착 마을', river.bind(null, '#dfeaee', '#e8e2b7'), [n.pitHouse(110, 96, 1.2), n.pot(240, 108, 1.2), n.spindle(370, 100, 1.2), m.sprout(300, 148, 1)]);
  scenes['gojoseon-artifacts'] = make('청동 재료, 불과 거푸집, 비파형 동검과 고인돌', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.dolmen(330, 100, 0.9), n.ingots(...L, 1.2), n.moldFire(...C, 1.2), n.bronzeSword(...R, 1.3)]);
  scenes['bronze-dolmen-transport'] = make('흙 경사로, 통나무 굴림대 위의 큰 돌, 밧줄', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.ramp(...P(0.24, 0.56), 1.1), n.logs(...P(0.52, 0.48, 28), 1.3), n.rope(...P(0.78, 0.58), 1.2)]);
  scenes['gojoseon-map'] = make('요동의 성, 한반도 북부의 강, 산 위 아사달', maptex, [m.wall(...L, 1.1), m.mapRiver(...C, 1.4), m.mount(...R, 1.1), m.hut(398, 112, 0.7)]);
  scenes['gojoseon-law'] = make('여덟 가지 법 조항을 새긴 목판', room, [m.plaque(...L, 1, '殺'), m.plaque(...C, 1.1, '傷'), m.plaque(...R, 1, '盜'), n.scales(240, 56, 0.8)]);
  scenes['gojoseon-summary'] = make('건국 전승의 산, 8조법 목판, 비파형 동검', maptex, [m.mount(...LB, 1.2), m.plaque(...CB, 1.1, '八條'), n.bronzeSword(...RB, 1.3)]);
  scenes['three-kingdoms-baekje'] = make('한강 유역과 칠지도, 백제의 도성', river.bind(null, '#e4e4cc', '#efe3bd'), [m.hanokVillage(...L, 1), n.sevenSword(...C, 1.3), m.boat(...R, 1)]);
  scenes['three-kingdoms-goguryeo'] = make('평양성과 국내성, 가운데 한강 유역', maptex, [m.wall(...L, 1.2), m.mapRiver(...C, 1.5), m.wall(...R, 1.2), m.gate(374, 106, 0.6)]);
  scenes['three-kingdoms-silla'] = make('한강 유역에 세운 비석과 강', river.bind(null, '#e4e4cc', '#efe3bd'), [n.stele(...L, 1.2), n.stele(...C, 1.4), m.boat(...R, 1)]);
  scenes['three-kingdoms-summary'] = make('칠지도, 비석, 성곽 깃발이 모인 삼국의 한강', outdoor.bind(null, '#e4dcc4', '#d4cbb0'), [n.sevenSword(110, 98, 1.2), n.stele(240, 104, 1.3), m.banners(370, 98, 1.1)]);
  scenes['goguryeo-mural-costume'] = make('고분 벽화 앞의 말, 활과 화살', tomb, [n.horse(...L, 1.2), n.bow(...C, 1.2), n.muralPanel(...R, 1.1)]);
  scenes['gaya-ironware'] = make('덩이쇠, 철제 판갑옷, 말갑옷', tomb, [n.ironBars(...L, 1.2), n.armor(...C, 1.3), n.horse(...R, 1.1, '#6b6f72')]);
  scenes['three-kingdoms-life-summary'] = make('벽화, 철갑옷, 말이 있는 고분', tomb, [n.muralPanel(110, 96, 1.3), n.armor(240, 100, 1.3), n.horse(370, 104, 1.2)]);
  scenes['goryeo-unification-map'] = make('지친 마을, 흩어진 깃발, 통합을 선언하는 문서', maptex, [m.houseBroken(...L, 1.1), m.banners(...C, 1.2), m.scroll(...R, 1.2)]);
  scenes['goryeo-balhae-refuge'] = make('발해 유민이 머문 마을과 고구려를 이은 산', outdoor.bind(null, '#dee3d8', '#eef0e7', '#a6b396'), [m.wall(...L, 1.1), m.hut(...C, 1.2), m.mount(...R, 1.1), m.flagpole(404, 92, 0.9)]);
  scenes['goryeo-hunyo'] = make('호족의 군사와 재산, 반란의 불씨, 훈요 문서', room, [m.spearRack(...L, 1.1), m.cracked(...C, 1), m.scroll(...R, 1.3)]);
  scenes['goryeo-founding-summary'] = make('송악의 도읍과 강, 훈요 문서', river.bind(null, '#dfeaee', '#edf1dd'), [m.hanokVillage(...L, 1.1), m.scroll(...C, 1.3), m.palaceGate(...R, 0.8)]);
  scenes['goryeo-inheritance-trial'] = make('유서와 상속 문서, 공평한 저울', room, [m.scroll(...L, 1.2), m.letter(...C, 1.3), n.scales(...R, 1.2)]);
  scenes['goryeo-buseoksa'] = make('가운데가 불룩한 배흘림기둥과 무량수전', courtyard, [n.column(...L, 1.3), n.column(...C, 1.6), m.palaceHall(...R, 0.7)]);
  scenes['goryeo-society-summary'] = make('홍패와 상속 저울, 배흘림기둥', room, [m.scroll(110, 98, 1.2), n.scales(240, 100, 1.3), n.column(370, 98, 1.3)]);
  scenes['goryeo-seohui-negotiation'] = make('국서 문서, 압록강 교통로, 강동 6주의 성', outdoor.bind(null, '#e3ded0', '#efeadc', '#a9b090'), [m.scroll(...L, 1.2), m.mapRiver(...C, 1.4), m.wall(...R, 1.2)]);
  scenes['goryeo-heunghwajin'] = make('흥화진의 성, 삼교천 강물, 창 거치대', outdoor.bind(null, '#96a0ab', '#c7ccd0', '#71808a'), [m.wall(...L, 1.2), m.mapRiver(...C, 1.5), m.spearRack(...R, 1.1)]);
  scenes['goryeo-gwiju'] = make('귀주 벌판의 승전 깃발, 북쪽 성, 전쟁 뒤 문서', outdoor.bind(null, '#dfe6d8', '#edf0e5', '#819567'), [m.banners(...L, 1.1), m.wall(...C, 1.2), m.scroll(...R, 1.2)]);
  scenes['goryeo-war-evidence'] = make('서희의 문서, 강동 6주 지도, 다시 세운 집', outdoor.bind(null, '#e3ded0', '#efeadc', '#a9b090'), [m.scroll(...L, 1.2), m.mapRiver(...C, 1.4), m.hut(...R, 1.2)]);
  scenes['goryeo-tripitaka-carving'] = make('쌓아 둔 팔만대장경 경판', room, [n.blocks(110, 100, 1.3), n.blocks(240, 112, 1.5), n.blocks(370, 100, 1.3)]);
  scenes['goryeo-metal-type'] = make('금속활자 판과 직지 책', room, [n.typeSet(150, 106, 1.5), m.book(310, 108, 1.4, '直指'), m.lantern(410, 90, 1)]);
  scenes['goryeo-byeokrando'] = make('벽란도의 배, 직지를 찍은 흥덕사, 대장경을 둔 해인사', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [m.ship(...P(0.22, 0.52), 1.2), m.book(...P(0.5, 0.68), 1.3, '直指'), m.palaceHall(...P(0.78, 0.52, 22), 0.7)]);
  scenes['goryeo-culture-evidence'] = make('청자, 금속활자 책, 경판', room, [n.celadon(110, 98, 1.4), m.book(240, 104, 1.3, '直指'), n.blocks(370, 100, 1.3)]);
  scenes['unified-silla-government'] = make('아홉 주 지도, 다섯 소경, 왕의 관', maptex, [n.grid9(...L, 1.1), n.fiveCities(...C, 1.2), n.crown(...R, 1.3)]);
  scenes['unified-silla-bulguksa'] = make('석가탑, 다보탑, 청운교·백운교', courtyard, [n.pagodaPlain(...L, 1.3), n.pagodaOrnate(...C, 1.5), n.stairs(...R, 1.2)]);
  scenes['unified-silla-seokguram'] = make('석굴암의 돔 천장, 연꽃 좌대, 연꽃', tomb, [n.dome(...L, 1.2), n.lotus(...C, 1.4), n.lotus(...R, 1)]);
  scenes['unified-silla-summary'] = make('9주 5소경 지도, 불국사 탑, 당과 오간 배', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [n.grid9(...L, 1.1), n.pagodaOrnate(...C, 1.4), m.ship(...R, 1.1)]);
  scenes['balhae-dongmosan'] = make('동모산의 새 나라 깃발과 마을', outdoor.bind(null, '#dfe3dc', '#ebe8d4', '#8e9a76'), [m.hut(...L, 1.1), m.hut(...C, 1.2), m.mount(...R, 1.2), m.flagpole(398, 90, 1)]);
  scenes['balhae-document'] = make('창 거치대, 외교 국서, 궁궐 전각', room, [m.spearRack(...L, 1.1), m.letter(...C, 1.3), m.palaceHall(...R, 0.8)]);
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
  scenes['korean-war-outbreak'] = make('38선과 남쪽으로 향한 피난 길, 부산', peninsulaA, [m.hut(...P(0.35, 0.55, 20), 0.6), m.cart(...P(0.5, 0.25, -12), 0.6), m.ship(...P(0.65, 0.76, 24), 0.55)]);
  scenes['korean-war-front'] = make('낙동강 전선, 학생 일기, 피난 수레', field, [m.mapRiver(...L, 1.5), n.notebook(...C, 1.3), m.cart(...R, 1.2)]);
  scenes['korean-war-armistice'] = make('인천, 판문점, 군사분계선', peninsulaB, [m.ship(...P(0.24, 0.55, 22), 0.6), m.desk(...P(0.5, 0.34, 22), 0.4), n.dmzFence(...P(0.76, 0.55, 22), 0.8)]);
  scenes['korean-war-exhibit'] = make('전쟁 지도, 기록 일기, 정전 문서', hall, [n.mapMini(...LB, 1.2), n.notebook(...CB, 1.3), m.treatyDoc(...RB, 1.1)]);
  scenes['righteous-army-background'] = make('을사늑약 문서, 갓과 농기구, 여러 지역 지도', room, [m.treatyDoc(...LB, 1.1), m.gat(CB[0] - 16, CB[1], 1.1), m.hoe(CB[0] + 20, CB[1], 0.9), n.mapMini(...RB, 1.2)]);
  scenes['righteous-army-flag'] = make('유리 진열장 속 태극기와 이름 명단, 돋보기', hall, [n.taegeuk(...L3, 1.4), m.scroll(...P(0.5, 0.68), 1.2), n.magnifier(...R3, 1.2)]);
  scenes['righteous-army-trial'] = make('대한의군 현판, 재판 기록, 동양 평화 책', hall, [m.plaque(...LB, 1.1, '義軍'), m.scroll(...CB, 1.3), m.book(...RB, 1.2, '東洋')]);
  scenes['righteous-army-exhibit'] = make('의병 기록, 태극기, 동양평화론 전시', hall, [m.showcase(...LB, 1.1, m.scroll(0, 0, 0.8)), m.showcase(...CB, 1.2, n.taegeuk(0, 0, 0.7)), m.showcase(...RB, 1.1, m.book(0, 0, 0.9, '平和'))]);
  scenes['gendarme-rule-ordinance'] = make('헌병 모자, 즉결 처분 문서, 일상 통제 게시판', street, [n.cap(...L, 1.3), m.scroll(...C, 1.2), n.board(...R, 1.2)]);
  scenes['land-survey-office'] = make('측량 기구, 토지 지도, 곡식 자루', field, [n.transit(...L, 1.2), n.landMap(...C, 1.4), m.sacks(...R, 1.1)]);
  scenes['secret-society-oath'] = make('어두운 방의 등불, 서약 문서, 숨긴 궤', darkRoom, [m.lantern(...L, 1.3), m.scroll(...C, 1.2), m.chest(...R, 1.1)]);
  scenes['colonial-1910s-evidence'] = make('헌병 모자, 토지 지도, 비밀 결사 기록', hall, [n.cap(...L, 1.2), n.landMap(...C, 1.3), m.scroll(...R, 1.2)]);
  scenes['imperial-subject-policy'] = make('정책 문서, 이름표, 학교 칠판', classroom, [m.scroll(...L, 1.2), n.nameTags(...C, 1.3), n.blackboard(...R, 1.1)]);
  scenes['memorial-candlelight'] = make('동원 기록 장부, 증언 편지, 추모 촛불', darkRoom, [m.ledger(...L, 1.2), m.letter(...C, 1.3), n.candles(...R, 1.3)]);
  scenes['korean-language-society'] = make('사전 원고, 한글 글자판, 맞춤법 책', room, [m.scroll(...L, 1.2), m.letters(...C, 1.1), m.book(...R, 1.2, '한글')]);
  scenes['colonial-1930s-evidence'] = make('정책 문서, 동원 장부, 한글 책', hall, [m.scroll(...L, 1.2), m.ledger(...C, 1.2), m.book(...R, 1.2, '한글')]);
  scenes['busan-shanty-rebuild'] = make('피난민 판잣집, 나눈 밥, 새 싹', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.shanty(...L, 1.3), m.rice(...C, 1.4), m.sprout(...R, 1.3)]);
  scenes['tent-classroom'] = make('천막 교실, 책, 칠판', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.tent(...L, 1.3), m.book(...C, 1.3, '國語'), n.blackboard(...R, 1.1)]);
  scenes['dmz-reunion-peace'] = make('이산가족 편지, 철조망 울타리, 평화의 비둘기', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [m.letter(...L, 1.3), n.dmzFence(...C, 1.5), n.dove(...R, 1.3)]);
  scenes['post-war-evidence'] = make('피난 생활 기록, 천막 교실, 이산가족 편지', hall, [n.shanty(...L, 1.2), n.tent(...C, 1.3), m.letter(...R, 1.3)]);
};
