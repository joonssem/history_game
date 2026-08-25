// =========================================================
// js/app.js - 초등 5학년 역사 포털 메인 애플리케이션
// =========================================================

let curriculumData = null;
let mudIndexData = [];
let currentUnitId = 1;
let currentActiveStoryId = 'story_paleolithic';

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    window.encyclopedia ? window.encyclopedia.initArtifacts() : Promise.resolve(),
    window.storyEngine ? window.storyEngine.loadStories() : Promise.resolve(),
    window.quizGame ? window.quizGame.loadQuizzes() : Promise.resolve(),
    window.miniGames ? window.miniGames.init() : Promise.resolve(),
    loadCurriculum(),
    loadMudIndex()
  ]);
  if (window.storyEngine) window.storyEngine.renderEpisodeList('story-episodes-container');
  switchUnitTab(1);
});

// 커리큘럼 데이터 로드
async function loadCurriculum() {
  try {
    const res = await fetch('data/history_curriculum_48_lessons.json');
    curriculumData = await res.json();
  } catch (e) {
    console.error('Failed to load history_curriculum_48_lessons.json', e);
  }
}

async function loadMudIndex() {
  try {
    const res = await fetch('data/mud/_index.json');
    const data = await res.json();
    mudIndexData = Array.isArray(data.muds) ? data.muds : [];
  } catch (e) {
    console.error('Failed to load data/mud/_index.json', e);
  }
}

function findIndexedMud(unitId, lesson) {
  const display = (lesson.lessonDisplay || '').split('(')[0];
  const lessonNumbers = display.match(/\d+/g)?.map(Number) || [];
  return mudIndexData.find(mud =>
    mud.tier === 'regular' &&
    mud.unitId === unitId &&
    mud.lessonNumbers.some(number => lessonNumbers.includes(number))
  );
}

// 단원 탭 전환
function switchUnitTab(unitId) {
  currentUnitId = unitId;
  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.backgroundColor = 'var(--card-bg)';
    btn.style.color = 'var(--text-main)';
  });

  const activeBtn = document.getElementById(`tab-unit-${unitId}`);
  if (activeBtn && curriculumData) {
    const unit = curriculumData.units.find(u => u.unitId === unitId);
    activeBtn.classList.add('active');
    activeBtn.style.backgroundColor = unit ? unit.themeColor : 'var(--accent-teal)';
    activeBtn.style.color = '#ffffff';
  }
  renderCurriculum(unitId);
}

