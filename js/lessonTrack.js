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
  // 사양서(docs/plans/implementation_plan_lesson_track_ui.md) §1~§4·§7을 따른다.
  // 상태는 색이 아니라 아이콘·테두리 종류·글자 라벨 세 채널로 구분한다(색각 이상 고려).
  statusMark(status) {
    return status === 'done' ? '✓' : status === 'current' ? '📍' : '';
  },

  statusLabel(status) {
    return status === 'done' ? '완료' : status === 'current' ? '지금' : '';
  },

  // 띠는 배운 순서이지 연대순이 아니다. 같은 시기에 있던 두 시대는 칸 설명에서 서로를 가리킨다(§7-2).
  overlapNote(entry) {
    if (entry.eraLabel === '통일신라') return ', 발해와 같은 시기가 있었어요';
    if (entry.eraLabel === '발해') return ', 통일신라와 같은 시기가 있었어요';
    return '';
  },

  // order 순서에서 완료하지 않은 것 중 가장 앞선 편이 "지금"이다(§2-1).
  async computeStatuses(entries, currentMudId) {
    const done = await Promise.all(entries.map(async entry => {
      const keys = await this.rewardKeys(entry.mudId);
      return this.isCompleted(keys);
    }));
    let currentIndex = currentMudId
      ? entries.findIndex(e => e.mudId === currentMudId)
      : -1;
    if (currentIndex < 0) currentIndex = done.findIndex(v => !v);
    return entries.map((entry, i) => {
      if (i === currentIndex) return 'current';
      return done[i] ? 'done' : 'todo';
    });
  },

  itemHtml(entry, status) {
    const mark = this.statusMark(status);
    const stateLabel = this.statusLabel(status);
    const range = entry.eraRange ? ` (${entry.eraRange}${this.overlapNote(entry)})` : '';
    const label = `${entry.eraLabel} · ${entry.shortTitle}${range}${stateLabel ? ` — ${stateLabel}` : ''}`;
    return `<button type="button" class="lesson-track-item is-${status}" role="listitem" data-mud-id="${entry.mudId}" aria-label="${label}" title="${label}">
      <span class="lesson-track-mark" aria-hidden="true">${mark}</span>
      <span class="lesson-track-era">${entry.eraLabel}</span>
      <span class="lesson-track-title">${entry.shortTitle}</span>
      <span class="lesson-track-state" aria-hidden="true">${stateLabel}</span>
    </button>`;
  },

  // 단원별로 한 줄씩 나눈다. 한 줄 28칸은 태블릿에서도 터치 목표 44px을 못 지킨다(§4-1).
  async renderStrip(containerId, currentMudId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const entries = await this.load();
    if (!entries.length) { container.innerHTML = ''; return; }

    const statuses = await this.computeStatuses(entries, currentMudId);
    const byUnit = new Map();
    entries.forEach((entry, i) => {
      if (!byUnit.has(entry.unitId)) byUnit.set(entry.unitId, []);
      byUnit.get(entry.unitId).push({ entry, status: statuses[i] });
    });

    const rows = [...byUnit.entries()].sort((a, b) => a[0] - b[0]).map(([unitId, list]) => `
      <div class="lesson-track-row">
        <span class="lesson-track-unit">${unitId}단원</span>
        <div class="lesson-track-strip" role="list" aria-label="${unitId}단원 탐구 편">
          ${list.map(({ entry, status }) => this.itemHtml(entry, status)).join('')}
        </div>
      </div>`).join('');

    container.innerHTML = `
      <div class="lesson-track-head">
        <span class="lesson-track-heading">🧭 나의 역사 탐구 순서</span>
        <p class="lesson-track-caption">이 띠는 배운 순서예요. 실제 연대순은 아니에요 — 예를 들어 통일신라와 발해는 같은 시대에 함께 있었어요. 완료한 차시는 다시 볼 수 있고, 아직 하지 않은 차시를 눌러 바로 시작할 수 있어요.</p>
      </div>
      ${rows}
    `;

    container.querySelectorAll('.lesson-track-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const mudId = btn.getAttribute('data-mud-id');
        if (window.MudEngine) window.MudEngine.openMUD(mudId);
      });
    });

    // "지금" 칸이 보이도록 한 번만 맞춘다. 애니메이션 없이 즉시 이동한다(§1-2, §4-3).
    const current = container.querySelector('.lesson-track-item.is-current');
    if (current) {
      const strip = current.closest('.lesson-track-strip');
      if (strip && strip.scrollWidth > strip.clientWidth) {
        strip.scrollLeft = Math.max(0, current.offsetLeft - strip.clientWidth / 2 + current.offsetWidth / 2);
      }
    }
  },

  // 완료 화면의 이전/다음 차시 이동 버튼.
  async renderCompletionNav(currentMudId) {
    await this.load();
    if (!this.entries.length || !currentMudId) return '';
    const { prev, next } = this.neighbors(currentMudId);
    if (!prev && !next) return '';

    // 없는 방향은 자리표시자도 남기지 않는다. 누를 수 없는 버튼을 보여 주지 않기 위해서다(§1-3).
    const navButton = (entry, direction) => {
      if (!entry) return '';
      const text = direction === 'prev' ? '◀ 이전 차시로' : '다음 차시로 ▶';
      const dirLabel = direction === 'prev' ? '이전 차시' : '다음 차시';
      const label = `${dirLabel}: ${entry.eraLabel} · ${entry.shortTitle}`;
      return `<button type="button" class="lesson-track-nav-btn" onclick="window.MudEngine.openMUD('${entry.mudId}')" aria-label="${label}">
        ${text}
        <span class="lesson-track-nav-sub">${entry.eraLabel} · ${entry.shortTitle}</span>
      </button>`;
    };

    return `
      <div class="lesson-track-nav">
        ${navButton(prev, 'prev')}
        ${navButton(next, 'next')}
      </div>
    `;
  },

  // 포털(진도표) 화면의 상시 띠. 단원 탭을 바꿔도 28편 전체를 그대로 보여 준다(§1-2).
  renderPortal() {
    return this.renderStrip('lesson-track-portal', null);
  }
};

window.LessonTrack = LessonTrack;
