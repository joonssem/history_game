// =========================================================
// scripts/18_audit_stage_coherence.js
// Regular MUD 한 단계 안의 필드들이 같은 이야기를 하는지 살핀다
// (BACKLOG P1-STAGE-COHERENCE-A).
//
// 배경: 2026-09-28 점검에서 한 단계의 필드를 여러 작업이 나눠 고친 흔적이
// 여러 편에서 나왔다. 예를 들어 고려 사회 1단계는 이야기·선택지가 손변
// 재판인데 장소·안내·재시도 버튼은 광종 과거제였고, 조선 건국 3단계는
// 이야기가 4대문 이름인데 정답은 근정전 박석이었다. 01·04·05 같은 구조
// 검사는 이런 의미 불일치를 보지 못한다.
//
// 방법: 한국어 낱말의 두 글자 조각(바이그램)을 비교한다.
//   - 핵심 = 단계의 이야기 + 모든 선택지 + 단서(핫스팟) 이름·설명 + 용어 + 과제 질문
//   - 주변 필드(장소·배지·안내·정보·피드백·완료 문구·로드맵 라벨)와
//     재시도(N-1) 단계의 버튼·해설이 핵심과 의미 있는 조각을 하나도 나누지
//     않으면 경고한다.
//   - 이야기와 정답 선택지가 하나도 나누지 않아도 경고한다.
//   - "자료·확인·단서"처럼 어디에나 나오는 조각은 비교에서 뺀다. 뺀 뒤 남는
//     조각이 없는 필드(일반 안내 문구)는 판단하지 않는다.
//   - 마지막 종합 단계(선택지가 모두 end로 가는 단계)의 주변 필드는 "미션
//     성공" 같은 마무리 문구라서 보지 않는다.
//   - 한 편 안에서 자주 나오는 낱말("손변", "의병")은 빼지 않는다. 빼 보니
//     바로 그 낱말이 단계를 잇는 핵심이라 오탐이 늘었다.
//
// 실패가 아니라 검토 목록이다. 경고가 곧 오류는 아니며, 사람이 화면
// 문구를 보고 판단한다. 결과는 docs/audits/stage_coherence_audit.md에
// 쓴다. 같은 데이터면 같은 보고서가 나오도록 날짜를 넣지 않는다.
// =========================================================

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const MUD_DIR = path.join(ROOT, 'data', 'mud');
const INDEX_PATH = path.join(MUD_DIR, '_index.json');
const REPORT_PATH = path.join(ROOT, 'docs', 'audits', 'stage_coherence_audit.md');

// 전체 단계의 이 비율 이상에 나오는 조각은 일반 어휘로 본다.
const GLOBAL_COMMON_RATIO = 0.08;

// 어미·조사가 붙어 생기는 조각. 빈도와 무관하게 항상 뺀다.
const ALWAYS_IGNORE = new Set([
  '니다', '습니', '합니', '있습', '했습', '됩니', '세요', '하세', '보세', '으세',
  '해요', '에서', '으로', '하고', '하여', '하는', '했다', '한다', '이다', '입니',
  '까요', '을까', '볼까', '는지', '었습', '였습', '겠습', '에게', '까지', '부터',
  // 어느 단계에나 쓰는 탐구 동사·명사
  '자료', '단서', '확인', '비교', '다시', '살펴', '펴보', '모두', '하나', '선택',
  '이제', '관찰', '연결', '설명', '근거', '판단', '생각', '알려', '보여',
]);

