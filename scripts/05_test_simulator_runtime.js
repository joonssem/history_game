const assert = require('node:assert/strict');

global.window = { devicePixelRatio: 1 };
const fakeElements = new Map();
const canvas = {
  width: 200,
  height: 100,
  getBoundingClientRect() { return { left: 0, top: 0 }; },
  getContext() {
    return {
      clearRect() {}, fillText() {}, fillRect() {}, strokeRect() {},
      beginPath() {}, closePath() {}, fill() {}, stroke() {}, clip() {},
      arc() {}, ellipse() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {},
      quadraticCurveTo() {}, save() {}, restore() {}, translate() {},
      rotate() {}, setLineDash() {},
      createLinearGradient() { return { addColorStop() {} }; }
    };
  }
};

function makeElement() {
  return {
    style: {},
    innerHTML: '',
    textContent: '',
    replaceChildren() {},
    appendChild() {},
    addEventListener() {},
    setAttribute() {},
    querySelectorAll() { return []; }
  };
}

for (const id of [
  'widget-info', 'widget-gauge', 'widget-slider', 'mn-canvas-instr',
  'mn-canvas-feedback', 'mn-hotspot-actions', 'mn-choices-grid',
  'mn-interactive-card', 'mn-inquiry-panel', 'mn-choice-title'
]) {
  fakeElements.set(id, makeElement());
}

global.document = {
  addEventListener() {},
  getElementById(id) {
    if (id === 'mn-canvas') return canvas;
    return fakeElements.get(id) || null;
  }
};

require('../js/mudEngine.js');
require('../js/mudInquiry.js');
require('../js/mudSimulators.js');

const engine = window.MudEngine;
const inquiry = window.MudInquiry;
const simulators = window.MudSimulators;

function prepare(simulator) {
  engine.currentSimulator = simulator;
  engine.simMode = simulator.mode;
  engine.simulatorState = { found: [], step: 0, lastId: null };
  engine.simActionCount = 0;
  engine.simActionIds = new Set();
  engine.simulatorComplete = false;
  engine.simulatorProgress = 0;
  engine[simulator.completion.progressKey] = 0;
}

engine.simActionIds = new Set(['old-stage-action']);
engine.setupSimulator({ mode: 'text-reading', type: 'info', required: false });
assert.equal(engine.simActionIds.size, 0, 'new simulator stage must reset unique action IDs');
engine.setupSimulator(null);
assert.equal(engine.currentSimulator, null, 'stages without simulators must clear the current simulator');
assert.equal(engine.simMode, '', 'stages without simulators must clear the simulator mode');
assert.equal(fakeElements.get('mn-interactive-card').style.display, 'none', 'stages without simulators must hide the interactive card');

const fire = {
  mode: 'paleo-fire',
  interaction: 'ordered-hotspot',
  required: true,
  hotspots: [
    { id: 'grass', label: '마른 풀', feedback: '불씨 받침' },
    { id: 'branch', label: '나뭇가지', feedback: '연료' },
    { id: 'stone', label: '부싯돌', feedback: '불꽃' }
  ],
  sequence: ['grass', 'branch', 'stone'],
  completion: {
    target: 3,
    minActions: 3,
    progressKey: 'paleoFireStep',
    successText: '완료'
  }
};

prepare(fire);
assert.equal(simulators.dispatchHotspotInteraction('paleo-fire', fire.hotspots[2], engine), false);
assert.equal(engine.getSimulatorProgress(), 0, 'wrong order must not advance progress');

for (const hotspot of fire.hotspots) {
  const accepted = simulators.dispatchHotspotInteraction('paleo-fire', hotspot, engine);
  assert.equal(accepted, true);
  if (accepted) engine.registerSimulatorAction();
  engine.updateSimulatorCompletion();
}

assert.equal(engine.paleoFireStep, 3, 'declared legacy progressKey must stay synchronized');
assert.equal(engine.simulatorProgress, 3, 'canonical progress mirror must stay synchronized');
assert.equal(engine.simulatorComplete, true, 'three valid actions must unlock completion');

