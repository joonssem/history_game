// =========================================================
// scripts/17_lint_sensitive_wording.js
// 3단원(일제강점기·광복·6·25)에서 D-032 §0-2가 조심하라고 정한 표현
// 신호를 모은다. scripts/14가 inquiry-task에서 한 일을 3단원 전체
// 데이터에 적용한 것이다.
//
// 실패가 아니라 검토 목록이다. 문장의 뜻이 실제로 맞는지, 과장인지는
// 사람(관문 설계실·대조실·연결 공방)이 원문과 대조해 판단한다. 이
// 스크립트는 "볼 만한 곳"을 좁혀 주는 신호 수집기일 뿐이다.
//
// 범위: 이번 라운드는 3단원에만 적용한다(§4 주의). 1·2단원에 그대로
// 적용하면 이미 여러 라운드에 걸쳐 사람이 검증한 문장까지 무더기로
// 걸린다. 다른 단원 확대는 문서 끝의 "확장 제안"에만 적어 두고
// 구현하지 않는다.
// =========================================================

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const MUD_DIR = path.join(ROOT, 'data', 'mud');
const REPORT_PATH = path.join(ROOT, 'docs', 'audits', 'sensitive_wording_lint.md');
const TARGET_UNIT_ID = 3;

// --- 문장 나누기 (scripts/15 C1-05와 같은 기준: 마침표·물음표·느낌표·줄바꿈에서만) ---
function splitSentences(text) {
  return String(text || '').split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
}

// 이미 조심스럽게 한계를 밝히는 문장은 신호가 아니라 모범 사례다.
// "모든 ~인 것은 아니다", "~라고 단정할 수 없다" 같은 문장을 오탐으로 잡지 않는다.
// 회귀로 확인된 함정: "아니다"의 존댓말 활용형 "아닙니다"는 니+ㅂ이 "닙"으로
// 합쳐져 "아니"라는 부분 문자열을 포함하지 않는다("것은 아니" 패턴만으로는
// "것은 아닙니다"를 못 잡는다). "아닙니다"를 별도 항목으로 추가했다.
const NEGATION_PATTERN = /(것은\s*아니|아닙니다|수는?\s*없|아니었|않았|알기\s*어렵|단정할\s*수)/;

// --- 신호 정의 ---

// 1. 전칭 표현 + 민족·국가·집단 명사가 가까이 있는 경우.
const QUANTIFIER_WORDS = ['모든', '전부', '누구나', '전 국민', '전국민', '모두가'];
const GROUP_NOUNS = ['사람', '국민', '민족', '백성', '군인', '일본인', '조선인', '한국인', '병사', '주민', '학생', '여성', '남성', '농민'];
function checkUniversalQuantifier(sentence) {
  if (NEGATION_PATTERN.test(sentence)) return null;
  for (const q of QUANTIFIER_WORDS) {
    const qIndex = sentence.indexOf(q);
    if (qIndex < 0) continue;
    const window = sentence.slice(qIndex, qIndex + q.length + 10);
    const group = GROUP_NOUNS.find(g => window.includes(g));
    if (group) return `전칭 표현 "${q}"이(가) 집단 명사("${group}")와 가까이 있습니다.`;
  }
  return null;
}

// 2. 확정 수치: "정확히", 범위 표기 없는 "총 N명"류 큰 수.
const RANGE_HEDGE_PATTERN = /약|추정|안팎|이상|이하|넘는|넘게|정도|~|여\s|여명|여\s*명/;
function checkAbsoluteNumber(sentence) {
  if (sentence.includes('정확히')) return '확정 수치 표현 "정확히"가 있습니다.';
  const totalMatch = sentence.match(/총\s?[0-9][0-9,]*\s?(만\s?)?명/);
  if (totalMatch && !RANGE_HEDGE_PATTERN.test(sentence)) {
    return `범위 표기(약·추정·이상 등) 없이 확정 수치처럼 쓴 "${totalMatch[0]}"가 있습니다.`;
  }
  return null;
}

