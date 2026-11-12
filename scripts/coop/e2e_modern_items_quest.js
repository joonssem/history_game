// 숨은 근대 문물 찾기(modern-items-quest)를 headless Chrome으로 끝까지 조작해 확인한다.
// 사용: node scripts/coop/e2e_modern_items_quest.js <URL 예: http://localhost:8791/cooperative-mud/modern-items-quest/>
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const url = process.argv[2];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mi-e2e-'));
const port = 9336;
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, '--window-size=820,1180', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws; let id = 0; const pending = new Map();

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../cooperative-mud/modern-items-quest/quest.js'), 'utf8'), ctx);
const Q = ctx.window.ModernItemsQuest;

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
const text = () => ev("document.getElementById('app').innerText");
async function fill(key, val) { await ev("(()=>{const e=document.querySelector('input[data-k=\"" + key + "\"]');e.value=" + JSON.stringify(val) + ";e.dispatchEvent(new Event('input'))})()"); }
// 사진 위의 (x%, y%) 지점을 누른다.
async function tap(xp, yp) {
  await ev("(()=>{const r=document.getElementById('scene').getBoundingClientRect();document.getElementById('scene').dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+r.width*" + xp + "/100,clientY:r.top+r.height*" + yp + "/100}))})()");
}

async function load() { await send('Page.navigate', { url }); await sleep(600); }

async function run(size, seat) {
  const tag = size + '/' + seat + '번';
  console.log('== ' + tag);
  await load(); await ev('localStorage.clear()'); await load();
  check(/근대 문물/.test(await title()), tag + ' 소개');
  await click('#next');
  await click('[data-size="' + size + '"]');
  if (size !== 'solo') await click('[data-seat="' + seat + '"]');
  await click('#next');
  check(/설명 카드와 사진/.test(await title()), tag + ' 목록 화면');
  check(await ev("document.querySelector('[data-s=s1]').disabled") === true, tag + ' 사진은 이름을 모두 맞히기 전에 잠김');

  for (const c of Q.cards) {
    await click('[data-c="' + c.id + '"]');
    const t = await text();
    const owners = (Q.owners[String(size)] || {})[c.id] || [];
    const mine = size === 'solo' || owners.indexOf(seat) >= 0;
    const probe = c.clues[0].text.slice(0, 10);
    check(mine ? t.indexOf(probe) >= 0 : /친구가 읽을 수 있어요/.test(t) && t.indexOf(probe) < 0, tag + ' ' + c.id + (mine ? ' 설명 보임' : ' 설명 숨김'));
    check(c.blanks.every((b) => t.indexOf('초성 힌트: ' + b.initials) >= 0), tag + ' ' + c.id + ' 초성 힌트 표시');
    for (const b of c.blanks) await fill(b.key, '엉뚱');
    await click('#sc-check');
    check(/칸 중 0칸/.test(await ev("document.getElementById('sc-msg').innerText")), tag + ' ' + c.id + ' 오답 안내');
    await click('#sc-check');
    check(/💡/.test(await ev("document.getElementById('sc-msg').innerText")), tag + ' ' + c.id + ' 두 번째 오답에 힌트');
    for (const b of c.blanks) await fill(b.key, ' ' + b.accept[0] + ' ');
    await click('#sc-check');
    check(/맞아요!/.test(await ev("document.getElementById('sc-msg').innerText")), tag + ' ' + c.id + ' 통과');
    await click('#to-hub');
  }
  check(await ev("document.querySelector('[data-s=s1]').disabled") === false, tag + ' 이름을 모두 맞히면 사진 열림');

  for (const s of Q.scenes) {
    let n = 0;
    await click('[data-s="' + s.id + '"]');
    check(/사진 \d/.test(await title()), tag + ' ' + s.id + ' 사진 화면');
    // 이름을 고르지 않고 누르기
    await tap(50, 50);
    check(/먼저 골라/.test(await ev("document.getElementById('find-msg').innerText")), tag + ' ' + s.id + ' 이름 먼저 고르라는 안내');
    for (const it of s.items) {
      await click('.chip[data-i="' + it.key + '"]');
      // 빈 곳(왼쪽 위 모서리)을 두 번 눌러 오답 → 두 번째부터 점선 힌트
      await tap(1, 1); await tap(1, 1);
      check(/여기는 아니에요/.test(await ev("document.getElementById('find-msg').innerText")), tag + ' ' + it.name + ' 오답 안내');
      check(await ev("document.querySelectorAll('.ring.is-hint').length") === 1, tag + ' ' + it.name + ' 두 번 틀리면 점선 힌트');
      // 반지름의 1.1배 밖(1.5배 지점)은 오답, 1.1배 안은 정답
      await tap(it.x + it.r * 1.6, it.y);
      check(await ev("document.querySelectorAll('.ring.is-found').length") === n, tag + ' ' + it.name + ' 멀리 누르면 오답');
      await tap(it.x + it.r * 0.5, it.y);
      n += 1;
      check(await ev("document.querySelectorAll('.ring.is-found').length") === n && await ev("document.querySelectorAll('.chip.is-found').length") === n, tag + ' ' + it.name + ' 찾음 표시(' + n + '개)');
    }
    check(/모두 찾았어요/.test(await text()), tag + ' ' + s.id + ' 모두 찾음');
    await click('#back-hub');
  }
  check(await ev("!!document.getElementById('to-review')"), tag + ' 모두 찾으면 돌아보기 버튼');
  await click('#to-review');
  check(/돌아보기/.test(await title()), tag + ' 돌아보기 화면');
  await click('[data-p]');
  await click('#next');
  check(await ev("document.getElementById('err').hidden === false"), tag + ' 까닭 없으면 안내');
  await ev("(()=>{const e=document.getElementById('why');e.value='새 물건이 낯설었을 것 같아서';e.dispatchEvent(new Event('input'))})()");
  await click('#next');
  check(/모두 찾았어요/.test(await title()), tag + ' 완료 화면');
  await load();
  check(/모두 찾았어요/.test(await title()), tag + ' 새로고침 후 상태 유지');
}

(async () => {
  await connect();
  await send('Runtime.enable', {});
  await run('4', 2);
  await run('3', 1);
  await run('5', 5);
  await run('solo', 0);
  console.log('== 교사 확인 숫자(설명 열기, 사진 넘기기)');
  await load(); await ev('localStorage.clear()'); await load();
  await click('#next'); await click('[data-size="4"]'); await click('[data-seat="1"]'); await click('#next');
  await click('[data-c="c2"]');
  await ev("(()=>{document.getElementById('gate').value='1700';})()");
  await click('#gate-btn');
  check((await text()).indexOf(Q.cards[1].clues[0].text.slice(0, 10)) >= 0, '교사 숫자로 설명 열림');
  console.log(fails.length ? '\n실패 ' + fails.length + '건' : '\n모두 통과');
  proc.kill();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
