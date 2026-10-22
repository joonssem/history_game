// 교사용 보기: 각 활동의 scenario.js와 index.html을 그대로 읽어 한 화면에 펼친다. 내용을 따로 복사해 두지 않는다.
// 운영이 끝난 활동은 status를 'done'으로 바꾸면 목록에서 빠진다(TEACHING.md의 수업 운영 칸과 같은 판정).
(function () {
  const ACTIVITIES = [
    { slug: 'joseon-founding', name: '조선 건국·유교 사회', status: 'done' },
    { slug: 'joseon-sejong', name: '세종 시기', status: 'upcoming' },
    { slug: 'joseon-wars', name: '임진왜란·병자호란', status: 'upcoming' },
    { slug: 'joseon-late-economy', name: '조선 후기 경제·신분', status: 'upcoming', badge: '10/29 공개수업' },
    { slug: 'joseon-late-change', name: '조선 후기 새로운 생각', status: 'upcoming' },
    { slug: 'joseon-commoner-culture', name: '서민 문화', status: 'upcoming' },
    { slug: 'joseon-open-ports', name: '개항 이후', status: 'upcoming' }
  ].filter(function (a) { return a.status === 'upcoming'; });

  // 학생 화면의 단계 순서. second는 5분형에서 건너뛴다(episode.js).
  const STAGES = [
    { key: 'intro', title: '활동 소개' },
    { key: 'first', title: '혼자 생각하기' },
    { key: 'share', title: '자료 나누기' },
    { key: 'reveal', title: '공통 자료' },
    { key: 'second', title: '두 번째 자료', longOnly: true },
    { key: 'statement', title: '모둠 설명 만들기' },
    { key: 'history', title: '교과서와 비교' },
    { key: 'finish', title: '마무리' }
  ];
  const STORE_KEY = 'history_coop_teacher_view';
  const cache = {};
  let current = null;
  let currentSeat = 1;

  function get(id) { return document.getElementById(id); }
  function esc(text) {
    return String(text).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function remember(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) { /* 저장이 막혀도 화면은 동작한다 */ }
  }
  function recall() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }

  // scenario.js는 window.CoopScenario에 자기 시나리오를 넣는다. 탭을 빠르게 눌러도 섞이지 않게 한 번에 하나씩 불러와 붙잡아 둔다.
  let scriptQueue = Promise.resolve();
  function loadScenario(slug) {
    scriptQueue = scriptQueue.catch(function () {}).then(function () { return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = '../' + slug + '/scenario.js';
      script.onload = function () { resolve(window.CoopScenario); };
      script.onerror = function () { reject(new Error(slug + '/scenario.js를 불러오지 못했습니다.')); };
      document.head.appendChild(script);
    }); });
    return scriptQueue;
  }

  // 화면 문구는 활동 index.html에서 읽는다. 버튼·빈 칸(엔진이 채우는 곳)·숨긴 칸은 뺀다.
  function loadScreens(slug) {
    return fetch('../' + slug + '/index.html').then(function (res) {
      if (!res.ok) throw new Error(slug + '/index.html을 불러오지 못했습니다.');
      return res.text();
    }).then(function (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const screens = {};
      STAGES.forEach(function (stage) {
        const section = doc.getElementById('screen-' + stage.key);
        if (!section) return;
        section.querySelectorAll('button, .button-row, [hidden], input, select, label, .live-status, script').forEach(function (el) { el.remove(); });
        section.querySelectorAll('[id]').forEach(function (el) {
          if (!el.textContent.trim()) el.remove(); else el.removeAttribute('id');
        });
        screens[stage.key] = section.innerHTML;
      });
      const modes = {};
      doc.querySelectorAll('.mode-button').forEach(function (button) {
        const name = button.querySelector('strong');
        modes[button.dataset.mode] = name ? name.textContent.trim() : button.dataset.mode + '분형';
      });
      return { screens: screens, modes: modes };
    });
  }

  function load(slug) {
    if (!cache[slug]) {
      cache[slug] = loadScenario(slug).then(function (scenario) {
        return loadScreens(slug).then(function (page) {
          return { slug: slug, scenario: scenario, screens: page.screens, modes: page.modes };
        });
      });
    }
    return cache[slug];
  }

  function renderActivityTabs() {
    get('activity-tabs').innerHTML = ACTIVITIES.map(function (a) {
      const selected = current && current.slug === a.slug;
      return '<button class="activity-tab' + (selected ? ' is-selected' : '') + '" type="button" data-slug="' + a.slug + '" aria-pressed="' + selected + '">' +
        (a.badge ? '<span class="tab-badge">' + esc(a.badge) + '</span>' : '') + esc(a.name) + '</button>';
    }).join('');
  }

  function renderSeatTabs() {
    const roles = current.scenario.roles;
    get('seat-tabs').innerHTML = roles.map(function (role, i) {
      const seat = i + 1;
      return '<button class="seat-tab' + (seat === currentSeat ? ' is-selected' : '') + '" type="button" data-seat="' + seat + '" aria-pressed="' + (seat === currentSeat) + '">' +
        '<b>' + seat + '번</b><span>' + role.icon + ' ' + esc(role.name) + '</span></button>';
    }).join('');
  }

  // 학생 화면의 역할 카드와 같은 내용: 혼자 읽는 자료 → 이 자료가 말해 주는 것 → 친구에게 말할 문장
  function renderSeat() {
    const s = current.scenario;
    const role = s.roles[currentSeat - 1];
    const labels = s.labels || {};
    get('seat-view').innerHTML =
      '<div class="role-card">' +
        '<div class="role-head"><div class="role-icon">' + role.icon + '</div><div>' +
          '<span class="role-badge">' + currentSeat + '번</span>' +
          '<h2>' + esc(role.name) + '</h2><p class="muted-label">' + esc(role.figure) + '</p>' +
        '</div></div>' +
        '<p class="private-label">' + esc(labels.privateLabel || '내가 가진 자료') + '</p>' +
        '<p class="private-info">' + role.privateInfo + '</p>' +
        '<div class="interest-box"><b>' + esc(labels.interestLabel || '이 자료가 말해 주는 것:') + '</b> ' + role.interest + '</div>' +
        '<div class="share-quote"><b>자료 나누기 때 말할 문장</b><br>' + role.shareText + '</div>' +
      '</div>';
    const last = s.roles.length;
    get('seat-note').innerHTML = '번호 = 역할입니다. 인원이 ' + s.teamSizeOptions.join('·') + '명이면 1번부터 그 수만큼만 씁니다. ' +
      '<b>3인 모둠</b>은 4번 이후 자료를 받지 않고, 공통 자료 단계에서 「' + esc(s.smallTeamClue.title) + '」를 봅니다.' +
      (last > 4 ? ' 4인 모둠은 ' + last + '번 자료가 없습니다.' : '');
  }

  function box(title, inner) {
    return '<div class="teacher-box"><h4>' + title + '</h4>' + inner + '</div>';
  }

  function stageExtras(key) {
    const s = current.scenario;
    const modes = current.modes;
    let html = '';
    const prompts = s.pacing && s.pacing.prompts && s.pacing.prompts[key];
    const budgets = s.pacing && s.pacing.budgets;
    if (budgets) {
      const times = Object.keys(budgets).filter(function (m) { return budgets[m][key]; }).map(function (m) {
        return (modes[m] || m + '분형') + ' ' + budgets[m][key] + '초';
      });
      if (times.length) html += '<p class="muted-label">권장 시간: ' + times.join(' · ') + '</p>';
    }
    if (prompts) {
      html += box('진행이 느릴 때 / 빠를 때 띄우는 발문', '<ul><li><b>느릴 때</b> ' + esc(prompts.slow) + '</li><li><b>빠를 때</b> ' + esc(prompts.fast) + '</li></ul>');
    }
    if (key === 'first' || key === 'reveal') {
      html += box(key === 'first' ? '처음 생각 선택지' : '생각을 바꿀 때 고르는 선택지', '<ul>' + s.firstChoices.map(function (c) {
        return '<li><b>' + esc(c.label) + '</b> ' + esc(c.text) + '</li>';
      }).join('') + '</ul>');
    }
    if (key === 'share') {
      html += box('번호별로 말할 문장', '<ol>' + s.roles.map(function (r) {
        return '<li><b>' + r.icon + ' ' + esc(r.name) + '</b> — ' + r.shareText + '</li>';
      }).join('') + '</ol>');
    }
    if (key === 'reveal') {
      html += box('3인 모둠에서만 보이는 자료 · ' + esc(s.smallTeamClue.title), '<p>' + s.smallTeamClue.text + '</p>');
    }
    if (key === 'statement') {
      const headings = s.statement.headings;
      html += box('활동 길이별 제목', '<ul>' + Object.keys(headings).map(function (m) {
        return '<li><b>' + (modes[m] || m + '분형') + '</b> ' + esc(headings[m].heading) + ' — ' + esc(headings[m].description) + '</li>';
      }).join('') + '</ul>');
      const traps = s.traps || [];
      html += box('칸별 선택지 (⚠ 표시는 7단계에서 다시 묻는 과잉일반화 선택지)', s.statement.fields.map(function (f) {
        return '<p style="margin:8px 0 3px"><b>' + esc(f.label) + '</b></p><ul>' + f.options.map(function (o) {
          const trap = traps.find(function (t) { return t.field === f.key && t.value === o.value; });
          return '<li>' + esc(o.text) + (trap ? '<span class="trap-tag">⚠ 함정</span><div class="trap-note-text">되묻는 메모: ' + trap.note + '</div>' : '') + '</li>';
        }).join('') + '</ul>';
      }).join(''));
      const sample = s.statement.compose(s.statement.fields.map(function (f) { return f.options[0].sentence; }));
      html += box('완성 문장 예시(각 칸 첫 선택지)', '<p>“' + esc(sample) + '”</p>');
    }
    if (key === 'history') {
      html += box('교과서 정리 자료', '<ul>' + s.documents.map(function (d) {
        return '<li><b>' + esc(d.name) + '</b> ' + d.note + '</li>';
      }).join('') + '</ul>');
      const c = s.compare;
      const items = ['<li><b>처음 생각을 고르지 않았을 때</b> ' + esc(c.none) + '</li>',
        '<li><b>그 밖의 선택</b> ' + esc(c.aligned) + '</li>'];
      if (c.unverifiableChoiceId) {
        const choice = s.firstChoices.find(function (x) { return x.id === c.unverifiableChoiceId; });
        items.splice(1, 0, '<li><b>' + esc(choice ? choice.label : c.unverifiableChoiceId) + '를 골랐을 때</b> ' + esc(c.unverifiable) + '</li>');
      }
      html += box('“내 생각과 견주어 봅시다”에 나오는 문구 ({answer} = 학생의 마지막 선택)', '<ul>' + items.join('') + '</ul>');
      html += box('출처', '<ul>' + s.sources.map(function (src) {
        return '<li><a href="' + esc(src.url) + '" target="_blank" rel="noopener noreferrer">' + esc(src.label) + ' ↗</a></li>';
      }).join('') + '</ul>');
    }
    return html;
  }

  function renderFlow() {
    const longName = current.modes['10'] || '긴 활동';
    get('flow-view').innerHTML = '<h2>활동 전체 흐름</h2>' + STAGES.map(function (stage, i) {
      const body = current.screens[stage.key] || '';
      return '<details class="stage"><summary>' + (i + 1) + '. ' + stage.title +
        (stage.longOnly ? '<small>' + esc(longName) + '에서만</small>' : '') + '</summary>' +
        '<div class="stage-body">' + body + stageExtras(stage.key) + '</div></details>';
    }).join('');
  }

  function select(slug, seat) {
    get('load-status').textContent = '불러오는 중…';
    load(slug).then(function (data) {
      current = data;
      currentSeat = seat && seat <= data.scenario.roles.length ? seat : 1;
      get('activity-title').textContent = data.scenario.title;
      document.title = '교사용 · ' + data.scenario.title;
      renderActivityTabs();
      renderSeatTabs();
      renderSeat();
      renderFlow();
      get('load-status').textContent = '';
      remember({ slug: slug, seat: currentSeat });
      if (location.hash !== '#' + slug) history.replaceState(null, '', '#' + slug);
    }).catch(function (err) {
      get('load-status').innerHTML = '<span class="load-error">' + esc(err.message) + ' 이 페이지는 웹 주소(GitHub Pages나 로컬 서버)로 열어야 합니다.</span>';
    });
  }

  get('activity-tabs').addEventListener('click', function (e) {
    const button = e.target.closest('.activity-tab');
    if (button) select(button.dataset.slug, 1);
  });
  get('seat-tabs').addEventListener('click', function (e) {
    const button = e.target.closest('.seat-tab');
    if (!button || !current) return;
    currentSeat = Number(button.dataset.seat);
    renderSeatTabs();
    renderSeat();
    remember({ slug: current.slug, seat: currentSeat });
  });
  get('expand-button').addEventListener('click', function () {
    const stages = document.querySelectorAll('.stage');
    const open = Array.prototype.some.call(stages, function (d) { return !d.open; });
    stages.forEach(function (d) { d.open = open; });
    this.textContent = open ? '단계 모두 접기' : '단계 모두 펼치기';
  });
  get('print-button').addEventListener('click', function () { window.print(); });
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.stage').forEach(function (d) { d.open = true; });
  });

  renderActivityTabs();
  const saved = recall();
  const fromHash = location.hash.slice(1);
  const start = ACTIVITIES.some(function (a) { return a.slug === fromHash; }) ? fromHash
    : ACTIVITIES.some(function (a) { return a.slug === saved.slug; }) ? saved.slug : ACTIVITIES[0].slug;
  select(start, start === saved.slug ? saved.seat : 1);
}());
