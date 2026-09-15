// =========================================================
// scripts/14_lint_inquiry_semantics.js
// 라운드 3 red team이 사람이 읽어서 찾은 결함(R3-07, R3-04, D-030 3) 가운데
// 기계가 신호로 잡을 수 있는 것만 도구로 만든다. 실패가 아니라 검토
// 목록을 낸다 — 문장의 뜻이 실제로 맞는지는 사람이 최종 판단한다.
// =========================================================

const fs = require('node:fs');
const path = require('node:path');

const MUD_DIR = path.join(__dirname, '..', 'data', 'mud');
const REPORT_PATH = path.join(__dirname, '..', 'docs', 'audits', 'inquiry_semantics_lint.md');

// 완결·필연을 단정하는 표현. "검토 경고"용이라 오탐을 허용한다(R3-04).
const ABSOLUTE_WORDS = ['완성', '가장 먼저', '반드시', '뒤에야', '마지막 단계'];
const ARROW_PATTERN = /[→>-]{1,2}/g;
const YEAR_PATTERN = /\d{3,4}\s*년|\(\s*\d{3,4}\s*\)/;

// 라운드 5: "완료·단정어" 중 실제로는 역사 단정이 아닌 두 패턴을 사람이 읽고 확인해
// 허용 목록으로 옮겼다(§4-2). 둘 다 아니면 여전히 검토 후보로 남는다.
// - 게임 진행 표현: "판단 확인" 버튼을 누르라는 화면 지시문일 뿐 역사 서술이 아니다.
// - "완성된 N" 서술어: 이미 만들어진 사물을 가리키는 평범한 수식어다. 다른 절대어
//   (가장 먼저·반드시·뒤에야·마지막 단계)와 함께 나오면 그 자체가 별도로 걸리므로
//   여기서 놓치지 않는다.
const ABSOLUTE_ALLOWLIST = [
  { re: /완성(해야\s*합니다|하세요|했습니다|해\s*보세요)/, reason: '게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)' },
  { re: /완성된\s*\S+/, reason: '"완성된 N" — 이미 만들어진 사물을 가리키는 일반 서술어' },
  { re: /(옷|경판|물건|도구|작품)[가이]?\s*완성(됩니다|될|되었습니다|되어야)/, reason: '만드는 과정에서 사물이 완성되는지를 말하는 기능적 서술 — 해석의 필연성이 아니라 제작 조건을 설명함' },
  { re: /완성할\s*수\s*있습니다/, reason: '만드는 조건을 설명하는 기능적 서술 — 해석의 필연성 단정이 아님' }
];

function classifyAbsoluteMatch(text) {
  for (const rule of ABSOLUTE_ALLOWLIST) {
    if (rule.re.test(text)) return { allowed: true, reason: rule.reason };
  }
  return { allowed: false };
}

function stripParenthetical(label) {
  return String(label || '').replace(/\([^)]*\)/g, '').trim();
}

function labelTokens(label) {
  return stripParenthetical(label)
    .split(/[\s·,]+/)
    .map(t => t.trim())
    .filter(t => t.length >= 2);
}

// --- 체크 1: sequence 카드의 정답 순서가 안내문·설명문에 미리 드러나는가 (R3-07) ---
function checkSequenceOrderLeak(mudId, stageKey, simulator, task) {
  const warnings = [];
  const cards = task.cards || [];
  const correctOrder = task.correctOrder || [];
  if (!cards.length || !correctOrder.length) return warnings;
  const cardsById = new Map(cards.map(c => [c.id, c]));
  const orderedCards = correctOrder.map(id => cardsById.get(id)).filter(Boolean);
  if (orderedCards.length !== correctOrder.length) return warnings;

  const candidateFields = [
    ['simulator.instruction', simulator.instruction],
    ['task.prompt', task.prompt],
    ['meaningQuestion.prompt', task.meaningQuestion?.prompt]
  ];
  (task.meaningQuestion?.options || []).forEach(opt => {
    if (opt.correct !== true) candidateFields.push([`meaningQuestion.options[${opt.id}].feedback`, opt.feedback]);
  });

  candidateFields.forEach(([fieldName, text]) => {
    if (!text) return;
    const plain = String(text).replace(/<[^>]+>/g, '');

    // (a) 구조적 신호: 카드 수만큼의 조각이 화살표류 기호로 이어진 사슬이 있으면,
    // 정답 순서 자체를 요약해 보여 주는 문구일 가능성이 높다(단어가 라벨과 달라도 잡는다).
    const chainRegex = new RegExp(`[^\\s→>-]+(?:\\s*${ARROW_PATTERN.source}\\s*[^\\s→>-]+){${orderedCards.length - 1}}`, 'g');
    const chainMatch = plain.match(chainRegex);
    if (chainMatch) {
      warnings.push({
        mudId, stageKey, field: fieldName,
        message: `카드 수(${orderedCards.length})만큼 화살표로 이어진 문구가 있습니다: "${chainMatch[0]}"`
      });
    }

    // (b) 어휘 신호: 카드 라벨(핵심어)이 정답 순서 그대로 텍스트에 등장하는가.
    let lastIndex = -1;
    let allFound = true;
    for (const card of orderedCards) {
      const tokens = labelTokens(card.label);
      let bestIndex = -1;
      for (const token of tokens) {
        const idx = plain.indexOf(token, lastIndex + 1);
        if (idx >= 0 && (bestIndex < 0 || idx < bestIndex)) bestIndex = idx;
      }
      if (bestIndex < 0) { allFound = false; break; }
      lastIndex = bestIndex;
    }
    if (allFound) {
      warnings.push({
        mudId, stageKey, field: fieldName,
        message: '카드 라벨(핵심어)이 정답 순서 그대로 텍스트에 등장합니다.'
      });
    }
  });

  return warnings;
}