// 3. 인과 단정: 정책·사건과 결과를 "때문에/그 결과/덕분에"로 잇는 경우.
const CAUSATION_WORDS = ['때문에', '그 결과', '덕분에'];
function checkCausation(sentence) {
  if (NEGATION_PATTERN.test(sentence)) return null;
  const word = CAUSATION_WORDS.find(w => sentence.includes(w));
  return word ? `인과 단정 표현 "${word}"이(가) 있습니다 — 원문이 이 인과를 그대로 말하는지 확인하세요.` : null;
}

// 4. 감정 자극어. 5학년 교재 기준으로 "사실을 넘어 감정을 자극하는 정도"의
// 묘사어만 담았다 — 사건 자체를 가리키는 중립적 학술 용어(예: "학살"이
// 공식 지정 명칭에 쓰이는 경우, "희생"처럼 교과서가 이미 쓰는 말)는 뺐다.
// 목록은 자유롭게 정한 것이라, 오탐이 잦으면 §허용 목록으로 옮긴다.
const EMOTIONAL_WORDS = ['잔혹하게', '참혹하게', '끔찍하게', '무참히', '피바다', '처참하게', '악랄하게', '무자비하게'];
function checkEmotionalWording(sentence) {
  const word = EMOTIONAL_WORDS.find(w => sentence.includes(w));
  return word ? `감정 자극어 "${word}"가 있습니다 — 자료에 근거한 서술로 낮출 수 있는지 검토하세요.` : null;
}

// 5. 인물 평가어. 공과를 새로 판정하는 수식어인지 확인이 필요하다.
const EVALUATION_WORDS = ['위대한', '매국', '배신자', '영웅적인', '악랄한 인물', '친일파', '민족의 배신자'];
function checkPersonEvaluation(sentence) {
  const word = EVALUATION_WORDS.find(w => sentence.includes(w));
  return word ? `인물 평가어 "${word}"가 있습니다 — 공식 출처의 표현을 넘지 않는지 확인하세요.` : null;
}

const SIGNAL_CHECKS = [
  { kind: '전칭 표현', check: checkUniversalQuantifier },
  { kind: '확정 수치', check: checkAbsoluteNumber },
  { kind: '인과 단정', check: checkCausation },
  { kind: '감정 자극어', check: checkEmotionalWording },
  { kind: '인물 평가어', check: checkPersonEvaluation }
];

// --- 허용 목록(scripts/14와 같은 방식) ---
// 사람이 읽고 "문제없다"고 확정한 문구를 패턴으로 옮긴다. 형식:
// { re: /.../, reason: '...' } — 문장이 이 패턴에 매치되면 그 신호는
// 조용히 허용 목록으로 옮겨지고, 다음 실행부터 검토 후보에서 빠진다.
const ALLOWLIST = [
  // 예시(현재 비어 있음): 라운드 검토 후 실제 허용 사례가 나오면 여기에 추가한다.
  // { re: /6·25 전쟁 때문에 많은 사람이 삶의 터전을 잃었습니다/, reason: '교과서 표준 서술, 2026-09-21 대조실 확인' }
];
function isAllowed(sentence) {
  const rule = ALLOWLIST.find(r => r.re.test(sentence));
  return rule ? rule.reason : null;
}

// --- 텍스트 추출 ---