const discovery = {
  mode: 'paleo-environment',
  interaction: 'hotspot-discovery',
  required: true,
  hotspots: [{ id: 'river', label: '강가', feedback: '물과 먹을거리' }],
  completion: {
    target: 1,
    minActions: 1,
    progressKey: 'paleoEnvironmentFound',
    successText: '완료'
  }
};

prepare(discovery);
assert.equal(simulators.dispatchHotspotInteraction('paleo-environment', null, engine), false);
assert.equal(simulators.dispatchHotspotInteraction('paleo-environment', discovery.hotspots[0], engine), true);
engine.registerSimulatorAction();
engine.updateSimulatorCompletion();
assert.equal(engine.paleoEnvironmentFound, 1);
assert.equal(engine.simulatorComplete, true);

const legacyGauge = {
  mode: 'battle-gauge',
  required: true,
  completion: {
    target: 100,
    increment: 50,
    minActions: 2,
    progressKey: 'gaugeProgress',
    successText: '완료'
  }
};

prepare(legacyGauge);
engine.setSimulatorProgress(50);
engine.registerSimulatorAction();
engine.updateSimulatorCompletion();
assert.equal(engine.simulatorComplete, false, 'one legacy touch must not unlock choices');
engine.setSimulatorProgress(100);
engine.registerSimulatorAction();
engine.updateSimulatorCompletion();
assert.equal(engine.simulatorComplete, true, 'two legacy touches must unlock choices');

const observation = {
  mode: 'mn-map-idle',
  required: true,
  completion: {
    target: 3,
    minActions: 3,
    progressKey: 'simulatorProgress',
    successText: '완료'
  }
};

prepare(observation);
engine.recordObservation('joseon-fleet');
engine.recordObservation('joseon-fleet');
assert.equal(engine.simActionCount, 1, 'duplicate observations must not count twice');
assert.equal(engine.simulatorProgress, 1, 'duplicate observations must not advance progress');
engine.recordObservation('japanese-fleet');
engine.recordObservation('narrow-channel');
assert.equal(engine.simulatorComplete, true, 'three unique observations must unlock choices');

const currentSlider = {
  mode: 'mn-current-switch',
  required: true,
  completion: {
    target: 80,
    minActions: 1,
    progressKey: 'simulatorProgress',
    successText: '완료'
  }
};

prepare(currentSlider);
engine.updateSlider(79, true);
assert.equal(engine.simulatorComplete, false, 'slider below target must keep choices locked');
engine.updateSlider(80, true);
assert.equal(engine.simulatorProgress, 80);
assert.equal(engine.simulatorComplete, true, 'user slider input at target must unlock choices');

const uniqueActions = {
  mode: 'dolmen-step2',
  type: 'buttons',
  required: true,
  completion: {
    target: 100,
    minActions: 3,
    uniqueActions: true,
    progressKey: 'gaugeProgress',
    successText: '완료'
  }
};

prepare(uniqueActions);
engine.setSimulatorProgress(100);
engine.registerSimulatorAction();
engine.updateSimulatorCompletion();
assert.equal(engine.simulatorComplete, false, 'progress alone must not satisfy unique-action completion');
for (const [id, value] of [['slope', 35], ['roller', 70], ['labor', 100]]) {
  engine.runSimulatorAction({ type: 'slider-set', id, value });
}
assert.equal(engine.simActionIds.size, 3, 'unique action IDs must be tracked separately');
assert.equal(engine.simulatorComplete, true, 'three distinct evidence actions must unlock choices');

const flag = {
  mode: 'gwangbok-flag',
  required: true,
  completion: {
    target: 6,
    increment: 1,
    minActions: 6,
    progressKey: 'simulatorProgress',
    successText: '완료'
  }
};

prepare(flag);
engine.taegeukState = { yangColor: false, yinColor: false, geon: false, gon: false, gam: false, ri: false };
for (let i = 0; i < 6; i += 1) simulators.handleCanvasTouch(100, 50);
assert.equal(engine.simulatorProgress, 6, 'direct flag canvas input must update canonical progress');
assert.equal(engine.simulatorComplete, true, 'direct flag canvas input must unlock choices');

