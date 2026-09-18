// =========================================================
// scripts/16_validate_lesson_track.js
// data/lesson_track.json(D-036, 라운드 9 §0-2 확정 형식)이 규칙을
// 지키는지 검사한다. 관문 설계실과 병렬 작업이므로, 대상 파일이 아직
// 없으면 건너뛰고 통과한다.
//
// 참고: 지시서·D-036은 "정규 32편"이라고 적었지만, data/mud/_index.json을
// 직접 세어 보면 tier: "regular"는 28편이고 나머지 4편은 tier: "deep-dive"
// 다(32는 전체 MUD 수). 이 스크립트는 "32"를 하드코딩하지 않고
// _index.json에서 실제 regular 편 수를 세어 그 값과 대조한다 — 지시서의
// 숫자가 바뀌어도, 또는 실제로는 28인 채로 남아도 스크립트가 잘못된
// 값을 강요하지 않는다.
// =========================================================

const fs = require('node:fs');
const path = require('node:path');

const LESSON_TRACK_PATH = path.join(__dirname, '..', 'data', 'lesson_track.json');
const MUD_INDEX_PATH = path.join(__dirname, '..', 'data', 'mud', '_index.json');
const REQUIRED_ENTRY_FIELDS = ['order', 'mudId', 'unitId', 'lessonNumbers', 'eraLabel', 'eraRange', 'shortTitle'];