// MUD JSON 전체를 재귀로 훑되, 기술적 필드(식별자·좌표·타입 등)는 뺀다.
// 학생이 실제로 읽는 문장만 최대한 넓게 잡으려는 블록리스트 방식이다.
const TECHNICAL_KEYS = new Set([
  'id', 'mudId', 'storyId', 'badgeId', 'next', 'mode', 'scene', 'type', 'interaction',
  'url', 'checkedAt', 'artifactId', 'roleId', 'file', 'tier', 'tierColor', 'tierName',
  'themeColor', 'accentColor', 'bgGradient', 'sequenceKind', 'progressKey', 'strategy',
  'icon', 'x', 'y', 'radius', 'order', 'correctOrder', 'requiredEvidenceIds',
  'allowedEvidenceIds', 'evidenceId', 'claimScope', 'institution', 'category', 'era',
  'chasi', 'unitId', 'lessonNumbers', 'version', 'minEvidence', 'maxEvidence',
  'minCategories', 'requiredCategories', 'increment', 'target', 'minActions',
  'uniqueActions', 'completion', 'sequence', 'correct', 'sources', 'hotspots'
]);

function collectTexts(node, pathPrefix, out) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    if (node.trim()) out.push([pathPrefix, node]);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectTexts(item, `${pathPrefix}[${i}]`, out));
    return;
  }
  if (typeof node === 'object') {
    Object.entries(node).forEach(([key, value]) => {
      if (TECHNICAL_KEYS.has(key)) return;
      collectTexts(value, pathPrefix ? `${pathPrefix}.${key}` : key, out);
    });
  }
}

function lintTexts(sourceLabel, texts) {
  const findings = [];
  const allowed = [];
  texts.forEach(([fieldPath, text]) => {
    splitSentences(text).forEach(sentence => {
      SIGNAL_CHECKS.forEach(({ kind, check }) => {
        const message = check(sentence);
        if (!message) return;
        const reason = isAllowed(sentence);
        const entry = { sourceLabel, fieldPath, kind, sentence: sentence.trim(), message };
        if (reason) allowed.push({ ...entry, reason });
        else findings.push(entry);
      });
    });
  });
  return { findings, allowed };
}

// --- 편별 대상 수집 ---

function collectUnit3RegularMuds() {
  const mudIndex = JSON.parse(fs.readFileSync(path.join(MUD_DIR, '_index.json'), 'utf-8'));
  return (mudIndex.muds || []).filter(m => m.tier === 'regular' && m.unitId === TARGET_UNIT_ID);
}

function lintMudFile(mudId) {
  const filePath = path.join(MUD_DIR, `${mudId}.json`);
  if (!fs.existsSync(filePath)) return { findings: [], allowed: [], skipped: true };
  const mudData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const texts = [];
  collectTexts(mudData.stages, `${mudId}.stages`, texts);
  // header/roadmap도 학생이 읽는 문구다.
  collectTexts(mudData.header, `${mudId}.header`, texts);
  collectTexts(mudData.roadmap, `${mudId}.roadmap`, texts);
  return lintTexts(mudId, texts);
}

function lintQuizzes() {
  const quizzesPath = path.join(ROOT, 'data', 'quizzes.json');
  if (!fs.existsSync(quizzesPath)) return { findings: [], allowed: [] };
  const quizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf-8'));
  const unit3Quizzes = quizzes.filter(q => q.unit === '일제강점기 및 근현대');
  const texts = [];
  unit3Quizzes.forEach(q => {
    collectTexts(q.question, `quizzes[${q.id}].question`, texts);
    collectTexts(q.options, `quizzes[${q.id}].options`, texts);
    collectTexts(q.explanation, `quizzes[${q.id}].explanation`, texts);
  });
  return lintTexts('data/quizzes.json (3단원)', texts);
}