const vote = {
  mode: 'gwangbok-vote',
  required: true,
  completion: {
    target: 2,
    increment: 1,
    minActions: 2,
    progressKey: 'simulatorProgress',
    successText: '완료'
  }
};

prepare(vote);
engine.voteState = { stamped: false, voteInserted: false, animY: 0 };
simulators.handleCanvasTouch(100, 50);
simulators.handleCanvasTouch(100, 50);
assert.equal(engine.simulatorProgress, 2, 'direct vote canvas input must update canonical progress');
assert.equal(engine.simulatorComplete, true, 'direct vote canvas input must unlock choices');

const goryeo = require('../data/mud/regular_goryeo_culture.json');
const commitTask = goryeo.stages['1'].simulator.task;
const commitState = {
  initialChoice: 'making-only',
  viewedEvidence: ['wood-process-source', 'storage-building-source'],
  finalChoice: 'making-and-storage'
};
const commitResult = inquiry.evaluateTask(commitTask, commitState);
assert.equal(commitResult.status, 'complete', 'commit-revise must accept a supported final judgment');
assert.equal(commitResult.quality, 'historian', 'changing a judgment after evidence must be recognized');
assert.equal(
  inquiry.evaluateTask(commitTask, { ...commitState, finalChoice: 'making-only' }).status,
  'revise',
  'an incomplete explanation must not satisfy commit-revise'
);

const sequenceTask = goryeo.stages['2'].simulator.task;
assert.equal(inquiry.evaluateTask(sequenceTask, {
  order: [...sequenceTask.correctOrder],
  meaningChoice: 'reuse-for-new-text'
}).status, 'complete', 'valid historical sequence and meaning must complete together');
assert.equal(inquiry.evaluateTask(sequenceTask, {
  order: [...sequenceTask.correctOrder].reverse(),
  meaningChoice: 'reuse-for-new-text'
}).status, 'revise', 'wrong sequence must not complete through a correct meaning answer');

const mapTask = goryeo.stages['3'].simulator.task;
assert.equal(inquiry.evaluateTask(mapTask, {
  locationId: 'byeokrando-port',
  supportId: 'trade-records',
  limitId: 'port-record-scope'
}).status, 'complete', 'map place, supporting evidence, and scope limit must complete as a set');
assert.equal(inquiry.evaluateTask(mapTask, {
  locationId: 'byeokrando-port',
  supportId: 'printing-record',
  limitId: 'port-record-scope'
}).status, 'revise', 'unrelated evidence must keep map-evidence incomplete');

const runEvidence = ['1', '2', '3'].flatMap(stageId => goryeo.stages[stageId].simulator.task.awards || []);
const claimTask = goryeo.stages['4'].simulator.task;
assert.equal(inquiry.evaluateTask(claimTask, {
  claimId: 'technology-and-exchange',
  selectedEvidence: ['tripitaka-making', 'byeokrando-network'],
  limitId: 'one-source-limit'
}, runEvidence).quality, 'historian', 'claim-evidence must reward cross-category evidence and a valid limit');
assert.equal(inquiry.evaluateTask(claimTask, {
  claimId: 'technology-needs-sources',
  selectedEvidence: ['tripitaka-making', 'byeokrando-network'],
  limitId: null
}, runEvidence).status, 'revise', 'evidence outside the selected claim must be rejected');

