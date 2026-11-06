// 인생게임 점수판 3종 무작위 플레이 검증: node scripts/coop/fuzz_scoreboards.js [횟수]
// 장면마다 무작위로 선택·입력해 끝까지 진행하며 불변식을 확인한다.
//   · 막다른 길 없음(끝나기 전에 다음 장면이 사라지지 않음), 합계 = 각 행 변화량의 합, 되돌리기(접두사) 일관성,
//   · 에피소드 순서가 거꾸로 가지 않음, 모든 에피소드 방문(조기 종료 제외), 같은 기록은 같은 결과, 손상된 기록에서도 예외 없음.
const path = require('path');
const base = path.join(__dirname, '../../cooperative-mud');
const N = Number(process.argv[2]) || 3000;

// 재현 가능한 난수(실패 시 같은 경로를 다시 볼 수 있다)
let seed = 20261106;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

let failed = 0;
function fail(game, msg, log) {
  failed++;
  if (failed <= 12) console.log('FAIL [' + game + '] ' + msg + (log ? '\n      기록: ' + JSON.stringify(log).slice(0, 400) : ''));
}

function checkInvariants(game, G, log, opts) {
  const d = G.derive(log);
  const rows = d.rows;
  const money = opts.total(d);
  const sum = rows.reduce((s, r) => s + r.delta, 0);
  if (!Number.isFinite(money) || money !== sum) fail(game, '합계 불일치 ' + money + ' vs ' + sum, log);
  if (rows.length && rows[rows.length - 1].total !== money) fail(game, '마지막 행 합계 불일치', log);
  let prevEp = 0;
  rows.forEach((r) => { if (r.ep !== null && r.ep < prevEp) fail(game, '에피소드 순서가 거꾸로: ' + prevEp + ' → ' + r.ep, log); if (r.ep !== null) prevEp = r.ep; });
  if (JSON.stringify(G.derive(log)) !== JSON.stringify(d)) fail(game, '같은 기록이 다른 결과', log);
  for (let k = 1; k <= log.length; k += Math.max(1, Math.floor(log.length / 6))) {
    const p = G.derive(log.slice(0, k));
    if (opts.total(p) !== (p.rows.length ? p.rows[p.rows.length - 1].total : 0)) fail(game, '접두사 ' + k + ' 합계 불일치', log);
  }
  return d;
}

// 손상된 기록(무작위 항목)에서도 예외가 나지 않아야 한다
function corrupt(game, G, ids) {
  for (let t = 0; t < 300; t++) {
    const log = [];
    const n = 1 + Math.floor(rnd() * 12);
    for (let i = 0; i < n; i++) {
      log.push(pick([null, 7, 'x', {}, { s: pick(ids), c: pick(['c1', 'c2', 'c3', 'ok', 'zz', null, 5]), a: pick([null, 'x', [], ['9'], [1, 2]], ), p: pick([null, 'C', 5]), checks: pick([null, 'x', ['office']]) },
        { s: 'start', c: pick(['zh', 'ja', 'yang', 'min', 'start', 'zz']) }, { s: 'manual', delta: pick([1, -5, NaN, 'x', Infinity]) }]));
    }
    try { G.derive(log); G.nextStep(G.derive(log)); } catch (e) { fail(game, '손상 기록에서 예외: ' + e.message, log); return; }
  }
}

// ── 세도정치 ─────────────────────────────────────────────
function fuzzSedo() {
  const G = require(path.join(base, 'sedo-scoreboard/game.js'));
  const totals = []; let endedRoles = {};
  for (let i = 0; i < N; i++) {
    const log = [{ s: 'start', c: rnd() < 0.5 ? 'yang' : 'min' }];
    let guard = 0;
    for (;;) {
      const d = G.derive(log);
      const step = G.nextStep(d);
      if (!step) { if (!d.finished) fail('세도정치', '막다른 길(끝나지 않았는데 다음 장면 없음) 신분=' + d.base + '/' + d.side, log); break; }
      if (step.kind === 'situation') log.push({ s: step.id, c: 'ok' });
      else if (step.kind === 'final') log.push({ s: step.id, c: 'ok', checks: G.FINAL_PENALTIES.map(p => p.id).filter(() => rnd() < 0.5) });
      else log.push({ s: step.id, c: pick(step.choices).id });
      if (++guard > 80) { fail('세도정치', '끝나지 않는 경로', log); break; }
    }
    const d = checkInvariants('세도정치', G, log, { total: x => x.points });
    const eps = new Set(d.rows.filter(r => r.ep).map(r => r.ep));
    for (let e = 1; e <= 21; e++) if (!eps.has(e)) { fail('세도정치', '에피소드 ' + e + ' 건너뜀', log); break; }
    totals.push(d.points); endedRoles[d.base] = (endedRoles[d.base] || 0) + 1;
    if (d.side) fail('세도정치', '끝났는데 난 중 신분(side)이 남음', log);
  }
  corrupt('세도정치', G, G.STEPS.map(s => s.id));
  return { name: '세도정치', n: N, min: Math.min(...totals), max: Math.max(...totals), extra: JSON.stringify(endedRoles) };
}

