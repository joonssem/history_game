// =========================================================
// js/lessonTrack.js - 정규 32(실제 28)편 연대표 띠 (D-036, 라운드 9)
// data/lesson_track.json을 읽어 가로 띠를 그리고, 완료/현재/미완료 세
// 상태를 표시하며, 누르면 해당 편으로 이동한다.
//
// 진행 상태는 새 저장 키를 만들지 않고 기존 도감 저장(window.encyclopedia,
// localStorage 'history_explorer_save_v1')과 각 편의 data/mud/<id>.json의
// rewards를 그대로 읽어서 판단한다 — "이 편의 보상 유물이 도감에
// 해금돼 있으면 완료한 것"으로 본다.
// =========================================================

const LessonTrack = {
  entries: null,
  loadPromise: null,
  rewardKeysByMudId: new Map(),

  async load() {
    if (this.entries) return this.entries;
    if (!this.loadPromise) {
      this.loadPromise = fetch('data/lesson_track.json', { cache: 'no-store' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          this.entries = (Array.isArray(data.entries) ? [...data.entries] : [])
            .sort((a, b) => a.order - b.order);
          return this.entries;
        })
        .catch(err => {
          console.warn('LessonTrack: data/lesson_track.json을 불러오지 못했습니다.', err);
          this.entries = [];
          return this.entries;
        });
    }
    return this.loadPromise;
  },

  findByMudId(mudId) {
    return (this.entries || []).find(e => e.mudId === mudId) || null;
  },

  neighbors(mudId) {
    const entries = this.entries || [];
    const index = entries.findIndex(e => e.mudId === mudId);
    if (index < 0) return { prev: null, next: null };
    return {
      prev: index > 0 ? entries[index - 1] : null,
      next: index < entries.length - 1 ? entries[index + 1] : null
    };
  },

  // 편의 보상 유물 id·이름을 읽어 온다(각 편 JSON을 한 번씩만 읽고 캐시).
  async rewardKeys(mudId) {
    if (this.rewardKeysByMudId.has(mudId)) return this.rewardKeysByMudId.get(mudId);
    let keys = [];
    try {
      const res = await fetch(`data/mud/${mudId}.json`, { cache: 'no-store' });
      if (res.ok) {
        const mudData = await res.json();
        keys = (mudData.rewards || []).flatMap(r => [r.name, r.artifactId].filter(Boolean));
      }
    } catch (err) {
      console.warn(`LessonTrack: ${mudId} 보상 정보를 불러오지 못했습니다.`, err);
    }
    this.rewardKeysByMudId.set(mudId, keys);
    return keys;
  },

  isCompleted(keys) {
    const unlocked = window.encyclopedia?.data?.unlockedArtifacts || [];
    return keys.some(key => unlocked.includes(key));
  },

  // --- 렌더링 ---
  async renderStrip(containerId, currentMudId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const entries = await this.load();
    if (!entries.length) { container.innerHTML = ''; return; }

    const statuses = await Promise.all(entries.map(async entry => {
      if (entry.mudId === currentMudId) return 'current';
      const keys = await this.rewardKeys(entry.mudId);
      return this.isCompleted(keys) ? 'done' : 'todo';
    }));

    const doneCount = statuses.filter(s => s === 'done' || s === 'current').length;
    const items = entries.map((entry, i) => {
      const status = statuses[i];
      // 색만으로 구분하지 않는다: 상태마다 다른 기호(✓/●/○)를 함께 쓴다.
      const mark = status === 'done' ? '✓' : status === 'current' ? '●' : '○';
      const label = status === 'todo'
        ? `${entry.eraLabel} · ${entry.shortTitle} (아직 하지 않음)`
        : `${entry.eraLabel} · ${entry.shortTitle}`;
      return `<button type="button" class="lesson-track-item is-${status}" data-mud-id="${entry.mudId}" aria-label="${label}" title="${label}">
        <span class="lesson-track-mark" aria-hidden="true">${mark}</span>
        <span class="lesson-track-title">${entry.shortTitle}</span>
      </button>`;
    }).join('');

    container.innerHTML = `
      <div class="lesson-track-head">
        <span class="lesson-track-heading">전체 탐구 진도 (${doneCount}/${entries.length})</span>
      </div>
      <div class="lesson-track-strip" role="list" aria-label="정규 탐구 편 전체 진도 띠">${items}</div>
    `;

    container.querySelectorAll('.lesson-track-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const mudId = btn.getAttribute('data-mud-id');
        if (window.MudEngine) window.MudEngine.openMUD(mudId);
      });
    });
  },

  // 완료 화면의 이전/다음 차시 이동 버튼.
  async renderCompletionNav(currentMudId) {
    await this.load();
    if (!this.entries.length || !currentMudId) return '';
    const { prev, next } = this.neighbors(currentMudId);
    if (!prev && !next) return '';

    const navButton = (entry, direction) => {
      if (!entry) return `<span class="lesson-track-nav-btn is-disabled" aria-hidden="true"></span>`;
      const arrow = direction === 'prev' ? '←' : '→';
      const dirLabel = direction === 'prev' ? '이전 차시' : '다음 차시';
      const label = `${dirLabel}: ${entry.eraLabel} · ${entry.shortTitle}`;
      return `<button type="button" class="lesson-track-nav-btn" onclick="window.MudEngine.openMUD('${entry.mudId}')" aria-label="${label}">
        ${direction === 'prev' ? `${arrow} ${dirLabel}` : `${dirLabel} ${arrow}`}
        <span class="lesson-track-nav-sub">${entry.eraLabel} · ${entry.shortTitle}</span>
      </button>`;
    };

    return `
      <div class="lesson-track-nav">
        ${navButton(prev, 'prev')}
        ${navButton(next, 'next')}
      </div>
      <details class="lesson-track-details">
        <summary>전체 진도 띠 보기</summary>
        <div id="lesson-track-completion-strip"></div>
      </details>
    `;
  },

  // renderCompletionNav가 만든 <details> 안의 띠는 열릴 때만 그린다(초기 렌더 비용 절감).
  bindCompletionDetails(currentMudId) {
    const details = document.querySelector('.lesson-track-details');
    if (!details) return;
    let rendered = false;
    details.addEventListener('toggle', () => {
      if (details.open && !rendered) {
        rendered = true;
        this.renderStrip('lesson-track-completion-strip', currentMudId);
      }
    });
  }
};

window.LessonTrack = LessonTrack;