// --- 체크 2: sequence 카드가 날짜로 확인되는 사건인가 (D-030 3) ---
// 라운드 5: 공정 순서(토기 만들기, 활자 인쇄 단계)는 애초에 "몇 년에 일어난 일"이
// 아니라 "무엇을 먼저 해야 다음이 가능한가"를 묻는 문법이라 카드에 연도가 없는 게
// 정상이다. 데이터에 이를 구분하는 필드가 없어(§4-1, 스키마 제안은 보고서 참고),
// 카드 전부가 날짜 없이 구성돼 있으면 "공정 순서"로 보고 카드별 경고를 한 줄
// 요약으로 묶는다. 날짜가 섞여 있으면(일부만 있음) "사건 순서"로 보고 날짜 없는
// 카드만 개별적으로 계속 경고한다 — 그게 진짜 검토할 공백이다(삼국 3관문 사례).
function checkSequenceDatelessCards(mudId, stageKey, task) {
  const warnings = [];
  const cards = task.cards || [];
  const datelessCards = cards.filter(card => !YEAR_PATTERN.test(`${card.label || ''} ${card.detail || ''}`));
  if (!datelessCards.length) return warnings;

  if (datelessCards.length === cards.length) {
    warnings.push({
      mudId, stageKey, field: `cards (${cards.length}장 전체)`,
      kind: 'process',
      message: `카드 전부에 연도 표지가 없습니다 — 공정 순서(무엇을 먼저 해야 다음이 가능한가)로 보입니다. 사건 순서로 의도했다면 확인하세요.`
    });
  } else {
    datelessCards.forEach(card => {
      warnings.push({
        mudId, stageKey, field: `cards[${card.id}]`,
        kind: 'event',
        message: '다른 카드에는 연도가 있는데 이 카드만 없습니다 — 사건 순서 중 날짜 공백으로 보입니다. 연도를 추가할지 검토하세요.'
      });
    });
  }
  return warnings;
}

// --- 체크 3: map-evidence 오답 feedback이 정답 장소 라벨을 그대로 드러내는가 (R3-07) ---
function checkMapEvidenceLocationLeak(mudId, stageKey, task) {
  const warnings = [];
  const locations = task.locations || [];
  const correct = locations.find(l => l.correct);
  if (!correct?.label) return warnings;
  locations.forEach(loc => {
    if (loc.correct || !loc.feedback) return;
    if (loc.feedback.includes(correct.label)) {
      warnings.push({
        mudId, stageKey, field: `locations[${loc.id}].feedback`,
        message: `오답 피드백이 정답 장소 라벨("${correct.label}")을 그대로 포함합니다.`
      });
    }
  });
  return warnings;
}

