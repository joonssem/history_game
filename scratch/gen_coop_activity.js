// 정적 협동 활동의 index.html과 사람이 읽는 검토 문서를 scenario.js 한 곳에서 만든다.
// 사용: node scratch/gen_coop_activity.js cooperative-mud/<폴더>        → <폴더>/index.html 생성
//       node scratch/gen_coop_activity.js --review <폴더> [<폴더>...]   → 검토용 마크다운을 표준 출력
// scenario.js의 page 객체가 화면 문구(소개·공통 자료·가상 상황·교과서 정리·관찰 질문)를 담는다.
// 공용 엔진(episode.js·pacing.js)은 page 객체를 읽지 않는다.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function load(dir) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(dir, 'scenario.js'), 'utf8'), ctx);
  return ctx.window.CoopScenario;
}

const paragraphs = (list) => list.map((t) => '          <p>' + t + '</p>').join('\n');
const items = (list) => list.map((t) => '          <li>' + t + '</li>').join('\n');

function html(s) {
  const p = s.page;
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#2F5D8A">
  <meta name="description" content="${p.metaDescription}">
  <title>${p.docTitle}</title>
  <link rel="stylesheet" href="../cooperative.css">
</head>
<body>
  <!-- 이 파일은 scratch/gen_coop_activity.js가 scenario.js의 page 객체로 만든다. 문구는 scenario.js에서 고친다. -->
  <main class="coop-shell game-shell">
    <header class="coop-header game-header">
      <div>
        <a class="back-link" href="../">← 모둠 역사 탐험 허브</a>
        <p class="eyebrow">${p.eyebrow}</p>
        <h1>${p.h1}</h1>
        <p class="lead">${p.lead}</p>
      </div>
      <span class="status-pill">개인정보 수집 없음</span>
    </header>

    <div class="game-progress" aria-label="게임 진행도">
      <div class="progress-label"><span id="progress-step">활동 소개</span><span id="progress-count">1 / 8</span></div>
      <div class="progress-track"><div id="progress-value" class="progress-value" style="width: 13%"></div></div>
    </div>

    <div id="live-status" class="live-status" role="status" aria-live="polite"></div>

    <div id="pacing-note" class="pacing-note" hidden>
      <button id="pacing-badge" class="pacing-badge" type="button" aria-expanded="false" aria-controls="pacing-text"></button>
      <p id="pacing-text" class="pacing-text" hidden></p>
    </div>


    <section id="screen-intro" class="screen">
      <div class="panel">
        <h2 class="screen-title">${p.introTitle}</h2>
        <div class="event-card">
          <p class="event-label">오늘의 탐구 질문</p>
          <h2>${p.question}</h2>
        </div>
        <p class="screen-description" style="margin-top: 14px;">${p.introDescription}</p>
        <ul class="rules">
          <li>자기 화면의 자료를 친구에게 보여 주지 말고 말로 설명합니다.</li>
          <li>친구 자료를 듣기 전에, 내 자료만 보고 먼저 생각을 정합니다.</li>
          <li>마지막 설명은 모둠에서 말로 합의하고, 대표 기기 한 대에 기록합니다.</li>
        </ul>
        <div class="button-row"><button id="start-button" class="primary-button" type="button">활동 시작하기</button></div>
      </div>
    </section>

    <section id="screen-setup" class="screen" hidden>
      <div class="panel">
        <h2 class="screen-title">우리 모둠과 내 번호를 선택하세요</h2>
        <p class="screen-description">교사가 알려 준 모둠 번호를 확인하고, 오늘 실제 모둠 인원에 맞는 숫자와 내 번호를 선택합니다. 이름이나 학번은 입력하지 않습니다.</p>
        <label class="form-label">모둠 번호</label>
        <div id="team-grid" class="team-grid" role="group" aria-label="모둠 번호"></div>
        <label class="form-label">오늘 모둠 인원</label>
        <div id="team-size-grid" class="team-size-grid" role="group" aria-label="오늘 모둠 인원"></div>
        <label class="form-label">내 번호</label>
        <div id="seat-grid" class="seat-grid" role="group" aria-label="좌석 번호"></div>
        <p id="setup-hint" class="setup-hint">모둠을 먼저 선택하세요.</p>
        <label class="form-label">활동 길이</label>
        <div class="mode-grid" role="group" aria-label="활동 길이 선택">
          <button class="mode-button" data-mode="5" type="button"><strong>5분형</strong><span>${p.mode5}</span></button>
          <button class="mode-button is-selected" data-mode="10" type="button"><strong>10분형</strong><span>${p.mode10}</span></button>
        </div>
        <p id="setup-error" class="error-note" role="alert"></p>
        <div class="button-row"><button id="begin-button" class="primary-button" type="button" disabled>내 역할 자료 확인하기</button></div>
      </div>
    </section>

    <section id="screen-role" class="screen" hidden>
      <div class="panel">
        <h2 class="screen-title">내가 맡은 역할 자료입니다</h2>
        <p class="screen-description">아직 친구에게 설명하지 마세요. 먼저 혼자 읽고, 핵심어를 찾아 두세요. 다음 화면에서 내 생각을 정합니다.</p>
        <div id="role-card" class="role-card"></div>
        <div class="button-row"><button id="role-continue-button" class="primary-button" type="button">다 읽었어요</button></div>
      </div>
    </section>

    <section id="screen-first" class="screen" hidden>
      <div class="panel">
        <div class="event-card">
          <p class="event-label">혼자 생각하기</p>
          <h2>${p.first.question}</h2>
          <p>${p.first.description}</p>
        </div>
        <h2 class="screen-title" style="margin-top: 18px;">내 생각은 무엇인가요?</h2>
        <p class="screen-description">친구와 자료를 나누기 전에 내 처음 생각을 먼저 기록합니다. 나중에 바꿀 수 있고, 바꾸어도 점수는 없습니다.</p>
        <div id="first-choice-grid" class="choice-grid"></div>
      </div>
    </section>

    <section id="screen-share" class="screen" hidden>
      <div class="panel">
        <h2 class="screen-title">이제 모둠에서 자료를 나눕니다</h2>
        <p class="screen-description">1번부터 번호 순서대로 말합니다. 화면을 보여 주지 말고, 아래 문장을 내 말로 설명하세요. 마지막에 근거 쪽수를 꼭 말해 주세요.</p>
        <div id="share-card" class="share-quote"></div>
        <div class="evidence-card" style="margin-top: 14px;">
          <h3>들으면서 찾아볼 것</h3>
          <p>${p.shareListen}</p>
        </div>
        <div class="button-row"><button id="share-button" class="primary-button" type="button">모둠에 이야기했어요</button></div>
        <p id="share-state" class="share-state" aria-live="polite"></p>
      </div>
    </section>

    <section id="screen-reveal" class="screen" hidden>
      <div class="panel">
        <div class="event-card">
          <p class="event-label">${p.reveal.label}</p>
          <h2>${p.reveal.title}</h2>
${paragraphs(p.reveal.paragraphs)}
        </div>
        <div class="evidence-card">
          <h3>${p.reveal.askTitle}</h3>
          <ol class="observation-list">
${items(p.reveal.asks)}
          </ol>
        </div>
        <div id="missing-role-clue" class="evidence-card" hidden></div>
        <div class="change-panel">
          <h3>처음 생각을 그대로 유지하시겠습니까?</h3>
          <p class="screen-description">친구들의 자료와 공통 자료가 내 생각에 어떤 영향을 주었는지 선택합니다. 그대로 두어도 괜찮습니다.</p>
          <div class="button-row">
            <button id="keep-button" class="secondary-button" type="button">그대로 유지하기</button>
            <button id="change-button" class="primary-button" type="button">생각을 바꾸기</button>
          </div>
          <div id="revised-choice-area" hidden>
            <h3 style="margin-top: 18px;">바꾼 생각은 무엇인가요?</h3>
            <div id="revised-choice-grid" class="choice-grid"></div>
          </div>
        </div>
      </div>
    </section>

    <section id="screen-second" class="screen" hidden>
      <div class="panel">
        <div class="event-card">
          <p class="event-label">${p.second.label}</p>
          <h2>${p.second.title}</h2>
${paragraphs(p.second.paragraphs)}
        </div>
        <div class="evidence-card">
          <h3>모둠 토의 질문</h3>
          <ol class="observation-list">
${items(p.second.asks)}
          </ol>
        </div>
        <div class="button-row" style="margin-top: 16px;"><button id="second-continue-button" class="primary-button" type="button">모둠의 설명 만들어 보기</button></div>
      </div>
    </section>

    <section id="screen-statement" class="screen" hidden>
      <div class="panel">
        <div class="event-card">
          <p class="event-label">최종 미션</p>
          <h2 id="statement-heading">우리 모둠의 설명 만들기</h2>
          <p id="statement-description">친구들의 자료를 모두 생각하고 모둠에서 합의합니다.</p>
        </div>
        <div class="evidence-card" style="margin-top: 14px;">
          <p>고르기 전에, 칸과 칸 사이에 <strong>“왜냐하면”</strong>을 넣어 한 번 소리 내어 말해 보세요. 기록관(3인 모둠은 3번 친구)은 “몇 쪽이야?”, “모두야, 일부야?”를 물어봐 주세요.</p>
        </div>
        <div id="statement-builder" class="law-builder" style="margin-top: 16px;"></div>
        <div id="statement-preview" class="law-preview" aria-live="polite"></div>
        <p class="law-note">이 기록은 이 기기에만 저장됩니다. 실제 모둠의 최종 설명은 친구들과 말로 합의한 뒤 대표 기기 한 대에서 기록하세요.</p>
        <div class="button-row" style="margin-top: 15px;"><button id="statement-save-button" class="primary-button" type="button">우리 모둠 설명 기록하기</button></div>
      </div>
    </section>

    <section id="screen-history" class="screen" hidden>
      <div class="panel">
        <div class="event-card">
          <p class="event-label">교과서와 비교</p>
          <h2>${p.history.title}</h2>
          <p>${p.history.description}</p>
        </div>
        <ul class="clause-list" id="document-list"></ul>
        <div class="history-quote" style="margin-top: 14px;">
          <p>${p.history.summary}</p>
        </div>
        <div class="evidence-card" style="margin-top: 14px;">
          <h3>탐구 질문 다시 보기</h3>
          <p><strong>${p.question}</strong> 우리 모둠 설명은 이 질문에 답하고 있나요?</p>
        </div>
        <div id="trap-note" class="evidence-card" hidden></div>
        <div class="compare-box">
          <h3>내 생각과 견주어 봅시다</h3>
          <p id="compare-text"></p>
        </div>
        <div class="source-list" id="source-list"></div>
        <div class="button-row" style="margin-top: 17px;"><button id="finish-button" class="primary-button" type="button">나의 탐구 기록 확인하기</button></div>
      </div>
    </section>

    <section id="screen-finish" class="screen" hidden>
      <div class="panel">
        <p class="eyebrow">탐구 완료</p>
        <h2 class="screen-title">나는 친구들의 자료를 듣고 내 생각을 다시 살펴보았습니다</h2>
        <p class="screen-description">아래 기록은 이 기기에만 남습니다. 교사는 모둠 토론을 관찰한 뒤 별도 기록지에 결과를 적어 주세요.</p>
        <div id="summary-grid" class="summary-grid"></div>
        <h3 style="margin-top: 18px;">교사 관찰 질문</h3>
        <ol class="observation-list">
${items(p.finish.observations)}
        </ol>
        <div class="completion-note">${p.finish.note}</div>
        <div class="button-row" style="margin-top: 17px;"><button id="reset-button" class="secondary-button" type="button">이 기기 기록 지우고 다시 하기</button><a class="link-button" href="../">모둠 역사 탐험 허브로</a></div>
      </div>
    </section>
  </main>
  <script src="../pacing.js"></script>
  <script src="scenario.js"></script>
  <script src="../episode.js"></script>
  <script src="../trap-note.js"></script>
</body>
</html>
`;
}

const strip = (t) => String(t).replace(/<br>/g, '\n').replace(/<\/?b>/g, '**').replace(/<[^>]+>/g, '');

function review(dir) {
  const s = load(dir);
  const p = s.page;
  const out = [];
  out.push('## ' + s.title, '', '- 폴더: `' + dir + '` · id `' + s.id + '`', '- 탐구 질문: **' + p.question + '**', '');
  out.push('### 역할 카드', '');
  s.roles.forEach((r, i) => {
    out.push('#### ' + (i + 1) + '번 ' + r.icon + ' ' + r.name + ' — ' + r.figure, '', strip(r.privateInfo).split('\n').map((l) => '> ' + l).join('\n'), '');
    out.push('- 이 자료가 말해 주는 것: ' + r.interest, '- 모둠에 말할 내용: ' + r.shareText, '');
  });
  out.push('### 3인 모둠 추가 자료', '', '**' + s.smallTeamClue.title + '** — ' + s.smallTeamClue.text, '');
  out.push('### 처음 생각', '', p.first.question, '', s.firstChoices.map((c) => '- ' + c.label + '. ' + c.text).join('\n'), '');
  out.push('### 공통 자료 (' + p.reveal.label + ')', '', '**' + p.reveal.title + '**', '', p.reveal.paragraphs.map(strip).join('\n\n'), '', p.reveal.asks.map((a, i) => (i + 1) + '. ' + strip(a)).join('\n'), '');
  out.push('### 10분형 추가 단계 (' + p.second.label + ')', '', '**' + p.second.title + '**', '', p.second.paragraphs.map(strip).join('\n\n'), '', p.second.asks.map((a, i) => (i + 1) + '. ' + strip(a)).join('\n'), '');
  out.push('### 모둠 설명 틀', '');
  s.statement.fields.forEach((f) => {
    out.push('- **' + f.label + '**');
    f.options.forEach((o) => out.push('  - ' + o.text + ((s.traps || []).some((t) => t.field === f.key && t.value === o.value) ? '  ⚠ 함정' : '')));
  });
  out.push('', '완성 예: ' + s.statement.compose(s.statement.fields.map((f) => f.options[0].sentence)), '');
  out.push('### 함정을 고른 모둠에게 7단계에서 되묻는 말', '', (s.traps || []).map((t) => '- ' + t.note).join('\n'), '');
  out.push('### 교과서 정리 (7단계)', '', s.documents.map((d) => '- **' + d.name + '** ' + d.note).join('\n'), '', p.history.summary.replace(/<[^>]+>/g, ''), '');
  out.push('### 시간 예산(초)', '', '- 5분형: ' + JSON.stringify(s.pacing.budgets['5']), '- 10분형: ' + JSON.stringify(s.pacing.budgets['10']), '');
  return out.join('\n');
}

const args = process.argv.slice(2);
if (args[0] === '--review') {
  console.log(args.slice(1).map(review).join('\n---\n\n'));
} else {
  const dir = args[0];
  const s = load(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), html(s), 'utf8');
  console.log('wrote ' + path.join(dir, 'index.html'));
}
