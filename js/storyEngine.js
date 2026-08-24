/**
 * Story Engine
 * 초등 5학년 역사 대화형 인터랙티브 비주얼 스토리 엔진
 */
class StoryEngine {
  constructor() {
    this.stories = [];
    this.currentStory = null;
    this.currentScene = null;
    this.isTyping = false;
    this.typingTimeout = null;
  }

  async loadStories() {
    try {
      const res = await fetch('data/stories.json');
      this.stories = await res.json();
    } catch (e) {
      console.error('Failed to load stories.json', e);
    }
  }

  renderEpisodeList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    `;

    this.stories.forEach((story, idx) => {
      const isCleared = window.encyclopedia.data.completedStories.includes(story.id);
      html += `
        <div class="group relative bg-stone-800/90 border-2 ${isCleared ? 'border-emerald-500/70' : 'border-amber-500/40'} hover:border-amber-400 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-amber-500/20 flex flex-col justify-between overflow-hidden">
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br ${story.bgGradient} opacity-20 rounded-full blur-xl group-hover:scale-150 transition-all"></div>
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full">${story.era}</span>
              ${isCleared ? '<span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">✨ 탐험 완료</span>' : '<span class="text-xs bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full">도전 가능</span>'}
            </div>
            <h3 class="text-xl font-black text-stone-100 mb-2 leading-snug group-hover:text-amber-300 transition-colors">${story.title}</h3>
            <p class="text-xs text-stone-300 mb-4">${story.subtitle}</p>
            <div class="text-xs text-stone-300 bg-stone-900/60 p-2.5 rounded-lg mb-4 flex items-center gap-2 border border-stone-700/50">
              <span>👤 주요 인물:</span> <strong class="text-amber-200">${story.character}</strong>
            </div>
          </div>
          <button onclick="window.storyEngine.startStory('${story.id}')" class="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2">
            <span>🚀 타임머신 출발하기</span>
          </button>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  startStory(storyId) {
    this.currentStory = this.stories.find(s => s.id === storyId);
    if (!this.currentStory) return;

    if (window.sounds) window.sounds.playTimeWarp();

    // 화면 전환
    document.getElementById('story-select-view').classList.add('hidden');
    document.getElementById('story-play-view').classList.remove('hidden');

    this.goToScene(1);
  }

  goToScene(sceneId) {
    if (!this.currentStory) return;
    this.currentScene = this.currentStory.scenes.find(s => s.id === sceneId);
    if (!this.currentScene) return;

    this.renderScene();
  }

  renderScene() {
    const playView = document.getElementById('story-play-view');
    const scene = this.currentScene;
    const story = this.currentStory;

    // 보상 체크
    if (scene.reward) {
      window.encyclopedia.recordStoryClear(story.id, story.badgeId, scene.reward.artifact);
    }

    playView.innerHTML = `
      <div class="max-w-3xl mx-auto bg-stone-900/90 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
        <!-- 상단 헤더 -->
        <div class="flex items-center justify-between border-b border-stone-700/60 pb-4 mb-6">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full border border-amber-500/30">${story.era}</span>
            <h3 class="font-bold text-stone-200 text-base md:text-lg">${story.title}</h3>
          </div>
          <button onclick="window.storyEngine.exitStory()" class="text-stone-400 hover:text-stone-100 text-sm px-3 py-1 rounded-lg bg-stone-800 border border-stone-700 hover:bg-stone-700 transition">
            ✕ 나가기
          </button>
        </div>

        <!-- 캐릭터 대화 카드 -->
        <div class="flex items-start gap-4 mb-6">
          <div class="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-2 border-amber-400 flex items-center justify-center text-3xl md:text-4xl shrink-0 shadow-lg shadow-amber-950/50">
            ${scene.avatar || '👤'}
          </div>
          <div class="flex-1">
            <h4 class="font-bold text-amber-300 text-base md:text-lg mb-1 flex items-center gap-2">
              ${scene.speaker}
            </h4>
            <div class="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 min-h-[90px] flex items-center">
              <p id="typewriter-text" class="text-stone-100 text-sm md:text-base leading-relaxed"></p>
            </div>
          </div>
        </div>

        <!-- 획득 보상 알림 (있을 경우) -->
        ${
          scene.reward
            ? `
          <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-2 border-yellow-400/60 animate-bounce-slow">
            <div class="flex items-center gap-3">
              <span class="text-3xl">✨</span>
              <div>
                <h5 class="font-black text-yellow-300 text-base">역사 유물 발굴 성공! [${scene.reward.artifact}]</h5>
                <p class="text-xs text-stone-200 mt-0.5">${scene.reward.desc}</p>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- 선택지 목록 -->
        <div id="choices-container" class="space-y-3 opacity-0 transition-opacity duration-300">
          ${
            scene.isEnd
              ? `
            <button onclick="window.storyEngine.exitStory()" class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black rounded-xl shadow-lg transition transform active:scale-95 text-base flex items-center justify-center gap-2">
              <span>🎉 모험 완수! 연구실로 돌아가기</span>
            </button>
          `
              : (scene.choices || [])
                  .map(
                    (choice, idx) => `
              <button onclick="window.storyEngine.selectChoice(${choice.next})" class="w-full text-left p-4 rounded-xl bg-stone-800/90 hover:bg-amber-950/40 border border-stone-700 hover:border-amber-400 text-stone-100 hover:text-amber-200 font-semibold transition-all flex items-center justify-between group shadow-md active:scale-[0.99]">
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-full bg-stone-700 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-300 flex items-center justify-center text-xs font-bold">${idx + 1}</span>
                  <span class="text-sm md:text-base">${choice.text}</span>
                </div>
                <span class="text-stone-400 group-hover:text-amber-400 transition-transform group-hover:translate-x-1">➔</span>
              </button>
            `
                  )
                  .join('')
          }
        </div>
      </div>
    `;

    this.typewriterEffect(scene.text);
  }

  typewriterEffect(text) {
    const textEl = document.getElementById('typewriter-text');
    const choicesEl = document.getElementById('choices-container');
    if (!textEl) return;

    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    textEl.innerHTML = '';
    let idx = 0;
    this.isTyping = true;

    const step = () => {
      if (idx < text.length) {
        textEl.innerHTML += text.charAt(idx);
        idx++;
        this.typingTimeout = setTimeout(step, 20);
      } else {
        this.isTyping = false;
        if (choicesEl) {
          choicesEl.classList.remove('opacity-0');
        }
      }
    };
    step();
  }

  selectChoice(nextSceneId) {
    if (window.sounds) window.sounds.playClick();
    this.goToScene(nextSceneId);
  }

  exitStory() {
    if (window.sounds) window.sounds.playClick();
    document.getElementById('story-play-view').classList.add('hidden');
    document.getElementById('story-select-view').classList.remove('hidden');
    this.renderEpisodeList('story-episodes-container');
    window.encyclopedia.renderEncyclopedia('encyclopedia-content');
  }
}

window.storyEngine = new StoryEngine();