// --- 체크 4: 완료·단정어 (R3-04) ---
// 라운드 5: 사람이 8건을 전부 읽어 분류했다 — 전부 "판단 확인" 버튼을 누르라는
// 화면 지시문이거나 "완성된 N"(이미 만들어진 사물) 서술어였고, 실제 역사를 필연·
// 완결로 단정한 사례는 없었다(§4-2). 그 판단을 ABSOLUTE_ALLOWLIST로 코드에
// 옮겨서, 같은 문구가 다른 편에도 나오면 검토 시간을 다시 쓰지 않게 한다.
function checkAbsoluteWording(mudId, stageKey, node, pathPrefix, reviewWarnings, allowedWarnings) {
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (typeof value === 'string' && ['feedback', 'detail', 'successText'].includes(key)) {
      ABSOLUTE_WORDS.forEach(word => {
        if (!value.includes(word)) return;
        const { allowed, reason } = classifyAbsoluteMatch(value);
        if (allowed) {
          allowedWarnings.push({ field: currentPath, message: `"${word}" — 허용(${reason})` });
        } else {
          reviewWarnings.push({ field: currentPath, message: `필연·완결 표현 "${word}"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요.` });
        }
      });
    } else if (value && typeof value === 'object') {
      checkAbsoluteWording(mudId, stageKey, value, currentPath, reviewWarnings, allowedWarnings);
    }
  }
}

// --- 체크 5: inquiry-task 편의 sources에 개별 출처가 있는가 ---
function checkSourceGap(mudId, sources) {
  const warnings = [];
  const list = Array.isArray(sources) ? sources : [];
  const isGeneric = s => /2022\s*개정/.test(s.title || '') || /교육과정/.test(s.title || '') && !s.claimScope?.includes('확인');
  const individual = list.filter(s => !isGeneric(s));
  if (individual.length === 0) {
    warnings.push({ mudId, message: `sources ${list.length}건이 모두 교육과정 문서 성격 — 개별 대조 출처가 보이지 않습니다.` });
  }
  return warnings;
}

function findInquiryStages(mudData) {
  return Object.keys(mudData.stages || {})
    .map(key => ({ key, stage: mudData.stages[key] }))
    .filter(({ stage }) => stage?.simulator?.interaction === 'inquiry-task');
}

function lintMud(mudId, mudData) {
  const inquiryStages = findInquiryStages(mudData);
  if (!inquiryStages.length) return null;

  const findings = { order: [], dateless: [], mapLeak: [], absolute: [], absoluteAllowed: [], sourceGap: [] };

  inquiryStages.forEach(({ key, stage }) => {
    const { simulator } = stage;
    const task = simulator.task || {};
    if (task.type === 'sequence') {
      findings.order.push(...checkSequenceOrderLeak(mudId, key, simulator, task));
      findings.dateless.push(...checkSequenceDatelessCards(mudId, key, task));
    }
    if (task.type === 'map-evidence') {
      findings.mapLeak.push(...checkMapEvidenceLocationLeak(mudId, key, task));
    }
    const reviewWarnings = [];
    const allowedWarnings = [];
    checkAbsoluteWording(mudId, key, simulator, `stages.${key}.simulator`, reviewWarnings, allowedWarnings);
    findings.absolute.push(...reviewWarnings.map(w => ({ mudId, stageKey: key, ...w })));
    findings.absoluteAllowed.push(...allowedWarnings.map(w => ({ mudId, stageKey: key, ...w })));
  });

  findings.sourceGap.push(...checkSourceGap(mudId, mudData.sources));

  return findings;
}

