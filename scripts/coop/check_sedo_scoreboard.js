// 세도정치 인생게임 점수판 규칙 검증: node scripts/coop/check_sedo_scoreboard.js
// 장면을 순서대로 자동으로 진행하며 손으로 계산한 최종 점수와 대조한다.
const path = require('path');
const G = require(path.join(__dirname, '../../cooperative-mud/sedo-scoreboard/game.js'));

let failed = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)));
}

// picks: { 장면id: 선택id }, checks: 에피소드 21 체크 목록
function play(base, picks, checks) {
  const log = [{ s: 'start', c: base }];
  const seen = [];
  for (let guard = 0; guard < 60; guard++) {
    const d = G.derive(log);
    const step = G.nextStep(d);
    if (!step) break;
    seen.push(step.id);
    if (step.kind === 'situation') log.push({ s: step.id, c: 'ok' });
    else if (step.kind === 'final') log.push({ s: step.id, c: 'ok', checks: checks || [] });
    else {
      if (!picks[step.id]) throw new Error('선택 누락: ' + step.id);
      log.push({ s: step.id, c: picks[step.id] });
    }
  }
  return { d: G.derive(log), seen, log };
}

// A. 양반 정상 경로(손계산): 7000 +30 +500 -1000 +200 -100 +100 -200 +200 +200 +50 +200 +100 +200 +100(관군)
//    -1500 +50 +100 +400 +100 +1000 = 7730, 최종 벌 office·bribe·tax·sand = -4000 → 3730
let r = play('yang', { e1: 'c1', e3y: 'c1', e5y: 'c1', e7y: 'c2', e9y: 'c1', e12y: 'c2', e14y: 'c2', e16g: 'c1', e18: 'c1', e19g: 'c1' }, ['office', 'bribe', 'tax', 'sand']);
eq('A 양반 최종 점수', r.d.points, 3730);
eq('A 양반 신분 복귀', [r.d.base, r.d.side], ['yang', null]);
eq('A 평민·봉기군 장면은 보이지 않음', r.seen.filter(s => /m$|b$|r$/.test(s) && s !== 'e16m').length, 0);

// B. 양반 강등 → 패자부활 안 함 → 평민으로 계속
//    7000 -10 +500 -3000 -0 -30 -200 +100(e5m 빌린다) +30 +30(e7m 인사) -200 -250(e9m c1) -50 -100 -50(e12m 빌려줌) -100
//    관군 선택(e14m c1) +30 -1500 +50(e16g c1) +100 +400 +100 +1000 + 평민 보너스 5000
let rb = play('yang', { e1: 'c2', e3y: 'c2', e3r: 'c2', e3m: 'c2', e5m: 'c1', e7m: 'c1', e9m: 'c1', e12m: 'c1', e14m: 'c1', e16g: 'c1', e18: 'c1', e19g: 'c1' });
eq('B 강등 후 base', rb.d.base, 'min');
eq('B 강등 경로 최종 점수', rb.d.points, 7000 - 10 + 500 - 3000 - 30 - 200 + 100 + 30 + 30 - 200 - 250 - 50 - 100 - 50 - 100 + 30 - 1500 + 50 + 100 + 400 + 100 + 1000 + 5000 - 0 - 0 + 0);

// C. 패자부활: -3000 후 500 사용 → 양반 복귀, 이후 양반 장면
let rc = play('yang', { e1: 'c1', e3y: 'c2', e3r: 'c1', e5y: 'c3', e7y: 'c1', e9y: 'c2', e12y: 'c1', e14y: 'c1', e16g: 'c2', e18: 'c2', e19g: 'c2' }, []);
eq('C 패자부활 후 양반', rc.d.flags.recovered && rc.d.rows.some(x => x.s === 'e5y'), true);
eq('C 패자부활 점수', rc.d.points, 7000 + 30 + 500 - 3000 - 500 + 200 - 200 + 100 - 700 + 200 + 50 + 50 + 200 - 200 + 200 - 1000 - 1500 - 50 + 100 + 0 - 300 + 1000);

// D. 평민 봉기군 + 돈을 빌려준 경우 (+1000 선택 가능)
let rd = play('min', { e1: 'c1', e3m: 'c1', e5m: 'c2', e7m: 'c3', e9m: 'c2', e12m: 'c1', e14m: 'c2', e16b: 'c2', e16m: 'c1', e18: 'c1', e19b: 'c2' });
eq('D 봉기군 장면 포함', ['e16b', 'e16m', 'e19b'].every(id => rd.seen.includes(id)), true);
eq('D 관군 장면 제외', rd.seen.includes('e16g') || rd.seen.includes('e19g'), false);
// 4000 +30 +200 -100 +50 -100 -200 -50 -200 -100 +50 -50 -100(e13)... 직접 합산은 아래 표 참고
const ep = [
  30,        // 1 김씨
  200,       // 2 풍년(평민)
  -100,      // 3 관청에 찾아감
  -200,      // 4 세금
  50,        // 5 빌리지 않음
  30,        // 6 잔치
  -100,      // 7 무시
  -200,      // 8 세금
  -200,      // 9 100% 갚음
  -50,       // 10 이자
  -100,      // 11
  -50,       // 12 돈 빌려줌
  -100,      // 13
  20,        // 14 봉기군
  1500,      // 15
  50 + 1000, // 16 안주 + 빌려준 적 있음
  -100,      // 17
  -600,      // 18 송림(봉기군)
  -50,       // 19 말고기
  -1000,     // 20
  5000       // 21 평민 보너스
];
eq('D 봉기군 최종 점수', rd.d.points, 4000 + ep.reduce((a, b) => a + b, 0));
eq('D 난 종료 후 신분 복귀', [rd.d.base, rd.d.side], ['min', null]);

// E. 되돌리기 일관성: 로그 끝을 하나씩 잘라 다시 계산해도 이전 합계와 같아야 한다
const total = r.log.length;
let consistent = true;
for (let n = 1; n <= total; n++) {
  const prefix = G.derive(r.log.slice(0, n));
  if (prefix.points !== (prefix.rows.length ? prefix.rows[prefix.rows.length - 1].total : 0)) consistent = false;
}
eq('E 접두사 재계산 일관성', consistent, true);

// F. 손상된 기록은 무시
const bad = G.derive([{ s: 'start', c: 'yang' }, { s: 'nope', c: 'x' }, null, { s: 'e1', c: 'zzz' }, { s: 'e1', c: 'c1' }]);
eq('F 손상 항목 무시', bad.points, 7030);

// G. 모든 에피소드 1~21이 양반·평민 어느 쪽으로도 최소 한 장면을 가진다
const eps = new Set();
[r, rb, rc, rd].forEach(x => x.d.rows.forEach(row => row.ep && eps.add(row.ep)));
eq('G 에피소드 1~21 모두 도달', [...eps].sort((a, b) => a - b).length, 21);

console.log(failed ? '\n' + failed + '개 실패' : '\n모두 통과');
process.exit(failed ? 1 : 0);
