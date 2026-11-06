/*
 * 인생 게임 외전 「암살」 — 개인 자금판 화면
 * 교사가 PPT를 TV로 진행하고, 학생은 자기 기기에서 장면마다 자기 선택·답을 입력해 독립자금을 반영한다.
 * 표는 종이 「암살 점수 계산표」와 같은 열(나의 선택·획득한 자금·손실한 자금·남은 자금)을 따른다.
 * 규칙·장면·정답은 game.js에 있다. 이 파일에는 넣지 않는다.
 */
(function () {
  'use strict';

  var G = window.AssassinationBoard;
  if (!G) return;

  var app = document.getElementById('app');
  var bar = document.getElementById('scorebar');
  var progressStep = document.getElementById('progress-step');
  var progressValue = document.getElementById('progress-value');

  // 선택 입력 없이 자금만 바뀌는 에피소드(종이 점수표의 회색 칸): 상황·이동
  var NO_CHOICE_EP = {};
  G.STEPS.forEach(function (s) { if (s.kind === 'situation' || s.kind === 'move') NO_CHOICE_EP[s.ep] = true; });

  function defaultState() { return { log: [], quotes: {}, feel: '' }; }
  var state = load();
  var ui = { pick: null, input: [], boxes: [], evalPick: null, showResult: false, showAnswers: false };

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
  function won(n) { return num(n) + '원'; }
  function signed(n) { return n > 0 ? '+' + num(n) : n < 0 ? num(n) : '±0'; }
  function dcls(n) { return n > 0 ? 'is-up' : n < 0 ? 'is-down' : 'is-zero'; }
  function arrow(n) { return n > 0 ? '▲ ' : n < 0 ? '▼ ' : ''; }

  // ── 점수(자금) 막대 ─────────────────────────────────────
  function weaponChips(d, final) {
    return G.WEAPONS.map(function (w) {
      var has = !!d.flags[w.id];
      var text = has ? '✓ ' + w.name : final ? '✕ ' + w.name : w.name;
      return '<span class="wp-chip' + (has ? ' is-on' : '') + '">' + esc(text) + '</span>';
    }).join('');
  }

  function renderBar(d) {
    if (!d.started) { bar.hidden = true; bar.innerHTML = ''; return; }
    var last = null;
    for (var i = d.rows.length - 1; i >= 0; i--) { if (d.rows[i].s !== 'start') { last = d.rows[i]; break; } }
    bar.hidden = false;
    bar.innerHTML = '<div class="score-top"><div class="score-main"><span class="score-label">내 독립자금</span><strong class="score-num">' + num(d.funds) + '<small>원</small></strong></div>' +
      '<div class="score-side"><span class="role-chip">📍 ' + esc(d.pos) + '</span>' +
      (last ? '<span class="score-last ' + dcls(last.delta) + '">' + arrow(last.delta) + signed(last.delta) + '</span>' : '') + '</div></div>' +
      '<div class="wp-row" aria-label="획득한 무기">' + weaponChips(d, false) + '</div>' +
      (d.funds < 0 ? '<p class="debt-note">자금이 모자라면 넉넉한 친구에게 빌리는 게임이에요.</p>' : '');
  }

  function renderProgress(d, step) {
    var ep = d.finished ? G.TOTAL_EP : (step ? step.ep : 0);
    progressStep.textContent = !d.started ? '시작하기' : d.gameOver ? 'GAME OVER' : d.finished ? '게임 오버' : 'EPISODE ' + ep + ' / ' + G.TOTAL_EP;
    progressValue.style.width = Math.round((d.finished ? 1 : !d.started ? 0.02 : (ep - 1) / G.TOTAL_EP + 0.02) * 100) + '%';
  }

  // ── 화면: 시작 ─────────────────────────────────────────
  function startHtml() {
    return '<section class="panel"><h2 class="screen-title">독립운동가가 되어 볼까요?</h2>' +
      '<p class="screen-description">1900년대 일제시대를 체험하는 게임이에요. 이 게임은 <strong>신분 선택이 없고, 모두 같은 신분</strong>입니다. 내 선택으로 독립자금을 얻거나 잃어요.</p>' +
      '<ul class="rules">' +
      '<li><b>객관식</b>은 번호를 눌러 고르고, <b>주관식</b>은 TV 문제의 답을 직접 입력해요.</li>' +
      '<li><b>지역 이동</b>은 자금을 내고 도시를 옮겨요. 이동한 도시는 저절로 기록돼요.</li>' +
      '<li><b>상황 발생</b>은 선택 없이 자금이 바뀌어요.</li>' +
      '<li>권총·소총·콧수염·망원경 같은 <b>무기</b>를 얻으면 일부 퍼즐에서 더 많이 쓸 수 있어요.</li>' +
      '<li>나의 선택과 문제의 정답은 친구에게 알려 주거나 공유하지 않아요. 선택을 누르면 확인 버튼이 한 번 더 나오고 되돌리기도 있어요.</li>' +
      '<li>이 게임은 <strong>승패가 없는 게임</strong>이에요. 자금이 모자라면 넉넉한 친구에게 빌려요.</li></ul>' +
      '<div class="button-row"><button type="button" class="primary-button" data-act="start">게임 시작</button></div></section>';
  }

  // ── 화면: 장면 ─────────────────────────────────────────
  function stepHead(step) {
    return '<p class="event-label">EPISODE ' + step.ep + ' · ' + esc(step.tag) + '</p><h2 class="screen-title">' + esc(step.title) + '</h2>' +
      '<p class="story-cue">' + esc(step.cue) + '</p><p class="tv-note">교실 TV의 장면과 같아요. 내 선택·답만 입력해 주세요.</p>';
  }
  function undoBtn(d) {
    return d.rows.length > 1 ? '<button type="button" class="secondary-button" data-act="undo">← 방금 반영한 것 되돌리기</button>' : '';
  }

  function stepHtml(step, d) {
    var html = '<section class="panel">' + stepHead(step);
    if (step.kind === 'situation') {
      return html + '<p class="setup-hint">선택 없이 자금이 바뀌는 장면이에요. 슬라이드를 확인한 뒤 눌러 주세요.</p>' +
        '<div class="button-row"><button type="button" class="primary-button" data-act="situ">내 자금 반영하기</button>' + undoBtn(d) + '</div></section>';
    }
    if (step.kind === 'move') {
      return html + '<div class="move-box"><span>' + esc(step.from) + '</span><b>→</b><span>' + esc(step.to) + '</span><em class="is-down">' + signed(-step.cost) + '원</em></div>' +
        '<p class="setup-hint">이동 비용을 내고 도시를 옮겨요. 지도에 화살표로 그리는 것은 종이 활동이에요.</p>' +
        '<div class="button-row"><button type="button" class="primary-button" data-act="situ">이동하기</button>' + undoBtn(d) + '</div></section>';
    }
    if (step.kind === 'choice') {
      html += '<div class="choice-grid choice-col">';
      step.choices.forEach(function (c) {
        var sel = ui.pick === c.id;
        html += '<button type="button" class="choice-button' + (sel ? ' is-selected' : '') + '" data-act="pick" data-c="' + c.id + '" aria-pressed="' + sel + '">' +
          '<span class="choice-letter">' + esc(c.no) + '</span>' + esc(c.label) + '</button>';
      });
      return html + '</div><div class="button-row confirm-row"><button type="button" class="primary-button" data-act="confirm"' + (ui.pick ? '' : ' disabled') + '>' +
        (ui.pick ? '이 선택으로 자금 반영하기' : '선택을 눌러 주세요') + '</button>' + undoBtn(d) + '</div></section>';
    }
    if (step.kind === 'quiz') return html + quizHtml(step, d) + '</section>';
    return html + finalHtml(step, d) + '</section>';
  }

  function quizHtml(step, d) {
    var q = step.quiz, out = '';
    if (q.type === 'numbers') {
      var cap = G.numbersCap(q, d.flags);
      out += '<label class="form-label" for="in-0">일본 군인이 있던 곳의 숫자 (최대 ' + cap + '개, ' + (d.flags.rifle ? '소총 있음' : '권총만 있음') + ')</label>' +
        '<input id="in-0" class="quest-field" type="text" inputmode="numeric" autocomplete="off" data-in="0" placeholder="예: 0 1 2 4" value="' + esc(ui.input[0] || '') + '">' +
        '<p id="in-preview" class="setup-hint"></p>';
    } else if (q.type === 'texts') {
      q.items.forEach(function (it, i) {
        out += '<label class="form-label" for="in-' + i + '">' + esc(it.label) + '</label>' +
          '<input id="in-' + i + '" class="quest-field" type="text" autocomplete="off" data-in="' + i + '" value="' + esc(ui.input[i] || '') + '">';
      });
    } else if (q.type === 'text') {
      out += '<label class="form-label" for="in-0">' + esc(q.label) + (q.unit ? ' (' + esc(q.unit) + ')' : '') + '</label>' +
        '<input id="in-0" class="quest-field" type="text" autocomplete="off" data-in="0" value="' + esc(ui.input[0] || '') + '">';
    } else if (q.type === 'boxes') {
      var capB = G.boxesCap(q, d.flags);
      out += '<p class="setup-hint">상자를 ' + (capB === 1 ? '1개' : '2개까지') + ' 고를 수 있어요. ' + (d.flags.telescope ? '(망원경이 있어요)' : '(망원경이 없어요)') + '</p><div class="box-row">';
      for (var b = 1; b <= q.count; b++) {
        var on = ui.boxes.indexOf(String(b)) !== -1;
        out += '<button type="button" class="box-btn' + (on ? ' is-selected' : '') + '" data-act="box" data-b="' + b + '" aria-pressed="' + on + '">' + b + '번 상자</button>';
      }
      out += '</div>';
    }
    return out + '<div class="button-row confirm-row"><button type="button" id="quiz-submit" class="primary-button" data-act="quiz">이 답으로 자금 반영하기</button>' + undoBtn(d) + '</div>';
  }

  function finalHtml(step, d) {
    var out = '<label class="form-label" for="quote-in">나의 독립운동 명언</label>' +
      '<textarea id="quote-in" class="quest-field" rows="3" maxlength="120" data-quote="1" placeholder="독립운동가로서 나의 명언을 써 보세요.">' + esc(ui.input[0] || '') + '</textarea>' +
      '<p class="form-label">짝꿍이 평가해 주세요</p><div class="choice-grid choice-col">';
    G.EVALS.forEach(function (ev) {
      var sel = ui.evalPick === ev.id;
      out += '<button type="button" class="choice-button' + (sel ? ' is-selected' : '') + '" data-act="eval" data-c="' + ev.id + '" aria-pressed="' + sel + '">' + esc(ev.label) + '</button>';
    });
    return out + '</div><div class="button-row confirm-row"><button type="button" class="primary-button" data-act="final"' + (ui.evalPick ? '' : ' disabled') + '>' +
      (ui.evalPick ? '명언과 평가 기록하기' : '평가를 눌러 주세요') + '</button>' + undoBtn(d) + '</div>';
  }

  // ── 화면: 결과 ─────────────────────────────────────────
  function resultHtml(d) {
    var r = d.rows[d.rows.length - 1];
    var more = G.nextStep(d) ? '다음 장면 →' : '마무리 보기 →';
    var html = '<section class="panel result-panel"><p class="event-label">EPISODE ' + r.ep + ' · ' + esc(r.tag) + '</p><h2 class="screen-title">' + esc(r.label) + '</h2>';
    if (r.kind === 'choice' || r.kind === 'quiz') html += '<p class="picked">내 선택·답: <b>' + esc(r.choiceLabel) + '</b>' + (r.grade ? ' <span class="grade-chip">' + esc(r.grade) + '</span>' : '') + '</p>';
    if (r.kind === 'move') html += '<p class="picked">이동: <b>' + esc(r.choiceLabel) + '</b></p>';
    html += '<p class="story-cue">' + esc(r.result) + '</p>' +
      '<div class="delta-big ' + dcls(r.delta) + '">' + arrow(r.delta) + signed(r.delta) + '<small> 원</small></div>' +
      '<p class="after-total">남은 자금 <b>' + won(r.total) + '</b></p>';
    var step = G.stepById(r.s);
    if (step && step.flag && r.kind !== 'quiz') html += '<p class="paper-note">🎒 ' + esc(flagName(step.flag)) + '을(를) 얻었어요.</p>';
    if (step && step.quiz && step.quiz.flag) html += '<p class="paper-note">🎒 ' + esc(flagName(step.quiz.flag)) + '을(를) 얻었어요.</p>';
    if (step && step.choices) {
      var ch = step.choices.filter(function (c) { return c.id === r.c; })[0];
      if (ch && ch.flag) html += '<p class="paper-note">🎒 ' + esc(flagName(ch.flag)) + '을(를) 얻었어요.</p>';
    }
    return html + '<div class="button-row"><button type="button" class="primary-button" data-act="next">' + more + '</button>' +
      '<button type="button" class="secondary-button" data-act="undo">← 되돌리기</button></div></section>';
  }
  function flagName(id) { return G.WEAPONS.filter(function (w) { return w.id === id; })[0].name; }

  // ── 화면: 마무리 ───────────────────────────────────────
  function finishHtml(d) {
    if (d.gameOver) {
      return '<section class="panel finish-panel"><p class="event-label">GAME OVER</p><h2 class="screen-title">게임 참여 불가</h2>' +
        '<p class="story-cue">“눼눼~ 잘 먹고 잘 사세요.” 일제에 협력하며 살아가기로 해서 독립운동 게임에 참여할 수 없어요.</p>' +
        '<div class="delta-big final-total">' + won(d.funds) + '</div><p class="setup-hint">마음이 바뀌었다면 되돌려서 다시 고를 수 있어요.</p>' +
        '<div class="button-row"><button type="button" class="secondary-button" data-act="undo">← 되돌리기</button></div></section>';
    }
    var html = '<section class="panel finish-panel"><p class="event-label">GAME OVER</p><h2 class="screen-title">독립운동 36년, 수고 많았어요</h2>' +
      '<div class="delta-big final-total">' + won(d.funds) + '</div>' +
      '<p class="screen-description">이 게임은 승패가 없어요. 자금이 많고 적은 것보다, <strong>내 선택이 독립운동에 어떤 일이 되었는지</strong> 돌아보는 게 중요합니다.</p>' +
      '<p class="form-label">나의 독립운동 명언</p><p class="story-cue">“' + esc(d.quote || '(쓰지 않았어요)') + '”</p>' +
      '<p class="picked">짝꿍의 평가: <b>' + esc(d.evalResult) + '</b></p>' +
      '<p class="form-label">획득한 무기</p><div class="wp-row">' + weaponChips(d, true) + '</div>' +
      '<p class="form-label">이동경로</p><p class="route-line">' + d.route.map(esc).join(' → ') + '</p>' +
      '<div class="button-row"><button type="button" class="secondary-button" data-act="undo">← 마지막 반영 되돌리기</button></div></section>';
    return html + notesHtml();
  }

  function notesHtml() {
    var html = '<section class="panel"><h2 class="screen-title">독립운동가 명언 정리</h2>' +
      '<p class="screen-description">게임에서 만난 명언의 빈칸과 누가 한 말인지 써 보세요. 이 기기 안에만 저장돼요.</p>';
    G.QUOTES.forEach(function (q) {
      var v = state.quotes[q.id] || {};
      html += '<div class="term-item"><p class="term-def">' + esc(q.text) + '</p>' +
        '<div class="two-field"><input class="quest-field" type="text" aria-label="독립운동가" placeholder="독립운동가" data-quote-who="' + q.id + '" value="' + esc(v.who || '') + '" autocomplete="off">' +
        '<input class="quest-field" type="text" aria-label="빈칸" placeholder="빈칸에 들어갈 말" data-quote-blank="' + q.id + '" value="' + esc(v.blank || '') + '" autocomplete="off"></div>' +
        '<details class="term-hint"><summary>정답 보기</summary><p><b>' + esc(q.who) + '</b> · ' + esc(q.answer) + '</p></details></div>';
    });
    return html + '</section><section class="panel"><h2 class="screen-title">느낀점</h2>' +
      '<textarea class="quest-field" rows="4" aria-label="느낀점" data-feel="1">' + esc(state.feel || '') + '</textarea></section>';
  }

  // ── 점수표(종이 점수 계산표와 같은 열) ───────────────────
  function ledgerHtml(d) {
    var byEp = {};
    d.rows.forEach(function (r) { if (r.ep !== null) (byEp[r.ep] = byEp[r.ep] || []).push(r); });
    var manual = d.rows.filter(function (r) { return r.s === 'manual'; });
    var html = '<section class="panel ledger"><details' + (d.finished ? ' open' : '') + '><summary class="ledger-sum">내 점수표 보기 <small>(에피소드별 기록)</small></summary>' +
      '<p class="ledger-start">처음 독립자금: <b>0원</b></p>' +
      '<div class="sheet-wrap"><table class="sheet"><thead><tr><th>EP</th><th>나의 선택</th><th>획득</th><th>손실</th><th>남은 자금</th></tr></thead><tbody>';
    for (var ep = 1; ep <= G.TOTAL_EP; ep++) {
      G.CHAPTERS.forEach(function (c) {
        if (c.from === ep) html += '<tr class="chapter"><th colspan="5">CHAPTER ' + c.n + ' · ' + c.year + '</th></tr>';
      });
      var rs = byEp[ep] || [];
      var gain = 0, loss = 0, picks = [];
      rs.forEach(function (r) {
        if (r.delta > 0) gain += r.delta; else loss += r.delta;
        if (r.no !== null && r.kind !== 'final') picks.push(esc(r.no));
        if (r.kind === 'final') picks.push('명언');
      });
      var grey = NO_CHOICE_EP[ep] ? ' class="grey"' : '';
      html += '<tr><th scope="row">' + ep + '</th><td' + grey + '>' + picks.join(', ') + '</td>' +
        '<td class="is-up">' + (gain ? '+' + num(gain) : '') + '</td><td class="is-down">' + (loss ? num(loss) : '') + '</td>' +
        '<td class="rest">' + (rs.length ? num(rs[rs.length - 1].total) : '') + '</td></tr>';
    }
    html += '</tbody></table></div>' +
      '<p class="form-label">획득한 무기</p><div class="wp-row">' + weaponChips(d, d.finished) + '</div>' +
      '<p class="form-label">이동경로</p><p class="route-line">' + d.route.map(esc).join(' → ') + '</p>';
    if (manual.length) {
      html += '<ul class="manual-list">';
      manual.forEach(function (r) { html += '<li>' + esc(r.choiceLabel) + ' <b class="' + dcls(r.delta) + '">' + signed(r.delta) + '</b> (합계 ' + num(r.total) + ')</li>'; });
      html += '</ul>';
    }
    html += '</details><details class="gate-details"><summary>선생님이 자금을 따로 알려 줬을 때</summary><div class="gate-box">' +
      '<label class="form-label" for="m-delta">바뀌는 자금 (예: 100 또는 -50)</label>' +
      '<input id="m-delta" class="quest-field" type="text" inputmode="numeric" autocomplete="off">' +
      '<label class="form-label" for="m-memo">메모(선택)</label>' +
      '<input id="m-memo" class="quest-field" type="text" maxlength="30" autocomplete="off">' +
      '<div class="button-row"><button type="button" class="secondary-button" data-act="manual">자금 더하기</button></div>' +
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
    if (!d.started) html = startHtml();
    else {
      if (ui.showResult && d.rows.length && d.rows[d.rows.length - 1].s !== 'start') html = resultHtml(d);
      else if (d.finished) html = finishHtml(d);
      else if (step) html = stepHtml(step, d);
      else html = '<section class="panel"><p>더 진행할 장면이 없어요.</p>' + undoBtn(d) + '</section>';
      html += ledgerHtml(d);
    }
    app.innerHTML = html;
    updatePreview();
  }

  // 일본군 위치 입력: 쓴 숫자와 상한을 바로 보여 준다(다시 그리지 않고 문구만 바꾼다)
  function updatePreview() {
    var el = document.getElementById('in-preview');
    var btn = document.getElementById('quiz-submit');
    var d = G.derive(state.log), step = G.nextStep(d);
    if (!step || step.kind !== 'quiz') return;
    if (el && step.quiz.type === 'numbers') {
      var cap = G.numbersCap(step.quiz, d.flags);
      var all = G.parseNumbers(ui.input[0]);
      el.textContent = all.length ? '인정되는 번호: ' + all.slice(0, cap).join(', ') + (all.length > cap ? ' (앞의 ' + cap + '개만 인정돼요)' : '') : '';
    }
    if (btn) btn.disabled = !quizReady(step, d);
  }
  function quizReady(step, d) {
    var t = step.quiz.type;
    if (t === 'numbers') return G.parseNumbers(ui.input[0]).length > 0;
    if (t === 'text') return String(ui.input[0] || '').trim() !== '';
    if (t === 'texts') return step.quiz.items.some(function (x, i) { return String(ui.input[i] || '').trim() !== ''; });
    if (t === 'boxes') return ui.boxes.length > 0;
    return false;
  }

  function resetInputs() { ui.pick = null; ui.input = []; ui.boxes = []; ui.evalPick = null; }
  function push(entry) { state.log.push(entry); resetInputs(); ui.showResult = true; save(); render(); window.scrollTo(0, 0); }

  app.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    var d = G.derive(state.log);
    var step = G.nextStep(d);
    if (act === 'start') {
      state.log = [{ s: 'start', c: 'start' }]; resetInputs(); ui.showResult = false; save(); render();
    } else if (act === 'pick') {
      ui.pick = t.getAttribute('data-c'); render();
    } else if (act === 'confirm') {
      if (step && ui.pick) push({ s: step.id, c: ui.pick });
    } else if (act === 'situ') {
      if (step) push({ s: step.id, c: 'ok' });
    } else if (act === 'box') {
      if (!step || step.kind !== 'quiz') return;
      var b = t.getAttribute('data-b'), cap = G.boxesCap(step.quiz, d.flags), i = ui.boxes.indexOf(b);
      if (i !== -1) ui.boxes.splice(i, 1); else { ui.boxes.push(b); if (ui.boxes.length > cap) ui.boxes.shift(); }
      render();
    } else if (act === 'quiz') {
      if (!step || step.kind !== 'quiz' || !quizReady(step, d)) return;
      var a = step.quiz.type === 'boxes' ? ui.boxes.slice() : step.quiz.type === 'texts' ? step.quiz.items.map(function (x, k) { return ui.input[k] || ''; }) : [ui.input[0] || ''];
      push({ s: step.id, a: a });
    } else if (act === 'eval') {
      ui.evalPick = t.getAttribute('data-c'); render();
    } else if (act === 'final') {
      if (step && step.kind === 'final' && ui.evalPick) push({ s: step.id, q: ui.input[0] || '', c: ui.evalPick });
    } else if (act === 'next') {
      ui.showResult = false; render(); window.scrollTo(0, 0);
    } else if (act === 'undo') {
      if (state.log.length > 1) { state.log.pop(); resetInputs(); ui.showResult = false; save(); render(); window.scrollTo(0, 0); }
    } else if (act === 'manual') {
      var v = String(document.getElementById('m-delta').value).replace(/[\s,]/g, '').replace('−', '-');
      var err = document.getElementById('m-err');
      if (!/^[+-]?\d{1,6}$/.test(v)) { err.hidden = false; return; }
      state.log.push({ s: 'manual', delta: parseInt(v, 10), memo: document.getElementById('m-memo').value.trim() });
      save(); render();
    } else if (act === 'reset') {
      if (window.confirm('자금과 기록을 모두 지우고 처음부터 다시 할까요?')) {
        state = defaultState(); resetInputs(); ui.showResult = false; save(); render(); window.scrollTo(0, 0);
      }
    }
  });

  // 입력 칸은 다시 그리지 않고 저장·미리보기만 갱신한다(타이핑 중 포커스 유지)
  app.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.hasAttribute('data-in')) { ui.input[Number(el.getAttribute('data-in'))] = el.value; updatePreview(); }
    else if (el.hasAttribute('data-quote')) { ui.input[0] = el.value; }
    else if (el.hasAttribute('data-quote-who') || el.hasAttribute('data-quote-blank')) {
      var id = el.getAttribute('data-quote-who') || el.getAttribute('data-quote-blank');
      state.quotes[id] = state.quotes[id] || {};
      state.quotes[id][el.hasAttribute('data-quote-who') ? 'who' : 'blank'] = el.value; save();
    } else if (el.hasAttribute('data-feel')) { state.feel = el.value; save(); }
  });

  render();
})();
