// 암살 자금판을 실제 Chrome(헤드리스, CDP)으로 끝까지 눌러 확인한다.
// 사용: node scripts/coop/e2e_assassination_scoreboard.js http://localhost:8793/cooperative-mud/assassination-scoreboard/
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = process.argv[2];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'assassination-e2e-'));
const port = 9343;
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
  await send('Page.navigate', { url }); await sleep(500);
  await ev('localStorage.clear()');
  await send('Page.navigate', { url }); await sleep(500);
  const text = () => ev("document.getElementById('app').innerText");
  const money = () => ev("document.querySelector('.score-num') ? document.querySelector('.score-num').textContent.replace('원','').replace('\u2212','-') : ''");   // 화면의 음수 기호(−)를 -로 바꿔 비교
  const exists = (sel) => ev("!!document.querySelector('" + sel + "')");
  const type = (sel, v) => ev("(function(){var e=document.querySelector('" + sel + "');e.value=" + JSON.stringify(v) + ";e.dispatchEvent(new Event('input',{bubbles:true}))})()");
  const nextId = () => ev("(function(){var G=window.AssassinationBoard;var s=JSON.parse(localStorage.getItem(G.STORAGE_KEY));var st=G.nextStep(G.derive(s.log));return st?st.id:''})()");

  check(await ev("document.getElementById('scorebar').hidden"), '시작 전에는 자금 막대가 숨겨짐');
  check(/신분 선택이 없고/.test(await text()), '시작 화면: 신분 선택 없음 안내');
  await click('[data-act="start"]');
  check(await money() === '0', '시작 자금 0원');

  // EP1: 협력 → GAME OVER → 되돌리기
  await click('[data-act="pick"][data-c="c2"]'); await click('[data-act="confirm"]');
  await click('[data-act="next"]');
  check(/게임 참여 불가/.test(await text()) && await money() === '10,000', 'EP1 일제 협력: +10,000·GAME OVER(게임 참여 불가)');
  await click('[data-act="undo"]');
  check(await money() === '0' && await exists('[data-act="pick"]'), '되돌리기 → 다시 EP1 선택 화면');
  await click('[data-act="pick"][data-c="c1"]');
  check(await money() === '0', '선택만 눌러서는 자금이 바뀌지 않음');
  await click('[data-act="confirm"]');
  check(await money() === '30', 'EP1 독립운동 참여 +30');
  await click('[data-act="next"]');

  // 전 구간(모든 정답 + 장비 4종) 손계산 -8
  const plan = { e4: 'c4', e5: 'c1', e8: 'c1', e9: 'c3', e10: 'c3', e11: 'c1', e14: 'c1', e16: 'c1', e21: 'c1', e23: 'c1', e26: 'c2', e31: 'c2' };
  const typed = { e15: ['0 1 2 4 7 9'], e18: ['이순신', '을지문덕', '발해'], e19: ['9'], e20: ['9'], e22: ['상해'] };
  let sawMove = false, sawPreview = false, sawBoxCap = false;
  for (let i = 0; i < 120; i += 1) {
    if (await exists('.finish-panel')) break;
    if (await exists('[data-act="next"]')) { await click('[data-act="next"]'); continue; }
    const id = await nextId();
    if (!id) break;
    if (await exists('[data-act="situ"]')) {
      if (/이동하기/.test(await text())) sawMove = true;
      await click('[data-act="situ"]'); continue;
    }
    if (typed[id]) {
      for (let k = 0; k < typed[id].length; k += 1) await type('#in-' + k, typed[id][k]);
      if (id === 'e15') sawPreview = /인정되는 번호: 0, 1, 2, 4, 7, 9/.test(await ev("document.getElementById('in-preview').textContent"));
      await click('[data-act="quiz"]'); continue;
    }
    if (id === 'e30') {
      await click('[data-act="box"][data-b="1"]'); await click('[data-act="box"][data-b="2"]'); await click('[data-act="box"][data-b="3"]');
      sawBoxCap = await ev("document.querySelectorAll('.box-btn.is-selected').length") === 2;   // 망원경이 있어 2개까지, 3개째를 누르면 가장 먼저 고른 것이 빠짐
      await click('[data-act="quiz"]'); continue;                                              // 남은 건 2번·3번 → 2번 포함이라 정답
    }
    if (id === 'e33') {
      await type('#quote-in', '나라를 되찾는 그날까지');
      await click('[data-act="eval"][data-c="c1"]'); await click('[data-act="final"]'); continue;
    }
    if (!plan[id]) throw new Error('선택 누락 ' + id);
    await click('[data-act="pick"][data-c="' + plan[id] + '"]'); await click('[data-act="confirm"]');
  }
  check(await exists('.finish-panel'), '끝까지 진행 → 마무리 화면');
  check(await money() === '-8', '전 구간 최종 자금 -8원(손계산)');
  check(sawMove, '이동 장면에 이동하기 버튼');
  check(sawPreview, '일본군 위치 입력: 인정되는 번호 미리보기');
  check(sawBoxCap, '폭탄 상자: 망원경이 있으면 2개까지만 선택');
  check(await ev("document.querySelectorAll('.scorebar .wp-chip.is-on').length") === 4, '무기 4종 모두 획득 표시');
  check(/경성 → 만주 → 경성 → 만주 → 군산 → 상해 → 경성/.test(await ev("document.querySelector('.finish-panel .route-line').textContent")), '이동경로 자동 기록');
  check(/독립운동 유공 표창 수여/.test(await text()) && /나라를 되찾는 그날까지/.test(await text()), '나의 명언과 짝꿍 평가가 마무리에 표시');
  check(await ev("document.querySelectorAll('.sheet tbody tr:not(.chapter)').length") === 33 && await ev("document.querySelectorAll('.sheet tr.chapter').length") === 3, '점수표 33행, CHAPTER 3구간');
  check(await ev("document.querySelectorAll('[data-quote-who]').length") === 4 && await ev("document.querySelectorAll('[data-quote-blank]').length") === 4, '독립운동가 명언 4칸');
  check(await ev("document.getElementById('scorebar').innerHTML.indexOf('debt-note') >= 0"), '자금이 음수면 빌리기 안내가 나옴');
  await ev("var t=document.querySelector('[data-quote-who=\"q1\"]'); t.value='이회영'; t.dispatchEvent(new Event('input',{bubbles:true}))");
  await send('Page.navigate', { url }); await sleep(500);
  check(await ev("document.querySelector('[data-quote-who=\"q1\"]').value") === '이회영' && await money() === '-8', '새로고침 후 기록 유지');

  // 자금 가감
  await ev("document.getElementById('m-delta').value='-90'");
  await click('[data-act="manual"]');
  check(await money() === '-98', '선생님이 알려 준 자금 -90 → -98');

  // 소총·망원경을 못 얻은 경로: 일본군 위치 4개까지
  await ev('localStorage.clear()');
  await send('Page.navigate', { url }); await sleep(500);
  await click('[data-act="start"]');
  for (let i = 0; i < 80; i += 1) {
    if (await exists('[data-act="next"]')) { await click('[data-act="next"]'); continue; }
    const id = await nextId();
    if (id === 'e15') break;
    if (await exists('[data-act="situ"]')) { await click('[data-act="situ"]'); continue; }
    const c = id === 'e14' ? 'c2' : (plan[id] || 'c1');
    await click('[data-act="pick"][data-c="' + c + '"]'); await click('[data-act="confirm"]');
  }
  await type('#in-0', '0 1 2 4 7 9');
  check(/앞의 4개만 인정/.test(await ev("document.getElementById('in-preview').textContent")), '소총이 없으면 위치를 4개까지만 인정');
  check(/권총만 있음/.test(await text()), '장비 안내(권총만 있음)');
  await click('[data-act="quiz"]');
  check(/4개 정답/.test(await text()) && /\+30/.test(await text()), '4개 정답 +30');

  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 800, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  check(await ev('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), '375px 폭 가로 스크롤 없음');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(process.env.SHOT || 'assassination-shot.png', Buffer.from(shot.result.data, 'base64'));
  console.log(fails.length ? '\n' + fails.length + '개 실패' : '\n모두 통과');
  proc.kill();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
