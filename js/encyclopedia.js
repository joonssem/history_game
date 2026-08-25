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

    const totalArts = this.artifactsList.length || 16;
    const unlockedCount = this.data.unlockedArtifacts.length;
    const progressPercent = Math.min(100, Math.round((unlockedCount / totalArts) * 100));

    // 탐험가 레벨 및 칭호 계산
    let levelName = 'Lv.1 꿈나무 탐험가 🌱';
    let levelColor = '#10B981';
    if (unlockedCount >= 16) {
      levelName = 'Lv.MAX 전설의 대역사가 👑';
      levelColor = '#F59E0B';
    } else if (unlockedCount >= 12) {
      levelName = 'Lv.4 역사 마스터 🌟';
      levelColor = '#8B5CF6';
    } else if (unlockedCount >= 8) {
      levelName = 'Lv.3 국보급 탐정 🔍';
      levelColor = '#3B82F6';
    } else if (unlockedCount >= 4) {
      levelName = 'Lv.2 유물 발굴단 ⛏️';
      levelColor = '#EC4899';
    }

    let html = `
      <!-- 1. 탐험가 프로필 및 도감 진행률 배너 -->
      <div style="background: linear-gradient(135deg, #2A2421 0%, #1A1615 100%); border: 2px solid #D4AF37; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); position: relative; overflow: hidden;">
        <div style="position: absolute; right: -20px; bottom: -20px; font-size: 8rem; opacity: 0.06; pointer-events: none;">🏆</div>
        
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: ${levelColor}22; border: 1px solid ${levelColor}; color: ${levelColor}; font-weight: 800; font-size: 0.85rem; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px;">
              ${levelName}
            </div>
            <h3 style="font-family: 'SchoolSafetyNotification', sans-serif; font-size: 1.45rem; color: #F7E7CE; margin: 0 0 4px 0;">
              ✨ 나의 국보 유물 컬렉션 북
            </h3>
            <p style="font-size: 0.9rem; color: #C5BCB3; margin: 0;">
              MUD 역사 탐험을 완수하고 전설의 ${totalArts}대 유물을 모두 수집해보세요!
            </p>
          </div>

          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(212,175,55,0.4); padding: 12px 20px; border-radius: 12px; text-align: center; min-width: 170px;">
            <div style="font-size: 0.8rem; color: #D4AF37; font-weight: 700;">발견한 유물</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #FFFFFF;">
              <span style="color: #F59E0B;">${unlockedCount}</span> <span style="font-size: 1rem; color: #9CA3AF;">/ ${totalArts}</span>
            </div>
            <div style="font-size: 0.75rem; color: #10B981; font-weight: 700;">${progressPercent}% 수집 완료</div>
          </div>
        </div>

        <!-- 프로그레스 바 -->
        <div style="margin-top: 16px;">
          <div style="width: 100%; height: 12px; background: #110F0E; border-radius: 6px; overflow: hidden; border: 1px solid #443B36; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
            <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #F59E0B, #FBBF24, #10B981); border-radius: 6px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);"></div>
          </div>
        </div>
      </div>

      <!-- 2. 게임 카드 컬렉션 그리드 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h4 style="font-family: 'SchoolSafetyNotification', sans-serif; font-size: 1.15rem; color: var(--text-main); margin: 0;">
          🎴 역사 유물 카드 (${totalArts}종)
        </h4>
        <span style="font-size: 0.8rem; color: #887E75;">카드를 클릭하면 상세 해설을 볼 수 있습니다.</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 16px; margin-bottom: 30px;">
    `;

    this.artifactsList.forEach((art, idx) => {
      const isUnlocked = this.data.unlockedArtifacts.includes(art.name) || this.data.unlockedArtifacts.includes(art.id);
      const tierColor = art.tierColor || '#F59E0B';
      const tierName = art.tierName || '국보 유물';

      if (isUnlocked) {
        // [획득 카드: 게임형 골드/네온 반짝이 카드]
        html += `
          <div onclick="window.encyclopedia.showDetailModal(${idx})" style="cursor: pointer; background: linear-gradient(145deg, #2D2723 0%, #1F1B19 100%); border: 2px solid ${tierColor}; border-radius: 14px; padding: 14px; box-shadow: 0 6px 14px rgba(0,0,0,0.2); transition: all 0.25s ease; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-6px) scale(1.02)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 6px 14px rgba(0,0,0,0.2)';">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.68rem; font-weight: 800; color: ${tierColor}; background: ${tierColor}22; padding: 2px 8px; border-radius: 10px; border: 1px solid ${tierColor}55;">
                ★ ${tierName}
              </span>
              <span style="font-size: 0.72rem; color: #B3AAA1; font-weight: 600;">${art.era}</span>
            </div>

            <div style="height: 90px; background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(0,0,0,0) 70%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 3.4rem; margin-bottom: 10px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
              ${art.icon}
            </div>

            <div style="text-align: center;">
              <h5 style="font-size: 0.98rem; font-weight: 800; color: #FFF; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${art.name}
              </h5>
              <span style="display: inline-block; font-size: 0.72rem; color: #10B981; font-weight: 700; background: #10B98118; padding: 2px 8px; border-radius: 4px;">
                ✓ 수집 완료
              </span>
            </div>
          </div>
        `;
      } else {
        // [미획득 카드: 신비로운 실루엣 자물쇠 카드]
        html += `
          <div style="background: #201D1B; border: 1px dashed #4D4540; border-radius: 14px; padding: 14px; opacity: 0.85; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.68rem; font-weight: 700; color: #736B63; background: #2E2926; padding: 2px 8px; border-radius: 10px;">
                LOCKED
              </span>
              <span style="font-size: 0.72rem; color: #736B63; font-weight: 500;">${art.era}</span>
            </div>

            <div style="height: 90px; background: #181514; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 10px;">
              <span style="font-size: 2.2rem; filter: grayscale(100%); opacity: 0.35;">🔒</span>
              <span style="font-size: 0.72rem; color: #8C8278; margin-top: 4px; font-weight: 600;">미발견 유물</span>
            </div>

            <div style="text-align: center;">
              <h5 style="font-size: 0.92rem; font-weight: 700; color: #8C8278; margin: 0 0 6px 0;">
                ???
              </h5>
              <div style="font-size: 0.68rem; color: #D4AF37; background: rgba(212,175,55,0.08); padding: 4px 6px; border-radius: 4px; line-height: 1.3;">
                💡 ${art.hint || 'MUD 퀘스트 클리어 시 획득'}
              </div>
            </div>
          </div>
        `;
      }
    });

    html += `
      </div>

      <!-- 3. 업적 트로피 진열대 -->
      <h4 style="font-family: 'SchoolSafetyNotification', sans-serif; font-size: 1.15rem; color: var(--text-main); margin: 0 0 14px 0;">
        🎖️ 역사 탐험 업적 트로피
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; margin-bottom: 20px;">
    `;

    this.badgesList.forEach(b => {
      const isUnlocked = this.data.unlockedBadges.includes(b.id);
      html += `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; background: ${isUnlocked ? 'linear-gradient(135deg, #2D2723 0%, #231E1C 100%)' : '#1E1B1A'}; border: 1px solid ${isUnlocked ? '#F59E0B66' : '#3D3632'}; opacity: ${isUnlocked ? '1' : '0.6'};">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: ${isUnlocked ? '#F59E0B22' : '#2A2523'}; border: 1.5px solid ${isUnlocked ? '#F59E0B' : '#443C37'}; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; shrink: 0;">
            ${isUnlocked ? b.icon : '🔒'}
          </div>
          <div>
            <div style="font-size: 0.88rem; font-weight: 700; color: ${isUnlocked ? '#F7E7CE' : '#736B63'};">${b.title}</div>
            <div style="font-size: 0.75rem; color: ${isUnlocked ? '#A89E94' : '#5C544E'}; margin-top: 2px;">${b.desc}</div>
          </div>
        </div>
      `;
    });

    html += `
      </div>

      <!-- 상세 모달 컨테이너 (동적 주입용) -->
      <div id="art-detail-modal-box"></div>
    `;

    container.innerHTML = html;
  }

  showDetailModal(idx) {
    const art = this.artifactsList[idx];
    if (!art) return;

    const modalBox = document.getElementById('art-detail-modal-box');
    if (!modalBox) return;

    modalBox.innerHTML = `
      <div style="position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.75); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="document.getElementById('art-detail-modal-box').innerHTML=''">
        <div style="background: linear-gradient(145deg, #2B2421 0%, #1D1816 100%); border: 2px solid ${art.tierColor || '#F59E0B'}; border-radius: 20px; max-width: 420px; width: 100%; padding: 26px; box-shadow: 0 16px 40px rgba(0,0,0,0.6); text-align: center; color: #FFF; position: relative;" onclick="event.stopPropagation()">
          <button onclick="document.getElementById('art-detail-modal-box').innerHTML=''" style="position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.1); border: none; color: #FFF; border-radius: 50%; width: 32px; height: 32px; font-size: 1rem; cursor: pointer;">✕</button>
          
          <div style="font-size: 0.8rem; font-weight: 800; color: ${art.tierColor}; margin-bottom: 6px;">
            ★ ${art.tierName || '국보 유물'} · ${art.era}
          </div>
          
          <div style="font-size: 4.8rem; margin: 12px 0; filter: drop-shadow(0 6px 16px rgba(245,158,11,0.3));">
            ${art.icon}
          </div>
          
          <h3 style="font-family: 'SchoolSafetyNotification', sans-serif; font-size: 1.5rem; color: #F7E7CE; margin: 0 0 12px 0;">
            ${art.name}
          </h3>
          
          <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; text-align: left; font-size: 0.92rem; line-height: 1.6; color: #DDD4C7; margin-bottom: 16px;">
            ${art.desc}
          </div>
          
          <div style="font-size: 0.78rem; color: #10B981; font-weight: 700;">
            ✓ MUD 역사 탐험을 통해 정식 등록된 유물입니다.
          </div>
        </div>
      </div>
    `;
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