function main() {
  const files = fs.readdirSync(MUD_DIR).filter(f => f.endsWith('.json')).sort();
  const allResults = [];
  for (const file of files) {
    const mudId = file.replace(/\.json$/, '');
    const mudData = JSON.parse(fs.readFileSync(path.join(MUD_DIR, file), 'utf-8'));
    const result = lintMud(mudId, mudData);
    if (result) allResults.push({ mudId, ...result });
  }

  const totalWarnings = allResults.reduce((sum, r) =>
    sum + r.order.length + r.dateless.length + r.mapLeak.length + r.absolute.length + r.sourceGap.length, 0);

  console.log('inquiry-task 의미 lint (검토 목록 — 실패가 아니다)\n');
  const lines = [];
  allResults.forEach(r => {
    const rows = [
      ...r.order.map(w => ['순서 노출', w.stageKey, w.field, w.message]),
      ...r.dateless.map(w => [w.kind === 'process' ? '날짜 없는 카드(공정 순서)' : '날짜 없는 카드(사건 순서)', w.stageKey, w.field, w.message]),
      ...r.mapLeak.map(w => ['정답 장소 노출', w.stageKey, w.field, w.message]),
      ...r.absolute.map(w => ['완료·단정어 — 검토 후보', w.stageKey, w.field, w.message]),
      ...r.sourceGap.map(w => ['출처 공백', '-', '-', w.message])
    ];
    const allowedRows = r.absoluteAllowed.map(w => ['완료·단정어 — 허용됨', w.stageKey, w.field, w.message]);

    if (!rows.length && !allowedRows.length) {
      console.log(`${r.mudId}: 경고 없음`);
      lines.push(`### ${r.mudId}\n\n경고 없음.\n`);
      return;
    }
    console.log(`${r.mudId}: 경고 ${rows.length}건 (허용됨 ${allowedRows.length}건 별도)`);
    rows.forEach(([type, stageKey, field, message]) => console.log(`  [${type}] 관문 ${stageKey} ${field}: ${message}`));
    const table = rows.length
      ? `| 종류 | 관문 | 필드 | 내용 |\n|---|---|---|---|\n${rows.map(([type, stageKey, field, message]) => `| ${type} | ${stageKey} | ${field} | ${message} |`).join('\n')}\n`
      : '경고 없음.\n';
    const allowedTable = allowedRows.length
      ? `\n<details><summary>허용됨(${allowedRows.length}건) — 라운드 5에서 사람이 읽고 게임 진행 표현·일반 서술어로 분류함, 재검토 불필요</summary>\n\n| 종류 | 관문 | 필드 | 내용 |\n|---|---|---|---|\n${allowedRows.map(([type, stageKey, field, message]) => `| ${type} | ${stageKey} | ${field} | ${message} |`).join('\n')}\n\n</details>\n`
      : '';
    lines.push(`### ${r.mudId}\n\n${table}${allowedTable}`);
  });

  const threeKingdomsGate3Leak = allResults
    .find(r => r.mudId === 'regular_three_kingdoms')
    ?.order.some(w => w.stageKey === '3');

  const report = [
    '# inquiry-task 의미 lint',
    '',
    `생성: \`scripts/14_lint_inquiry_semantics.js\` (${new Date().toISOString().slice(0, 10)})`,
    '',
    '기계가 신호로 잡을 수 있는 것만 본다. **실패가 아니라 검토 목록이다.** 문장의 뜻이 실제로 맞는지는 사람이 판단한다.',
    '',
    ...(threeKingdomsGate3Leak ? [
      '> **라운드 4 지시서와 다른 점**: 지시서(§4-1)는 "기획 세션이 방금 고친 삼국 3관문은 순서 노출 경고가 사라져야 한다"고 했지만, 아래처럼 여전히 남아 있다. `b4dca60`는 `simulator.instruction`의 "영토 확보→교류→기록 순서로"만 지웠고, `meaningQuestion.options[order-random].feedback`의 같은 패턴("영토 확보→순행→기록 사이에는 앞뒤 관계가 있습니다")은 손대지 않았다. `data/mud/regular_three_kingdoms.json`은 조작대 소유가 아니라(관문 설계실) 여기서 고치지 않고 보고만 한다.',
      ''
    ] : []),
    '## 스키마 제안 (구현하지 않음, §4-1)',
    '',
    '"날짜 없는 카드" 경고를 공정 순서/사건 순서로 나눈 판단은 지금 이 스크립트가 "카드 전부에 연도가 없는가"로 **추정**한 것이다. 데이터에 직접 표지가 있으면 추정이 필요 없다. `sequence` task에 `task.sequenceKind: "event" | "process"` 필드를 추가하면:',
    '',
    '- 관문 설계실이 편을 만들 때 의도를 명시적으로 남길 수 있다(추정이 틀릴 여지가 없어짐).',
    '- 이 스크립트는 필드가 있으면 그대로 쓰고, 없을 때만 지금의 추정 규칙으로 대체(fallback)하면 된다.',
    '- 화면 문구·판정 로직에는 영향이 없다 — 감사 스크립트 전용 메타데이터다.',
    '',
    '이번 라운드에는 구현하지 않는다. 데이터 스키마 변경은 관문 설계실·기획 세션의 승인이 먼저 필요하다.',
    '',
    ...lines
  ].join('\n');
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${report}\n`, 'utf-8');
  console.log(`\n총 경고 ${totalWarnings}건. 보고서 작성: ${path.relative(process.cwd(), REPORT_PATH)}`);

  // --- 자기 검증: 삼국 3관문(신라 한강 유역)의 순서 노출 경고 상태를 확인한다 ---
  const threeKingdoms = allResults.find(r => r.mudId === 'regular_three_kingdoms');
  const stillLeaking = threeKingdoms?.order.some(w => w.stageKey === '3');
  if (stillLeaking) {
    console.log('\n주의: regular_three_kingdoms 3관문(sequence)에 순서 노출 경고가 남아 있습니다 — 라운드 3에서 instruction만 고치고 order-random 선택지 feedback("영토 확보→순행→기록")은 그대로입니다. 별도로 보고합니다.');
  } else {
    console.log('\nPASS: regular_three_kingdoms 3관문 순서 노출 경고 없음');
  }
}

main();
