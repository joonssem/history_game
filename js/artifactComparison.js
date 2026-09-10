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

  // artifacts.json의 자유 텍스트 "era" 값을 큰 단위(선사~근현대) 묶음으로
  // 뭉뚱그린다. 2026-09-10: 방금 끝낸 MUD의 시대와 비교 페어의 시대가
  // 맞는지 판정하는 데 쓴다(getEligibleComparison 참고).
  getEraGroup(rawEra) {
    if (!rawEra) return null;
    if (/구석기|신석기|청동기|고조선|선사/.test(rawEra)) return 'prehistoric_ancient';
    if (/삼국|통일신라|남북국/.test(rawEra)) return 'three_kingdoms';
    if (/고려/.test(rawEra)) return 'goryeo';
    if (/조선/.test(rawEra)) return 'joseon';
    if (/개항기|일제|현대|근현대/.test(rawEra)) return 'modern';
    return null;
  },

  // 아직 보지 않았고, 해당 시대를 실제로 다룬 MUD의 보상 유물을 갖고 있는
  // 첫 비교 콘텐츠를 찾는다.
  // 2026-09-09: 예전엔 "해금 유물 총 개수 >= 임계값"만 봤는데, 학생이
  // 차시를 순서대로 하지 않으면(예: 근현대 MUD를 먼저 클리어) 무관한
  // 시대의 페어가 튀어나오는 문제가 있었다. requiredArtifactNames에
  // 적힌 "그 시대 MUD가 실제로 준 유물"을 갖고 있는지로 직접 판정한다.
  // 2026-09-10 추가: 그것만으로는 부족했다 — 도감은 누적이라, 예전에
  // 삼국시대 MUD를 끝내 유물을 이미 갖고 있으면 그 뒤로 전혀 다른 시대
  // (예: 3·1 운동, 정부 수립) MUD를 끝낼 때마다 계속 튀어나왔다.
  // 이제 "방금 끝낸 MUD의 시대(currentEraGroup)"도 함께 넘겨받아,
  // 그 시대와 무관한 페어는 아예 후보에서 제외한다. currentEraGroup을
  // 알 수 없으면(보상 유물이 없는 특수 엔딩 등) 아무 것도 제안하지 않는다
  // — 틀린 시대를 보여주는 것보다 아예 안 보여주는 편이 낫다.
  getEligibleComparison(currentEraGroup) {
    if (!window.encyclopedia || !this.comparisons.length) return null;
    if (!currentEraGroup) return null;
    const unlocked = window.encyclopedia.data.unlockedArtifacts;
    if (unlocked.length < 2) return null;
    return this.comparisons.find(cmp => {
      if (cmp.eraGroup && cmp.eraGroup !== currentEraGroup) return false;
      if (window.encyclopedia.hasSeenArtifactComparison(cmp.id)) return false;
      const required = cmp.requiredArtifactNames;
      if (required && required.length > 0) {
        return required.some(name => unlocked.includes(name));
      }
      // 안전장치: requiredArtifactNames가 없는 콘텐츠는 예전 방식(개수)로 대체한다.
      return unlocked.length >= (cmp.unlockThreshold || 2);
    }) || null;
  },

  // renderFinalReflection() 마지막에 이어 붙일 제안 카드 HTML.
  // currentEraGroup: 방금 끝낸 MUD의 시대 묶음(getEraGroup 결과). 없으면 미제안.
  // 조건을 만족하는 비교 콘텐츠가 없으면 빈 문자열을 반환한다.
  getOfferHtml(currentEraGroup) {
    const cmp = this.getEligibleComparison(currentEraGroup);
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

  // 2026-09-10 추가(트랙 2 · 대조실 P1): 도감에서 학생이 직접 시작할 수
  // 있는 진입점용. MUD 클리어 직후 제안(getEligibleComparison)과 달리
  // "방금 끝낸 MUD의 시대"라는 맥락이 없으므로 시대 필터를 걸지 않고,
  // 아직 안 본 것 중 마커 조건을 만족하는 비교를 전부 돌려준다(선택은
  // 학생 몫). seenArtifactComparisons 상태는 MUD 경로와 완전히 공유한다
  // — 별도 상태를 만들지 않는다.
  getAllEligibleComparisons() {
    if (!window.encyclopedia || !this.comparisons.length) return [];
    const unlocked = window.encyclopedia.data.unlockedArtifacts;
    if (unlocked.length < 2) return [];
    return this.comparisons.filter(cmp => {
      if (window.encyclopedia.hasSeenArtifactComparison(cmp.id)) return false;
      const required = cmp.requiredArtifactNames;
      if (required && required.length > 0) {
        return required.some(name => unlocked.includes(name));
      }
      return unlocked.length >= (cmp.unlockThreshold || 2);
    });
  },

  // 도감 화면(encyclopedia.js `renderEncyclopedia`)에 삽입할 "대조실 입장"
  // 섹션 HTML. 시작할 수 있는 게 하나도 없으면 빈 문자열(섹션 자체를 숨김).
  encyclopediaEntryHtml() {
    const list = this.getAllEligibleComparisons();
    if (!list.length) return '';
    const typeLabel = { artifact_vs_artifact: '유물 vs 유물', site_vs_site: '유적 vs 유적', artifact_vs_site: '유물 ↔ 유적' };
    const cardsHtml = list.map(cmp => `
      <div style="background:#1E1B1A; border:1px solid #443C37; border-radius:10px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
        <div>
          <span style="font-size:0.68rem; font-weight:700; color:${this.themeColor}; background:${this.themeColor}22; padding:2px 8px; border-radius:10px;">${typeLabel[cmp.pairType] || typeLabel.artifact_vs_artifact}</span>
          <div style="font-size:0.92rem; font-weight:700; color:#F7E7CE; margin-top:4px;">${cmp.artifactA.icon} ${cmp.title} ${cmp.artifactB.icon}</div>
        </div>
        <button onclick="ArtifactComparisonEngine.startFromEncyclopedia('${cmp.id}')" class="btn" style="width:auto; background:${this.themeColor}; font-size:0.82rem; padding:8px 14px;">
          시작하기
        </button>
      </div>
    `).join('');
    return `
      <h4 style="font-family: 'SchoolSafetyNotification', sans-serif; font-size: 1.15rem; color: var(--text-main); margin: 24px 0 10px;">
        🏛️ 대조실 — 지금 바로 비교해 보기
      </h4>
      <p style="font-size:0.8rem; color:#887E75; margin: 0 0 10px;">모은 유물·유적 중 아직 안 해 본 대조가 ${list.length}개 있어요. 원할 때 바로 시작할 수 있습니다.</p>
      <div style="margin-bottom: 20px;">${cardsHtml}</div>
    `;
  },

  // 도감 모달 안 "시작하기" 버튼용. 모달을 닫고 MUD 시뮬레이터 뷰로 전환한
  // 뒤(그 뷰의 mn-story-content/mn-choices-grid를 그대로 재사용) 활동을
  // 시작한다. MudEngine.currentMudData는 건드리지 않는다 — 결과 화면의
  // "돌아가기"는 showPortalView()만 호출하므로 의존성이 없다.
  startFromEncyclopedia(comparisonId) {
    if (typeof closeEncyclopediaModal === 'function') closeEncyclopediaModal();
    const portal = document.getElementById('view-portal');
    const sim = document.getElementById('view-myeongnyang');
    if (portal) portal.style.display = 'none';
    if (sim) sim.style.display = 'block';
    this.start(comparisonId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // 2026-09-10 추가(트랙 2 · 대조실): artifactA/artifactB가 유물이 아니라
  // "유적 그 자체"를 비교 대상으로 삼을 때는 kind: 'site'를 갖는다(museumId/
  // museumUrl 필드는 그대로 재사용하되 국가유산포털 사적번호·링크를 담는다).
  // 출처 표기 문구만 유물/유적에 맞게 갈라 준다 — 기존 9개(kind 없음)는
  // 그대로 "국립중앙박물관 소장품 · 실물 보기"로 표시된다.
  sourceEntryMeta(art) {
    if (art.kind === 'site') {
      return { label: '국가유산청 국가유산포털', linkText: '유적 보기' };
    }
    return { label: '국립중앙박물관 소장품', linkText: '실물 보기' };
  },

  sourceLineHtml(cmp) {
    const a = this.sourceEntryMeta(cmp.artifactA);
    const b = this.sourceEntryMeta(cmp.artifactB);
    return `
      <p style="font-size: 0.75rem; color: #9CA3AF; margin: 10px 0 14px;">
        출처: ${a.label} 「${cmp.artifactA.name}」(${cmp.artifactA.museumId}), ${b.label} 「${cmp.artifactB.name}」(${cmp.artifactB.museumId}) ·
        <a href="${cmp.artifactA.museumUrl}" target="_blank" rel="noopener">${a.linkText} A</a> ·
        <a href="${cmp.artifactB.museumUrl}" target="_blank" rel="noopener">${b.linkText} B</a>
      </p>
    `;
  },

  // 2026-09-10 추가: 유물이 실제로 발견된 유적(장소) 링크.
  // artifactA/artifactB의 "site" 필드(국가유산포털 등 공식 출처, 사진 확인됨)가
  // 있을 때만 노출한다. 같은 유적이 양쪽에 겹치면(예: 신라 금관을 두 페어가
  // 공유) 한 번만 보여준다. 출토지를 모르는 전세품 유물(청자·백자·풍속화 등)은
  // site 필드 자체가 없으므로 빈 문자열을 반환 — 없는 정보를 지어내지 않는다.
  siteLinksHtml(cmp) {
    const sites = [cmp.artifactA.site, cmp.artifactB.site].filter(Boolean);
    if (!sites.length) return '';
    const seen = new Set();
    const unique = sites.filter(s => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });
    const links = unique.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join(' · ');
    return `
      <p style="font-size: 0.8rem; color: #4B5563; margin: 0 0 14px; background:#F5F3FF; border:1px solid #DDD6FE; border-radius:6px; padding:8px 10px;">
        🏛️ <b>이 유물이 발견된 유적</b>도 사진으로 볼 수 있어: ${links}
      </p>
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
        ${this.sourceLineHtml(cmp)}
        ${this.siteLinksHtml(cmp)}
        <button onclick="ArtifactComparisonEngine.finish()" class="btn secondary" style="width:100%; padding: 10px;">
          <i class="fas fa-arrow-left"></i> 전체 탐구 진도표로 돌아가기
        </button>
        ${window.FEEDBACK_FORM_URL ? `
        <a href="${window.FEEDBACK_FORM_URL}" target="_blank" rel="noopener" class="btn secondary" style="display:block; width: 100%; box-sizing: border-box; font-size: 0.85rem; padding: 8px; margin-top: 8px; text-align:center; text-decoration:none;">
          📮 오늘 활동 피드백 남기기 <i class="fas fa-external-link-alt" style="font-size:0.75em;"></i>
        </a>` : ''}
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