function main() {
  if (!fs.existsSync(LESSON_TRACK_PATH)) {
    console.log(`SKIP: ${path.relative(process.cwd(), LESSON_TRACK_PATH)}가 아직 없습니다 — 관문 설계실 작업 전이라 건너뛰고 통과합니다.`);
    return;
  }

  const errors = [];
  const warnings = [];

  let track;
  try {
    track = JSON.parse(fs.readFileSync(LESSON_TRACK_PATH, 'utf-8'));
  } catch (e) {
    console.error(`FAIL: JSON 파싱 실패 — ${e.message}`);
    process.exit(1);
  }

  const mudIndex = JSON.parse(fs.readFileSync(MUD_INDEX_PATH, 'utf-8'));
  const regularMuds = (mudIndex.muds || []).filter(m => m.tier === 'regular');
  const regularIdSet = new Set(regularMuds.map(m => m.mudId));
  const nonRegularIdSet = new Set((mudIndex.muds || []).filter(m => m.tier !== 'regular').map(m => m.mudId));

  if (regularMuds.length !== 32) {
    warnings.push(`_index.json 기준 tier: "regular"는 ${regularMuds.length}편입니다 — 지시서·D-036의 "32편"과 다릅니다. data/lesson_track.json은 이 실제 개수(${regularMuds.length})와 맞춰야 합니다.`);
  }

  if (!Array.isArray(track.entries)) {
    console.error('FAIL: entries가 배열이 아닙니다.');
    process.exit(1);
  }
  const entries = track.entries;

  // 형식 검사
  entries.forEach((entry, index) => {
    REQUIRED_ENTRY_FIELDS.forEach(field => {
      if (entry[field] === undefined || entry[field] === null || entry[field] === '') {
        errors.push(`entries[${index}](mudId: ${entry.mudId ?? '?'})에 "${field}" 필드가 없습니다.`);
      }
    });
    if (!Number.isInteger(entry.order)) errors.push(`entries[${index}]: order는 정수여야 합니다.`);
    if (!Number.isInteger(entry.unitId)) errors.push(`entries[${index}]: unitId는 정수여야 합니다.`);
    if (!Array.isArray(entry.lessonNumbers) || !entry.lessonNumbers.every(Number.isInteger)) {
      errors.push(`entries[${index}]: lessonNumbers는 정수 배열이어야 합니다.`);
    }
    if (entry.eraRangeDraft !== undefined && typeof entry.eraRangeDraft !== 'boolean') {
      errors.push(`entries[${index}]: eraRangeDraft는 boolean이어야 합니다.`);
    }
    if (typeof entry.shortTitle === 'string' && entry.shortTitle.length > 10) {
      warnings.push(`entries[${index}](${entry.mudId}): shortTitle이 ${entry.shortTitle.length}자 — "6자 안팎" 기준을 크게 넘습니다: "${entry.shortTitle}"`);
    }
    if (/^\d+차시$|^MUD\s*\d+$/.test(String(entry.shortTitle || '').trim())) {
      errors.push(`entries[${index}](${entry.mudId}): shortTitle이 번호식 이름("N차시", "MUD N")입니다 — 지시서 §1이 금지합니다: "${entry.shortTitle}"`);
    }
  });

  // 32(실제 regular 개수)개와 1:1 대응 — 빠짐·중복·유령 id
  const mudIdCounts = new Map();
  entries.forEach(e => mudIdCounts.set(e.mudId, (mudIdCounts.get(e.mudId) || 0) + 1));

  mudIdCounts.forEach((count, mudId) => {
    if (count > 1) errors.push(`mudId "${mudId}"가 entries에 ${count}번 중복됩니다.`);
  });
  entries.forEach(e => {
    if (nonRegularIdSet.has(e.mudId)) {
      errors.push(`mudId "${e.mudId}"는 tier: "regular"가 아닙니다(심화·협동 편이 섞였습니다) — 이 트랙은 정규 편만 담습니다.`);
    } else if (!regularIdSet.has(e.mudId)) {
      errors.push(`mudId "${e.mudId}"는 data/mud/_index.json에 없는 유령 id입니다.`);
    }
  });
  regularIdSet.forEach(mudId => {
    if (!mudIdCounts.has(mudId)) errors.push(`regular 편 "${mudId}"가 entries에 빠져 있습니다.`);
  });

  if (entries.length !== regularMuds.length) {
    errors.push(`entries 개수(${entries.length})가 _index.json의 regular 편 수(${regularMuds.length})와 다릅니다.`);
  }

  // order 1..N 연속
  const orders = entries.map(e => e.order).filter(Number.isInteger).sort((a, b) => a - b);
  const expectedOrders = Array.from({ length: entries.length }, (_, i) => i + 1);
  if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
    errors.push(`order 값이 1~${entries.length}까지 빈틈없이 이어지지 않습니다 — 실제: [${orders.join(', ')}]`);
  }

  // unitId·lessonNumbers 오름차순(같은 차시 두 편은 허용, 역순만 오류)
  const byOrder = [...entries].filter(e => Number.isInteger(e.order)).sort((a, b) => a.order - b.order);
  for (let i = 1; i < byOrder.length; i += 1) {
    const prev = byOrder[i - 1];
    const curr = byOrder[i];
    const prevLesson = Math.min(...(prev.lessonNumbers || [Infinity]));
    const currLesson = Math.min(...(curr.lessonNumbers || [Infinity]));
    const prevKey = [prev.unitId, prevLesson];
    const currKey = [curr.unitId, currLesson];
    const isBackwards = currKey[0] < prevKey[0] || (currKey[0] === prevKey[0] && currKey[1] < prevKey[1]);
    if (isBackwards) {
      errors.push(`order ${prev.order}(${prev.mudId}, 단원${prev.unitId} ${prevLesson}차시) 다음 order ${curr.order}(${curr.mudId}, 단원${curr.unitId} ${currLesson}차시)가 앞 편보다 앞선 차시입니다 — 오름차순이 아닙니다.`);
    }
  }

  if (errors.length) {
    console.error(`FAIL: data/lesson_track.json 검사 실패(${errors.length}건)`);
    errors.forEach(e => console.error(`  - ${e}`));
    warnings.forEach(w => console.log(`  [경고] ${w}`));
    process.exit(1);
  }

  warnings.forEach(w => console.log(`  [경고] ${w}`));
  console.log(`PASS: data/lesson_track.json — entries ${entries.length}개, order 1~${entries.length} 연속, regular 편과 1:1 대응 확인`);
}

main();