// 커리큘럼 카드 렌더링
function renderCurriculum(unitId) {
  const container = document.getElementById('curriculum-container');
  if (!container || !curriculumData) return;

  const unit = curriculumData.units.find(u => u.unitId === unitId);
  if (!unit) return;

  let html = '';

  unit.sections.forEach((section) => {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 1.25rem; color: var(--text-main); margin-bottom: 14px; border-left: 4px solid ${unit.themeColor}; padding-left: 10px;">
          ${section.sectionTitle}
        </h2>
        <div class="card-grid">
    `;

    section.lessons.forEach(lesson => {
      const num = lesson.lessonNumber;
      const display = lesson.lessonDisplay || '';
      const title = lesson.title || '';
      const indexedMud = findIndexedMud(unitId, lesson);
      let btnHtml = '';

      // _index.json 기반 Regular MUD 매핑
      if (indexedMud) {
        btnHtml = `<button onclick="MudEngine.openMUD('${indexedMud.mudId}')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> ${indexedMud.title}</button>`;
      // 레거시 조건 매핑: 인덱스에 없는 차시의 예비 경로
      } else if (num === 2 || title.includes('구석기')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_paleolithic')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🪨 구석기 생존 MUD</button>`;
      } else if (num === 3 || title.includes('신석기')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_neolithic')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🏺 신석기 빗살무늬 MUD</button>`;
      } else if (num === 4 || num === 5 || title.includes('청동기')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_bronze_age')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🗿 청동기 고인돌 MUD</button>`;
      } else if (num === 6 || title.includes('고조선')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_gojoseon')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 📜 고조선 8조법 MUD</button>`;
      } else if (num === 7 || num === 8 || title.includes('성립과 발전') || (unitId === 1 && display.includes('7~8차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_three_kingdoms')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> ⚔️ 삼국 한강 쟁탈전 MUD</button>`;
      } else if (num === 9 || num === 10 || (title.includes('생활 모습') && unitId === 1 && (num === 9 || num === 10 || display.includes('9~10차시')))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_three_kingdoms_life')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🎨 고분 벽화 탐정 MUD</button>`;
      } else if (unitId === 1 && (num === 11 || title.includes('통일신라'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_silla')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-gem"></i> 🏛️ 통일신라와 불국사 MUD</button>`;
      } else if (unitId === 1 && (num === 12 || title.includes('발해'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_balhae')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-feather-alt"></i> 🦅 해동성국 발해 MUD</button>`;
      } else if (num === 13 || title.includes('고려의 건국') || title.includes('후삼국 통일')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_goryeo_founding')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 👑 왕건의 고려 건국 MUD</button>`;
      } else if (num === 14 || title.includes('고려의 생활') || title.includes('고려 사회')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_goryeo_society')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 📜 고려 사회 탐정 MUD</button>`;
      } else if (unitId === 1 && (num === 15 || num === 16 || title.includes('주변 나라') || title.includes('거란') || display.includes('15~16차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_goryeo_war')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-shield-alt"></i> ⚔️ 서희와 강감찬 MUD</button>`;
      } else if (unitId === 1 && (num === 17 || num === 18 || title.includes('고려의 문화') || title.includes('대장경') || display.includes('17~18차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_goryeo_culture')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-book"></i> 📜 팔만대장경과 벽란도 MUD</button>`;
      }
      // 2단원 MUD 매핑
      else if (unitId === 2 && (num === 2 || num === 3 || num === 22 || num === 23 || title.includes('조선의 건국') || title.includes('한양') || display.includes('2~3차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_founding')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🏛️ 한양 도읍 설계 MUD</button>`;
      } else if (unitId === 2 && (num === 4 || num === 5 || num === 24 || num === 25 || title.includes('세종') || title.includes('과학') || title.includes('유교 질서') || display.includes('4~5차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_sejong')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 👑 세종대왕 과학 발전 MUD</button>`;
      } else if (unitId === 2 && (num === 6 || title.includes('신분') || title.includes('발전에 따른 생활 모습'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_status')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-id-card"></i> 📜 조선 4대 신분제 MUD</button>`;
      } else if (unitId === 2 && (num === 7 || title.includes('주변 나라들의 관계') || title.includes('사대교린') || title.includes('병자호란'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_diplomacy')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-mountain"></i> ⚔️ 사대교린과 남한산성 MUD</button>`;
      } else if (num === 27 || title.includes('명량') || title.includes('임진왜란과 수군')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_myeongnyang')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-ship"></i> ⚔️ 명량해전 MUD 플레이</button>`;
      } else if (unitId === 2 && (num === 8 || num === 9 || num === 28 || title.includes('조선 후기 경제') || title.includes('모내기') || title.includes('경제적 변화'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_economy')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 💰 조선 후기 경제 MUD</button>`;
      } else if (num === 29 || title.includes('실학') || title.includes('새로운 생각') || title.includes('서학')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_silhak')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🌍 실학자 탐구 MUD</button>`;
      } else if (unitId === 2 && (num === 10 || title.includes('서민 문화') || title.includes('풍속화') || title.includes('탈춤'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_folk')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-theater-masks"></i> 🎭 서민 문화와 탈춤 MUD</button>`;
      } else if (unitId === 2 && (num === 11 || num === 12 || title.includes('개항') || title.includes('근대') || display.includes('11~12차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_modern_open')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-subway"></i> 🚂 개항과 근대 문물 MUD</button>`;
      }
      // 3단원 MUD 매핑
      else if (unitId === 3 && (num === 2 || title.includes('나라를 지키려는') || title.includes('의병') || title.includes('안중근'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_independence_army')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-crosshairs"></i> 🇰🇷 안중근과 항일 의병 MUD</button>`;
      } else if (unitId === 3 && (num === 3 || title.includes('고통과 저항') || title.includes('무단 통치') || title.includes('토지 조사'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_japanese_rule_1')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-balance-scale"></i> ⛓️ 1910년대 무단 통치 MUD</button>`;
      } else if (unitId === 3 && (num === 4 || num === 5 || num === 38 || num === 39 || title.includes('3·1') || title.includes('임시 정부') || title.includes('민족 운동') || display.includes('4차시') || display.includes('5차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_independence')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🇰🇷 3·1 운동과 임시정부 MUD</button>`;
      } else if (unitId === 3 && (num === 6 || num === 7 || title.includes('식민 통치 시기 달라진') || title.includes('말살') || title.includes('조선어학회') || display.includes('6~7차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_japanese_rule_2')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-spell-check"></i> 📚 민족 말살과 한글 수호 MUD</button>`;
      } else if (unitId === 3 && (num === 8 || num === 9 || num === 42 || num === 43 || title.includes('8·15 광복') || title.includes('정부 수립') || display.includes('8~9차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_gwangbok')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🕊️ 8·15 광복과 정부 수립 MUD</button>`;
      } else if (unitId === 3 && (num === 10 || num === 11 || num === 44 || num === 45 || (title.includes('6·25') && !title.includes('이후')) || display.includes('10~11차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_korean_war')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🪖 6·25 전쟁과 조국 수호 MUD</button>`;
      } else if (unitId === 3 && (num === 12 || num === 46 || title.includes('전쟁 이후') || title.includes('피난민') || display.includes('12차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_post_war')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-hand-holding-heart"></i> 🕊️ 전후 피난민과 재건 MUD</button>`;
      }
      // 골든벨 퀴즈
      else if (num === 20 || num === 34 || num === 48 || title.includes('정리') || title.includes('골든벨')) {
        btnHtml = `<button onclick="openQuizHub(${unitId})" class="btn" style="background-color: ${lesson.color.hex}; color: #1F2937 !important; font-weight: 700;"><i class="fas fa-bolt"></i> ${lesson.title} Quiz</button>`;
      } else if (lesson.mudPoint) {
        btnHtml = `<button onclick="alert('[${lesson.title}] MUD 퀘스트 준비 중입니다!')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> ${lesson.mudPoint} 플레이</button>`;
      } else {
        btnHtml = `<button class="btn disabled" disabled><i class="fas fa-book-open"></i> 교과서 탐구 차시</button>`;
      }

      html += `
        <article class="card" style="border-top: 4px solid ${lesson.color.hex};">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="chasi-badge" style="background-color: ${lesson.color.hex}; color: #FFFFFF;">
                ${lesson.lessonDisplay}
              </span>
              <span style="font-size: 0.8rem; color: #776F66; font-weight: 500;">
                ${lesson.pages}
              </span>
            </div>
            <h2 style="border-left: 3px solid ${lesson.color.hex};">${lesson.title}</h2>
            <p>💡 ${lesson.keyConcepts}</p>
          </div>
          <div style="margin-top: 10px;">
            ${btnHtml}
          </div>
        </article>
      `;
    });

    html += `
        </div>
      `;

      // 1단원 선사시대 심화 배너 (1~6차시 완료 시점)
      if (unitId === 1 && (section.sectionTitle.includes('선사') || section.sectionTitle.includes('나라의 등장') || section.sectionTitle.includes('고조선'))) {
        html += `
          <div style="margin-top: 15px; background: linear-gradient(135deg, #3E2723, #5D4037); border-radius: 12px; padding: 18px 20px; color: #FFFFFF; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #D7CCC8;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display: inline-block; background: #FFB300; color: #212121; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px;">
                👑 1단원 선사 시대 심화 Deep-dive MUD (30분+ 롤플레이)
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px; color: #FFFFFF;">군장의 결단: 고인돌 마을에서 고조선까지</h3>
              <p style="font-size: 0.85rem; color: #D7CCC8; margin: 0;">청동기 군장에서 고조선의 왕으로! 다층 분기와 다중 엔딩의 역사적 대서사시를 체험하세요.</p>
            </div>
            <button onclick="MudEngine.openMUD('deep_prehistoric')" class="btn" style="width: auto; background: #FFC107; color: #212121; font-weight: 800; padding: 12px 20px; font-size: 0.95rem; border: none; cursor: pointer;">
              <i class="fas fa-crown"></i> 선사 심화 플레이 ➔
            </button>
          </div>
        `;
      }

      // 1단원 삼국 통일 & 발해 심화 배너 (7~12차시 완료 시점)
      if (unitId === 1 && (section.sectionTitle.includes('고대') || section.sectionTitle.includes('통일') || section.sectionTitle.includes('삼국') || section.sectionTitle.includes('발해') || section.sectionTitle.includes('남북국'))) {
        html += `
          <div style="margin-top: 15px; background: linear-gradient(135deg, #1A252F, #2C3E50); border-radius: 12px; padding: 18px 20px; color: #FFFFFF; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #5D6D7E;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display: inline-block; background: #E74C3C; color: #FFFFFF; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px;">
                👑 1단원 삼국 통일·남북국 심화 Deep-dive MUD (30분+ 롤플레이)
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px; color: #FFFFFF;">삼국 통일의 대서사시: 화랑의 맹세와 발해의 건국</h3>
              <p style="font-size: 0.85rem; color: #BDC3C7; margin: 0;">황산벌에서 매소성·기벌포 해전, 그리고 대조영의 발해 건국까지! 삼국의 운명을 건 대결단을 내리세요.</p>
            </div>
            <button onclick="MudEngine.openMUD('deep_three_kingdoms')" class="btn" style="width: auto; background: #E74C3C; color: #FFFFFF; font-weight: 800; padding: 12px 20px; font-size: 0.95rem; border: none; cursor: pointer;">
              <i class="fas fa-horse-head"></i> 삼국 심화 플레이 ➔
            </button>
          </div>
        `;
      }

      // 2단원 조선 시대 심화 배너 (조선 후기/실학 완료 시점)
      if (unitId === 2 && section.sectionTitle.includes('조선 후기')) {
        html += `
          <div style="margin-top: 15px; background: linear-gradient(135deg, #0F2027, #203A43, #2C5364); border-radius: 12px; padding: 18px 20px; color: #FFFFFF; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #4CA1AF;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display: inline-block; background: #00ADB5; color: #FFFFFF; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px;">
                👑 2단원 조선 시대 심화 Deep-dive MUD (30분+ 롤플레이)
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px; color: #FFFFFF;">조선 500년의 붓: 사관의 기록과 실학의 꿈</h3>
              <p style="font-size: 0.85rem; color: #ECEFF1; margin: 0;">정도전의 한양 설계부터 훈민정음, 임진왜란의 위기, 수원 화성과 실학까지! 역사를 기록하고 이끄는 사관이 되세요.</p>
            </div>
            <button onclick="MudEngine.openMUD('deep_joseon')" class="btn" style="width: auto; background: #00ADB5; color: #FFFFFF; font-weight: 800; padding: 12px 20px; font-size: 0.95rem; border: none; cursor: pointer;">
              <i class="fas fa-scroll"></i> 조선 심화 플레이 ➔
            </button>
          </div>
        `;
      }

      // 3단원 근현대사 심화 배너 (민주화와 경제 발전 완료 시점)
      if (unitId === 3 && (section.sectionTitle.includes('8·15') || section.sectionTitle.includes('전쟁'))) {
        html += `
          <div style="margin-top: 15px; background: linear-gradient(135deg, #0A192F, #0047A0); border-radius: 12px; padding: 18px 20px; color: #FFFFFF; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2px solid #CD2E3A;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display: inline-block; background: #CD2E3A; color: #FFFFFF; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px;">
                👑 3단원 근현대사 심화 Deep-dive MUD (30분+ 롤플레이)
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 4px; color: #FFFFFF;">독립과 민주의 횃불: 잃어버린 빛을 찾아서</h3>
              <p style="font-size: 0.85rem; color: #E0E0E0; margin: 0;">3·1 만세 운동에서 한국광복군, 6·25의 시련, 4·19와 5·18, 6월 항쟁까지! 대한민국을 일군 시민의 여정을 체험하세요.</p>
            </div>
            <button onclick="MudEngine.openMUD('deep_modern')" class="btn" style="width: auto; background: #CD2E3A; color: #FFFFFF; font-weight: 800; padding: 12px 20px; font-size: 0.95rem; border: none; cursor: pointer;">
              <i class="fas fa-flag"></i> 근현대사 심화 플레이 ➔
            </button>
          </div>
        `;
      }

      html += `
      </div>
    `;
  });

  container.innerHTML = html;
}

// 메인 포털 뷰로 돌아가기
function showPortalView() {
  document.getElementById('view-portal').style.display = 'block';
  document.getElementById('view-myeongnyang').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 골든벨 퀴즈 시스템
// ==========================================
let quizUnitTarget = 1;

function openQuizHub(unitId = 1) {
  quizUnitTarget = unitId || currentUnitId || 1;
  document.getElementById('view-quiz-modal').style.display = 'flex';
  switchQuizUnit(quizUnitTarget);
}

function switchQuizUnit(unitId) {
  quizUnitTarget = unitId;
  document.getElementById('quiz-intro-view').style.display = 'block';
  document.getElementById('quiz-play-view').style.display = 'none';
  document.getElementById('quiz-result-view').style.display = 'none';

  [1, 2, 3].forEach(id => {
    const tab = document.getElementById(`quiz-tab-${id}`);
    if (tab) {
      if (id === unitId) {
        tab.style.background = id === 1 ? '#2D6A4F' : id === 2 ? '#8A3B29' : '#1D4ED8';
        tab.style.color = '#FFFFFF';
      } else {
        tab.style.background = 'var(--card-sub)';
        tab.style.color = 'var(--text-main)';
      }
    }
  });

  const title = document.getElementById('quiz-modal-title');
  const desc = document.getElementById('quiz-modal-desc');
  if (unitId === 3) {
    title.textContent = "3단원 총정리 스피드 골든벨 & 역사 탐정";
    title.style.color = "#1D4ED8";
    desc.textContent = "일제 침략과 저항(3·1운동), 8·15 광복, 최초의 5·10 총선거와 대한민국 정부 수립 퀴즈!";
  } else if (unitId === 2) {
    title.textContent = "2단원 총정리 스피드 골든벨 & 방탈출 암호";
    title.style.color = "#8A3B29";
    desc.textContent = "조선의 건국, 4대문 유교 덕목, 임진왜란·병자호란, 조선 후기 경제와 실학 퀴즈!";
  } else {
    title.textContent = "1단원 총정리 스피드 골든벨";
    title.style.color = "#2D6A4F";
    desc.textContent = "선사 시대, 삼국과 가야, 통일신라와 발해, 고려의 건국과 사회 총정리 퀴즈!";
  }
}

function startUnitQuiz() {
  if (!window.quizGame) {
    console.error('Quiz engine is unavailable.');
    return;
  }
  window.quizGame.startQuizGame(quizUnitTarget);
}

function closeQuizModal() {
  document.getElementById('view-quiz-modal').style.display = 'none';
}

function openEncyclopediaModal() {
  document.getElementById('view-encyclopedia-modal').style.display = 'flex';
  if (window.encyclopedia) window.encyclopedia.renderEncyclopedia('encyclopedia-content');
}

function closeEncyclopediaModal() {
  document.getElementById('view-encyclopedia-modal').style.display = 'none';
}
