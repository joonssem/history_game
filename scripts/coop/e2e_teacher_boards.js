// 교사용 보기(보드형 탭 포함)를 실제 Chrome(헤드리스, CDP)으로 끝까지 눌러 확인한다.
// 사용: node scripts/coop/e2e_teacher_boards.js http://localhost:8793/cooperative-mud/teacher/
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = process.argv[2];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'teacher-e2e-'));
const port = 9339;
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--window-size=820,1180', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0;
const pending = new Map();
const fails = [];
const check = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails.push(m); };

async function connect() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + port + '/json')).json();
      const page = list.find((t) => t.type === 'page');
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((a, b) => { ws.onopen = a; ws.onerror = b; }); break; }
    } catch (e) { /* retry */ }
    await sleep(200);
  }
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
}
function send(method, params) { return new Promise((r) => { id += 1; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); }); }
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) throw new Error('평가 실패: ' + expr + ' → ' + JSON.stringify(r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description));
  return r.result.result.value;
}
const click = (sel) => ev("document.querySelector('" + sel + "').click()");
const points = () => ev("document.querySelector('.score-num') ? document.querySelector('.score-num').textContent : ''");

(async () => {
  await connect();
  await send('Runtime.enable', {});
  await send('Page.navigate', { url }); await sleep(800);
  await ev('localStorage.clear()');
  const tabs = async () => ev("[...document.querySelectorAll('.activity-tab')].map(b=>b.dataset.slug)");
  const slugs = await tabs();
  check(slugs.length === 14, '탭 14개(기존 6 + 신규 5 + 개항 보충 3): ' + slugs.length);
  for (const slug of ['missing-painting', 'gapsin-quest', 'sedo-scoreboard', 'gapsin-donghak-scoreboard', 'assassination-scoreboard', 'daewongun-quest', 'ganghwa-quest', 'modern-items-quest']) check(slugs.includes(slug), slug + ' 탭 있음');

  async function openTab(slug) {
    await ev("document.querySelector('.activity-tab[data-slug=\"" + slug + "\"]').click()");
    for (let i = 0; i < 30; i += 1) { await sleep(150); if (await ev("document.querySelector('.activity-tab.is-selected') && document.querySelector('.activity-tab.is-selected').dataset.slug === '" + slug + "' && document.getElementById('load-status').textContent === ''")) break; }
  }
  const txt = () => ev("document.getElementById('flow-view').textContent"); // 접힌 단계의 글자도 포함

  await openTab('missing-painting');
  let t = await txt();
  check(await ev("document.getElementById('seat-tabs').hidden"), '사라진 그림: 학생 번호 영역 숨김');
  check(/1700/.test(t) && /허난설헌/.test(t) && /제비/.test(t), '사라진 그림: 교사 숫자·인물·미션1 정답(제비)');
  check(await ev("document.querySelectorAll('#flow-view .t-table')[0].querySelectorAll('tbody tr').length") === 12, '사라진 그림: 미션 12행');
  check(/홍길동전을지은작가의누이/.test(t) && /월식/.test(t) && /lion/.test(t), '사라진 그림: 조각 문구·월식·lion');

  await openTab('gapsin-quest');
  t = await txt();
  check(/1884/.test(t), '갑신정변 체험: 교사 숫자 1884');
  check(await ev("document.querySelectorAll('#flow-view .t-table')[0].querySelectorAll('tbody tr').length") === 21, '갑신정변 체험: 번호 배정 21행');
  check(/실학/.test(t) && /탕평책/.test(t) && /강화도조약/.test(t) && /병인양요/.test(t) && /신미양요/.test(t), '갑신정변 체험: 암호 정답 5종');
  check(/김옥균|옥균/.test(t) && /급진개화파의 리더/.test(t), '갑신정변 체험: 역할 카드');

  await openTab('sedo-scoreboard');
  t = await txt();
  check(await ev("document.querySelectorAll('#flow-view .t-table.sedo tbody tr').length") === await ev('window.SedoBoard.STEPS.length'), '세도정치: 점수표 행 수 = 장면(STEPS) 수');
  check(/7,000/.test(t) && /4,000/.test(t) && /−3,000/.test(t) && /−10,000/.test(t) && /\+5,000/.test(t), '세도정치: 시작·강등·최종 벌 숫자');

  await openTab('gapsin-donghak-scoreboard');
  t = await txt();
  check(await ev("document.querySelectorAll('#flow-view .t-table.donghak tbody tr').length") === await ev('window.GapsinBoard.STEPS.length'), '갑신·동학: 점수표 행 수 = 장면(STEPS) 수');
  check(/골드 트로피/.test(t) && /💀/.test(t) && /원래 중국어 능력자 \+50/.test(t) && /흥선대원군파/.test(t), '갑신·동학: 트로피·국력·능력 추가·신분');
  check(await ev("document.getElementById('activity-lead').textContent.indexOf('159장') >= 0"), '갑신·동학: 안내문이 활동별로 바뀜');

  await openTab('assassination-scoreboard');
  t = await txt();
  check(await ev("document.querySelectorAll('#flow-view .t-table.assassination tbody tr').length") === await ev('window.AssassinationBoard.STEPS.length'), '암살: 자금표 행 수 = 장면(STEPS) 수');
  check(/0, 1, 2, 4, 7, 9/.test(t) && /이순신/.test(t) && /9가마/.test(t) && /상해/.test(t) && /2번 상자/.test(t), '암살: 정답 한눈에(일본군 위치·역사 퀴즈·가마·상해·상자)');
  check(/−10,000|10,000/.test(t) && /−8원/.test(t) && /경성 → 만주/.test(t), '암살: 협력 시 10,000·최종 −8원·이동경로');

  await openTab('daewongun-quest');
  t = await txt();
  check(/1234|1700/.test(t) && /가상/.test(t) && /ㅅㅁ/.test(t) && /47/.test(t) && /척화비/.test(t) && /4명/.test(t), '흥선대원군: 확인 숫자·번호 배정·빈칸 정답·척화비');
  check(await ev("document.querySelectorAll('#flow-view .t-table').length") >= 6, '흥선대원군: 표(번호 배정+빈칸) 여러 개');
  await openTab('ganghwa-quest');
  t = await txt();
  check(/게임 대회 약속/.test(t) && /치외법권/.test(t) && /운요호/.test(t) && /ㅅㅅㄴ/.test(t), '강화도 조약: 약속·1·7·10조·운요호·초성');
  await openTab('modern-items-quest');
  t = await txt();
  check(/전등/.test(t) && /석조전/.test(t) && /ㅂㅈㅎㄷ/.test(t) && (await ev("document.querySelectorAll('#flow-view img').length")) === 3, '근대 문물: 11개 정답·초성·사진 3장 위치');
  check(await ev("[...document.querySelectorAll('#flow-view img')].every(i=>i.complete&&i.naturalWidth>0)"), '근대 문물: 사진 3장이 실제로 불러와짐');

  // 기존 탭으로 돌아오면 학생 번호 영역이 되살아난다
  await openTab('joseon-sejong');
  check(!(await ev("document.getElementById('seat-tabs').hidden")) && (await ev("document.querySelectorAll('.seat-tab').length")) >= 3, '기존 탭 복귀: 학생 번호 영역 복원');
  check(/순회지도/.test(await ev("document.getElementById('activity-lead').textContent")), '기존 탭 복귀: 기본 안내문 복원');

  // 새로고침 해시 유지 + 인쇄 전 처리에서 오류가 없는지
  await send('Page.navigate', { url: 'about:blank' }); await sleep(300);
  await send('Page.navigate', { url: url + '#sedo-scoreboard' }); await sleep(2500);
  check(await ev("document.querySelector('.activity-tab.is-selected').dataset.slug") === 'sedo-scoreboard', '#해시로 바로 열림');
  const err = await ev("(function(){try{window.dispatchEvent(new Event('beforeprint'));window.dispatchEvent(new Event('afterprint'));return ''}catch(e){return String(e)}})()");
  check(err === '', '인쇄 이벤트 오류 없음 ' + err);
  check(await ev("[...document.querySelectorAll('.stage')].every(d=>d.open)"), '인쇄 전 단계가 모두 펼쳐짐');

  await send('Emulation.setDeviceMetricsOverride', { width: 820, height: 1180, deviceScaleFactor: 1, mobile: false });
  await openTab('gapsin-donghak-scoreboard'); await sleep(300);
  check(await ev('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), '820px 폭 가로 스크롤 없음');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(process.env.SHOT || 'teacher-shot.png', Buffer.from(shot.result.data, 'base64'));
  console.log(fails.length ? '\n' + fails.length + '개 실패' : '\n모두 통과');
  proc.kill();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
