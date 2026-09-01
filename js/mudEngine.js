// =========================================================
// js/mudEngine.js - 범용 MUD 엔진 (JSON 데이터 기반 로더 및 렌더러)
// =========================================================

const MudEngine = {
  // === 상태 변수 ===
  currentMudData: null,       // 현재 로드된 MUD JSON 데이터 전체
  currentStage: "1",          // 현재 스테이지 ID
  visited: new Set(),         // 방문한 스테이지 집합
  themeColor: '#8A3B29',      // 현재 MUD 테마 색상
  simMode: '',                // 현재 시뮬레이터 모드
  currentSimulator: null,     // 현재 스테이지 시뮬레이터 계약
  simActionCount: 0,          // 현재 활동에서 수행한 행동 수
  simulatorComplete: true,    // 필수 활동 완료 여부
  simulatorProgress: 0,
  simulatorState: { found: [], step: 0, lastId: null },
  simulatorProgressKeys: [
    'simulatorProgress', 'gaugeProgress', 'paleoEnvironmentFound',
    'paleoFireStep', 'paleoStoneFacets', 'paleoHuntFound',
    'paleoCommunityFound', 'paleoReflectionFound'
  ],

  // === 시뮬레이터 전용 상태 변수 ===
  gaugeProgress: 0,
  stoneHits: 0,
  paleoEnvironmentFound: 0,
  paleoEnvironmentState: { found: [], lastId: null },
  paleoFireStep: 0,
  paleoFireState: { found: [], step: 0, lastId: null },
  paleoStoneFacets: 0,
  paleoStoneState: { found: [], lastId: null },
  paleoHuntFound: 0,
  paleoHuntState: { found: [], lastId: null },
  paleoCommunityFound: 0,
  paleoCommunityState: { found: [], lastId: null },
  paleoReflectionFound: 0,
  paleoReflectionState: { found: [], lastId: null },
  enemyShips: [],
  bullets: [],
  playerShip: { x: 50, y: 105, size: 24 },
  targetCurrent: 20,
  taegeukState: { yangColor: false, yinColor: false, geon: false, gon: false, gam: false, ri: false },
  dolmenState: { stage: 1, baseSet: false, earthProgress: 0, stoneProgress: 0, earthRemoved: false, workers: 50 },
  voteState: { stamped: false, voteInserted: false, animY: 0 },
  animFrameId: null,

  // === MUD 초기화 및 실행 진입점 ===
  async openMUD(mudId) {
    try {
      const res = await fetch(`data/mud/${mudId}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      this.currentMudData = await res.json();
    } catch (e) {
      console.error(`Failed to load MUD data for ${mudId}:`, e);
      alert(`MUD 데이터를 불러오는 데 실패했습니다: ${mudId}`);
      return;
    }

    // 상태 초기화
    this.visited = new Set();
    this.currentStage = "1";
    this.resetSimulatorStates();

    // 테마 적용
    this.setTheme(this.currentMudData.themeColor);

    // 뷰 전환
    document.getElementById('view-portal').style.display = 'none';
    document.getElementById('view-myeongnyang').style.display = 'block';

    // 헤더 텍스트 설정
    document.getElementById('mn-header-tag').textContent = this.currentMudData.header.tag;
    document.getElementById('mn-header-title').textContent = this.currentMudData.header.title;
    document.getElementById('interactive-title').innerHTML = this.currentMudData.header.interactiveTitle;
    document.getElementById('roadmap-title').innerHTML = this.currentMudData.header.roadmapTitle;

    // 로드맵 연대기 렌더링
    this.renderRoadmap(this.currentMudData.roadmap);

    // 전역 스토리 ID 설정 (도감 및 회고록 연동)
    window.currentActiveStoryId = this.currentMudData.storyId;

    // 캔버스 크기 조정 및 첫 스테이지 시작
    this.resizeCanvas();
    this.renderStage("1");
    this.startAnimLoop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // === 시뮬레이터 상태 초기화 ===
  resetSimulatorStates() {
    this.gaugeProgress = 0;
    this.stoneHits = 0;
    this.paleoEnvironmentFound = 0;
    this.paleoEnvironmentState = { found: [], lastId: null };
    this.paleoFireStep = 0;
    this.paleoFireState = { found: [], step: 0, lastId: null };
    this.paleoStoneFacets = 0;
    this.paleoStoneState = { found: [], lastId: null };
    this.paleoHuntFound = 0;
    this.paleoHuntState = { found: [], lastId: null };
    this.paleoCommunityFound = 0;
    this.paleoCommunityState = { found: [], lastId: null };
    this.paleoReflectionFound = 0;
    this.paleoReflectionState = { found: [], lastId: null };
    this.enemyShips = [];
    this.bullets = [];
    this.playerShip = { x: 50, y: 105, size: 24 };
    this.targetCurrent = 20;
    this.taegeukState = { yangColor: false, yinColor: false, geon: false, gon: false, gam: false, ri: false };
    this.dolmenState = { stage: 1, baseSet: false, earthProgress: 0, stoneProgress: 0, earthRemoved: false, workers: 50 };
    this.voteState = { stamped: false, voteInserted: false, animY: 0 };
    this.currentSimulator = null;
    this.simActionCount = 0;
    this.simActionIds = new Set();
    this.simulatorComplete = true;
    this.simulatorProgress = 0;
    this.simulatorState = { found: [], step: 0, lastId: null };
  },

  // === 테마 색상 적용 ===
  setTheme(primaryHex) {
    this.themeColor = primaryHex;
    document.documentElement.style.setProperty('--current-mud-color', primaryHex);

    const headerTag = document.getElementById('mn-header-tag');
    if (headerTag) headerTag.style.backgroundColor = primaryHex;

    const stageBadge = document.getElementById('mn-stage-badge');
    if (stageBadge) stageBadge.style.backgroundColor = primaryHex;

    const fb = document.getElementById('mn-canvas-feedback');
    if (fb) {
      fb.style.backgroundColor = primaryHex;
      const hex = primaryHex.replace('#', '');
      const rgb = hex.length === 6
        ? [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        : [0.17, 0.15, 0.14];
      const linear = value => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      const luminance = 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
      const contrast = (foreground) => {
        const fg = foreground === '#FFFFFF' ? 1 : 0.019;
        const lighter = Math.max(luminance, fg);
        const darker = Math.min(luminance, fg);
        return (lighter + 0.05) / (darker + 0.05);
      };
      fb.style.color = contrast('#FFFFFF') >= contrast('#2C2724') ? '#FFFFFF' : '#2C2724';
    }

    const gb = document.getElementById('gauge-bar');
    if (gb) gb.style.backgroundColor = primaryHex;

    const titleEl = document.getElementById('mn-header-title');
    if (titleEl) titleEl.style.borderLeft = `5px solid ${primaryHex}`;
  },

  // === 로드맵 노드 생성 ===
  renderRoadmap(nodes) {
    const grid = document.getElementById('roadmap-grid');
    if (!grid) return;
    let html = '';
    nodes.forEach(n => {
      html += `<div id="mn-node-${n.id}" style="padding: 6px; border-radius: 6px; background: var(--card-sub); font-size: 0.8rem; border: 1px solid var(--border-color);">${n.label}</div>`;
    });
    grid.innerHTML = html;
  },

  // === 로드맵 실시간 하이라이트 갱신 ===
  updateRoadmap() {
    const currentEl = document.getElementById(`mn-node-${this.currentStage}`);
    if (currentEl) {
      currentEl.style.border = `2px solid ${this.themeColor}`;
      currentEl.style.backgroundColor = `${this.themeColor}22`;
      currentEl.style.color = this.themeColor;
      currentEl.style.fontWeight = '700';
    }

    this.visited.forEach(id => {
      const visitedEl = document.getElementById(`mn-node-${id}`);
      if (visitedEl && id !== this.currentStage) {
        visitedEl.style.border = '1px solid var(--border-color)';
        visitedEl.style.backgroundColor = '#FFFFFF';
        visitedEl.style.color = 'var(--text-main)';
        visitedEl.style.fontWeight = '400';
      }
    });
  },

  // === 스테이지 렌더링 ===
  renderStage(stageId) {
    this.currentStage = String(stageId);
    if (!this.currentMudData || !this.currentMudData.stages) return;

    const stage = this.currentMudData.stages[this.currentStage];
    if (!stage) return;

    this.visited.add(this.currentStage);
    this.updateRoadmap();

    // 위치 & 뱃지 갱신
    document.getElementById('mn-stage-location').innerHTML =
      `<i class="fas fa-compass" style="color: var(--accent-red);"></i> ${stage.location}`;
    const badge = document.getElementById('mn-stage-badge');
    badge.textContent = stage.badge;
    badge.style.backgroundColor = this.themeColor;

    // 시뮬레이터 모드 설정
    if (stage.simulator) {
      this.setupSimulator(stage.simulator);
    }

    // 캐릭터 프로필 카드
    const charCard = document.getElementById('mn-character-card');
    if (stage.character) {
      charCard.style.display = 'flex';
      document.getElementById('mn-char-avatar').textContent = stage.character.avatar;
      document.getElementById('mn-char-name').textContent = stage.character.name;
      document.getElementById('mn-char-subtitle').textContent = stage.character.subtitle;
    } else {
      charCard.style.display = 'none';
    }

    // 서술문 렌더링 (용어 돋보기 tooltip 자동 변환)
    let narrativeHtml = stage.narrative;
    if (stage.glossary && stage.glossary.length > 0) {
      stage.glossary.forEach(g => {
        const tooltip = `<span class="glossary-term" title="${g.definition}" style="border-bottom: 2px dotted ${this.themeColor}; cursor: help; font-weight: 700; color: ${this.themeColor};">${g.term}</span>`;
        narrativeHtml = narrativeHtml.split(g.term).join(tooltip);
      });
    }
    document.getElementById('mn-story-content').innerHTML = narrativeHtml;

    // 선택지 버튼 생성
    const grid = document.getElementById('mn-choices-grid');
    grid.innerHTML = '';
    // 선택지 원본 순서는 보존하고, 화면에 표시할 복사본만 섞는다.
    // 선택지가 하나뿐인 IF 재시도 단계는 불필요하게 처리하지 않는다.
    const choices = [...(stage.choices || [])];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    choices.forEach((ch, index) => {
      const btn = document.createElement('button');
      btn.className = "btn secondary";
      btn.style.textAlign = 'left';
      btn.style.justifyContent = 'space-between';
      btn.setAttribute('aria-label', `선택지 ${index + 1}: ${ch.text}`);
      btn.disabled = Boolean(this.currentSimulator?.required && !this.simulatorComplete);
      btn.setAttribute('aria-disabled', String(btn.disabled));
      if (btn.disabled) {
        btn.style.opacity = '0.45';
        btn.style.cursor = 'not-allowed';
      }
      const choiceMarker = ['A', 'B', 'C', 'D'][index] || String(index + 1);
      btn.innerHTML = `
        <span>${ch.text}</span>
        <span class="choice-marker choice-marker-${index % 3}" aria-hidden="true">${choiceMarker}</span>
      `;
      btn.onclick = () => {
        if (ch.sound && window.sounds) {
          if (ch.sound === 'cannon' || ch.sound === 'drum') window.sounds.playClick();
          else if (ch.sound === 'victory') window.sounds.playFanfare();
          else if (ch.sound === 'fail') window.sounds.playWrong();
          else window.sounds.playClick();
        }
        if (ch.next === "end" || (typeof ch.next === 'string' && ch.next.startsWith("ending_"))) {
          if (window.encyclopedia) window.encyclopedia.unlockBadge('badge_timeline_master');
          this.renderFinalReflection(ch.next);
        } else {
          this.renderStage(ch.next);
        }
      };
      grid.appendChild(btn);
    });
  },

  // === 필수 시뮬레이터 진행 계약 ===
  registerSimulatorAction() {
    this.simActionCount += 1;
  },

  registerUniqueSimulatorAction(actionId) {
    if (!actionId) return;
    this.simActionIds.add(String(actionId));
  },

  getSimulatorState(mode = this.simMode) {
    if (Array.isArray(this.currentSimulator?.hotspots)) return this.simulatorState;
    const legacyStateKey = {
      'paleo-environment': 'paleoEnvironmentState',
      'paleo-fire': 'paleoFireState',
      'paleo-stone': 'paleoStoneState',
      'paleo-hunt': 'paleoHuntState',
      'paleo-community': 'paleoCommunityState',
      'paleo-reflection': 'paleoReflectionState'
    }[mode];
    return legacyStateKey ? this[legacyStateKey] : this.simulatorState;
  },

  getSimulatorProgress() {
    const requestedKey = this.currentSimulator?.completion?.progressKey || 'gaugeProgress';
    const progressKey = this.simulatorProgressKeys.includes(requestedKey) ? requestedKey : 'simulatorProgress';
    const progress = Number(this[progressKey]);
    return Number.isFinite(progress) ? progress : 0;
  },

  setSimulatorProgress(value) {
    const progress = Number(value);
    const safeProgress = Number.isFinite(progress) ? progress : 0;
    const requestedKey = this.currentSimulator?.completion?.progressKey || 'gaugeProgress';
    const progressKey = this.simulatorProgressKeys.includes(requestedKey) ? requestedKey : 'simulatorProgress';
    this.simulatorProgress = safeProgress;
    this[progressKey] = safeProgress;
    return safeProgress;
  },

  simulatorIncrement(fallback = 25) {
    return Number(this.currentSimulator?.completion?.increment || fallback);
  },

  updateSimulatorCompletion() {
    const completion = this.currentSimulator?.completion;
    if (!this.currentSimulator?.required || !completion) return;

    const progress = this.getSimulatorProgress();
    const target = Number(completion.target || 0);
    const minActions = Number(completion.minActions || 0);
    const actionCount = completion.uniqueActions
      ? this.simActionIds.size
      : this.simActionCount;
    const actionReady = actionCount >= minActions;
    const progressReady = !target || progress >= target;

    if (actionReady && progressReady && !this.simulatorComplete) {
      this.simulatorComplete = true;
      const feedback = document.getElementById('mn-canvas-feedback');
      if (feedback && completion.successText) feedback.innerHTML = completion.successText;
      const grid = document.getElementById('mn-choices-grid');
      if (grid) {
        grid.querySelectorAll('button').forEach(btn => {
        btn.disabled = false;
        btn.setAttribute('aria-disabled', 'false');
          btn.style.opacity = '';
          btn.style.cursor = '';
        });
      }
    }
  },

  runSimulatorAction(action) {
    if (!action || typeof action !== 'object') return;
    if (action.type === 'dolmen') {
      this.triggerDolmenAction(action.value);
    } else if (action.type === 'vote') {
      this.triggerVoteAction(action.value);
    } else if (action.type === 'taegeuk-part') {
      this.colorTaegeukPart(action.value);
    } else if (action.type === 'slider-set') {
      this.updateSlider(Number(action.value), true);
      if (action.sound && window.sounds) {
        if (action.sound === 'fanfare') window.sounds.playFanfare();
        else window.sounds.playClick();
      }
    } else if (action.type === 'observe') {
      this.recordObservation(action.value);
    }
    if (action.id) this.registerUniqueSimulatorAction(action.id);
    else if (action.type === 'observe') this.registerUniqueSimulatorAction(action.value);
    this.updateSimulatorCompletion();
  },

  recordObservation(value) {
    const observation = String(value || '').trim();
    if (!observation || this.simulatorState.found.includes(observation)) return;
    this.simulatorState.found.push(observation);
    this.registerSimulatorAction();
    this.setSimulatorProgress(this.simulatorState.found.length);
    this.updateSimulatorCompletion();
  },

  renderSimulatorActions(sim, container) {
    container.replaceChildren();
    if (sim.infoText) {
      const info = document.createElement('div');
      info.className = 'simulator-action-info';
      info.innerHTML = sim.infoText;
      container.appendChild(info);
    }

    const actions = Array.isArray(sim.actions) ? sim.actions : [];
    if (!actions.length && sim.buttonsHtml) {
      console.warn(`Legacy buttonsHtml is still in use for simulator mode: ${sim.mode}`);
      container.innerHTML = sim.buttonsHtml;
      return;
    }

    const actionGroup = document.createElement('div');
    actionGroup.className = 'simulator-action-group';
    actions.forEach(action => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = action.variant === 'primary' ? 'btn' : 'btn secondary';
      button.textContent = action.label;
      button.addEventListener('click', () => this.runSimulatorAction(action));
      actionGroup.appendChild(button);
    });
    container.appendChild(actionGroup);
  },

  // === 시뮬레이터 위젯 및 가이드 설정 ===
  setupSimulator(sim) {
    this.simMode = sim.mode;
    this.currentSimulator = sim;
    this.simActionCount = 0;
    this.simulatorComplete = !sim.required;
    this.simulatorProgress = 0;
    this.simulatorState = { found: [], step: 0, lastId: null };
    if (sim.mode === 'paleo-environment') {
      this.paleoEnvironmentFound = 0;
      this.paleoEnvironmentState = { found: [], lastId: null };
    }
    if (sim.mode === 'paleo-fire') {
      this.paleoFireStep = 0;
      this.paleoFireState = { found: [], step: 0, lastId: null };
    }
    if (sim.mode === 'paleo-stone') {
      this.paleoStoneFacets = 0;
      this.paleoStoneState = { found: [], lastId: null };
    }
    if (sim.mode === 'paleo-hunt') {
      this.paleoHuntFound = 0;
      this.paleoHuntState = { found: [], lastId: null };
    }
    if (sim.mode === 'paleo-community') {
      this.paleoCommunityFound = 0;
      this.paleoCommunityState = { found: [], lastId: null };
    }
    if (sim.mode === 'paleo-reflection') {
      this.paleoReflectionFound = 0;
      this.paleoReflectionState = { found: [], lastId: null };
    }

    // 위젯 일괄 숨김
    document.getElementById('widget-info').style.display = 'none';
    document.getElementById('widget-gauge').style.display = 'none';
    document.getElementById('widget-slider').style.display = 'none';

    const instr = document.getElementById('mn-canvas-instr');
    const feedback = document.getElementById('mn-canvas-feedback');
    if (instr) instr.innerHTML = sim.instruction || '';
    if (feedback) feedback.textContent = sim.feedback || '화면을 터치하여 체험을 진행하세요!';

    if (window.MudSimulators) window.MudSimulators.renderAlternativeControls();

    switch (sim.type) {
      case 'info':
        document.getElementById('widget-info').style.display = 'block';
        document.getElementById('widget-info').innerHTML = sim.infoText || '';
        break;

      case 'gauge':
        document.getElementById('widget-gauge').style.display = 'block';
        document.getElementById('gauge-label').textContent = sim.gaugeLabel || '진행도:';
        this.gaugeProgress = 0;
        document.getElementById('gauge-progress').textContent = "0%";
        document.getElementById('gauge-bar').style.width = "0%";
        if (this.simMode === 'mn-combat-active') {
          this.spawnEnemyShips(4);
        }
        break;

      case 'slider':
        document.getElementById('widget-slider').style.display = 'block';
        document.getElementById('slider-label').textContent = sim.sliderLabel || '설정 조절:';
        const slider = document.getElementById('interactive-slider');
        slider.min = String(sim.sliderMin || 0);
        slider.max = String(sim.sliderMax || 100);
        slider.value = String(sim.sliderDefault || 50);
        document.getElementById('slider-val').textContent = `${slider.value}`;
        this.updateSlider(Number(slider.value));
        break;

      case 'buttons':
        document.getElementById('widget-info').style.display = 'block';
        this.renderSimulatorActions(sim, document.getElementById('widget-info'));
        break;
    }
  },

  // === 슬라이더 변경 반응 ===
  updateSlider(val, userInitiated = false) {
    this.targetCurrent = Number(val);
    const sliderValEl = document.getElementById('slider-val');
    if (this.simMode.startsWith('dolmen')) {
      this.dolmenState.workers = Number(val);
      if (sliderValEl) sliderValEl.textContent = `${val}명`;
    } else if (this.simMode.startsWith('mn')) {
      let desc = '정조(물살 멈춤)';
      if (val < 40) desc = `밀물 (${val}%)`;
      else if (val > 60) desc = `썰물 역전! (${val}%) - 총공격 개시!`;
      if (sliderValEl) sliderValEl.textContent = desc;
    } else {
      if (sliderValEl) sliderValEl.textContent = `${val}`;
    }
    if (userInitiated && this.currentSimulator?.required) {
      this.registerSimulatorAction();
      this.setSimulatorProgress(Number(val));
      this.updateSimulatorCompletion();
    }
  },

  // === 캔버스 크기 반응형 조절 ===
  resizeCanvas() {
    const canvas = document.getElementById('mn-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    const ctx = canvas.getContext('2d');
    // resizeCanvas가 여러 번 호출되어도 이전 transform이 누적되지 않게 한다.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  },

  // === 애니메이션 루프 ===
  startAnimLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    const loop = () => {
      if (window.MudSimulators) {
        window.MudSimulators.drawSim();
      }
      if (document.getElementById('view-myeongnyang') && document.getElementById('view-myeongnyang').style.display !== 'none') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  },

  // === 적 함선 생성 ===
  spawnEnemyShips(count) {
    const canvas = document.getElementById('mn-canvas');
    if (!canvas) return;
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    this.enemyShips = [];
    for (let i = 0; i < count; i++) {
      this.enemyShips.push({
        x: w - 70 - (Math.random() * 60),
        y: 35 + (i * (h - 70) / count) + (Math.random() * 10),
        size: 15,
        alive: true
      });
    }
  },

  // === 시뮬레이터 인터랙션 트리거 ===
  triggerDolmenAction(action) {
    if (action === 'base') {
      if (this.dolmenState.baseSet) return;
      this.dolmenState.baseSet = true;
      this.registerSimulatorAction();
      this.setSimulatorProgress(1);
      if (window.sounds) window.sounds.playClick();
    } else if (action === 'complete') {
      if (this.dolmenState.earthRemoved) return;
      this.dolmenState.earthRemoved = true;
      this.registerSimulatorAction();
      this.setSimulatorProgress(1);
      if (window.sounds) window.sounds.playFanfare();
    }
    this.updateSimulatorCompletion();
  },

  triggerVoteAction(action) {
    if (action === 'stamp') {
      if (this.voteState.stamped) return;
      this.voteState.stamped = true;
      this.registerSimulatorAction();
      this.setSimulatorProgress(1);
      if (window.sounds) window.sounds.playClick();
    } else if (action === 'insert') {
      if (!this.voteState.stamped) {
        alert('먼저 투표용지에 기표 도장(卜)을 찍어주세요!');
        return;
      }
      if (this.voteState.voteInserted) return;
      this.voteState.voteInserted = true;
      this.registerSimulatorAction();
      this.setSimulatorProgress(2);
      if (window.sounds) window.sounds.playFanfare();
    }
    this.updateSimulatorCompletion();
  },

  colorTaegeukPart(part) {
    if (this.taegeukState[part] !== undefined) {
      if (this.taegeukState[part]) return;
      this.taegeukState[part] = true;
      this.registerSimulatorAction();
      this.setSimulatorProgress(Object.values(this.taegeukState).filter(Boolean).length);
      if (window.sounds) window.sounds.playClick();
      this.checkTaegeukComplete();
      this.updateSimulatorCompletion();
    }
  },

  colorAllTaegeuk() {
    if (Object.values(this.taegeukState).every(Boolean)) return;
    this.taegeukState = { yangColor: true, yinColor: true, geon: true, gon: true, gam: true, ri: true };
    this.registerSimulatorAction();
    this.setSimulatorProgress(6);
    if (window.sounds) window.sounds.playFanfare();
    this.checkTaegeukComplete();
    this.updateSimulatorCompletion();
  },

  checkTaegeukComplete() {
    const s = this.taegeukState;
    const allCompleted = s.yangColor && s.yinColor && s.geon && s.gon && s.gam && s.ri;
    const fb = document.getElementById('mn-canvas-feedback');
    if (allCompleted) {
      if (window.sounds) window.sounds.playFanfare();
      if (fb) fb.innerHTML = "🎉 <b>대한독립만세!</b> 1945년 8·15 광복 태극기가 완성되었습니다!";
    } else {
      if (fb) fb.innerHTML = "남은 영역을 터치하여 태극기를 완성하세요!";
    }
  },

  // === 최종 메타인지 회고록 렌더링 ===
  renderFinalReflection(endingId = "end") {
    if (window.sounds) window.sounds.playFanfare();

    // 스토리별 유물 자동 잠금 해제 (토스트에는 ID 대신 사람이 읽는 유물명을 표시한다)
    if (this.currentMudData && this.currentMudData.rewards && window.encyclopedia) {
      this.currentMudData.rewards.forEach(r => {
        window.encyclopedia.unlockArtifact(r.name || r.artifactId);
      });
    }

    const title = this.currentMudData ? this.currentMudData.title : '역사 탐구';
    const tag = this.currentMudData ? this.currentMudData.header.tag : '역사 탐험';

    let endingHtml = '';
    if (this.currentMudData && this.currentMudData.endings && this.currentMudData.endings[endingId]) {
      const ending = this.currentMudData.endings[endingId];
      endingHtml = `
        <div style="background: #FFFFFF; border: 2px solid ${this.themeColor}; border-radius: 8px; padding: 14px; margin-bottom: 14px; text-align: center;">
          <span style="font-size: 0.8rem; font-weight: 700; color: ${this.themeColor}; background: ${this.themeColor}15; padding: 3px 8px; border-radius: 4px;">🏆 도달한 역사적 결말</span>
          <h4 style="font-size: 1.2rem; color: ${this.themeColor}; margin: 8px 0 4px;">${ending.title}</h4>
          <p style="font-size: 0.9rem; color: #4B5563; line-height: 1.5; margin: 0;">${ending.description}</p>
        </div>
      `;
    }

    let rewardsHtml = '';
    if (this.currentMudData && this.currentMudData.rewards && this.currentMudData.rewards.length > 0) {
      const rewardNames = this.currentMudData.rewards.map(r => r.name).join(', ');
      rewardsHtml = `
        <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); border: 2px solid #F59E0B; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; text-align: center; color: #92400E;">
          <div style="font-size: 1.2rem; margin-bottom: 4px;">✨ <b>국보 유물 획득!</b> ✨</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #78350F;">[ ${rewardNames} ]</div>
          <div style="font-size: 0.8rem; color: #B45309; margin-top: 4px;">나의 역사 국보 도감에 등록되었습니다.</div>
        </div>
      `;
    }

    const grid = document.getElementById('mn-choices-grid');
    if (grid) grid.innerHTML = '';

    const content = document.getElementById('mn-story-content');
    if (content) {
      content.innerHTML = `
        <div class="mission-box" style="text-align: center; border: 2px solid ${this.themeColor}; background: ${this.themeColor}15;">
          <h3 style="font-size: 1.35rem; color: ${this.themeColor}; margin: 8px 0 4px;" class="serif-font">🎉 탐구 미션 완료!</h3>
          <h4 style="font-size: 0.95rem; font-weight: 700; color: ${this.themeColor}; margin-bottom: 10px;">[${tag}] ${title}</h4>
          ${endingHtml}
          ${rewardsHtml}
          <p style="font-size: 0.9rem; color: #554D46; line-height: 1.6; margin-bottom: 14px;">
            역사적 결단을 내리고 시뮬레이션을 완수했습니다.<br>
            오늘 배운 역사적 사실과 나의 생각을 성찰 일기로 기록해 보세요.
          </p>
          <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 14px; text-align: left;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 6px;">
              📝 나의 역사 탐구 성찰 일기 (선생님 제출용)
            </label>
            <textarea id="student-reflection-text" rows="4" style="width: 100%; border: 1px solid #CBD5E1; border-radius: 6px; padding: 8px; font-size: 0.88rem; resize: vertical;" placeholder="오늘 탐구에서 가장 인상 깊었던 결단과 그 이유는 무엇인가요?"></textarea>
            <button onclick="MudEngine.copyStudentReflection()" class="btn" style="margin-top: 8px; width: 100%; background: ${this.themeColor}; font-size: 0.85rem; padding: 8px;">
              📋 과제 일기 복사하기 (클립보드)
            </button>
          </div>
          <button onclick="showPortalView()" class="btn secondary" style="width: 100%; font-size: 0.9rem; padding: 10px;">
            <i class="fas fa-arrow-left"></i> 전체 탐구 진도표로 돌아가기
          </button>
        </div>
      `;
    }
  },

  copyStudentReflection() {
    const textarea = document.getElementById('student-reflection-text');
    const text = textarea ? textarea.value.trim() : '';
    if (!text) {
      alert('성찰 일기 내용을 먼저 작성해 주세요!');
      return;
    }
    const fullText = `[역사 탐구 일기]\n단원: ${this.currentMudData ? this.currentMudData.header.tag : ''}\n주제: ${this.currentMudData ? this.currentMudData.title : ''}\n내용: ${text}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert('성찰 일기가 클립보드에 복사되었습니다! 과제방이나 학습지에 붙여넣기(Ctrl+V)하세요.');
    }).catch(() => {
      alert('복사 권한이 없어 수동으로 복사해 주세요.');
    });
  }
};

// 전역 등록
window.MudEngine = MudEngine;
