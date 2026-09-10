/**
 * Mini-Games Engine
 * 1) 유물 카드 짝맞추기 게임 (Memory Match)
 * 2) 역사 연표 순서 맞추기 챌린지 (Timeline Sort)
 */
class MiniGameEngine {
  constructor() {
    this.artifacts = [];
    this.timelineStages = [];
    
    // 카드 매칭 상태
    this.cardDeck = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.cardMoves = 0;
    this.isCardLocked = false;

    // 연표 게임 상태
    this.currentStageIdx = 0;
    this.currentTimelineEvents = [];
    this.selectedTimelineItem = null;

    // 원인과 결과 순서 맞추기 상태
    this.causeEffectChains = [];
    this.currentCauseEffectStageIdx = 0;
    this.currentCauseEffectEvents = [];
    this.selectedCauseEffectItem = null;

    // 유물 탐정 상태 (2026-09-09 신규 — 학생이 실제로 해금한 유물만 출제)
    this.detectiveRounds = [];
    this.detectiveRoundIdx = 0;
    this.detectiveHintLevel = 1;
    this.detectiveResults = []; // 라운드별 { correct, hintLevelUsed }
    this.detectiveOptions = [];
  }

  async init() {
    try {
      const [artRes, timeRes, causeEffectRes] = await Promise.all([
        fetch('data/artifacts.json'),
        fetch('data/timeline.json'),
        fetch('data/causeEffectChains.json')
      ]);
      this.artifacts = await artRes.json();
      this.timelineStages = await timeRes.json();
      this.causeEffectChains = await causeEffectRes.json();
    } catch (e) {
      console.error('Failed to load mini-game data', e);
    }
  }

  // 2026-09-10: 4개 미니게임이 각자 독립된 컨테이너(#card-game-container 등)에
  // 렌더링되는데, 하나를 시작해도 다른 게임의 결과물이 DOM에 그대로 남아
  // 있었다 — 토글로 게임을 바꿔도 이전 게임판이 그 위/아래에 계속 쌓여
  // "확장 역사 활동" 영역이 불필요하게 길어지는 원인이었다. 새 게임을
  // 시작할 때마다 4개 컨테이너를 모두 비운 뒤 자신을 채우도록 한다.
  clearMiniGameContainers() {
    ['card-game-stats', 'card-game-container', 'timeline-game-container', 'cause-effect-game-container', 'detective-game-container']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
  }

