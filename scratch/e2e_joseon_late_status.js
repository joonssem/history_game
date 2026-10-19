// 조선 후기 경제·신분 협동 활동을 실제 Chrome(헤드리스, CDP)으로 끝까지 조작해 확인한다.
// 사용: node scratch/e2e_joseon_late_status.js <활동 URL 예: http://localhost:8791/cooperative-mud/joseon-late-economy/>
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = process.argv[2];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'coop-e2e-'));
const port = 9333;
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--window-size=820,1180', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
let id = 0;
const pending = new Map();

async function connect() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + port + '/json')).json();
      const page = list.find((t) => t.type === 'page');
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
        break;
      }
    } catch (e) { /* 다시 시도 */ }
    await sleep(200);
  }
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  };
}

function send(method, params) {
  return new Promise((res) => {
    id += 1;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) throw new Error('평가 실패: ' + expr + ' → ' + JSON.stringify(r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description));
  return r.result.result.value;
}

const fails = [];
const check = (cond, msg) => { if (!cond) { fails.push(msg); console.log('  FAIL ' + msg); } };
const visible = () => ev("[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id).join()");

async function load() {
  await send('Page.navigate', { url });
  await sleep(500);
}

async function run(size, mode, seat, opts) {
  const tag = size + '인/' + (mode === '10' ? '13분' : '5분') + '/' + seat + '번';
  await load();
  await ev('localStorage.clear()');
  await load();
  await ev("document.getElementById('start-button').click()");
  await ev("document.querySelectorAll('.team-button')[0].click()");
  await ev("[...document.querySelectorAll('.team-size-button')].find(b=>b.textContent.trim().startsWith('" + size + "')).click()");
  await ev("document.querySelectorAll('.seat-button')[" + (seat - 1) + "].click()");
  await ev("document.querySelector('.mode-button[data-mode=\"" + mode + "\"]').click()");
  await ev("document.getElementById('begin-button').click()");
  check(await visible() === 'screen-role', tag + ' 역할 화면');
  const card = await ev("document.getElementById('role-card').innerText");
  check(/핵심어/.test(card) && /근거/.test(card), tag + ' 카드에 핵심어·근거');
  check(!/신분제가 흔들/.test(card), tag + ' 역할 카드에 결론 문장이 없음');
  await ev("document.getElementById('role-continue-button').click()");
  const choices = await ev("document.querySelectorAll('#first-choice-grid .choice-button').length");
  check(choices === 3, tag + ' 처음 생각 선택지 3개');
  await ev("document.querySelectorAll('#first-choice-grid .choice-button')[" + (opts.firstIdx || 0) + "].click()");
  check(await visible() === 'screen-share', tag + ' 자료 나누기 화면');
  const share = await ev("document.getElementById('share-card').innerText");
  check(/쪽/.test(share), tag + ' 나누기 문장에 근거 쪽수');
  await ev("document.getElementById('share-button').click()");
  check(await visible() === 'screen-reveal', tag + ' 공통 자료 화면');
  const clueShown = await ev("!document.getElementById('missing-role-clue').hidden");
  check(clueShown === (size === 3), tag + ' 3인 추가 자료 표시=' + clueShown);
  await ev("document.getElementById('keep-button').click()");
  if (mode === '10') {
    check(await visible() === 'screen-second', tag + ' 가상 이야기 화면');
    check(/실제 인물이 아닙니다/.test(await ev("document.getElementById('screen-second').innerText")), tag + ' 가상 표시');
    await ev("document.getElementById('second-continue-button').click()");
  } else {
    check(await visible() === 'screen-statement', tag + ' 5분형은 가상 이야기 생략');
  }
  check(await visible() === 'screen-statement', tag + ' 설명 만들기 화면');
  const nSel = await ev("document.querySelectorAll('#statement-builder select').length");
  check(nSel === 6, tag + ' 드롭다운 6칸(' + nSel + ')');
  for (const [k, v] of Object.entries(opts.pick || {})) {
    await ev("(()=>{const s=document.getElementById('statement-" + k + "');s.value='" + v + "';s.dispatchEvent(new Event('change'))})()");
  }
  await ev("document.getElementById('statement-save-button').click()");
  check(await visible() === 'screen-history', tag + ' 교과서 비교 화면');
  const trap = await ev("(()=>{const b=document.getElementById('trap-note');return b.hidden?'':b.innerText})()");
  check((trap.length > 0) === !!opts.expectTrap, tag + ' 함정 안내 표시=' + (trap.length > 0));
  const cmp = await ev("document.getElementById('compare-text').innerText");
  check(cmp.length > 20, tag + ' 비교 문구');
  if (opts.firstIdx === 2) check(/한 문장으로/.test(cmp), tag + ' C 선택 보류 문구');
  await ev("document.getElementById('finish-button').click()");
  check(await visible() === 'screen-finish', tag + ' 완료 화면');
  const fin = await ev("document.getElementById('screen-finish').innerText");
  check(/스티커 담벼락/.test(fin) && /95~97쪽/.test(fin), tag + ' 담벼락 안내');
  await ev("document.getElementById('reset-button').click()");
  check(await ev("localStorage.getItem('history_cooperative_joseon_late_economy_v02')") === null, tag + ' 기록 지우기');
  console.log('done ' + tag);
}

(async () => {
  await connect();
  await send('Page.enable');
  await send('Runtime.enable');
  for (const size of [3, 4, 5]) {
    for (const mode of ['10', '5']) {
      await run(size, mode, size, { firstIdx: size % 3, expectTrap: false });
    }
  }
  await run(4, '10', 1, { pick: { wealth: 'all-farmers' }, expectTrap: true });
  await run(4, '10', 2, { pick: { result: 'abolished' }, expectTrap: true });
  await load();
  await ev("localStorage.setItem('history_cooperative_joseon_late_economy_v01', JSON.stringify({scenarioId:'joseon-late-economy-v01',seat:2}))");
  await load();
  check(await ev("document.getElementById('screen-intro').hidden") === false, '옛 v01 기록이 있어도 소개 화면에서 시작');
  console.log(fails.length ? 'FAILED ' + fails.length : 'ALL OK');
  ws.close();
  proc.kill();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(2); });
