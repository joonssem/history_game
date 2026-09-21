// =========================================================
// scripts/16_validate_lesson_track.js
// data/lesson_track.json(D-036, 라운드 9 §0-2 확정 형식)이 규칙을
// 지키는지 검사한다. 관문 설계실과 병렬 작업이므로, 대상 파일이 아직
// 없으면 건너뛰고 통과한다(단, --ci 옵션을 주면 부재를 실패로 처리한다).
//
// 참고: 라운드 9 지시서는 "정규 32편"이라고 적었으나 실제 정규 편은 28편이다(32는
// 직접 세어 보면 tier: "regular"는 28편이고 나머지 4편은 tier: "deep-dive"
// 심화 4편을 포함한 수). D-036에 정정했다. 이 스크립트는 개수를 고정하지 않고
// _index.json에서 실제 regular 편 수를 세어 그 값과 대조한다 — 지시서의
// 숫자가 바뀌어도, 또는 실제로는 28인 채로 남아도 스크립트가 잘못된
// 값을 강요하지 않는다.
//
// 라운드 11(D-037) 추가:
//   - LT-03: lesson_track.json ↔ _index.json ↔ 실제 mud 파일의 3중 대조.
//   - LT-10: "같은 eraLabel은 같은 eraRange" 회귀 검사, 열린 연대 표기(`~`로만
//     끝나는 표기, `~현재`는 예외) 금지, 대조실 검증값 표를 스크립트 안의
//     기대값 표로 옮겨 값이 바뀌면 경고.
//   - --ci 옵션: 이 옵션이 있으면 lesson_track.json 부재를 실패로 처리한다.
//     기본 실행(옵션 없음)은 지금처럼 건너뛴다 — 관문 설계실과 병렬 작업 중에는
//     아직 파일이 없을 수 있기 때문이다. 통합 파이프라인(CI)에서는 반드시
//     파일이 있어야 하므로 --ci로 강제한다.
// =========================================================

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const LESSON_TRACK_PATH = path.join(__dirname, '..', 'data', 'lesson_track.json');
const MUD_INDEX_PATH = path.join(__dirname, '..', 'data', 'mud', '_index.json');
const MUD_DIR = path.join(__dirname, '..', 'data', 'mud');
const ERA_REVIEW_DOC_PATH = path.join(__dirname, '..', 'docs', 'audits', 'lesson_track_era_review.md');
const REQUIRED_ENTRY_FIELDS = ['order', 'mudId', 'unitId', 'lessonNumbers', 'eraLabel', 'eraRange', 'shortTitle'];

// docs/audits/lesson_track_era_review.md(대조실, 라운드 9)의 "제안 표기" 열과
// 라운드 11 지시서 §1-3(D-037, 개항기·광복·대한민국 끝 표기)을 그대로 옮긴 값이다.
// 이 표의 값을 바꿀 때는 위 검증 문서도 같이 갱신해야 한다 — 검증 문서 없이
// 이 표만 조용히 바꾸면 "왜 바뀌었는지" 근거가 사라진다.
const EXPECTED_ERA_RANGES = {
  '구석기': '수십만 년 전~',
  '신석기': '기원전 8000년경~',
  '청동기': '기원전 2000년경~',
  '고조선': '기원전 2333년(전한다)~기원전 108년',
  '삼국': '기원전 57년~668년',
  '통일신라': '676년~935년',
  '발해': '698년~926년',
  '고려': '918년~1392년',
  '조선 전기': '1392년~1592년경',
  '조선 후기': '1592년경~1876년경',
  '개항기': '1876년 이후',
  '일제강점기': '1910년~1945년',
  '광복·대한민국': '1945년~현재',
};