  // ==========================================
  // 1. 유물 카드 짝맞추기 게임 (Memory Match)
  // 2026-09-10: 예전엔 artifacts.json의 앞 6개를 고정으로 보여줘서(해금 여부
  // 무관) 재플레이 가치가 없고 아직 못 얻은 유물이 스포일러로 노출됐다.
  // 유물 탐정(startDetectiveGame)과 같은 패턴으로, 그 학생이 실제로 해금한
  // 유물 풀에서만 뽑는다. 짝맞추기는 4지선다만큼 후보가 많이 필요하지
  // 않으므로(카드 자체가 정답을 보여줌), 최소 기준은 유물 탐정(4개)보다
  // 낮은 3개로 정했다 — 2쌍(4장)은 게임으로서 의미가 없지만 3쌍(6장)부터는
  // 최소한의 기억 게임이 성립한다. 해금 유물이 6개 미만이면 있는 만큼만
  // (3~5쌍)으로 진행하고, 6개 이상이면 매번 다른 6개를 무작위로 뽑는다.
  // ==========================================
  startCardGame() {
    if (window.sounds) window.sounds.playClick();
    this.clearMiniGameContainers();
    this.matchedPairs = 0;
    this.cardMoves = 0;
    this.flippedCards = [];
    this.isCardLocked = false;

    const container = document.getElementById('card-game-container');
    if (!container) return;

    const unlocked = (window.encyclopedia && window.encyclopedia.data.unlockedArtifacts) || [];
    const pool = this.artifacts.filter(art => unlocked.includes(art.name) || unlocked.includes(art.id));

    if (pool.length < 3) {
      document.getElementById('card-game-stats').innerHTML = '';
      container.innerHTML = `
        <div style="max-width: 520px; margin: 0 auto; padding: 16px; border-radius: 12px; background: #1F1B19; border: 1px solid #5A4E46; text-align: center; color: #C5BCB3; font-size: 0.85rem;">
          🎴 유물 카드 짝맞추기는 <strong style="color: #F0C987;">해금한 유물이 3개 이상</strong>일 때 도전할 수 있어요. MUD를 몇 개 더 클리어하고 다시 와 봐!
        </div>
      `;
      return;
    }

    const pairCount = Math.min(6, pool.length);
    const selectedArts = [...pool].sort(() => Math.random() - 0.5).slice(0, pairCount);
    const deck = [];

    selectedArts.forEach((art, index) => {
      deck.push({ id: `card_${index}_a`, pairId: index, name: art.name, icon: art.icon, era: art.era });
      deck.push({ id: `card_${index}_b`, pairId: index, name: art.name, icon: art.icon, era: art.era });
    });

    this.cardDeck = deck.sort(() => Math.random() - 0.5);

    this.updateCardGameStats();

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 10px; max-width: 520px; margin: 0 auto;">
        ${this.cardDeck
          .map(
            (card, i) => `
          <div class="card-flip-wrap" style="position: relative; height: 96px; cursor: pointer;" onclick="window.miniGames.flipCard(${i})">
            <div id="card-inner-${i}" class="card-flip-inner">
              <!-- 카드 뒷면 (가려진 상태) -->
              <div class="card-flip-face card-flip-back">
                <span style="font-size: 1.6rem;">🧭</span>
                <span style="font-size: 0.62rem; color: #F0C987; font-weight: 700; margin-top: 2px;">유물 발굴</span>
              </div>
              <!-- 카드 앞면 (공개된 상태) -->
              <div class="card-flip-face card-flip-front">
                <span style="font-size: 1.8rem; margin-bottom: 2px;">${card.icon}</span>
                <span style="font-size: 0.68rem; font-weight: 700; color: #F0C987; line-height: 1.2;">${card.name}</span>
                <span style="font-size: 0.6rem; color: #9B9088; margin-top: 2px;">${card.era}</span>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  flipCard(index) {
    if (this.isCardLocked) return;
    const inner = document.getElementById(`card-inner-${index}`);
    if (!inner || inner.classList.contains('flipped') || inner.classList.contains('matched')) return;

    if (window.sounds) window.sounds.playCardFlip();
    inner.classList.add('flipped');
    this.flippedCards.push({ index, card: this.cardDeck[index] });

    if (this.flippedCards.length === 2) {
      this.cardMoves++;
      this.updateCardGameStats();
      this.checkCardMatch();
    }
  }

  checkCardMatch() {
    this.isCardLocked = true;
    const [c1, c2] = this.flippedCards;

    if (c1.card.pairId === c2.card.pairId) {
      // 매칭 성공
      if (window.sounds) window.sounds.playCorrect();
      setTimeout(() => {
        document.getElementById(`card-inner-${c1.index}`).classList.add('matched');
        document.getElementById(`card-inner-${c2.index}`).classList.add('matched');
        this.matchedPairs++;
        this.flippedCards = [];
        this.isCardLocked = false;

        // 2026-09-10: 카드 풀이 이미 해금된 유물로만 구성되므로 여기서
        // 새로 unlockArtifact()를 호출할 필요가 없다(항상 no-op이었다).

        if (this.matchedPairs === this.cardDeck.length / 2) {
          this.completeCardGame();
        }
      }, 400);
    } else {
      // 매칭 실패
      if (window.sounds) window.sounds.playWrong();
      setTimeout(() => {
        document.getElementById(`card-inner-${c1.index}`).classList.remove('flipped');
        document.getElementById(`card-inner-${c2.index}`).classList.remove('flipped');
        this.flippedCards = [];
        this.isCardLocked = false;
      }, 900);
    }
  }

  updateCardGameStats() {
    const statsEl = document.getElementById('card-game-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 0.85rem; color: #C5BCB3; background: #1F1B19; padding: 8px 16px; border-radius: 10px; border: 1px solid #5A4E46; max-width: 520px; margin: 0 auto 14px;">
          <span>발굴한 유물: <strong style="color: #F0C987;">${this.matchedPairs} / ${this.cardDeck.length / 2}</strong></span>
          <span>시도 횟수: <strong style="color: #F0C987;">${this.cardMoves}</strong>회</span>
        </div>
      `;
    }
  }

  completeCardGame() {
    if (window.sounds) window.sounds.playFanfare();
    window.encyclopedia.unlockBadge('badge_card_master');
    const container = document.getElementById('card-game-container');
    if (container) {
      container.innerHTML += `
        <div style="margin-top: 20px; padding: 20px; border-radius: 14px; background: linear-gradient(135deg, rgba(183, 121, 31, 0.2), rgba(45, 106, 79, 0.2)); border: 2px solid #2D6A4F; text-align: center; max-width: 520px; margin-left: auto; margin-right: auto;">
          <h4 style="font-size: 1.05rem; font-weight: 900; color: #7FE0B0; margin-bottom: 6px;">🎉 모든 유물 발굴 완료!</h4>
          <p style="color: #E4DCD3; font-size: 0.82rem; margin-bottom: 12px;">총 ${this.cardMoves}번의 시도로 모든 유물을 찾았습니다. [유물 발굴 전문가] 배지를 획득했습니다!</p>
          <button onclick="window.miniGames.startCardGame()" class="btn" style="width: auto; padding: 8px 20px; background-color: #2D6A4F;">
            🔄 한 번 더 하기
          </button>
        </div>
      `;
    }
  }

  // ==========================================
  // 2. 역사 연표 순서 맞추기 챌린지 (Timeline Sort)
  // ==========================================
  startTimelineGame(stageIndex = 0) {
    if (window.sounds) window.sounds.playClick();
    this.clearMiniGameContainers();
    this.currentStageIdx = stageIndex;
    const stage = this.timelineStages[stageIndex] || this.timelineStages[0];
    
    // 원본 사건 리스트를 섞기
    this.currentTimelineEvents = [...stage.events].sort(() => Math.random() - 0.5);
    this.selectedTimelineItem = null;

    this.renderTimelineUI(stage);
  }

  renderTimelineUI(stage) {
    const container = document.getElementById('timeline-game-container');
    if (!container) return;

    container.innerHTML = `
      <div style="max-width: 820px; margin: 0 auto; background: #1F1B19; border: 1px solid #5A4E46; border-radius: 16px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #3D352E;">
          <div>
            <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 10px; background: rgba(183, 121, 31, 0.2); color: #F0C987; border-radius: 999px;">스테이지 ${stage.stage}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #F7E7CE; margin-top: 6px;">${stage.title}</h4>
          </div>
          <span style="font-size: 0.72rem; color: #9B9088;">카드를 눌러 위치를 교환하세요!</span>
        </div>

        <p style="color: #C5BCB3; font-size: 0.8rem; margin-bottom: 16px;">${stage.description}</p>

        <!-- 정렬 리스트: 가로 화면에서 세로 스크롤을 줄이기 위해 2열 그리드로 배치 -->
        <div id="timeline-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px; margin-bottom: 16px;">
          ${this.currentTimelineEvents
            .map(
              (evt, idx) => {
                const selected = this.selectedTimelineItem === idx;
                return `
            <div id="timeline-item-${idx}" onclick="window.miniGames.handleTimelineClick(${idx})" style="padding: 12px 14px; border-radius: 10px; background: ${selected ? 'rgba(183, 121, 31, 0.25)' : '#14110F'}; border: 1px solid ${selected ? '#B7791F' : '#3D352E'}; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="width: 26px; height: 26px; border-radius: 50%; background: #33302B; color: #C5BCB3; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; flex-shrink: 0;">${idx + 1}</span>
                <div>
                  <h5 style="font-size: 0.88rem; font-weight: 700; color: #F0EAE1;">${evt.title}</h5>
                  <span style="font-size: 0.7rem; color: #9B9088;">${evt.hint}</span>
                </div>
              </div>
              <div style="font-size: 0.68rem; font-weight: 700; color: #9B9088; background: #0F0D0B; padding: 3px 8px; border-radius: 8px; flex-shrink: 0;">
                위치 변경 ⇅
              </div>
            </div>
          `;
              }
            )
            .join('')}
        </div>

        <!-- 확인 버튼 -->
        <button onclick="window.miniGames.checkTimelineOrder()" class="btn" style="background-color: #B7791F;">
          ✅ 순서 정답 확인하기
        </button>

        <!-- 피드백 결과 -->
        <div id="timeline-feedback" style="display: none; margin-top: 12px;"></div>
      </div>
    `;
  }

  handleTimelineClick(index) {
    if (window.sounds) window.sounds.playClick();
    if (this.selectedTimelineItem === null) {
      this.selectedTimelineItem = index;
    } else if (this.selectedTimelineItem === index) {
      this.selectedTimelineItem = null;
    } else {
      // 스왑
      const temp = this.currentTimelineEvents[this.selectedTimelineItem];
      this.currentTimelineEvents[this.selectedTimelineItem] = this.currentTimelineEvents[index];
      this.currentTimelineEvents[index] = temp;
      this.selectedTimelineItem = null;
    }
    const stage = this.timelineStages[this.currentStageIdx];
    this.renderTimelineUI(stage);
  }

  checkTimelineOrder() {
    const stage = this.timelineStages[this.currentStageIdx];
    const correctOrder = stage.events.map(e => e.id);
    const userOrder = this.currentTimelineEvents.map(e => e.id);

    const isAllCorrect = correctOrder.every((id, i) => id === userOrder[i]);
    const fbEl = document.getElementById('timeline-feedback');
    if (!fbEl) return;

    fbEl.style.display = 'block';

    if (isAllCorrect) {
      if (window.sounds) window.sounds.playFanfare();
      window.encyclopedia.unlockBadge('badge_timeline_master');

      let nextButton = '';
      if (this.currentStageIdx + 1 < this.timelineStages.length) {
        nextButton = `
          <button onclick="window.miniGames.startTimelineGame(${this.currentStageIdx + 1})" style="margin-top: 10px; padding: 8px 18px; background: #0F0D0B; color: #F0C987; border-radius: 10px; border: 1px solid #3D352E; font-weight: 700; font-size: 0.8rem; cursor: pointer;">
            다음 스테이지로 ➔
          </button>
        `;
      }

      fbEl.style.cssText = 'display: block; margin-top: 16px; padding: 14px; border-radius: 12px; background: rgba(45, 106, 79, 0.25); border: 1px solid #2D6A4F; color: #B7E8CB; text-align: center;';
      fbEl.innerHTML = `
        <h4 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">🎉 완벽합니다! 올바른 연대순입니다!</h4>
        <p style="font-size: 0.76rem; color: #C5BCB3;">
          ${stage.events.map(e => `[${e.year}] ${e.title}`).join(' ➔ ')}
        </p>
        ${nextButton}
      `;
    } else {
      if (window.sounds) window.sounds.playWrong();
      fbEl.style.cssText = 'display: block; margin-top: 16px; padding: 14px; border-radius: 12px; background: rgba(138, 59, 41, 0.2); border: 1px solid #8A3B29; color: #F1B9A8; text-align: center;';
      fbEl.innerHTML = `
        <h4 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">💡 아직 순서가 맞지 않은 곳이 있어요!</h4>
        <p style="font-size: 0.76rem; color: #C5BCB3;">힌트를 다시 확인하고 카드를 눌러 순서를 교환해 보세요.</p>
      `;
    }
  }

  // ==========================================
  // 3. 원인과 결과 순서 맞추기 (Cause & Effect Order)
  // 연표 게임과 달리 카드에 연도를 넣지 않는다 — 연대 암기가 아니라
  // "이 일이 왜 일어났는가"라는 인과 논리로만 순서를 맞추게 하기 위함.
  // ==========================================
  startCauseEffectGame(stageIndex = 0) {
    if (window.sounds) window.sounds.playClick();
    this.clearMiniGameContainers();
    this.currentCauseEffectStageIdx = stageIndex;
    const stage = this.causeEffectChains[stageIndex] || this.causeEffectChains[0];

    // 원본 사건 리스트를 섞기
    this.currentCauseEffectEvents = [...stage.events].sort(() => Math.random() - 0.5);
    this.selectedCauseEffectItem = null;

    this.renderCauseEffectUI(stage);
  }

  renderCauseEffectUI(stage) {
    const container = document.getElementById('cause-effect-game-container');
    if (!container) return;

    container.innerHTML = `
      <div style="max-width: 820px; margin: 0 auto; background: #1F1B19; border: 1px solid #5A4E46; border-radius: 16px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #3D352E;">
          <div>
            <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 10px; background: rgba(183, 121, 31, 0.2); color: #F0C987; border-radius: 999px;">스테이지 ${stage.stage}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #F7E7CE; margin-top: 6px;">${stage.title}</h4>
          </div>
          <span style="font-size: 0.72rem; color: #9B9088;">카드를 눌러 위치를 교환하세요!</span>
        </div>

        <p style="color: #C5BCB3; font-size: 0.8rem; margin-bottom: 16px;">${stage.description}</p>

        <!-- 정렬 리스트: 가로 화면에서 세로 스크롤을 줄이기 위해 2열 그리드로 배치 -->
        <div id="cause-effect-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px; margin-bottom: 16px;">
          ${this.currentCauseEffectEvents
            .map(
              (evt, idx) => {
                const selected = this.selectedCauseEffectItem === idx;
                return `
            <div id="cause-effect-item-${idx}" onclick="window.miniGames.handleCauseEffectClick(${idx})" style="padding: 12px 14px; border-radius: 10px; background: ${selected ? 'rgba(183, 121, 31, 0.25)' : '#14110F'}; border: 1px solid ${selected ? '#B7791F' : '#3D352E'}; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="width: 26px; height: 26px; border-radius: 50%; background: #33302B; color: #C5BCB3; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; flex-shrink: 0;">${idx + 1}</span>
                <div>
                  <h5 style="font-size: 0.88rem; font-weight: 700; color: #F0EAE1;">${evt.title}</h5>
                  <span style="font-size: 0.7rem; color: #9B9088;">${evt.hint}</span>
                </div>
              </div>
              <div style="font-size: 0.68rem; font-weight: 700; color: #9B9088; background: #0F0D0B; padding: 3px 8px; border-radius: 8px; flex-shrink: 0;">
                위치 변경 ⇅
              </div>
            </div>
          `;
              }
            )
            .join('')}
        </div>

        <!-- 확인 버튼 -->
        <button onclick="window.miniGames.checkCauseEffectOrder()" class="btn" style="background-color: #B7791F;">
          ✅ 인과 순서 확인하기
        </button>

        <!-- 피드백 결과 -->
        <div id="cause-effect-feedback" style="display: none; margin-top: 12px;"></div>
      </div>
    `;
  }

  handleCauseEffectClick(index) {
    if (window.sounds) window.sounds.playClick();
    if (this.selectedCauseEffectItem === null) {
      this.selectedCauseEffectItem = index;
    } else if (this.selectedCauseEffectItem === index) {
      this.selectedCauseEffectItem = null;
    } else {
      // 스왑
      const temp = this.currentCauseEffectEvents[this.selectedCauseEffectItem];
      this.currentCauseEffectEvents[this.selectedCauseEffectItem] = this.currentCauseEffectEvents[index];
      this.currentCauseEffectEvents[index] = temp;
      this.selectedCauseEffectItem = null;
    }
    const stage = this.causeEffectChains[this.currentCauseEffectStageIdx];
    this.renderCauseEffectUI(stage);
  }

  checkCauseEffectOrder() {
    const stage = this.causeEffectChains[this.currentCauseEffectStageIdx];
    const correctOrder = stage.events.map(e => e.id);
    const userOrder = this.currentCauseEffectEvents.map(e => e.id);

    const isAllCorrect = correctOrder.every((id, i) => id === userOrder[i]);
    const fbEl = document.getElementById('cause-effect-feedback');
    if (!fbEl) return;

    fbEl.style.display = 'block';

    if (isAllCorrect) {
      if (window.sounds) window.sounds.playFanfare();
      window.encyclopedia.unlockBadge('badge_causality_master');

      let nextButton = '';
      if (this.currentCauseEffectStageIdx + 1 < this.causeEffectChains.length) {
        nextButton = `
          <button onclick="window.miniGames.startCauseEffectGame(${this.currentCauseEffectStageIdx + 1})" style="margin-top: 10px; padding: 8px 18px; background: #0F0D0B; color: #F0C987; border-radius: 10px; border: 1px solid #3D352E; font-weight: 700; font-size: 0.8rem; cursor: pointer;">
            다음 스테이지로 ➔
          </button>
        `;
      }

      fbEl.style.cssText = 'display: block; margin-top: 16px; padding: 14px; border-radius: 12px; background: rgba(45, 106, 79, 0.25); border: 1px solid #2D6A4F; color: #B7E8CB; text-align: center;';
      fbEl.innerHTML = `
        <h4 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">🎉 완벽합니다! 사건의 흐름이 논리적으로 이어집니다!</h4>
        <p style="font-size: 0.76rem; color: #C5BCB3;">
          ${stage.events.map(e => e.title).join(' ➔ ')}
        </p>
        <p style="font-size: 0.7rem; color: #9B9088; margin-top: 8px;">
          ※ 실제 역사는 이 다섯 사건만으로 전부 설명되지 않아요. 더 많은 사람과 상황이 함께 얽혀 있었답니다.
        </p>
        ${nextButton}
      `;
    } else {
      if (window.sounds) window.sounds.playWrong();
      fbEl.style.cssText = 'display: block; margin-top: 16px; padding: 14px; border-radius: 12px; background: rgba(138, 59, 41, 0.2); border: 1px solid #8A3B29; color: #F1B9A8; text-align: center;';
      fbEl.innerHTML = `
        <h4 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">💡 아직 인과 관계가 맞지 않은 곳이 있어요!</h4>
        <p style="font-size: 0.76rem; color: #C5BCB3;">이 사건이 왜 먼저(또는 나중에) 일어났을지 다시 생각하며 카드를 눌러 순서를 교환해 보세요.</p>
      `;
    }
  }

  // ==========================================
  // 4. 유물 탐정: 이게 뭘까? (2026-09-09 신규)
  // 고정 콘텐츠가 아니라 그 학생이 실제로 해금한 유물만 출제한다.
  // 힌트 3단계(시대 → 종류 → 설명)를 순서대로 공개하며 4지선다로 맞힌다.
  // "정답/오답" 채점형 미니게임이라 유물 비교 활동과는 톤이 다르지만,
  // 오답이어도 감점 없이 다음 힌트로 자연스럽게 이어지게 설계했다.
  // ==========================================
  startDetectiveGame() {
    if (window.sounds) window.sounds.playClick();
    this.clearMiniGameContainers();
    const container = document.getElementById('detective-game-container');
    if (!container) return;

    const unlocked = (window.encyclopedia && window.encyclopedia.data.unlockedArtifacts) || [];
    const pool = this.artifacts.filter(
      art => unlocked.includes(art.name) || unlocked.includes(art.id)
    );

    if (pool.length < 4) {
      container.innerHTML = `
        <div style="max-width: 520px; margin: 0 auto; padding: 16px; border-radius: 12px; background: #1F1B19; border: 1px solid #5A4E46; text-align: center; color: #C5BCB3; font-size: 0.85rem;">
          🕵️ 유물 탐정은 <strong style="color: #F0C987;">해금한 유물이 4개 이상</strong>일 때 도전할 수 있어요. MUD를 몇 개 더 클리어하고 다시 와 봐!
        </div>
      `;
      return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const roundCount = Math.min(5, shuffled.length);
    this.detectiveRounds = shuffled.slice(0, roundCount);
    this.detectivePool = pool;
    this.detectiveRoundIdx = 0;
    this.detectiveHintLevel = 1;
    this.detectiveResults = [];

    this.renderDetectiveRound();
  }

  buildDetectiveOptions(answerArt) {
    const others = this.detectivePool.filter(a => a.name !== answerArt.name);
    const wrongChoices = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...wrongChoices, answerArt].sort(() => Math.random() - 0.5);
    this.detectiveOptions = options;
    return options;
  }

  detectiveHintText(art, level) {
    if (level >= 3) {
      const snippet = art.desc && art.desc.length > 40 ? art.desc.slice(0, 40) + '…' : art.desc;
      return `힌트 3: 설명을 좀 더 볼게 — "${snippet}"`;
    }
    if (level === 2) {
      return `힌트 2: 이 유물은 [${art.category}] 종류야.`;
    }
    return `힌트 1: 이 유물은 [${art.era}]와 관련이 있어.`;
  }

  renderDetectiveRound() {
    const container = document.getElementById('detective-game-container');
    if (!container) return;

    const art = this.detectiveRounds[this.detectiveRoundIdx];
    const options = this.detectiveOptions.length && this.detectiveHintLevel > 1
      ? this.detectiveOptions
      : this.buildDetectiveOptions(art);

    const hints = [];
    for (let lv = 1; lv <= this.detectiveHintLevel; lv++) {
      hints.push(this.detectiveHintText(art, lv));
    }

    container.innerHTML = `
      <div style="max-width: 560px; margin: 0 auto; background: #1F1B19; border: 1px solid #5A4E46; border-radius: 16px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #3D352E;">
          <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 10px; background: rgba(124, 58, 237, 0.25); color: #C4B5FD; border-radius: 999px;">
            문제 ${this.detectiveRoundIdx + 1} / ${this.detectiveRounds.length}
          </span>
          <span style="font-size: 0.72rem; color: #9B9088;">🕵️ 이 유물은 뭘까?</span>
        </div>

        <div id="detective-hints" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
          ${hints.map(h => `<p style="font-size: 0.85rem; color: #E4DCD3; background: #14110F; border: 1px solid #3D352E; border-radius: 8px; padding: 8px 12px;">${h}</p>`).join('')}
        </div>

        <div id="detective-options" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 12px;">
          ${options.map(opt => `
            <button onclick="window.miniGames.guessDetective('${opt.name.replace(/'/g, "\\'")}')" style="text-align: left; padding: 10px 12px; border-radius: 10px; background: #14110F; border: 1px solid #3D352E; color: #F0EAE1; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.3rem;">${opt.icon}</span> ${opt.name}
            </button>
          `).join('')}
        </div>

        ${this.detectiveHintLevel < 3 ? `
          <button onclick="window.miniGames.revealDetectiveHint()" style="padding: 6px 14px; background: #0F0D0B; color: #F0C987; border-radius: 10px; border: 1px solid #3D352E; font-weight: 700; font-size: 0.78rem; cursor: pointer;">
            💡 힌트 더 보기
          </button>
        ` : ''}

        <div id="detective-feedback" style="display: none; margin-top: 12px;"></div>
      </div>
    `;
  }