const inquirySimulator = goryeo.stages['1'].simulator;
prepare(inquirySimulator);
engine.inquiryRunState = { evidence: [], stageResults: {} };
engine.setSimulatorProgress(1);
engine.registerSimulatorAction();
engine.updateSimulatorCompletion();
assert.equal(engine.simulatorComplete, false, 'validated-state must ignore counters without evaluator approval');
assert.equal(engine.acceptInquiryResult({
  ...commitResult,
  attempts: 1,
  revised: true,
  firstChoice: 'making-only',
  hintsUsed: 1,
  misconceptionFlags: ['commit-making-only', 'commit-making-only'],
  earnedEvidence: commitTask.awards
}), true, 'accepted inquiry result must unlock the existing progression gate');
assert.equal(engine.inquiryRunState.evidence.length, 2, 'accepted inquiry must add its evidence once');
assert.deepEqual(engine.inquiryRunState.stageResults['1'], {
  attempts: 1,
  revised: true,
  quality: 'historian',
  firstChoice: 'making-only',
  hintsUsed: 1,
  misconceptionFlags: ['commit-making-only']
}, 'inquiry diagnostics must remain deduplicated in MUD-run memory');
assert.equal(engine.acceptInquiryResult({ earnedEvidence: commitTask.awards }), false, 'completed inquiry cannot be accepted twice');
assert.equal(engine.inquiryRunState.evidence.length, 2, 'duplicate completion must not duplicate evidence');

// --- D-030 회귀: requiredCategories(문자열/배열 any-of), requiredEvidenceIds, requireLimit ---
// red team이 실측으로 재현한 사례를 그대로 테스트로 박는다. 막혀야 하는 조합과
// 통과해야 하는 조합을 함께 넣는다 — 막기만 하는 테스트는 과잉 차단을 못 잡는다.

assert.equal(inquiry.evaluateTask(claimTask, {
  claimId: 'technology-and-exchange',
  selectedEvidence: ['tripitaka-storage', 'byeokrando-network'],
  limitId: null
}, runEvidence).status, 'revise', 'D-027/D-030 회귀: 보관+교류 근거만으로는 제작·인쇄를 말하는 주장이 통과하면 안 된다');

const neolithic = require('../data/mud/regular_neolithic.json');
const neolithicClaimTask = neolithic.stages['4'].simulator.task;
const neolithicEvidence = ['1', '2', '3'].flatMap(id => neolithic.stages[id].simulator.task.awards || []);
assert.equal(inquiry.evaluateTask(neolithicClaimTask, {
  claimId: 'environment-and-technology',
  selectedEvidence: ['settlement-environment', 'pottery-technology'],
  limitId: null
}, neolithicEvidence).status, 'revise', 'D-030 회귀: 의생활(직조) 근거가 빠지면 환경+기술 주장이 통과하면 안 된다');
assert.equal(inquiry.evaluateTask(neolithicClaimTask, {
  claimId: 'environment-and-technology',
  selectedEvidence: ['settlement-environment', 'pottery-technology', 'weaving-technology'],
  limitId: null
}, neolithicEvidence).status, 'complete', 'D-030: 환경·토기·직조 세 요소를 모두 갖추면 통과해야 한다');

const threeKingdoms = require('../data/mud/regular_three_kingdoms.json');
const threeKingdomsClaimTask = threeKingdoms.stages['4'].simulator.task;
const threeKingdomsEvidence = ['1', '2', '3'].flatMap(id => threeKingdoms.stages[id].simulator.task.awards || []);
assert.equal(inquiry.evaluateTask(threeKingdomsClaimTask, {
  claimId: 'han-river-changed-hands',
  selectedEvidence: ['baekje-han-river-network', 'goguryeo-pyeongyang-policy'],
  limitId: null
}, threeKingdomsEvidence).status, 'revise', 'D-030 회귀: 신라 근거가 빠지면 세 나라 주인 교체 주장이 통과하면 안 된다');
assert.equal(inquiry.evaluateTask(threeKingdomsClaimTask, {
  claimId: 'han-river-changed-hands',
  selectedEvidence: ['baekje-han-river-network', 'goguryeo-pyeongyang-policy', 'silla-bukhansan-record'],
  limitId: null
}, threeKingdomsEvidence).status, 'complete', 'D-030: 백제·고구려·신라 근거를 모두 넣으면 통과해야 한다');

