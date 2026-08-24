/**
 * Main Application Router & Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 데이터 초기화
  await Promise.all([
    window.encyclopedia.initArtifacts(),
    window.storyEngine.loadStories(),
    window.quizGame.loadQuizzes(),
    window.miniGames.init()
  ]);

  // 초기 뷰 렌더링
  window.storyEngine.renderEpisodeList('story-episodes-container');
  window.encyclopedia.renderEncyclopedia('encyclopedia-content');

  // 네비게이션 탭 이벤트 설정
  setupNavigation();

  // 음소거 토글 버튼
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const enabled = window.sounds.toggleSound();
      soundToggleBtn.innerHTML = enabled ? '🔊 소리 켜짐' : '🔇 음소거';
      soundToggleBtn.classList.toggle('bg-stone-800', enabled);
      soundToggleBtn.classList.toggle('bg-rose-950', !enabled);
    });
  }

  // 전체화면 토글
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Fullscreen request failed', err);
        });
        fullscreenBtn.innerHTML = '🔲 창모드';
      } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '🖥️ 전체화면';
      }
    });
  }
});

function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.app-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (window.sounds) window.sounds.playClick();
      const targetId = tab.getAttribute('data-target');

      tabs.forEach(t => {
        t.classList.remove('active', 'border-amber-400', 'text-amber-300', 'bg-amber-400/10');
        t.classList.add('text-stone-300', 'hover:text-stone-100');
      });

      tab.classList.add('active', 'border-amber-400', 'text-amber-300', 'bg-amber-400/10');
      tab.classList.remove('text-stone-300');

      sections.forEach(sec => {
        if (sec.id === targetId) {
          sec.classList.remove('hidden');
          sec.classList.add('animate-fade-in');
        } else {
          sec.classList.add('hidden');
          sec.classList.remove('animate-fade-in');
        }
      });

      // 탭 전환 시 필요한 상태 초기화/렌더링
      if (targetId === 'encyclopedia-section') {
        window.encyclopedia.renderEncyclopedia('encyclopedia-content');
      } else if (targetId === 'story-section') {
        window.storyEngine.renderEpisodeList('story-episodes-container');
      } else if (targetId === 'minigames-section') {
        window.miniGames.startCardGame();
        window.miniGames.startTimelineGame(0);
      }
    });
  });
}

function switchNavTab(targetId) {
  const targetTab = document.querySelector(`.nav-tab[data-target="${targetId}"]`);
  if (targetTab) {
    targetTab.click();
  }
}
