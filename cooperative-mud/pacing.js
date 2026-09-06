/*
 * 협동 MUD 공용 타이머 페이싱
 * docs/plans/COLLABORATIVE_MUD_PLAN.md §12-3
 *
 * 활동 시작 때 고른 길이(5분형/10분형)를 시간 예산으로 삼고, 화면별 목표 시간과
 * 실제 경과를 견주어 느리면 질문형 힌트를, 빠르면 심화 질문을 띄운다.
 *
 * 원칙
 * - 서버가 필요 없다. 각 기기가 자기 시계와 자기 진행도만 본다.
 * - 판정은 관대하게. 목표를 크게 벗어났을 때만 반응한다.
 * - 힌트는 답이 아니라 질문이다.
 * - 화면을 덮지 않는다. 작은 배지만 나타나고 학생이 눌러야 펼쳐진다.
 * - 남은 시간 숫자를 학생에게 보여 주지 않는다.
 */
window.CoopPacing = (function () {
  'use strict';

  // 기본 감도. 관대하게 잡아 두고, 필요하면 시나리오가 init에서 덮어쓴다.
  const DEFAULTS = {
    slowRatio: 1.5,   // 화면 목표 시간의 1.5배를 넘기면 힌트
    fastRatio: 0.6,   // 누적 목표의 60% 미만으로 앞서가면 심화
    minTarget: 25,    // 목표가 이보다 짧은 화면은 느림 판정을 하지 않는다
    minCumulative: 60 // 누적 목표가 이보다 짧으면 빠름 판정을 하지 않는다
  };

  let config = null;
  let tuning = DEFAULTS;
  let order = [];
  let root = null;
  let badge = null;
  let text = null;
  let startedAt = 0;
  let slowTimer = 0;
  let currentMode = null;

  function budgetFor(mode) {
    return (config.budgets && config.budgets[mode]) || {};
  }

  function targetOf(screenId, mode) {
    return budgetFor(mode)[screenId] || 0;
  }

  function cumulativeBefore(screenId, mode) {
    const budget = budgetFor(mode);
    let sum = 0;
    for (let i = 0; i < order.length; i += 1) {
      if (order[i] === screenId) break;
      sum += budget[order[i]] || 0;
    }
    return sum;
  }

  function hide() {
    if (slowTimer) { window.clearTimeout(slowTimer); slowTimer = 0; }
    if (!root) return;
    root.hidden = true;
    root.classList.remove('is-slow', 'is-fast');
    if (text) { text.hidden = true; text.textContent = ''; }
  }

  function show(kind, message) {
    if (!root || !badge || !text) return;
    root.hidden = false;
    root.classList.remove('is-slow', 'is-fast');
    root.classList.add(kind === 'slow' ? 'is-slow' : 'is-fast');
    badge.textContent = kind === 'slow' ? '💡 도움이 필요한가요?' : '🔎 더 살펴볼까요?';
    badge.setAttribute('aria-expanded', 'false');
    text.hidden = true;
    text.textContent = message;
  }

  function promptFor(screenId, kind) {
    const prompts = config.prompts || {};
    const entry = prompts[screenId];
    return entry ? entry[kind] : null;
  }

  return {
    /**
     * @param {object} options
     *   rootId/badgeId/textId  화면 요소 id
     *   order                  화면 진행 순서 (누적 목표 계산용)
     *   budgets                { '5': {screenId: 초}, '10': {...} }
     *   prompts                { screenId: { slow: '질문', fast: '질문' } }
     *   tuning                 (선택) slowRatio/fastRatio/minTarget/minCumulative
     */
    init: function (options) {
      config = options;
      tuning = Object.assign({}, DEFAULTS, options.tuning || {});
      order = options.order || [];
      root = document.getElementById(options.rootId);
      badge = document.getElementById(options.badgeId);
      text = document.getElementById(options.textId);
      if (badge) {
        badge.addEventListener('click', function () {
          if (!text) return;
          const opening = text.hidden;
          text.hidden = !opening;
          badge.setAttribute('aria-expanded', opening ? 'true' : 'false');
        });
      }
      hide();
    },

    /** 실제 학습이 시작되는 시점에 한 번 호출한다. */
    start: function (mode) {
      startedAt = Date.now();
      currentMode = mode;
      hide();
    },

    /** 활동 길이를 도중에 바꿨을 때. */
    setMode: function (mode) {
      currentMode = mode;
    },

    /** 화면이 바뀔 때마다 호출한다. */
    enter: function (screenId) {
      hide();
      if (!config || !startedAt || !currentMode) return;
      const target = targetOf(screenId, currentMode);
      if (!target) return;

      const elapsed = (Date.now() - startedAt) / 1000;
      const cum = cumulativeBefore(screenId, currentMode);
      const fastPrompt = promptFor(screenId, 'fast');
      if (fastPrompt && cum >= tuning.minCumulative && elapsed < cum * tuning.fastRatio) {
        show('fast', fastPrompt);
        return;
      }

      const slowPrompt = promptFor(screenId, 'slow');
      if (!slowPrompt || target < tuning.minTarget) return;
      slowTimer = window.setTimeout(function () {
        show('slow', slowPrompt);
      }, target * tuning.slowRatio * 1000);
    },

    /** 활동이 끝났거나 기록을 지웠을 때. */
    stop: function () {
      startedAt = 0;
      currentMode = null;
      hide();
    }
  };
}());