const strip = s => String(s || '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, ' ');

// 낱말 끝의 흔한 어미·조사를 한 번 뗀다("비교한다"→"비교", "과거제를"→"과거제").
const ENDING = /(했습니다|합니다|입니다|습니다|하세요|하였다|했다|한다|하여|하고|하는|하게|세요|이다|으로|에서|에게|까지|부터|처럼|을|를|이|가|은|는|의|에|와|과|도|로|다)$/;
function stem(word) {
  const cut = word.replace(ENDING, '');
  return cut.length >= 2 ? cut : word;
}

// 같은 문장이 여러 단계에 그대로 쓰인 틀 문구는 판단하지 않는다.
const TEMPLATE_MIN_COUNT = 3;

function bigrams(text) {
  const out = new Set();
  const words = (strip(text).match(/[가-힣]{2,}/g) || []).map(stem);
  words.forEach(w => {
    for (let i = 0; i < w.length - 1; i += 1) out.add(w.slice(i, i + 2));
  });
  return out;
}

function stageCore(stage) {
  const sim = stage.simulator || {};
  const parts = [stage.narrative];
  (stage.choices || []).forEach(c => parts.push(c.text));
  (stage.glossary || []).forEach(g => parts.push(g.term, g.definition));
  (sim.hotspots || []).forEach(h => parts.push(h.label, h.feedback));
  if (sim.task) parts.push(sim.task.prompt);
  return parts.join(' ');
}

// 단계에서 비교할 주변 필드 목록: [필드 경로, 문구]
function peripheralFields(stage, roadmapLabel) {
  const sim = stage.simulator || {};
  const fields = [
    ['location', stage.location],
    ['badge', stage.badge],
    ['simulator.instruction', sim.instruction],
    ['simulator.infoText', sim.infoText],
    ['simulator.feedback', sim.feedback],
    ['simulator.completion.successText', sim.completion && sim.completion.successText],
  ];
  if (roadmapLabel) fields.push(['roadmap.label', roadmapLabel]);
  return fields.filter(([, text]) => text);
}

// 전체 단계 문구에서 일반 어휘 집합을 만든다.
function buildIgnoreSet(muds) {
  const globalCount = new Map();
  let stageTotal = 0;
  muds.forEach(({ data }) => {
    Object.values(data.stages || {}).forEach(stage => {
      stageTotal += 1;
      const texts = [stageCore(stage), ...peripheralFields(stage).map(([, t]) => t)];
      bigrams(texts.join(' ')).forEach(g => globalCount.set(g, (globalCount.get(g) || 0) + 1));
    });
  });
  const ignore = new Set(ALWAYS_IGNORE);
  globalCount.forEach((n, g) => { if (n >= stageTotal * GLOBAL_COMMON_RATIO) ignore.add(g); });
  return ignore;
}

function meaningful(text, ignore) {
  const out = new Set();
  bigrams(text).forEach(g => { if (!ignore.has(g)) out.add(g); });
  return out;
}

function overlaps(a, b) {
  for (const g of a) if (b.has(g)) return true;
  return false;
}

function auditMud(data, ignore, templates = new Set()) {
  const findings = [];
  const roadmap = new Map((data.roadmap || []).map(r => [r.id, r.label]));
  const stages = data.stages || {};

  Object.entries(stages).forEach(([key, stage]) => {
    if (key.includes('-')) return; // 재시도 단계는 본 단계와 함께 본다
    const core = meaningful(stageCore(stage), ignore);

    // 이야기 ↔ 정답 선택지
    const correct = (stage.choices || []).find(c => c.correct);
    const isFinal = (stage.choices || []).every(c => c.next === 'end');
    if (correct && !isFinal) {
      const narr = meaningful(stage.narrative, ignore);
      const ans = meaningful(correct.text, ignore);
      if (narr.size && ans.size && !overlaps(narr, ans)) {
        findings.push({ stage: key, field: 'narrative ↔ 정답', text: strip(correct.text).trim() });
      }
    }

    if (!isFinal) peripheralFields(stage, roadmap.get(key)).forEach(([field, text]) => {
      if (templates.has(strip(text).trim())) return;
      const grams = meaningful(text, ignore);
      if (grams.size && !overlaps(grams, core)) findings.push({ stage: key, field, text: strip(text).trim() });
    });

    // 같은 번호의 재시도 단계(N-1): 버튼·해설·안내가 본 단계와 이어지는가
    const retryKey = `${key}-1`;
    const retry = stages[retryKey];
    if (!retry) return;
    const retryNarr = meaningful(retry.narrative, ignore);
    const coreWithRetry = new Set([...core, ...retryNarr]);
    const retryFields = [
      ['narrative', retry.narrative, core],
      ['choices[0].text', retry.choices && retry.choices[0] && retry.choices[0].text, coreWithRetry],
      ['simulator.instruction', retry.simulator && retry.simulator.instruction, coreWithRetry],
      ['simulator.infoText', retry.simulator && retry.simulator.infoText, coreWithRetry],
    ];
    retryFields.forEach(([field, text, against]) => {
      if (!text || templates.has(strip(text).trim())) return;
      const grams = meaningful(text, ignore);
      if (grams.size && !overlaps(grams, against)) {
        findings.push({ stage: retryKey, field, text: strip(text).trim().slice(0, 120) });
      }
    });
  });
  return findings;
}

function loadRegularMuds() {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  return (index.muds || [])
    .filter(m => m.tier === 'regular')
    .map(m => ({ mudId: m.mudId, data: JSON.parse(fs.readFileSync(path.join(MUD_DIR, m.file), 'utf-8')) }));
}

// --- 자기 테스트: 실제로 있었던 두 유형을 잡고, 맞는 단계는 통과시키는지 ---
function runSelfTests() {
  const trial = {
    roadmap: [{ id: '1', label: '1. 광종의 과거제(홍패)' }],
    stages: {
      1: {
        location: '고려 개경 과거 시험장',
        character: { name: '과거 응시생' },
        narrative: '한 남매가 상속 문제로 다툽니다. 누나는 아버지의 유서를, 남동생은 검은 옷을 근거로 듭니다.',
        choices: [
          { text: '유서와 동생이 받은 물건에 담긴 아버지의 뜻부터 살핀다.', correct: true, next: '2' },
          { text: '관청이 재산을 모두 가져간다.', correct: false, next: '1-1' },
        ],
        simulator: { instruction: '고려 과거 시험과 홍패 확인', hotspots: [{ label: '남매의 주장', feedback: '누나와 남동생의 주장' }] },
      },
      '1-1': { narrative: '아들과 딸이 재산을 고르게 물려받았습니다.', choices: [{ text: '과거제를 통해 인재를 등용한다.', next: '1' }] },
    },
  };
  const f1 = auditMud(trial, ALWAYS_IGNORE);
  ['location', 'simulator.instruction', 'roadmap.label'].forEach(field => {
    assert.ok(f1.some(f => f.stage === '1' && f.field === field), `자기 테스트: 과거제 잔존 ${field}를 잡지 못했습니다.`);
  });
  assert.ok(f1.some(f => f.stage === '1-1' && f.field === 'choices[0].text'), '자기 테스트: 엉뚱한 재시도 버튼을 잡지 못했습니다.');

  const pavement = {
    stages: {
      3: {
        narrative: '정도전은 4대문 이름에 인의예지를 새겨 넣으려 합니다. 이 원리에 맞게 이름을 지어 볼까요?',
        choices: [
          { text: '표면이 거칠어 빛 반사를 막는 화강암 박석', correct: true, next: '4' },
          { text: '매끄럽게 갈아낸 대리석', correct: false, next: '3-1' },
        ],
        simulator: {},
      },
    },
  };
  const f2 = auditMud(pavement, ALWAYS_IGNORE);
  assert.ok(f2.some(f => f.field === 'narrative ↔ 정답'), '자기 테스트: 이야기와 정답의 주제 불일치를 잡지 못했습니다.');

  const coherent = {
    roadmap: [{ id: '1', label: '1. 남매의 상속 다툼' }],
    stages: {
      1: {
        location: '경상도 안찰사 관아',
        character: { name: '관아의 아전' },
        narrative: '한 남매가 상속 문제로 관아를 찾아왔습니다. 누나는 아버지의 유서를 근거로 듭니다.',
        choices: [{ text: '유서에 담긴 아버지의 뜻부터 살핀다.', correct: true, next: '2' }],
        simulator: { instruction: '남매의 주장과 아버지의 유서 살펴보기', hotspots: [] },
      },
      '1-1': { narrative: '아버지의 유서를 다시 봅니다.', choices: [{ text: '유서와 증거를 다시 살펴본다.', next: '1' }] },
    },
  };
  const f3 = auditMud(coherent, ALWAYS_IGNORE);
  assert.equal(f3.length, 0, `자기 테스트: 맞는 단계를 경고했습니다 — ${JSON.stringify(f3)}`);

  console.log('자기 테스트 통과: 과거제 잔존·재시도 버튼·이야기↔정답 불일치 검출, 정상 단계 통과.');
}

function main() {
  runSelfTests();
  const muds = loadRegularMuds();
  const ignore = buildIgnoreSet(muds);
  const textCount = new Map();
  muds.forEach(({ data }) => Object.values(data.stages || {}).forEach(stage => {
    const retryTexts = [stage.choices && stage.choices[0] && stage.choices[0].text];
    [...peripheralFields(stage).map(([, t]) => t), ...retryTexts].forEach(t => {
      if (!t) return;
      const k = strip(t).trim();
      textCount.set(k, (textCount.get(k) || 0) + 1);
    });
  }));
  const templates = new Set([...textCount].filter(([, n]) => n >= TEMPLATE_MIN_COUNT).map(([k]) => k));

  const byMud = muds.map(({ mudId, data }) => ({ mudId, findings: auditMud(data, ignore, templates) }));
  const total = byMud.reduce((n, m) => n + m.findings.length, 0);

  const lines = [
    '# 단계 일관성 경고 목록',
    '',
    '생성: `node scripts/18_audit_stage_coherence.js` (BACKLOG P1-STAGE-COHERENCE-A)',
    '',
    '한 단계 안의 주변 필드(장소·배지·안내·정보·피드백·완료 문구·로드맵 라벨)와 재시도 단계의 버튼·해설이, 그 단계의 이야기·선택지·단서와 의미 있는 낱말 조각을 하나도 나누지 않는 곳을 모았다. 이야기와 정답 선택지가 서로 다른 주제인 곳도 모았다.',
    '',
    '**실패가 아니라 검토 목록이다.** 낱말이 겹치지 않아도 뜻이 맞는 문장이 있다(예: 결과를 알리는 짧은 피드백). 화면 문구를 보고 사람이 판단한다. 판단이 끝난 항목을 허용 목록으로 만들지는 경고 수가 안정된 뒤 정한다.',
    '',
    '<!-- STAGE_COHERENCE:START -->',
    `- 대상: Regular ${muds.length}편`,
    `- 경고: ${total}건 (${byMud.filter(m => m.findings.length).length}편)`,
    '',
    '| 편 | 단계 | 필드 | 문구 |',
    '|---|---|---|---|',
  ];
  byMud.forEach(({ mudId, findings }) => {
    findings.forEach(f => lines.push(`| \`${mudId}\` | ${f.stage} | ${f.field} | ${f.text.replace(/\|/g, '\\|')} |`));
  });
  lines.push('<!-- STAGE_COHERENCE:END -->', '');
  fs.writeFileSync(REPORT_PATH, lines.join('\n'), 'utf-8');

  console.log(`단계 일관성 경고 ${total}건 → ${path.relative(ROOT, REPORT_PATH)}`);
  byMud.filter(m => m.findings.length).forEach(m => console.log(`  ${m.mudId}: ${m.findings.length}건`));
}

main();
