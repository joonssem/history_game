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
  }

  async init() {
    try {
      const [artRes, timeRes] = await Promise.all([
        fetch('data/artifacts.json'),
        fetch('data/timeline.json')
      ]);
      this.artifacts = await artRes.json();
      this.timelineStages = await timeRes.json();
    } catch (e) {
      console.error('Failed to load mini-game data', e);
    }
  }

  // ==========================================
  // 1. 유물 카드 짝맞추기 게임 (Memory Match)
  // ==========================================
  startCardGame() {
    if (window.sounds) window.sounds.playClick();
    this.matchedPairs = 0;
    this.cardMoves = 0;
    this.flippedCards = [];
    this.isCardLocked = false;

    const selectedArts = [...this.artifacts].slice(0, 6); // 6쌍 (12장)
    const deck = [];

    selectedArts.forEach((art, index) => {
      deck.push({ id: `card_${index}_a`, pairId: index, name: art.name, icon: art.icon, era: art.era });
      deck.push({ id: `card_${index}_b`, pairId: index, name: art.name, icon: art.icon, era: art.era });
    });

    this.cardDeck = deck.sort(() => Math.random() - 0.5);

    const container = document.getElementById('card-game-container');
    if (!container) return;

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

        // 도감 등록
        window.encyclopedia.unlockArtifact(c1.card.name);

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
      <div style="max-width: 640px; margin: 0 auto; background: #1F1B19; border: 1px solid #5A4E46; border-radius: 16px; padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #3D352E;">
          <div>
            <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 10px; background: rgba(183, 121, 31, 0.2); color: #F0C987; border-radius: 999px;">스테이지 ${stage.stage}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800; color: #F7E7CE; margin-top: 6px;">${stage.title}</h4>
          </div>
          <span style="font-size: 0.72rem; color: #9B9088;">카드를 눌러 위치를 교환하세요!</span>
        </div>

        <p style="color: #C5BCB3; font-size: 0.8rem; margin-bottom: 16px;">${stage.description}</p>

        <!-- 정렬 리스트 -->
        <div id="timeline-list" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
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
}

window.miniGames = new MiniGameEngine();