// "~"로 끝나되 "~현재"는 예외로 허용한다(D-037 3 — 정말 현재까지 이어지는
// 시대만 이 표기를 쓴다). 그 외 "~"로 끝나는 표기는 끝을 정하지 않은 채
// 방치된 것이므로 실패로 낸다.
function isOpenEndedRange(eraRange) {
  const s = String(eraRange || '').trim();
  if (!s.endsWith('~')) return false;
  return !s.endsWith('~현재');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ---- 형식 검사 --------------------------------------------------------

function validateFormat(entries) {
  const errors = [];
  const warnings = [];
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
  return { errors, warnings };
}

// ---- 정규 편 1:1 대응 --------------------------------------------------

function validateRegularMapping(entries, mudIndex) {
  const errors = [];
  const regularMuds = (mudIndex.muds || []).filter(m => m.tier === 'regular');
  const regularIdSet = new Set(regularMuds.map(m => m.mudId));
  const nonRegularIdSet = new Set((mudIndex.muds || []).filter(m => m.tier !== 'regular').map(m => m.mudId));

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

  return { errors, regularMuds };
}

// ---- order 연속성 -------------------------------------------------------

function validateOrder(entries) {
  const errors = [];
  const orders = entries.map(e => e.order).filter(Number.isInteger).sort((a, b) => a - b);
  const expectedOrders = Array.from({ length: entries.length }, (_, i) => i + 1);
  if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
    errors.push(`order 값이 1~${entries.length}까지 빈틈없이 이어지지 않습니다 — 실제: [${orders.join(', ')}]`);
  }

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
  return { errors };
}

// ---- LT-03: lesson_track ↔ _index ↔ 실제 mud 파일 3중 대조 ----------------
//
// readMudFileFn(fileName) -> 파싱된 JSON 또는 null(파일 없음). listMudFilesFn() ->
// data/mud 디렉터리의 "regular_*.json" 파일명 배열. 실제 fs를 감싸 자기 테스트에서
// 가짜 파일 목록/내용을 주입할 수 있게 한다.
function validateMudCrossReference(entries, mudIndex, readMudFileFn, listMudFilesFn) {
  const errors = [];
  const regularMuds = (mudIndex.muds || []).filter(m => m.tier === 'regular');
  const regularByMudId = new Map(regularMuds.map(m => [m.mudId, m]));

  entries.forEach(entry => {
    const indexEntry = regularByMudId.get(entry.mudId);
    if (!indexEntry) return; // validateRegularMapping이 이미 유령 id로 보고함

    if (indexEntry.unitId !== entry.unitId) {
      errors.push(`mudId "${entry.mudId}": lesson_track.json의 unitId(${entry.unitId})가 _index.json(${indexEntry.unitId})과 다릅니다.`);
    }
    const a = JSON.stringify(entry.lessonNumbers || []);
    const b = JSON.stringify(indexEntry.lessonNumbers || []);
    if (a !== b) {
      errors.push(`mudId "${entry.mudId}": lesson_track.json의 lessonNumbers(${a})가 _index.json(${b})과 다릅니다.`);
    }

    if (!indexEntry.file) {
      errors.push(`mudId "${entry.mudId}": _index.json에 "file" 필드가 없습니다.`);
      return;
    }
    const mudFile = readMudFileFn(indexEntry.file);
    if (mudFile === null) {
      errors.push(`mudId "${entry.mudId}": _index.json이 가리키는 파일 "data/mud/${indexEntry.file}"이 존재하지 않습니다.`);
      return;
    }
    if (mudFile.mudId !== entry.mudId) {
      errors.push(`mudId "${entry.mudId}": _index.json이 가리키는 파일 "data/mud/${indexEntry.file}" 안의 mudId("${mudFile.mudId}")가 다릅니다.`);
    }
  });

  // 등록 누락 탐지: 디스크에 있는 regular_*.json 파일이 _index.json regular 목록에 없는 경우
  const registeredFiles = new Set(regularMuds.map(m => m.file));
  const filesOnDisk = listMudFilesFn();
  filesOnDisk.forEach(fileName => {
    if (!registeredFiles.has(fileName)) {
      errors.push(`data/mud/${fileName} 파일이 디스크에 있지만 _index.json의 regular 목록에 등록되어 있지 않습니다.`);
    }
  });

  return { errors };
}

