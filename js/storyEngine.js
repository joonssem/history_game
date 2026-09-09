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
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
    `;

    this.stories.forEach((story, idx) => {
      const isCleared = window.encyclopedia.data.completedStories.includes(story.id);
      html += `
        <div style="background: #1F1B19; border: 1px solid ${isCleared ? '#2D6A4F' : '#5A4E46'}; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 0.7rem; font-weight: 700; background: rgba(183, 121, 31, 0.2); color: #F0C987; padding: 3px 10px; border-radius: 999px;">${story.era}</span>
              ${isCleared ? '<span style="font-size: 0.7rem; font-weight: 700; background: rgba(45, 106, 79, 0.25); color: #7FE0B0; padding: 2px 8px; border-radius: 999px;">✨ 탐험 완료</span>' : '<span style="font-size: 0.7rem; background: #33302B; color: #C5BCB3; padding: 2px 8px; border-radius: 999px;">도전 가능</span>'}
            </div>
            <h4 style="color: #F7E7CE; font-size: 1.02rem; font-weight: 800; margin-bottom: 6px; line-height: 1.4;">${story.title}</h4>
            <p style="color: #C5BCB3; font-size: 0.8rem; margin-bottom: 10px;">${story.subtitle}</p>
            <div style="font-size: 0.78rem; color: #C5BCB3; background: #14110F; border: 1px solid #3D352E; border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; gap: 6px;">
              <span>👤 주요 인물:</span> <strong style="color: #F0C987;">${story.character}</strong>
            </div>
          </div>
          <button onclick="window.storyEngine.startStory('${story.id}')" class="btn" style="background-color: #B7791F;">
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
    document.getElementById('story-select-view').style.display = 'none';
    document.getElementById('story-play-view').style.display = 'block';

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
      window.encyclopedia.recordStoryClear(story.id, story.badgeId, scene.reward.artifactId);
    }

    playView.innerHTML = `
      <div style="max-width: 720px; margin: 0 auto; background: #1F1B19; border: 1px solid #5A4E46; border-radius: 16px; padding: 20px;">
        <!-- 상단 헤더 -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #3D352E; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="font-size: 0.7rem; font-weight: 700; background: rgba(183, 121, 31, 0.2); color: #F0C987; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(183, 121, 31, 0.4);">${story.era}</span>
            <h3 style="font-weight: 800; color: #F0EAE1; font-size: 1.02rem;">${story.title}</h3>
          </div>
          <button onclick="window.storyEngine.exitStory()" style="font-size: 0.8rem; color: #C5BCB3; padding: 5px 12px; border-radius: 8px; background: #14110F; border: 1px solid #3D352E; cursor: pointer;">
            ✕ 나가기
          </button>
        </div>

        <!-- 캐릭터 대화 카드 -->
        <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px;">
          <div style="width: 64px; height: 64px; flex-shrink: 0; border-radius: 14px; background: rgba(183, 121, 31, 0.25); border: 2px solid #B7791F; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
            ${scene.avatar || '👤'}
          </div>
          <div style="flex: 1;">
            <h4 style="font-weight: 800; color: #F0C987; font-size: 1rem; margin-bottom: 6px;">
              ${scene.speaker}
            </h4>
            <div style="padding: 14px; border-radius: 12px; background: #14110F; border: 1px solid #3D352E; min-height: 82px; display: flex; align-items: center;">
              <p id="typewriter-text" style="color: #F0EAE1; font-size: 0.92rem; line-height: 1.7;"></p>
            </div>
          </div>
        </div>

        <!-- 획득 보상 알림 (있을 경우) -->
        ${
          scene.reward
            ? `
          <div style="margin-bottom: 18px; padding: 14px; border-radius: 12px; background: rgba(183, 121, 31, 0.18); border: 2px solid rgba(240, 201, 135, 0.6);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.6rem;">✨</span>
              <div>
                <h5 style="font-weight: 900; color: #F7E7CE; font-size: 0.92rem;">역사 유물 발굴 성공! [${scene.reward.artifact}]</h5>
                <p style="font-size: 0.78rem; color: #C5BCB3; margin-top: 2px;">${scene.reward.desc}</p>
              </div>
            </div>
          </div>
        `
            : ''
        }

        <!-- 선택지 목록 -->
        <div id="choices-container" style="display: flex; flex-direction: column; gap: 10px; opacity: 0; transition: opacity 0.3s ease;">
          ${
            scene.isEnd
              ? `
            <button onclick="window.storyEngine.exitStory()" class="btn" style="background-color: #2D6A4F;">
              <span>🎉 모험 완수! 연구실로 돌아가기</span>
            </button>
          `
              : (scene.choices || [])
                  .map(
                    (choice, idx) => `
              <button onclick="window.storyEngine.selectChoice(${choice.next})" class="btn secondary" style="justify-content: space-between; text-align: left;">
                <span style="display: flex; align-items: center; gap: 10px;">
                  <span class="choice-marker choice-marker-${idx % 3}" aria-hidden="true">${idx + 1}</span>
                  <span>${choice.text}</span>
                </span>
                <span aria-hidden="true">➔</span>
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
          choicesEl.style.opacity = '1';
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
    document.getElementById('story-play-view').style.display = 'none';
    document.getElementById('story-select-view').style.display = 'block';
    this.renderEpisodeList('story-episodes-container');
    window.encyclopedia.renderEncyclopedia('encyclopedia-content');
  }
}

window.storyEngine = new StoryEngine();
