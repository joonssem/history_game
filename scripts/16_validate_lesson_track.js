// scripts/16_validate_lesson_track.js
// 정규 MUD 인덱스·실제 JSON·연대표 띠의 3자 계약과 D-037 연대 표기를 검사한다.
// 사용: node scripts/16_validate_lesson_track.js [--ci|--self-test]

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_TRACK_PATH = path.join(REPO_ROOT, 'data', 'lesson_track.json');
const DEFAULT_INDEX_PATH = path.join(REPO_ROOT, 'data', 'mud', '_index.json');
const DEFAULT_MUD_DIR = path.join(REPO_ROOT, 'data', 'mud');
const REQUIRED_FIELDS = ['order', 'mudId', 'unitId', 'lessonNumbers', 'eraLabel', 'eraRange', 'shortTitle'];

// docs/audits/lesson_track_era_review.md의 검증값과 D-037 표기 규칙을 합친 기대값.
// 변경 시 검증 문서와 함께 갱신한다. 불일치는 경고, 구조 규칙 위반은 오류다.
const EXPECTED_ERA_RANGES = Object.freeze({
  '구석기': '수십만 년 전 이후',
  '신석기': '기원전 8000년경 이후',
  '청동기': '기원전 2000년경 이후',
  '고조선': '기원전 2333년(전한다)~기원전 108년',
  '삼국': '기원전 57년~668년',
  '통일신라': '676년~935년',
  '발해': '698년~926년',
  '고려': '918년~1392년',
  '조선 전기': '1392년~1592년경',
  '조선 후기': '1592년경~1876년경',
  '개항기': '1876년 이후',
  '일제강점기': '1910년~1945년',
  '광복·대한민국': '1945년~현재'
});

function sameIntegerArray(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length
    && a.every((value, index) => Number.isInteger(value) && value === b[index]);
}