// ---- LT-10: 연대 회귀 검사 ------------------------------------------------

function validateEraRegression(entries, expectedEraRanges) {
  const errors = [];
  const warnings = [];

  // 같은 eraLabel은 같은 eraRange여야 한다(D-037 1).
  const rangesByLabel = new Map();
  entries.forEach(entry => {
    if (!entry.eraLabel || !entry.eraRange) return;
    if (!rangesByLabel.has(entry.eraLabel)) rangesByLabel.set(entry.eraLabel, new Map());
    const seen = rangesByLabel.get(entry.eraLabel);
    if (!seen.has(entry.eraRange)) seen.set(entry.eraRange, []);
    seen.get(entry.eraRange).push(entry.mudId);
  });
  rangesByLabel.forEach((rangeMap, eraLabel) => {
    if (rangeMap.size > 1) {
      const detail = [...rangeMap.entries()].map(([range, mudIds]) => `"${range}"(${mudIds.join(', ')})`).join(' vs ');
      errors.push(`eraLabel "${eraLabel}"에 서로 다른 eraRange가 섞여 있습니다 — ${detail}`);
    }
  });

  // 열린 연대 표기 금지(~현재는 허용).
  entries.forEach(entry => {
    if (isOpenEndedRange(entry.eraRange)) {
      errors.push(`entries mudId "${entry.mudId}": eraRange "${entry.eraRange}"가 "~"로 끝나는 열린 표기입니다 — 끝을 정하거나 "~현재"만 쓸 수 있습니다(D-037 3).`);
    }
  });

  // 기대값 표와 비교 — 값이 바뀌면 실패가 아니라 경고(의도적 정정일 수 있음).
  entries.forEach(entry => {
    const expected = expectedEraRanges[entry.eraLabel];
    if (expected !== undefined && entry.eraRange !== expected) {
      warnings.push(
        `mudId "${entry.mudId}"(eraLabel "${entry.eraLabel}")의 eraRange가 기대값과 다릅니다 — ` +
        `실제: "${entry.eraRange}", 기대값(scripts/16 EXPECTED_ERA_RANGES): "${expected}". ` +
        `의도된 정정이면 EXPECTED_ERA_RANGES와 docs/audits/lesson_track_era_review.md를 함께 갱신하세요.`
      );
    }
  });

  return { errors, warnings };
}

// ---- 자기 테스트: 일부러 틀린 fixture로 실패하는지 확인 --------------------

