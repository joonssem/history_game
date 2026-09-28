#!/usr/bin/env node
// =========================================================
// scripts/manual/site_regression.js — 포털·MUD 화면 수동 브라우저 회귀
//
// docs/plans/tasks_site_structure.md P1·P2와 Codex 검토
// (docs/audits/site_structure_p1_p2_review_20260928.md §6)의 핵심 흐름만 골랐다.
// CI 필수 검사가 아니라 수동 회귀용이다. 두세 번 안정적으로 쓴 뒤 CI 편입을 따로 정한다.
//
// 실행(저장소 루트에서):
//   npm install --no-save --prefix .tmp-playwright playwright-core
//   NODE_PATH=.tmp-playwright/node_modules node scripts/manual/site_regression.js
//   (PowerShell: $env:NODE_PATH=".tmp-playwright/node_modules"; node scripts/manual/site_regression.js)
//
// 브라우저는 PC에 설치된 Edge를 쓴다. Chrome을 쓰려면 BROWSER_CHANNEL=chrome.
// 배포 사이트를 검사하려면 BASE=https://joonssem.github.io/history_game/ (로컬 서버를 띄우지 않는다).
// 기대 결과: 마지막 줄 "N/N PASS", 종료 코드 0.
// =========================================================

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  console.error('playwright-core가 없습니다. 파일 머리말의 실행 방법대로 설치한 뒤 다시 실행하세요.');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..', '..');
const CHANNEL = process.env.BROWSER_CHANNEL || 'msedge';
const TABLET = { width: 1180, height: 820 };
const PHONE = { width: 390, height: 844 };
const DEV_TERMS = /MUD|Deep-dive|SIMULATOR|DB 없이|\[실패\]/g;

const results = [];
const check = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};

// 파이썬 http.server는 대기열이 작아 동시 요청 일부를 거부하므로 Node로 정적 서버를 띄운다.
function startServer() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(ROOT, urlPath);
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, (err, body) => {
      if (err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    });
  });
  server.listen(0, '127.0.0.1');
  return new Promise(resolve => server.on('listening', () => resolve(server)));
}

// 저장 상태 예시. 매 검사를 정해진 상태에서 시작한다.
const STORAGE_KEY = 'history_explorer_save_v1';
const FIXTURES = {
  empty: null,
  syntaxError: '{"unlockedArtifacts": [',
  wrongTypes: JSON.stringify({ unlockedArtifacts: 'art_1', completedMuds: { a: 1 }, seenArtifactComparisons: 7, quizHighScore: 'many' }),
};

