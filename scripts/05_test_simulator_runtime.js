const assert = require('node:assert/strict');

global.window = {};
global.document = {
  addEventListener() {},
  getElementById() { return null; }
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
  engine.simulatorComplete = false;
  engine.simulatorProgress = 0;
  engine[simulator.completion.progressKey] = 0;
}

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

console.log('PASS: simulator runtime state, valid-action counting, and legacy progress adapters');