function runSelfTests() {
  const baseIndex = {
    muds: [
      { mudId: 'regular_a', tier: 'regular', unitId: 1, lessonNumbers: [2], file: 'regular_a.json' },
      { mudId: 'regular_b', tier: 'regular', unitId: 1, lessonNumbers: [3], file: 'regular_b.json' },
      { mudId: 'deep_x', tier: 'deep-dive', unitId: 1, lessonNumbers: [2, 3], file: 'deep_x.json' },
    ],
  };
  const goodEntries = [
    { order: 1, mudId: 'regular_a', unitId: 1, lessonNumbers: [2], eraLabel: '시대A', eraRange: '1년~10년', shortTitle: '보기1' },
    { order: 2, mudId: 'regular_b', unitId: 1, lessonNumbers: [3], eraLabel: '시대A', eraRange: '1년~10년', shortTitle: '보기2' },
  ];

  // 정상 fixture는 통과해야 한다.
  {
    const { errors } = validateMudCrossReference(
      goodEntries,
      baseIndex,
      (file) => (file === 'regular_a.json' ? { mudId: 'regular_a' } : file === 'regular_b.json' ? { mudId: 'regular_b' } : null),
      () => ['regular_a.json', 'regular_b.json']
    );
    assert.equal(errors.length, 0, `자기 테스트: 정상 fixture인데 LT-03 오류가 났습니다 — ${JSON.stringify(errors)}`);
  }
  {
    const { errors } = validateEraRegression(goodEntries, {});
    assert.equal(errors.length, 0, `자기 테스트: 정상 fixture인데 LT-10 오류가 났습니다 — ${JSON.stringify(errors)}`);
  }

  // LT-03 회귀 1: lesson_track과 _index의 unitId/lessonNumbers 메타데이터 불일치
  {
    const badEntries = [
      { order: 1, mudId: 'regular_a', unitId: 2, lessonNumbers: [2], eraLabel: '시대A', eraRange: '1년~10년', shortTitle: '보기1' },
      { order: 2, mudId: 'regular_b', unitId: 1, lessonNumbers: [9], eraLabel: '시대A', eraRange: '1년~10년', shortTitle: '보기2' },
    ];
    const { errors } = validateMudCrossReference(
      badEntries,
      baseIndex,
      (file) => (file === 'regular_a.json' ? { mudId: 'regular_a' } : file === 'regular_b.json' ? { mudId: 'regular_b' } : null),
      () => ['regular_a.json', 'regular_b.json']
    );
    assert.ok(errors.some(e => e.includes('unitId')), '자기 테스트: unitId 불일치를 잡아내지 못했습니다.');
    assert.ok(errors.some(e => e.includes('lessonNumbers')), '자기 테스트: lessonNumbers 불일치를 잡아내지 못했습니다.');
  }

  // LT-03 회귀 2: _index.json이 가리키는 파일이 없거나, 파일 안 mudId가 다름
  {
    const { errors } = validateMudCrossReference(
      goodEntries,
      baseIndex,
      (file) => (file === 'regular_a.json' ? null : file === 'regular_b.json' ? { mudId: 'wrong_id' } : null),
      () => []
    );
    assert.ok(errors.some(e => e.includes('존재하지 않습니다')), '자기 테스트: 파일 부재를 잡아내지 못했습니다.');
    assert.ok(errors.some(e => e.includes('mudId') && e.includes('다릅니다')), '자기 테스트: 파일 내부 mudId 불일치를 잡아내지 못했습니다.');
  }

  // LT-03 회귀 3: 디스크에는 있지만 _index.json에 등록되지 않은 파일(등록 누락)
  {
    const { errors } = validateMudCrossReference(
      goodEntries,
      baseIndex,
      (file) => (file === 'regular_a.json' ? { mudId: 'regular_a' } : file === 'regular_b.json' ? { mudId: 'regular_b' } : null),
      () => ['regular_a.json', 'regular_b.json', 'regular_forgotten.json']
    );
    assert.ok(errors.some(e => e.includes('regular_forgotten.json') && e.includes('등록되어 있지 않습니다')), '자기 테스트: 등록 누락 파일을 잡아내지 못했습니다.');
  }

  // LT-10 회귀 1: 같은 eraLabel인데 eraRange가 다름
  {
    const badEntries = [
      { order: 1, mudId: 'regular_a', unitId: 1, lessonNumbers: [2], eraLabel: '시대A', eraRange: '1년~10년', shortTitle: '보기1' },
      { order: 2, mudId: 'regular_b', unitId: 1, lessonNumbers: [3], eraLabel: '시대A', eraRange: '2년~20년', shortTitle: '보기2' },
    ];
    const { errors } = validateEraRegression(badEntries, {});
    assert.ok(errors.some(e => e.includes('서로 다른 eraRange')), '자기 테스트: 같은 eraLabel·다른 eraRange를 잡아내지 못했습니다.');
  }

  // LT-10 회귀 2: 열린 범위("~"로 끝남, "~현재"는 예외)
  {
    const badEntries = [
      { order: 1, mudId: 'regular_a', unitId: 1, lessonNumbers: [2], eraLabel: '시대A', eraRange: '1년~', shortTitle: '보기1' },
      { order: 2, mudId: 'regular_b', unitId: 1, lessonNumbers: [3], eraLabel: '시대B', eraRange: '2년~현재', shortTitle: '보기2' },
    ];
    const { errors } = validateEraRegression(badEntries, {});
    assert.ok(errors.some(e => e.includes('regular_a') && e.includes('열린 표기')), '자기 테스트: 열린 범위(~)를 잡아내지 못했습니다.');
    assert.ok(!errors.some(e => e.includes('regular_b')), '자기 테스트: "~현재"는 예외인데 오류로 잡았습니다.');
  }

  // LT-10 회귀 3: 기대값 표와 다르면 경고(실패 아님)
  {
    const changedEntries = [
      { order: 1, mudId: 'regular_a', unitId: 1, lessonNumbers: [2], eraLabel: '구석기', eraRange: '완전히 다른 표기', shortTitle: '보기1' },
    ];
    const { errors, warnings } = validateEraRegression(changedEntries, EXPECTED_ERA_RANGES);
    assert.equal(errors.length, 0, '자기 테스트: 기대값과 다른 것만으로 오류(FAIL)가 나면 안 됩니다 — 경고여야 합니다.');
    assert.ok(warnings.some(w => w.includes('기대값과 다릅니다')), '자기 테스트: 기대값 변경을 경고로 잡아내지 못했습니다.');
  }

  console.log('자기 테스트 통과: LT-03·LT-10 회귀 fixture 8건 확인.');
}