function readJson(filePath, errors, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${label} JSON을 읽지 못했습니다: ${error.message}`);
    return null;
  }
}

function validate({ trackPath, indexPath, mudDir, ci = false }) {
  const errors = [];
  const warnings = [];
  if (!fs.existsSync(trackPath)) {
    if (ci) errors.push(`${path.relative(process.cwd(), trackPath)}가 없습니다(--ci에서는 필수).`);
    return { errors, warnings, skipped: !ci, entryCount: 0 };
  }

  const track = readJson(trackPath, errors, 'lesson_track');
  const mudIndex = readJson(indexPath, errors, '_index');
  if (!track || !mudIndex) return { errors, warnings, skipped: false, entryCount: 0 };
  if (!Array.isArray(track.entries)) {
    errors.push('lesson_track의 entries가 배열이 아닙니다.');
    return { errors, warnings, skipped: false, entryCount: 0 };
  }

  const entries = track.entries;
  const allIndexMuds = Array.isArray(mudIndex.muds) ? mudIndex.muds : [];
  const regularMuds = allIndexMuds.filter(mud => mud.tier === 'regular');
  const regularById = new Map(regularMuds.map(mud => [mud.mudId, mud]));
  const nonRegularIds = new Set(allIndexMuds.filter(mud => mud.tier !== 'regular').map(mud => mud.mudId));
  const mudIdCounts = new Map();

  entries.forEach((entry, index) => {
    REQUIRED_FIELDS.forEach(field => {
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
      warnings.push(`entries[${index}](${entry.mudId}): shortTitle이 ${entry.shortTitle.length}자입니다: "${entry.shortTitle}"`);
    }
    if (/^\d+차시$|^MUD\s*\d+$/.test(String(entry.shortTitle || '').trim())) {
      errors.push(`entries[${index}](${entry.mudId}): shortTitle이 금지된 번호식 이름입니다: "${entry.shortTitle}"`);
    }
    if (typeof entry.eraRange === 'string' && /~\s*$/.test(entry.eraRange)) {
      errors.push(`entries[${index}](${entry.mudId}): eraRange "${entry.eraRange}"가 열린 '~'로 끝납니다. '이후' 또는 '~현재'처럼 뜻을 명시하세요.`);
    }

    mudIdCounts.set(entry.mudId, (mudIdCounts.get(entry.mudId) || 0) + 1);
    const indexed = regularById.get(entry.mudId);
    if (nonRegularIds.has(entry.mudId)) {
      errors.push(`mudId "${entry.mudId}"는 regular 편이 아닙니다.`);
    } else if (!indexed) {
      errors.push(`mudId "${entry.mudId}"는 _index.json regular 목록에 없습니다.`);
    } else {
      if (entry.unitId !== indexed.unitId) {
        errors.push(`${entry.mudId}: lesson_track unitId(${entry.unitId})와 _index unitId(${indexed.unitId})가 다릅니다.`);
      }
      if (!sameIntegerArray(entry.lessonNumbers, indexed.lessonNumbers)) {
        errors.push(`${entry.mudId}: lesson_track lessonNumbers(${JSON.stringify(entry.lessonNumbers)})와 _index lessonNumbers(${JSON.stringify(indexed.lessonNumbers)})가 다릅니다.`);
      }
    }
  });

  mudIdCounts.forEach((count, mudId) => {
    if (count > 1) errors.push(`mudId "${mudId}"가 entries에 ${count}번 중복됩니다.`);
  });
  regularById.forEach((_mud, mudId) => {
    if (!mudIdCounts.has(mudId)) errors.push(`regular 편 "${mudId}"가 lesson_track entries에 빠져 있습니다.`);
  });
  if (entries.length !== regularMuds.length) {
    errors.push(`entries 개수(${entries.length})가 _index regular 편 수(${regularMuds.length})와 다릅니다.`);
  }

  const indexedRegularFiles = new Set();
  regularMuds.forEach(indexed => {
    if (typeof indexed.file !== 'string' || !indexed.file) {
      errors.push(`_index regular 편 "${indexed.mudId}"에 file이 없습니다.`);
      return;
    }
    indexedRegularFiles.add(indexed.file);
    const filePath = path.join(mudDir, indexed.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`_index regular 편 "${indexed.mudId}"가 가리키는 파일이 없습니다: ${indexed.file}`);
      return;
    }
    const mudData = readJson(filePath, errors, indexed.file);
    if (mudData && mudData.mudId !== indexed.mudId) {
      errors.push(`${indexed.file}: 내부 mudId "${mudData.mudId}"가 _index의 "${indexed.mudId}"와 다릅니다.`);
    }
  });

  const diskRegularFiles = fs.readdirSync(mudDir).filter(fileName => /^regular_.*\.json$/.test(fileName));
  diskRegularFiles.forEach(fileName => {
    if (!indexedRegularFiles.has(fileName)) errors.push(`정규 파일 "${fileName}"가 _index.json regular 목록에 등록되지 않았습니다.`);
  });
  indexedRegularFiles.forEach(fileName => {
    if (!diskRegularFiles.includes(fileName)) errors.push(`_index regular 파일 "${fileName}"가 data/mud의 regular_*.json 목록에 없습니다.`);
  });

  const orders = entries.map(entry => entry.order).filter(Number.isInteger).sort((a, b) => a - b);
  const expectedOrders = Array.from({ length: entries.length }, (_, index) => index + 1);
  if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
    errors.push(`order 값이 1~${entries.length}까지 이어지지 않습니다: [${orders.join(', ')}]`);
  }
  const byOrder = [...entries].filter(entry => Number.isInteger(entry.order)).sort((a, b) => a.order - b.order);
  for (let index = 1; index < byOrder.length; index += 1) {
    const prev = byOrder[index - 1];
    const curr = byOrder[index];
    const prevLesson = Math.min(...(prev.lessonNumbers || [Infinity]));
    const currLesson = Math.min(...(curr.lessonNumbers || [Infinity]));
    if (curr.unitId < prev.unitId || (curr.unitId === prev.unitId && currLesson < prevLesson)) {
      errors.push(`order ${prev.order}(${prev.mudId}) 다음 ${curr.order}(${curr.mudId})가 차시 오름차순이 아닙니다.`);
    }
  }

  const rangesByEra = new Map();
  entries.forEach(entry => {
    if (!rangesByEra.has(entry.eraLabel)) rangesByEra.set(entry.eraLabel, new Set());
    rangesByEra.get(entry.eraLabel).add(entry.eraRange);
  });
  rangesByEra.forEach((ranges, eraLabel) => {
    if (ranges.size > 1) errors.push(`eraLabel "${eraLabel}"의 eraRange가 서로 다릅니다: ${[...ranges].map(value => `"${value}"`).join(', ')}`);
    const actual = [...ranges][0];
    const expected = EXPECTED_ERA_RANGES[eraLabel];
    if (!expected) {
      warnings.push(`eraLabel "${eraLabel}"가 기대값 표에 없습니다. lesson_track_era_review.md와 함께 검토하세요.`);
    } else if (actual !== expected) {
      warnings.push(`eraLabel "${eraLabel}"의 eraRange는 "${actual}"이고 검증 기대값은 "${expected}"입니다. lesson_track_era_review.md와 EXPECTED_ERA_RANGES를 함께 갱신하세요.`);
    }
  });

  return { errors, warnings, skipped: false, entryCount: entries.length };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runSelfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lesson-track-validator-'));
  const mudDir = path.join(root, 'data', 'mud');
  const trackPath = path.join(root, 'data', 'lesson_track.json');
  const indexPath = path.join(mudDir, '_index.json');
  const baseTrack = { entries: [
    { order: 1, mudId: 'regular_one', unitId: 1, lessonNumbers: [2], eraLabel: '고려', eraRange: '918년~1392년', shortTitle: '첫 편' },
    { order: 2, mudId: 'regular_two', unitId: 1, lessonNumbers: [3], eraLabel: '고려', eraRange: '918년~1392년', shortTitle: '둘째 편' }
  ] };
  const baseIndex = { muds: [
    { mudId: 'regular_one', tier: 'regular', unitId: 1, lessonNumbers: [2], file: 'regular_one.json' },
    { mudId: 'regular_two', tier: 'regular', unitId: 1, lessonNumbers: [3], file: 'regular_two.json' }
  ] };
  const reset = () => {
    writeJson(trackPath, baseTrack);
    writeJson(indexPath, baseIndex);
    writeJson(path.join(mudDir, 'regular_one.json'), { mudId: 'regular_one' });
    writeJson(path.join(mudDir, 'regular_two.json'), { mudId: 'regular_two' });
    const extra = path.join(mudDir, 'regular_unregistered.json');
    if (fs.existsSync(extra)) fs.unlinkSync(extra);
  };
  const expectFailure = (name, mutate, pattern) => {
    reset();
    mutate();
    const result = validate({ trackPath, indexPath, mudDir, ci: true });
    if (!result.errors.some(error => pattern.test(error))) throw new Error(`${name}: 예상 오류 없음 — ${result.errors.join(' | ')}`);
    console.log(`PASS fixture: ${name}`);
  };

  try {
    reset();
    const baseline = validate({ trackPath, indexPath, mudDir, ci: true });
    if (baseline.errors.length) throw new Error(`정상 fixture 실패: ${baseline.errors.join(' | ')}`);
    console.log('PASS fixture: 정상 3자 계약');
    expectFailure('unitId 메타데이터 불일치', () => {
      const track = JSON.parse(fs.readFileSync(trackPath, 'utf8')); track.entries[0].unitId = 2; writeJson(trackPath, track);
    }, /unitId/);
    expectFailure('lessonNumbers 메타데이터 불일치', () => {
      const track = JSON.parse(fs.readFileSync(trackPath, 'utf8')); track.entries[0].lessonNumbers = [9]; writeJson(trackPath, track);
    }, /lessonNumbers/);
    expectFailure('정규 파일 index 등록 누락', () => {
      writeJson(path.join(mudDir, 'regular_unregistered.json'), { mudId: 'regular_unregistered' });
    }, /등록되지 않았습니다/);
    expectFailure('실제 JSON 내부 mudId 불일치', () => {
      writeJson(path.join(mudDir, 'regular_one.json'), { mudId: 'regular_wrong' });
    }, /내부 mudId/);
    expectFailure('같은 시대 다른 범위', () => {
      const track = JSON.parse(fs.readFileSync(trackPath, 'utf8')); track.entries[1].eraRange = '919년~1392년'; writeJson(trackPath, track);
    }, /서로 다릅니다/);
    expectFailure('끝이 열린 범위', () => {
      const track = JSON.parse(fs.readFileSync(trackPath, 'utf8')); track.entries[0].eraRange = '918년~'; writeJson(trackPath, track);
    }, /열린 '~'/);
    const missing = path.join(root, 'missing.json');
    if (!validate({ trackPath: missing, indexPath, mudDir, ci: true }).errors.length) throw new Error('--ci 부재 실패 없음');
    const devMissing = validate({ trackPath: missing, indexPath, mudDir, ci: false });
    if (!devMissing.skipped || devMissing.errors.length) throw new Error('기본 부재 SKIP 실패');
    console.log('PASS fixture: --ci 부재 실패 / 기본 실행 SKIP');
    console.log('PASS: lesson track validator self-test');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function runMain() {
  const args = new Set(process.argv.slice(2));
  if (args.has('--self-test')) return runSelfTest();
  const result = validate({ trackPath: DEFAULT_TRACK_PATH, indexPath: DEFAULT_INDEX_PATH, mudDir: DEFAULT_MUD_DIR, ci: args.has('--ci') });
  if (result.skipped) return console.log(`SKIP: ${path.relative(process.cwd(), DEFAULT_TRACK_PATH)}가 아직 없습니다.`);
  result.warnings.forEach(warning => console.log(`  [경고] ${warning}`));
  if (result.errors.length) {
    console.error(`FAIL: data/lesson_track.json 검사 실패(${result.errors.length}건)`);
    result.errors.forEach(error => console.error(`  - ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: data/lesson_track.json — entries ${result.entryCount}개, index·실제 JSON과 1:1 대응, D-037 표기 확인`);
}

runMain();
