// 교사용 보기 — 역할 카드형이 아닌 활동(추리 게임·역사 체험·점수판)의 교사용 정보를 만든다.
// 각 활동의 데이터 파일(quest.js, game.js)을 그대로 읽어 표로 펼친다. 내용을 따로 복사해 두지 않는다.
// 사용: window.TeacherBoards[slug] = { file, global, title, lead, render(data) → html }
(function () {
  function esc(text) {
    return String(text).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function section(title, inner, open) {
    return '<details class="stage"' + (open ? ' open' : '') + '><summary>' + title + '</summary><div class="stage-body">' + inner + '</div></details>';
  }
  function box(title, inner) { return '<div class="teacher-box"><h4>' + title + '</h4>' + inner + '</div>'; }
  function table(head, rows, cls) {
    return '<div class="t-wrap"><table class="t-table' + (cls ? ' ' + cls : '') + '"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function kv(label, value) { return '<p class="t-kv"><b>' + esc(label) + '</b> ' + value + '</p>'; }
  function num(n) { return (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('ko-KR'); }
  function signed(n) { return n > 0 ? '+' + num(n) : n < 0 ? num(n) : '±0'; }

  // ── 사라진 그림을 찾아라 ─────────────────────────────────
  function partAnswer(p) {
    if (p.kind === 'text') return esc(p.accept.join(' / ')) + (p.reject ? ' <small class="t-note">(정답 아님: ' + esc(p.reject.join(', ')) + ')</small>' : '');
    if (p.kind === 'distinct') return '서로 다른 ' + p.count + '개: ' + esc(p.accept.join(', ')) + (p.strip ? ' <small class="t-note">(“' + esc(p.strip.join('·')) + '” 글자는 무시)</small>' : '');
    if (p.kind === 'pick') {
      var real = p.options.filter(function (o) { return o.real; }).map(function (o) { return esc(o.label); });
      return (p.single ? '하나만 고름: ' : '모두 고름(최소 ' + (p.min || real.length) + '개): ') + real.join(' / ');
    }
    if (p.kind === 'acrostic') return '줄마다 “' + esc(p.chars.join('')) + '”로 시작, ' + (p.minLen || 1) + '글자 이상';
    if (p.kind === 'confirm') return '직접 해 본 뒤 체크(학생의 약속)';
    if (p.kind === 'free') return '자유 서술 ' + (p.minLen || 1) + '글자 이상이면 통과';
    return '';
  }

  function renderMissing(Q) {
    var html = section('교사 확인(숫자·최종 정답)',
      kv('교사 확인 숫자', '<code class="t-code">' + esc(Q.classConfig.teacherCode) + '</code> — 막힌 모둠이 “선생님 확인으로 넘어가기”에 입력') +
      kv('도난당한 그림을 그린 인물', esc(Q.person.display) + ' <small class="t-note">(인정: ' + esc(Q.person.accept.join(', ')) + ')</small>') +
      kv('추리 조각(미션 번호순)', Q.fragments.map(function (f, i) { return '<span class="t-chip">' + (i + 1) + '·' + esc(f) + '</span>'; }).join(' ')) +
      kv('조각을 맞추면', '“' + esc(Q.answerPhrase) + '”'), true);
    html += section('미션 12개 정답표',
      table(['번호', '미션', '문제(칸)', '정답'], Q.missions.map(function (m) {
        return [m.no, '<b>' + esc(m.title) + '</b><br><small class="t-note">' + esc(m.tag) + '</small>',
          m.parts.map(function (p) { return esc(p.label); }).join('<br>'),
          m.parts.map(partAnswer).join('<br>')];
      })), true);
    html += section('미션별 힌트(학생 화면의 “힌트” 버튼)',
      '<ul>' + Q.missions.map(function (m) { return '<li><b>' + m.no + '. ' + esc(m.title) + '</b> — ' + esc(m.hint) + '</li>'; }).join('') + '</ul>');
    if (Q.reveal) {
      html += section('마지막 화면에 나오는 설명', '<p><b>' + esc(Q.reveal.title) + '</b></p><p>' + esc(Q.reveal.body) + '</p><p class="t-note">' + esc(Q.reveal.note) + '</p>');
    }
    html += box('진행 메모', '<ul><li>모둠이 12개를 풀어 추리 조각을 모으고, 조각을 맞춰 인물을 알아냅니다. 순서는 모둠이 정합니다.</li>' +
      '<li>진행은 학생 기기에서 저장되며(이 기기 안에만), 새로고침해도 이어집니다.</li>' +
      '<li>정답은 공백·쉼표·지정된 글자를 무시하고 비교합니다. 영문은 대소문자를 구분하지 않습니다.</li></ul>');
    return html;
  }

  // ── 갑신정변 역사 체험 ──────────────────────────────────
  function selfCheckAnswer(sc) {
    if (sc.type === 'count') return '틀린 곳 <b>' + esc(sc.answer) + esc(sc.unit || '') + '</b>';
    if (sc.type === 'ladder') return '출발 글자 <b>' + esc(sc.answer) + '</b>';
    if (sc.type === 'route') {
      var r = (sc.routes || []).filter(function (x) { return x.id === sc.answer; })[0];
      return '가장 짧은 길 <b>' + esc(r ? r.label : sc.answer) + '</b> (합계 ' + esc(sc.total) + ')';
    }
    if (sc.type === 'choose') {
      var real = sc.options.filter(function (o) { return o.real; }).map(function (o) { return esc(o.label); });
      return '실제 개혁안 ' + esc(sc.need) + '개: ' + real.join(' / ');
    }
    return esc(JSON.stringify(sc.answer === undefined ? '' : sc.answer));
  }

  function renderGapsinQuest(Q) {
    var cfg = Q.classConfig;
    var roleOf = function (a) {
      var team = Q.teams.filter(function (t) { return t.id === a.team; })[0] || {};
      var key = a.role === 'fifth' ? team.fifthRole : a.role;
      return { team: team, role: Q.roles[key] || {}, key: key };
    };
    var html = section('교사 확인(숫자·학급 설정)',
      kv('교사 확인 숫자', '<code class="t-code">' + esc(cfg.teacherCode) + '</code> — 막힌 모둠을 넘겨 줄 때 입력') +
      kv('우리 반에서 가장 많은 성(김옥균 카드)', esc(cfg.surnameMost)) +
      kv('11·12번의 성(박영효 카드)', esc(cfg.surname10)), true);
    html += section('번호별 모둠·역할 배정(학생 번호 → 받는 카드)',
      table(['번호', '모둠(암호 정답)', '역할 카드', '인물 이름'], cfg.assignments.map(function (a, i) {
        var r = roleOf(a);
        var surname = r.role.surnameKey ? cfg[r.role.surnameKey] : '';
        return [(i + 1) + '번', esc(r.team.answer || a.team), esc(r.role.title || ''), esc((surname || '') + (r.role.given || ''))];
      })), true);
    html += section('모둠별 암호 문제와 정답',
      table(['정답(암호)', '인원', '문제'], Q.teams.map(function (t) { return ['<b>' + esc(t.answer) + '</b>', t.size + '명', esc(t.question)]; })), true);
    html += section('역할 카드 4종(단서)',
      Object.keys(Q.roles).map(function (k) {
        var r = Q.roles[k];
        var name = (r.surnameKey ? cfg[r.surnameKey] : '') + r.given;
        return '<p style="margin:10px 0 3px"><b>' + esc(r.title) + '</b> — ' + esc(name) + '</p><ol>' + r.clues.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ol>';
      }).join(''));
    html += section('팀 미션 정답(자가 점검)',
      table(['미션', '정답', '교사 메모'], Q.missions.map(function (m) {
        return ['<b>' + esc(m.title) + '</b>', selfCheckAnswer(m.selfCheck), esc(m.selfCheck.teacherNote || m.selfCheck.hint || '')];
      })));
    if (Q.debrief && Q.debrief.history) {
      html += section('마무리 화면의 역사 설명(교과서 대조 필요)',
        '<p><b>' + esc(Q.debrief.history.title) + '</b></p><p class="t-note">' + esc(Q.debrief.history.note) + '</p><ul>' +
        Q.debrief.history.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>');
    }
    html += box('진행 메모', '<ul><li>이동·팀 결성·일본 NPC 거절은 오프라인(교사·학생 활동)으로 진행하고, 개인 카드·암호·자가 점검 미션·마무리만 기기로 합니다.</li>' +
      '<li>번호를 바꾸면 모둠이 바뀝니다. 올해 배정은 <code>gapsin-quest/quest.js</code>의 <code>classConfig.assignments</code>입니다.</li></ul>');
    return html;
  }

  // ── 인생 게임 점수판(공통) ──────────────────────────────
  function whoName(G, who) {
    if (who === 'all') return '모두';
    if (who === 'war') return '관군·봉기군';
    return G.ROLE_NAME[who] || who;
  }
  // 신분별 점수 {a:10,b:10} → 같으면 한 번만, 다르면 신분 이름과 함께
  function fmtDelta(G, spec) {
    if (typeof spec === 'number') return '<b class="' + (spec < 0 ? 't-down' : spec > 0 ? 't-up' : '') + '">' + signed(spec) + '</b>';
    var keys = Object.keys(spec || {});
    return keys.map(function (k) { return esc(G.ROLE_NAME[k] || k) + ' <b class="' + (spec[k] < 0 ? 't-down' : spec[k] > 0 ? 't-up' : '') + '">' + signed(spec[k]) + '</b>'; }).join(' · ');
  }
  function power(o) {
    var s = '';
    if (o.skull) s += ' <span class="t-power">💀' + o.skull + '칸</span>';
    if (o.heart) s += ' <span class="t-power">♥' + o.heart + '칸</span>';
    return s;
  }
  function extras(G, c) {
    var s = '';
    if (c.bonus) Object.keys(c.bonus).forEach(function (k) { s += ' <span class="t-power">(원래 ' + esc(G.ABILITY_NAME ? G.ABILITY_NAME[k] : k) + ' 능력자 ' + signed(c.bonus[k]) + ')</span>'; });
    if (c.role) s += ' <span class="t-power">→ 신분 ' + esc(G.ROLE_NAME[c.role]) + '</span>';
    if (c.side) s += ' <span class="t-power">→ ' + esc(G.ROLE_NAME[c.side]) + ' 편</span>';
    if (c.base) s += ' <span class="t-power">→ 신분 ' + esc(G.ROLE_NAME[c.base]) + '</span>';
    return s;
  }

  function scoreRows(G) {
    return G.STEPS.map(function (s) {
      var body;
      if (s.kind === 'situation') {
        body = '<span class="t-tag">선택 없음</span> ' + fmtDelta(G, s.delta) + power(s) +
          (s.setRole ? ' <span class="t-power">→ ' + Object.keys(s.setRole).map(function (k) { return esc(G.ROLE_NAME[k]) + '→' + esc(G.ROLE_NAME[s.setRole[k]]); }).join(', ') + '</span>' : '') +
          (s.after === 'endWar' ? ' <span class="t-power">→ 원래 신분(양반/평민)으로 복귀</span>' : '');
      } else if (s.kind === 'final') {
        body = '평민 ' + signed(G.FINAL_MIN_BONUS) + ' / 양반은 최종 벌(아래 표)';
      } else {
        body = '<ul class="t-choices">' + s.choices.map(function (c) {
          return '<li><span class="t-no">' + esc(c.no) + '</span> ' + esc(c.label) + ' → ' + fmtDelta(G, c.delta) + power(c) + extras(G, c) + '</li>';
        }).join('') + '</ul>';
      }
      return [s.ep, '<b>' + esc(s.tag) + '</b><br>' + esc(s.title), esc(whoName(G, s.who)), body];
    });
  }

  var HOW = '<ol><li>학생이 점수판을 엽니다(허브 → 카드). 처음에 신분/능력을 고르면 시작 포인트가 정해집니다.</li>' +
    '<li>교사는 PPT를 교실 TV로 진행합니다. 장면 번호(EPISODE)는 PPT와 점수판이 같습니다.</li>' +
    '<li>학생은 자기 선택을 누르고, <b>확인 버튼</b>을 눌러야 점수가 반영됩니다. 실수하면 “되돌리기”를 쓰게 합니다.</li>' +
    '<li>내 신분이 아닌 장면은 저절로 건너뜁니다. 헷갈리면 학생이 “내 점수표 보기”로 지금까지의 기록을 확인합니다.</li>' +
    '<li>교사가 점수를 따로 알려 줄 때는 점수표 아래 “선생님이 점수를 따로 알려 줬을 때”에 숫자를 넣게 합니다.</li>' +
    '<li>점수는 학생 기기 안에만 저장됩니다(이름·학번 입력 없음). 새로고침해도 이어집니다.</li></ol>';

  function renderSedo(G) {
    var html = section('수업 진행(교사)', HOW, true);
    html += section('시작 포인트·신분',
      '<ul><li><b>양반</b> 시작 ' + num(G.START_POINTS.yang) + ' · <b>평민</b> 시작 ' + num(G.START_POINTS.min) + '(PPT의 「캐릭터 선택」 결과를 학생이 누름)</li>' +
      '<li>에피소드 3에서 양반이 돈을 드리지 않으면 평민으로 강등되고, 500포인트로 신분을 되찾을 수 있습니다(패자부활).</li>' +
      '<li>에피소드 14~20은 홍경래의 난입니다. 양반은 관군, 평민은 관군 또는 봉기군이 되고, 에피소드 20에서 원래 신분으로 돌아옵니다.</li></ul>', true);
    html += section('에피소드별 점수 전체표', table(['EP', '장면', '대상', '선택 → 점수'], scoreRows(G), 'sedo'), true);
    html += section('에피소드 21 최종(양반 벌 · 평민 보상)',
      '<ul><li><b>평민</b> ' + signed(G.FINAL_MIN_BONUS) + '</li>' +
      G.FINAL_PENALTIES.map(function (p) { return '<li><b>양반</b> ' + esc(p.label) + ' → <b class="t-down">' + signed(p.delta) + '</b></li>'; }).join('') + '</ul>' +
      '<p class="t-note">양반 학생은 점수판에서 자기 기록을 보고 해당하는 항목을 스스로 체크합니다(자동 체크 아님).</p>');
    html += box('확인해 둘 점', '<ul><li>양반이 강등되어 평민이 된 학생도 같은 에피소드의 평민 장면(가뭄)을 합니다(PPT 슬라이드 순서대로).</li>' +
      '<li>에피소드 5 “섞지 않는다”는 PPT 그대로 −200입니다(정직한 쪽이 가장 많이 깎임). 수업에서 이야기 거리가 될 수 있습니다.</li>' +
      '<li>이 게임은 승패가 없는 게임입니다(PPT 8장).</li></ul>');
    return html;
  }

  function renderDonghak(G) {
    var html = section('수업 진행(교사)', HOW + '<p class="t-note">에피소드 2(역관 시험)는 학생이 정답을 적어 본 뒤, 교사가 정답을 말해 주면 “정답/오답”을 누릅니다.</p>', true);
    html += section('시작·신분 흐름·국력',
      '<ul><li>중국어/일본어 능력자 시작 <b>' + num(G.START_POINTS) + '</b> 포인트. 처음 능력은 끝까지 남아 일부 선택에 추가 ±50이 자동으로 붙습니다.</li>' +
      '<li>신분: 능력자 → 영선사/수신사 → 명성황후파/흥선대원군파 → 온건/급진 개화파 → 농민/지방 관리 → 동학농민군/관군 (한 방향).</li>' +
      '<li>에피소드 7(C/D)과 16(E/F)의 제비뽑기는 학생이 뽑은 카드를 누릅니다. <b>C = 흥선대원군파(−100), D = 명성황후파(+100)</b>, E = 온건, F = 급진.</li>' +
      '<li>국력: 해골(💀)·하트(♥) 각 5칸 막대. 개인 보상과 무관합니다. 마무리 화면에는 비교 기호(💀 &gt; ♥ / 💀 &lt; ♥ / 💀 FULL)만 보여 주고 해석 문구는 넣지 않았습니다.</li></ul>', true);
    html += section('에피소드별 점수 전체표', table(['EP', '장면', '대상', '선택 → 점수'], scoreRows(G), 'donghak'), true);
    html += section('개인 보상(트로피) 기준',
      '<ul>' + G.TROPHIES.map(function (t) { return '<li><b>' + esc(t.name) + '</b> ' + num(t.min) + ' 이상 — ' + esc(t.text) + '</li>'; }).join('') + '</ul>' +
      '<p class="t-note">학생이 마지막에 “내 개인 보상 보기”를 눌러야 보입니다(PPT 157장에서 교사가 공개한 뒤 누르게 하세요). 1,000 미만일 때의 문구는 PPT에 없어 제가 지어 넣은 것입니다.</p>');
    html += box('확인해 둘 점', '<ul><li>에피소드 38 동학농민군이 “협조하지 않는다”를 고르면 PPT 결과대로 −3,000입니다(슬라이드 문구는 “모든 포인트를 잃을 수도”).</li>' +
      '<li>에피소드 22에서 급진개화파는 선택을 누른 뒤 농민 신분이 됩니다.</li>' +
      '<li>이 게임은 승패가 없는 게임입니다. 개인 보상 공개 방식은 교사가 정합니다.</li></ul>');
    return html;
  }

  window.TeacherBoards = {
    'missing-painting': { file: 'quest.js', global: 'MissingPainting', lead: '교사 확인 숫자와 미션 12개의 정답·힌트를 한눈에 봅니다. 아래 단계를 눌러 펼치세요.', render: renderMissing, title: function () { return '사라진 그림을 찾아라 — 교사용'; } },
    'gapsin-quest': { file: 'quest.js', global: 'GapsinQuest', lead: '교사 확인 숫자, 번호별 모둠·역할 배정, 암호 정답과 미션 정답을 한눈에 봅니다.', render: renderGapsinQuest, title: function () { return '갑신정변 역사 체험 — 교사용'; } },
    'sedo-scoreboard': { file: 'game.js', global: 'SedoBoard', lead: '세도정치 인생 게임(PPT 74장)의 에피소드별 점수표입니다. 학생 점수판이 계산하는 값과 같은 데이터를 그대로 읽습니다.', render: renderSedo, title: function () { return '세도정치 인생 게임 점수판 — 교사용'; } },
    'gapsin-donghak-scoreboard': { file: 'game.js', global: 'GapsinBoard', lead: '갑신정변과 동학농민운동 인생 게임(PPT 159장)의 에피소드별 점수표입니다. 학생 점수판이 계산하는 값과 같은 데이터를 그대로 읽습니다.', render: renderDonghak, title: function () { return '갑신정변·동학농민운동 인생 게임 점수판 — 교사용'; } }
  };
}());
