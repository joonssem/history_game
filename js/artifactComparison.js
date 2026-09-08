// =========================================================
// js/artifactComparison.js - 유물 2개 기반 역사적 추론 보너스 스테이지
// EXP-002 / BACKLOG P2 프로토타입: MUD 클리어 직후 해금 유물이
// 2개 이상이면 짧은 관찰→근거→주장→비교 활동을 제안한다.
// 서버 없음, localStorage(encyclopedia)만 사용.
// =========================================================

const ArtifactComparisonEngine = {
  comparisons: [],
  themeColor: '#7C3AED',

  // 진행 중 상태 (한 번에 하나의 비교만 진행)
  state: {
    comparison: null,
    selectedObservationId: null,
    selectedEvidenceIds: new Set(),
    blankAnswers: {}
  },

  async loadData() {
    try {
      const res = await fetch('data/artifactComparisons.json', { cache: 'no-store' });
      this.comparisons = await res.json();
    } catch (e) {
      console.error('Failed to load artifactComparisons.json', e);
      this.comparisons = [];
    }
  },

  // 아직 보지 않았고 해금 유물 수 조건을 만족하는 첫 비교 콘텐츠를 찾는다.
  getEligibleComparison() {
    if (!window.encyclopedia || !this.comparisons.length) return null;
    const unlockedCount = window.encyclopedia.data.unlockedArtifacts.length;
    return this.comparisons.find(cmp =>
      unlockedCount >= (cmp.unlockThreshold || 2) &&
      !window.encyclopedia.hasSeenArtifactComparison(cmp.id)
    ) || null;
  },

  // renderFinalReflection() 마지막에 이어 붙일 제안 카드 HTML.
  // 조건을 만족하는 비교 콘텐츠가 없으면 빈 문자열을 반환한다.
  getOfferHtml() {
    const cmp = this.getEligibleComparison();
    if (!cmp) return '';
    return `
      <div class="mission-box" style="text-align: center; border: 2px dashed ${this.themeColor}; background: ${this.themeColor}10; margin-top: 14px;">
        <div style="font-size: 0.85rem; font-weight: 700; color: ${this.themeColor}; margin-bottom: 6px;">🔍 새로운 도전 (선택)</div>
        <h4 style="font-size: 1.05rem; color: ${this.themeColor}; margin: 0 0 6px;">${cmp.title}</h4>
        <p style="font-size: 0.85rem; color: #4B5563; line-height: 1.5; margin: 0 0 10px;">
          지금까지 모은 유물 중 2개를 비교하며 "왜 다를까?"를 추론해 보는 1분짜리 활동이야.
        </p>
        <button onclick="ArtifactComparisonEngine.start('${cmp.id}')" class="btn" style="width: 100%; background: ${this.themeColor}; font-size: 0.9rem; padding: 10px; margin-bottom: 6px;">
          🧐 유물 비교 탐구 시작하기
        </button>
        <button onclick="ArtifactComparisonEngine.skip('${cmp.id}')" class="btn secondary" style="width: 100%; font-size: 0.8rem; padding: 8px;">
          다음에 할게요 (건너뛰기)
        </button>
      </div>
    `;
  },

  skip(comparisonId) {
    if (window.encyclopedia) window.encyclopedia.markArtifactComparisonSeen(comparisonId);
    // 건너뛰기 버튼은 최종 회고 화면 안에 있으므로 화면은 그대로 둔다.
    const offerBox = document.getElementById('artifact-comparison-offer');
    if (offerBox) offerBox.remove();
  },

  start(comparisonId) {
    const cmp = this.comparisons.find(c => c.id === comparisonId);
    if (!cmp) return;
    this.state = {
      comparison: cmp,
      selectedObservationId: null,
      selectedEvidenceIds: new Set(),
      blankAnswers: {}
    };
    this.renderObservationStep();
  },

  // 공통: 스텝 헤더 + 스킵 버튼
  stepShellHtml(stepLabel, bodyHtml) {
    return `
      <div class="mission-box" style="border: 2px solid ${this.themeColor}; background: ${this.themeColor}0D;">
        <div style="display:flex; justify-content: space-between; align-items:center; margin-bottom: 10px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: ${this.themeColor}; background: ${this.themeColor}20; padding: 3px 8px; border-radius: 4px;">${stepLabel}</span>
          <button onclick="ArtifactComparisonEngine.exitToReflection()" style="background:none; border:none; color:#9CA3AF; font-size:0.78rem; cursor:pointer; text-decoration: underline;">
            건너뛰고 돌아가기
          </button>
        </div>
        ${bodyHtml}
      </div>
    `;
  },

  artifactPairSummaryHtml() {
    const { artifactA, artifactB } = this.state.comparison;
    return `
      <div style="display:flex; gap: 10px; margin-bottom: 14px;">
        ${[artifactA, artifactB].map(art => `
          <div style="flex:1; background:#FFFFFF; border:1px solid var(--border-color); border-radius: 8px; padding: 10px; text-align:center;">
            <div style="font-size: 2rem;">${art.icon}</div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">${art.name}</div>
            <div style="font-size: 0.75rem; color: #6B7280;">${art.era} · ${art.location}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderObservationStep() {
    const cmp = this.state.comparison;
    const optionsHtml = cmp.observation.options.map(opt => `
      <button onclick="ArtifactComparisonEngine.selectObservation('${opt.id}')" class="btn secondary" style="width:100%; text-align:left; margin-bottom: 6px; font-size: 0.88rem; padding: 10px 12px;">
        ${opt.text}
      </button>
    `).join('');

    const content = document.getElementById('mn-story-content');
    const grid = document.getElementById('mn-choices-grid');
    if (grid) grid.innerHTML = '';
    if (content) {
      content.innerHTML = this.stepShellHtml('1단계 · 관찰', `
        ${this.artifactPairSummaryHtml()}
        <p style="font-size: 0.92rem; color: var(--text-main); margin-bottom: 10px;">${cmp.observation.prompt}</p>
        ${optionsHtml}
      `);
    }
  },

  selectObservation(optionId) {
    this.state.selectedObservationId = optionId;
    this.renderEvidenceStep();
  },

  renderEvidenceStep() {
    const cmp = this.state.comparison;
    const cardsHtml = cmp.evidenceCards.map(card => {
      const selected = this.state.selectedEvidenceIds.has(card.id);
      return `
        <button
          onclick="ArtifactComparisonEngine.toggleEvidence('${card.id}')"
          class="btn secondary"
          data-evidence-id="${card.id}"
          style="width:100%; text-align:left; margin-bottom: 6px; font-size: 0.85rem; padding: 10px 12px;
            ${selected ? `background:${this.themeColor}; color:#fff; border-color:${this.themeColor};` : ''}">
          ${selected ? '✅ ' : '⬜ '}${card.text}
        </button>
      `;
    }).join('');

    const content = document.getElementById('mn-story-content');
    if (content) {
      content.innerHTML = this.stepShellHtml('2단계 · 근거 카드 고르기', `
        <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 10px;">${cmp.evidencePrompt}</p>
        <div id="evidence-cards-wrap">${cardsHtml}</div>
        <button onclick="ArtifactComparisonEngine.confirmEvidence()" class="btn" style="width:100%; background:${this.themeColor}; margin-top: 6px; padding: 10px;">
          다음 (근거 선택 완료)
        </button>
      `);
    }
  },

  toggleEvidence(cardId) {
    const set = this.state.selectedEvidenceIds;
    if (set.has(cardId)) set.delete(cardId); else set.add(cardId);
    this.renderEvidenceStep();
  },

  confirmEvidence() {
    if (this.state.selectedEvidenceIds.size === 0) {
      alert('근거 카드를 1개 이상 골라 줘!');
      return;
    }
    this.renderClaimStep();
  },

  renderClaimStep() {
    const cmp = this.state.comparison;
    const blank1Options = cmp.claim.blanks[0].options.map(opt =>
      `<option value="${opt}">${opt}</option>`
    ).join('');
    const blank2Options = cmp.claim.blanks[1].options.map(opt =>
      `<option value="${opt}">${opt}</option>`
    ).join('');

    const content = document.getElementById('mn-story-content');
    if (content) {
      content.innerHTML = this.stepShellHtml('3단계 · 주장 문장 완성', `
        <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 12px;">
          빈칸에 알맞은 말을 골라 문장을 완성해 봐.
        </p>
        <div style="background:#FFFFFF; border:1px solid var(--border-color); border-radius: 8px; padding: 14px; font-size: 0.95rem; line-height: 2; color: var(--text-main);">
          ${cmp.claim.prefix}
          <select id="claim-blank1" style="font-weight:700; color:${this.themeColor}; border:1px solid ${this.themeColor}; border-radius: 4px; padding: 2px 4px;">
            <option value="">(선택)</option>
            ${blank1Options}
          </select>
          ${cmp.claim.middle}
          <select id="claim-blank2" style="font-weight:700; color:${this.themeColor}; border:1px solid ${this.themeColor}; border-radius: 4px; padding: 2px 4px;">
            <option value="">(선택)</option>
            ${blank2Options}
          </select>
          ${cmp.claim.suffix}
        </div>
        <button onclick="ArtifactComparisonEngine.confirmClaim()" class="btn" style="width:100%; background:${this.themeColor}; margin-top: 12px; padding: 10px;">
          결과 보기
        </button>
      `);
    }
  },

  confirmClaim() {
    const blank1 = document.getElementById('claim-blank1');
    const blank2 = document.getElementById('claim-blank2');
    const v1 = blank1 ? blank1.value : '';
    const v2 = blank2 ? blank2.value : '';
    if (!v1 || !v2) {
      alert('빈칸을 모두 채워 줘!');
      return;
    }
    this.state.blankAnswers = { blank1: v1, blank2: v2 };
    this.renderResultStep();
  },

  renderResultStep() {
    const cmp = this.state.comparison;
    const { selectedObservationId, selectedEvidenceIds, blankAnswers } = this.state;

    const observationText = (cmp.observation.options.find(o => o.id === selectedObservationId) || {}).text || '';
    const validSelected = cmp.evidenceCards.filter(c => c.valid && selectedEvidenceIds.has(c.id)).length;
    const invalidSelected = cmp.evidenceCards.filter(c => !c.valid && selectedEvidenceIds.has(c.id)).length;
    const blanksCorrect =
      blankAnswers.blank1 === cmp.claim.blanks[0].answer &&
      blankAnswers.blank2 === cmp.claim.blanks[1].answer;

    // "정답/오답"이 아니라 학계 관점과 학생 생각이 얼마나 가까운지로 톤만 분기한다.
    const isClose = blanksCorrect && validSelected >= 2 && invalidSelected === 0;

    const studentSummary = `
      "${observationText}"에 주목했고, 근거로 ${validSelected + invalidSelected}개 카드를 골랐으며,
      "${cmp.claim.prefix} <b>${blankAnswers.blank1}</b> ${cmp.claim.middle} <b>${blankAnswers.blank2}</b> ${cmp.claim.suffix}"라고 정리했구나.
    `;

    const toneBoxHtml = isClose ? `
      <div style="background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border: 2px solid #10B981; border-radius: 8px; padding: 14px; margin: 12px 0; text-align:left;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #047857; margin-bottom: 6px;">👏 학계 관점과 가까운 생각이야</div>
        <p style="font-size: 0.88rem; color: #065F46; line-height: 1.6; margin:0;">${cmp.scholarPerspective}</p>
      </div>
    ` : `
      <div style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border: 2px solid #3B82F6; border-radius: 8px; padding: 14px; margin: 12px 0; text-align:left;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #1D4ED8; margin-bottom: 6px;">💡 학자들은 이렇게 봐</div>
        <p style="font-size: 0.88rem; color: #1E3A8A; line-height: 1.6; margin:0;">${cmp.scholarPerspective}</p>
      </div>
    `;

    const content = document.getElementById('mn-story-content');
    if (content) {
      content.innerHTML = this.stepShellHtml('4단계 · 결과 비교', `
        ${this.artifactPairSummaryHtml()}
        <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; margin-bottom: 4px;">
          네 생각은 ${studentSummary}
        </p>
        ${toneBoxHtml}
        <p style="font-size: 0.75rem; color: #9CA3AF; margin: 10px 0 14px;">
          출처: 국립중앙박물관 소장품 「${cmp.artifactA.name}」(${cmp.artifactA.museumId}), 「${cmp.artifactB.name}」(${cmp.artifactB.museumId}) ·
          <a href="${cmp.artifactA.museumUrl}" target="_blank" rel="noopener">실물 보기 A</a> ·
          <a href="${cmp.artifactB.museumUrl}" target="_blank" rel="noopener">실물 보기 B</a>
        </p>
        <button onclick="ArtifactComparisonEngine.finish()" class="btn secondary" style="width:100%; padding: 10px;">
          <i class="fas fa-arrow-left"></i> 전체 탐구 진도표로 돌아가기
        </button>
      `);
    }
  },

  exitToReflection() {
    this.finish();
  },

  finish() {
    if (this.state.comparison && window.encyclopedia) {
      window.encyclopedia.markArtifactComparisonSeen(this.state.comparison.id);
    }
    this.state = {
      comparison: null,
      selectedObservationId: null,
      selectedEvidenceIds: new Set(),
      blankAnswers: {}
    };
    if (typeof showPortalView === 'function') showPortalView();
  }
};

window.ArtifactComparisonEngine = ArtifactComparisonEngine;