async function newPage(browser, base, viewport, fixture = 'empty') {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(({ key, value }) => {
    if (sessionStorage.getItem('__fixture_applied')) return;
    sessionStorage.setItem('__fixture_applied', '1');
    if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
    // resize 리스너 등록 횟수를 센다(syncMudLayout 단일 등록 확인).
    window.__resizeListeners = 0;
    const original = window.addEventListener;
    window.addEventListener = function (type, ...rest) {
      if (type === 'resize') window.__resizeListeners += 1;
      return original.call(this, type, ...rest);
    };
  }, { key: STORAGE_KEY, value: FIXTURES[fixture] });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  const mudRequests = [];
  page.on('request', r => { if (/data\/mud\/regular_[^/]+\.json/.test(r.url())) mudRequests.push(r.url()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.MudEngine && document.querySelector('#curriculum-container').children.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  return { context, page, errors, mudRequests };
}

const text = (page, sel) => page.evaluate(s => document.querySelector(s)?.innerText || '', sel);
const display = (page, id) => page.evaluate(i => getComputedStyle(document.getElementById(i)).display, id);
const parentId = page => page.evaluate(() => document.getElementById('mn-interactive-card').parentElement.id);

async function openMud(page, mudId) {
  await page.evaluate(id => window.MudEngine.openMUD(id), mudId);
  await page.waitForTimeout(500);
}

async function completeMud(page, mudId) {
  await openMud(page, mudId);
  await page.evaluate(() => window.MudEngine.renderFinalReflection('end'));
  await page.waitForTimeout(200);
}

async function run(base) {
  const browser = await chromium.launch({ channel: CHANNEL, headless: true });

  // 1~2. 휴대폰 배치: 단서 카드가 선택지 위, 대체 버튼으로 선택지가 열림, 폭 변경 왕복
  {
    const { context, page, errors } = await newPage(browser, base, PHONE);
    await openMud(page, 'regular_goryeo_society');
    const order = await page.evaluate(() => document.getElementById('mn-interactive-card').getBoundingClientRect().top < document.getElementById('mn-choices-grid').getBoundingClientRect().top);
    check('[휴대폰] 단서 카드가 선택지보다 위', order && (await parentId(page)) !== 'mn-aside');
    for (let i = 0; i < 4; i += 1) {
      const buttons = page.locator('#mn-hotspot-actions button:enabled');
      if (!(await buttons.count())) break;
      await buttons.first().click();
      await page.waitForTimeout(120);
    }
    const unlocked = await page.evaluate(() => [...document.querySelectorAll('#mn-choices-grid button')].every(b => !b.disabled));
    check('[휴대폰] 대체 버튼으로 단서를 찾으면 선택지 열림·안내 숨김', unlocked && (await display(page, 'mn-choice-lock-hint')) === 'none');
    await openMud(page, 'regular_goryeo_culture');
    await page.setViewportSize(TABLET);
    await page.waitForTimeout(400);
    const wide = await parentId(page);
    await page.setViewportSize(PHONE);
    await page.waitForTimeout(400);
    const narrow = await parentId(page);
    const listeners = await page.evaluate(() => window.__resizeListeners);
    check('[탐구형] 폭 왕복 시 카드가 오른쪽 열↔선택지 위, resize 리스너 1개', wide === 'mn-aside' && narrow !== 'mn-aside' && listeners === 1, `${wide} → ${narrow}, listeners=${listeners}`);
    check('[휴대폰] 페이지 오류 0건', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // 3~8. 태블릿 흐름: 첫 로드 요청, 이어서 하기, 완료 화면, 비교 시작·복구, 연대기, 용어, 탭 키보드
  {
    const { context, page, errors, mudRequests } = await newPage(browser, base, TABLET);
    const unique = new Set(mudRequests.map(u => u.split('?')[0]));
    check('[첫 로드] 편별 JSON 중복 요청 없음', unique.size === mudRequests.length, `요청 ${mudRequests.length}, 고유 ${unique.size}`);

    const first = await text(page, '#continue-card');
    check('[이어서 하기] 첫 방문은 1번 편', first.includes('여기서 시작해요') && first.includes('0 / 28'));
    await completeMud(page, 'regular_paleolithic');
    check('[완료 화면] 시뮬레이터·빈 선택지 제목 숨김', (await display(page, 'mn-interactive-card')) === 'none' && (await display(page, 'mn-choice-title')) === 'none');
    const before = mudRequests.length;
    await page.evaluate(() => window.showPortalView());
    await page.waitForTimeout(600);
    const after = await text(page, '#continue-card');
    check('[이어서 하기] 완료 뒤 다음 편, 포털 복귀 시 추가 요청 없음', after.includes('이어서 하기') && after.includes('1 / 28') && mudRequests.length === before, `추가 요청 ${mudRequests.length - before}`);

    await completeMud(page, 'regular_neolithic');
    await page.evaluate(() => window.showPortalView());
    await page.waitForTimeout(400);
    await page.evaluate(() => window.switchExpandedActivityTab('compare'));
    const startButton = page.locator('#comparison-portal-list button').first();
    if (await startButton.count()) {
      await startButton.click();
      await page.waitForTimeout(500);
      const focused = await page.evaluate(() => document.activeElement?.id);
      const standalone = (await text(page, '#mn-header-tag')) === '유물·유적 비교' && (await display(page, 'mn-aside')) === 'none';
      check('[비교] 포털에서 시작: 비교용 화면·제목에 포커스', standalone && focused === 'mn-header-title', `focus=${focused}`);
      await openMud(page, 'regular_goryeo_war');
      const restored = (await display(page, 'mn-aside')) !== 'none' && (await display(page, 'mn-interactive-card')) !== 'none' && (await display(page, 'mn-character-card')) !== 'none';
      check('[비교] 다른 MUD를 열면 오른쪽 열·시뮬레이터·인물 복구', restored);
    } else {
      check('[비교] 유물 2개 뒤 열린 비교가 있어야 함', false);
    }

    await openMud(page, 'regular_goryeo_society');
    const hiddenBranches = await page.evaluate(() => [...document.querySelectorAll('#roadmap-grid > div')].filter(d => d.id.slice(8).includes('-')).every(d => getComputedStyle(d).display === 'none'));
    await page.evaluate(() => window.MudEngine.renderStage('1-1'));
    const shownBranch = await text(page, '#mn-node-1-1');
    check('[연대기] 오답 분기는 들어갔을 때만 "다시 생각하기"로', hiddenBranches && shownBranch.includes('다시 생각하기'));

    const mudTerms = (await text(page, '#view-myeongnyang')).match(DEV_TERMS) || [];
    await page.evaluate(() => window.showPortalView());
    await page.waitForTimeout(400);
    const portalTerms = (await text(page, '#view-portal')).match(DEV_TERMS) || [];
    check('[용어] 포털·MUD 화면에 개발 용어 없음', !mudTerms.length && !portalTerms.length, [...mudTerms, ...portalTerms].join(','));

    await page.focus('#activity-tab-story');
    await page.keyboard.press('ArrowRight');
    const afterRight = await page.evaluate(() => ({ focus: document.activeElement.id, selected: document.getElementById('activity-tab-minigame').getAttribute('aria-selected'), panel: getComputedStyle(document.getElementById('activity-panel-minigame')).display }));
    await page.keyboard.press('Home');
    const afterHome = await page.evaluate(() => ({ focus: document.activeElement.id, selected: document.getElementById('activity-tab-compare').getAttribute('aria-selected') }));
    check('[탭] 화살표·Home으로 탭 이동과 선택', afterRight.focus === 'activity-tab-minigame' && afterRight.selected === 'true' && afterRight.panel !== 'none' && afterHome.focus === 'activity-tab-compare' && afterHome.selected === 'true', JSON.stringify({ afterRight, afterHome }));

    const layout = await page.evaluate(() => {
      const nav = document.querySelector('.unit-nav').getBoundingClientRect();
      return { tabFits: document.getElementById('tab-unit-3').getBoundingClientRect().right <= nav.right + 1 };
    });
    check('[태블릿] 3단원 탭이 화면 안', layout.tabFits);
    check('[태블릿] 페이지 오류 0건', errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // 9. 깨진 저장 데이터에서도 포털이 그려짐
  for (const fixture of ['syntaxError', 'wrongTypes']) {
    const { context, page, errors } = await newPage(browser, base, TABLET, fixture);
    await page.evaluate(() => window.switchExpandedActivityTab('compare'));
    await page.waitForTimeout(300);
    const card = await text(page, '#continue-card');
    const rows = await page.evaluate(() => document.querySelectorAll('#comparison-portal-list > div').length);
    check(`[저장 데이터 ${fixture}] 이어서 하기·비교 목록이 예외 없이 표시`, card.includes('탐험 시작') && rows > 0 && errors.length === 0, errors.join(' | '));
    await context.close();
  }

  // 10. 용어 말풍선: HTML 조각이 글자로 새지 않음
  {
    const { context, page } = await newPage(browser, base, TABLET);
    const mudIds = await page.evaluate(async () => (await (await fetch('data/mud/_index.json')).json()).muds.map(m => m.mudId));
    const problems = [];
    let count = 0;
    for (const mudId of mudIds) {
      await openMud(page, mudId);
      const stages = await page.evaluate(() => Object.entries(window.MudEngine.currentMudData.stages).filter(([, s]) => (s.glossary || []).length).map(([k]) => k));
      for (const k of stages) {
        await page.evaluate(s => window.MudEngine.renderStage(s), k);
        const leaked = await page.evaluate(() => /style="|title="|<span/.test(document.getElementById('mn-story-content').innerText));
        count += 1;
        if (leaked) problems.push(`${mudId}:${k}`);
      }
    }
    check(`[용어 말풍선] ${count}개 단계에서 HTML 새어 나옴 없음`, problems.length === 0, problems.join(','));
    await context.close();
  }

  await browser.close();
}

(async () => {
  let server = null;
  let base = process.env.BASE;
  if (!base) {
    server = await startServer();
    base = `http://127.0.0.1:${server.address().port}/`;
  }
  console.log(`대상: ${base} (브라우저: ${CHANNEL})`);
  try {
    await run(base);
  } finally {
    if (server) server.close();
  }
  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} PASS`);
  process.exit(passed === results.length ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