// stories.json/stories_chasi2.json에는 unitId 필드가 없다. 제목·chasi
// 표기에 3단원 신호(일제강점기·광복·6·25 관련 낱말)가 있는 편만 고른다
// — 지금은 0편이지만, 나중에 3단원 스토리가 추가되면 자동으로 걸린다.
const STORY_UNIT3_HINT = /일제강점기|광복|6\W?25|한국\s?전쟁|독립운동|3\W?1\s?운동/;
function lintStories() {
  const files = ['stories.json', 'stories_chasi2.json'];
  let findings = [];
  let allowed = [];
  let matchedCount = 0;
  files.forEach(file => {
    const filePath = path.join(ROOT, 'data', file);
    if (!fs.existsSync(filePath)) return;
    const stories = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    stories
      .filter(s => STORY_UNIT3_HINT.test(`${s.title || ''} ${s.chasi || ''} ${s.era || ''}`))
      .forEach(story => {
        matchedCount += 1;
        const texts = [];
        collectTexts(story, `${file}#${story.id}`, texts);
        const result = lintTexts(`${file}#${story.id}`, texts);
        findings = findings.concat(result.findings);
        allowed = allowed.concat(result.allowed);
      });
  });
  return { findings, allowed, matchedCount };
}

// causeEffectChains.json에는 단원 구분 필드가 없다. 제목으로 3단원 세트를
// 고른다(§0-2 대상: 일제강점기·광복). 이 판단 자체가 추정이므로 보고서에
// 표시한다.
const CAUSE_EFFECT_UNIT3_HINT = /빼앗|광복|분단|일제|독립|3\W?1\s?운동/;
function lintCauseEffectChains() {
  const filePath = path.join(ROOT, 'data', 'causeEffectChains.json');
  if (!fs.existsSync(filePath)) return { findings: [], allowed: [], matchedTitles: [] };
  const chains = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const unit3Chains = chains.filter(c => CAUSE_EFFECT_UNIT3_HINT.test(c.title || ''));
  const texts = [];
  unit3Chains.forEach(chain => {
    collectTexts(chain.title, `causeEffectChains[stage${chain.stage}].title`, texts);
    collectTexts(chain.description, `causeEffectChains[stage${chain.stage}].description`, texts);
    (chain.events || []).forEach(ev => {
      collectTexts(ev.title, `causeEffectChains[stage${chain.stage}].events[${ev.id}].title`, texts);
      collectTexts(ev.hint, `causeEffectChains[stage${chain.stage}].events[${ev.id}].hint`, texts);
    });
  });
  const result = lintTexts('data/causeEffectChains.json (3단원 추정)', texts);
  return { ...result, matchedTitles: unit3Chains.map(c => c.title) };
}

// artifacts.json에는 unitId가 없어 라운드 10 §2가 지정한 9종 id로 범위를
// 좁힌다(name/desc/hint만 — tier/tierColor 등은 학생 서술이 아니다).
const UNIT3_ARTIFACT_IDS = ['art_15', 'art_16', 'art_17', 'art_18', 'art_20', 'art_24', 'art_independence', 'art_korean_war', 'art_deep_4'];
function lintArtifacts() {
  const filePath = path.join(ROOT, 'data', 'artifacts.json');
  if (!fs.existsSync(filePath)) return { findings: [], allowed: [], missingIds: [] };
  const artifacts = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const byId = new Map(artifacts.map(a => [a.id, a]));
  const missingIds = UNIT3_ARTIFACT_IDS.filter(id => !byId.has(id));
  const texts = [];
  UNIT3_ARTIFACT_IDS.forEach(id => {
    const art = byId.get(id);
    if (!art) return;
    collectTexts(art.name, `artifacts[${id}].name`, texts);
    collectTexts(art.desc, `artifacts[${id}].desc`, texts);
    collectTexts(art.hint, `artifacts[${id}].hint`, texts);
  });
  const result = lintTexts('data/artifacts.json (3단원 9종)', texts);
  return { ...result, missingIds };
}

