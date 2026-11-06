/*
 * 세도 정치 인생 게임 — 개인 점수판 화면
 * 교사가 PPT를 보여 주고, 학생은 자기 기기에서 장면마다 자기 선택을 눌러 점수를 반영한다.
 * 표는 종이 「점수 계산표(세도정치)」와 같은 열(현재 신분·나의 선택·획득·손실·남은 포인트)을 따른다.
 * 점수 규칙·장면 데이터는 game.js에 있다. 이 파일에는 넣지 않는다.
 */
(function () {
  'use strict';

  var G = window.SedoBoard;
  if (!G) return;

  var app = document.getElementById('app');
  var bar = document.getElementById('scorebar');
  var progressStep = document.getElementById('progress-step');
  var progressValue = document.getElementById('progress-value');

  var TERMS = [
    { id: 'sedo', name: '세도정치', hint: '왕이 아닌 왕의 외가 친척 가문이 나라를 다스리는 정치' },
    { id: 'maegwan', name: '매관매직', hint: '돈을 주고 벼슬을 사고 파는 행위' },
    { id: 'tamgwan', name: '탐관오리', hint: '탐욕이 많고 나쁜 짓을 저지르는 벼슬아치' },
    { id: 'hwangok', name: '환곡제도', hint: '봄에 나라에서 곡식을 빌려주었다가 가을에 이자를 붙여서 갚도록 하는 제도' },
    { id: 'gwonseon', name: '권선징악', hint: '착한 일을 권하고 악한 일을 벌한다.' }
  ];
  var TOTAL_EP = 21;

  // 선택 없이 점수만 바뀌는 에피소드(종이 점수표에서 회색 칸)
  var NO_CHOICE_EP = (function () {
    var all = {}, hasChoice = {};
    G.STEPS.forEach(function (s) { all[s.ep] = true; if (s.kind === 'choice') hasChoice[s.ep] = true; });
    var out = {};
    Object.keys(all).forEach(function (ep) { if (!hasChoice[ep]) out[ep] = true; });
    return out;
  })();

  function defaultState() { return { log: [], terms: {}, feel: '' }; }
  var state = load();
  var ui = { pick: null, showResult: false };

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

  // ── 점수 막대 ───────────────────────────────────────────
  function renderBar(d) {
    if (!d.base) { bar.hidden = true; bar.innerHTML = ''; return; }
    var role = G.roleOf(d);
    var last = null;
    for (var i = d.rows.length - 1; i >= 0; i--) { if (d.rows[i].s !== 'start') { last = d.rows[i]; break; } }
    bar.hidden = false;
    bar.innerHTML = '<div class="score-main"><span class="score-label">내 포인트</span>' +
      '<strong class="score-num">' + num(d.points) + '</strong></div>' +
      '<div class="score-side"><span class="role-chip role-' + role + '">' + G.ROLE_NAME[role] + '</span>' +
      (last ? '<span class="score-last ' + dcls(last.delta) + '">' + arrow(last.delta) + signed(last.delta) + '</span>' : '') + '</div>';
  }

  function renderProgress(d, step) {
    var ep = d.finished ? TOTAL_EP : (step ? step.ep : 0);
    progressStep.textContent = !d.base ? '시작하기' : d.finished ? '게임 오버' : 'EPISODE ' + ep + ' / ' + TOTAL_EP;
    progressValue.style.width = Math.round((d.finished ? 1 : !d.base ? 0.02 : (ep - 1) / TOTAL_EP + 0.02) * 100) + '%';
  }

  // ── 화면: 시작 ─────────────────────────────────────────
  function startHtml() {
    return '<section class="panel">' +
      '<h2 class="screen-title">내 신분 고르기</h2>' +
      '<p class="screen-description">수업 화면의 「캐릭터 선택」에서 나온 <strong>내 신분</strong>을 눌러 주세요. 처음 받는 포인트가 정해집니다.</p>' +
      '<div class="role-pick">' +
      '<button type="button" class="role-pick-btn role-yang" data-act="start" data-role="yang"><b>양반</b><span>처음 7,000 포인트</span></button>' +
      '<button type="button" class="role-pick-btn role-min" data-act="start" data-role="min"><b>평민</b><span>처음 4,000 포인트</span></button>' +
      '</div>' +
      '<ul class="rules">' +
      '<li>화면의 장면 번호(EPISODE)는 수업 슬라이드와 같아요. 슬라이드가 나오면, 내 기기에서 <strong>내 선택</strong>을 눌러 점수를 반영합니다.</li>' +
      '<li>선택을 누르면 먼저 확인 버튼이 나와요. 실수로 눌렀다면 <strong>되돌리기</strong>가 있습니다.</li>' +
      '<li>내 신분이 아닌 장면은 저절로 건너뜁니다.</li>' +
      '<li>이 게임은 <strong>승패가 없는 게임</strong>이에요. 친구의 선택을 비난하거나 놀리지 않기로 약속해요.</li>' +
      '</ul></section>';
  }

  // ── 화면: 장면(선택·상황·최종) ───────────────────────────
  function stepHead(step) {
    return '<p class="event-label">EPISODE ' + step.ep + ' · ' + esc(step.tag) + '</p><h2 class="screen-title">' + esc(step.title) + '</h2>' +
      '<p class="story-cue">' + esc(step.cue) + '</p><p class="tv-note">교실 TV의 장면과 같아요. 내 선택만 눌러 주세요.</p>';
  }

  function stepHtml(step, d) {
    if (step.kind === 'situation') {
      return '<section class="panel">' + stepHead(step) +
        '<p class="setup-hint">선택 없이 점수가 바뀌는 장면이에요. 슬라이드를 확인한 뒤 눌러 주세요.</p>' +
        '<div class="button-row"><button type="button" class="primary-button" data-act="situ">내 점수 반영하기</button></div></section>';
    }
    if (step.kind === 'final') return finalStepHtml(step, d);
    var role = G.roleOf(d);
    var hint = '';
    var html = '<section class="panel">' + stepHead(step) + '<div class="choice-grid choice-col">';
    step.choices.forEach(function (c) {
      var sel = ui.pick === c.id;
      html += '<button type="button" class="choice-button' + (sel ? ' is-selected' : '') + '" data-act="pick" data-c="' + c.id + '" aria-pressed="' + sel + '">' +
        '<span class="choice-letter">' + c.no + '</span>' + esc(c.label) + '</button>';
    });
    html += '</div>';
    if (step.id === 'e16m') {
      hint = d.flags.lent ? '내 기록: 에피소드 12에서 청년에게 돈을 빌려줬어요.' : '내 기록: 에피소드 12에서 돈을 빌려주지 않았어요.';
      html += '<p class="setup-hint">' + hint + '</p>';
    }
    html += '<div class="button-row confirm-row"><button type="button" class="primary-button" data-act="confirm"' + (ui.pick ? '' : ' disabled') + '>' +
      (ui.pick ? '이 선택으로 점수 반영하기' : '선택을 눌러 주세요') + '</button>' + undoBtn(d) + '</div></section>';
    return html;
  }

  function finalStepHtml(step, d) {
    if (d.base === 'min') {
      return '<section class="panel">' + stepHead(step) +
        '<p class="setup-hint">평민은 농민 봉기에서 이긴 쪽이에요. 슬라이드를 확인한 뒤 눌러 주세요.</p>' +
        '<div class="button-row"><button type="button" class="primary-button" data-act="final">내 점수 반영하기 (+' + num(G.FINAL_MIN_BONUS) + ')</button></div></section>';
    }
    var evidence = {
      office: d.flags.office ? '내 기록: 에피소드 3에서 돈을 드렸어요.' : '내 기록: 에피소드 3에서 돈을 드리지 않았어요.',
      bribe: d.flags.bribe ? '내 기록: 에피소드 7에서 뇌물을 드렸어요.' : '내 기록: 에피소드 7에서 뇌물을 드리지 않았어요.',
      tax: '내 기록: 에피소드 4·8에서 평민에게 세금을 거뒀어요.',
      sand: d.flags.sand ? '내 기록: 에피소드 5에서 쌀에 모래를 섞었어요.' : '내 기록: 에피소드 5에서 모래를 섞지 않았어요.',
      think: '스스로 생각해 보세요.'
    };
    var html = '<section class="panel">' + stepHead(step) +
      '<p class="setup-hint">양반 신분인 나는 아래 내용에 해당하면 포인트가 깎여요(최종 벌). 내 기록을 보고 <strong>스스로</strong> 해당하는 것에 체크하세요.</p><div class="final-list">';
    G.FINAL_PENALTIES.forEach(function (p) {
      html += '<label class="check-row"><input type="checkbox" data-pen="' + p.id + '"><span>' + esc(p.label) + ' <b class="is-down">' + num(p.delta) + '</b><br><small>' + esc(evidence[p.id]) + '</small></span></label>';
    });
    return html + '</div><div class="button-row"><button type="button" class="primary-button" data-act="final">내 점수 반영하기</button>' + undoBtn(d) + '</div></section>';
  }

  function undoBtn(d) {
    return d.rows.length > 1 ? '<button type="button" class="secondary-button" data-act="undo">← 방금 반영한 것 되돌리기</button>' : '';
  }

  // ── 화면: 결과 ─────────────────────────────────────────
  function resultHtml(d) {
    var r = d.rows[d.rows.length - 1];
    var more = G.nextStep(d) ? '다음 장면 →' : '마무리 보기 →';
    return '<section class="panel result-panel">' +
      '<p class="event-label">EPISODE ' + r.ep + ' · ' + esc(r.tag) + '</p>' +
      '<h2 class="screen-title">' + esc(r.label) + '</h2>' +
      (r.choiceLabel && r.choiceLabel !== '선택 없음' ? '<p class="picked">내 선택: <b>' + esc(r.choiceLabel) + '</b></p>' : '') +
      '<p class="story-cue">' + esc(r.result) + '</p>' +
      '<div class="delta-big ' + dcls(r.delta) + '">' + arrow(r.delta) + signed(r.delta) + '<small> 포인트</small></div>' +
      '<p class="after-total">남은 포인트 <b>' + num(r.total) + '</b></p>' +
      (sideNote(d, r) || '') +
      '<div class="button-row"><button type="button" class="primary-button" data-act="next">' + more + '</button>' +
      '<button type="button" class="secondary-button" data-act="undo">← 되돌리기</button></div></section>';
  }

  function sideNote(d, r) {
    var step = G.stepById(r.s);
    if (!step) return '';
    if (step.after === 'endWar') return '<p class="paper-note">홍경래의 난이 끝났어요. 이제 원래 신분 <b>' + G.ROLE_NAME[d.base] + '</b>(으)로 돌아갑니다.</p>';
    if (r.s === 'e3y' && d.flags.demoted && d.base === 'min') return '<p class="paper-note">신분이 <b>평민</b>으로 바뀌었어요. 다음 장면에서 500포인트로 신분을 되찾을 수 있어요.</p>';
    if (r.s === 'e3r' && d.base === 'yang') return '<p class="paper-note">신분이 다시 <b>양반</b>이 되었어요.</p>';
    if (step.id === 'e14m' || step.id === 'e14y') return '<p class="paper-note">지금부터 신분은 <b>' + G.ROLE_NAME[d.side] + '</b>이에요(난이 끝나면 원래 신분으로 돌아가요).</p>';
    return '';
  }

  // ── 화면: 게임 오버 ─────────────────────────────────────
  function finishHtml(d) {
    var rows = d.rows.filter(function (r) { return r.ep !== null; });
    var best = null, worst = null;
    rows.forEach(function (r) {
      if (!best || r.delta > best.delta) best = r;
      if (!worst || r.delta < worst.delta) worst = r;
    });
    var html = '<section class="panel finish-panel"><p class="event-label">게임 오버</p>' +
      '<h2 class="screen-title">내 인생 게임이 끝났어요</h2>' +
      '<div class="delta-big final-total">' + num(d.points) + '<small> 포인트</small></div>' +
      '<p class="screen-description">이 게임은 승패가 없어요. 점수가 높고 낮은 것보다, <strong>내 선택이 그 시대 사람들에게 어떤 일이 되었는지</strong> 돌아보는 게 중요합니다.</p>';
    if (best && best.delta > 0) html += '<p class="recap">가장 크게 오른 장면: <b>EPISODE ' + best.ep + ' ' + esc(best.label) + '</b> <span class="is-up">' + signed(best.delta) + '</span></p>';
    if (worst && worst.delta < 0) html += '<p class="recap">가장 크게 내려간 장면: <b>EPISODE ' + worst.ep + ' ' + esc(worst.label) + '</b> <span class="is-down">' + signed(worst.delta) + '</span></p>';
    html += '<div class="button-row"><button type="button" class="secondary-button" data-act="undo">← 마지막 반영 되돌리기</button></div></section>';
    return html + notesHtml();
  }

  function notesHtml() {
    var html = '<section class="panel"><h2 class="screen-title">한줄 정리하기</h2>' +
      '<p class="screen-description">게임에서 만난 낱말을 내 말로 한 줄씩 정리해 보세요. 이 기기 안에만 저장돼요.</p>';
    TERMS.forEach(function (t) {
      html += '<label class="form-label" for="term-' + t.id + '">' + t.name + '</label>' +
        '<input id="term-' + t.id + '" class="quest-field" type="text" data-term="' + t.id + '" value="' + esc(state.terms[t.id] || '') + '" autocomplete="off">' +
        '<details class="term-hint"><summary>수업에서 본 뜻 확인</summary><p>' + esc(t.hint) + '</p></details>';
    });
    html += '<label class="form-label" for="feel">느낀점</label>' +
      '<textarea id="feel" class="quest-field" rows="4" data-feel="1">' + esc(state.feel || '') + '</textarea></section>';
    return html;
  }

  // ── 점수표(종이 점수 계산표와 같은 열) ───────────────────
  function ledgerHtml(d) {
    var byEp = {};
    d.rows.forEach(function (r) { if (r.ep !== null) (byEp[r.ep] = byEp[r.ep] || []).push(r); });
    var manual = d.rows.filter(function (r) { return r.s === 'manual'; });
    var html = '<section class="panel ledger"><details' + (d.finished ? ' open' : '') + '><summary class="ledger-sum">내 점수표 보기 <small>(에피소드별 기록)</small></summary>' +
      '<p class="ledger-start">처음 지급된 포인트: <b>' + (d.base ? num(d.rows[0].delta) : '') + '</b></p>' +
      '<div class="sheet-wrap"><table class="sheet"><thead><tr><th>EPISODE</th><th>현재 신분</th><th>나의 선택</th><th>획득</th><th>손실</th><th>남은 포인트</th></tr></thead><tbody>';
    for (var ep = 1; ep <= TOTAL_EP; ep++) {
      var rs = byEp[ep] || [];
      var gain = 0, loss = 0, picks = [];
      rs.forEach(function (r) {
        if (r.delta > 0) gain += r.delta; else loss += r.delta;
        var step = G.stepById(r.s), c = step && step.choices ? step.choices.filter(function (x) { return x.id === r.c; })[0] : null;
        if (c) picks.push(c.no);
      });
      var grey = NO_CHOICE_EP[ep] ? ' class="grey"' : '';
      html += '<tr><th scope="row">' + ep + '</th><td>' + (rs.length ? G.ROLE_NAME[rs[0].role] : '') + '</td><td' + grey + '>' + picks.join(', ') + '</td>' +
        '<td class="is-up">' + (gain ? '+' + num(gain) : '') + '</td><td class="is-down">' + (loss ? num(loss) : '') + '</td>' +
        '<td class="rest">' + (rs.length ? num(rs[rs.length - 1].total) : '') + '</td></tr>';
    }
    html += '</tbody></table></div>';
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
    if (!d.base) html = startHtml();
    else {
      if (ui.showResult && d.rows.length && d.rows[d.rows.length - 1].s !== 'start') html = resultHtml(d);
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
      state.log = [{ s: 'start', c: t.getAttribute('data-role') }]; ui.showResult = false; save(); render();
    } else if (act === 'pick') {
      ui.pick = t.getAttribute('data-c'); render();
    } else if (act === 'confirm') {
      if (step && ui.pick) push({ s: step.id, c: ui.pick });
    } else if (act === 'situ') {
      if (step) push({ s: step.id, c: 'ok' });
    } else if (act === 'final') {
      if (!step) return;
      var checks = [].slice.call(app.querySelectorAll('[data-pen]')).filter(function (el) { return el.checked; }).map(function (el) { return el.getAttribute('data-pen'); });
      push({ s: step.id, c: 'ok', checks: checks });
    } else if (act === 'next') {
      ui.showResult = false; render(); window.scrollTo(0, 0);
    } else if (act === 'undo') {
      if (state.log.length > 1) { state.log.pop(); ui.pick = null; ui.showResult = false; save(); render(); window.scrollTo(0, 0); }
    } else if (act === 'manual') {
      var v = String(document.getElementById('m-delta').value).replace(/[\s,]/g, '').replace('−', '-');
      var err = document.getElementById('m-err');
      if (!/^[+-]?\d{1,6}$/.test(v)) { err.hidden = false; return; }
      state.log.push({ s: 'manual', delta: parseInt(v, 10), memo: document.getElementById('m-memo').value.trim() });
      save(); render();
    } else if (act === 'reset') {
      if (window.confirm('점수와 기록을 모두 지우고 처음부터 다시 할까요?')) {
        state = defaultState(); ui.pick = null; ui.showResult = false; save(); render(); window.scrollTo(0, 0);
      }
    }
  });

  // 입력 칸은 다시 그리지 않고 저장만 한다(타이핑 중 포커스 유지)
  app.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.hasAttribute('data-term')) { state.terms[el.getAttribute('data-term')] = el.value; save(); }
    else if (el.hasAttribute('data-feel')) { state.feel = el.value; save(); }
  });

  render();
})();