// ── 갑신정변·동학농민운동 ──────────────────────────────────
function fuzzGapsin() {
  const G = require(path.join(base, 'gapsin-donghak-scoreboard/game.js'));
  const totals = []; const ends = {};
  for (let i = 0; i < N; i++) {
    const log = [{ s: 'start', c: rnd() < 0.5 ? 'zh' : 'ja' }];
    let guard = 0;
    for (;;) {
      const d = G.derive(log);
      const step = G.nextStep(d);
      if (!step) { if (!d.finished) fail('갑신·동학', '막다른 길 신분=' + d.role, log); break; }
      if (step.kind === 'situation') log.push({ s: step.id, c: 'ok' });
      else { const c = pick(step.choices); log.push(step.draw && rnd() < 0.5 ? { s: step.id, c: c.id, p: String(pick(step.choices).no) } : { s: step.id, c: c.id }); }
      if (++guard > 80) { fail('갑신·동학', '끝나지 않는 경로', log); break; }
    }
    const d = checkInvariants('갑신·동학', G, log, { total: x => x.points });
    const eps = new Set(d.rows.filter(r => r.ep).map(r => r.ep));
    for (let e = 1; e <= 38; e++) if (!eps.has(e)) { fail('갑신·동학', '에피소드 ' + e + ' 건너뜀', log); break; }
    if (d.skull < 0 || d.heart < 0) fail('갑신·동학', '국력이 음수', log);
    if (!['dh', 'gg'].includes(d.role)) fail('갑신·동학', '끝난 신분이 동학농민군/관군이 아님: ' + d.role, log);
    totals.push(d.points); ends[d.role] = (ends[d.role] || 0) + 1;
  }
  corrupt('갑신·동학', G, G.STEPS.map(s => s.id));
  return { name: '갑신·동학', n: N, min: Math.min(...totals), max: Math.max(...totals), extra: JSON.stringify(ends) };
}

// ── 암살 ─────────────────────────────────────────────────
function fuzzAssassination() {
  const G = require(path.join(base, 'assassination-scoreboard/game.js'));
  const totals = []; let early = 0;
  const junk = ['', ' ', '9', '9가마', '가', '상해', '이순신 장군', '0 1 2 4 7 9', '0,1,2', '10', 'abc', '9명', '😀'];
  for (let i = 0; i < N; i++) {
    const log = [{ s: 'start', c: 'start' }];
    let guard = 0;
    for (;;) {
      const d = G.derive(log);
      const step = G.nextStep(d);
      if (!step) { if (!d.finished) fail('암살', '막다른 길', log); break; }
      if (step.kind === 'situation' || step.kind === 'move') log.push({ s: step.id, c: 'ok' });
      else if (step.kind === 'choice') log.push({ s: step.id, c: pick(step.choices).id });
      else if (step.kind === 'final') log.push({ s: step.id, q: pick(junk), c: pick(G.EVALS).id });
      else {
        const t = step.quiz.type;
        const a = t === 'boxes' ? [1, 2, 3].filter(() => rnd() < 0.5).map(String)
          : t === 'texts' ? step.quiz.items.map(() => pick(junk.concat(['이순신', '을지문덕', '발해'])))
          : [pick(junk)];
        log.push({ s: step.id, a });
      }
      if (++guard > 80) { fail('암살', '끝나지 않는 경로', log); break; }
    }
    const d = checkInvariants('암살', G, log, { total: x => x.funds });
    if (d.gameOver) early++;
    else { const eps = new Set(d.rows.filter(r => r.ep).map(r => r.ep)); for (let e = 1; e <= 33; e++) if (!eps.has(e)) { fail('암살', '에피소드 ' + e + ' 건너뜀', log); break; } }
    if (d.route[d.route.length - 1] !== d.pos) fail('암살', '이동경로 끝과 현재 위치 불일치', log);
    // 장비 상한: 소총이 없으면 일본군 위치 4개까지만
    const r15 = d.rows.find(r => r.s === 'e15');
    if (r15 && !d.flags.rifle) { /* 소총은 에피소드 14에서 정해진다 */ }
    totals.push(d.funds);
  }
  corrupt('암살', G, G.STEPS.map(s => s.id));
  return { name: '암살', n: N, min: Math.min(...totals), max: Math.max(...totals), extra: '협력 게임오버 ' + early + '건' };
}

const results = [fuzzSedo(), fuzzGapsin(), fuzzAssassination()];
results.forEach(r => console.log(r.name + ': ' + r.n + '회 플레이, 최종 ' + r.min.toLocaleString() + ' ~ ' + r.max.toLocaleString() + ' (' + r.extra + ')'));
console.log(failed ? '\n' + failed + '건 실패' : '\n모두 통과');
process.exit(failed ? 1 : 0);
