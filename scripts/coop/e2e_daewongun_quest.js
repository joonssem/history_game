// 번호별 비대칭 자료 보충 활동(daewongun-quest, ganghwa-quest)을 headless Chrome으로 끝까지 조작해 확인한다.
// 사용: node scripts/coop/e2e_daewongun_quest.js <URL 예: http://localhost:8791/cooperative-mud/daewongun-quest/> [폴더 daewongun-quest|ganghwa-quest]
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const url = process.argv[2];
const folder = process.argv[3] || 'daewongun-quest';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-e2e-'));
const port = 9334;
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--window-size=820,1180', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws; let id = 0; const pending = new Map();

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../cooperative-mud/' + folder + '/quest.js'), 'utf8'), ctx);
const Q = ctx.window.DaewongunQuest || ctx.window.GanghwaQuest;
const firstText = (c) => (c.lines ? c.lines[0][1] : c.sections[0].text).slice(0, 8);

async function connect() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const list = await (await fetch('http://127.0.0.1:' + port + '/json')).json();
      const page = list.find((t) => t.type === 'page');
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; }); break; }
    } catch (e) { /* retry */ }
    await sleep(200);
  }
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
}
function send(method, params) { return new Promise((res) => { id += 1; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); }); }
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) throw new Error('평가 실패: ' + expr + ' → ' + JSON.stringify(r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description));
  return r.result.result.value;
}
const fails = [];
const check = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const title = () => ev("document.querySelector('#app .screen-title') && document.querySelector('#app .screen-title').textContent");
const click = (sel) => ev("document.querySelector(" + JSON.stringify(sel) + ").click()");
async function fill(key, val) { await ev("(()=>{const e=document.querySelector('input[data-k=\"" + key + "\"]');e.value=" + JSON.stringify(val) + ";e.dispatchEvent(new Event('input'))})()"); }

async function load() { await send('Page.navigate', { url }); await sleep(500); }

async function run(size, seat) {
  const tag = size + '/' + seat + '번';
  console.log('== ' + tag);
  await load(); await ev('localStorage.clear()'); await load();
  check(/휴대전화|약속서/.test(await title()), tag + ' 소개');
  check(/교과서 밖/.test(await ev("document.getElementById('app').innerText")), tag + ' 교과서 밖 표시');
  await click('#next');
  await click(size === 'solo' ? '[data-size="solo"]' : '[data-size="' + size + '"]');
  if (size !== 'solo') await click('[data-seat="' + seat + '"]');
  await click('#next');
  check(/(대화|자료) 목록/.test(await title()), tag + ' 목록 화면');
  const locked = await ev("document.querySelector('[data-c=stele]').disabled");
  check(locked === true, tag + ' 척화비는 대화 4개 전에 잠김');

  for (const c of Q.chats) {
    await click('[data-c="' + c.id + '"]');
    const text = await ev("document.getElementById('app').innerText");
    const owners = (Q.owners[String(size)] || {})[c.id] || [];
    const mine = size === 'solo' || owners.indexOf(seat) >= 0;
    check(mine ? text.indexOf(firstText(c)) >= 0 : /친구가 읽을 수 있어요/.test(text) && text.indexOf(firstText(c)) < 0, tag + ' ' + c.id + (mine ? ' 내용 보임' : ' 내용 숨김'));
    check(c.blanks.every((b) => text.indexOf('초성 힌트: ' + b.initials) >= 0), tag + ' ' + c.id + ' 초성 힌트 표시');
    // 오답 → 안내, 정답 → 통과
    for (let i = 0; i < c.blanks.length; i += 1) await fill(c.id + '_' + i, '엉뚱');
    await click('#sc-check');
    check(/칸 중 0칸/.test(await ev("document.getElementById('sc-msg').innerText")), tag + ' ' + c.id + ' 오답 안내');
    await click('#sc-check');
    check(/💡/.test(await ev("document.getElementById('sc-msg').innerText")), tag + ' ' + c.id + ' 두 번째 오답에 힌트');
    await fill(c.id + '_0', c.blanks[0].accept[0]);
    await click('#sc-check');
    check(/1칸이 맞아요|칸 중 1칸/.test(await ev("document.getElementById('sc-msg').innerText")) || c.blanks.length === 1, tag + ' ' + c.id + ' 부분 정답');
    for (let i = 0; i < c.blanks.length; i += 1) await fill(c.id + '_' + i, ' ' + c.blanks[i].accept[0] + ' ');
    await click('#sc-check');
    check(/맞아요! 이 (대화|자료)/.test(await ev("document.getElementById('sc-msg').innerText")), tag + ' ' + c.id + ' 통과');
    await click('#to-hub');
  }
  check(await ev("document.querySelector('[data-c=stele]').disabled") === false, tag + ' 대화 4개 후 척화비 열림');
  await click('[data-c="stele"]');
  check(/척화비|조약 기록/.test(await title()), tag + ' 사건 조각 화면');
  // 틀린 순서
  for (const ln of Q.lanes) for (const ei of ln.shuffle) await click('.tile[data-l="' + ln.id + '"][data-e="' + ei + '"]');
  await click('#lane-check');
  check(/아직 맞지 않아요/.test(await ev("document.getElementById('lane-msg').innerText")), tag + ' 섞인 순서는 오답');
  await click('#lane-clear');
  for (const ln of Q.lanes) for (let e = 0; e < ln.events.length; e += 1) await click('.tile[data-l="' + ln.id + '"][data-e="' + e + '"]');
  await click('#lane-check');
  check(/순서가 맞아요/.test(await ev("document.getElementById('lane-msg').innerText")), tag + ' 바른 순서 통과');
  for (let i = 0; i < Q.stele.blanks.length; i += 1) await fill('stele_' + i, Q.stele.blanks[i].accept[0]);
  await click('#sc-check');
  check(/돌아보기/.test(await title()), tag + ' 돌아보기 화면');
  await click('[data-p]');
  await click('#next');
  check(/골라|써 주세요/.test(await ev("document.getElementById('err').hidden === false ? '써 주세요' : ''")), tag + ' 까닭 없으면 안내');
  await ev("(()=>{const e=document.getElementById('why');e.value='백성이 힘들었을 것 같아서';e.dispatchEvent(new Event('input'))})()");
  await click('#next');
  check(/모두 읽었어요|모두 풀었어요/.test(await title()), tag + ' 완료 화면');
  // 새로고침해도 유지
  await load();
  check(/모두 읽었어요|모두 풀었어요/.test(await title()), tag + ' 새로고침 후 상태 유지');
}

(async () => {
  await connect();
  await send('Runtime.enable', {});
  const errors = [];
  await run('4', 2);
  await run('3', 1);
  await run('5', 5);
  await run('solo', 0);
  // 교사 확인 숫자: 친구 대화 열기
  console.log('== 교사 확인 숫자');
  await load(); await ev('localStorage.clear()'); await load();
  await click('#next'); await click('[data-size="4"]'); await click('[data-seat="1"]'); await click('#next');
  await click('[data-c="c2"]');
  await ev("(()=>{const e=document.getElementById('gate');e.value='1700';})()");
  await click('#gate-btn');
  check(/가상 대화|지어 낸/.test(await ev("document.getElementById('app').innerText")), '교사 숫자로 내용 열림');
  console.log(fails.length ? '\n실패 ' + fails.length + '건' : '\n모두 통과');
  proc.kill();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
