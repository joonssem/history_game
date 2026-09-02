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
  'mn-interactive-card'
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
require('../js/mudSimulators.js');

const engine = window.MudEngine;
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

console.log('PASS: simulator runtime state, valid-action counting, and legacy progress adapters');