function main() {
  const ci = process.argv.includes('--ci');

  runSelfTests();

  if (!fs.existsSync(LESSON_TRACK_PATH)) {
    if (ci) {
      console.error(`FAIL(--ci): ${path.relative(process.cwd(), LESSON_TRACK_PATH)}가 없습니다 — --ci 모드에서는 부재를 실패로 처리합니다.`);
      process.exit(1);
    }
    console.log(`SKIP: ${path.relative(process.cwd(), LESSON_TRACK_PATH)}가 아직 없습니다 — 관문 설계실 작업 전이라 건너뛰고 통과합니다.`);
    return;
  }

  let track;
  try {
    track = readJson(LESSON_TRACK_PATH);
  } catch (e) {
    console.error(`FAIL: JSON 파싱 실패 — ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(track.entries)) {
    console.error('FAIL: entries가 배열이 아닙니다.');
    process.exit(1);
  }
  const entries = track.entries;

  const mudIndex = readJson(MUD_INDEX_PATH);

  const errors = [];
  const warnings = [];

  const fmt = validateFormat(entries);
  errors.push(...fmt.errors);
  warnings.push(...fmt.warnings);

  const mapping = validateRegularMapping(entries, mudIndex);
  errors.push(...mapping.errors);

  const order = validateOrder(entries);
  errors.push(...order.errors);

  const crossRef = validateMudCrossReference(
    entries,
    mudIndex,
    (fileName) => {
      const filePath = path.join(MUD_DIR, fileName);
      if (!fs.existsSync(filePath)) return null;
      return readJson(filePath);
    },
    () => fs.readdirSync(MUD_DIR).filter(f => f.startsWith('regular_') && f.endsWith('.json'))
  );
  errors.push(...crossRef.errors);

  const era = validateEraRegression(entries, EXPECTED_ERA_RANGES);
  errors.push(...era.errors);
  warnings.push(...era.warnings);

  if (errors.length) {
    console.error(`FAIL: data/lesson_track.json 검사 실패(${errors.length}건)`);
    errors.forEach(e => console.error(`  - ${e}`));
    warnings.forEach(w => console.log(`  [경고] ${w}`));
    process.exit(1);
  }

  warnings.forEach(w => console.log(`  [경고] ${w}`));
  console.log(`PASS: data/lesson_track.json — entries ${entries.length}개, order 1~${entries.length} 연속, regular 편과 1:1 대응·_index.json 3중 대조·연대 회귀 검사 통과`);
}

main();
