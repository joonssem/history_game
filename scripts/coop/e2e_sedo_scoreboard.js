// 세도정치 점수판을 실제 Chrome(헤드리스, CDP)으로 끝까지 눌러 확인한다.
// 사용: node scripts/coop/e2e_sedo_scoreboard.js http://localhost:8793/cooperative-mud/sedo-scoreboard/?ab=ppt
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = process.argv[2];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sedo-e2e-'));
const port = 9335;
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
  const errors = [];
  await send('Runtime.enable', {});

  // 무작위 모드(기본): 시작 화면에는 신분이 보이지 않고, A/B가 난수에 따라 두 신분 모두로 이어진다.
  const baseUrl = url.replace('?ab=ppt', '');
  async function drawWith(r) {
    await send('Page.navigate', { url: baseUrl }); await sleep(500);
    await ev('localStorage.clear()');
    await send('Page.navigate', { url: baseUrl }); await sleep(500);
    await ev('Math.random = () => ' + r);
    const hidden = await ev("!/양반|평민/.test(document.getElementById('app').innerText)");
    await click('[data-act="start"][data-pick="A"]');
    const revealed = await ev("document.getElementById('app').innerText");
    const chip = await ev("document.querySelector('.role-chip').textContent");
    return { hidden, revealed, chip };
  }
  const lo = await drawWith(0.1), hi = await drawWith(0.9);
  check(lo.hidden && hi.hidden, '시작 화면에 신분 이름이 보이지 않음(A/B만)');
  check(/당신의 신분은/.test(lo.revealed) && /게임 시작/.test(lo.revealed), '고른 뒤 공개 화면이 나옴');
  check(!/다시 고르기/.test(lo.revealed), '공개 화면에는 다시 고르기가 없음(재추첨 방지)');
  check(lo.chip !== hi.chip, '같은 A 버튼도 난수에 따라 다른 신분으로 이어짐: ' + lo.chip + ' / ' + hi.chip);
  await send('Page.navigate', { url }); await sleep(500);
  await ev('localStorage.clear()');
  await send('Page.navigate', { url }); await sleep(500);

  check(await ev("!document.getElementById('scorebar').hidden") === false, '시작 전에는 점수 막대가 숨겨짐');
  await click('[data-act="start"][data-pick="B"]'); await click('[data-act="begin"]');
  check(await points() === '7,000', '양반 시작 7,000');

  // EP1 김씨 → 확인 전에는 점수 변화 없음
  await click('[data-act="pick"][data-c="c1"]');
  check(await points() === '7,000', '선택만 눌러서는 점수가 바뀌지 않음');
  await click('[data-act="confirm"]');
  check(await points() === '7,030', 'EP1 김씨 +30 → 7,030');
  // 되돌리기
  await click('[data-act="undo"]');
  check(await points() === '7,000', '되돌리기 → 7,000');
  await click('[data-act="pick"][data-c="c2"]');
  await click('[data-act="confirm"]');
  check(await points() === '6,990', 'EP1 최씨 −10 → 6,990');
  await click('[data-act="next"]');
  // EP2 상황
  await click('[data-act="situ"]');
  check(await points() === '7,490', 'EP2 풍년 양반 +500 → 7,490');
  await click('[data-act="next"]');
  // EP3 양반: 돈을 드리지 않는다 → 평민 강등
  await click('[data-act="pick"][data-c="c2"]');
  await click('[data-act="confirm"]');
  check(await points() === '4,490', 'EP3 −3,000 → 4,490');
  check(/평민/.test(await ev("document.querySelector('.role-chip').textContent")), '신분 칩이 평민으로 바뀜');
  await click('[data-act="next"]');
  check(/패자부활/.test(await ev("document.getElementById('app').innerText")), '패자부활전이 나옴');
  await click('[data-act="pick"][data-c="c1"]');
  await click('[data-act="confirm"]');
  check(await points() === '3,990', '500포인트 사용 → 3,990');
  check(/양반/.test(await ev("document.querySelector('.role-chip').textContent")), '양반 신분 회복');
  await click('[data-act="next"]');
  check(/EPISODE 4/.test(await ev("document.getElementById('progress-step').textContent")), '양반은 평민 EP3을 건너뛰고 EP4로');

  // 새로고침 후에도 유지
  await send('Page.navigate', { url }); await sleep(500);
  check(await points() === '3,990', '새로고침 후 점수 유지');

  // 점수 가감
  await ev("document.getElementById('m-delta').value='-90'");
  await click('[data-act="manual"]');
  check(await points() === '3,900', '교사 안내 점수 가감 −90 → 3,900');

  // 평민으로 새로 시작해 끝까지(자동 규칙은 node 검증이 맡고 여기서는 화면 흐름만)
  await ev('localStorage.clear()');
  await send('Page.navigate', { url }); await sleep(500);
  await click('[data-act="start"][data-pick="A"]'); await click('[data-act="begin"]');
  check(await points() === '4,000', '평민 시작 4,000');
  for (let i = 0; i < 60; i += 1) {
    const done = await ev("!!document.querySelector('.finish-panel')");
    if (done) break;
    const res = await ev("!!document.querySelector('[data-act=\"next\"]')");
    if (res) { await click('[data-act="next"]'); continue; }
    if (await ev("!!document.querySelector('[data-act=\"situ\"]')")) { await click('[data-act="situ"]'); continue; }
    if (await ev("!!document.querySelector('[data-act=\"final\"]')")) { await click('[data-act="final"]'); continue; }
    await click('[data-act="pick"][data-c="c1"]'); await click('[data-act="confirm"]');
  }
  check(await ev("!!document.querySelector('.finish-panel')"), '평민 끝까지 진행 → 게임 오버 화면');
  check(await ev("document.querySelectorAll('.sheet tbody tr').length") === 21, '점수표 21행');
  check(await ev("document.querySelectorAll('[data-term]').length") === 5, '한줄 정리 5칸');
  await ev("var t=document.querySelector('[data-term=\"sedo\"]'); t.value='외척이 나라를 다스림'; t.dispatchEvent(new Event('input',{bubbles:true}))");
  await send('Page.navigate', { url }); await sleep(500);
  check(await ev("document.querySelector('[data-term=\"sedo\"]').value") === '외척이 나라를 다스림', '한줄 정리 저장 유지');


  // 양반 전 구간(모든 선택 1번) + 최종 벌 2개 체크 → 손계산 3,830
  await ev('localStorage.clear()');
  await send('Page.navigate', { url }); await sleep(500);
  await click('[data-act="start"][data-pick="B"]'); await click('[data-act="begin"]');
  for (let i = 0; i < 60; i += 1) {
    if (await ev("!!document.querySelector('.finish-panel')")) break;
    if (await ev("!!document.querySelector('[data-act=\"next\"]')")) { await click('[data-act="next"]'); continue; }
    if (await ev("!!document.querySelector('[data-act=\"situ\"]')")) { await click('[data-act="situ"]'); continue; }
    if (await ev("!!document.querySelector('[data-act=\"final\"]')")) {
      await ev("document.querySelectorAll('[data-pen]')[0].click(); document.querySelectorAll('[data-pen]')[1].click()");
      await click('[data-act="final"]'); continue;
    }
    await click('[data-act="pick"][data-c="c1"]'); await click('[data-act="confirm"]');
  }
  check(await points() === '3,830', '양반 전 구간 + 최종 벌 2개 체크 → 3,830');
  check(await ev("document.querySelectorAll('.sheet tbody tr').length") === 21, '양반도 점수표 21행');

  // 모바일 폭 가로 스크롤 없음
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 800, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  check(await ev('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), '375px 폭 가로 스크롤 없음');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(process.env.SHOT || 'sedo-finish.png', Buffer.from(shot.result.data, 'base64'));

  console.log(fails.length ? '\n' + fails.length + '개 실패' : '\n모두 통과');
  proc.kill();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
