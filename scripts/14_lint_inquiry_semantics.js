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
function checkSequenceDatelessCards(mudId, stageKey, task) {
  const warnings = [];
  (task.cards || []).forEach(card => {
    const text = `${card.label || ''} ${card.detail || ''}`;
    if (!YEAR_PATTERN.test(text)) {
      warnings.push({
        mudId, stageKey, field: `cards[${card.id}]`,
        message: '연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요.'
      });
    }
  });
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
function checkAbsoluteWording(mudId, stageKey, node, pathPrefix, warnings) {
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (typeof value === 'string' && ['feedback', 'detail', 'successText'].includes(key)) {
      ABSOLUTE_WORDS.forEach(word => {
        if (value.includes(word)) {
          warnings.push({ field: currentPath, message: `필연·완결 표현 "${word}"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요.` });
        }
      });
    } else if (value && typeof value === 'object') {
      checkAbsoluteWording(mudId, stageKey, value, currentPath, warnings);
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

  const findings = { order: [], dateless: [], mapLeak: [], absolute: [], sourceGap: [] };

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
    const absoluteWarnings = [];
    checkAbsoluteWording(mudId, key, simulator, `stages.${key}.simulator`, absoluteWarnings);
    findings.absolute.push(...absoluteWarnings.map(w => ({ mudId, stageKey: key, ...w })));
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
      ...r.dateless.map(w => ['날짜 없는 카드', w.stageKey, w.field, w.message]),
      ...r.mapLeak.map(w => ['정답 장소 노출', w.stageKey, w.field, w.message]),
      ...r.absolute.map(w => ['완료·단정어', w.stageKey, w.field, w.message]),
      ...r.sourceGap.map(w => ['출처 공백', '-', '-', w.message])
    ];
    if (!rows.length) {
      console.log(`${r.mudId}: 경고 없음`);
      lines.push(`### ${r.mudId}\n\n경고 없음.\n`);
      return;
    }
    console.log(`${r.mudId}: 경고 ${rows.length}건`);
    rows.forEach(([type, stageKey, field, message]) => console.log(`  [${type}] 관문 ${stageKey} ${field}: ${message}`));
    lines.push(`### ${r.mudId}\n\n| 종류 | 관문 | 필드 | 내용 |\n|---|---|---|---|\n${rows.map(([type, stageKey, field, message]) => `| ${type} | ${stageKey} | ${field} | ${message} |`).join('\n')}\n`);
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