const modernOpen = require('../data/mud/regular_modern_open.json');
const modernOpenClaimTask = modernOpen.stages['4'].simulator.task;
const modernOpenEvidence = ['1', '2', '3'].flatMap(id => modernOpen.stages[id].simulator.task.awards || []);
const modernOpenLimitCorrect = (modernOpenClaimTask.limits || []).find(l => l.correct);
assert.equal(inquiry.evaluateTask(modernOpenClaimTask, {
  claimId: 'connect-treaty-institution-city',
  selectedEvidence: ['modern-institution-access', 'tram-urban-change'],
  limitId: modernOpenLimitCorrect.id
}, modernOpenEvidence).status, 'revise', 'D-030 회귀: 조약 근거가 0장이면 조약+근대 변화 주장이 통과하면 안 된다');
assert.equal(inquiry.evaluateTask(modernOpenClaimTask, {
  claimId: 'connect-treaty-institution-city',
  selectedEvidence: ['treaty-unequal-clauses', 'modern-institution-access'],
  limitId: null
}, modernOpenEvidence).status, 'incomplete', 'D-030: requireLimit인 편은 한계를 고르지 않으면 완료되면 안 된다');
assert.equal(inquiry.evaluateTask(modernOpenClaimTask, {
  claimId: 'connect-treaty-institution-city',
  selectedEvidence: ['treaty-unequal-clauses', 'modern-institution-access'],
  limitId: modernOpenLimitCorrect.id
}, modernOpenEvidence).status, 'complete', 'D-030: 조약+시설 근거와 올바른 한계를 모두 갖추면 통과해야 한다');

// --- R3-02 과잉 차단 회귀 (2026-09-15 Codex red team) ---
// 막혀야 하는 조합만 검사하면, 정상 조합을 잘못 막는 변경을 놓친다. 모든 주장의 정상 조합,
// any-of의 대체 가지, 선택 사항 한계의 정답·오답·미선택 경로를 함께 검사한다.
const expectComplete = (task, state, evidence, message) => {
  const result = inquiry.evaluateTask(task, state, evidence);
  assert.equal(result.status, 'complete', `${message} (실제: ${result.status} ${result.issue || ''})`);
  return result;
};
const goryeoLimitCorrect = claimTask.limits.find(l => l.correct).id;
const goryeoLimitWrong = claimTask.limits.find(l => !l.correct).id;
expectComplete(claimTask, { claimId: 'technology-and-exchange', selectedEvidence: ['tripitaka-making', 'byeokrando-network'], limitId: null }, runEvidence,
  '고려 주장1: 제작+교류 정상 조합');
expectComplete(claimTask, { claimId: 'technology-and-exchange', selectedEvidence: ['jikji-process', 'byeokrando-network'], limitId: null }, runEvidence,
  '고려 주장1: any-of 대체 가지(인쇄+교류) 정상 조합');
expectComplete(claimTask, { claimId: 'technology-needs-sources', selectedEvidence: ['tripitaka-making', 'tripitaka-storage', 'jikji-process'], limitId: null }, runEvidence,
  '고려 주장2: 제작·보관·인쇄 정상 조합');
assert.equal(expectComplete(claimTask, { claimId: 'technology-and-exchange', selectedEvidence: ['tripitaka-making', 'byeokrando-network'], limitId: goryeoLimitCorrect }, runEvidence,
  '고려 선택 한계: 정답 한계 경로').quality, 'historian', '선택 한계의 정답을 고르면 역사가 등급이어야 한다');
assert.equal(inquiry.evaluateTask(claimTask, { claimId: 'technology-and-exchange', selectedEvidence: ['tripitaka-making', 'byeokrando-network'], limitId: goryeoLimitWrong }, runEvidence).status,
  'revise', '선택 한계라도 오답 한계를 고르면 수정이 필요해야 한다');

const neolithicLimitCorrect = neolithicClaimTask.limits.find(l => l.correct).id;
expectComplete(neolithicClaimTask, { claimId: 'technology-shows-adaptation', selectedEvidence: ['pottery-technology', 'weaving-technology'], limitId: null }, neolithicEvidence,
  '신석기 주장2: 토기+의생활 정상 조합');
