/*
 * 갑신정변과 동학농민운동 인생 게임 — 개인 점수판 화면
 * 교사가 PPT를 TV로 진행하고, 학생은 자기 기기에서 장면마다 자기 선택만 눌러 점수·국력을 반영한다.
 * 표는 종이 「점수 계산표(개항이후)」와 같은 열(현재 신분·나의 선택·획득·손실·남은 포인트)과 CHAPTER 구분을 따른다.
 * 점수 규칙·장면 데이터는 game.js에 있다. 이 파일에는 넣지 않는다.
 */
(function () {
  'use strict';

  var G = window.GapsinBoard;
  if (!G) return;

  var app = document.getElementById('app');
  var bar = document.getElementById('scorebar');
  var progressStep = document.getElementById('progress-step');
  var progressValue = document.getElementById('progress-value');

  var TERMS = [
    { id: 't1', name: '영선사', def: '개항 이후 청나라에 무기 만드는 기술과 근대적 제도를 배우러 간 사신들' },
    { id: 't2', name: '수신사', def: '강화도 조약 이후 조선에서 일본에 파견한 외교 사절' },
    { id: 't3', name: '별기군', def: '조선 고종 때 개화 정책을 펼치면서 우리나라 최초로 만들어진 신식 군대(특별한 기술을 가진 군대)' },
    { id: 't4', name: '임오군란', def: '1882년에 구식군대가 차별대우에 불만을 품고 일으킨 난' },
    { id: 't5', name: '온건개화파', def: '청나라를 모델로 점진적 개혁을 주장한 개화파' },
    { id: 't6', name: '급진개화파', def: '일본을 모델로 급진적 개화를 주장한 개화파' },
    { id: 't7', name: '갑신정변', def: '1884년 김옥균을 비롯한 급진개화파가 개화사상을 바탕으로 조선의 자주독립과 근대화를 목표로 일으킨 정변' },
    { id: 't8', name: '동학농민운동', def: '1894년 전라도 고부의 전봉준 등을 지도자로 동학교도와 농민들이 합세하여 일으킨 농민운동' },
    { id: 't9', name: '청일전쟁', def: '청나라와 일본이 조선의 지배권을 놓고 다툰 전쟁' }
  ];

  // 선택 없이 점수만 바뀌는 에피소드(종이 점수표에서 회색 칸)
  var NO_CHOICE_EP = (function () {
    var all = {}, hasChoice = {};
    G.STEPS.forEach(function (s) { all[s.ep] = true; if (s.kind === 'choice') hasChoice[s.ep] = true; });
    var out = {};
    Object.keys(all).forEach(function (ep) { if (!hasChoice[ep]) out[ep] = true; });
    return out;
  })();

  function defaultState() { return { log: [], terms: {}, stance: {} }; }
  var state = load();
  // A·B를 눌렀을 때 신분을 정하는 방식. 기본은 학생마다 무작위(친구가 알려 줘도 소용없음).
  // 주소 끝에 ?ab=ppt 를 붙이면 수업 슬라이드의 배치(A = 중국어 능력자, B = 일본어 능력자)로 고정한다.
  var AB_PPT = location.search.indexOf('ab=ppt') !== -1;
  var START_MAP = { A: 'zh', B: 'ja' };
  function drawStart(pick) { return AB_PPT ? START_MAP[pick] : (Math.random() < 0.5 ? 'zh' : 'ja'); }
  var ui = { pick: null, showResult: false, showTrophy: false, reveal: false };

  function load() {
    try {
      var raw = localStorage.getItem(G.STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === 'object' && Array.isArray(s.log)) return Object.assign(defaultState(), s);
      }
    } catch (e) { /* 저장소를 못 써도 점수판은 동작한다 */ }
    return defaultState();
  }
  function save() { try { localStorage.setItem(G.STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 무시 */ } }

  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function num(n) { return (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('ko-KR'); }
  function signed(n) { return n > 0 ? '+' + num(n) : n < 0 ? num(n) : '±0'; }
  function dcls(n) { return n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-zero'; }
  function arrow(n) { return n > 0 ? '▲ ' : n < 0 ? '▼ ' : ''; }

  // 국력 막대: 해골·하트 각 5칸, 받을 때마다 왼쪽부터 채운다
  function cells(n, mark) {
    var html = '';
    for (var i = 0; i < G.POWER_MAX; i++) html += '<span class="pw-cell' + (i < n ? ' is-on' : '') + '">' + (i < n ? mark : '') + '</span>';
    return html;
  }
  function powerHtml(d) {
    return '<span class="pw-row" aria-label="해골 ' + Math.min(d.skull, G.POWER_MAX) + '칸"><span class="pw-ic">💀</span>' + cells(d.skull, '💀') + '</span>' +
      '<span class="pw-row" aria-label="하트 ' + Math.min(d.heart, G.POWER_MAX) + '칸"><span class="pw-ic">♥</span>' + cells(d.heart, '♥') + '</span>';
  }
  function powerGuide(d) {
    var s = d.skull, h = d.heart;
    return s >= G.POWER_MAX ? '💀 FULL' : s > h ? '💀 &gt; ♥' : s < h ? '💀 &lt; ♥' : '💀 = ♥';
  }

  // ── 점수 막대 ───────────────────────────────────────────
  function renderBar(d) {
    if (!d.role) { bar.hidden = true; bar.innerHTML = ''; return; }
    var last = null;
    for (var i = d.rows.length - 1; i >= 0; i--) { if (d.rows[i].s !== 'start') { last = d.rows[i]; break; } }
    bar.hidden = false;
    bar.innerHTML = '<div class="score-main"><span class="score-label">내 포인트</span><strong class="score-num">' + num(d.points) + '</strong></div>' +
      '<div class="score-power" aria-label="국력">' + powerHtml(d) + '</div>' +
      '<div class="score-side"><span class="role-chip role-' + d.role + '">' + G.ROLE_NAME[d.role] + '</span>' +
      (last ? '<span class="score-last ' + dcls(last.delta) + '">' + arrow(last.delta) + signed(last.delta) + '</span>' : '') + '</div>';
  }

  function renderProgress(d, step) {
    var ep = d.finished ? G.TOTAL_EP : (step ? step.ep : 0);
    progressStep.textContent = !d.role ? '시작하기' : d.finished ? '게임 오버' : 'EPISODE ' + ep + ' / ' + G.TOTAL_EP;
    progressValue.style.width = Math.round((d.finished ? 1 : !d.role ? 0.02 : (ep - 1) / G.TOTAL_EP + 0.02) * 100) + '%';
  }

  // ── 화면: 시작 ─────────────────────────────────────────
  function startHtml() {
    return '<section class="panel">' +
      '<h2 class="screen-title">캐릭터 선택</h2>' +
      '<p class="screen-description">수업 화면의 「캐릭터 선택」처럼, 다음 중 <strong>한 가지</strong>를 골라 주세요. 선택에 의해 내 신분이 결정됩니다.</p>' +
      '<div class="role-pick">' +
      '<button type="button" class="role-pick-btn role-ab" data-act="start" data-pick="A"><b>A</b></button>' +
      '<button type="button" class="role-pick-btn role-ab" data-act="start" data-pick="B"><b>B</b></button>' +
      '</div>' +
      '<ul class="rules">' +
      '<li>화면의 EPISODE 번호는 수업 슬라이드와 같아요. 슬라이드가 나오면 내 기기에서 <strong>내 선택</strong>을 눌러 점수를 반영합니다.</li>' +
      '<li>해골(💀)을 받으면 국력이 약해지고 하트(♥)를 받으면 강해져요. 국력은 개인 보상과 아무 상관이 없어요.</li>' +
      '<li>선택을 누르면 확인 버튼이 한 번 더 나와요. 실수로 눌렀다면 <strong>되돌리기</strong>가 있어요.</li>' +
      '<li>내 신분이 아닌 장면은 저절로 건너뜁니다.</li>' +
      '<li>이 게임은 <strong>승패가 없는 게임</strong>이에요. 친구의 선택을 비난하거나 놀리지 않기로 약속해요.</li>' +
      '</ul></section>';
  }

  // 고른 뒤 공개 화면(수업 슬라이드의 「당신의 신분은 …입니다」)
  function revealHtml(d) {
    return '<section class="panel result-panel"><p class="event-label">캐릭터 선택 결과</p>' +
      '<h2 class="screen-title">당신의 신분은 ' + G.ROLE_NAME[d.role] + '입니다.</h2>' +
      '<div class="delta-big final-total">' + num(d.points) + '<small> 포인트</small></div>' +
      '<p class="after-total">처음 포인트를 받았어요. 이 능력은 게임 끝까지 남아요.</p>' +
      '<div class="button-row"><button type="button" class="primary-button" data-act="begin">게임 시작 →</button></div></section>';
  }

  // ── 화면: 장면 ─────────────────────────────────────────
  function stepHead(step) {
    return '<p class="event-label">EPISODE ' + step.ep + ' · ' + esc(step.tag) + '</p><h2 class="screen-title">' + esc(step.title) + '</h2>' +
      '<p class="story-cue">' + esc(step.cue) + '</p><p class="tv-note">교실 TV의 장면과 같아요. 내 선택만 눌러 주세요.</p>';
  }

  function hintText(key, d) {
    var f = d.flags;
    if (key === 'ability') return '내 기록: 처음 능력은 ' + G.ABILITY_NAME[d.ability] + ' 능력자예요.';
    if (key === 'skills') return '내 기록: 농업기술 ' + (f.agri ? '있음' : '없음') + ', 사격기술 ' + (f.shoot ? '있음' : '없음') + '.';
    if (key === 'agri') return '내 기록: 에피소드 3에서 농업기술을 ' + (f.agri ? '배웠어요.' : '배우지 않았어요.');
    if (key === 'shoot') return '내 기록: 에피소드 3에서 사격기술을 ' + (f.shoot ? '배웠어요.' : '배우지 않았어요.');
    if (key === 'helped') return '내 기록: 에피소드 5에서 농민 전창혁의 부탁을 ' + (f.helped ? '들어줬어요.' : '들어주지 않았어요.');
    return '';
  }

  function stepHtml(step, d) {
    if (step.kind === 'situation') {
      return '<section class="panel">' + stepHead(step) +
        '<p class="setup-hint">선택 없이 점수가 바뀌는 장면이에요. 슬라이드를 확인한 뒤 눌러 주세요.</p>' +
        '<div class="button-row"><button type="button" class="primary-button" data-act="situ">내 점수 반영하기</button>' + undoBtn(d) + '</div></section>';
    }
    var html = '<section class="panel">' + stepHead(step) + '<div class="choice-grid choice-col">';
    step.choices.forEach(function (c) {
      var sel = ui.pick === c.id;
      html += '<button type="button" class="choice-button' + (sel ? ' is-selected' : '') + '" data-act="pick" data-c="' + c.id + '" aria-pressed="' + sel + '">' +
        '<span class="choice-letter">' + esc(c.no) + '</span>' + esc(c.label) + '</button>';
    });
    html += '</div>';
    if (step.hint) html += '<p class="setup-hint">' + esc(hintText(step.hint, d)) + '</p>';
    if (step.draw && !AB_PPT) html += '<p class="setup-hint">제비뽑기예요. 카드를 고르면 결과는 뽑기로 정해져요.</p>';
    html += '<div class="button-row confirm-row"><button type="button" class="primary-button" data-act="confirm"' + (ui.pick ? '' : ' disabled') + '>' +
      (ui.pick ? '이 선택으로 점수 반영하기' : '선택을 눌러 주세요') + '</button>' + undoBtn(d) + '</div></section>';
    return html;
  }

  function undoBtn(d) {
    return d.rows.length > 1 ? '<button type="button" class="secondary-button" data-act="undo">← 방금 반영한 것 되돌리기</button>' : '';
  }

  // ── 화면: 결과 ─────────────────────────────────────────
  function resultHtml(d) {
    var r = d.rows[d.rows.length - 1];
    var more = G.nextStep(d) ? '다음 장면 →' : '마무리 보기 →';
    var html = '<section class="panel result-panel">' +
      '<p class="event-label">EPISODE ' + r.ep + ' · ' + esc(r.tag) + '</p><h2 class="screen-title">' + esc(r.label) + '</h2>' +
      (r.choiceLabel && r.choiceLabel !== '선택 없음' ? '<p class="picked">내 선택: <b>' + esc(r.choiceLabel) + '</b></p>' : '') +
      '<p class="story-cue">' + esc(r.result) + '</p>' +
      '<div class="delta-big ' + dcls(r.delta) + '">' + arrow(r.delta) + signed(r.delta) + '<small> 포인트</small></div>';
    if (r.bonusNote) html += '<p class="bonus-note">(' + esc(r.bonusNote) + ' 포함)</p>';
    if (r.skull || r.heart) {
      html += '<p class="power-note">국력 ' + (r.skull ? '<b class="is-down">💀 +' + r.skull + '칸</b> ' : '') + (r.heart ? '<b class="is-up">♥ +' + r.heart + '칸</b>' : '') + '</p>';
    }
    html += '<p class="after-total">남은 포인트 <b>' + num(r.total) + '</b></p>';
    if (r.roleAfter && r.roleAfter !== r.role) {
      html += '<p class="paper-note">신분이 <b>' + G.ROLE_NAME[r.roleAfter] + '</b>(으)로 바뀌었어요.</p>';
    }
    return html + '<div class="button-row"><button type="button" class="primary-button" data-act="next">' + more + '</button>' +
      '<button type="button" class="secondary-button" data-act="undo">← 되돌리기</button></div></section>';
  }

  // ── 화면: 게임 오버 ─────────────────────────────────────
  function finishHtml(d) {
    var rows = d.rows.filter(function (r) { return r.ep !== null; });
    var best = null, worst = null;
    rows.forEach(function (r) {
      if (!best || r.delta > best.delta) best = r;
      if (!worst || r.delta < worst.delta) worst = r;
    });
    var html = '<section class="panel finish-panel"><p class="event-label">GAME OVER</p>' +
      '<h2 class="screen-title">내 인생 게임이 끝났어요</h2>' +
      '<div class="delta-big final-total">' + num(d.points) + '<small> 포인트</small></div>' +
      '<div class="power-final"><span class="power-title">국력</span><span class="score-power">' + powerHtml(d) + '</span><span class="power-guide">' + powerGuide(d) + '</span></div>' +
      '<p class="screen-description">이 게임은 승패가 없어요. 점수가 높고 낮은 것보다, <strong>내 선택이 그 시대 사람들에게 어떤 일이 되었는지</strong> 돌아보는 게 중요합니다.</p>';
    if (best && best.delta > 0) html += '<p class="recap">가장 크게 오른 장면: <b>EPISODE ' + best.ep + ' ' + esc(best.label) + '</b> <span class="is-up">' + signed(best.delta) + '</span></p>';
    if (worst && worst.delta < 0) html += '<p class="recap">가장 크게 내려간 장면: <b>EPISODE ' + worst.ep + ' ' + esc(worst.label) + '</b> <span class="is-down">' + signed(worst.delta) + '</span></p>';
    if (ui.showTrophy) {
      var t = G.trophy(d.points);
      html += '<div class="trophy-box"><b>' + (t ? esc(t.name) : '이번에는 트로피가 없어요') + '</b><p>' + (t ? esc(t.text) : '1,000 포인트에 닿지 못했어요. 어떤 선택이 점수를 많이 바꿨는지 돌아봐요.') + '</p></div>';
    } else {
      html += '<div class="button-row"><button type="button" class="primary-button" data-act="trophy">선생님이 공개하면 내 개인 보상 보기</button></div>';
    }
    html += '<div class="button-row"><button type="button" class="secondary-button" data-act="undo">← 마지막 반영 되돌리기</button></div></section>';
    return html + notesHtml();
  }

  function notesHtml() {
    var html = '<section class="panel"><h2 class="screen-title">한줄 정리하기</h2>' +
      '<p class="screen-description">뜻을 읽고 어떤 낱말인지 써 보세요. 이 기기 안에만 저장돼요.</p>';
    TERMS.forEach(function (t) {
      html += '<div class="term-item"><p class="term-def">' + esc(t.def) + '</p>' +
        '<input class="quest-field" type="text" aria-label="낱말" data-term="' + t.id + '" value="' + esc(state.terms[t.id] || '') + '" autocomplete="off">' +
        '<details class="term-hint"><summary>정답 보기</summary><p><b>' + esc(t.name) + '</b></p></details></div>';
    });
    html += '</section><section class="panel"><h2 class="screen-title">온건 개화파의 입장 정리</h2>' +
      '<p class="screen-description">보기: 나라 전체 · 의존하자 · 청나라 · 일본 · 기술 · 벗어나자</p><ul class="stance-list">' +
      '<li><input class="quest-field inline" type="text" aria-label="빈칸 1" data-stance="s1" value="' + esc(state.stance.s1 || '') + '" autocomplete="off">처럼 천천히 개화하자</li>' +
      '<li>조선은 힘이 약하니 청나라에 <input class="quest-field inline" type="text" aria-label="빈칸 2" data-stance="s2" value="' + esc(state.stance.s2 || '') + '" autocomplete="off"></li>' +
      '<li>법과 제도는 우리 전통대로</li>' +
      '<li>서양의 <input class="quest-field inline" type="text" aria-label="빈칸 3" data-stance="s3" value="' + esc(state.stance.s3 || '') + '" autocomplete="off">만을 받아들이자</li></ul></section>';
    return html;
  }

  // ── 점수표(종이 점수 계산표와 같은 열) ───────────────────
  function ledgerHtml(d) {
    var byEp = {};
    d.rows.forEach(function (r) { if (r.ep !== null) (byEp[r.ep] = byEp[r.ep] || []).push(r); });
    var manual = d.rows.filter(function (r) { return r.s === 'manual'; });
    var html = '<section class="panel ledger"><details' + (d.finished ? ' open' : '') + '><summary class="ledger-sum">내 점수표 보기 <small>(에피소드별 기록)</small></summary>' +
      '<p class="ledger-start">처음 지급받은 포인트: <b>' + num(G.START_POINTS) + '</b></p>' +
      '<div class="sheet-wrap"><table class="sheet"><thead><tr><th>EP</th><th>현재 신분</th><th>나의 선택</th><th>획득</th><th>손실</th><th>남은 포인트</th></tr></thead><tbody>';
    for (var ep = 1; ep <= G.TOTAL_EP; ep++) {
      G.CHAPTERS.forEach(function (c) {
        if (c.from === ep) html += '<tr class="chapter"><th colspan="6">CHAPTER ' + c.n + ' · ' + c.year + '</th></tr>';
      });
      var rs = byEp[ep] || [];
      var gain = 0, loss = 0, picks = [];
      rs.forEach(function (r) {
        if (r.delta > 0) gain += r.delta; else loss += r.delta;
        if (r.no !== null) picks.push(r.no);
      });
      var grey = NO_CHOICE_EP[ep] ? ' class="grey"' : '';
      html += '<tr><th scope="row">' + ep + '</th><td>' + (rs.length ? G.ROLE_NAME[rs[0].role] : '') + '</td><td' + grey + '>' + picks.join(', ') + '</td>' +
        '<td class="is-up">' + (gain ? '+' + num(gain) : '') + '</td><td class="is-down">' + (loss ? num(loss) : '') + '</td>' +
        '<td class="rest">' + (rs.length ? num(rs[rs.length - 1].total) : '') + '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += '<div class="power-final"><span class="power-title">국력</span><span class="score-power">' + powerHtml(d) + '</span><span class="power-guide">' + powerGuide(d) + '</span></div>';
    if (manual.length) {
      html += '<ul class="manual-list">';
      manual.forEach(function (r) { html += '<li>' + esc(r.choiceLabel) + ' <b class="' + dcls(r.delta) + '">' + signed(r.delta) + '</b> (합계 ' + num(r.total) + ')</li>'; });
      html += '</ul>';
    }
    html += '</details><details class="gate-details"><summary>선생님이 점수를 따로 알려 줬을 때</summary><div class="gate-box">' +
      '<label class="form-label" for="m-delta">바뀌는 점수 (예: 100 또는 -50)</label>' +
      '<input id="m-delta" class="quest-field" type="text" inputmode="numeric" autocomplete="off">' +
      '<label class="form-label" for="m-memo">메모(선택)</label>' +
      '<input id="m-memo" class="quest-field" type="text" maxlength="30" autocomplete="off">' +
      '<div class="button-row"><button type="button" class="secondary-button" data-act="manual">점수 더하기</button></div>' +
      '<p id="m-err" class="error-note" hidden>숫자(예: 100, -50)로 써 주세요.</p></div></details>' +
      '<div class="button-row reset-row"><button type="button" class="secondary-button" data-act="reset">처음부터 다시 하기</button></div></section>';
    return html;
  }

  // ── 그리기 ─────────────────────────────────────────────
  function render() {
    var d = G.derive(state.log);
    var step = G.nextStep(d);
    renderBar(d);
    renderProgress(d, step);
    var html;
    if (!d.role) html = startHtml();
    else {
      if (ui.reveal && d.rows.length === 1) html = revealHtml(d);
      else if (ui.showResult && d.rows.length && d.rows[d.rows.length - 1].s !== 'start') html = resultHtml(d);
      else if (d.finished) html = finishHtml(d);
      else if (step) html = stepHtml(step, d);
      else html = '<section class="panel"><p>더 진행할 장면이 없어요.</p>' + undoBtn(d) + '</section>';
      html += ledgerHtml(d);
    }
    app.innerHTML = html;
  }

  function push(entry) { state.log.push(entry); ui.pick = null; ui.showResult = true; save(); render(); window.scrollTo(0, 0); }

  app.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var d = G.derive(state.log);
    var step = G.nextStep(d);
    if (act === 'start') {
      state.log = [{ s: 'start', c: drawStart(t.getAttribute('data-pick')) }]; ui.showResult = false; ui.reveal = true; save(); render();
    } else if (act === 'begin') {
      ui.reveal = false; render(); window.scrollTo(0, 0);
    } else if (act === 'pick') {
      ui.pick = t.getAttribute('data-c'); render();
    } else if (act === 'confirm') {
      if (step && ui.pick) {
        if (step.draw && !AB_PPT) {
          // 제비뽑기: 누른 카드와 상관없이 결과는 무작위(기록에는 누른 카드 p와 결과 c를 따로 남긴다)
          var card = step.choices.filter(function (c) { return c.id === ui.pick; })[0];
          var outcome = step.choices[Math.floor(Math.random() * step.choices.length)];
          push({ s: step.id, c: outcome.id, p: String(card.no) });
        } else push({ s: step.id, c: ui.pick });
      }
    } else if (act === 'situ') {
      if (step) push({ s: step.id, c: 'ok' });
    } else if (act === 'next') {
      ui.showResult = false; render(); window.scrollTo(0, 0);
    } else if (act === 'trophy') {
      ui.showTrophy = true; render();
    } else if (act === 'undo') {
      if (state.log.length > 1) { state.log.pop(); ui.pick = null; ui.showResult = false; ui.showTrophy = false; save(); render(); window.scrollTo(0, 0); }
    } else if (act === 'manual') {
      var v = String(document.getElementById('m-delta').value).replace(/[\s,]/g, '').replace('−', '-');
      var err = document.getElementById('m-err');
      if (!/^[+-]?\d{1,6}$/.test(v)) { err.hidden = false; return; }
      state.log.push({ s: 'manual', delta: parseInt(v, 10), memo: document.getElementById('m-memo').value.trim() });
      save(); render();
    } else if (act === 'reset') {
      if (window.confirm('점수와 기록을 모두 지우고 처음부터 다시 할까요?')) {
        state = defaultState(); ui.pick = null; ui.showResult = false; ui.showTrophy = false; save(); render(); window.scrollTo(0, 0);
      }
    }
  });

  // 입력 칸은 다시 그리지 않고 저장만 한다(타이핑 중 포커스 유지)
  app.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.hasAttribute('data-term')) { state.terms[el.getAttribute('data-term')] = el.value; save(); }
    else if (el.hasAttribute('data-stance')) { state.stance[el.getAttribute('data-stance')] = el.value; save(); }
  });

  render();
})();
