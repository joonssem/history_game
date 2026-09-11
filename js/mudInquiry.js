// =========================================================
// js/mudInquiry.js - 근거 기반 Regular MUD 탐구 활동
// =========================================================

const MudInquiry = {
  engine: null,
  simulator: null,
  task: null,
  state: null,

  mount(simulator, engine) {
    const panel = document.getElementById('mn-inquiry-panel');
    if (!panel || simulator?.interaction !== 'inquiry-task') return;

    this.engine = engine;
    this.simulator = simulator;
    this.task = simulator.task || {};
    this.state = this.createInitialState(this.task);
    this.inventoryOpen = false; // 근거 인벤토리는 관문마다 접힌 채로 시작한다
    panel.style.display = 'block';
    this.render();
  },

  unmount() {
    const panel = document.getElementById('mn-inquiry-panel');
    if (panel) {
      panel.replaceChildren();
      panel.style.display = 'none';
    }
    this.engine = null;
    this.simulator = null;
    this.task = null;
    this.state = null;
  },

  createInitialState(task) {
    const base = {
      attempts: 0,
      completed: false,
      lastEvidenceId: null,
      lastIssueKey: null,
      issueRepeats: 0,
      hintsUsed: 0,
      misconceptionFlags: []
    };
    if (task.type === 'commit-revise') {
      return { ...base, initialChoice: null, finalChoice: null, viewedEvidence: [] };
    }
    if (task.type === 'sequence') {
      const cardIds = (task.cards || []).map(card => card.id);
      const order = this.shuffleForTask(cardIds, task.correctOrder || []);
      return { ...base, order, meaningChoice: null };
    }
    if (task.type === 'map-evidence') {
      return { ...base, locationId: null, supportId: null, limitId: null };
    }
    if (task.type === 'claim-evidence') {
      return { ...base, claimId: null, selectedEvidence: [], limitId: null };
    }
    return base;
  },

  shuffleForTask(ids, correctOrder) {
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    if (shuffled.length > 1 && shuffled.every((id, index) => id === correctOrder[index])) {
      shuffled.push(shuffled.shift());
    }
    return shuffled;
  },

  element(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  },

  button(label, options = {}) {
    const button = this.element('button', options.className || 'inquiry-option', label);
    button.type = 'button';
    button.disabled = Boolean(options.disabled || this.state?.completed);
    if (options.pressed !== undefined) button.setAttribute('aria-pressed', String(options.pressed));
    if (options.label) button.setAttribute('aria-label', options.label);
    if (options.focusKey) button.dataset.focusKey = options.focusKey;
    if (options.onClick) button.addEventListener('click', options.onClick);
    return button;
  },

  // 재렌더는 panel.replaceChildren()로 DOM을 통째로 버리므로, 클릭 직전 포커스가 있던
  // 버튼을 data-focus-key로 식별해 재렌더 후 같은 버튼으로 포커스를 되돌린다.
  captureFocusKey(panel) {
    const active = document.activeElement;
    if (!panel || !active || !panel.contains(active)) return null;
    return active.dataset.focusKey || null;
  },

  restoreFocus(panel, focusKey) {
    if (!panel || !focusKey) return;
    const tryFocus = key => {
      const target = panel.querySelector(`[data-focus-key="${CSS.escape(key)}"]`);
      if (target && !target.disabled) {
        // .inquiry-panel은 자체 스크롤 영역(overflow-y: auto)이므로, 복원된
        // 포커스가 패널 안에서 가려져 있으면 브라우저가 그 영역만 스크롤해
        // 보이게 한다(preventScroll을 주면 패널 내부 스크롤도 막혀버린다).
        target.focus();
        return true;
      }
      return false;
    };
    if (tryFocus(focusKey)) return;
    // 순서 카드가 맨 위/아래로 이동해 눌렀던 방향 버튼이 disabled가 되면
    // 같은 카드의 반대 방향 버튼으로 포커스를 이어 준다(연속 ↑↓ 조작 지원).
    const seqMatch = focusKey.match(/^seq-(up|down):(.+)$/);
    if (seqMatch) {
      const [, direction, cardId] = seqMatch;
      const altDirection = direction === 'up' ? 'down' : 'up';
      tryFocus(`seq-${altDirection}:${cardId}`);
    }
  },

  render() {
    const panel = document.getElementById('mn-inquiry-panel');
    if (!panel || !this.task || !this.state) return;
    const focusKey = this.captureFocusKey(panel);
    panel.replaceChildren();

    const heading = this.element('h3', 'inquiry-heading', this.task.prompt || '자료를 살펴보고 판단하세요.');
    panel.appendChild(heading);

    panel.appendChild(this.renderEvidenceInventory());

    if (this.task.type === 'commit-revise') this.renderCommitRevise(panel);
    else if (this.task.type === 'sequence') this.renderSequence(panel);
    else if (this.task.type === 'map-evidence') this.renderMapEvidence(panel);
    else if (this.task.type === 'claim-evidence') this.renderClaimEvidence(panel);
    else panel.appendChild(this.element('p', 'inquiry-error', '지원하지 않는 탐구 활동입니다.'));

    this.restoreFocus(panel, focusKey);
  },

  // 이번 탐구 내내 모은 근거를 "몇 장"이 아니라 "무엇인지" 항상 볼 수 있게 한다.
  // 접기/펼치기(<details>)로 세로 공간은 기본 늘리지 않으면서, 펼치면 라벨을
  // 그대로 보여 준다. 라벨은 데이터(awards[].label)에서만 오고 코드에 문구를
  // 박지 않는다(D-029).
  renderEvidenceInventory() {
    const evidence = this.engine?.inquiryRunState?.evidence || [];
    const inventory = this.element('details', 'inquiry-evidence-inventory');
    inventory.open = Boolean(this.inventoryOpen);
    inventory.addEventListener('toggle', () => { this.inventoryOpen = inventory.open; });

    const summary = document.createElement('summary');
    summary.textContent = `이번 탐구에서 모은 근거 ${evidence.length}장`;
    inventory.appendChild(summary);

    if (evidence.length) {
      const chips = this.element('ul', 'inquiry-evidence-chips');
      evidence.forEach(item => {
        chips.appendChild(this.element('li', 'inquiry-evidence-chip', item.label));
      });
      inventory.appendChild(chips);
    } else {
      inventory.appendChild(this.element('p', 'inquiry-evidence-chip-empty', '아직 모은 근거가 없습니다.'));
    }
    return inventory;
  },

  renderSection(panel, title) {
    const section = this.element('section', 'inquiry-section');
    section.appendChild(this.element('h4', 'inquiry-section-title', title));
    panel.appendChild(section);
    return section;
  },

  renderChoiceGroup(section, items, selectedId, onSelect, disabled = false, groupKey = 'choice') {
    const group = this.element('div', 'inquiry-options');
    group.setAttribute('role', 'group');
    items.forEach(item => {
      const selected = item.id === selectedId;
      const button = this.button(item.label, {
        className: `inquiry-option${selected ? ' is-selected' : ''}`,
        disabled,
        pressed: selected,
        focusKey: `${groupKey}:${item.id}`,
        onClick: () => onSelect(item)
      });
      group.appendChild(button);
    });
    section.appendChild(group);
  },

  renderCommitRevise(panel) {
    const options = this.task.options || [];
    const evidence = this.task.evidence || [];
    const required = this.task.requiredEvidenceIds || evidence.map(item => item.id);
    const evidenceReady = required.every(id => this.state.viewedEvidence.includes(id));

    const initial = this.renderSection(panel, '1. 먼저 생각을 정하세요');
    this.renderChoiceGroup(initial, options, this.state.initialChoice, item => {
      this.state.initialChoice = item.id;
      this.setFeedback('첫 판단을 정했습니다. 이제 자료를 확인하세요.');
      this.render();
    }, false, 'initial');

    const evidenceSection = this.renderSection(panel, '2. 근거 자료를 확인하세요');
    const evidenceGrid = this.element('div', 'inquiry-evidence-grid');
    evidence.forEach(item => {
      const viewed = this.state.viewedEvidence.includes(item.id);
      evidenceGrid.appendChild(this.button(`${viewed ? '✓ ' : ''}${item.label}`, {
        className: `inquiry-evidence${viewed ? ' is-viewed' : ''}`,
        disabled: !this.state.initialChoice,
        pressed: viewed,
        focusKey: `evidence:${item.id}`,
        onClick: () => {
          if (!viewed) this.state.viewedEvidence.push(item.id);
          this.state.lastEvidenceId = item.id;
          this.render();
          this.setFeedback(`${item.label}: ${item.detail}`);
        }
      }));
    });
    evidenceSection.appendChild(evidenceGrid);
    const lastEvidence = evidence.find(item => item.id === this.state.lastEvidenceId);
    if (lastEvidence) evidenceSection.appendChild(this.element('p', 'inquiry-evidence-detail', lastEvidence.detail));

    const final = this.renderSection(panel, '3. 자료를 보고 최종 판단을 정하세요');
    this.renderChoiceGroup(final, options, this.state.finalChoice, item => {
      this.state.finalChoice = item.id;
      this.render();
    }, !evidenceReady, 'final');
    final.appendChild(this.submitButton(!evidenceReady || !this.state.finalChoice));
  },

  renderSequence(panel) {
    const cardsById = new Map((this.task.cards || []).map(card => [card.id, card]));
    const section = this.renderSection(panel, '1. 과정 카드를 순서대로 놓으세요');
    const list = this.element('ol', 'inquiry-sequence-list');
    this.state.order.forEach((id, index) => {
      const card = cardsById.get(id);
      if (!card) return;
      const row = this.element('li', 'inquiry-sequence-card');
      const copy = this.element('div', 'inquiry-sequence-copy');
      copy.appendChild(this.element('strong', '', card.label));
      copy.appendChild(this.element('span', '', card.detail));
      row.appendChild(copy);
      const controls = this.element('div', 'inquiry-sequence-controls');
      controls.appendChild(this.button('↑', {
        className: 'inquiry-move',
        disabled: index === 0,
        label: `${card.label} 카드를 앞으로 이동`,
        focusKey: `seq-up:${card.id}`,
        onClick: () => this.moveSequenceCard(index, index - 1)
      }));
      controls.appendChild(this.button('↓', {
        className: 'inquiry-move',
        disabled: index === this.state.order.length - 1,
        label: `${card.label} 카드를 뒤로 이동`,
        focusKey: `seq-down:${card.id}`,
        onClick: () => this.moveSequenceCard(index, index + 1)
      }));
      row.appendChild(controls);
      list.appendChild(row);
    });
    section.appendChild(list);

    const meaning = this.task.meaningQuestion || {};
    const meaningSection = this.renderSection(panel, `2. ${meaning.prompt || '이 과정의 의미를 고르세요.'}`);
    this.renderChoiceGroup(meaningSection, meaning.options || [], this.state.meaningChoice, item => {
      this.state.meaningChoice = item.id;
      this.render();
    }, false, 'meaning');
    meaningSection.appendChild(this.submitButton(!this.state.meaningChoice));
  },

  moveSequenceCard(from, to) {
    if (to < 0 || to >= this.state.order.length) return;
    const order = [...this.state.order];
    [order[from], order[to]] = [order[to], order[from]];
    this.state.order = order;
    this.render();
  },

  renderMapEvidence(panel) {
    const labels = this.task.labels || {};
    const locationSection = this.renderSection(panel, labels.location || '1. 자료와 연결되는 장소를 고르세요');
    this.renderChoiceGroup(locationSection, this.task.locations || [], this.state.locationId, item => {
      this.selectMapLocation(item.id);
    }, false, 'location');

    const supportSection = this.renderSection(panel, labels.support || '2. 이 주장을 뒷받침하는 근거를 고르세요');
    this.renderChoiceGroup(supportSection, this.task.supports || [], this.state.supportId, item => {
      this.state.supportId = item.id;
      this.render();
    }, false, 'support');

    const limitSection = this.renderSection(panel, labels.limit || '3. 이 자료의 한계를 바르게 말한 문장을 고르세요');
    this.renderChoiceGroup(limitSection, this.task.limits || [], this.state.limitId, item => {
      this.state.limitId = item.id;
      this.render();
    }, false, 'map-limit');
    limitSection.appendChild(this.submitButton(!this.state.locationId || !this.state.supportId || !this.state.limitId));
  },

  selectMapLocation(locationId) {
    if (this.task?.type !== 'map-evidence' || this.state?.completed) return false;
    const location = (this.task.locations || []).find(item => item.id === locationId);
    if (!location) return false;
    this.state.locationId = locationId;
    if (this.engine?.simulatorState) {
      this.engine.simulatorState.found = [locationId];
      this.engine.simulatorState.lastId = locationId;
    }
    this.render();
    this.setFeedback(`${location.label}: ${location.detail || '선택한 장소를 근거와 연결해 보세요.'}`);
    if (window.MudSimulators) window.MudSimulators.drawSim();
    return true;
  },

  renderClaimEvidence(panel) {
    const claims = this.task.claims || [];
    const claimSection = this.renderSection(panel, '1. 완성할 주장을 고르세요');
    this.renderChoiceGroup(claimSection, claims, this.state.claimId, item => {
      this.state.claimId = item.id;
      this.state.selectedEvidence = [];
      this.render();
    }, false, 'claim');

    const allowed = new Set(this.task.allowedEvidenceIds || []);
    const evidence = (this.engine?.inquiryRunState?.evidence || [])
      .filter(item => allowed.has(item.id) && item.role !== 'limit');
    const maxEvidence = Number(this.task.maxEvidence || 3);
    const evidenceSection = this.renderSection(panel, `2. 근거를 ${this.task.minEvidence || 2}~${maxEvidence}장 연결하세요`);
    const grid = this.element('div', 'inquiry-evidence-grid');
    evidence.forEach(item => {
      const selected = this.state.selectedEvidence.includes(item.id);
      const atLimit = !selected && this.state.selectedEvidence.length >= maxEvidence;
      grid.appendChild(this.button(item.label, {
        className: `inquiry-evidence${selected ? ' is-selected' : ''}`,
        disabled: !this.state.claimId || atLimit,
        pressed: selected,
        focusKey: `evidence:${item.id}`,
        onClick: () => {
          this.state.selectedEvidence = selected
            ? this.state.selectedEvidence.filter(id => id !== item.id)
            : [...this.state.selectedEvidence, item.id];
          this.render();
        }
      }));
    });
    evidenceSection.appendChild(grid);

    const limitSection = this.renderSection(panel, '3. 선택 사항: 자료의 한계까지 살펴보세요');
    this.renderChoiceGroup(limitSection, this.task.limits || [], this.state.limitId, item => {
      this.state.limitId = this.state.limitId === item.id ? null : item.id;
      this.render();
    }, false, 'claim-limit');
    limitSection.appendChild(this.submitButton(!this.state.claimId || this.state.selectedEvidence.length < Number(this.task.minEvidence || 2)));
  },

  submitButton(disabled) {
    return this.button(this.state.completed ? '탐구 완료' : '판단 확인', {
      className: 'inquiry-submit',
      disabled,
      focusKey: 'submit',
      onClick: () => this.submit()
    });
  },

  submit() {
    if (!this.task || !this.state || this.state.completed) return;
    this.state.attempts += 1;
    const result = this.evaluateTask(this.task, this.state, this.engine?.inquiryRunState?.evidence || []);
    if (result.status !== 'complete') {
      const issueKey = result.issue || result.message || result.status;
      if (this.state.lastIssueKey === issueKey) this.state.issueRepeats += 1;
      else {
        this.state.lastIssueKey = issueKey;
        this.state.issueRepeats = 1;
      }
      if (!this.state.misconceptionFlags.includes(issueKey)) this.state.misconceptionFlags.push(issueKey);

      let message = result.message || '자료의 관계를 다시 살펴보세요.';
      if (this.state.issueRepeats >= 2) {
        this.state.hintsUsed += 1;
        message += ` 질문: ${this.repeatHint(this.task.type)}`;
      }
      this.setFeedback(message, { focus: true });
      if (window.sounds) window.sounds.playWrong();
      return;
    }

    this.state.completed = true;
    const accepted = this.engine?.acceptInquiryResult({
      ...result,
      attempts: this.state.attempts,
      revised: this.task.type === 'commit-revise'
        && this.state.initialChoice !== this.state.finalChoice,
      firstChoice: this.state.initialChoice || null,
      hintsUsed: this.state.hintsUsed,
      misconceptionFlags: [...this.state.misconceptionFlags],
      earnedEvidence: this.task.awards || []
    });
    this.render();
    this.setFeedback(result.message || '탐구 판단을 완성했습니다.');
    if (accepted && window.sounds) window.sounds.playFanfare();
  },

  evaluateTask(task, state, runEvidence = []) {
    if (!task || !state) return { status: 'incomplete', message: '탐구 정보를 불러오지 못했습니다.' };
    if (task.type === 'commit-revise') return this.evaluateCommitRevise(task, state);
    if (task.type === 'sequence') return this.evaluateSequence(task, state);
    if (task.type === 'map-evidence') return this.evaluateMapEvidence(task, state);
    if (task.type === 'claim-evidence') return this.evaluateClaimEvidence(task, state, runEvidence);
    return { status: 'incomplete', message: '지원하지 않는 탐구 유형입니다.' };
  },

  evaluateCommitRevise(task, state) {
    const required = task.requiredEvidenceIds || (task.evidence || []).map(item => item.id);
    if (!state.initialChoice || !required.every(id => state.viewedEvidence.includes(id)) || !state.finalChoice) {
      return { status: 'incomplete', issue: 'commit-incomplete', message: '첫 판단, 근거 확인, 최종 판단을 모두 마쳐야 합니다.' };
    }
    const selected = (task.options || []).find(item => item.id === state.finalChoice);
    if (!selected?.correct) {
      return { status: 'revise', issue: `commit-${state.finalChoice}`, message: selected?.feedback || '확인한 자료를 함께 놓고 다시 판단해 보세요.' };
    }
    return {
      status: 'complete',
      quality: state.initialChoice === state.finalChoice ? 'connector' : 'historian',
      message: state.initialChoice === state.finalChoice
        ? this.taskCompleteMessage('자료를 확인하고 판단을 정했습니다.')
        : (this.task?.reviseCompleteMessage || '새 근거를 보고 생각을 수정했습니다. 역사 탐구에서 중요한 과정입니다.')
    };
  },

  evaluateSequence(task, state) {
    const correctOrder = task.correctOrder || [];
    const mismatch = correctOrder.findIndex((id, index) => state.order[index] !== id);
    if (mismatch >= 0) {
      const expected = (task.cards || []).find(card => card.id === correctOrder[mismatch]);
      return {
        status: 'revise',
        issue: `sequence-${mismatch}`,
        message: expected?.orderFeedback || `${mismatch + 1}번째에는 ${expected?.label || '다른 과정'}이 와야 하는 이유를 살펴보세요.`
      };
    }
    const selectedMeaning = (task.meaningQuestion?.options || []).find(item => item.id === state.meaningChoice);
    if (!selectedMeaning?.correct) {
      return { status: 'revise', issue: `meaning-${state.meaningChoice}`, message: selectedMeaning?.feedback || '이 과정이 무엇을 보여 주는지 다시 생각해 보세요.' };
    }
    return { status: 'complete', quality: 'connector', message: this.taskCompleteMessage('과정의 순서와 그 의미를 연결했습니다.') };
  },

  evaluateMapEvidence(task, state) {
    const location = (task.locations || []).find(item => item.id === state.locationId);
    const support = (task.supports || []).find(item => item.id === state.supportId);
    const limit = (task.limits || []).find(item => item.id === state.limitId);
    if (!location || !support || !limit) {
      return { status: 'incomplete', issue: 'map-incomplete', message: '장소, 근거, 자료의 한계를 모두 선택하세요.' };
    }
    if (!location.correct) return { status: 'revise', issue: `location-${state.locationId}`, message: location.feedback || '이 자료와 연결되는 장소를 다시 살펴보세요.' };
    if (!support.correct) return { status: 'revise', issue: `support-${state.supportId}`, message: support.feedback || '주장을 직접 보여 주는 기록을 찾아보세요.' };
    if (!limit.correct) return { status: 'revise', issue: `map-limit-${state.limitId}`, message: limit.feedback || '이 자료가 보여 주는 범위를 생각해 보세요.' };
    return { status: 'complete', quality: 'historian', message: this.taskCompleteMessage('근거와 자료가 보여 주는 범위를 함께 구분했습니다.') };
  },

  evaluateClaimEvidence(task, state, runEvidence) {
    const claim = (task.claims || []).find(item => item.id === state.claimId);
    if (!claim) return { status: 'incomplete', issue: 'claim-missing', message: '먼저 완성할 주장을 고르세요.' };
    const selected = runEvidence.filter(item => state.selectedEvidence.includes(item.id));
    const allowed = new Set(claim.accepts || []);
    if (selected.some(item => !allowed.has(item.id))) {
      return { status: 'revise', issue: `claim-evidence-${state.claimId}`, message: '선택한 주장과 직접 연결되지 않는 자료가 있습니다.' };
    }
    const minEvidence = Number(task.minEvidence || 2);
    const maxEvidence = Number(task.maxEvidence || 3);
    if (selected.length < minEvidence || selected.length > maxEvidence) {
      return { status: 'revise', issue: 'claim-evidence-count', message: `근거를 ${minEvidence}~${maxEvidence}장 골라 연결하세요.` };
    }
    const selectedCategories = new Set(selected.map(item => item.category));
    if (selectedCategories.size < Number(claim.minCategories || 2)) {
      return { status: 'revise', issue: 'claim-category-variety', message: '서로 다른 성격의 자료를 연결해야 주장이 더 탄탄해집니다.' };
    }
    const missingCategory = (claim.requiredCategories || []).find(category => !selectedCategories.has(category));
    if (missingCategory) {
      return {
        status: 'revise',
        issue: `claim-required-category-${missingCategory}`,
        message: claim.requiredCategoriesFeedback || '주장이 말하는 내용 중 아직 근거로 뒷받침되지 않은 부분이 있습니다.'
      };
    }
    const limit = (task.limits || []).find(item => item.id === state.limitId);
    if (limit && !limit.correct) {
      return { status: 'revise', issue: `claim-limit-${state.limitId}`, message: limit.feedback || '자료 한계 설명을 다시 살펴보세요.' };
    }
    const quality = limit?.correct ? 'historian' : 'connector';
    return {
      status: 'complete',
      quality,
      message: quality === 'historian'
        ? '역사가 등급: 서로 다른 근거를 연결하고 자료의 한계까지 검토했습니다.'
        : '연결자 등급: 서로 다른 근거를 연결했습니다. 다음에는 자료의 한계도 붙여 보세요.'
    };
  },

  taskCompleteMessage(fallback) {
    // 관문마다 다른 문구는 데이터(task.completeMessage 또는 completion.successText)가 갖는다.
    // 코드의 fallback은 어떤 시대에 붙어도 어색하지 않은 중립 문장이어야 한다.
    const successText = this.engine?.currentSimulator?.completion?.successText;
    return this.task?.completeMessage || successText || fallback;
  },

  repeatHint(taskType) {
    const hints = {
      'commit-revise': '두 자료 중 지금 설명에 빠진 조건은 무엇인가요?',
      sequence: '각 카드가 바로 앞 단계 없이 실행될 수 있는지 하나씩 확인해 보세요.',
      'map-evidence': '선택한 기록이 그 장소와 주장을 직접 보여 주는지, 어디까지 말할 수 있는지 나눠 보세요.',
      'claim-evidence': '각 근거가 선택한 주장을 직접 받치는지, 서로 다른 종류의 자료인지 확인해 보세요.'
    };
    return hints[taskType] || '선택한 자료가 질문의 어느 부분을 직접 뒷받침하는지 확인해 보세요.';
  },

  setFeedback(message, options = {}) {
    const feedback = document.getElementById('mn-canvas-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    if (options.focus && typeof feedback.focus === 'function') {
      feedback.setAttribute('tabindex', '-1');
      feedback.focus({ preventScroll: false });
    }
  }
};

window.MudInquiry = MudInquiry;
