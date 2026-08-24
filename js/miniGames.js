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
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4 max-w-xl mx-auto">
        ${this.cardDeck
          .map(
            (card, i) => `
          <div class="card-item relative h-24 md:h-32 cursor-pointer perspective" onclick="window.miniGames.flipCard(${i})">
            <div id="card-inner-${i}" class="card-inner w-full h-full rounded-2xl transition-transform duration-500 transform-style-3d shadow-md relative">
              <!-- 카드 뒷면 (가려진 상태) -->
              <div class="card-back absolute inset-0 bg-stone-800 hover:bg-stone-750 border-2 border-amber-500/40 rounded-2xl flex flex-col items-center justify-center backface-hidden">
                <span class="text-2xl md:text-3xl">🧭</span>
                <span class="text-[10px] text-amber-300 font-bold mt-1">유물 발굴</span>
              </div>
              <!-- 카드 앞면 (공개된 상태) -->
              <div class="card-front absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-center p-2 rotate-y-180 backface-hidden">
                <span class="text-3xl md:text-4xl mb-1">${card.icon}</span>
                <span class="text-xs font-bold text-amber-200 text-center leading-tight">${card.name}</span>
                <span class="text-[10px] text-stone-400 mt-0.5">${card.era}</span>
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
        document.getElementById(`card-inner-${c1.index}`).classList.add('matched', 'border-emerald-400', 'bg-emerald-950/40');
        document.getElementById(`card-inner-${c2.index}`).classList.add('matched', 'border-emerald-400', 'bg-emerald-950/40');
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
        <div class="flex items-center justify-between text-sm text-stone-300 bg-stone-800/80 px-4 py-2 rounded-xl border border-stone-700 max-w-xl mx-auto mb-4">
          <span>발굴한 유물: <strong class="text-amber-400 font-bold">${this.matchedPairs} / ${this.cardDeck.length / 2}</strong></span>
          <span>시도 횟수: <strong class="text-amber-300 font-bold">${this.cardMoves}</strong>회</span>
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
        <div class="mt-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-yellow-500/20 border-2 border-emerald-400 text-center animate-bounce-slow max-w-xl mx-auto">
          <h4 class="text-xl font-black text-emerald-300 mb-1">🎉 모든 유물 발굴 완료!</h4>
          <p class="text-stone-200 text-sm mb-4">총 ${this.cardMoves}번의 시도로 모든 유물을 찾았습니다. [유물 발굴 전문가] 배지를 획득했습니다!</p>
          <button onclick="window.miniGames.startCardGame()" class="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl transition">
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
      <div class="max-w-2xl mx-auto bg-stone-900/90 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-stone-700">
          <div>
            <span class="text-xs font-bold px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full">스테이지 ${stage.stage}</span>
            <h3 class="text-lg md:text-xl font-bold text-stone-100 mt-1">${stage.title}</h3>
          </div>
          <span class="text-xs text-stone-400">카드를 눌러 위치를 교환하세요!</span>
        </div>

        <p class="text-stone-300 text-xs md:text-sm mb-6">${stage.description}</p>

        <!-- 정렬 리스트 -->
        <div id="timeline-list" class="space-y-3 mb-6">
          ${this.currentTimelineEvents
            .map(
              (evt, idx) => `
            <div id="timeline-item-${idx}" onclick="window.miniGames.handleTimelineClick(${idx})" class="timeline-item p-3.5 rounded-xl bg-stone-800/90 border border-stone-700 hover:border-amber-400 cursor-pointer flex items-center justify-between transition-all group ${
                this.selectedTimelineItem === idx ? 'ring-2 ring-amber-400 bg-amber-950/40' : ''
              }">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-full bg-stone-700 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-300 flex items-center justify-center text-xs font-bold">${idx + 1}</span>
                <div>
                  <h4 class="text-sm md:text-base font-bold text-stone-100 group-hover:text-amber-200">${evt.title}</h4>
                  <span class="text-xs text-stone-400 font-mono">${evt.hint}</span>
                </div>
              </div>
              <div class="text-xs text-stone-500 font-bold px-2 py-1 bg-stone-900 rounded-lg">
                위치 변경 ⇅
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- 확인 버튼 -->
        <div class="flex items-center justify-between gap-4">
          <button onclick="window.miniGames.checkTimelineOrder()" class="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black rounded-xl shadow-lg transition active:scale-95 text-base">
            ✅ 순서 정답 확인하기
          </button>
        </div>

        <!-- 피드백 결과 -->
        <div id="timeline-feedback" class="mt-4 hidden"></div>
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

    fbEl.classList.remove('hidden');

    if (isAllCorrect) {
      if (window.sounds) window.sounds.playFanfare();
      window.encyclopedia.unlockBadge('badge_timeline_master');

      let nextButton = '';
      if (this.currentStageIdx + 1 < this.timelineStages.length) {
        nextButton = `
          <button onclick="window.miniGames.startTimelineGame(${this.currentStageIdx + 1})" class="mt-3 py-2 px-5 bg-stone-900 hover:bg-black text-amber-300 font-bold rounded-xl text-sm transition">
            다음 스테이지로 ➔
          </button>
        `;
      }

      fbEl.className = 'mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-center';
      fbEl.innerHTML = `
        <h4 class="font-bold text-base mb-1">🎉 완벽합니다! 올바른 연대순입니다!</h4>
        <p class="text-xs text-stone-300">
          ${stage.events.map(e => `[${e.year}] ${e.title}`).join(' ➔ ')}
        </p>
        ${nextButton}
      `;
    } else {
      if (window.sounds) window.sounds.playWrong();
      fbEl.className = 'mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-center';
      fbEl.innerHTML = `
        <h4 class="font-bold text-base mb-1">💡 아직 순서가 맞지 않은 곳이 있어요!</h4>
        <p class="text-xs text-stone-300">힌트를 다시 확인하고 카드를 눌러 순서를 교환해 보세요.</p>
      `;
    }
  }
}

window.miniGames = new MiniGameEngine();
