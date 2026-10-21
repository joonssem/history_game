// 구석기 정규 MUD 장면 SVG (사물·자연만, 인물 없음). 장면 키는 활동 모드 이름(paleo-*)이다.
// 핫스팟은 js/mudSimulators.js의 getPaleoHotspots·getPaleoEnvironmentHotspots에 있다. 소품은 핫스팟 원 위쪽에 둔다.
// 캔버스 위쪽 약 40px은 안내 배너가 덮고, 아래쪽은 진행 글자가 있으므로 소품을 두지 않는다.
// 고증: 간석기·토기·농경·활은 그리지 않는다. 뗀석기(주먹도끼·찍개·긁개), 불, 가죽, 막집, 사냥감만 쓴다.
module.exports = function (scenes, h, U) {
  const { open, close, mountains, INK, W, H } = h;
  const { T, make } = U;
  const P = (hx, hy, dy = 32) => [Math.round(hx * W), Math.round(hy * H - dy)];

  // ---------- 배경 ----------
  const valley = (ground = '#9fb07a') => open('', '', '#dfe6e0', '#e8e2c8') + mountains(112)
    + `<rect y="112" width="${W}" height="${H - 112}" fill="${ground}"/><g filter="url(#wash)" opacity=".3"><path d="M0 150 Q120 136 240 152 T480 146 V230 H0 Z" fill="#7b8c68"/></g>\n`;
  const gravel = () => open('', '', '#dfe6e0', '#e8e2c8') + mountains(96)
    + `<path d="M0 96 H480 V122 Q240 112 0 124 Z" fill="#6e9aa6"/><rect y="122" width="${W}" height="${H - 122}" fill="#b8ad96"/>`
    + `<g fill="#a39882" stroke="${INK}" stroke-width=".6" opacity=".8">${Array.from({ length: 34 }, (_, i) => { const x = (i * 71) % 470 + 6, y = 132 + ((i * 37) % 92); return `<ellipse cx="${x}" cy="${y}" rx="${5 + (i % 4) * 2}" ry="${3 + (i % 3)}"/>`; }).join('')}</g>\n`;
  const dusk = () => open('', '', '#e8d2b0', '#efe0c4') + mountains(118)
    + `<rect y="118" width="${W}" height="${H - 118}" fill="#a89270"/><g filter="url(#wash)" opacity=".3"><path d="M0 160 Q140 146 260 160 T480 152 V230 H0 Z" fill="#7d6a4f"/></g>\n`;

  // ---------- 소품 ----------
  const p = {
    // 바위 그늘: 튀어나온 절벽 아래 움푹한 공간
    shelter: (x, y, s = 1) => T(x, y, s, `<path d="M-60 30 V-30 Q-40 -56 0 -52 Q46 -50 60 -28 L58 -16 Q30 -26 0 -22 Q-30 -20 -40 2 L-36 30 Z" fill="#8a7a66"/><path d="M-36 30 Q-34 0 0 -18 Q34 -24 56 -14 L54 30 Z" fill="#4a3f36"/><g stroke-width=".8" opacity=".6"><path d="M-50 -20 L-30 -40 M10 -44 L30 -36"/></g>`),
    // 강: 왼쪽 위에서 오른쪽 아래로 흐르는 물줄기
    riverBand: () => `<path d="M300 112 C330 140 300 170 350 230 L440 230 C400 176 420 140 380 112 Z" fill="#6e9aa6"/><g fill="none" stroke="#d9e8e6" stroke-width="1.6" opacity=".7"><path d="M340 150 q8 -4 16 0 t16 0"/><path d="M360 196 q8 -4 16 0 t16 0"/></g>`,
    windGrass: (x, y, s = 1) => T(x, y, s, `${[-30, -18, -6, 6, 18, 30].map((a, i) => `<path d="M${a} 16 Q${a + 4} 2 ${a + 14} ${-6 - (i % 2) * 4}" fill="none" stroke="#5f7a2e" stroke-width="2"/>`).join('')}<g fill="none" stroke="#8a9aa4" stroke-width="1.6" stroke-linecap="round"><path d="M-34 -16 H6 Q14 -16 14 -22"/><path d="M-24 -6 H22"/></g>`),
    grassBundle: (x, y, s = 1) => T(x, y, s, `<path d="M-22 16 Q-10 -14 -2 -18 Q4 -14 2 16 Z" fill="#d9c38a"/><path d="M-4 16 Q6 -16 18 -16 Q22 -8 14 16 Z" fill="#cdb478"/><path d="M-18 6 H14" stroke="#8a6444" stroke-width="2"/>`),
    branches: (x, y, s = 1) => T(x, y, s, `<g stroke="#6b4a30" stroke-width="4" stroke-linecap="round"><path d="M-28 14 L24 -4"/><path d="M-24 2 L28 12"/><path d="M-20 16 L18 -14"/></g><g stroke="#6b4a30" stroke-width="2"><path d="M10 0 l6 -8 M-6 8 l-4 -8"/></g>`),
    flints: (x, y, s = 1) => T(x, y, s, `<path d="M-24 12 L-18 -6 L-4 -10 L2 4 L-8 14 Z" fill="#6b6f72"/><path d="M4 14 L8 -2 L22 -6 L26 8 L16 16 Z" fill="#8a8f92"/><g stroke="#f6b84a" stroke-width="1.6"><path d="M2 -12 l4 -6 M6 -10 l8 -4 M0 -14 l-2 -7"/></g>`),
    hearth: (x, y, s = 1, lit = true) => T(x, y, s, `${[-20, -10, 0, 10, 20].map((a, i) => `<ellipse cx="${a}" cy="${10 + (i % 2) * 2}" rx="7" ry="5" fill="#8d8a7e"/>`).join('')}${lit ? '<path d="M-8 6 Q-14 -10 -2 -24 Q2 -12 8 -16 Q14 -4 8 6 Z" fill="#e8742a"/><path d="M-3 6 Q-5 -4 0 -10 Q4 -2 4 6 Z" fill="#f6dc7a" stroke-width="0"/>' : '<path d="M-14 6 L12 -2 M-12 -2 L14 6" stroke="#6b4a30" stroke-width="3"/>'}`),
    // 주먹도끼: 끝이 뾰족한 눈물방울 모양, 양면을 떼어 낸 자국. 오른쪽이 뾰족한 끝
    handaxeBig: (x, y, s = 1) => T(x, y, s, `<path d="M-130 4 C-132 -40 -60 -62 20 -46 C70 -36 110 -14 140 0 C110 16 70 36 20 44 C-60 58 -132 44 -130 4 Z" fill="#b6a58a" stroke-width="2"/>`
      + `<g fill="none" stroke="#7a6a52" stroke-width="1.4">${[[-100, -30, -70, 0, -96, 34], [-60, -44, -30, -6, -60, 42], [-20, -48, 10, 0, -18, 46], [20, -44, 50, 0, 22, 42], [56, -30, 84, 0, 58, 30], [90, -16, 112, 0, 92, 16]].map(([a, b, c, d, e, f]) => `<path d="M${a} ${b} Q${c} ${d} ${e} ${f}"/>`).join('')}</g>`
      + `<g fill="#a39478" opacity=".7">${[[-110, -8, 14, 10], [-80, 16, 16, 10], [-40, -20, 18, 12], [0, 20, 18, 12], [40, -12, 16, 10], [76, 10, 14, 8]].map(([a, b, c, d]) => `<ellipse cx="${a}" cy="${b}" rx="${c}" ry="${d}"/>`).join('')}</g>`),
    handaxe: (x, y, s = 1) => T(x, y, s, `<path d="M-6 22 C-18 18 -16 -2 0 -24 C16 -2 18 18 6 22 Z" fill="#b6a58a"/><path d="M-8 10 Q0 4 8 10 M-6 -2 Q0 -8 6 -2" fill="none" stroke="#7a6a52" stroke-width="1"/>`),
    chopper: (x, y, s = 1) => T(x, y, s, `<path d="M-16 14 Q-20 -6 -4 -12 L16 -8 L12 4 L16 14 Z" fill="#9a8e78"/><path d="M14 -8 L10 4 L14 14" fill="none" stroke="#5a4f40" stroke-width="1.4"/>`),
    tools: (x, y, s = 1) => T(x, y, s, `<ellipse cy="14" rx="34" ry="8" fill="#8d8a7e"/>`) + p.handaxe(x - 14 * s, y - 2 * s, s * 0.9) + p.chopper(x + 14 * s, y + 2 * s, s * 0.9),
    tracks: (x, y, s = 1) => T(x, y, s, `${[[-30, 14], [-18, 6], [-6, 10], [6, 2], [18, 6], [30, -2]].map(([a, b]) => `<g transform="translate(${a} ${b})" fill="#5a4636" stroke="none"><ellipse cx="-2.4" rx="2" ry="3.4"/><ellipse cx="2.4" rx="2" ry="3.4"/></g>`).join('')}<path d="M-34 18 Q0 4 34 -6" fill="none" stroke="#7a6a52" stroke-width="1" stroke-dasharray="3 3"/>`),
    rockFunnel: (x, y, s = 1) => T(x, y, s, `<path d="M-40 20 L-34 -14 L-20 -22 L-8 -6 L-12 20 Z" fill="#8a7f70"/><path d="M12 20 L8 -8 L22 -24 L38 -12 L42 20 Z" fill="#7a7062"/><path d="M-10 20 L-2 -2 L2 -2 L10 20" fill="#c4b78f" stroke="none"/>`),
    deer: (x, y, s = 1) => T(x, y, s, `<ellipse cy="0" rx="14" ry="6" fill="#8a5a35"/><path d="M10 -2 L16 -14 L22 -12 L18 -2 Z" fill="#8a5a35"/><path d="M-10 4 V16 M-4 5 V16 M6 5 V16 M11 3 V16" stroke="#8a5a35" stroke-width="2.2"/><path d="M17 -14 l-3 -8 M17 -14 l4 -8 M15 -19 l-4 -2 M19 -19 l4 -2" stroke-width="1.2"/>`),
    food: (x, y, s = 1) => T(x, y, s, `<ellipse cy="12" rx="30" ry="8" fill="#6f8f5a"/><path d="M-18 6 Q-14 -10 2 -8 Q12 -6 10 6 Z" fill="#b5593b"/><path d="M-6 -6 Q-2 -2 4 -6" fill="none" stroke="#efe5c8" stroke-width="1.6"/>${[[14, 4], [20, 0], [24, 6]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3.6" fill="#8c3b5a"/>`).join('')}`),
    hide: (x, y, s = 1) => T(x, y, s, `<path d="M-30 -10 Q-34 -18 -24 -18 Q-12 -14 0 -16 Q12 -14 24 -18 Q34 -18 30 -10 Q36 0 30 10 Q34 18 24 18 Q12 14 0 16 Q-12 14 -24 18 Q-34 18 -30 10 Q-36 0 -30 -10 Z" fill="#b8865a"/><path d="M-20 -6 Q0 0 20 -6 M-18 6 Q0 10 18 6" fill="none" stroke="#8a6444" stroke-width="1" opacity=".7"/>`),
    // 막집: 나뭇가지를 세워 엮고 풀·가죽을 덮은 임시 집
    makjip: (x, y, s = 1) => T(x, y, s, `<path d="M-30 20 L0 -26 L30 20 Z" fill="#a8905a"/><path d="M-14 20 L0 -4 L14 20 Z" fill="#b8865a"/><g stroke="#6b4a30" stroke-width="2"><path d="M-4 -30 L6 -18 M4 -30 L-6 -18"/></g><path d="M-6 20 L0 6 L6 20 Z" fill="#4a3220"/>`),
    seats: (x, y, s = 1) => T(x, y, s, `${[[-34, 6], [-22, 18], [0, 22], [22, 18], [34, 6]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="7" ry="4.5" fill="#8d8a7e"/>`).join('')}`) + p.hearth(x, y - 2 * s, s * 0.8, true)
  };

  // 바위 그늘·강가·트인 평야 (paleo-environment): 바위 그늘 (.22,.52), 강가 (.72,.48), 트인 평야 (.48,.68)
  scenes['paleo-environment'] = make('바위 그늘, 한탄강 강가, 바람 부는 트인 평야', () => valley() + p.riverBand(),
    [p.shelter(...P(0.22, 0.52, 20), 1), p.windGrass(...P(0.48, 0.68), 1.1), p.deer(392, 96, 0.8)]);
  // 불 피우기 (paleo-fire): 마른 풀 (.23,.68), 나뭇가지 (.5,.67), 부싯돌 (.76,.66)
  scenes['paleo-fire'] = make('바위 그늘 아래 불 자리, 마른 풀 묶음, 나뭇가지, 부싯돌', () => dusk() + p.shelter(240, 74, 2.2).replace(/fill="#8a7a66"/, 'fill="#8a7a66" opacity=".55"').replace(/fill="#4a3f36"/, 'fill="#4a3f36" opacity=".35"'),
    [p.grassBundle(...P(0.23, 0.68), 1.2), p.branches(...P(0.5, 0.67), 1.2), p.flints(...P(0.76, 0.66), 1.2), p.hearth(240, 90, 0.8, false)]);
  // 주먹도끼 다듬기 (paleo-stone): 큰 주먹도끼 하나. 가장자리 (.36,.64), 돌의 면 (.47,.47), 뾰족한 끝 (.8,.5)
  scenes['paleo-stone'] = make('한탄강 자갈밭에 놓인 큰 주먹도끼, 오른쪽이 뾰족한 끝', gravel, [p.handaxeBig(250, 116, 1), p.chopper(56, 196, 1.2)]);
  // 사냥 단서 (paleo-hunt): 동물 발자국 (.24,.52), 바람 방향 (.5,.46), 바위 길목 (.76,.54)
  scenes['paleo-hunt'] = make('동물 발자국, 바람에 눕는 풀, 바위 사이 길목과 멀리 사슴', () => valley('#a3ae74'),
    [p.tracks(...P(0.24, 0.52), 1.2), p.windGrass(...P(0.5, 0.46, 28), 1.1), p.rockFunnel(...P(0.76, 0.54), 1.1), p.deer(438, 100, 0.7), p.deer(412, 104, 0.6)]);
  // 공동체 (paleo-community): 식량 (.22,.48), 불씨 (.5,.45), 도구 (.78,.48), 가죽 (.36,.74)
  scenes['paleo-community'] = make('강가 야영지의 막집, 나눠 먹을 식량, 불씨, 뗀석기, 가죽', dusk,
    [p.makjip(40, 112, 1.1), p.makjip(440, 116, 0.9), p.food(...P(0.22, 0.48), 1.1), p.hearth(...P(0.5, 0.45, 30), 1.1, true), p.tools(...P(0.78, 0.48), 1.1), p.hide(...P(0.36, 0.74, 30), 0.9)]);
  // 돌아보기 (paleo-reflection): 환경 관찰 (.22,.5), 도구와 불 (.5,.5), 공동체 협력 (.78,.5)
  scenes['paleo-reflection'] = make('바위 그늘과 강, 주먹도끼와 불, 둘러앉는 돌 자리', () => dusk() + p.riverBand(),
    [p.shelter(...P(0.22, 0.5, 22), 0.9), p.handaxe(220, 84, 1.2), p.hearth(262, 90, 0.9, true), p.seats(...P(0.78, 0.5, 30), 1)]);
};