// 회귀 fixture(scripts/15 C1-05와 같은 교훈): 부정·한계 문장을 신호로
// 잘못 잡으면 안 되고, 진짜 위반은 여전히 잡혀야 한다. 매 실행마다
// 확인해 splitSentences·NEGATION_PATTERN이 다시 깨지면 즉시 실패한다.
function runSelfTests() {
  assert.equal(
    checkUniversalQuantifier('이 전쟁으로 모든 사람이 피해를 입은 것은 아닙니다.'),
    null,
    '회귀: 한계를 밝히는 "모든 ~인 것은 아니다"는 전칭 표현 신호를 내면 안 됩니다.'
  );
  assert.ok(
    checkUniversalQuantifier('모든 일본인이 이 정책에 찬성했습니다.') !== null,
    '회귀: 실제 전칭 표현("모든 일본인")은 여전히 신호를 내야 합니다.'
  );
  assert.equal(
    checkCausation('이 정책 때문이라고 단정할 수 없습니다.'),
    null,
    '회귀: "단정할 수 없다"로 한계를 밝힌 인과 문장은 신호를 내면 안 됩니다.'
  );
  assert.ok(
    checkCausation('강한 감시 때문에 활동이 어려웠습니다.') !== null,
    '회귀: 실제 인과 단정 문장은 여전히 신호를 내야 합니다.'
  );
  assert.equal(
    checkAbsoluteNumber('약 200만 명이 동원된 것으로 추정됩니다.'),
    null,
    '회귀: 범위·추정 표기가 있는 수치는 신호를 내면 안 됩니다.'
  );
  assert.ok(
    checkAbsoluteNumber('총 200만 명이 동원되었습니다.') !== null,
    '회귀: 범위 표기 없는 확정 수치는 여전히 신호를 내야 합니다.'
  );
}

