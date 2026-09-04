(function () {
  'use strict';

  const scenario = window.GojoseonLawScenario;
  const storageKey = 'history_cooperative_gojoseon_law_v01';
  const screenIds = ['intro', 'setup', 'role', 'first', 'reveal', 'second', 'law', 'history', 'finish'];
  const progressInfo = {
    intro: { label: '활동 소개', step: 1 },
    setup: { label: '모둠·좌석 선택', step: 2 },
    role: { label: '역할 정보', step: 3 },
    first: { label: '최초 판단', step: 4 },
    reveal: { label: '추가 증거', step: 5 },
    second: { label: '두 번째 사건', step: 5 },
    law: { label: '모둠의 법', step: 6 },
    history: { label: '역사 자료 비교', step: 7 },
    finish: { label: '탐구 완료', step: 7 }
  };

  let state = loadState();
  let currentScreenId = null;
  let screenHistoryStack = [];

  function defaultState() {
    return {
      scenarioId: scenario.id,
      team: null,
      teamSize: null,
      seat: null,
      roleId: null,
      durationMode: '10',
      shared: false,
      firstChoice: null,
      revisedChoice: null,
      decisionChanged: null,
      secondSeen: false,
      law: {
        target: '곡식',
        response: 'council',
        condition: 'circumstances'
      },
      completed: false
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey));
      if (!saved || saved.scenarioId !== scenario.id) return defaultState();
      return Object.assign(defaultState(), saved, { law: Object.assign(defaultState().law, saved.law || {}) });
    } catch (error) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      setStatus('이 기기에 기록을 저장하지 못했습니다. 활동은 계속할 수 있습니다.');
    }
  }

  function get(id) {
    return document.getElementById(id);
  }

  function setStatus(message) {
    const status = get('live-status');
    if (status) status.textContent = message || '';
  }

  function setScreen(screenId, options) {
    const recordHistory = !options || options.recordHistory !== false;
    if (recordHistory && currentScreenId && currentScreenId !== screenId) {
      screenHistoryStack.push(currentScreenId);
    }
    currentScreenId = screenId;
    screenIds.forEach(function (id) {
      const screen = get('screen-' + id);
      if (screen) screen.hidden = id !== screenId;
    });
    updateProgress(screenId);
    updateBackButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateBackButton() {
    const nav = get('nav-row');
    if (nav) nav.hidden = screenHistoryStack.length === 0;
  }

  function renderScreenContent(screenId) {
    if (screenId === 'setup') {
      renderTeamGrid();
      renderTeamSizeGrid();
      renderSeatGrid();
      renderModeButtons();
    } else if (screenId === 'role') {
      renderRole();
    } else if (screenId === 'first') {
      bindFirstChoices();
    } else if (screenId === 'reveal') {
      renderReveal();
    } else if (screenId === 'law') {
      renderLaw();
    } else if (screenId === 'finish') {
      renderSummary();
    }
  }

  function updateProgress(screenId) {
    const info = progressInfo[screenId] || progressInfo.intro;
    const count = get('progress-count');
    const label = get('progress-step');
    const value = get('progress-value');
    if (count) count.textContent = info.step + ' / 7';
    if (label) label.textContent = info.label;
    if (value) value.style.width = Math.round((info.step / 7) * 100) + '%';
  }

  function getRole() {
    if (!state.seat) return null;
    return scenario.roles[state.seat - 1] || null;
  }

  function getChoice(choiceId) {
    return scenario.firstChoices.find(function (choice) { return choice.id === choiceId; }) || null;
  }

  function getLawOption(type, value) {
    return scenario.lawOptions[type].find(function (option) { return option.value === value; }) || scenario.lawOptions[type][0];
  }

  function renderTeamGrid() {
    const grid = get('team-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let index = 0; index < scenario.teamCount; index += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'team-button' + (state.team === index + 1 ? ' is-selected' : '');
      button.textContent = (index + 1) + '모둠';
      button.setAttribute('aria-pressed', state.team === index + 1 ? 'true' : 'false');
      button.addEventListener('click', function () {
        state.team = index + 1;
        state.teamSize = null;
        state.seat = null;
        state.roleId = null;
        renderTeamGrid();
        renderTeamSizeGrid();
        renderSeatGrid();
        setStatus((index + 1) + '모둠을 선택했습니다. 실제 모둠 인원수를 선택하세요.');
      });
      grid.appendChild(button);
    }
  }

  function renderTeamSizeGrid() {
    const grid = get('team-size-grid');
    if (!grid) return;
    grid.innerHTML = '';
    scenario.teamSizeOptions.forEach(function (size) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'team-size-button' + (state.teamSize === size ? ' is-selected' : '');
      button.textContent = size + '명';
      button.setAttribute('aria-pressed', state.teamSize === size ? 'true' : 'false');
      button.addEventListener('click', function () {
        state.teamSize = size;
        state.seat = null;
        state.roleId = null;
        renderTeamSizeGrid();
        renderSeatGrid();
        setStatus(state.team + '모둠의 인원을 ' + size + '명으로 선택했습니다. 교사가 알려 준 내 번호를 선택하세요.');
      });
      grid.appendChild(button);
    });
  }

  function renderSeatGrid() {
    const grid = get('seat-grid');
    const hint = get('setup-hint');
    if (!grid || !hint) return;
    grid.innerHTML = '';
    if (!state.team || !state.teamSize) {
      hint.textContent = state.team ? '모둠 인원수를 먼저 선택하세요.' : '모둠 번호와 인원수를 먼저 선택하세요.';
      return;
    }
    hint.textContent = state.team + '모둠 · ' + state.teamSize + '명입니다. 교사가 정해 준 번호를 선택하세요.';
    for (let seat = 1; seat <= state.teamSize; seat += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'seat-button' + (state.seat === seat ? ' is-selected' : '');
      button.textContent = seat + '번';
      button.setAttribute('aria-pressed', state.seat === seat ? 'true' : 'false');
      button.addEventListener('click', function () {
        state.seat = seat;
        state.roleId = scenario.roles[seat - 1].id;
        renderSeatGrid();
        updateBeginButton();
        setStatus(state.team + '모둠 ' + seat + '번을 선택했습니다.');
      });
      grid.appendChild(button);
    }
    updateBeginButton();
  }

  function updateBeginButton() {
    const button = get('begin-button');
    if (button) button.disabled = !(state.team && state.teamSize && state.seat);
  }

  function renderModeButtons() {
    document.querySelectorAll('.mode-button').forEach(function (button) {
      button.classList.toggle('is-selected', button.dataset.mode === state.durationMode);
      button.setAttribute('aria-pressed', button.dataset.mode === state.durationMode ? 'true' : 'false');
    });
  }

  function renderRole() {
    const role = getRole();
    const card = get('role-card');
    const shareButton = get('share-button');
    const shareState = get('share-state');
    if (!role || !card) return;
    card.innerHTML = '<div class="role-head"><div class="role-icon" aria-hidden="true">' + role.icon + '</div><div><span class="role-badge">' + state.team + '모둠 · ' + state.seat + '번</span><h2>' + role.name + '</h2></div></div>' +
      '<p class="private-label">나만 알고 있는 정보</p><p class="private-info">' + role.privateInfo + '</p>' +
      '<div class="interest-box"><strong>나의 이해관계:</strong> ' + role.interest + '</div>' +
      '<div class="share-quote"><strong>모둠에 꼭 말할 내용</strong><br>' + role.shareText + '</div>';
    if (shareButton) {
      shareButton.textContent = state.shared ? '다음: 최초 판단 선택하기' : '모둠에 이야기했어요';
    }
    if (shareState) shareState.textContent = state.shared ? '✓ 이제 사건 1의 최초 판단을 선택할 수 있습니다.' : '친구에게 설명한 뒤 버튼을 눌러 주세요.';
  }

  function bindFirstChoices() {
    renderChoices('first-choice-grid', function (choice) {
      state.firstChoice = choice.id;
      state.revisedChoice = null;
      state.decisionChanged = null;
      saveState();
      renderReveal();
      setScreen('reveal');
      setStatus('새로운 증거가 공개되었습니다. 처음 생각과 비교해 보세요.');
    });
  }

  function renderChoices(containerId, clickHandler) {
    const grid = get(containerId);
    if (!grid) return;
    grid.innerHTML = '';
    scenario.firstChoices.forEach(function (choice) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.innerHTML = '<span class="choice-letter">' + choice.label + '</span>' + choice.text;
      button.addEventListener('click', function () { clickHandler(choice); });
      grid.appendChild(button);
    });
  }

  function renderReveal() {
    const clue = get('missing-role-clue');
    if (clue) {
      clue.hidden = state.teamSize !== 3;
      clue.innerHTML = '<h3>' + scenario.smallTeamClue.title + '</h3><p>' + scenario.smallTeamClue.text + '</p>';
    }
    const revisedArea = get('revised-choice-area');
    if (revisedArea) revisedArea.hidden = true;
    const changeButton = get('change-button');
    if (changeButton) changeButton.disabled = false;
    renderChoices('revised-choice-grid', function (choice) {
      state.revisedChoice = choice.id;
      state.decisionChanged = choice.id !== state.firstChoice;
      advanceAfterReveal();
    });
  }

  function advanceAfterReveal() {
    saveState();
    if (state.durationMode === '5') {
      renderLaw();
      setScreen('law');
      setStatus('5분형입니다. 사건 2를 생략하고 모둠의 법을 만들어 보세요.');
      return;
    }
    setScreen('second');
    setStatus('두 번째 사건을 읽고, 처음 만든 법의 문제를 모둠에서 토론하세요.');
  }

  function renderLaw() {
    const target = get('law-target');
    const response = get('law-response');
    const condition = get('law-condition');
    if (!target || !response || !condition) return;
    populateSelect(target, scenario.lawOptions.target, state.law.target);
    populateSelect(response, scenario.lawOptions.response, state.law.response);
    populateSelect(condition, scenario.lawOptions.condition, state.law.condition);
    const heading = get('law-heading');
    const description = get('law-description');
    if (state.durationMode === '5') {
      if (heading) heading.textContent = '사건 1을 바탕으로 우리 마을의 법 1조 만들기';
      if (description) description.textContent = '새로운 증거를 본 뒤의 생각을 반영해, 누구에게나 적용할 수 있는 법 한 조항을 모둠에서 합의합니다.';
    } else {
      if (heading) heading.textContent = '두 사건을 바탕으로 우리 마을의 법 1조 만들기';
      if (description) description.textContent = '한 번의 잘못과 반복된 잘못을 모두 생각하고, 누구에게나 적용할 수 있는 법 한 조항을 모둠에서 합의합니다.';
    }
    updateLawPreview();
  }

  function populateSelect(select, options, selectedValue) {
    select.innerHTML = '';
    options.forEach(function (option) {
      const element = document.createElement('option');
      element.value = option.value;
      element.textContent = option.text;
      element.selected = option.value === selectedValue;
      select.appendChild(element);
    });
  }

  function buildLawSentence() {
    const target = get('law-target').value;
    const response = getLawOption('response', get('law-response').value);
    const condition = getLawOption('condition', get('law-condition').value);
    const targetWord = target === '곡식' ? '곡식을' : '물건을';
    return '남의 ' + targetWord + ' 훔치면 ' + response.sentence + (condition.sentence ? '. ' + condition.sentence : '') + '.';
  }

  function updateLawPreview() {
    const preview = get('law-preview');
    if (preview) preview.textContent = '“' + buildLawSentence() + '”';
  }

  function renderSummary() {
    const grid = get('summary-grid');
    if (!grid) return;
    const firstChoice = getChoice(state.firstChoice);
    const finalChoice = getChoice(state.revisedChoice || state.firstChoice);
    const changedText = state.decisionChanged ? '생각을 바꿈' : '처음 생각을 유지';
    grid.innerHTML = '<div class="summary-item"><span>나의 역할</span><strong>' + (getRole() ? getRole().name : '-') + '</strong></div>' +
      '<div class="summary-item"><span>최초 판단</span><strong>' + (firstChoice ? firstChoice.text : '-') + '</strong></div>' +
      '<div class="summary-item"><span>추가 증거 뒤</span><strong>' + changedText + '</strong></div>' +
      '<div class="summary-item"><span>마지막으로 고른 생각</span><strong>' + (finalChoice ? finalChoice.text : '-') + '</strong></div>' +
      '<div class="summary-item"><span>우리 모둠 법 초안</span><strong>' + buildLawSentence() + '</strong></div>';
  }

  function startActivity() {
    renderTeamGrid();
    renderTeamSizeGrid();
    renderSeatGrid();
    renderModeButtons();
    setScreen('setup');
    setStatus('교사가 알려 준 모둠과 번호를 선택하세요.');
  }

  get('start-button').addEventListener('click', startActivity);

  get('begin-button').addEventListener('click', function () {
    const error = get('setup-error');
    if (!state.team || !state.teamSize || !state.seat) {
      if (error) error.textContent = '모둠 번호·인원수·내 번호를 모두 선택하세요.';
      return;
    }
    if (error) error.textContent = '';
    state.roleId = scenario.roles[state.seat - 1].id;
    state.shared = false;
    state.firstChoice = null;
    state.revisedChoice = null;
    state.decisionChanged = null;
    state.secondSeen = false;
    state.completed = false;
    saveState();
    renderRole();
    setScreen('role');
    setStatus('내 역할 정보를 읽고 친구에게 설명하세요.');
  });

  get('share-button').addEventListener('click', function () {
    state.shared = true;
    saveState();
    renderRole();
    bindFirstChoices();
    setScreen('first');
    setStatus('친구에게 설명했습니다. 이제 나의 최초 판단을 선택하세요.');
  });

  get('keep-button').addEventListener('click', function () {
    state.revisedChoice = state.firstChoice;
    state.decisionChanged = false;
    advanceAfterReveal();
  });

  get('change-button').addEventListener('click', function () {
    const area = get('revised-choice-area');
    if (area) area.hidden = false;
    this.disabled = true;
    setStatus('바꾼 생각을 다시 선택하세요. 처음과 같은 선택을 해도 괜찮습니다.');
  });

  get('second-continue-button').addEventListener('click', function () {
    state.secondSeen = true;
    saveState();
    renderLaw();
    setScreen('law');
    setStatus('모둠에서 합의한 법을 아래 블록으로 기록하세요.');
  });

  ['law-target', 'law-response', 'law-condition'].forEach(function (id) {
    get(id).addEventListener('change', function () {
      updateLawPreview();
    });
  });

  document.querySelectorAll('.mode-button').forEach(function (button) {
    button.addEventListener('click', function () {
      state.durationMode = this.dataset.mode;
      saveState();
      renderModeButtons();
    });
  });

  get('law-save-button').addEventListener('click', function () {
    state.law = {
      target: get('law-target').value,
      response: get('law-response').value,
      condition: get('law-condition').value
    };
    saveState();
    setScreen('history');
    setStatus('우리 모둠 법을 기록했습니다. 이제 실제 역사 자료와 비교하세요.');
  });

  get('finish-button').addEventListener('click', function () {
    state.completed = true;
    saveState();
    renderSummary();
    setScreen('finish');
    setStatus('탐구 기록을 확인했습니다.');
  });

  get('back-button').addEventListener('click', function () {
    if (!screenHistoryStack.length) return;
    const previousScreenId = screenHistoryStack.pop();
    renderScreenContent(previousScreenId);
    setScreen(previousScreenId, { recordHistory: false });
    setStatus('이전 단계로 돌아갔습니다. 필요하면 다시 선택할 수 있습니다.');
  });

  get('reset-button').addEventListener('click', function () {
    window.localStorage.removeItem(storageKey);
    state = defaultState();
    screenHistoryStack = [];
    renderTeamGrid();
    renderTeamSizeGrid();
    renderSeatGrid();
    renderModeButtons();
    setScreen('intro', { recordHistory: false });
    setStatus('이 기기의 기록을 지웠습니다.');
  });

  renderModeButtons();
  currentScreenId = 'intro';
  updateProgress('intro');
  updateBackButton();
}());
