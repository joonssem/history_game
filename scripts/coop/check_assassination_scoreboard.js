// 암살 인생게임 점수판 규칙 검증: node scripts/coop/check_assassination_scoreboard.js
// 장면을 순서대로 자동으로 진행하며 손으로 계산한 최종 자금·장비·이동경로와 대조한다.
const path = require('path');
const G = require(path.join(__dirname, '../../cooperative-mud/assassination-scoreboard/game.js'));

let failed = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)));
}

// plan: { 장면id: 선택id 또는 {a:[입력]} 또는 {q:'명언', c:'평가id'} }
function play(plan) {
  const log = [{ s: 'start', c: 'start' }];
  const seen = [];
  for (let guard = 0; guard < 60; guard++) {
    const d = G.derive(log);
    const step = G.nextStep(d);
    if (!step) break;
    seen.push(step.id);
    if (step.kind === 'situation' || step.kind === 'move') log.push({ s: step.id, c: 'ok' });
    else {
      const p = plan[step.id];
      if (p === undefined) throw new Error('입력 누락: ' + step.id);
      if (typeof p === 'string') log.push({ s: step.id, c: p });
      else log.push(Object.assign({ s: step.id }, p));
    }
  }
  return { d: G.derive(log), seen, log };
}

const PERFECT = {
  e1: 'c1', e4: 'c4', e5: 'c1', e8: 'c1', e9: 'c3', e10: 'c3', e11: 'c1', e14: 'c1', e15: { a: ['0 1 2 4 7 9'] }, e16: 'c1',
  e18: { a: ['이순신', '을지문덕', '발해'] }, e19: { a: ['9'] }, e20: { a: ['9'] }, e21: 'c1', e22: { a: ['상해'] }, e23: 'c1',
  e26: 'c2', e30: { a: ['2', '1'] }, e31: 'c2', e33: { q: '나라를 되찾는 그날까지', c: 'c1' }
};

// A. 모든 정답 + 장비 4종: 손계산 −8 (선택 220 + 상황 −125 + 이동 −103)
const A = play(PERFECT);
eq('A 최종 자금(손계산)', A.d.funds, -8);
eq('A 선택 합 220 / 상황 −125 / 이동 −103', [
  A.d.rows.filter(r => ['choice', 'quiz'].includes(r.kind)).reduce((s, r) => s + r.delta, 0),
  A.d.rows.filter(r => r.kind === 'situation').reduce((s, r) => s + r.delta, 0),
  A.d.rows.filter(r => r.kind === 'move').reduce((s, r) => s + r.delta, 0)], [220, -125, -103]);
eq('A 장비 4종', G.WEAPONS.map(w => !!A.d.flags[w.id]), [true, true, true, true]);
eq('A 이동경로', A.d.route, ['경성', '만주', '경성', '만주', '군산', '상해', '경성']);
eq('A 끝남·게임 오버 아님', [A.d.finished, A.d.gameOver], [true, false]);
eq('A 마지막 평가', A.d.evalResult, '독립운동 유공 표창 수여');
eq('A 에피소드 1~33 모두 도달', [...new Set(A.d.rows.filter(r => r.ep).map(r => r.ep))].length, 33);

// B. 에피소드 1에서 일제에 협력 → +10,000, 즉시 GAME OVER
const B = play({ e1: 'c2' });
eq('B 협력: 자금 +10,000·GAME OVER', [B.d.funds, B.d.finished, B.d.gameOver, B.seen], [10000, true, true, ['e1']]);

// C. 권총만(소총 없음): 일본군 위치 최대 4개만 인정 → 앞의 4개(0,1,2,4)만 → 4개 정답 +30
const noRifle = Object.assign({}, PERFECT, { e14: 'c2' });
const C = play(noRifle);
eq('C 소총 없음: 위치 6개를 써도 4개까지만(4개 정답 +30)', C.d.rows.find(r => r.s === 'e15').delta, 30);
eq('C 소총 없음: 장비', [!!C.d.flags.pistol, !!C.d.flags.rifle], [true, false]);

// D. 망원경 없음: 상자는 1개까지만 인정(1번+2번 → 1번만 → 오답 0)
const D = play(Object.assign({}, PERFECT, { e21: 'c2' }));
eq('D 망원경 없음: 1번·2번을 골라도 첫 번째(1번)만 인정 → 오답 0', play(Object.assign({}, PERFECT, { e21: 'c2', e30: { a: ['1', '2'] } })).d.rows.find(r => r.s === 'e30').delta, 0);
eq('D 망원경 없음: 상자 2번만 고르면 정답 +50', play(Object.assign({}, PERFECT, { e21: 'c2', e30: { a: ['2'] } })).d.rows.find(r => r.s === 'e30').delta, 50);
eq('D 망원경 있음: 1·3번 고르면 오답 0', play(Object.assign({}, PERFECT, { e30: { a: ['1', '3'] } })).d.rows.find(r => r.s === 'e30').delta, 0);

