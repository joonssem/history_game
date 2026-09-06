(function () {
  'use strict';

  const scenario = window.FoundingMythsScenario;
  const storageKey = 'history_cooperative_founding_myths_v01';
  const screenIds = ['intro', 'setup', 'role', 'first', 'share', 'reveal', 'second', 'statement', 'history', 'finish'];
  const totalSteps = 8;
  const progressInfo = {
    intro: { label: '활동 소개', step: 1 },
    setup: { label: '모둠·번호 선택', step: 2 },
    role: { label: '내 이야기', step: 3 },
    first: { label: '최초 판단', step: 4 },
    share: { label: '이야기 나누기', step: 5 },
    reveal: { label: '새로운 자료', step: 6 },
    second: { label: '공통점 다시 보기', step: 6 },
    statement: { label: '모둠의 문장', step: 7 },
    history: { label: '역사 자료 비교', step: 8 },
    finish: { label: '탐구 완료', step: 8 }
  };

  let state = loadState();

  function defaultState() {
    return {
      scenarioId: scenario.id,
      team: null,
      teamSize: null,
      seat: null,
      roleId: null,
      durationMode: '10',
      roleRead: false,
      firstChoice: null,
      shared: false,
      revisedChoice: null,
      decisionChanged: null,
      secondSeen: false,
      statement: {
        subject: 'founder',
        manner: 'sky',
        reason: 'authority'
      },
      completed: false
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey));
      if (!saved || saved.scenarioId !== scenario.id) return defaultState();
      const base = defaultState();
      return Object.assign(base, saved, { statement: Object.assign(base.statement, saved.statement || {}) });
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

  function setScreen(screenId) {
    screenIds.forEach(function (id) {
      const screen = get('screen-' + id);
      if (screen) screen.hidden = id !== screenId;
    });
    updateProgress(screenId);
    if (window.CoopPacing) window.CoopPacing.enter(screenId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress(screenId) {
    const info = progressInfo[screenId] || progressInfo.intro;
    const count = get('progress-count');
    const label = get('progress-step');
    const value = get('progress-value');
    if (count) count.textContent = info.step + ' / ' + totalSteps;
    if (label) label.textContent = info.label;
    if (value) value.style.width = Math.round((info.step / totalSteps) * 100) + '%';
  }

  function getRole() {
    if (!state.seat) return null;
    return scenario.roles[state.seat - 1] || null;
  }

  function getChoice(choiceId) {
    return scenario.firstChoices.find(function (choice) { return choice.id === choiceId; }) || null;
  }

  function getStatementOption(type, value) {
    const list = scenario.statementOptions[type];
    return list.find(function (option) { return option.value === value; }) || list[0];
  }

  function renderTeamGrid() {
    const grid = get('team-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let index = 0; index < scenario.teamCount; index += 1) {
      const teamNumber = index + 1;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'team-button' + (state.team === teamNumber ? ' is-selected' : '');
      button.textContent = teamNumber + '모둠';
      button.setAttribute('aria-pressed', state.team === teamNumber ? 'true' : 'false');
      button.addEventListener('click', function () {
        state.team = teamNumber;
        state.teamSize = null;
        state.seat = null;
        state.roleId = null;
        renderTeamGrid();
        renderTeamSizeGrid();
        renderSeatGrid();
        setStatus(teamNumber + '모둠을 선택했습니다. 실제 모둠 인원수를 선택하세요.');
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
      updateBeginButton();
      return;
    }
    hint.textContent = state.team + '모둠 · ' + state.teamSize + '명입니다. 교사가 정해 준 번호를 선택하세요.';
    for (let seat = 1; seat <= state.teamSize; seat += 1) {
      const seatNumber = seat;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'seat-button' + (state.seat === seatNumber ? ' is-selected' : '');
      button.textContent = seatNumber + '번';
      button.setAttribute('aria-pressed', state.seat === seatNumber ? 'true' : 'false');
      button.addEventListener('click', function () {
        state.seat = seatNumber;
        state.roleId = scenario.roles[seatNumber - 1].id;
        renderSeatGrid();
        setStatus(state.team + '모둠 ' + seatNumber + '번을 선택했습니다.');
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
      const selected = button.dataset.mode === state.durationMode;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function renderRole() {
    const role = getRole();
    const card = get('role-card');
    if (!role || !card) return;
    card.innerHTML = '<div class="role-head"><div class="role-icon" aria-hidden="true">' + role.icon + '</div><div>' +
      '<span class="role-badge">' + state.team + '모둠 · ' + state.seat + '번</span>' +
      '<h2>' + role.name + '</h2></div></div>' +
      '<p class="private-label">나만 알고 있는 이야기 · ' + role.figure + '</p>' +
      '<p class="private-info">' + role.privateInfo + '</p>' +
      '<div class="interest-box"><strong>이 이야기의 특징:</strong> ' + role.interest + '</div>';
  }

  function renderShare() {
    const role = getRole();
    const card = get('share-card');
    const shareButton = get('share-button');
    const shareState = get('share-state');
    if (!role) return;
    if (card) card.innerHTML = '<strong>모둠에 꼭 말할 내용</strong><br>' + role.shareText;
    if (shareButton) {
      shareButton.disabled = state.shared;
      shareButton.textContent = state.shared ? '공유 확인 완료' : '모둠에 이야기했어요';
    }
    if (shareState) {
      shareState.textContent = state.shared
        ? '✓ 네 이야기가 모두 모였다면 다음으로 넘어갑니다.'
        : '친구에게 설명한 뒤 버튼을 눌러 주세요.';
    }
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
      renderStatement();
      setScreen('statement');
      setStatus('5분형입니다. 공통점 다시 보기를 생략하고 모둠의 문장을 만들어 보세요.');
      return;
    }
    setScreen('second');
    setStatus('네 이야기의 공통점을 다시 살펴보고 모둠에서 토론하세요.');
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

  function renderStatement() {
    const subject = get('statement-subject');
    const manner = get('statement-manner');
    const reason = get('statement-reason');
    if (!subject || !manner || !reason) return;
    populateSelect(subject, scenario.statementOptions.subject, state.statement.subject);
    populateSelect(manner, scenario.statementOptions.manner, state.statement.manner);
    populateSelect(reason, scenario.statementOptions.reason, state.statement.reason);
    const heading = get('statement-heading');
    const description = get('statement-description');
    if (state.durationMode === '5') {
      if (heading) heading.textContent = '네 이야기를 바탕으로 설명 문장 만들기';
      if (description) description.textContent = '친구들에게 들은 이야기와 새 자료를 반영해, 옛사람들이 왜 그렇게 이야기했는지 한 문장으로 모둠에서 합의합니다.';
    } else {
      if (heading) heading.textContent = '공통점과 차이점을 모두 넣어 설명 문장 만들기';
      if (description) description.textContent = '백제 온조 이야기까지 함께 설명할 수 있는 문장으로, 옛사람들이 왜 그렇게 이야기했는지 모둠에서 합의합니다.';
    }
    updateStatementPreview();
  }

  function buildStatementSentence() {
    const subject = getStatementOption('subject', get('statement-subject').value);
    const manner = getStatementOption('manner', get('statement-manner').value);
    const reason = getStatementOption('reason', get('statement-reason').value);
    return '옛사람들은 ' + subject.sentence + ' ' + manner.sentence + ' 이야기했다. ' + reason.sentence + '.';
  }

  function updateStatementPreview() {
    const preview = get('statement-preview');
    if (preview) preview.textContent = '“' + buildStatementSentence() + '”';
  }

  function renderHistory() {
    const list = get('document-list');
    if (list) {
      list.innerHTML = scenario.documents.map(function (doc) {
        return '<li><strong>' + doc.name + '</strong> ' + doc.note + '</li>';
      }).join('');
    }
    const sources = get('source-list');
    if (sources) {
      sources.innerHTML = scenario.sources.map(function (source) {
        return '<a href="' + source.url + '" target="_blank" rel="noopener noreferrer">' + source.label + ' ↗</a>';
      }).join('');
    }
    const compare = get('compare-text');
    if (compare) {
      const finalChoice = getChoice(state.revisedChoice || state.firstChoice);
      const answer = finalChoice ? finalChoice.text : '아직 고르지 않았습니다';
      if (!finalChoice) {
        compare.textContent = '내가 고른 생각과 학자들의 관점을 나란히 놓고, 어디가 같고 어디가 다른지 이야기해 봅시다.';
      } else if (finalChoice.id === 'true-event') {
        compare.textContent = '네 생각은 “' + answer + '”였구나. 그렇게 볼 수도 있지만, 지금 남아 있는 자료만으로는 그 일이 실제로 있었는지 확인하기 어렵습니다. 그래도 이 이야기가 왜 여러 나라에서 비슷하게 전해졌는지는 자료로 살펴볼 수 있습니다.';
      } else {
        compare.textContent = '네 생각은 “' + answer + '”였구나. 학자들이 보는 방향과 가깝습니다. 그런데 까닭이 하나뿐일까요? 네 이야기 중 어떤 자료가 그 생각을 뒷받침하는지 모둠에서 두 가지만 말해 봅시다.';
      }
    }
  }

  function renderSummary() {
    const grid = get('summary-grid');
    if (!grid) return;
    const role = getRole();
    const firstChoice = getChoice(state.firstChoice);
    const finalChoice = getChoice(state.revisedChoice || state.firstChoice);
    const changedText = state.decisionChanged ? '생각을 바꿈' : '처음 생각을 유지';
    grid.innerHTML = '<div class="summary-item"><span>내가 맡은 이야기</span><strong>' + (role ? role.name + ' · ' + role.figure : '-') + '</strong></div>' +
      '<div class="summary-item"><span>공유 전 최초 판단</span><strong>' + (firstChoice ? firstChoice.text : '-') + '</strong></div>' +
      '<div class="summary-item"><span>친구 이야기와 새 자료 뒤</span><strong>' + changedText + '</strong></div>' +
      '<div class="summary-item"><span>마지막으로 고른 생각</span><strong>' + (finalChoice ? finalChoice.text : '-') + '</strong></div>' +
      '<div class="summary-item"><span>우리 모둠 설명 문장</span><strong>' + buildStatementSentence() + '</strong></div>';
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
    state.roleRead = false;
    state.firstChoice = null;
    state.shared = false;
    state.revisedChoice = null;
    state.decisionChanged = null;
    state.secondSeen = false;
    state.completed = false;
    saveState();
    if (window.CoopPacing) window.CoopPacing.start(state.durationMode);
    renderRole();
    setScreen('role');
    setStatus('내 이야기를 혼자 읽어 보세요. 아직 친구에게 설명하지 않습니다.');
  });

  get('role-continue-button').addEventListener('click', function () {
    state.roleRead = true;
    saveState();
    renderChoices('first-choice-grid', function (choice) {
      state.firstChoice = choice.id;
      state.revisedChoice = null;
      state.decisionChanged = null;
      saveState();
      renderShare();
      setScreen('share');
      setStatus('내 생각을 기록했습니다. 이제 모둠에서 이야기를 나누세요.');
    });
    setScreen('first');
    setStatus('친구와 이야기하기 전에 내 생각을 먼저 고르세요.');
  });

  get('share-button').addEventListener('click', function () {
    state.shared = true;
    saveState();
    renderShare();
    renderReveal();
    setScreen('reveal');
    setStatus('새로운 자료가 공개되었습니다. 처음 생각과 비교해 보세요.');
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
    renderStatement();
    setScreen('statement');
    setStatus('모둠에서 합의한 문장을 아래 블록으로 기록하세요.');
  });

  ['statement-subject', 'statement-manner', 'statement-reason'].forEach(function (id) {
    get(id).addEventListener('change', updateStatementPreview);
  });

  document.querySelectorAll('.mode-button').forEach(function (button) {
    button.addEventListener('click', function () {
      state.durationMode = this.dataset.mode;
      saveState();
      if (window.CoopPacing) window.CoopPacing.setMode(state.durationMode);
      renderModeButtons();
    });
  });

  get('statement-save-button').addEventListener('click', function () {
    state.statement = {
      subject: get('statement-subject').value,
      manner: get('statement-manner').value,
      reason: get('statement-reason').value
    };
    saveState();
    renderHistory();
    setScreen('history');
    setStatus('우리 모둠 문장을 기록했습니다. 이제 실제 역사 자료와 비교하세요.');
  });

  get('finish-button').addEventListener('click', function () {
    state.completed = true;
    saveState();
    renderSummary();
    setScreen('finish');
    setStatus('탐구 기록을 확인했습니다.');
  });

  get('reset-button').addEventListener('click', function () {
    window.localStorage.removeItem(storageKey);
    if (window.CoopPacing) window.CoopPacing.stop();
    state = defaultState();
    renderTeamGrid();
    renderTeamSizeGrid();
    renderSeatGrid();
    renderModeButtons();
    setScreen('intro');
    setStatus('이 기기의 기록을 지웠습니다.');
  });


  if (window.CoopPacing && scenario.pacing) {
    window.CoopPacing.init({
      rootId: 'pacing-note',
      badgeId: 'pacing-badge',
      textId: 'pacing-text',
      order: scenario.pacing.order,
      budgets: scenario.pacing.budgets,
      prompts: scenario.pacing.prompts
    });
  }

  renderModeButtons();
  updateProgress('intro');
}());
