/*
 * 강화도 조약 — 화면 흐름(흥선대원군 활동과 같은 틀)
 *   소개 → 모둠 인원·내 번호 → 자료 4개(순서 자유) → 조약까지의 사건 조각 → 돌아보기 → 완료
 * 문제·정답은 quest.js에 있다. 학생 이름·학번은 받지 않고, 기록은 이 기기 안에만 남는다.
 */
(function () {
  'use strict';

  const Q = window.GanghwaQuest;
  if (!Q) return;

  const app = document.getElementById('app');
  const progressStep = document.getElementById('progress-step');
  const progressValue = document.getElementById('progress-value');

  const stepLabels = { intro: '활동 소개', setup: '내 번호 고르기', hub: '자료 읽기', chat: '자료 읽기', stele: '조약까지의 사건 조각', review: '돌아보기', finish: '완료' };
  const TOTAL = Q.chats.length + 1;   // 자료 4개 + 사건 조각

  function defaultState() {
    return { step: 'intro', size: null, seat: null, current: null, done: [], text: {}, tries: {}, unlocked: {}, picks: { l1: [] }, laneOk: false, policy: null, why: '' };
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
    save(); render(); window.scrollTo(0, 0);
  }
  function chatById(id) { return Q.chats.filter(function (c) { return c.id === id; })[0]; }
  function allChatsDone() { return Q.chats.every(function (c) { return state.done.indexOf(c.id) >= 0; }); }

  // 이 기기에서 자료 내용을 읽을 수 있는가
  function canRead(chat) {
    if (state.unlocked[chat.id] || state.size === 'solo') return true;
    const owners = (Q.owners[String(state.size)] || {})[chat.id] || [];
    return owners.indexOf(state.seat) >= 0;
  }
  function ownersText(chat) {
    const o = (Q.owners[String(state.size)] || {})[chat.id] || [];
    return o.map(function (n) { return n + '번'; }).join(', ');
  }

  function updateProgress() {
    const doneCount = state.done.length;
    const inPlay = state.step === 'hub' || state.step === 'chat' || state.step === 'stele';
    progressStep.textContent = stepLabels[state.step] + (inPlay ? ' (' + doneCount + '/' + TOTAL + ')' : '');
    const frac = { intro: 0.03, setup: 0.06, review: 0.92, finish: 1 };
    progressValue.style.width = Math.round((inPlay ? 0.1 + 0.8 * doneCount / TOTAL : frac[state.step]) * 100) + '%';
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

  // ── 빈칸 ──────────────────────────────────────────────────
  function blankHtml(key, b, okSet) {
    const val = state.text[key] || '';
    return '<div class="part-block"><p class="screen-description"><b>' + esc(b.q) + '</b></p>' +
      '<p class="initial-hint">초성 힌트: <span>' + esc(b.initials) + '</span></p>' +
      '<input class="quest-field sc-lock' + (okSet && okSet[key] ? ' is-ok' : '') + '" data-k="' + esc(key) + '" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" value="' + esc(val) + '"></div>';
  }
  function blankOk(key, b) { return b.accept.map(norm).indexOf(norm(state.text[key])) >= 0; }

  function bindBlanks() {
    Array.prototype.forEach.call(app.querySelectorAll('input[data-k]'), function (el) {
      el.addEventListener('input', function () { state.text[el.getAttribute('data-k')] = el.value; save(); el.classList.remove('is-ok'); });
    });
  }

  // 빈칸을 모두 확인한다. 맞은 칸은 초록색으로 표시하고, 다 맞으면 onPass를 부른다.
  function checkBlanks(tryKey, blanks, keyOf, onPass) {
    const box = document.getElementById('sc-msg');
    let right = 0;
    blanks.forEach(function (b, i) {
      const ok = blankOk(keyOf(i), b);
      const el = app.querySelector('input[data-k="' + keyOf(i) + '"]');
      if (el) el.classList.toggle('is-ok', ok);
      if (ok) right += 1;
    });
    if (right === blanks.length) { onPass(); return; }
    state.tries[tryKey] = (state.tries[tryKey] || 0) + 1; save();
    box.className = 'error-note'; box.hidden = false;
    let msg = blanks.length + '칸 중 ' + right + '칸이 맞아요. 초록색이 아닌 칸을 다시 확인해 보세요.';
    if (state.tries[tryKey] >= 2) {
      const hints = blanks.map(function (b, i) { return blankOk(keyOf(i), b) ? '' : '💡 ' + esc(b.hint); }).filter(Boolean);
      msg = esc(msg) + '<br>' + hints.join('<br>');
    } else msg = esc(msg);
    box.innerHTML = msg;
  }

  // ── 화면들 ────────────────────────────────────────────────
  const screens = {
    intro: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<span class="badge-extra">교과서 밖 보충 활동</span>' +
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
        '<p class="screen-description">오늘 우리 모둠 인원과 내 번호를 고르세요. 이름은 입력하지 않습니다. 번호마다 읽을 수 있는 자료가 달라요.</p>' +
        '<label class="form-label">오늘 모둠 인원</label><div class="choice-grid" role="group">' + sizeBtns + '</div>' +
        (n ? '<label class="form-label">내 번호</label><div class="choice-grid" role="group">' + seatBtns + '</div>' : '') +
        (state.size === 'solo' ? '<p class="paper-note">혼자 하기에서는 모든 자료가 보입니다.</p>' : '') +
        '<div class="button-row"><button id="next" class="primary-button" type="button"' + (ready ? '' : ' disabled') + '>자료 읽으러 가기</button></div>' +
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
      const cards = Q.chats.map(function (c) {
        const done = state.done.indexOf(c.id) >= 0;
        const mine = canRead(c);
        return '<button class="mission-card' + (done ? ' is-done' : '') + '" type="button" data-c="' + c.id + '">' +
          '<b>자료 ' + c.no + '</b><small>' + esc(c.title) + '</small><small>' + (done ? '✔ 완료' : mine ? '📖 내가 읽는 자료' : '🗣 ' + esc(ownersText(c)) + ' 친구에게 물어보기') + '</small></button>';
      }).join('');
      const steleDone = state.done.indexOf('stele') >= 0;
      const ready = allChatsDone();
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">자료 목록</h2>' +
        '<p class="screen-description">내 번호는 <b>' + (state.size === 'solo' ? '혼자 하기' : state.seat + '번') + '</b>입니다. 읽을 수 있는 자료는 직접 읽고, 다른 자료는 해당 번호 친구에게 말로 들어 보세요. 모두 끝내면 마지막 단서가 열립니다. (' + state.done.length + ' / ' + TOTAL + ')</p>' +
        '<div class="mission-grid">' + cards +
        '<button class="mission-card' + (steleDone ? ' is-done' : '') + (ready ? '' : ' is-locked') + '" type="button" data-c="stele"' + (ready ? '' : ' disabled') + '><b>마지막 단서</b><small>사건 조각 순서 맞추기</small><small>' + (steleDone ? '✔ 완료' : ready ? '열렸어요' : '🔒 자료 4개를 끝내면 열려요') + '</small></button>' +
        '</div>' +
        (steleDone ? '<div class="button-row"><button id="to-review" class="primary-button" type="button">돌아보기로 가기</button></div>' : '') +
        '<p class="paper-note">게임 대회 이야기는 이해를 돕기 위해 지어 낸 것입니다.</p>' +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.mission-card:not([disabled])'), function (el) {
        el.addEventListener('click', function () {
          const id = el.getAttribute('data-c');
          go(id === 'stele' ? 'stele' : 'chat', id === 'stele' ? null : id);
        });
      });
      const tr = document.getElementById('to-review');
      if (tr) tr.addEventListener('click', function () { go('review'); });
    },

    chat: function () {
      const c = chatById(state.current);
      if (!c) { go('hub', null); return; }
      const done = state.done.indexOf(c.id) >= 0;
      const read = canRead(c);
      const body = read
        ? c.sections.map(function (sec) {
          const note = sec.note ? '<span class="sec-note">' + esc(sec.note) + '</span>' : '';
          const label = sec.kind === 'game' ? '🎮 ' + sec.label + ' (지어 낸 이야기)' : sec.kind === 'real' ? '📜 ' + sec.label : '📖 ' + sec.label;
          return '<div class="sec sec-' + sec.kind + '"><b class="sec-label">' + esc(label) + '</b>' + esc(sec.text) + note + '</div>';
        }).join('')
        : '<div class="story-box locked-chat">🗣 이 자료는 <b>' + esc(ownersText(c)) + '</b> 친구가 읽을 수 있어요. 화면을 보지 말고 말로 들려 달라고 부탁해 보세요. 어떤 내용인지 물어보며 아래 빈칸을 채우세요.</div>';
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<span class="badge-extra">' + (c.textbook ? '교과서 104쪽' : '교과서 밖 보충 활동') + '</span>' +
        '<h2 class="screen-title">자료 ' + c.no + '. ' + esc(c.title) + '</h2>' +
        '<span class="mission-tag">' + esc(c.tag) + '</span>' + body +
        c.blanks.map(function (b, i) { return blankHtml(c.id + '_' + i, b, done ? okAll(c.id, c.blanks) : null); }).join('') +
        '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button>' +
        '<button id="back-hub" class="secondary-button" type="button">자료 목록으로</button></div>' +
        '<p id="sc-msg" hidden></p>' +
        (done || read ? '' : gateHtml('친구와 연결이 안 된다면 (선생님 확인으로 내용 보기)')) +
        '</div></section>';
      bindBlanks();
      document.getElementById('back-hub').addEventListener('click', function () { go('hub', null); });
      document.getElementById('sc-check').addEventListener('click', function () {
        checkBlanks(c.id, c.blanks, function (i) { return c.id + '_' + i; }, function () { passChat(c); });
      });
      bindGate(function () { state.unlocked[c.id] = true; save(); render(); });
      if (done) lockPassed('자료를 끝냈어요!');
    },

    stele: function () {
      const done = state.done.indexOf('stele') >= 0;
      const lanes = Q.lanes.map(function (ln) {
        const picks = state.picks[ln.id] || [];
        const tiles = ln.shuffle.map(function (ei) {
          const used = picks.indexOf(ei) >= 0;
          return '<button class="tile' + (used ? ' is-used' : '') + '" type="button" data-l="' + ln.id + '" data-e="' + ei + '"' + (used || state.laneOk ? ' disabled' : '') + '>' + esc(ln.events[ei]) + '</button>';
        }).join('');
        let slots = '';
        for (let k = 0; k < ln.events.length; k += 1) {
          const ei = picks[k];
          slots += '<button class="tile-slot' + (ei !== undefined ? ' is-filled' : '') + '" type="button" data-l="' + ln.id + '" data-k="' + k + '"' + (ei === undefined || state.laneOk ? ' disabled' : '') + '><i>' + (k + 1) + '</i>' + (ei !== undefined ? esc(ln.events[ei]) : '') + '</button>';
        }
        return '<div class="lane"><h3>' + esc(ln.title) + '</h3><div class="tile-row">' + tiles + '</div><div class="slot-col" aria-label="순서 칸">' + slots + '</div></div>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<span class="badge-extra">교과서 밖 보충 활동</span>' +
        '<h2 class="screen-title">뒤섞인 조약 기록을 맞춰라</h2>' +
        '<div class="story-box">' + esc(Q.stele.intro) + '</div>' +
        '<p class="screen-description">① 조각을 눌러 일어난 순서대로 아래 칸에 놓으세요. 잘못 놓은 칸을 누르면 뺄 수 있어요. 모둠 친구와 순서를 이야기해 보세요.</p>' +
        lanes +
        '<div class="button-row"><button id="lane-check" class="primary-button"' + (state.laneOk ? ' disabled' : '') + '>순서 확인</button><button id="lane-clear" class="secondary-button"' + (state.laneOk ? ' disabled' : '') + '>모두 빼기</button></div>' +
        '<p id="lane-msg" class="' + (state.laneOk ? 'ok-text' : '') + '"' + (state.laneOk ? '' : ' hidden') + '>' + (state.laneOk ? '순서가 맞아요! 아래 글을 읽고 빈칸을 채워 보세요.' : '') + '</p>' +
        (state.laneOk
          ? '<div class="message-box">' + esc(Q.stele.text) + '</div>' +
            '<p class="screen-description">② 빈칸에는 짧은 낱말을 쓰세요.</p>' +
            Q.stele.blanks.map(function (b, i) { return blankHtml('stele_' + i, b, done ? okAll('stele', Q.stele.blanks) : null); }).join('') +
            '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button></div><p id="sc-msg" hidden></p>'
          : '') +
        '<div class="button-row"><button id="back-hub" class="secondary-button" type="button">자료 목록으로</button></div>' +
        (done ? '' : gateHtml('막혔다면 (선생님 확인으로 넘어가기)')) +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.tile'), function (el) {
        el.addEventListener('click', function () { state.picks[el.getAttribute('data-l')].push(Number(el.getAttribute('data-e'))); save(); render(); });
      });
      Array.prototype.forEach.call(app.querySelectorAll('.tile-slot'), function (el) {
        el.addEventListener('click', function () { state.picks[el.getAttribute('data-l')].splice(Number(el.getAttribute('data-k')), 1); save(); render(); });
      });
      document.getElementById('lane-clear').addEventListener('click', function () { state.picks = { l1: [] }; save(); render(); });
      document.getElementById('lane-check').addEventListener('click', function () {
        const msg = document.getElementById('lane-msg');
        let wrong = 0;
        Q.lanes.forEach(function (ln) {
          const picks = state.picks[ln.id] || [];
          if (picks.length < ln.events.length) { wrong += ln.events.length - picks.length; return; }
          picks.forEach(function (ei, k) { if (ei !== k) wrong += 1; });
        });
        msg.hidden = false;
        if (wrong === 0) { state.laneOk = true; save(); render(); return; }
        msg.className = 'error-note';
        msg.textContent = '아직 맞지 않아요. 비어 있거나 순서가 다른 칸이 있어요. 무슨 일이 먼저 일어났는지 이야기해 보세요.';
      });
      document.getElementById('back-hub').addEventListener('click', function () { go('hub', null); });
      const sc = document.getElementById('sc-check');
      if (sc) sc.addEventListener('click', function () {
        checkBlanks('stele', Q.stele.blanks, function (i) { return 'stele_' + i; }, function () { passStele(); });
      });
      bindBlanks();
      bindGate(function () { state.laneOk = true; passStele(); });
      if (done) lockPassed('마지막 단서를 풀었어요!');
    },

    review: function () {
      const r = Q.review;
      const buttons = r.policies.map(function (p) {
        return '<button class="choice-button' + (state.policy === p ? ' is-selected' : '') + '" type="button" data-p="' + esc(p) + '">' + esc(p) + '</button>';
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
          state.policy = el.getAttribute('data-p'); save();
          Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (b) { b.classList.toggle('is-selected', b === el); });
        });
      });
      document.getElementById('why').addEventListener('input', function (e) { state.why = e.target.value; save(); });
      document.getElementById('next').addEventListener('click', function () {
        if (!state.policy || state.why.trim().length < 6) { document.getElementById('err').hidden = false; return; }
        go('finish');
      });
    },

    finish: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">' + esc(Q.finishTitle) + '</h2>' +
        '<div class="story-box"><b>내가 고른 정책: ' + esc(state.policy || '') + '</b><br>' + esc(state.why) + '</div>' +
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

  function okAll(prefix, blanks) {
    const set = {};
    blanks.forEach(function (b, i) { set[prefix + '_' + i] = true; });
    return set;
  }
  function lockPassed(text) {
    const box = document.getElementById('sc-msg');
    if (box) { box.className = 'ok-text'; box.hidden = false; box.textContent = '✔ ' + text; }
    Array.prototype.forEach.call(app.querySelectorAll('.sc-lock'), function (el) { el.disabled = true; });
  }
  function passChat(c) {
    if (state.done.indexOf(c.id) < 0) state.done.push(c.id);
    save();
    const box = document.getElementById('sc-msg');
    box.className = 'ok-text'; box.hidden = false;
    box.innerHTML = '맞아요! 이 자료의 내용을 기억해 두세요.<div class="button-row"><button id="to-hub" class="primary-button" type="button">자료 목록으로</button></div>';
    Array.prototype.forEach.call(app.querySelectorAll('.sc-lock'), function (el) { el.disabled = true; });
    document.getElementById('to-hub').addEventListener('click', function () { go('hub', null); });
  }
  function passStele() {
    if (state.done.indexOf('stele') < 0) state.done.push('stele');
    save();
    go('review');
  }

  function render() {
    updateProgress();
    (screens[state.step] || screens.intro)();
  }

  render();
})();