// E. 퀴즈 채점: 구간표·정규화
const delta15 = (txt, rifle) => play(Object.assign({}, PERFECT, rifle ? {} : { e14: 'c2' }, { e15: { a: [txt] } })).d.rows.find(r => r.s === 'e15').delta;
eq('E 일본군 위치 구간표(소총): 0개/1개/2개/3개/4개/5개/6개', [delta15('3', 1), delta15('0', 1), delta15('0 1', 1), delta15('0 1 2', 1), delta15('0 1 2 4', 1), delta15('0 1 2 4 7', 1), delta15('0,1,2,4,7,9', 1)], [-30, -10, 10, 20, 30, 50, 50]);
eq('E 일본군 위치: 같은 숫자를 반복해도 한 번만', delta15('0 0 0', 1), -10);
const delta18 = (arr) => play(Object.assign({}, PERFECT, { e18: { a: arr } })).d.rows.find(r => r.s === 'e18').delta;
eq('E 역사 퀴즈 구간표(3/2/1/0개)', [delta18(['이순신 장군', ' 을지 문덕 ', '발해']), delta18(['이순신', '을지문덕', '고구려']), delta18(['이순신', '', '']), delta18(['', '', ''])], [20, 10, 5, -10]);
const q = (id, a) => play(Object.assign({}, PERFECT, { [id]: { a } })).d.rows.find(r => r.s === id).delta;
eq('E 쌀 0.3배: 9 / 9가마 / 8', [q('e19', ['9']), q('e19', ['9가마']), q('e19', ['8'])], [20, 20, -20]);
eq('E 원리네 가족: 9 / 9명 / 빈 칸', [q('e20', ['9']), q('e20', ['9명']), q('e20', [''])], [20, 20, -20]);
eq('E 암호: 상해 / 상하이 / 부산', [q('e22', ['상해']), q('e22', ['상하이']), q('e22', ['부산'])], [10, 10, -10]);
eq('E 콧수염은 정답이든 오답이든 획득', !!play(Object.assign({}, PERFECT, { e20: { a: ['1'] } })).d.flags.mustache, true);

// F. 선택 금액(PPT 대응)
const ch = (id, c) => play(Object.assign({}, PERFECT, { [id]: c })).d.rows.find(r => r.s === id).delta;
eq('F 에피소드 4 사진(홍범도 −5 … 이회영 +5)', ['c1', 'c2', 'c3', 'c4'].map(c => ch('e4', c)), [-5, -5, -5, 5]);
eq('F 에피소드 5 사격 방향', ['c1', 'c2', 'c3', 'c4'].map(c => ch('e5', c)), [5, 2, 3, 1]);
eq('F 에피소드 9 (후속 +20 포함)', ['c1', 'c2', 'c3'].map(c => ch('e9', c)), [0, -10, 10]);
eq('F 에피소드 10 이민수', ['c1', 'c2', 'c3', 'c4'].map(c => ch('e10', c)), [-10, -10, 10, -10]);
eq('F 에피소드 16 도시', ['c1', 'c2', 'c3', 'c4'].map(c => ch('e16', c)), [20, -20, -10, -30]);
eq('F 에피소드 26 단체', ['c1', 'c2', 'c3'].map(c => ch('e26', c)), [0, 20, -50]);
eq('F 에피소드 31 방향', ['c1', 'c2', 'c3'].map(c => ch('e31', c)), [-10, 30, -50]);
eq('F 에피소드 33 평가(자금 변화 없음)', ['c1', 'c2', 'c3'].map(c => play(Object.assign({}, PERFECT, { e33: { q: '말', c } })).d.rows.find(r => r.s === 'e33').result), ['독립운동 유공 표창 수여', '독립운동 상장 수여', '독립운동 명단 탈락']);

// G. 접두사 재계산 일관성·손상 기록 무시·수동 가감
let consistent = true;
for (let n = 1; n <= A.log.length; n++) {
  const p = G.derive(A.log.slice(0, n));
  if (p.funds !== (p.rows.length ? p.rows[p.rows.length - 1].total : 0)) consistent = false;
}
eq('G 접두사 재계산 일관성', consistent, true);
eq('G 손상 항목 무시', G.derive([{ s: 'start', c: 'start' }, { s: 'nope', c: 'x' }, null, { s: 'e1', c: 'zzz' }, { s: 'e1', c: 'c1' }, { s: 'start', c: 'start' }]).funds, 30);
eq('G 수동 가감', G.derive([{ s: 'start', c: 'start' }, { s: 'manual', delta: -90, memo: 'x' }]).funds, -90);
eq('G 시작 전에는 아무것도 반영하지 않음', G.derive([{ s: 'e1', c: 'c1' }]).funds, 0);

console.log(failed ? '\n' + failed + '개 실패' : '\n모두 통과');
process.exit(failed ? 1 : 0);
