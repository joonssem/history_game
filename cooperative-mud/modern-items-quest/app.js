/*
 * 숨은 근대 문물 찾기 — 화면 흐름(흥선대원군·강화도 조약 활동과 같은 틀)
 *   소개 → 모둠 인원·내 번호 → 설명 카드 4개(이름 맞히기) → 사진 3장(그림에서 찾기) → 돌아보기 → 완료
 * 문제·정답·그림 속 위치는 quest.js에 있다. 학생 이름·학번은 받지 않고, 기록은 이 기기 안에만 남는다.
 */
(function () {
  'use strict';

  const Q = window.ModernItemsQuest;
  if (!Q) return;

  const app = document.getElementById('app');
  const progressStep = document.getElementById('progress-step');
  const progressValue = document.getElementById('progress-value');

  const stepLabels = { intro: '활동 소개', setup: '내 번호 고르기', hub: '설명 읽기', card: '이름 맞히기', find: '사진에서 찾기', review: '돌아보기', finish: '완료' };
  const TOTAL = Q.cards.length + Q.scenes.length;

  function defaultState() {
    return { step: 'intro', size: null, seat: null, current: null, done: [], text: {}, tries: {}, unlocked: {}, found: {}, miss: {}, sel: null, group: null, why: '' };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(Q.storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') return Object.assign(defaultState(), saved);
      }
    } catch (e) { /* 저장소를 못 써도 활동은 진행된다 */ }
    return defaultState();
  }
  function save() { try { localStorage.setItem(Q.storageKey, JSON.stringify(state)); } catch (e) { /* 무시 */ } }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function norm(t) { return String(t || '').toLowerCase().replace(/[\s,.·、]/g, ''); }
  function go(step, current) {
    state.step = step;
    if (current !== undefined) state.current = current;
    state.sel = null;
    save(); render(); window.scrollTo(0, 0);
  }
  function cardById(id) { return Q.cards.filter(function (c) { return c.id === id; })[0]; }
  function sceneById(id) { return Q.scenes.filter(function (s) { return s.id === id; })[0]; }
  function allCardsDone() { return Q.cards.every(function (c) { return state.done.indexOf(c.id) >= 0; }); }
  function sceneDone(s) { return s.items.every(function (it) { return state.found[it.key]; }); }
  function allScenesDone() { return Q.scenes.every(sceneDone); }
  function doneCount() { return state.done.length + Q.scenes.filter(sceneDone).length; }

  function canRead(card) {
    if (state.unlocked[card.id] || state.size === 'solo') return true;
    const owners = (Q.owners[String(state.size)] || {})[card.id] || [];
    return owners.indexOf(state.seat) >= 0;
  }
  function ownersText(card) {
    const o = (Q.owners[String(state.size)] || {})[card.id] || [];
    return o.map(function (n) { return n + '번'; }).join(', ');
  }

  function updateProgress() {
    const inPlay = state.step === 'hub' || state.step === 'card' || state.step === 'find';
    progressStep.textContent = stepLabels[state.step] + (inPlay ? ' (' + doneCount() + '/' + TOTAL + ')' : '');
    const frac = { intro: 0.03, setup: 0.06, review: 0.92, finish: 1 };
    progressValue.style.width = Math.round((inPlay ? 0.1 + 0.8 * doneCount() / TOTAL : frac[state.step]) * 100) + '%';
  }

  // ── 교사 확인 숫자 ────────────────────────────────────────
  function gateHtml(label) {
    return '<details class="gate-details"><summary>' + esc(label) + '</summary>' +
      '<div class="gate-box"><label class="form-label" for="gate">선생님이 알려 주는 숫자</label>' +
      '<input id="gate" class="quest-field" type="password" inputmode="numeric" maxlength="8" autocomplete="off">' +
      '<div class="button-row"><button id="gate-btn" class="secondary-button" type="button">교사 확인</button></div>' +
      '<p id="gate-err" class="error-note" hidden>확인 숫자가 맞지 않아요.</p></div></details>';
  }
  function bindGate(onOk) {
    const input = document.getElementById('gate');
    if (!input) return;
    const err = document.getElementById('gate-err');
    function check() { if (norm(input.value) === Q.classConfig.teacherCode) onOk(); else { err.hidden = false; input.value = ''; } }
    document.getElementById('gate-btn').addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
  }

  // ── 이름 칸 ───────────────────────────────────────────────
  function blankHtml(b, okAll) {
    return '<div class="part-block"><p class="screen-description"><b>' + esc(b.q) + '</b></p>' +
      '<p class="initial-hint">초성 힌트: <span>' + esc(b.initials) + '</span></p>' +
      '<input class="quest-field sc-lock' + (okAll ? ' is-ok' : '') + '" data-k="' + esc(b.key) + '" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" value="' + esc(state.text[b.key] || '') + '"></div>';
  }
  function blankOk(b) { return b.accept.map(norm).indexOf(norm(state.text[b.key])) >= 0; }

  // ── 화면들 ────────────────────────────────────────────────
  const screens = {
    intro: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<span class="badge-extra">교과서 105~108쪽 + 보충 활동</span>' +
        '<h2 class="screen-title">' + esc(Q.intro.title) + '</h2>' +
        '<div class="story-box">' + esc(Q.intro.back) + '</div>' +
        '<div class="story-box">' + esc(Q.intro.story) + '</div>' +
        '<ul class="rules">' + Q.intro.rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">활동 시작하기</button></div>' +
        '</div></section>';
      document.getElementById('next').addEventListener('click', function () { go('setup'); });
    },

    setup: function () {
      const sizes = [['3', '3명'], ['4', '4명'], ['5', '5명'], ['solo', '혼자 하기']];
      const sizeBtns = sizes.map(function (s) {
        return '<button class="choice-button' + (String(state.size) === s[0] ? ' is-selected' : '') + '" type="button" data-size="' + s[0] + '">' + s[1] + '</button>';
      }).join('');
      const n = state.size && state.size !== 'solo' ? Number(state.size) : 0;
      let seatBtns = '';
      for (let i = 1; i <= n; i += 1) seatBtns += '<button class="choice-button' + (state.seat === i ? ' is-selected' : '') + '" type="button" data-seat="' + i + '">' + i + '번</button>';
      const ready = state.size === 'solo' || (n && state.seat);
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">우리 모둠과 내 번호</h2>' +
        '<p class="screen-description">오늘 우리 모둠 인원과 내 번호를 고르세요. 이름은 입력하지 않습니다. 번호마다 읽을 수 있는 설명이 달라요.</p>' +
        '<label class="form-label">오늘 모둠 인원</label><div class="choice-grid" role="group">' + sizeBtns + '</div>' +
        (n ? '<label class="form-label">내 번호</label><div class="choice-grid" role="group">' + seatBtns + '</div>' : '') +
        (state.size === 'solo' ? '<p class="paper-note">혼자 하기에서는 모든 설명이 보입니다.</p>' : '') +
        '<div class="button-row"><button id="next" class="primary-button" type="button"' + (ready ? '' : ' disabled') + '>설명 읽으러 가기</button></div>' +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('[data-size]'), function (el) {
        el.addEventListener('click', function () {
          const v = el.getAttribute('data-size');
          state.size = v === 'solo' ? 'solo' : Number(v);
          if (state.size === 'solo' || state.seat > state.size) state.seat = null;
          save(); render();
        });
      });
      Array.prototype.forEach.call(app.querySelectorAll('[data-seat]'), function (el) {
        el.addEventListener('click', function () { state.seat = Number(el.getAttribute('data-seat')); save(); render(); });
      });
      const nx = document.getElementById('next');
      if (nx) nx.addEventListener('click', function () { go('hub', null); });
    },

    hub: function () {
      const cards = Q.cards.map(function (c) {
        const done = state.done.indexOf(c.id) >= 0;
        const mine = canRead(c);
        return '<button class="mission-card' + (done ? ' is-done' : '') + '" type="button" data-c="' + c.id + '">' +
          '<b>카드 ' + c.no + '</b><small>' + esc(c.title) + ' (' + esc(c.tag) + ')</small><small>' + (done ? '✔ 이름 맞힘' : mine ? '📖 내가 읽는 설명' : '🗣 ' + esc(ownersText(c)) + ' 친구에게 물어보기') + '</small></button>';
      }).join('');
      const ready = allCardsDone();
      const scenes = Q.scenes.map(function (s) {
        const done = sceneDone(s);
        const got = s.items.filter(function (it) { return state.found[it.key]; }).length;
        return '<button class="mission-card' + (done ? ' is-done' : '') + (ready ? '' : ' is-locked') + '" type="button" data-s="' + s.id + '"' + (ready ? '' : ' disabled') + '>' +
          '<b>사진 ' + s.no + '</b><small>숨은 문물 ' + s.items.length + '개</small><small>' + (done ? '✔ 모두 찾음' : ready ? '🔍 ' + got + ' / ' + s.items.length + '개 찾음' : '🔒 이름을 모두 맞히면 열려요') + '</small></button>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">설명 카드와 사진</h2>' +
        '<p class="screen-description">내 번호는 <b>' + (state.size === 'solo' ? '혼자 하기' : state.seat + '번') + '</b>입니다. ① 읽을 수 있는 설명은 직접 읽고, 다른 설명은 해당 번호 친구에게 말로 들어 이름 열한 개를 모두 알아내세요. ② 그다음 사진 세 장에서 문물을 찾아 누릅니다. (' + doneCount() + ' / ' + TOTAL + ')</p>' +
        '<h3>① 이름 맞히기</h3><div class="mission-grid">' + cards + '</div>' +
        '<h3>② 사진에서 찾기</h3><div class="mission-grid">' + scenes + '</div>' +
        (ready && allScenesDone() ? '<div class="button-row"><button id="to-review" class="primary-button" type="button">돌아보기로 가기</button></div>' : '') +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('[data-c]'), function (el) {
        el.addEventListener('click', function () { go('card', el.getAttribute('data-c')); });
      });
      Array.prototype.forEach.call(app.querySelectorAll('[data-s]:not([disabled])'), function (el) {
        el.addEventListener('click', function () { go('find', el.getAttribute('data-s')); });
      });
      const tr = document.getElementById('to-review');
      if (tr) tr.addEventListener('click', function () { go('review'); });
    },

    card: function () {
      const c = cardById(state.current);
      if (!c) { go('hub', null); return; }
      const done = state.done.indexOf(c.id) >= 0;
      const read = canRead(c);
      const body = read
        ? c.clues.map(function (cl) {
          return '<div class="sec sec-text"><b class="sec-label">📖 설명 ' + cl.n + ' <span class="ref-tag">' + esc(cl.ref) + '</span></b>' + esc(cl.text) + '</div>';
        }).join('')
        : '<div class="story-box locked-chat">🗣 이 설명은 <b>' + esc(ownersText(c)) + '</b> 친구가 읽을 수 있어요. 화면을 보지 말고 말로 들려 달라고 부탁해 보세요. 어떤 물건인지 물어보며 아래 이름을 채우세요.</div>';
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">카드 ' + c.no + '. ' + esc(c.title) + '</h2>' +
        '<span class="mission-tag">' + esc(c.tag) + '</span>' + body +
        c.blanks.map(function (b) { return blankHtml(b, done); }).join('') +
        '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button>' +
        '<button id="back-hub" class="secondary-button" type="button">목록으로</button></div>' +
        '<p id="sc-msg" hidden></p>' +
        (done || read ? '' : gateHtml('친구와 연결이 안 된다면 (선생님 확인으로 설명 보기)')) +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('input[data-k]'), function (el) {
        el.addEventListener('input', function () { state.text[el.getAttribute('data-k')] = el.value; save(); el.classList.remove('is-ok'); });
      });
      document.getElementById('back-hub').addEventListener('click', function () { go('hub', null); });
      document.getElementById('sc-check').addEventListener('click', function () { checkCard(c); });
      bindGate(function () { state.unlocked[c.id] = true; save(); render(); });
      if (done) lockPassed('이름을 모두 맞혔어요!');
    },

    find: function () {
      const s = sceneById(state.current);
      if (!s) { go('hub', null); return; }
      const done = sceneDone(s);
      const rings = s.items.map(function (it) {
        const hit = state.found[it.key];
        const hintOn = !hit && (state.miss[it.key] || 0) >= 2;
        if (hit) return '<div class="ring is-found" style="left:' + it.x + '%;top:' + it.y + '%;width:' + (it.r * 2) + '%"><span>' + esc(it.name) + '</span></div>';
        if (hintOn) return '<div class="ring is-hint" style="left:' + it.x + '%;top:' + it.y + '%;width:' + (it.r * 5) + '%"></div>';
        return '';
      }).join('');
      const chips = s.items.map(function (it) {
        const hit = state.found[it.key];
        return '<button class="chip' + (hit ? ' is-found' : '') + (state.sel === it.key ? ' is-selected' : '') + '" type="button" data-i="' + it.key + '"' + (hit ? ' disabled' : '') + '>' + (hit ? '✔ ' : '') + esc(it.name) + '</button>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">사진 ' + s.no + '. 숨은 문물 ' + s.items.length + '개를 찾아라</h2>' +
        '<p class="screen-description">① 아래에서 찾을 이름을 고르고 ② 사진에서 그 물건을 눌러 보세요. 모둠 친구와 어디에 있는지 이야기해도 좋아요.</p>' +
        '<div class="chip-row" role="group" aria-label="찾을 문물">' + chips + '</div>' +
        '<p id="find-msg" class="screen-description" aria-live="polite">' + (done ? '✔ 이 사진의 문물을 모두 찾았어요!' : state.sel ? '사진에서 “' + esc(nameOf(s, state.sel)) + '”을(를) 눌러 보세요.' : '찾을 이름을 먼저 골라 주세요.') + '</p>' +
        '<div class="scene-wrap" id="scene"><img src="' + esc(s.src) + '" alt="' + esc(s.alt) + '" draggable="false">' + rings + '</div>' +
        '<div class="button-row"><button id="back-hub" class="secondary-button" type="button">목록으로</button>' +
        (done ? '<button id="next-scene" class="primary-button" type="button">' + (nextSceneId(s) ? '다음 사진으로' : '목록에서 돌아보기로') + '</button>' : '') + '</div>' +
        (done ? '' : gateHtml('막혔다면 (선생님 확인으로 이 사진 넘어가기)')) +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.chip:not([disabled])'), function (el) {
        el.addEventListener('click', function () { state.sel = el.getAttribute('data-i'); save(); render(); });
      });
      document.getElementById('scene').addEventListener('click', function (e) { onSceneTap(e, s); });
      document.getElementById('back-hub').addEventListener('click', function () { go('hub', null); });
      const nx = document.getElementById('next-scene');
      if (nx) nx.addEventListener('click', function () { const n = nextSceneId(s); if (n) go('find', n); else go('hub', null); });
      bindGate(function () { s.items.forEach(function (it) { state.found[it.key] = true; }); save(); render(); });
    },

    review: function () {
      const r = Q.review;
      const buttons = r.groups.map(function (g) {
        return '<button class="choice-button' + (state.group === g ? ' is-selected' : '') + '" type="button" data-p="' + esc(g) + '">' + esc(g) + '</button>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">돌아보기</h2>' +
        '<p class="screen-description">' + esc(r.prompt) + '</p>' +
        '<div class="choice-grid" role="group">' + buttons + '</div>' +
        '<label class="form-label" for="why">' + esc(r.whyPrompt) + '</label>' +
        '<textarea id="why" class="quest-field" placeholder="' + esc(r.whyPlaceholder) + '">' + esc(state.why) + '</textarea>' +
        '<p id="err" class="error-note" hidden>하나를 고르고, 까닭을 한 문장 이상 써 주세요.</p>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">마치기</button></div>' +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (el) {
        el.addEventListener('click', function () {
          state.group = el.getAttribute('data-p'); save();
          Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (b) { b.classList.toggle('is-selected', b === el); });
        });
      });
      document.getElementById('why').addEventListener('input', function (e) { state.why = e.target.value; save(); });
      document.getElementById('next').addEventListener('click', function () {
        if (!state.group || state.why.trim().length < 6) { document.getElementById('err').hidden = false; return; }
        go('finish');
      });
    },

    finish: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">' + esc(Q.finishTitle) + '</h2>' +
        '<div class="story-box"><b>내가 고른 갈래: ' + esc(state.group || '') + '</b><br>' + esc(state.why) + '</div>' +
        '<div class="story-box">' + esc(Q.finish.note) + '</div>' +
        '<p class="paper-note">쓴 글은 이 기기 안에만 남습니다. 선생님께 보여 주고 싶다면 화면을 보여 주세요.</p>' +
        '<div class="button-row"><button id="again" class="secondary-button" type="button">처음부터 다시 하기</button><a class="link-button" href="../">모둠 역사 탐험 허브로</a></div>' +
        '</div></section>';
      document.getElementById('again').addEventListener('click', function () {
        if (window.confirm('처음부터 다시 하면 지금까지 쓴 내용이 지워져요. 계속할까요?')) {
          state = defaultState(); save(); render(); window.scrollTo(0, 0);
        }
      });
    }
  };

  function nameOf(s, key) { return s.items.filter(function (it) { return it.key === key; })[0].name; }
  function nextSceneId(s) {
    const i = Q.scenes.indexOf(s);
    return Q.scenes[i + 1] ? Q.scenes[i + 1].id : null;
  }

  function lockPassed(text) {
    const box = document.getElementById('sc-msg');
    if (box) { box.className = 'ok-text'; box.hidden = false; box.textContent = '✔ ' + text; }
    Array.prototype.forEach.call(app.querySelectorAll('.sc-lock'), function (el) { el.disabled = true; });
  }

  function checkCard(c) {
    const box = document.getElementById('sc-msg');
    let right = 0;
    c.blanks.forEach(function (b) {
      const ok = blankOk(b);
      const el = app.querySelector('input[data-k="' + b.key + '"]');
      if (el) el.classList.toggle('is-ok', ok);
      if (ok) right += 1;
    });
    if (right === c.blanks.length) {
      if (state.done.indexOf(c.id) < 0) state.done.push(c.id);
      save();
      box.className = 'ok-text'; box.hidden = false;
      box.innerHTML = '맞아요! 이 문물의 모습을 사진에서 찾아보게 될 거예요.<div class="button-row"><button id="to-hub" class="primary-button" type="button">목록으로</button></div>';
      Array.prototype.forEach.call(app.querySelectorAll('.sc-lock'), function (el) { el.disabled = true; });
      document.getElementById('to-hub').addEventListener('click', function () { go('hub', null); });
      return;
    }
    state.tries[c.id] = (state.tries[c.id] || 0) + 1; save();
    box.className = 'error-note'; box.hidden = false;
    let msg = esc(c.blanks.length + '칸 중 ' + right + '칸이 맞아요. 초록색이 아닌 칸을 다시 확인해 보세요.');
    if (state.tries[c.id] >= 2) {
      const hints = c.blanks.map(function (b) { return blankOk(b) ? '' : '💡 ' + esc(b.hint); }).filter(Boolean);
      msg += '<br>' + hints.join('<br>');
    }
    box.innerHTML = msg;
  }

  // 사진을 눌렀을 때: 고른 이름의 위치와 가까우면 찾은 것으로 한다(손가락이 정확하지 않아도 되도록 반지름의 1.3배까지 인정).
  function onSceneTap(e, s) {
    const msg = document.getElementById('find-msg');
    if (!state.sel) { msg.textContent = '찾을 이름을 먼저 골라 주세요.'; return; }
    const it = s.items.filter(function (x) { return x.key === state.sel; })[0];
    const rect = document.getElementById('scene').getBoundingClientRect();
    const xp = (e.clientX - rect.left) / rect.width * 100;
    const yp = (e.clientY - rect.top) / rect.height * 100;
    const dx = (xp - it.x) / 100 * 1920;
    const dy = (yp - it.y) / 100 * 1080;
    const limit = it.r / 100 * 1920 * 1.3;
    if (Math.sqrt(dx * dx + dy * dy) <= limit) {
      state.found[it.key] = true; state.sel = null; save(); render();
      const m2 = document.getElementById('find-msg');
      if (m2 && !sceneDone(s)) m2.textContent = '찾았어요! ' + it.name + ' 다음 이름을 골라 보세요.';
    } else {
      state.miss[it.key] = (state.miss[it.key] || 0) + 1; save();
      render();
      const m3 = document.getElementById('find-msg');
      if (m3) m3.textContent = '여기는 아니에요. 설명을 다시 떠올리며 찾아보세요.' + ((state.miss[it.key] || 0) >= 2 ? ' (점선 동그라미 안을 살펴보세요)' : '');
    }
  }

  function render() {
    updateProgress();
    (screens[state.step] || screens.intro)();
  }

  render();
})();
