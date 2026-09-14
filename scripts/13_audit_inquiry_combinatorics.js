// =========================================================
// scripts/13_audit_inquiry_combinatorics.js
// inquiry-task를 쓰는 모든 편에서 관문마다 "제출 가능한 상태"를 전수
// 열거해 MudInquiry의 실제 판정 함수(evaluateTask)에 넣고 통과 비율을
// 낸다. red team이 손으로 계산한 값(RT-04)을 반복 가능한 도구로 만든
// 것이다. 문장의 뜻과 근거가 맞는지는 이 스크립트가 보지 않는다 —
// "조건이 구조적으로 성립하는가"만 본다(D-030 §0-2 5).
// =========================================================

const fs = require('node:fs');
const path = require('node:path');

// --- mudInquiry.js를 DOM 없이 불러오기 위한 최소 스텁 (05_test_simulator_runtime.js와 동일 패턴) ---
global.window = { devicePixelRatio: 1 };
function makeElement() {
  return {
    style: {}, innerHTML: '', textContent: '',
    replaceChildren() {}, appendChild() {}, addEventListener() {},
    setAttribute() {}, querySelectorAll() { return []; }
  };
}
const fakeElements = new Map();
for (const id of [
  'widget-info', 'widget-gauge', 'widget-slider', 'mn-canvas-instr',
  'mn-canvas-feedback', 'mn-hotspot-actions', 'mn-choices-grid',
  'mn-interactive-card', 'mn-inquiry-panel', 'mn-choice-title'
]) fakeElements.set(id, makeElement());
global.document = {
  addEventListener() {},
  getElementById(id) { return fakeElements.get(id) || null; }
};

require('../js/mudEngine.js');
require('../js/mudInquiry.js');
require('../js/mudSimulators.js');
const inquiry = window.MudInquiry;

// --- 조합 유틸 ---
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  arr.forEach((item, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([item, ...p]);
  });
  return out;
}

