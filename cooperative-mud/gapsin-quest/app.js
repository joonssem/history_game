/*
 * 갑신정변 역사 체험 — 화면 흐름
 *   활동 소개 → 번호 → 내 카드(이름 수수께끼) → 암호 → 팀 확인(교사)
 *   → 팀 미션 5개(교사 확인) → 밀지 쓰기 → 일본(교사) → 마무리 → 완료
 * 역사 내용·학급 설정은 quest.js에 있다. 이 파일에는 넣지 않는다.
 * 미션의 selfCheck가 null이면 종이 미션지를 받아 풀고 교사 확인으로 통과한다.
 */
(function () {
  'use strict';

  const Q = window.GapsinQuest;
  if (!Q) return;

  const app = document.getElementById('app');
  const progressStep = document.getElementById('progress-step');
  const progressCount = document.getElementById('progress-count');
  const progressValue = document.getElementById('progress-value');

  const steps = [
    { id: 'intro', label: '활동 소개' },
    { id: 'number', label: '내 번호' },
    { id: 'card', label: '내 이름 찾기' },
    { id: 'cipher', label: '암호 풀기' },
    { id: 'team', label: '동지 만나기' },
    { id: 'missions', label: '팀 미션' },
    { id: 'letter', label: '밀지 쓰기' },
    { id: 'japan', label: '일본의 답' },
    { id: 'feel', label: '마음 돌아보기' },
    { id: 'history', label: '실제 역사' },
    { id: 'depend', label: '선택 돌아보기' },
    { id: 'people', label: '백성의 입장' },
    { id: 'reflection', label: '소감 정리' },
    { id: 'finish', label: '완료' }
  ];

  function defaultState() {
    return {
      step: 'intro', number: null, nameOk: false, cipherOk: false, teamOk: false,
      missionIndex: 0, missionsDone: [], work: {}, letter: '', japanDone: false,
      feel: null, depend: null, dependWhy: '', people: '', reflection: ''
    };
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

  function save() {
    try { localStorage.setItem(Q.storageKey, JSON.stringify(state)); } catch (e) { /* 무시 */ }
  }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function norm(text) { return String(text || '').replace(/\s+/g, '').trim(); }

  // ── 학급 번호로 모둠·역할 찾기 ──────────────────────────────
  function assignment() {
    return state.number ? Q.classConfig.assignments[state.number - 1] : null;
  }
  function teamOf(a) { return Q.teams.filter(function (t) { return t.id === a.team; })[0]; }
  function roleIdOf(a) {
    if (a.role !== 'fifth') return a.role;
    return teamOf(a).fifthRole;
  }
  function roleOf() { return Q.roles[roleIdOf(assignment())]; }
  function fullName(role) {
    const surname = role.surname || Q.classConfig[role.surnameKey] || '';
    return surname + role.given;
  }
  function teamRoleIds(team) {
    const ids = ['leader', 'japanese', 'gaehwa', 'brave'];
    if (team.size === 5) ids.push(team.fifthRole);
    return ids;
  }

  function go(step) {
    state.step = step;
    save();
    render();
    window.scrollTo(0, 0);
  }

  // ── 교사 확인 코드 ─────────────────────────────────────────
  function gateHtml(id, label) {
    return '<div class="gate-box"><label class="form-label" for="' + id + '">' + esc(label) + '</label>' +
      '<input id="' + id + '" class="quest-field" type="password" inputmode="numeric" maxlength="8" autocomplete="off">' +
      '<div class="button-row"><button id="' + id + '-btn" class="secondary-button" type="button">교사 확인</button></div>' +
      '<p id="' + id + '-err" class="error-note" hidden>확인 숫자가 맞지 않아요. 선생님께 다시 확인받으세요.</p></div>';
  }
  function bindGate(id, onOk) {
    const input = document.getElementById(id);
    const err = document.getElementById(id + '-err');
    function check() {
      if (norm(input.value) === Q.classConfig.teacherCode) { onOk(); } else { err.hidden = false; input.value = ''; input.focus(); }
    }
    document.getElementById(id + '-btn').addEventListener('click', check);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
  }

  // ── 진행도 ─────────────────────────────────────────────────
  function updateProgress() {
    const index = steps.map(function (s) { return s.id; }).indexOf(state.step);
    progressStep.textContent = steps[index].label;
    progressCount.textContent = (index + 1) + ' / ' + steps.length;
    progressValue.style.width = Math.round(((index + 1) / steps.length) * 100) + '%';
  }

  // ── 화면들 ─────────────────────────────────────────────────
  // ── 미션 자가 점검 위젯 ─────────────────────────────────────
  // 정답 판정은 quest.js의 selfCheck 정의를 따른다. 틀려도 어느 것이 틀렸는지는 알려 주지 않고 맞힌 개수만 알려 준다.
  function passMission(m) {
    if (state.missionsDone.indexOf(m.id) < 0) state.missionsDone.push(m.id);
    if (state.missionIndex + 1 < Q.missions.length) { state.missionIndex += 1; save(); render(); window.scrollTo(0, 0); }
    else { go('letter'); }
  }

  function msgBox() { return document.getElementById('sc-msg'); }
  function showWrong(text, hint) {
    const box = msgBox();
    box.className = 'error-note';
    box.innerHTML = esc(text) + (hint ? '<br>💡 ' + esc(hint) : '');
    box.hidden = false;
  }
  function showSuccess(m, text) {
    const box = msgBox();
    box.className = 'ok-text';
    box.hidden = false;
    box.innerHTML = esc(text) + '<div class="button-row"><button id="sc-next" class="primary-button" type="button">' +
      (state.missionIndex + 1 < Q.missions.length ? '다음 미션으로' : '밀지 쓰러 가기') + '</button></div>';
    document.getElementById('sc-next').addEventListener('click', function () { passMission(m); });
    Array.prototype.forEach.call(app.querySelectorAll('.sc-lock'), function (el) { el.disabled = true; });
  }
  function work(m) { if (!state.work) state.work = {}; if (!state.work[m.id]) state.work[m.id] = {}; return state.work[m.id]; }
  function tryCount(m) { const w = work(m); w.tries = (w.tries || 0) + 1; save(); return w.tries; }

  function dirLabel(v, plus, minus) { return v === 0 ? plus + '0' : (v > 0 ? plus + v : minus + (-v)); }

  const widgets = {
    count: function (m, sc) {
      const imgs = sc.images.map(function (im) {
        return '<figure class="quest-figure"><img src="' + esc(im.src) + '" alt="' + esc(im.alt) + '"><figcaption>' + esc(im.caption) + '</figcaption></figure>';
      }).join('');
      return '<div class="quest-figures">' + imgs + '</div>' +
        '<label class="form-label" for="sc-input">틀린 곳은 모두 몇 곳인가요?</label>' +
        '<input id="sc-input" class="quest-field sc-lock" type="number" inputmode="numeric" min="0" max="20" style="max-width:140px">' +
        '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button></div>' +
        '<p id="sc-msg" hidden></p>';
    },
    ladder: function (m, sc) {
      const btns = sc.letters.map(function (l) { return '<button class="number-button sc-lock" type="button" data-l="' + l + '">' + l + '</button>'; }).join('');
      return '<figure class="quest-figure"><img src="' + esc(sc.image.src) + '" alt="' + esc(sc.image.alt) + '"></figure>' +
        '<p class="screen-description">' + esc(sc.prompt) + '</p>' +
        '<div class="number-grid" role="group" aria-label="사다리 출발 글자">' + btns + '</div><p id="sc-msg" hidden></p>';
    },
    route: function (m, sc) {
      const cards = sc.routes.map(function (r) {
        return '<button class="choice-button sc-lock" type="button" data-r="' + r.id + '"><b>' + esc(r.label) + '</b><br>' +
          r.parts.map(function (p) { return p + 'km'; }).join(' + ') + '</button>';
      }).join('');
      return '<p class="screen-description">' + esc(sc.prompt) + '</p>' +
        '<div class="choice-grid" role="group" aria-label="길 고르기">' + cards + '</div>' +
        '<label class="form-label" for="sc-input">고른 길의 거리를 모두 더하면 몇 km인가요?</label>' +
        '<input id="sc-input" class="quest-field sc-lock" type="text" inputmode="decimal" style="max-width:160px" placeholder="예: 1.5">' +
        '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button></div><p id="sc-msg" hidden></p>';
    },
    choose: function (m, sc) {
      const w = work(m); const picked = w.picked || [];
      const opts = sc.options.map(function (o) {
        return '<button class="choice-button sc-lock' + (picked.indexOf(o.id) >= 0 ? ' is-selected' : '') + '" type="button" data-o="' + o.id + '">' + esc(o.label) + '</button>';
      }).join('');
      return '<p class="screen-description">실제 개혁안이라고 생각하는 ' + sc.need + '개를 고르세요.</p>' +
        '<div class="choice-grid" role="group" aria-label="개혁안 고르기">' + opts + '</div>' +
        '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button></div><p id="sc-msg" hidden></p>';
    },
    grid: function (m, sc) {
      const w = work(m); const placed = w.placed || {}; const sel = w.sel || 1;
      const chips = sc.soldiers.map(function (s) {
        const done = placed[s.n] ? ' ✓' : '';
        return '<button class="number-button sc-lock' + (sel === s.n ? ' is-selected' : '') + '" type="button" data-n="' + s.n + '">' + s.n + '번' + done + '</button>';
      }).join('');
      const table = sc.soldiers.map(function (s) {
        return '<li>' + s.n + '번 군인 (' + dirLabel(s.x, '동', '서') + ', ' + dirLabel(s.y, '북', '남') + ')</li>';
      }).join('');
      const N = sc.size; const pad = 1.4; const S = N + pad;
      let svg = '<svg class="guard-map" viewBox="' + (-S) + ' ' + (-S) + ' ' + (2 * S) + ' ' + (2 * S) + '" role="img" aria-label="궁궐 수비 지도">';
      svg += '<rect x="' + (-N) + '" y="' + (-N) + '" width="' + (2 * N) + '" height="' + (2 * N) + '" fill="#F5C518" stroke="#7a5b00" stroke-width="0.06"/>';
      for (let i = -N; i <= N; i += 1) {
        svg += '<line x1="' + i + '" y1="' + (-N) + '" x2="' + i + '" y2="' + N + '" stroke="#7a5b00" stroke-width="' + (i === 0 ? 0.1 : 0.04) + '"/>';
        svg += '<line x1="' + (-N) + '" y1="' + i + '" x2="' + N + '" y2="' + i + '" stroke="#7a5b00" stroke-width="' + (i === 0 ? 0.1 : 0.04) + '"/>';
      }
      svg += '<text x="0" y="' + (-N - 0.55) + '" text-anchor="middle" font-size="0.8" font-weight="700">북</text>' +
        '<text x="0" y="' + (N + 1.15) + '" text-anchor="middle" font-size="0.8" font-weight="700">남</text>' +
        '<text x="' + (-N - 0.7) + '" y="0.28" text-anchor="middle" font-size="0.8" font-weight="700">서</text>' +
        '<text x="' + (N + 0.7) + '" y="0.28" text-anchor="middle" font-size="0.8" font-weight="700">동</text>';
      for (let t = 1; t <= N; t += 1) {
        svg += '<text x="' + t + '" y="0.62" text-anchor="middle" font-size="0.42" fill="#b00">' + t + '</text>' +
          '<text x="' + (-t) + '" y="0.62" text-anchor="middle" font-size="0.42" fill="#b00">' + t + '</text>' +
          '<text x="0.2" y="' + (-t + 0.15) + '" font-size="0.42" fill="#b00">' + t + '</text>' +
          '<text x="0.2" y="' + (t + 0.15) + '" font-size="0.42" fill="#b00">' + t + '</text>';
      }
      Object.keys(placed).forEach(function (n) {
        const p = placed[n];
        svg += '<circle cx="' + p[0] + '" cy="' + (-p[1]) + '" r="0.36" fill="#1a3d6b"/><text x="' + p[0] + '" y="' + (-p[1] + 0.14) + '" text-anchor="middle" font-size="0.44" fill="#fff" font-weight="700">' + n + '</text>';
      });
      for (let x = -N; x <= N; x += 1) {
        for (let y = -N; y <= N; y += 1) {
          svg += '<circle class="guard-hit" data-x="' + x + '" data-y="' + y + '" cx="' + x + '" cy="' + (-y) + '" r="0.46" fill="transparent"/>';
        }
      }
      svg += '</svg>';
      return '<p class="screen-description">' + esc(sc.prompt) + '</p>' +
        '<div class="guard-wrap"><div class="guard-side"><p class="form-label">배치해야 하는 군인</p><ul class="clue-list">' + table + '</ul></div>' +
        '<div class="guard-board">' + svg + '</div></div>' +
        '<p class="form-label">지금 찍을 군인 번호</p><div class="number-grid" role="group" aria-label="군인 번호">' + chips + '</div>' +
        '<div class="button-row"><button id="sc-check" class="primary-button sc-lock" type="button">확인</button>' +
        '<button id="sc-clear" class="secondary-button sc-lock" type="button">모두 지우기</button></div><p id="sc-msg" hidden></p>';
    }
  };

  function bindWidget(m, sc) {
    const hintAfter = function (tries) { return tries >= 2 ? sc.hint : ''; };
    if (sc.type === 'count') {
      document.getElementById('sc-check').addEventListener('click', function () {
        const v = Number(norm(document.getElementById('sc-input').value));
        if (v === sc.answer) showSuccess(m, '맞아요! 다케조의 백자는 가짜였어요.');
        else showWrong('아직 아니에요. 다시 비교해 보세요.', hintAfter(tryCount(m)));
      });
    } else if (sc.type === 'ladder') {
      Array.prototype.forEach.call(app.querySelectorAll('.number-button'), function (b) {
        b.addEventListener('click', function () {
          if (b.getAttribute('data-l') === sc.answer) showSuccess(m, '진짜 뇌관을 찾았어요!');
          else showWrong('그 줄은 꽝에 닿아요. 다시 따라가 보세요.', hintAfter(tryCount(m)));
        });
      });
    } else if (sc.type === 'route') {
      const w = work(m);
      Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (b) {
        if (w.route === b.getAttribute('data-r')) b.classList.add('is-selected');
        b.addEventListener('click', function () {
          w.route = b.getAttribute('data-r'); save();
          Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (x) { x.classList.toggle('is-selected', x === b); });
        });
      });
      document.getElementById('sc-check').addEventListener('click', function () {
        const total = Number(norm(document.getElementById('sc-input').value).replace(/km$/i, ''));
        const routeOk = w.route === sc.answer;
        const totalOk = Math.abs(total - sc.total) < 0.001;
        if (!w.route) showWrong('먼저 길을 하나 고르세요.');
        else if (routeOk && totalOk) showSuccess(m, '맞아요! 가장 짧은 길로 왕을 모셔 왔어요.');
        else if (routeOk) showWrong('길은 맞아요. 하지만 거리의 합이 달라요. 다시 더해 보세요.', hintAfter(tryCount(m)));
        else showWrong('더 짧은 길이 있어요. 길마다 합을 구해 비교해 보세요.', hintAfter(tryCount(m)));
      });
    } else if (sc.type === 'choose') {
      const w = work(m);
      Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (b) {
        b.addEventListener('click', function () {
          const id = b.getAttribute('data-o'); const picked = w.picked || [];
          const i = picked.indexOf(id);
          if (i >= 0) picked.splice(i, 1); else picked.push(id);
          w.picked = picked; save(); b.classList.toggle('is-selected', i < 0);
        });
      });
      document.getElementById('sc-check').addEventListener('click', function () {
        const picked = w.picked || [];
        if (picked.length !== sc.need) { showWrong(sc.need + '개를 골라야 해요. 지금은 ' + picked.length + '개를 골랐어요.'); return; }
        const right = sc.options.filter(function (o) { return o.real && picked.indexOf(o.id) >= 0; }).length;
        if (right === sc.need) showSuccess(m, '맞아요! 모두 실제 개혁안이에요.');
        else showWrong(sc.need + '개 중 ' + right + '개가 맞아요. 다시 생각해 보세요.', hintAfter(tryCount(m)));
      });
    } else if (sc.type === 'grid') {
      const w = work(m); w.placed = w.placed || {}; w.sel = w.sel || 1;
      Array.prototype.forEach.call(app.querySelectorAll('.number-button'), function (b) {
        b.addEventListener('click', function () { w.sel = Number(b.getAttribute('data-n')); save(); render(); });
      });
      Array.prototype.forEach.call(app.querySelectorAll('.guard-hit'), function (c) {
        c.addEventListener('click', function () {
          const x = Number(c.getAttribute('data-x')); const y = Number(c.getAttribute('data-y'));
          Object.keys(w.placed).forEach(function (n) { if (w.placed[n][0] === x && w.placed[n][1] === y) delete w.placed[n]; });
          w.placed[w.sel] = [x, y];
          const next = sc.soldiers.filter(function (s) { return !w.placed[s.n]; })[0];
          if (next) w.sel = next.n;
          save(); render();
        });
      });
      document.getElementById('sc-clear').addEventListener('click', function () { w.placed = {}; w.sel = 1; save(); render(); });
      document.getElementById('sc-check').addEventListener('click', function () {
        const placedCount = Object.keys(w.placed).length;
        if (placedCount < sc.soldiers.length) { showWrong('아직 ' + (sc.soldiers.length - placedCount) + '명을 배치하지 않았어요.'); return; }
        const right = sc.soldiers.filter(function (s) { const p = w.placed[s.n]; return p && p[0] === s.x && p[1] === s.y; }).length;
        if (right === sc.soldiers.length) showSuccess(m, '맞아요! 수비 병력을 모두 제자리에 배치했어요.');
        else showWrong(sc.soldiers.length + '명 중 ' + right + '명이 맞아요. 동·서·남·북 방향을 다시 확인해 보세요.', hintAfter(tryCount(m)));
      });
    }
  }

  const screens = {
    intro: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">비밀 동지가 되어 주세요</h2>' +
        '<div class="event-card"><p class="event-label">오늘의 활동</p><h2>갑신정변, 우리가 해 본다면?</h2></div>' +
        '<p>강화도 조약(1876년)으로 개항한 뒤, 1884년에 일어난 사건 속으로 들어가 봅니다.</p>' +
        '<ul class="rules">' +
        '<li>이 일은 비밀리에 이루어집니다. 먼저 내가 누구인지 이름을 알아냅니다.</li>' +
        '<li>암호를 풀어 같은 암호를 가진 동지들을 찾아 한 팀이 됩니다.</li>' +
        '<li>팀이 함께 미션을 해결하고, 선생님에게 확인을 받아 다음으로 갑니다.</li>' +
        '<li>마지막에 일본에게 밀지를 써서 도움을 요청합니다.</li></ul>' +
        '<p class="paper-note">이것은 역사를 즐겁게 공부하기 위해 실제 역사를 쉽게 이해하도록 재구성한 활동입니다. 큰 흐름은 비슷하지만 자세한 내용은 실제와 다릅니다.</p>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">시작하기</button></div>' +
        '</div></section>';
      document.getElementById('next').addEventListener('click', function () { go('number'); });
    },

    number: function () {
      let buttons = '';
      for (let n = 1; n <= Q.classConfig.assignments.length; n += 1) {
        buttons += '<button class="number-button' + (state.number === n ? ' is-selected' : '') + '" type="button" data-n="' + n + '">' + n + '</button>';
      }
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">내 번호를 선택하세요</h2>' +
        '<p class="screen-description">우리 반에서 내 번호를 고릅니다. 이름이나 학번은 입력하지 않습니다.</p>' +
        '<div class="number-grid" role="group" aria-label="내 번호">' + buttons + '</div>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button"' + (state.number ? '' : ' disabled') + '>다음</button></div>' +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.number-button'), function (b) {
        b.addEventListener('click', function () {
          const n = Number(b.getAttribute('data-n'));
          if (state.number !== n) {
            const keep = defaultState();
            keep.step = 'number'; keep.number = n;
            state = keep;
          }
          save(); render();
        });
      });
      document.getElementById('next').addEventListener('click', function () { go('card'); });
    },

    card: function () {
      const role = roleOf();
      const name = fullName(role);
      const clues = role.clues.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
      if (state.nameOk) {
        app.innerHTML =
          '<section class="screen"><div class="panel role-card">' +
          '<h2 class="screen-title">나의 이름은 ' + esc(name) + '입니다</h2>' +
          '<p class="ok-text">이름을 찾았어요!</p>' +
          '<div class="event-card"><p class="event-label">당신의 능력</p><h2>' + esc(role.title) + '</h2></div>' +
          '<p class="screen-description">이 능력을 가진 동지가 한 팀에 모입니다. 다음 단계에서 암호를 풉니다.</p>' +
          '<div class="button-row"><button id="next" class="primary-button" type="button">암호 풀러 가기</button></div>' +
          '</div></section>';
        document.getElementById('next').addEventListener('click', function () { go('cipher'); });
        return;
      }
      app.innerHTML =
        '<section class="screen"><div class="panel role-card">' +
        '<h2 class="screen-title">이 일은 비밀리에 이루어지네. 당신은 누구인가?</h2>' +
        '<p class="screen-description">나의 이름은 □□□이네. 다음 실마리로 당신의 이름을 알아내시오.</p>' +
        '<ul class="clue-list">' + clues + '</ul>' +
        '<label class="form-label" for="name-input">내 이름(세 글자)</label>' +
        '<input id="name-input" class="quest-field" type="text" maxlength="3" autocomplete="off" placeholder="□□□">' +
        '<p id="name-err" class="error-note" hidden>아직 아니에요. 실마리를 다시 읽어 보세요.</p>' +
        '<div class="button-row"><button id="check" class="primary-button" type="button">확인</button></div>' +
        '</div></section>';
      const input = document.getElementById('name-input');
      function check() {
        if (norm(input.value) === name) { state.nameOk = true; save(); render(); }
        else { document.getElementById('name-err').hidden = false; }
      }
      document.getElementById('check').addEventListener('click', check);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    },

    cipher: function () {
      const team = teamOf(assignment());
      if (state.cipherOk) {
        app.innerHTML =
          '<section class="screen"><div class="panel">' +
          '<h2 class="screen-title">나의 암호</h2>' +
          '<div class="cipher-box"><span>같은 암호를 가진 사람을 찾으세요</span><strong>' + esc(team.answer) + '</strong></div>' +
          '<p class="screen-description">같은 암호를 가진 친구를 찾아 함께 모이세요. 이 화면을 서로 보여 줘도 좋습니다.</p>' +
          '<div class="button-row"><button id="next" class="primary-button" type="button">동지를 만났어요</button></div>' +
          '</div></section>';
        document.getElementById('next').addEventListener('click', function () { go('team'); });
        return;
      }
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">동지를 찾는 암호</h2>' +
        '<p class="screen-description">‘정변’이라는 큰일을 도모하려면 함께할 동지가 필요하네. 다음 질문의 답이 당신과 함께하는 사람들의 암호일세.</p>' +
        '<div class="story-box">' + esc(team.question) + '</div>' +
        '<label class="form-label" for="cipher-input">암호</label>' +
        '<input id="cipher-input" class="quest-field" type="text" autocomplete="off">' +
        '<p id="cipher-err" class="error-note" hidden>아직 아니에요. 질문을 다시 읽고 교과서·노트를 떠올려 보세요.</p>' +
        '<div class="button-row"><button id="check" class="primary-button" type="button">확인</button></div>' +
        '</div></section>';
      const input = document.getElementById('cipher-input');
      function check() {
        if (norm(input.value) === team.answer) { state.cipherOk = true; save(); render(); }
        else { document.getElementById('cipher-err').hidden = false; }
      }
      document.getElementById('check').addEventListener('click', check);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    },

    team: function () {
      const team = teamOf(assignment());
      const rows = teamRoleIds(team).map(function (id) { return '<li>' + esc(Q.roles[id].title) + '</li>'; }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">우리 팀 확인</h2>' +
        '<div class="cipher-box"><span>우리 팀 암호</span><strong>' + esc(team.answer) + '</strong></div>' +
        '<p class="screen-description">팀원 ' + team.size + '명이 모였나요? 우리 팀에는 다음 능력을 가진 동지가 있어야 합니다.</p>' +
        '<ul class="clue-list">' + rows + '</ul>' +
        '<p class="paper-note">팀이 모두 모이면 선생님께 와서 암호를 말하고, 선생님이 알려 주는 숫자를 입력하세요.</p>' +
        gateHtml('gate', '선생님이 알려 주는 숫자') +
        '</div></section>';
      bindGate('gate', function () { state.teamOk = true; go('missions'); });
    },

    missions: function () {
      const m = Q.missions[state.missionIndex];
      const sc = m.selfCheck;
      const dots = Q.missions.map(function (x, i) {
        const cls = state.missionsDone.indexOf(x.id) >= 0 ? ' is-done' : (i === state.missionIndex ? ' is-current' : '');
        return '<span class="mission-dot' + cls + '">' + (i + 2) + '</span>';
      }).join('');
      const widget = sc ? widgets[sc.type](m, sc) : '';
      const fallback = sc
        ? '<details class="gate-details"><summary>화면이 안 되거나 막혔다면 (선생님 확인으로 넘어가기)</summary>' + gateHtml('gate', '선생님이 알려 주는 숫자') + '</details>'
        : '<p class="paper-note">팀이 함께 종이 미션지를 풀고, 선생님께 가져와서 확인받으세요. 선생님이 알려 주는 숫자를 입력하면 다음 미션으로 갑니다.</p>' + gateHtml('gate', '선생님이 알려 주는 숫자');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<div class="mission-progress" aria-label="미션 진행">' + dots + '</div>' +
        '<h2 class="screen-title">' + esc(m.title) + '</h2>' +
        '<div class="story-box">' + esc(m.story) + '</div>' +
        '<div class="event-card"><p class="event-label">이번 미션</p><p>' + esc(m.task) + '</p></div>' +
        (sc ? '<p class="paper-note">팀이 함께 의논해서 풀어요. 정답을 맞히면 다음 미션으로 넘어갑니다.</p>' : '') +
        widget + fallback +
        '</div></section>';
      bindGate('gate', function () { passMission(m); });
      if (sc) bindWidget(m, sc);
    },

    letter: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">일본에 보내는 밀지</h2>' +
        '<p class="screen-description">' + esc(Q.letter.prompt) + '</p>' +
        '<label class="form-label" for="letter">밀지 (팀이 함께 쓰는 한 장)</label>' +
        '<textarea id="letter" class="quest-field" placeholder="' + esc(Q.letter.placeholder) + '">' + esc(state.letter) + '</textarea>' +
        '<p id="letter-err" class="error-note" hidden>' + Q.letter.minChars + '글자 이상 써 주세요.</p>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">밀지를 선생님께 보여 주러 가기</button></div>' +
        '</div></section>';
      const area = document.getElementById('letter');
      area.addEventListener('input', function () { state.letter = area.value; save(); });
      document.getElementById('next').addEventListener('click', function () {
        if (norm(area.value).length < Q.letter.minChars) { document.getElementById('letter-err').hidden = false; return; }
        go('japan');
      });
    },

    japan: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">일본의 답을 들으러 가세요</h2>' +
        '<div class="story-box">' + esc(state.letter) + '</div>' +
        '<p class="screen-description">팀이 함께 선생님(일본 공사)께 가서 밀지를 보여 주고 답을 들으세요.</p>' +
        gateHtml('gate', '답을 들은 뒤 선생님이 알려 주는 숫자') +
        '</div></section>';
      bindGate('gate', function () { state.japanDone = true; go('feel'); });
    },

    feel: function () {
      const opts = Q.debrief.feelOptions.map(function (o) {
        return '<button class="choice-button' + (state.feel === o.value ? ' is-selected' : '') + '" type="button" data-v="' + esc(o.value) + '">' + esc(o.label) + '</button>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">일본의 답을 들었을 때 마음은 어땠나요?</h2>' +
        '<div class="choice-grid">' + opts + '</div>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button"' + (state.feel ? '' : ' disabled') + '>다음</button></div>' +
        '</div></section>';
      Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (b) {
        b.addEventListener('click', function () { state.feel = b.getAttribute('data-v'); save(); render(); });
      });
      document.getElementById('next').addEventListener('click', function () { go('history'); });
    },

    history: function () {
      const h = Q.debrief.history;
      const facts = h.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
      const reasons = h.reasons.map(function (r) {
        return '<div class="reason-card"><h3>' + esc(r.title) + '</h3><p>' + esc(r.body) + '</p></div>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">' + esc(h.title) + '</h2>' +
        '<p class="paper-note">' + esc(h.note) + '</p>' +
        '<ul class="clue-list">' + facts + '</ul>' +
        '<h3>실패한 까닭</h3>' + reasons +
        '<div class="button-row"><button id="next" class="primary-button" type="button">다음</button></div>' +
        '</div></section>';
      document.getElementById('next').addEventListener('click', function () { go('depend'); });
    },

    depend: function () {
      const opts = Q.debrief.dependOptions.map(function (o) {
        return '<button class="choice-button' + (state.depend === o.value ? ' is-selected' : '') + '" type="button" data-v="' + esc(o.value) + '">' + esc(o.label) + '</button>';
      }).join('');
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">' + esc(Q.debrief.dependPrompt) + '</h2>' +
        '<div class="choice-grid">' + opts + '</div>' +
        '<label class="form-label" for="why">그렇게 생각한 이유</label>' +
        '<textarea id="why" class="quest-field" placeholder="왜냐하면 ...">' + esc(state.dependWhy) + '</textarea>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button"' + (state.depend ? '' : ' disabled') + '>다음</button></div>' +
        '</div></section>';
      const area = document.getElementById('why');
      area.addEventListener('input', function () { state.dependWhy = area.value; save(); });
      Array.prototype.forEach.call(app.querySelectorAll('.choice-button'), function (b) {
        b.addEventListener('click', function () { state.depend = b.getAttribute('data-v'); save(); render(); });
      });
      document.getElementById('next').addEventListener('click', function () { go('people'); });
    },

    people: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">백성의 입장에서 생각해 보기</h2>' +
        '<p class="screen-description">' + esc(Q.debrief.peoplePrompt) + '</p>' +
        '<textarea id="people" class="quest-field" placeholder="' + esc(Q.debrief.peoplePlaceholder) + '">' + esc(state.people) + '</textarea>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">다음</button></div>' +
        '</div></section>';
      const area = document.getElementById('people');
      area.addEventListener('input', function () { state.people = area.value; save(); });
      document.getElementById('next').addEventListener('click', function () { go('reflection'); });
    },

    reflection: function () {
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">오늘 활동 소감</h2>' +
        '<p class="screen-description">' + esc(Q.debrief.reflectionPrompt) + '</p>' +
        '<textarea id="reflection" class="quest-field" placeholder="' + esc(Q.debrief.reflectionPlaceholder) + '">' + esc(state.reflection) + '</textarea>' +
        '<div class="button-row"><button id="next" class="primary-button" type="button">활동 마치기</button></div>' +
        '</div></section>';
      const area = document.getElementById('reflection');
      area.addEventListener('input', function () { state.reflection = area.value; save(); });
      document.getElementById('next').addEventListener('click', function () { go('finish'); });
    },

    finish: function () {
      const role = roleOf();
      const team = teamOf(assignment());
      app.innerHTML =
        '<section class="screen"><div class="panel">' +
        '<h2 class="screen-title">활동을 마쳤어요</h2>' +
        '<p class="ok-text">나는 ' + esc(fullName(role)) + '(' + esc(role.title) + '), 암호 ' + esc(team.answer) + ' 팀이었습니다.</p>' +
        '<div class="reason-card"><h3>내가 쓴 소감</h3><p>' + esc(state.reflection || '(쓰지 않았어요)') + '</p></div>' +
        '<div class="button-row"><button id="again" class="secondary-button" type="button">처음부터 다시 하기</button></div>' +
        '</div></section>';
      document.getElementById('again').addEventListener('click', function () {
        if (window.confirm('처음부터 다시 할까요? 지금까지 쓴 내용이 지워집니다.')) { state = defaultState(); save(); render(); }
      });
    }
  };

  function render() {
    // 번호 없이 번호 이후 화면에 들어온 경우를 막는다.
    const needsNumber = ['card', 'cipher', 'team', 'missions', 'letter', 'japan', 'feel', 'history', 'depend', 'people', 'reflection', 'finish'];
    if (needsNumber.indexOf(state.step) >= 0 && !assignment()) state.step = 'number';
    updateProgress();
    screens[state.step]();
  }

  render();
})();
