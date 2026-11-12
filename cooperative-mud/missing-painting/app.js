/*
 * 사라진 그림을 찾아라 — 화면 흐름
 *   활동 소개 → 미션 12개(순서 자유, 미션 목록) → 추리 조각 맞추기 → 인물 공개 → 돌아보기 → 완료
 * 문제·정답·학급 설정은 quest.js에 있다. 이 파일에는 넣지 않는다.
 */
(function () {
  'use strict';

  const Q = window.MissingPainting;
  if (!Q) return;

  const app = document.getElementById('app');
  const progressStep = document.getElementById('progress-step');
  const progressCount = document.getElementById('progress-count');
  const progressValue = document.getElementById('progress-value');

  const steps = [
    { id: 'intro', label: '사건 의뢰' },
    { id: 'hub', label: '미션 풀기' },
    { id: 'mission', label: '미션 풀기' },
    { id: 'puzzle', label: '추리 조각 맞추기' },
    { id: 'reveal', label: '인물 공개' },
    { id: 'review', label: '돌아보기' },
    { id: 'finish', label: '완료' }
  ];

  function defaultState() {
    return { step: 'intro', current: null, done: [], work: {}, order: [], personOk: false, culture: null, why: '', reflection: '' };
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

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function norm(text, strip) {
    let t = String(text || '').toLowerCase().replace(/[\s,.·、]/g, '');
    (strip || []).forEach(function (s) { t = t.split(s).join(''); });
    return t;
  }
  function missionById(id) { return Q.missions.filter(function (m) { return m.id === id; })[0]; }
  function w(m) { if (!state.work[m.id]) state.work[m.id] = { picked: {}, text: {}, check: {}, tries: 0 }; return state.work[m.id]; }

  function go(step, current) {
    state.step = step;
    if (current !== undefined) state.current = current;
    save(); render(); window.scrollTo(0, 0);
  }

  function updateProgress() {
    const idx = steps.map(function (s) { return s.id; }).indexOf(state.step);
    const inMissions = state.step === 'hub' || state.step === 'mission';
    progressStep.textContent = steps[idx].label + (inMissions ? ' (' + state.done.length + '/' + Q.missions.length + ')' : '');
    progressCount.textContent = '';
    const frac = { intro: 0.05, puzzle: 0.75, reveal: 0.85, review: 0.92, finish: 1 };
    const value = inMissions ? 0.1 + 0.6 * state.done.length / Q.missions.length : frac[state.step];
    progressValue.style.width = Math.round(value * 100) + '%';
  }

  // ── 교사 확인 코드(막힌 모둠 탈출구) ───────────────────────
  function gateHtml() {
    return '<details class="gate-details"><summary>화면이 안 되거나 막혔다면 (선생님 확인으로 넘어가기)</summary>' +
      '<div class="gate-box"><label class="form-label" for="gate">선생님이 알려 주는 숫자</label>' +
      '<input id="gate" class="quest-field" type="password" inputmode="numeric" maxlength="8" autocomplete="off">' +
      '<div class="button-row"><button id="gate-btn" class="secondary-button" type="button">교사 확인</button></div>' +
      '<p id="gate-err" class="error-note" hidden>확인 숫자가 맞지 않아요.</p></div></details>';
  }
  function bindGate(onOk) {
    const input = document.getElementById('gate');
    const err = document.getElementById('gate-err');
    function check() { if (norm(input.value) === Q.classConfig.teacherCode) onOk(); else { err.hidden = false; input.value = ''; } }
    document.getElementById('gate-btn').addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
  }

  // ── 미션 판정 ──────────────────────────────────────────────
  function partResult(m, part, i) {
    const s = w(m);
    if (part.kind === 'text') return norm(s.text['p' + i], part.strip) !== '' && part.accept.map(function (a) { return norm(a); }).indexOf(norm(s.text['p' + i], part.strip)) >= 0;
    if (part.kind === 'distinct') {
      const acc = part.accept.map(function (a) { return norm(a); });
      const vals = []; for (let k = 0; k < part.count; k += 1) vals.push(norm(s.text['p' + i + '_' + k], part.strip));
      const ok = vals.every(function (v) { return v && acc.indexOf(v) >= 0; });
      return ok && vals.filter(function (v, k) { return vals.indexOf(v) === k; }).length === part.count;
    }
    if (part.kind === 'pick') {
      const ids = Object.keys(s.picked['p' + i] || {}).filter(function (k) { return s.picked['p' + i][k]; });
      const bad = ids.filter(function (id) { return !part.options.filter(function (o) { return o.id === id; })[0].real; });
      if (part.single) return ids.length === 1 && bad.length === 0;
      return ids.length >= (part.min || 1) && bad.length === 0;
    }
    if (part.kind === 'acrostic') {
      return part.chars.every(function (c, k) {
        const line = String(s.text['p' + i + '_' + k] || '').trim();
        return line.charAt(0) === c && line.replace(/\s/g, '').length >= part.minLen;
      });
    }
    if (part.kind === 'confirm') return !!s.check['p' + i];
    if (part.kind === 'free') return String(s.text['p' + i] || '').replace(/\s/g, '').length >= (part.minLen || 1);
    return false;
  }

  // ── 화면 조각 ──────────────────────────────────────────────
  function partHtml(m, part, i) {
    const s = w(m);
    const label = '<p class="screen-description"><b>' + esc(part.label) + '</b></p>';
    if (part.kind === 'free') {
      return '<div class="part-block">' + label + '<textarea class="quest-field sc-lock" data-p="' + i + '" style="min-height:80px">' + esc(s.text['p' + i] || '') + '</textarea></div>';
    }
    if (part.kind === 'text') {
      return '<div class="part-block">' + label + '<input class="quest-field sc-lock" data-p="' + i + '" type="text" autocomplete="off" autocapitalize="off" value="' + esc(s.text['p' + i] || '') + '"></div>';
    }
    if (part.kind === 'distinct') {
      let inputs = '';
      for (let k = 0; k < part.count; k += 1) inputs += '<input class="quest-field sc-lock" data-p="' + i + '_' + k + '" type="text" autocomplete="off" value="' + esc(s.text['p' + i + '_' + k] || '') + '">';
      return '<div class="part-block">' + label + inputs + '</div>';
    }
    if (part.kind === 'acrostic') {
      let inputs = '';
      part.chars.forEach(function (c, k) {
        inputs += '<label class="form-label" for="a' + i + '_' + k + '">' + esc(c) + '</label><input id="a' + i + '_' + k + '" class="quest-field sc-lock" data-p="' + i + '_' + k + '" type="text" autocomplete="off" placeholder="' + esc(c) + '(으)로 시작하는 말" value="' + esc(s.text['p' + i + '_' + k] || '') + '">';
      });
      return '<div class="part-block">' + label + inputs + '</div>';
    }
    if (part.kind === 'pick') {
      const picked = s.picked['p' + i] || {};
      const opts = part.options.map(function (o) {
        return '<button class="choice-button sc-lock' + (picked[o.id] ? ' is-selected' : '') + '" type="button" data-p="' + i + '" data-o="' + o.id + '">' + esc(o.label) + '</button>';
      }).join('');
      return '<div class="part-block">' + label + '<div class="choice-grid" role="group">' + opts + '</div></div>';
    }
    if (part.kind === 'confirm') {
      return '<div class="part-block"><label class="check-row"><input class="sc-lock" type="checkbox" data-c="' + i + '"' + (s.check['p' + i] ? ' checked' : '') + '><span>' + esc(part.label) + '</span></label></div>';
    }
    return '';
  }

  function bindMission(m) {
    const s = w(m);
    Array.prototype.forEach.call(app.querySelectorAll('input[data-p], textarea[data-p]'), function (el) {
      el.addEventListener('input', function () { s.text['p' + el.getAttribute('data-p')] = el.value; save(); });
    });
    Array.prototype.forEach.call(app.querySelectorAll('button[data-o]'), function (el) {
      el.addEventListener('click', function () {
        const i = el.getAttribute('data-p'); const part = m.parts[Number(i)];
        const cur = s.picked['p' + i] || {};
        const id = el.getAttribute('data-o');
        if (part.single) { s.picked['p' + i] = {}; s.picked['p' + i][id] = true; }
        else { cur[id] = !cur[id]; s.picked['p' + i] = cur; }
        Array.prototype.forEach.call(app.querySelectorAll('button[data-p="' + i + '"]'), function (b) {
          const on = !!(s.picked['p' + i] || {})[b.getAttribute('data-o')];
          b.classList.toggle('is-selected', on);
        });
        save();
      });
    });
    Array.prototype.forEach.call(app.querySelectorAll('input[data-c]'), function (el) {
      el.addEventListener('change', function () { s.check['p' + el.getAttribute('data-c')] = el.checked; save(); });
    });
    document.getElementById('sc-check').addEventListener('click', function () {
      const results = m.parts.map(function (p, i) { return partResult(m, p, i); });
      const right = results.filter(Boolean).length;
      const box = document.getElementById('sc-msg');
      if (right === m.parts.length) { pass(m); return; }
      s.tries += 1; save();
      box.className = 'error-note'; box.hidden = false;
      const rejected = m.parts.some(function (p, i) {
        return p.reject && p.reject.map(function (r) { return norm(r); }).indexOf(norm(s.text['p' + i], p.strip)) >= 0;
      });
      if (rejected) {
        box.innerHTML = '이 게임의 다른 미션에 이미 나온 그림 제목은 쓸 수 없어요. 다른 그림을 찾아보세요.';
        return;
      }
      const base = m.parts.length > 1 ? m.parts.length + '개 중 ' + right + '개가 맞아요. 다시 확인해 보세요.' : '아직 아니에요. 다시 생각해 보세요.';
      box.innerHTML = esc(base) + (s.tries >= 2 && m.hint ? '<br>💡 ' + esc(m.hint) : '');
    });
    document.getElementById('back-hub').addEventListener('click', function () { go('hub', null); });
    const g = document.getElementById('gate');
    if (g) bindGate(function () { pass(m); });
  }

  function pass(m) {
    if (state.done.indexOf(m.id) < 0) state.done.push(m.id);
    save();
    const piece = Q.fragments[m.no - 1];
    const box = document.getElementById('sc-msg');
    box.className = 'ok-text'; box.hidden = false;
    box.innerHTML = '맞아요! 괴도 쿄두가 추리 조각을 보냈어요: <span class="piece-btn" style="display:inline-block;line-height:58px;text-align:center">' + esc(piece) + '</span>' +
      '<div class="button-row"><button id="to-hub" class="primary-button" type="button">미션 목록으로</button></div>';
    Array.prototype.forEach.call(app.querySelectorAll('.sc-lock'), function (el) { el.disabled = true; });
    document.getElementById('to-hub').addEventListener('click', function () { go('hub', null); });
  }

  // ── 화면들 ─────────────────────────────────────────────────
  const screens = {
    intro: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">사건 의뢰</h2>' +
        '<div class="story-box">' + esc(Q.intro.story) + '</div>' +
        '<div class="message-box"><b>범인으로부터 온 메시지</b><br>' + esc(Q.intro.message) + '</div>' +
        '<ul class="rules">' + Q.intro.rules.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>' +
        '<p class="paper-note">이 활동은 조선 후기 서민 문화를 즐겁게 복습하기 위한 추리 게임입니다. 사건 이야기는 만든 이야기입니다.</p>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">수사 시작</button></div>' +
        '</div></section>';
      document.getElementById('next').addEventListener('click', function () { go('hub', null); });
    },

    hub: function () {
      const cards = Q.missions.map(function (m) {
        const done = state.done.indexOf(m.id) >= 0;
        return '<button class="mission-card' + (done ? ' is-done' : '') + '" type="button" data-m="' + m.id + '">' +
          (done ? '<span class="piece">' + esc(Q.fragments[m.no - 1]) + '</span>' : '') +
          '<b>미션 ' + m.no + '</b><small>' + esc(m.tag) + (done ? ' · 완료' : '') + '</small></button>';
      }).join('');
      const all = state.done.length === Q.missions.length;
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">미션 목록</h2>' +
        '<p class="screen-description">풀고 싶은 미션부터 골라 보세요. 한 번에 하나씩 풀 수 있고, 끝낸 미션에는 추리 조각이 붙습니다. (' + state.done.length + ' / ' + Q.missions.length + ')</p>' +
        '<div class="mission-grid">' + cards + '</div>' +
        (all ? '<div class="button-row"><button id="to-puzzle" class="primary-button" type="button">추리 조각 맞추러 가기</button></div>'
          : '<p class="paper-note">중간에 정답을 알더라도 12개의 미션을 모두 풀어야 추리 조각을 맞출 수 있어요.</p>') +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.mission-card'), function (el) {
        el.addEventListener('click', function () { go('mission', el.getAttribute('data-m')); });
      });
      const b = document.getElementById('to-puzzle');
      if (b) b.addEventListener('click', function () { go('puzzle'); });
    },

    mission: function () {
      const m = missionById(state.current);
      if (!m) { go('hub', null); return; }
      const done = state.done.indexOf(m.id) >= 0;
      const imgs = (m.images || []).map(function (im) {
        return '<figure class="quest-figure"><img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '"><figcaption>' + esc(im.caption) + '</figcaption></figure>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">미션 ' + m.no + '. ' + esc(m.title) + '</h2>' +
        '<span class="mission-tag">' + esc(m.tag) + '</span>' +
        '<div class="story-box">' + esc(m.story) + '</div>' +
        (imgs ? '<div class="quest-figures">' + imgs + '</div>' : '') +
        m.parts.map(function (p, i) { return partHtml(m, p, i); }).join('') +
        '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button>' +
        '<button id="back-hub" class="secondary-button" type="button">미션 목록으로</button></div>' +
        '<p id="sc-msg" hidden></p>' + (done ? '' : gateHtml()) +
        '</div></section>';
      bindMission(m);
      if (done) pass(m);
    },

    puzzle: function () {
      const pieces = Q.fragments.map(function (c, i) {
        const used = state.order.indexOf(i) >= 0;
        return '<button class="piece-btn' + (used ? ' is-used' : '') + '" type="button" data-i="' + i + '"' + (used ? ' disabled' : '') + '>' + esc(c) + '</button>';
      }).join('');
      let slots = '';
      for (let k = 0; k < Q.fragments.length; k += 1) {
        const idx = state.order[k];
        slots += '<button class="slot' + (idx !== undefined ? ' is-filled' : '') + '" type="button" data-k="' + k + '"' + (idx === undefined ? ' disabled' : '') + '>' + (idx !== undefined ? esc(Q.fragments[idx]) : '') + '</button>';
      }
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">추리 조각 맞추기</h2>' +
        '<p class="screen-description">12개의 조각을 알맞은 순서로 놓으면 인물에 대한 힌트가 됩니다. 조각을 눌러 아래 칸에 차례로 놓고, 잘못 놓은 칸을 누르면 뺄 수 있어요.</p>' +
        '<div class="piece-row" aria-label="추리 조각">' + pieces + '</div>' +
        '<div class="slot-row" aria-label="조합">' + slots + '</div>' +
        '<div class="button-row"><button id="check" class="primary-button" type="button"' + (state.order.length < Q.fragments.length ? ' disabled' : '') + '>이 조합으로 확인</button>' +
        '<button id="clear" class="secondary-button" type="button">모두 빼기</button></div>' +
        '<p id="msg" hidden></p>' +
        (state.personOk ? '' :
          '<label class="form-label" for="person">힌트를 풀었다면, 도난당한 그림을 그린 인물은 누구일까요?</label>' +
          '<input id="person" class="quest-field" type="text" autocomplete="off" placeholder="이름을 써 보세요">' +
          '<div class="button-row"><button id="person-btn" class="primary-button" type="button">정답 제출</button></div><p id="person-msg" hidden></p>') +
        '<div class="button-row"><button id="back" class="secondary-button" type="button">미션 목록으로</button></div>' +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.piece-btn'), function (el) {
        el.addEventListener('click', function () { state.order.push(Number(el.getAttribute('data-i'))); save(); render(); });
      });
      Array.prototype.forEach.call(app.querySelectorAll('.slot'), function (el) {
        el.addEventListener('click', function () { state.order.splice(Number(el.getAttribute('data-k')), 1); save(); render(); });
      });
      document.getElementById('clear').addEventListener('click', function () { state.order = []; save(); render(); });
      document.getElementById('back').addEventListener('click', function () { go('hub', null); });
      document.getElementById('check').addEventListener('click', function () {
        const text = state.order.map(function (i) { return Q.fragments[i]; }).join('');
        const msg = document.getElementById('msg');
        msg.hidden = false;
        if (text === Q.answerPhrase) { state.puzzleOk = true; save(); msg.className = 'ok-text'; msg.textContent = '조합 성공! “' + Q.answerPhrase.replace('홍길동전을지은작가의누이', '홍길동전을 지은 작가의 누이') + '” — 이 사람은 누구일까요?'; }
        else {
          let right = 0; for (let k = 0; k < text.length; k += 1) if (text.charAt(k) === Q.answerPhrase.charAt(k)) right += 1;
          msg.className = 'error-note'; msg.textContent = '12칸 중 ' + right + '칸이 제자리에 있어요. 말이 되도록 다시 놓아 보세요.';
        }
      });
      const pb = document.getElementById('person-btn');
      if (pb) pb.addEventListener('click', function () {
        const v = norm(document.getElementById('person').value);
        const pm = document.getElementById('person-msg');
        if (Q.person.accept.map(function (a) { return norm(a); }).indexOf(v) >= 0) { state.personOk = true; go('reveal'); }
        else { pm.className = 'error-note'; pm.hidden = false; pm.textContent = '아직 아니에요. 조합한 문장이 가리키는 사람을 떠올려 보세요. (홍길동전의 작가로 전해지는 허균의 …)'; }
      });
    },

    reveal: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">' + esc(Q.reveal.title) + '</h2>' +
        '<div class="event-card"><p class="event-label">정답</p><h2>' + esc(Q.person.display) + '</h2></div>' +
        '<div class="story-box">' + esc(Q.reveal.body) + '</div>' +
        '<p class="paper-note">' + esc(Q.reveal.note) + '</p>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">서민 문화 돌아보기</button></div>' +
        '</div></section>';
      document.getElementById('next').addEventListener('click', function () { go('review'); });
    },

    review: function () {
      const r = Q.review;
      const buttons = r.culture.map(function (c) {
        return '<button class="choice-button' + (state.culture === c ? ' is-selected' : '') + '" type="button" data-c="' + esc(c) + '">' + esc(c) + '</button>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">서민 문화 돌아보기</h2>' +
        '<p class="screen-description">' + esc(r.culturePrompt) + '</p>' +
        '<div class="choice-grid" role="group">' + buttons + '</div>' +
        '<label class="form-label" for="why">' + esc(r.whyPrompt) + '</label>' +
        '<textarea id="why" class="quest-field" placeholder="' + esc(r.whyPlaceholder) + '">' + esc(state.why) + '</textarea>' +
        '<label class="form-label" for="reflection">' + esc(r.reflectionPrompt) + '</label>' +
        '<textarea id="reflection" class="quest-field" placeholder="' + esc(r.reflectionPlaceholder) + '">' + esc(state.reflection) + '</textarea>' +
        '<p id="err" class="error-note" hidden>서민 문화를 하나 고르고, 두 칸 모두 한 문장 이상 써 주세요.</p>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">마치기</button></div>' +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (el) {
        el.addEventListener('click', function () {
          state.culture = el.getAttribute('data-c'); save();
          Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (b) { b.classList.toggle('is-selected', b === el); });
        });
      });
      document.getElementById('why').addEventListener('input', function (e) { state.why = e.target.value; save(); });
      document.getElementById('reflection').addEventListener('input', function (e) { state.reflection = e.target.value; save(); });
      document.getElementById('next').addEventListener('click', function () {
        if (!state.culture || state.why.trim().length < 8 || state.reflection.trim().length < 8) { document.getElementById('err').hidden = false; return; }
        go('finish');
      });
    },

    finish: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">수사 완료!</h2>' +
        '<div class="event-card"><p class="event-label">수고했어요</p><h2>그림은 박물관으로 돌아왔어요</h2></div>' +
        '<div class="story-box"><b>내가 고른 서민 문화: ' + esc(state.culture || '') + '</b><br>' + esc(state.why) + '</div>' +
        '<div class="story-box"><b>오늘의 기억</b><br>' + esc(state.reflection) + '</div>' +
        '<p class="paper-note">쓴 글은 이 기기 안에만 남습니다. 선생님께 보여 주고 싶다면 화면을 보여 주세요.</p>' +
        '<div class="button-row"><button id="again" class="secondary-button" type="button">처음부터 다시 하기</button></div>' +
        '</div></section>';
      document.getElementById('again').addEventListener('click', function () {
        if (window.confirm('처음부터 다시 하면 지금까지 쓴 내용이 지워져요. 계속할까요?')) {
          state = defaultState(); save(); render(); window.scrollTo(0, 0);
        }
      });
    }
  };

  function render() {
    updateProgress();
    (screens[state.step] || screens.intro)();
  }

  render();
})();