function combinations(arr, size) {
  if (size === 0) return [[]];
  if (arr.length < size) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, size - 1).map(c => [first, ...c]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

function subsetsInRange(arr, min, max) {
  const out = [];
  for (let size = min; size <= max; size += 1) out.push(...combinations(arr, size));
  return out;
}

// --- 관문 유형별 "제출 가능한 상태" 전수 열거 ---
// 각 함수는 { states: [state, ...] }를 돌려준다. runEvidence는 claim-evidence 전용이다.
function enumerateCommitRevise(task) {
  const options = (task.options || []).map(o => o.id);
  const required = task.requiredEvidenceIds || (task.evidence || []).map(e => e.id);
  const states = [];
  for (const initialChoice of options) {
    for (const finalChoice of options) {
      states.push({ initialChoice, finalChoice, viewedEvidence: [...required] });
    }
  }
  return states;
}

function enumerateSequence(task) {
  const cardIds = (task.cards || []).map(c => c.id);
  const meaningOptions = (task.meaningQuestion?.options || []).map(o => o.id);
  const states = [];
  for (const order of permutations(cardIds)) {
    for (const meaningChoice of meaningOptions) {
      states.push({ order, meaningChoice });
    }
  }
  return states;
}

function enumerateMapEvidence(task) {
  const locations = (task.locations || []).map(l => l.id);
  const supports = (task.supports || []).map(s => s.id);
  const limits = (task.limits || []).map(l => l.id);
  const states = [];
  for (const locationId of locations) {
    for (const supportId of supports) {
      for (const limitId of limits) {
        states.push({ locationId, supportId, limitId });
      }
    }
  }
  return states;
}

// claim-evidence: 평가 함수가 실제로 읽는 근거 후보 풀은 화면에 뜨는 task.allowedEvidenceIds다
// (claim.accepts는 그 풀 중 이 주장과 연결되는 것만 판정에서 걸러내는 내부 기준일 뿐,
// 학생이 "고를 수 있는" 후보 자체는 주장을 바꿔도 같다). limitId는 requireLimit일 때만
// 필수 차원으로 늘어놓는다 — 그렇지 않으면 "선택 사항"이라 미선택(null) 한 값으로 고정한다.
function enumerateClaimEvidence(task) {
  const claims = (task.claims || []).map(c => c.id);
  const pool = task.allowedEvidenceIds || [];
  const minEvidence = Number(task.minEvidence || 2);
  const maxEvidence = Number(task.maxEvidence || 3);
  const evidenceSubsets = subsetsInRange(pool, minEvidence, maxEvidence);
  const limitIds = task.requireLimit === true
    ? (task.limits || []).map(l => l.id)
    : [null];
  const states = [];
  for (const claimId of claims) {
    for (const selectedEvidence of evidenceSubsets) {
      for (const limitId of limitIds) {
        states.push({ claimId, selectedEvidence: [...selectedEvidence], limitId });
      }
    }
  }
  return states;
}

const ENUMERATORS = {
  'commit-revise': enumerateCommitRevise,
  sequence: enumerateSequence,
  'map-evidence': enumerateMapEvidence,
  'claim-evidence': enumerateClaimEvidence
};

// D-027/D-030 정신의 연장: 주장이 근거 풀 안에서 서로 다른 범주에 걸쳐 있는데도
// requiredCategories·requiredEvidenceIds가 둘 다 없으면, minCategories만으로는
// "그 요소가 실제로 있는가"를 보장하지 못할 수 있다 — 검토 대상으로만 표시한다.
function checkCategoryGuardrail(task) {
  const pool = task.allowedEvidenceIds || [];
  const categoryById = new Map();
  (task.awardsCategoryHint || []).forEach(a => categoryById.set(a.id, a.category));
  const warnings = [];
  (task.claims || []).forEach(claim => {
    const accepted = pool.filter(id => (claim.accepts || []).includes(id));
    const categories = new Set(accepted.map(id => categoryById.get(id)).filter(Boolean));
    const hasGuard = (claim.requiredCategories && claim.requiredCategories.length)
      || (claim.requiredEvidenceIds && claim.requiredEvidenceIds.length);
    if (categories.size > 1 && !hasGuard) {
      warnings.push(`claim "${claim.id}"은(는) ${categories.size}개 범주(${[...categories].join(', ')})에 걸친 근거를 받는데 requiredCategories·requiredEvidenceIds가 모두 없습니다.`);
    }
  });
  return warnings;
}

function findInquiryStages(mudData) {
  const stageKeys = Object.keys(mudData.stages || {});
  return stageKeys
    .map(key => ({ key, stage: mudData.stages[key] }))
    .filter(({ stage }) => stage?.simulator?.interaction === 'inquiry-task' && stage?.simulator?.required !== false)
    .map(({ key, stage }) => ({ key, task: stage.simulator.task }));
}

function auditMud(mudId, mudData) {
  const inquiryStages = findInquiryStages(mudData);
  if (!inquiryStages.length) return null;

  // 마지막 관문의 claim-evidence가 이전 관문들의 awards를 실제로 누적해서 받는 것과
  // 같은 조건을 만들기 위해, 앞선 관문들의 awards를 순서대로 모아 둔다.
  const accumulatedAwards = [];
  const gates = [];
  inquiryStages.forEach(({ key, task }, index) => {
    const enumerator = ENUMERATORS[task.type];
    if (!enumerator) {
      gates.push({ key, type: task.type, n: null, pass: null, note: '알 수 없는 task.type — 열거기 없음' });
      return;
    }
    // claim-evidence 판정은 카테고리 조회를 위해 awards의 {id, category}가 필요하다.
    if (task.type === 'claim-evidence') task.awardsCategoryHint = accumulatedAwards;
    const states = enumerator(task);
    let passCount = 0;
    for (const state of states) {
      const result = inquiry.evaluateTask(task, state, accumulatedAwards);
      if (result.status === 'complete') passCount += 1;
    }
    const warnings = task.type === 'claim-evidence' ? checkCategoryGuardrail(task) : [];
    if (states.length > 0 && passCount / states.length > 0.5) {
      warnings.push(`통과 밀도 ${(passCount / states.length * 100).toFixed(1)}%가 기준치(50%)를 넘습니다.`);
    }
    gates.push({ key, type: task.type, n: states.length, pass: passCount, warnings });
    if (Array.isArray(task.awards)) accumulatedAwards.push(...task.awards);
  });

  return { mudId, gates };
}

function main() {
  const mudDir = path.join(__dirname, '..', 'data', 'mud');
  const files = fs.readdirSync(mudDir).filter(f => f.endsWith('.json')).sort();
  const results = [];
  for (const file of files) {
    const mudId = file.replace(/\.json$/, '');
    const mudData = JSON.parse(fs.readFileSync(path.join(mudDir, file), 'utf-8'));
    const audited = auditMud(mudId, mudData);
    if (audited) results.push(audited);
  }

  // --- 콘솔 표 ---
  console.log('inquiry-task 관문별 통과 조합 밀도 (전수 열거)\n');
  const lines = ['| 편 | 관문 | 문법 | N | 통과 | 밀도 | 경고 |', '|---|---|---|---|---|---|---|'];
  for (const { mudId, gates } of results) {
    gates.forEach((gate, i) => {
      const density = gate.n ? `${(gate.pass / gate.n * 100).toFixed(1)}%` : '—';
      const warn = (gate.warnings || []).join(' ') || (gate.note || '');
      const row = `| ${i === 0 ? mudId : ''} | ${gate.key} | ${gate.type} | ${gate.n ?? '—'} | ${gate.pass ?? '—'} | ${density} | ${warn} |`;
      lines.push(row);
      console.log(`${mudId} 관문 ${gate.key} (${gate.type}): ${gate.pass}/${gate.n} 통과${warn ? ` — ${warn}` : ''}`);
    });
  }

  // --- 문서 출력 ---
  const reportPath = path.join(__dirname, '..', 'docs', 'audits', 'inquiry_combinatorics_audit.md');
  const report = [
    '# inquiry-task 관문별 통과 조합 밀도 감사',
    '',
    `생성: \`scripts/13_audit_inquiry_combinatorics.js\` (${new Date().toISOString().slice(0, 10)})`,
    '',
    '자동 검증(§8)이 아니라 **의미 검증을 위한 데이터**다. "조건이 구조적으로 성립하는가"만 본다 — 문장의 뜻과 근거가 실제로 맞는지는 `docs/audits/inquiry_pilot_semantic_review.md`에서 사람이 판단한다.',
    '',
    ...lines,
    '',
    '## 경고 규칙',
    '',
    '- 마지막 관문(claim-evidence) 통과 밀도가 50%를 넘으면 표시한다.',
    '- claim-evidence의 각 주장이 서로 다른 범주에 걸친 근거를 받는데 `requiredCategories`·`requiredEvidenceIds`가 둘 다 없으면 표시한다.',
    '- 경고는 실패가 아니라 검토 대상 목록이다.'
  ].join('\n');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${report}\n`, 'utf-8');
  console.log(`\n보고서 작성: ${path.relative(process.cwd(), reportPath)}`);

  // --- 자기 검증: 2026-09-14 D-030 수정 후 파일럿 4편 마지막 관문의 기대 수치 ---
  const expected = {
    regular_goryeo_culture: [11, 40],
    regular_neolithic: [2, 8],
    regular_three_kingdoms: [2, 8],
    regular_modern_open: [4, 24]
  };
  let ok = true;
  for (const [mudId, [expectPass, expectN]] of Object.entries(expected)) {
    const audited = results.find(r => r.mudId === mudId);
    if (!audited) { console.error(`FAIL: ${mudId}를 찾지 못했습니다.`); ok = false; continue; }
    const lastGate = audited.gates[audited.gates.length - 1];
    if (lastGate.n !== expectN || lastGate.pass !== expectPass) {
      console.error(`FAIL: ${mudId} 마지막 관문 기대값 ${expectPass}/${expectN}, 실제 ${lastGate.pass}/${lastGate.n}`);
      ok = false;
    }
  }
  if (!ok) {
    console.error('\nFAIL: inquiry-task 조합 감사 자기 검증 불일치');
    process.exit(1);
  }
  console.log('\nPASS: inquiry-task 조합 감사 자기 검증(고려 11/40, 신석기 2/8, 삼국 2/8, 근대 4/24) 일치');
}

main();