expectComplete(neolithicClaimTask, { claimId: 'environment-and-technology', selectedEvidence: ['settlement-environment', 'pottery-technology', 'weaving-technology'], limitId: neolithicLimitCorrect }, neolithicEvidence,
  '신석기 선택 한계: 정답 한계 경로');

const threeKingdomsLimitCorrect = threeKingdomsClaimTask.limits.find(l => l.correct).id;
expectComplete(threeKingdomsClaimTask, { claimId: 'goguryeo-to-silla-handover', selectedEvidence: ['goguryeo-pyeongyang-policy', 'silla-bukhansan-record'], limitId: null }, threeKingdomsEvidence,
  '삼국 주장2: 고구려+신라 정상 조합');
expectComplete(threeKingdomsClaimTask, { claimId: 'han-river-changed-hands', selectedEvidence: ['baekje-han-river-network', 'goguryeo-pyeongyang-policy', 'silla-bukhansan-record'], limitId: threeKingdomsLimitCorrect }, threeKingdomsEvidence,
  '삼국 선택 한계: 정답 한계 경로');

expectComplete(modernOpenClaimTask, { claimId: 'connect-treaty-institution-city', selectedEvidence: ['treaty-unequal-clauses', 'tram-urban-change'], limitId: modernOpenLimitCorrect.id }, modernOpenEvidence,
  '근대 주장1: any-of 대체 가지(조약+도시) 정상 조합');
expectComplete(modernOpenClaimTask, { claimId: 'institution-and-city-show-change', selectedEvidence: ['modern-institution-access', 'tram-urban-change'], limitId: modernOpenLimitCorrect.id }, modernOpenEvidence,
  '근대 주장2: 시설+도시 정상 조합');

// --- R3-03 첫 판단 보존 ---
const firstChoiceTask = commitTask;
const firstChoiceEvidence = (firstChoiceTask.requiredEvidenceIds || firstChoiceTask.evidence.map(e => e.id));
const firstChoiceCorrect = firstChoiceTask.options.find(o => o.correct).id;
const firstChoiceWrong = firstChoiceTask.options.find(o => !o.correct).id;
inquiry.task = firstChoiceTask;
inquiry.state = inquiry.createInitialState(firstChoiceTask);
inquiry.selectInitialChoice(firstChoiceWrong);
inquiry.selectInitialChoice(firstChoiceCorrect);
assert.equal(inquiry.state.firstInitialChoice, firstChoiceWrong, '첫 판단을 바꿔도 처음 고른 값은 보존되어야 한다');
assert.equal(inquiry.state.initialChoice, firstChoiceCorrect, '현재 선택은 마지막 선택을 따라야 한다');
assert.equal(inquiry.evaluateCommitRevise(firstChoiceTask, {
  ...inquiry.state, finalChoice: firstChoiceCorrect, viewedEvidence: firstChoiceEvidence
}).quality, 'historian', '처음 오답에서 정답으로 고친 경로는 수정한 것으로 판정해야 한다');
assert.equal(inquiry.evaluateCommitRevise(firstChoiceTask, {
  initialChoice: firstChoiceCorrect, firstInitialChoice: firstChoiceCorrect, finalChoice: firstChoiceCorrect, viewedEvidence: firstChoiceEvidence
}).quality, 'connector', '처음부터 정답을 유지한 경로는 수정하지 않은 것으로 판정해야 한다');
assert.equal(inquiry.evaluateCommitRevise(firstChoiceTask, {
  initialChoice: firstChoiceWrong, finalChoice: firstChoiceCorrect, viewedEvidence: firstChoiceEvidence
}).quality, 'historian', 'firstInitialChoice가 없는 옛 상태도 기존 방식으로 판정해야 한다');

console.log('PASS: simulator runtime, legacy progress adapters, and inquiry validated-state contract');
console.log('PASS: D-030 requiredCategories/requiredEvidenceIds/requireLimit regressions (goryeo/neolithic/three_kingdoms/modern_open)');
console.log('PASS: R3-02 over-blocking regressions (all claims, any-of branches, optional limits) and R3-03 first-judgement preservation');
