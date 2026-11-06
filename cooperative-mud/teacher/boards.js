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

  var HOW = '<ol><li>학생이 점수판을 엽니다(허브 → 카드). 처음에는 <b>A / B</b>만 보이고, 누르면 신분이 <b>학생마다 무작위</b>로 정해집니다(친구가 알려 줘도 소용없음). 공개 화면에서 내 신분과 시작 포인트를 확인하고 “게임 시작”을 누릅니다.</li>' +
    '<li>교사는 PPT를 교실 TV로 진행합니다. 장면 번호(EPISODE)는 PPT와 점수판이 같습니다.</li>' +
    '<li>학생은 자기 선택을 누르고, <b>확인 버튼</b>을 눌러야 점수가 반영됩니다. 실수하면 “되돌리기”를 쓰게 합니다.</li>' +
    '<li>내 신분이 아닌 장면은 저절로 건너뜁니다. 헷갈리면 학생이 “내 점수표 보기”로 지금까지의 기록을 확인합니다.</li>' +
    '<li>교사가 점수를 따로 알려 줄 때는 점수표 아래 “선생님이 점수를 따로 알려 줬을 때”에 숫자를 넣게 합니다.</li>' +
    '<li>점수는 학생 기기 안에만 저장됩니다(이름·학번 입력 없음). 새로고침해도 이어집니다.</li></ol>';

  function renderSedo(G) {
    var html = section('수업 진행(교사)', HOW, true);
    html += section('시작 포인트·신분',
      '<ul><li><b>양반</b> 시작 ' + num(G.START_POINTS.yang) + ' · <b>평민</b> 시작 ' + num(G.START_POINTS.min) + '(A/B를 누르면 무작위로 정해짐)</li>' +
      '<li>PPT 「캐릭터 선택」 슬라이드의 배치(A = 평민, B = 양반)로 고정하려면 점수판 주소 끝에 <code>?ab=ppt</code>를 붙입니다.</li>' +
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
      '<ul><li>A/B를 누르면 중국어/일본어 능력자가 무작위로 정해집니다. PPT 슬라이드의 배치(A = 중국어, B = 일본어)로 고정하려면 점수판 주소 끝에 <code>?ab=ppt</code>를 붙입니다.</li><li>중국어/일본어 능력자 시작 <b>' + num(G.START_POINTS) + '</b> 포인트. 처음 능력은 끝까지 남아 일부 선택에 추가 ±50이 자동으로 붙습니다.</li>' +
      '<li>신분: 능력자 → 영선사/수신사 → 명성황후파/흥선대원군파 → 온건/급진 개화파 → 농민/지방 관리 → 동학농민군/관군 (한 방향).</li>' +
      '<li>에피소드 7(C/D)과 16(E/F)의 제비뽑기는 학생이 카드를 누르면 <b>결과가 무작위</b>로 정해집니다(누른 카드는 점수표에 남음). PPT 대응으로 고정하는 <code>?ab=ppt</code>에서는 <b>C = 흥선대원군파(−100), D = 명성황후파(+100)</b>, E = 온건, F = 급진입니다.</li>' +
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


  // ── 인생 게임 외전 「암살」 자금판 ───────────────────────
  function asBody(G, s) {
    if (s.kind === 'situation') return '<span class="t-tag">선택 없음</span> <b class="' + (s.delta < 0 ? 't-down' : 't-up') + '">' + signed(s.delta) + '원</b>' + (s.flag ? ' <span class="t-power">🎒 ' + esc(G.WEAPONS.filter(function (w) { return w.id === s.flag; })[0].name) + ' 획득</span>' : '');
    if (s.kind === 'move') return '<span class="t-tag">지역 이동</span> ' + esc(s.from) + ' → ' + esc(s.to) + ' <b class="t-down">' + signed(-s.cost) + '원</b>';
    if (s.kind === 'choice') {
      return '<ul class="t-choices">' + s.choices.map(function (c) {
        return '<li><span class="t-no">' + esc(c.no) + '</span> ' + esc(c.label) + ' → <b class="' + (c.delta < 0 ? 't-down' : c.delta > 0 ? 't-up' : '') + '">' + signed(c.delta) + '원</b>' +
          (c.flag ? ' <span class="t-power">🎒 ' + esc(G.WEAPONS.filter(function (w) { return w.id === c.flag; })[0].name) + ' 획득</span>' : '') +
          (c.end ? ' <span class="t-power">→ GAME OVER(게임 참여 불가)</span>' : '') + '</li>';
      }).join('') + '</ul>';
    }
    if (s.kind === 'quiz') {
      var q = s.quiz;
      if (q.type === 'numbers') return '정답 번호 <b>' + esc(q.answer.join(', ')) + '</b> · 맞힌 개수별 ' + Object.keys(q.tiers).sort(function (a, b) { return b - a; }).map(function (k) { return k + '개 ' + signed(q.tiers[k]); }).join(' / ') + '<br><span class="t-note">쓸 수 있는 번호: 권총만 ' + q.capBase + '개, 소총 ' + q.capRifle + '개</span>';
      if (q.type === 'texts') return q.items.map(function (it) { return esc(it.accept[0]); }).join(' · ') + ' · 맞힌 개수별 ' + Object.keys(q.tiers).sort(function (a, b) { return b - a; }).map(function (k) { return k + '개 ' + signed(q.tiers[k]); }).join(' / ');
      if (q.type === 'text') return '정답 <b>' + esc(q.answerText) + '</b> → ' + signed(q.correctDelta) + '원 / 오답 ' + signed(q.wrongDelta) + '원' + (q.flag ? ' <span class="t-power">🎒 ' + esc(G.WEAPONS.filter(function (w) { return w.id === q.flag; })[0].name) + '은 정답·오답 모두 획득</span>' : '');
      if (q.type === 'boxes') return '정답 <b>' + esc(q.answer) + '번 상자</b> → ' + signed(q.correctDelta) + '원 / 오답 ' + signed(q.wrongDelta) + '원 <span class="t-note">(망원경이 있으면 2개까지 고를 수 있음)</span>';
    }
    return '명언 쓰기 + 짝꿍 평가: ' + G.EVALS.map(function (e) { return esc(e.result); }).join(' / ') + ' <span class="t-note">(자금 변화 없음)</span>';
  }

  function renderAssassination(G) {
    var html = section('수업 진행(교사)',
      '<ol><li>학생이 자금판을 열고 “게임 시작”을 누릅니다. <b>신분 선택이 없고 모두 같은 신분</b>이며 자금은 0원에서 시작합니다.</li>' +
      '<li>교사는 PPT를 교실 TV로 진행합니다. 장면 번호(EPISODE)는 PPT와 자금판이 같습니다.</li>' +
      '<li>객관식은 번호를 누르고 <b>확인 버튼</b>을 눌러야 반영됩니다. 주관식은 TV 문제의 답을 입력하면 앱이 채점합니다(에피소드 11만 교사가 정답을 알려 준 뒤 학생이 정답/오답을 누름).</li>' +
      '<li>지역 이동은 자금을 내고 “이동하기”를 누르면 이동경로가 자동으로 기록됩니다. 무기(권총·소총·콧수염·망원경)도 자동으로 표시됩니다.</li>' +
      '<li>실수하면 “되돌리기”, 교사가 자금을 따로 알려 줄 때는 점수표 아래 “선생님이 자금을 따로 알려 줬을 때”에 입력합니다.</li>' +
      '<li>자금은 이 기기 안에만 저장됩니다(이름·학번 입력 없음). 자금이 모자라면 넉넉한 친구에게 빌리는 게임이에요(PPT 3장).</li></ol>', true);
    html += section('정답 한눈에(교사 확인용)',
      table(['EP', '무엇', '정답'], [
        [4, '진짜 이회영 선생님 사진', '4번 사진(이회영) — 1·2·3번은 홍범도·김좌진·안중근'],
        [10, '이민수 선생(보통학교 교사)', '3번'],
        [11, '객실 암호 9자리', '슬라이드의 정답 그림 → 교사가 알려 준 뒤 학생이 정답/오답을 누름'],
        [15, '일본군 위치', '0, 1, 2, 4, 7, 9'],
        [16, '군산은 어디', '지도의 1번(군산) — 2 목포, 3 원산, 4 부산'],
        [18, '신채호 퀴즈', '이순신 · 을지문덕 · 발해'],
        [19, '쌀 0.3배', '9가마'],
        [20, '원리네 가족', '9명'],
        [22, '전신기 암호 45231', '상해'],
        [30, '폭탄이 든 상자', '2번 상자'],
        [31, '조선 청년 구하기', '12시 방향(2번) — 3시 오발, 4시 청년 공격']
      ]), true);
    html += section('에피소드별 자금 전체표',
      table(['EP', '장면', '선택·답 → 자금'], G.STEPS.map(function (s) { return [s.ep, '<b>' + esc(s.tag) + '</b><br>' + esc(s.title), asBody(G, s)]; }), 'assassination'), true);
    html += section('이동경로와 이동비',
      '<p>' + G.STEPS.filter(function (s) { return s.kind === 'move'; }).map(function (s) { return esc(s.from) + ' → ' + esc(s.to) + ' (에피소드 ' + s.ep + ', −' + s.cost + '원)'; }).join('<br>') + '</p>' +
      '<p class="t-note">종이 점수표는 이동경로를 지도에 화살표로 그립니다. 자금판은 도시 순서만 자동으로 보여 줍니다(지도에 그리는 것은 종이 활동).</p>');
    html += section('마무리 화면에 나오는 독립운동가 명언 정답',
      '<ul>' + G.QUOTES.map(function (q) { return '<li><b>' + esc(q.who) + '</b> “' + esc(q.text) + '” → ' + esc(q.answer) + '</li>'; }).join('') + '</ul>');
    html += box('확인해 둘 점', '<ul><li>에피소드 15 PPT의 최고 구간은 “5개 정답 +50”인데 정답 번호가 6개입니다. <b>5개 이상 +50</b>으로 처리하고, 틀린 번호는 따로 깎지 않습니다.</li>' +
      '<li>에피소드 1에서 “일제에 협력”을 고르면 +10,000원과 GAME OVER(게임 참여 불가)가 나옵니다(되돌리기 가능).</li>' +
      '<li>모든 정답과 장비를 얻어도 에피소드 32의 −200원 때문에 최종 자금은 −8원입니다(승패 없는 게임).</li>' +
      '<li>에피소드 22 암호 정답은 “상해”이고 “상하이”도 인정합니다. 에피소드 18은 “이순신 장군”처럼 “장군”을 붙여도 맞습니다.</li></ul>');
    return html;
  }

  window.TeacherBoards = {
    'missing-painting': { file: 'quest.js', global: 'MissingPainting', lead: '교사 확인 숫자와 미션 12개의 정답·힌트를 한눈에 봅니다. 아래 단계를 눌러 펼치세요.', render: renderMissing, title: function () { return '사라진 그림을 찾아라 — 교사용'; } },
    'gapsin-quest': { file: 'quest.js', global: 'GapsinQuest', lead: '교사 확인 숫자, 번호별 모둠·역할 배정, 암호 정답과 미션 정답을 한눈에 봅니다.', render: renderGapsinQuest, title: function () { return '갑신정변 역사 체험 — 교사용'; } },
    'sedo-scoreboard': { file: 'game.js', global: 'SedoBoard', lead: '세도정치 인생 게임(PPT 74장)의 에피소드별 점수표입니다. 학생 점수판이 계산하는 값과 같은 데이터를 그대로 읽습니다.', render: renderSedo, title: function () { return '세도정치 인생 게임 점수판 — 교사용'; } },
    'assassination-scoreboard': { file: 'game.js', global: 'AssassinationBoard', lead: '인생 게임 외전 「암살」(PPT 104장)의 정답표와 에피소드별 자금표입니다. 학생 자금판이 계산하는 값과 같은 데이터를 그대로 읽습니다.', render: renderAssassination, title: function () { return '인생 게임 외전 「암살」 자금판 — 교사용'; } },
    'gapsin-donghak-scoreboard': { file: 'game.js', global: 'GapsinBoard', lead: '갑신정변과 동학농민운동 인생 게임(PPT 159장)의 에피소드별 점수표입니다. 학생 점수판이 계산하는 값과 같은 데이터를 그대로 읽습니다.', render: renderDonghak, title: function () { return '갑신정변·동학농민운동 인생 게임 점수판 — 교사용'; } }
  };
}());
