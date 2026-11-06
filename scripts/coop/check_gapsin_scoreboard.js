// 갑신정변·동학농민운동 인생게임 점수판 규칙 검증: node scripts/coop/check_gapsin_scoreboard.js
// 장면을 순서대로 자동으로 진행하며 손으로 계산한 최종 점수·국력과 대조한다.
const path = require('path');
const G = require(path.join(__dirname, '../../cooperative-mud/gapsin-donghak-scoreboard/game.js'));

let failed = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)));
}

// picks: { 장면id: 선택id }
function play(ability, picks) {
  const log = [{ s: 'start', c: ability }];
  const seen = [];
  for (let guard = 0; guard < 80; guard++) {
    const d = G.derive(log);
    const step = G.nextStep(d);
    if (!step) break;
    seen.push(step.id);
    if (step.kind === 'situation') log.push({ s: step.id, c: 'ok' });
    else {
      if (!picks[step.id]) throw new Error('선택 누락: ' + step.id);
      log.push({ s: step.id, c: picks[step.id] });
    }
  }
  return { d: G.derive(log), seen, log };
}

// A. 중국어 능력자 → 영선사 → 명성황후파 → 온건개화파 → 지방 관리 → 관군 (손계산 3,420)
const A = play('zh', {
  e1: 'c1', e2zh: 'c1', e3y: 'c1', e5: 'c1', e7: 'c2', e8mg: 'c1', e9mg: 'c1', e10mg: 'c1', e11: 'c1', e13mg: 'c1', e16mg: 'c1',
  e18on: 'c1', e20on: 'c1', e22on: 'c1', e24jb: 'c1', e26jb: 'c2', e29jb: 'c1', e30jb: 'c2', e32gg: 'c1', e34: 'c1', e36gg: 'c1', e38gg: 'c2'
});
eq('A 최종 점수', A.d.points, 3420);
eq('A 국력 💀/♥', [A.d.skull, A.d.heart], [9, 6]);
eq('A 신분 경로', A.d.rows.filter(r => r.roleAfter && r.roleAfter !== r.role).map(r => r.roleAfter), ['ys', 'mg', 'on', 'jb', 'gg']);
eq('A 끝났고 마지막 신분', [A.d.finished, A.d.role], [true, 'gg']);
eq('A 능력 추가 점수(중국어: e13·e20·e32 +50, e34 −50)', A.d.rows.filter(r => r.bonus).map(r => r.bonus), [50, 50, 50, -50]);
eq('A 다른 신분 장면은 나오지 않음', A.seen.some(id => /(hs|gj|nm|dh|ja|ss|s)$/.test(id) && !['e2zh'].includes(id) && !/^e\d+$/.test(id)), false);

// B. 일본어 능력자 → 수신사 → 흥선대원군파 → 급진개화파 → 농민 → 동학농민군, 마지막 비협조 (손계산 −569)
const B = play('ja', {
  e1: 'c2', e2ja: 'c2', e3s: 'c1', e5: 'c2', e7: 'c1', e8hs: 'c2', e9hs: 'c1', e10hs: 'c1', e11: 'c2', e13hs: 'c1', e16hs: 'c2',
  e18gj: 'c1', e20gj: 'c2', e22gj: 'c1', e24nm: 'c1', e26nm: 'c1', e29nm: 'c1', e30nm: 'c1', e32dh: 'c1', e34: 'c2', e36dh: 'c1', e38dh: 'c2'
});
eq('B 최종 점수', B.d.points, -569);
eq('B 국력 💀/♥', [B.d.skull, B.d.heart], [6, 6]);
eq('B 신분 경로', B.d.rows.filter(r => r.roleAfter && r.roleAfter !== r.role).map(r => r.roleAfter), ['ss', 'hs', 'gj', 'nm', 'dh']);
eq('B 능력 추가 점수(일본어: e18 +50, e34 −50)', B.d.rows.filter(r => r.bonus).map(r => r.bonus), [50, -50]);
eq('B 플래그', [!!B.d.flags.shoot, !!B.d.flags.helped, !!B.d.flags.agri], [true, true, false]);

// C. B와 같은 길에서 마지막에 협조 → +2000, 💀2 (손계산 4,431)
const C = play('ja', Object.assign({}, { e1: 'c2', e2ja: 'c2', e3s: 'c1', e5: 'c2', e7: 'c1', e8hs: 'c2', e9hs: 'c1', e10hs: 'c1', e11: 'c2', e13hs: 'c1', e16hs: 'c2',
  e18gj: 'c1', e20gj: 'c2', e22gj: 'c1', e24nm: 'c1', e26nm: 'c1', e29nm: 'c1', e30nm: 'c1', e32dh: 'c1', e34: 'c2', e36dh: 'c1' }, { e38dh: 'c1' }));
eq('C 협조 최종 점수', C.d.points, 4431);
eq('C 국력 💀/♥', [C.d.skull, C.d.heart], [8, 3]);

