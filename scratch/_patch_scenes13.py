p='scratch/gen_scene_art_unit13.js'
s=open(p,encoding='utf-8').read()
def rep(key, new):
    global s
    pre=f"  scenes['{key}'] = "
    i=s.index(pre); j=s.index('\n',i)
    s=s[:i]+new+s[j:]
rep('neolithic-village', """  const riverLeft = () => outdoor('#dfeaee', '#e8e2b7') + `<path d="M40 116 C90 150 20 178 70 230 L170 230 C120 182 180 150 120 116 Z" fill="#6e9aa6"/><g fill="none" stroke="#d9e8e6" stroke-width="1.6" opacity=".7"><path d="M70 160 q8 -4 16 0 t16 0"/><path d="M90 200 q8 -4 16 0 t16 0"/></g>\n`;
  scenes['neolithic-village'] = make('강가의 갈대, 강 옆 밭, 움집이 있는 신석기 마을', riverLeft, [n.reeds(150, 84, 1.1), m.seedRows(...C, 1), n.pitHouse(...R, 1.1)]);
  scenes['bronze-village'] = make('벼를 기르는 논, 크기가 다른 집, 군장의 고인돌과 청동검', outdoor.bind(null, '#e4e4cc', '#efe3bd', '#a8b073'), [m.paddy(...L, 1.1), n.longHouse(206, 112, 1.2), n.longHouse(276, 120, 0.7), n.dolmen(360, 84, 0.9), n.bronzeSword(404, 76, 0.9)]);""")
rep('gojoseon-artifacts', """  scenes['gojoseon-artifacts'] = make('구리·주석 덩이, 불과 거푸집, 청동 검', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.ingots(...L, 1.2), n.moldFire(...C, 1.2), n.bronzeSword(...R, 1.3)]);
  scenes['gojoseon-bronze-culture'] = make('비파형 동검, 탁자식 고인돌, 동검·고인돌이 나온 지역 지도', outdoor.bind(null, '#e4dcc4', '#d4cbb0', '#a89a6a'), [n.bronzeSword(...L, 1.3), n.dolmen(...C, 1.2), n.mapMini(...R, 1.3)]);""")
# 고구려·고조선 실제 지도
rep('gojoseon-map', """  const FN = geoFrame(42.3, 36.3, 126.4);
  const fort = (lo, la) => { const [px, py] = FN.pt(lo, la); return m.wall(px, py - 22, 0.45); };
  scenes['gojoseon-map'] = make('요동과 한반도 북부 지도, 위치가 확정되지 않은 도읍 아사달 표지', () => geoMap(FN, { rivers: ['liao', 'amnok', 'tumen', 'daedong'], labels: [['황해', 123.8, 38.3], ['동해', 130.5, 39.0], ['요하', 121.6, 41.6, 9]] }),
    [`<g><rect x="338" y="104" width="124" height="112" rx="6" fill="#f7f1de" stroke="#8a7355" stroke-width="1.4"/><text x="400" y="207" font-size="10" text-anchor="middle" fill="${INK}" ${font}>전해지는 도읍 · 위치는 여러 설</text></g>`, m.mount(400, 128, 0.7)]);""")
