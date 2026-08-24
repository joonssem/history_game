/**
 * Encyclopedia & Achievement Manager
 * LocalStorage를 활용한 학습 업적, 배지 및 도감 수집 관리
 */
class EncyclopediaManager {
  constructor() {
    this.storageKey = 'history_explorer_save_v1';
    this.data = this.loadData();
    this.artifactsList = [];
    this.badgesList = [
      { id: 'badge_gojoseon', title: '고조선 개척자', desc: '고조선 건국 스토리를 완료했습니다.', icon: '👑' },
      { id: 'badge_samguk', title: '백제 명예 장인', desc: '백제 금동대향로 스토리를 완료했습니다.', icon: '🏺' },
      { id: 'badge_joseon', title: '집현전 수석학사', desc: '훈민정음 창제 스토리를 완료했습니다.', icon: '📜' },
      { id: 'badge_quiz_master', title: '역사 골든벨 마스터', desc: '역사 스피드 퀴즈에서 90점 이상 획득했습니다.', icon: '⭐' },
      { id: 'badge_card_master', title: '유물 발굴 전문가', desc: '유물 카드 맞추기 게임을 완벽히 클리어했습니다.', icon: '🔍' },
      { id: 'badge_timeline_master', title: '시간의 지배자', desc: '역사 연표 맞추기 챌린지를 정복했습니다.', icon: '⏳' }
    ];
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage access error, using memory fallback:', e);
    }
    return {
      studentName: '꿈꾸는 역사탐험가',
      completedStories: [],
      unlockedArtifacts: [],
      unlockedBadges: [],
      quizHighScore: 0,
      cardGameBestMoves: null,
      timelineClearedStages: []
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  async initArtifacts() {
    try {
      const res = await fetch('data/artifacts.json');
      this.artifactsList = await res.json();
    } catch (e) {
      console.error('Failed to load artifacts.json', e);
    }
  }

  unlockArtifact(artNameOrId) {
    if (!this.data.unlockedArtifacts.includes(artNameOrId)) {
      this.data.unlockedArtifacts.push(artNameOrId);
      this.saveData();
      if (window.sounds) window.sounds.playFanfare();
      this.showToast(`🎉 새로운 유물 [${artNameOrId}] 획득! 도감에 등록되었습니다.`);
    }
  }

  unlockBadge(badgeId) {
    if (!this.data.unlockedBadges.includes(badgeId)) {
      this.data.unlockedBadges.push(badgeId);
      this.saveData();
      if (window.sounds) window.sounds.playFanfare();
      const badge = this.badgesList.find(b => b.id === badgeId);
      this.showToast(`🎖️ 배지 획득! [${badge ? badge.title : badgeId}]`);
    }
  }

  recordStoryClear(storyId, badgeId, artifactName) {
    if (!this.data.completedStories.includes(storyId)) {
      this.data.completedStories.push(storyId);
    }
    if (badgeId) this.unlockBadge(badgeId);
    if (artifactName) this.unlockArtifact(artifactName);
    this.saveData();
  }

  recordQuizScore(score) {
    if (score > this.data.quizHighScore) {
      this.data.quizHighScore = score;
    }
    if (score >= 90) {
      this.unlockBadge('badge_quiz_master');
    }
    this.saveData();
  }

  renderEncyclopedia(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalArts = this.artifactsList.length || 8;
    const unlockedCount = this.data.unlockedArtifacts.length;
    const progressPercent = Math.round((unlockedCount / totalArts) * 100);

    let html = `
      <div class="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-xl font-bold text-amber-200">🏆 역사 탐험 달성도</h3>
          <p class="text-stone-300 text-sm mt-1">유물 수집: <span class="font-bold text-amber-400">${unlockedCount} / ${totalArts}</span>개 (${progressPercent}%)</p>
        </div>
        <div class="w-full md:w-64 bg-stone-800 rounded-full h-4 overflow-hidden border border-stone-600">
          <div class="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-700" style="width: ${progressPercent}%"></div>
        </div>
      </div>

      <h3 class="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
        <span>📜</span> 발견한 역사 문화재 도감
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    `;

    this.artifactsList.forEach(art => {
      const isUnlocked = this.data.unlockedArtifacts.includes(art.name) || this.data.unlockedArtifacts.includes(art.id);
      html += `
        <div class="p-4 rounded-xl border transition-all ${
          isUnlocked
            ? 'bg-stone-800/90 border-amber-500/50 shadow-lg shadow-amber-950/40'
            : 'bg-stone-900/60 border-stone-700 opacity-60'
        }">
          <div class="w-16 h-16 rounded-xl mx-auto mb-3 flex items-center justify-center text-3xl ${
            isUnlocked ? 'bg-amber-500/20 border border-amber-400/40 animate-pulse-slow' : 'bg-stone-800'
          }">
            ${isUnlocked ? art.icon : '❓'}
          </div>
          <div class="text-center">
            <span class="text-xs px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-amber-400/20 text-amber-300' : 'bg-stone-800 text-stone-400'}">${art.era}</span>
            <h4 class="font-bold text-base mt-2 ${isUnlocked ? 'text-stone-100' : 'text-stone-400'}">${isUnlocked ? art.name : '미지의 유물'}</h4>
            <p class="text-xs text-stone-300 mt-1 line-clamp-3">${isUnlocked ? art.desc : '스토리 탐험 또는 미니게임을 통해 유물을 발굴해보세요!'}</p>
          </div>
        </div>
      `;
    });

    html += `
      </div>

      <h3 class="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
        <span>🎖️</span> 획득한 업적 배지
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    `;

    this.badgesList.forEach(b => {
      const isUnlocked = this.data.unlockedBadges.includes(b.id);
      html += `
        <div class="p-4 rounded-xl border flex items-center gap-4 ${
          isUnlocked
            ? 'bg-gradient-to-br from-yellow-950/40 to-stone-800/80 border-yellow-500/50 shadow-md'
            : 'bg-stone-900/50 border-stone-800 opacity-50'
        }">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${
            isUnlocked ? 'bg-yellow-400/20 border border-yellow-300' : 'bg-stone-800'
          }">
            ${isUnlocked ? b.icon : '🔒'}
          </div>
          <div>
            <h4 class="font-bold text-sm ${isUnlocked ? 'text-yellow-200' : 'text-stone-400'}">${b.title}</h4>
            <p class="text-xs text-stone-300 mt-0.5">${b.desc}</p>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 bg-stone-900/95 text-amber-300 px-5 py-3.5 rounded-xl border border-amber-400/60 shadow-2xl flex items-center gap-3 backdrop-blur transform translate-y-4 opacity-0 transition-all duration-300 font-medium text-sm md:text-base';
    toast.innerHTML = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  resetProgress() {
    if (confirm('학습 기록과 수집한 유물 도감을 초기화하시겠습니까?')) {
      localStorage.removeItem(this.storageKey);
      this.data = this.loadData();
      this.renderEncyclopedia('encyclopedia-content');
      this.showToast('학습 기록이 초기화되었습니다.');
    }
  }
}

window.encyclopedia = new EncyclopediaManager();
