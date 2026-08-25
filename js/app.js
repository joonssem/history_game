// =========================================================
// js/app.js - 초등 5학년 역사 포털 메인 애플리케이션
// =========================================================

let curriculumData = null;
let currentUnitId = 1;
let currentActiveStoryId = 'story_paleolithic';

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    window.encyclopedia ? window.encyclopedia.initArtifacts() : Promise.resolve(),
    window.storyEngine ? window.storyEngine.loadStories() : Promise.resolve(),
    window.quizGame ? window.quizGame.loadQuizzes() : Promise.resolve(),
    window.miniGames ? window.miniGames.init() : Promise.resolve(),
    loadCurriculum()
  ]);
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
      let btnHtml = '';

      // 1단원 MUD 매핑
      if (num === 2 || title.includes('구석기')) {
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
      } else if (num === 13 || title.includes('고려의 건국') || title.includes('후삼국 통일')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_goryeo_founding')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 👑 왕건의 고려 건국 MUD</button>`;
      } else if (num === 14 || title.includes('고려의 생활') || title.includes('고려 사회')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_goryeo_society')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 📜 고려 사회 탐정 MUD</button>`;
      } 
      // 2단원 MUD 매핑
      else if (num === 22 || num === 23 || title.includes('조선의 건국') || title.includes('한양')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_founding')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🏛️ 한양 도읍 설계 MUD</button>`;
      } else if (num === 27 || title.includes('명량') || title.includes('임진왜란과 수군')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_myeongnyang')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-ship"></i> ⚔️ 명량해전 MUD 플레이</button>`;
      } else if (num === 28 || title.includes('조선 후기 경제') || title.includes('모내기') || title.includes('농업과 상업')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_economy')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 💰 조선 후기 경제 MUD</button>`;
      } else if (num === 29 || title.includes('실학') || title.includes('새로운 생각') || title.includes('서학')) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_joseon_silhak')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🌍 실학자 탐구 MUD</button>`;
      }
      // 3단원 MUD 매핑
      else if (num === 42 || num === 43 || title.includes('8·15 광복') || title.includes('정부 수립') || (unitId === 3 && display.includes('8~9차시'))) {
        btnHtml = `<button onclick="MudEngine.openMUD('regular_gwangbok')" class="btn" style="background-color: ${lesson.color.hex};"><i class="fas fa-play"></i> 🕊️ 8·15 광복과 정부 수립 MUD</button>`;
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
      if (unitId === 1 && (section.sectionTitle.includes('통일') || section.sectionTitle.includes('삼국') || section.sectionTitle.includes('발해') || section.sectionTitle.includes('남북국'))) {
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
  document.getElementById('quiz-intro-view').style.display = 'none';
  document.getElementById('quiz-play-view').style.display = 'block';

  let quizzes = [];
  if (quizUnitTarget === 3) {
    quizzes = [
      {
        q: "1. [초성 퀴즈] 1919년 3월 1일 일제의 무단통치에 맞서 전국적으로 일어난 민족 최대의 평화 만세 운동은? (ㅅ·ㅇ ㅇㄷ)",
        options: ["3·1 운동", "6·10 만세운동", "광주학생항일운동", "물산장려운동"],
        ans: 0,
        exp: "1919년 3·1 운동은 전 민족이 태극기를 들고 '대한 독립 만세'를 외친 평화 만세 운동으로, 대한민국 임시정부 수립의 계기가 되었습니다."
      },
      {
        q: "2. [초성 퀴즈] 1948년 5월 10일 만 21세 이상 모든 국민에게 차별 없이 1표씩 주어진 우리 역사 최초의 민주 선거는? (ㅇ·ㅇ ㅊㅅㄱ)",
        options: ["3·15 부정선거", "5·10 총선거", "제헌 국회 선거", "대통령 직선제"],
        ans: 1,
        exp: "5·10 총선거는 성별·재산·신분 차별 없이 모든 국민이 참여한 우리 역사 최초의 보통·평등·직접·비밀 민주 선거입니다."
      },
      {
        q: "3. 1909년 중국 하얼빈 역에서 대한제국 침략의 원흉인 이토 히로부미를 처단한 독립운동가는?",
        options: ["윤봉길 의사", "이봉창 의사", "안중근 의사", "김구 선생"],
        ans: 2,
        exp: "안중근 의사는 하얼빈 역에서 이토 히로부미를 사살하여 동양 평화와 대한제국의 자주독립 의지를 세계에 알렸습니다."
      },
      {
        q: "4. [역사 헌법] 1948년 8월 15일 수립을 선포한 우리 민족의 자주독립 국가이자 현재 우리나라의 정식 국호는?",
        options: ["대한제국", "고려민국", "조선민주국", "대한민국"],
        ans: 3,
        exp: "1948년 8월 15일, 3·1 운동과 대한민국 임시정부의 법통을 계승한 자주독립 민주공화국 '대한민국' 정부가 공식 수립되었습니다."
      }
    ];
  } else if (quizUnitTarget === 2) {
    quizzes = [
      {
        q: "1. [초성 퀴즈] 조선 한양 도성의 동대문으로 '어짊(仁)'을 본받고자 지은 성문의 이름은? (ㅎㅇㅈㅁ)",
        options: ["흥인지문", "돈의문", "숭례문", "숙정문"],
        ans: 0,
        exp: "동대문은 어짊(仁)을 흥하게 한다는 뜻의 '흥인지문'입니다."
      },
      {
        q: "2. [초성 퀴즈] 조선 후기 모판에서 벼를 길러 논에 옮겨 심어 쌀 생산량을 크게 늘린 농사법은? (ㅁㄴㄱㅂ)",
        options: ["직파법", "모내기법(이앙법)", "화전농법", "윤작법"],
        ans: 1,
        exp: "모내기법(이앙법)으로 노동력을 줄이고 쌀 생산량을 획기적으로 늘렸습니다."
      },
      {
        q: "3. 조선 후기 전국 장시에서 널리 유통된 국가 화폐(엽전)는?",
        options: ["건원중보", "해동통보", "상평통보", "당백전"],
        ans: 2,
        exp: "숙종 때 주조된 상평통보가 전국적으로 널리 사용되었습니다."
      },
      {
        q: "4. [방탈출 암호] '사람이 곧 하늘이다(인내천)'라는 인간 평등 사상을 내세운 조선 후기 민족 종교는?",
        options: ["성리학", "불교", "동학", "도교"],
        ans: 2,
        exp: "최제우가 창시한 동학은 모든 사람이 하늘처럼 존귀하다는 평등사상을 전파했습니다."
      }
    ];
  } else {
    quizzes = [
      {
        q: "1. [초성 퀴즈] 신석기 시대 사람들이 강가나 바닷가 모래밭에 꽂아두기 위해 바닥을 뾰족하게 빚은 토기는? (ㅂㅅㅁㄴ ㅌㄱ)",
        options: ["빗살무늬 토기", "민무늬 토기", "미송리식 토기", "상감청자"],
        ans: 0,
        exp: "신석기 시대 사람들은 모래밭에 꽂아두기 편하게 바닥이 뾰족한 빗살무늬 토기를 사용했습니다."
      },
      {
        q: "2. [초성 퀴즈] 고려 시대 과거 시험에 합격한 사람에게 국왕이 수여한 붉은색 합격증은? (ㅎㅍ)",
        options: ["호패", "홍패", "마패", "교지"],
        ans: 1,
        exp: "고려는 과거 시험 합격자에게 붉은 종이에 쓴 '홍패'를 주어 능력을 우대했습니다."
      },
      {
        q: "3. 태조 왕건이 후대 왕들에게 남긴 열 가지 가르침(유훈)은 무엇인가요?",
        options: ["경국대전", "삼강오륜", "훈요 10조", "홍익인간"],
        ans: 2,
        exp: "왕건은 불교 숭상, 서경 중시, 거란 경계 등의 내용을 담은 훈요 10조를 남겼습니다."
      },
      {
        q: "4. 고려 시대 판관 '손변의 재판'을 통해 알 수 있는 고려 사회의 가족 모습은?",
        options: ["아들만 재산을 상속받았다", "아들과 딸이 재산을 똑같이 나누어 가졌다", "여성은 재혼할 수 없었다", "딸은 제사를 지낼 수 없었다"],
        ans: 1,
        exp: "고려는 아들과 딸이 균등하게 유산을 상속받고, 제사도 돌아가며 지냈습니다."
      }
    ];
  }

  let qIdx = 0;
  let score = 0;

  function showQ() {
    if (qIdx >= quizzes.length) {
      document.getElementById('quiz-play-view').style.display = 'none';
      document.getElementById('quiz-result-view').style.display = 'block';
      document.getElementById('quiz-result-view').innerHTML = `
        <div style="text-align: center; padding: 20px 0;">
          <span style="font-size: 3rem;">🏆</span>
          <h3 style="font-size: 1.35rem; color: var(--accent-red); margin: 10px 0;">${quizUnitTarget}단원 골든벨 퀴즈 완료!</h3>
          <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 20px;">총 ${quizzes.length}문제 중 <span style="color: #10B981; font-size: 1.3rem;">${score}</span>문제 정답!</p>
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button onclick="switchQuizUnit(${quizUnitTarget})" class="btn secondary" style="width: auto;">🔄 다시 도전</button>
            <button onclick="closeQuizModal()" class="btn" style="width: auto; background-color: var(--accent-teal);">확인</button>
          </div>
        </div>
      `;
      return;
    }

    const cur = quizzes[qIdx];
    let optHtml = '';
    cur.options.forEach((opt, idx) => {
      optHtml += `
        <button onclick="handleQuizAns(${idx})" class="btn secondary" style="margin-bottom: 8px; text-align: left; justify-content: flex-start; padding: 10px 14px; font-size: 0.95rem;">
          <b style="color: var(--accent-red); margin-right: 6px;">${idx + 1}.</b> ${opt}
        </button>
      `;
    });

    document.getElementById('quiz-play-view').innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--accent-red); font-weight: bold; margin-bottom: 8px;">
          <span>${quizUnitTarget}단원 골든벨</span>
          <span>문제 ${qIdx + 1} / ${quizzes.length}</span>
        </div>
        <h4 style="font-size: 1.05rem; font-weight: bold; margin-bottom: 16px; color: var(--text-main); line-height: 1.4;">${cur.q}</h4>
        <div style="display: flex; flex-direction: column; gap: 4px;">${optHtml}</div>
      </div>
    `;
  }

  window.handleQuizAns = (selected) => {
    const cur = quizzes[qIdx];
    if (selected === cur.ans) {
      score++;
      if (window.sounds) window.sounds.playCorrect();
      alert('정답입니다! 👏\n\n' + cur.exp);
    } else {
      if (window.sounds) window.sounds.playWrong();
      alert('아쉽네요! 정답은 [' + cur.options[cur.ans] + '] 입니다.\n\n' + cur.exp);
    }
    qIdx++;
    showQ();
  };

  showQ();
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
