// 갑신정변·동학농민운동 점수판을 실제 Chrome(헤드리스, CDP)으로 끝까지 눌러 확인한다.
// 사용: node scripts/coop/e2e_gapsin_scoreboard.js http://localhost:8793/cooperative-mud/gapsin-donghak-scoreboard/?ab=ppt
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = process.argv[2];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'gapsin-e2e-'));
const port = 9337;
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

  // 무작위 모드(기본): 시작 화면에는 신분이 보이지 않고, A/B가 난수에 따라 두 신분 모두로 이어진다.
  const baseUrl = url.replace('?ab=ppt', '');
  async function drawWith(r) {
    await send('Page.navigate', { url: baseUrl }); await sleep(500);
    await ev('localStorage.clear()');
    await send('Page.navigate', { url: baseUrl }); await sleep(500);
    await ev('Math.random = () => ' + r);
    const hidden = await ev("!/중국어|일본어/.test(document.getElementById('app').innerText)");
    await click('[data-act="start"][data-pick="A"]');
    const revealed = await ev("document.getElementById('app').innerText");
    const chip = await ev("document.querySelector('.role-chip').textContent");
    return { hidden, revealed, chip };
  }
  // 제비뽑기(에피소드 7): 같은 카드(D)를 눌러도 난수에 따라 결과가 갈리고, 점수표에는 누른 카드가 남는다.
  async function drawCard(r) {
    await send('Page.navigate', { url: baseUrl }); await sleep(500);
    await ev('localStorage.clear()');
    await send('Page.navigate', { url: baseUrl }); await sleep(500);
    await ev('Math.random = () => 0.1');
    await click('[data-act="start"][data-pick="A"]'); await click('[data-act="begin"]');     // 중국어 능력자
    const route = { e1: 'c1', e2zh: 'c1', e3y: 'c2', e5: 'c1' };
    for (let i = 0; i < 20; i += 1) {
      const id = await ev("(function(){var G=window.GapsinBoard;var s=JSON.parse(localStorage.getItem(G.STORAGE_KEY));var st=G.nextStep(G.derive(s.log));return st?st.id:''})()");
      if (id === 'e7') break;
      if (await ev("!!document.querySelector('[data-act=\"next\"]')")) { await click('[data-act="next"]'); continue; }
      if (await ev("!!document.querySelector('[data-act=\"situ\"]')")) { await click('[data-act="situ"]'); continue; }
      await click('[data-act="pick"][data-c="' + route[id] + '"]'); await click('[data-act="confirm"]');
    }
    if (await ev("!!document.querySelector('[data-act=\"next\"]')")) await click('[data-act="next"]');
    const hint = await ev("document.getElementById('app').innerText");
    await ev('Math.random = () => ' + r);
    await click('[data-act="pick"][data-c="c2"]'); await click('[data-act="confirm"]');      // 항상 D 카드
    const chip = await ev("document.querySelector('.role-chip').textContent");
    const shown = await ev("document.getElementById('app').innerText");
    const row = await ev("(function(){var t=document.querySelectorAll('.sheet tbody tr');for(var i=0;i<t.length;i++){var th=t[i].querySelector('th');if(th&&th.textContent==='7')return t[i].children[2].textContent}return ''})()");
    return { hint, chip, shown, row };
  }
  const dLo = await drawCard(0.1), dHi = await drawCard(0.9);
  check(/제비뽑기예요/.test(dLo.hint), '제비뽑기 안내 문구(결과는 뽑기로 정해짐)');
  check(dLo.chip !== dHi.chip, '같은 D 카드도 난수에 따라 다른 신분: ' + dLo.chip + ' / ' + dHi.chip);
  check(/내 선택: D 카드/.test(dLo.shown) && /내 선택: D 카드/.test(dHi.shown), '결과 화면에 누른 카드(D)가 표시됨');
  check(dLo.row === 'D' && dHi.row === 'D', '점수표의 나의 선택에는 누른 카드 D가 남음');
  const lo = await drawWith(0.1), hi = await drawWith(0.9);
  check(lo.hidden && hi.hidden, '시작 화면에 신분 이름이 보이지 않음(A/B만)');
  check(/당신의 신분은/.test(lo.revealed) && /게임 시작/.test(lo.revealed), '고른 뒤 공개 화면이 나옴');
  check(!/다시 고르기/.test(lo.revealed), '공개 화면에는 다시 고르기가 없음(재추첨 방지)');
  check(lo.chip !== hi.chip, '같은 A 버튼도 난수에 따라 다른 신분으로 이어짐: ' + lo.chip + ' / ' + hi.chip);
  await send('Page.navigate', { url }); await sleep(500);
  await ev('localStorage.clear()');
  await send('Page.navigate', { url }); await sleep(500);

  check(await ev("document.getElementById('scorebar').hidden"), '시작 전에는 점수 막대가 숨겨짐');
  await click('[data-act="start"][data-pick="A"]'); await click('[data-act="begin"]');
  check(await points() === '3,000', '중국어 능력자 시작 3,000');
  check(/중국어/.test(await ev("document.querySelector('.role-chip').textContent")), '능력자 신분 칩');

  // EP1 선택 → 확인 전 불변 → 확인 → 되돌리기
  await click('[data-act="pick"][data-c="c1"]');
  check(await points() === '3,000', '선택만 눌러서는 점수가 바뀌지 않음');
  await click('[data-act="confirm"]');
  check(await points() === '3,030', 'EP1 역관 +30 → 3,030');
  await click('[data-act="undo"]');
  check(await points() === '3,000', '되돌리기 → 3,000');
  await click('[data-act="pick"][data-c="c1"]'); await click('[data-act="confirm"]'); await click('[data-act="next"]');
  // EP2 시험 정답 → 영선사
  check(/EPISODE 2/.test(await ev("document.getElementById('progress-step').textContent")), 'EP2로 이동');
  await click('[data-act="pick"][data-c="c1"]'); await click('[data-act="confirm"]');
  check(await points() === '3,080', 'EP2 정답 +50 → 3,080');
  check(/영선사/.test(await ev("document.querySelector('.role-chip').textContent")), '신분 영선사');
  check(/신분이 .*영선사/.test(await ev("document.querySelector('.paper-note') ? document.querySelector('.paper-note').textContent : ''")), '신분 변경 안내가 나옴');
  await click('[data-act="next"]');
  // EP3 농업기술, EP4 상황(♥2)
  await click('[data-act="pick"][data-c="c1"]'); await click('[data-act="confirm"]'); await click('[data-act="next"]');
  await click('[data-act="situ"]');
  check(await ev("document.querySelectorAll('.scorebar .pw-row')[1].querySelectorAll('.is-on').length") === 2, 'EP4 하트 2칸');
  await click('[data-act="next"]');
  // 새로고침 후 유지
  await send('Page.navigate', { url }); await sleep(500);
  check(await points() === '3,060', '새로고침 후 점수 유지(3,060)');

  // 경로 A 끝까지(선택 맵). 장면 id는 페이지의 GapsinBoard에서 읽는다.
  const picks = { e1: 'c1', e2zh: 'c1', e3y: 'c1', e5: 'c1', e7: 'c2', e8mg: 'c1', e9mg: 'c1', e10mg: 'c1', e11: 'c1', e13mg: 'c1', e16mg: 'c1',
    e18on: 'c1', e20on: 'c1', e22on: 'c1', e24jb: 'c1', e26jb: 'c2', e29jb: 'c1', e30jb: 'c2', e32gg: 'c1', e34: 'c1', e36gg: 'c1', e38gg: 'c2' };
  for (let i = 0; i < 120; i += 1) {
    if (await ev("!!document.querySelector('.finish-panel')")) break;
    if (await ev("!!document.querySelector('[data-act=\"next\"]')")) { await click('[data-act="next"]'); continue; }
    if (await ev("!!document.querySelector('[data-act=\"situ\"]')")) { await click('[data-act="situ"]'); continue; }
    const id = await ev("(function(){var G=window.GapsinBoard;var s=JSON.parse(localStorage.getItem(G.STORAGE_KEY));var st=G.nextStep(G.derive(s.log));return st?st.id:''})()");
    if (!picks[id]) throw new Error('선택 누락 ' + id);
    await click('[data-act="pick"][data-c="' + picks[id] + '"]'); await click('[data-act="confirm"]');
  }
  check(await ev("!!document.querySelector('.finish-panel')"), '경로 A 끝까지 진행 → 게임 오버 화면');
  check(await points() === '3,420', '경로 A 최종 3,420');
  check(await ev("document.querySelectorAll('.scorebar .pw-row')[0].querySelectorAll('.is-on').length") === 5, '해골 9개여도 5칸까지만 채움');
  check(await ev("document.querySelectorAll('.scorebar .pw-row')[1].querySelectorAll('.is-on').length") === 5, '하트 6개여도 5칸까지만 채움');
  check(/FULL/.test(await ev("document.querySelector('.finish-panel .power-guide').textContent")), '💀 FULL 표시');
  check(!(await ev("!!document.querySelector('.trophy-box')")), '트로피는 버튼을 누르기 전에는 숨겨짐');
  await click('[data-act="trophy"]');
  check(/골드/.test(await ev("document.querySelector('.trophy-box').textContent")), '3,420점 → 골드 트로피');
  check(await ev("document.querySelectorAll('.sheet tbody tr:not(.chapter)').length") === 38, '점수표 38행');
  check(await ev("document.querySelectorAll('.sheet tr.chapter').length") === 4, 'CHAPTER 4구간');
  check(await ev("document.querySelectorAll('[data-term]').length") === 9 && await ev("document.querySelectorAll('[data-stance]').length") === 3, '한줄 정리 9칸·입장 정리 3칸');
  await ev("var t=document.querySelector('[data-term=\"t1\"]'); t.value='영선사'; t.dispatchEvent(new Event('input',{bubbles:true}))");
  await send('Page.navigate', { url }); await sleep(500);
  check(await ev("document.querySelector('[data-term=\"t1\"]').value") === '영선사', '한줄 정리 저장 유지');

  // 교사 안내 점수 가감
  await ev("document.getElementById('m-delta').value='-90'");
  await click('[data-act="manual"]');
  check(await points() === '3,330', '점수 가감 −90 → 3,330');

  // 일본어 능력자도 시작되고 다른 장면이 나옴
  await ev('localStorage.clear()');
  await send('Page.navigate', { url }); await sleep(500);
  await click('[data-act="start"][data-pick="B"]'); await click('[data-act="begin"]'); await click('[data-act="pick"][data-c="c2"]'); await click('[data-act="confirm"]'); await click('[data-act="next"]');
  check(/일본어 역관 시험/.test(await ev("document.getElementById('app').innerText")), '일본어 능력자는 일본어 역관 시험 장면');

  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 800, deviceScaleFactor: 2, mobile: true });
  await sleep(300);
  check(await ev('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'), '375px 폭 가로 스크롤 없음');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(process.env.SHOT || 'gapsin-shot.png', Buffer.from(shot.result.data, 'base64'));

  console.log(fails.length ? '\n' + fails.length + '개 실패' : '\n모두 통과');
  proc.kill();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