  revealDetectiveHint() {
    if (this.detectiveHintLevel >= 3) return;
    if (window.sounds) window.sounds.playClick();
    this.detectiveHintLevel++;
    this.renderDetectiveRound();
  }

  guessDetective(guessedName) {
    const art = this.detectiveRounds[this.detectiveRoundIdx];
    const fbEl = document.getElementById('detective-feedback');
    if (!fbEl) return;
    fbEl.style.display = 'block';

    if (guessedName === art.name) {
      if (window.sounds) window.sounds.playCorrect();
      this.detectiveResults.push({ correct: true, hintLevelUsed: this.detectiveHintLevel });

      const praise = this.detectiveHintLevel === 1
        ? '힌트 1개 만에 맞혔어! 정말 대단해 🎉'
        : this.detectiveHintLevel === 2
          ? '힌트 2개로 맞혔어! 잘했어 👏'
          : '끝까지 포기 안 하고 맞혔어! 좋아 😊';

      const isLastRound = this.detectiveRoundIdx + 1 >= this.detectiveRounds.length;
      fbEl.style.cssText = 'display: block; margin-top: 16px; padding: 14px; border-radius: 12px; background: rgba(45, 106, 79, 0.25); border: 1px solid #2D6A4F; color: #B7E8CB; text-align: center;';
      fbEl.innerHTML = `
        <h4 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">${art.icon} 정답은 [${art.name}]!</h4>
        <p style="font-size: 0.8rem; color: #C5BCB3; margin-bottom: 10px;">${praise}</p>
        <button onclick="window.miniGames.${isLastRound ? 'completeDetectiveGame' : 'nextDetectiveRound'}()" style="padding: 8px 18px; background: #7C3AED; color: #fff; border-radius: 10px; border: none; font-weight: 700; font-size: 0.82rem; cursor: pointer;">
          ${isLastRound ? '결과 보기' : '다음 문제로 ➔'}
        </button>
      `;
    } else {
      if (window.sounds) window.sounds.playWrong();
      if (this.detectiveHintLevel < 3) {
        this.detectiveHintLevel++;
        fbEl.style.cssText = 'display: block; margin-top: 16px; padding: 12px; border-radius: 12px; background: rgba(138, 59, 41, 0.2); border: 1px solid #8A3B29; color: #F1B9A8; text-align: center;';
        fbEl.innerHTML = `<p style="font-size: 0.82rem;">아직 아니야! 힌트를 하나 더 줄게 🔍</p>`;
        setTimeout(() => this.renderDetectiveRound(), 900);
      } else {
        // 힌트를 다 봤는데도 틀리면 정답을 알려주고 다음 문제로
        this.detectiveResults.push({ correct: false, hintLevelUsed: 3 });
        const isLastRound = this.detectiveRoundIdx + 1 >= this.detectiveRounds.length;
        fbEl.style.cssText = 'display: block; margin-top: 16px; padding: 14px; border-radius: 12px; background: rgba(138, 59, 41, 0.2); border: 1px solid #8A3B29; color: #F1B9A8; text-align: center;';
        fbEl.innerHTML = `
          <h4 style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">${art.icon} 정답은 [${art.name}]였어!</h4>
          <p style="font-size: 0.8rem; color: #E4DCD3; margin-bottom: 10px;">괜찮아, 이제 알았으니 다음엔 바로 맞힐 수 있을 거야.</p>
          <button onclick="window.miniGames.${isLastRound ? 'completeDetectiveGame' : 'nextDetectiveRound'}()" style="padding: 8px 18px; background: #7C3AED; color: #fff; border-radius: 10px; border: none; font-weight: 700; font-size: 0.82rem; cursor: pointer;">
            ${isLastRound ? '결과 보기' : '다음 문제로 ➔'}
          </button>
        `;
      }
    }
  }