// D. 온건개화파가 뇌물을 받지 않는 경우(0점)도 지방 관리가 된다 / 제비뽑기 반대쪽
const D = play('zh', {
  e1: 'c1', e2zh: 'c2', e3y: 'c2', e5: 'c1', e7: 'c1', e8hs: 'c3', e9hs: 'c2', e10hs: 'c2', e11: 'c1', e13hs: 'c2', e16hs: 'c1',
  e18on: 'c2', e20on: 'c2', e22on: 'c2', e24jb: 'c2', e26jb: 'c1', e29jb: 'c2', e30jb: 'c1', e32gg: 'c2', e34: 'c2', e36gg: 'c2', e38gg: 'c1'
});
eq('D 신분 경로', D.d.rows.filter(r => r.roleAfter && r.roleAfter !== r.role).map(r => r.roleAfter), ['ys', 'hs', 'on', 'jb', 'gg']);
eq('D 뇌물 거절 점수', D.d.rows.find(r => r.s === 'e22on').delta, 0);
eq('D e8hs 기술 없음 −100', D.d.rows.find(r => r.s === 'e8hs').delta, -100);
eq('D 일본어 선택지는 중국어 능력자에게 추가 점수 없음', D.d.rows.find(r => r.s === 'e34').bonus, 0);
// 💀: e5 1 + e6 1 + e15 2 + e21 1 + e35 1 + e38 2 = 8 (표시는 5칸까지, 합계는 보존)
eq('D 국력 합계 보존(💀)', D.d.skull, 1 + 1 + 2 + 1 + 1 + 2);

// E. 에피소드 1~38이 A·B 두 경로의 합집합에서 모두 나온다
const eps = new Set();
[A, B, D].forEach(x => x.d.rows.forEach(r => r.ep && eps.add(r.ep)));
eq('E 에피소드 1~38 모두 도달', [...eps].sort((a, b) => a - b), Array.from({ length: 38 }, (_, i) => i + 1));

// F. 국력 발생 위치(분석표 §3)와 데이터 일치
const expectPower = { e4: [0, 2], e5c1: [1, 0], e6: [1, 0], e13mgc1: [1, 0], e15: [2, 0], e18gjc1: [1, 0], e20onc1: [1, 0], e21: [1, 0], e32ggc1: [1, 0], e33: [0, 1], e35: [1, 0], e38dhc1: [2, 0], e38dhc2: [0, 3], e38ggc1: [2, 0], e38ggc2: [0, 3] };
const gotPower = {};
G.STEPS.forEach(s => {
  if (s.kind === 'situation') { if (s.skull || s.heart) gotPower[s.id] = [s.skull || 0, s.heart || 0]; }
  else s.choices.forEach(c => { if (c.skull || c.heart) gotPower[s.id + c.id] = [c.skull || 0, c.heart || 0]; });
});
eq('F 국력 발생 위치', gotPower, expectPower);

// G. 접두사 재계산 일관성, 손상 기록 무시, 트로피
let consistent = true;
for (let n = 1; n <= A.log.length; n++) {
  const p = G.derive(A.log.slice(0, n));
  if (p.points !== (p.rows.length ? p.rows[p.rows.length - 1].total : 0)) consistent = false;
}
eq('G 접두사 재계산 일관성', consistent, true);
eq('G 손상 항목 무시', G.derive([{ s: 'start', c: 'zh' }, { s: 'nope', c: 'x' }, null, { s: 'e1', c: 'zzz' }, { s: 'e1', c: 'c1' }, { s: 'start', c: 'ja' }]).points, 3030);
eq('G 트로피 경계', [G.trophy(3000), G.trophy(2999), G.trophy(2000), G.trophy(1000), G.trophy(999)].map(t => t && t.name),
  ['골드 트로피', '실버 트로피', '실버 트로피', '브론즈 트로피', null]);
eq('G 점수 수동 가감', G.derive([{ s: 'start', c: 'zh' }, { s: 'manual', delta: -90, memo: 'x' }]).points, 2910);

// H. 제비뽑기: 누른 카드(p)와 결과(c)가 따로 저장된다. 점수·신분은 결과(c)를 따르고 표에는 누른 카드가 남는다.
{
  const log = A.log.map(e => e.s === 'e7' ? { s: 'e7', c: e.c, p: 'C' } : e);   // A 경로의 결과는 D(명성황후파)인데 학생은 C 카드를 눌렀다
  const d = G.derive(log);
  const row = d.rows.find(r => r.s === 'e7');
  eq('H 제비뽑기: 누른 카드는 C, 결과는 명성황후파(+100)', [row.no, row.choiceLabel, row.delta, row.roleAfter], ['C', 'C 카드', 100, 'mg']);
  eq('H 제비뽑기: 점수·신분 경로는 결과를 따름(경로 A와 같음)', [d.points, d.role], [A.d.points, A.d.role]);
  const bad = G.derive(A.log.map(e => e.s === 'e7' ? { s: 'e7', c: e.c, p: 'Z' } : e));
  eq('H 제비뽑기: 보기에 없는 카드는 무시(결과의 번호를 표시)', bad.rows.find(r => r.s === 'e7').no, 'D');
  const draws = G.STEPS.filter(s => s.draw).map(s => s.id);
  eq('H 제비뽑기 장면 목록', draws, ['e7', 'e16mg']);
}

console.log(failed ? '\n' + failed + '개 실패' : '\n모두 통과');
process.exit(failed ? 1 : 0);