rep('three-kingdoms-goguryeo', """  scenes['three-kingdoms-goguryeo'] = make('평양성, 국내성, 한강이 실제 위치에 놓인 지도', () => geoMap(FN, { rivers: ['amnok', 'tumen', 'daedong', 'han'], labels: [['황해', 123.8, 38.3], ['동해', 130.5, 39.0]] }), [fort(125.75, 39.02), fort(126.19, 41.13)]);""")
rep('goryeo-culture-evidence', None) if False else None
rep('goryeo-byeokrando', """  scenes['goryeo-byeokrando'] = make('벽란도의 무역선, 직지를 찍은 흥덕사, 대장경을 둔 해인사 장경판전', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [n.junk(...P(0.22, 0.52), 1.2), m.book(...P(0.5, 0.68), 1.3, '直指'), n.storehouse(...P(0.78, 0.52, 22), 0.95)]);""")
rep('unified-silla-government', """  scenes['unified-silla-government'] = make('아홉 주 상징도, 다섯 소경 상징도, 왕의 교서', maptex, [n.grid9(...L, 1.1), n.fiveCities(...C, 1.2), m.treatyDoc(...R, 1.1)]);""")
rep('unified-silla-summary', """  scenes['unified-silla-summary'] = make('9주 5소경 상징도, 불국사 탑, 당과 오간 배', outdoor.bind(null, '#dfe8ea', '#e4e0c4', '#a6b396'), [n.grid9(...L, 1.1), n.pagodaOrnate(...C, 1.4), n.junk(...R, 1.1)]);""")
rep('goryeo-buseoksa', """  scenes['goryeo-buseoksa'] = make('가운데가 불룩한 배흘림기둥과 단층 무량수전', courtyard, [n.column(...L, 1.3), n.column(...C, 1.6), n.singleHall(...R, 0.85)]);""")
rep('goryeo-founding-summary', """  scenes['goryeo-founding-summary'] = make('송악의 마을과 강, 훈요 문서, 도성 성벽', river.bind(null, '#dfeaee', '#edf1dd'), [m.hanokVillage(...L, 1.1), m.scroll(...C, 1.3), m.wall(...R, 1.1), m.flagpole(404, 70, 0.9)]);""")
rep('balhae-document', """  scenes['balhae-document'] = make('창 거치대, 외교 국서, 궁궐 건물', room, [m.spearRack(...L, 1.1), m.letter(...C, 1.3), n.singleHall(...R, 0.8)]);""")
rep('imperial-subject-policy', """  scenes['imperial-subject-policy'] = make('정책 문서, 이름표, 글씨 없는 학교 칠판', classroom, [m.scroll(...L, 1.2), n.nameTags(...C, 1.3), n.blackboard(...R, 1.1, false)]);""")
rep('korean-war-outbreak', """  const FO = geoFrame(40.7, 33.1, 127.5);
  const at = (f, lo, la) => f.pt(lo, la).map(v => +v.toFixed(1));
  scenes['korean-war-outbreak'] = () => {
    const y38 = FO.pt(127, 38)[1];
    const route = [[127.0, 37.4], [127.6, 36.9], [127.95, 36.4], [128.45, 35.8], [128.9, 35.3]];
    const [ex, ey] = FO.pt(128.9, 35.3), [px, py] = FO.pt(128.45, 35.8);
    const [sx, sy] = at(FO, 126.98, 37.56), [bx, by] = at(FO, 129.05, 35.1);
    return geoMap(FO, { rivers: ['amnok', 'tumen', 'daedong', 'han'], japan: true, labels: [['황해', 124.6, 36.0], ['동해', 131.0, 38.4]] }).replace(/aria-label=""/, 'aria-label="38선과 서울에서 부산 쪽으로 향한 피난 길이 그려진 한반도 지도"')
      + `<path d="M0 ${y38.toFixed(1)} H480" stroke="#b83a2a" stroke-width="1.8" stroke-dasharray="6 5"/>`
      + `<path d="${FO.path(route, false)}" fill="none" stroke="#b83a2a" stroke-width="2.4" stroke-dasharray="5 3"/>` + arrowHead(ex, ey, Math.atan2(ey - py, ex - px) * 180 / Math.PI)
      + `<circle cx="${sx}" cy="${sy}" r="3" fill="${INK}"/><text x="${sx - 6}" y="${sy + 3}" font-size="9" text-anchor="end" fill="${INK}" ${font}>서울</text><circle cx="${bx}" cy="${by}" r="3" fill="${INK}"/>`
      + close;
  };""")
rep('korean-war-armistice', """  const FA = geoFrame(39.0, 36.9, 127.4);
  const MDL = [[126.65, 37.75], [126.68, 37.96], [127.0, 38.1], [127.3, 38.27], [127.6, 38.3], [128.0, 38.33], [128.2, 38.45], [128.37, 38.62]];
  scenes['korean-war-armistice'] = () => {
    const y38 = FA.pt(127, 38)[1];
    const [sx, sy] = at(FA, 126.98, 37.56), [ix, iy] = at(FA, 126.63, 37.47), [px, py] = at(FA, 126.68, 37.96);
    return geoMap(FA, { rivers: ['han'], labels: [['황해', 125.6, 37.2], ['동해', 129.6, 38.3]] }).replace(/aria-label=""/, 'aria-label="서쪽 한강 하구에서 동쪽으로 갈수록 북쪽으로 올라가는 군사분계선, 판문점과 인천이 표시된 지도"')
      + `<path d="M0 ${y38.toFixed(1)} H480" stroke="#7a7466" stroke-width="1" stroke-dasharray="2 4"/><text x="472" y="${(y38 - 4).toFixed(0)}" font-size="9" text-anchor="end" fill="#5a5448" ${font}>북위 38도</text>`
      + `<path d="${FA.path(MDL, false)}" fill="none" stroke="#b83a2a" stroke-width="2.6" stroke-dasharray="7 4"/>`
      + `<circle cx="${sx}" cy="${sy}" r="3" fill="${INK}"/><text x="${sx + 6}" y="${sy + 3}" font-size="9" fill="${INK}" ${font}>서울</text><circle cx="${ix}" cy="${iy}" r="3" fill="${INK}"/>`
      + `<rect x="${px - 5}" y="${py - 14}" width="10" height="7" fill="#8a6444" stroke="${INK}" stroke-width=".8"/>`
      + close;
  };""")
open(p,'w',encoding='utf-8').write(s)