  nextDetectiveRound() {
    if (window.sounds) window.sounds.playClick();
    this.detectiveRoundIdx++;
    this.detectiveHintLevel = 1;
    this.detectiveOptions = [];
    this.renderDetectiveRound();
  }

  completeDetectiveGame() {
    const container = document.getElementById('detective-game-container');
    if (!container) return;

    const correctCount = this.detectiveResults.filter(r => r.correct).length;
    const allHint1 = this.detectiveResults.every(r => r.correct && r.hintLevelUsed === 1);

    if (window.sounds) window.sounds.playFanfare();
    if (allHint1) window.encyclopedia.unlockBadge('badge_detective_master');

    container.innerHTML = `
      <div style="max-width: 560px; margin: 0 auto; padding: 20px; border-radius: 14px; background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(45, 106, 79, 0.2)); border: 2px solid #7C3AED; text-align: center;">
        <h4 style="font-size: 1.05rem; font-weight: 900; color: #C4B5FD; margin-bottom: 6px;">🕵️ 탐정 활동 완료!</h4>
        <p style="color: #E4DCD3; font-size: 0.85rem; margin-bottom: 12px;">
          총 ${this.detectiveResults.length}문제 중 ${correctCount}개를 맞혔어.
          ${allHint1 ? '전부 힌트 1개로 맞혀서 [유물 감식가] 배지를 획득했습니다! 🎉' : ''}
        </p>
        <button onclick="window.miniGames.startDetectiveGame()" class="btn" style="width: auto; padding: 8px 20px; background-color: #7C3AED;">
          🔄 다른 문제로 다시 하기
        </button>
      </div>
    `;
  }
}

window.miniGames = new MiniGameEngine();