function main() {
  runSelfTests();

  const unit3Muds = collectUnit3RegularMuds();
  const mudResults = unit3Muds.map(m => ({ mudId: m.mudId, ...lintMudFile(m.mudId) }));
  const quizResult = lintQuizzes();
  const storyResult = lintStories();
  const chainResult = lintCauseEffectChains();
  const artifactResult = lintArtifacts();

  const allFindings = [
    ...mudResults.flatMap(r => r.findings),
    ...quizResult.findings,
    ...storyResult.findings,
    ...chainResult.findings,
    ...artifactResult.findings
  ];
  const allAllowed = [
    ...mudResults.flatMap(r => r.allowed),
    ...quizResult.allowed,
    ...storyResult.allowed,
    ...chainResult.allowed,
    ...artifactResult.allowed
  ];

  console.log('3단원 민감 주제 표현 lint (검토 목록 — 실패가 아니다)\n');
  console.log(`대상 MUD ${unit3Muds.length}편: ${unit3Muds.map(m => m.mudId).join(', ')}`);
  console.log(`퀴즈 3단원 문항 대상, 스토리 3단원 추정 ${storyResult.matchedCount}편, 원인결과 3단원 추정 세트: ${chainResult.matchedTitles.join(', ') || '없음'}`);
  if (artifactResult.missingIds.length) {
    console.log(`주의: artifacts.json에 없는 id — ${artifactResult.missingIds.join(', ')}`);
  }
  console.log(`\n총 신호 ${allFindings.length}건 (허용됨 ${allAllowed.length}건 별도)\n`);

  const byKind = new Map();
  allFindings.forEach(f => {
    if (!byKind.has(f.kind)) byKind.set(f.kind, []);
    byKind.get(f.kind).push(f);
  });
  byKind.forEach((list, kind) => {
    console.log(`[${kind}] ${list.length}건`);
    list.forEach(f => console.log(`  ${f.sourceLabel} ${f.fieldPath}: ${f.message}\n    "${f.sentence}"`));
  });

  const reportLines = [
    '# 3단원 민감 주제 표현 lint',
    '',
    `생성: \`scripts/17_lint_sensitive_wording.js\` (${new Date().toISOString().slice(0, 10)})`,
    '',
    '기계가 신호로 잡을 수 있는 것만 본다. **실패가 아니라 검토 목록이다.** 문장의 뜻이 실제로 맞는지, 과장인지는 관문 설계실·대조실·연결 공방이 원문과 대조해 판단한다.',
    '',
    `- 대상 MUD(정규 3단원 ${unit3Muds.length}편): ${unit3Muds.map(m => m.mudId).join(', ')}`,
    `- 퀴즈: \`data/quizzes.json\`의 \`unit: "일제강점기 및 근현대"\` 문항`,
    `- 스토리: \`stories.json\`·\`stories_chasi2.json\` 중 제목·chasi 표기로 3단원을 추정한 ${storyResult.matchedCount}편(현재 0편이면 아직 3단원 스토리가 없다는 뜻)`,
    `- 원인과 결과: \`causeEffectChains.json\` 중 제목으로 3단원을 추정한 세트 — ${chainResult.matchedTitles.length ? chainResult.matchedTitles.join(', ') : '없음'}(**unitId 필드가 없어 제목 키워드로 추정한 것이므로 사람이 재확인 필요**)`,
    `- 유물: \`artifacts.json\`의 지정 9종(${UNIT3_ARTIFACT_IDS.join(', ')})`,
    '',
    artifactResult.missingIds.length ? `> 주의: artifacts.json에서 다음 id를 찾지 못했습니다 — ${artifactResult.missingIds.join(', ')}\n` : '',
    '## 신호 5종',
    '',
    '1. 전칭 표현 — "모든/전부/누구나/전 국민/모두가" + 집단 명사',
    '2. 확정 수치 — "정확히", 범위 표기 없는 "총 N명"',
    '3. 인과 단정 — "때문에/그 결과/덕분에"',
    '4. 감정 자극어 — 5학년 교재 기준을 넘는 과한 묘사(목록은 스크립트 주석에 근거와 함께 기록)',
    '5. 인물 평가어 — 공과를 새로 판정하는 수식어',
    '',
    `이미 "~것은 아니다", "~수 없다"처럼 한계를 밝히는 문장은 신호에서 뺐다(부정문 오탐 제거, scripts/15 C1-05와 같은 기준).`,
    ''
  ];

  if (!allFindings.length) {
    reportLines.push('검토 신호 없음.\n');
  } else {
    reportLines.push('| 종류 | 출처 | 필드 | 문장 | 내용 |', '|---|---|---|---|---|');
    allFindings.forEach(f => {
      reportLines.push(`| ${f.kind} | ${f.sourceLabel} | ${f.fieldPath} | ${f.sentence.replace(/\|/g, '\\|')} | ${f.message} |`);
    });
    reportLines.push('');
  }

  if (allAllowed.length) {
    reportLines.push(`<details><summary>허용됨(${allAllowed.length}건) — 사람이 검토해 문제없다고 판단, 재검토 불필요</summary>`, '');
    reportLines.push('| 종류 | 출처 | 필드 | 문장 | 허용 사유 |', '|---|---|---|---|---|');
    allAllowed.forEach(f => {
      reportLines.push(`| ${f.kind} | ${f.sourceLabel} | ${f.fieldPath} | ${f.sentence.replace(/\|/g, '\\|')} | ${f.reason} |`);
    });
    reportLines.push('', '</details>', '');
  }

  reportLines.push(
    '## 확장 제안 (구현하지 않음)',
    '',
    '이번 라운드는 3단원에만 적용했다(§4 주의 — 1·2단원에 그대로 적용하면 이미 검증된 문장까지 무더기로 걸린다). 1·2단원까지 넓히려면:',
    '',
    '- 먼저 1·2단원 각각에 대해 이 스크립트를 시험 실행해 신호 개수를 가늠하고,',
    '- 허용 목록을 1·2단원 검증 완료 문구로 미리 채운 뒤,',
    '- 대상 범위를 `TARGET_UNIT_ID` 하나가 아니라 배열로 넓히는 순서를 제안한다.',
    '',
    '지금은 구현하지 않는다.'
  );

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${reportLines.join('\n')}\n`, 'utf-8');
  console.log(`\n보고서 작성: ${path.relative(process.cwd(), REPORT_PATH)}`);
}

main();
