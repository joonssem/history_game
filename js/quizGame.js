/**
 * Quiz Game Engine
 * 초등 5학년 역사 스피드 골든벨 & 인터랙티브 퀴즈
 */
class QuizGame {
  constructor() {
    this.quizzes = [];
    this.currentList = [];
    this.currentIndex = 0;
    this.score = 0;
    this.timer = null;
    this.timeLeft = 15;
    this.maxTime = 15;
    this.userAnswers = [];
    this.unitId = null;
    this.answerLocked = false;
  }

  async loadQuizzes() {
    try {
      const res = await fetch('data/quizzes.json');
      this.quizzes = await res.json();
    } catch (e) {
      console.error('Failed to load quizzes.json', e);
    }
  }

  startQuizGame(unitId = null) {
    if (window.sounds) window.sounds.playClick();
    this.unitId = unitId;
    const unitNames = {
      1: ['고조선과 삼국', '통일신라와 발해', '고려 시대'],
      2: ['조선 시대', '조선 후기'],
      3: ['일제강점기 및 근현대']
    };
    const allowedUnits = unitNames[unitId];
    const filtered = allowedUnits
      ? this.quizzes.filter((quiz) => allowedUnits.includes(quiz.unit))
      : this.quizzes;
    this.currentList = [...(filtered.length ? filtered : this.quizzes)].sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = [];
    this.answerLocked = false;

    document.getElementById('quiz-intro-view').style.display = 'none';
    document.getElementById('quiz-result-view').style.display = 'none';
    document.getElementById('quiz-play-view').style.display = 'block';

    this.showQuestion();
  }

  showQuestion() {
    if (this.currentIndex >= this.currentList.length) {
      this.finishQuiz();
      return;
    }

    const q = this.currentList[this.currentIndex];
    this.timeLeft = this.maxTime;
    this.answerLocked = false;

    const playView = document.getElementById('quiz-play-view');
    const totalQ = this.currentList.length;

    playView.innerHTML = `
      <div>
        <!-- 상단 진행도 및 타이머 -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
          <span style="font-size: 0.78rem; font-weight: 700; background: var(--card-sub); color: var(--accent-teal); padding: 4px 12px; border-radius: 999px; border: 1px solid var(--border-color);">
            ${q.unit}
          </span>
          <span style="font-size: 0.8rem; font-weight: 700; color: #554D46;">
            문제 <strong style="color: var(--accent-red); font-size: 0.95rem;">${this.currentIndex + 1}</strong> / ${totalQ}
          </span>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-red); background: var(--card-sub); padding: 4px 12px; border-radius: 999px; border: 1px solid var(--border-color);">
            현재 점수: <span id="current-score-display">${this.score}</span>점
          </span>
        </div>

        <!-- 타이머 게이지 -->
        <div style="width: 100%; background: var(--card-sub); height: 8px; border-radius: 999px; overflow: hidden; margin-bottom: 18px; border: 1px solid var(--border-color);">
          <div id="quiz-timer-bar" style="background: var(--accent-red); height: 100%; border-radius: 999px; transition: width 1s linear; width: 100%;"></div>
        </div>

        <!-- 문제 내용 -->
        <div style="min-height: 100px; display: flex; align-items: center; justify-content: center; padding: 16px; background: var(--card-sub); border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 18px; text-align: center;">
          <h3 style="font-size: 1.08rem; font-weight: 800; color: var(--text-main); line-height: 1.6;">${q.question}</h3>
        </div>

        <!-- 선택지 영역 -->
        <div id="quiz-options" style="display: flex; flex-direction: column; gap: 10px;">
          ${
            q.type === 'ox'
              ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <button onclick="window.quizGame.handleAnswer(true)" class="btn" style="background-color: #2D6A4F; flex-direction: column; gap: 4px; padding: 22px 10px; font-size: 2rem;">
                <span>⭕</span>
                <span style="font-size: 0.82rem; font-weight: 700;">그렇다 (O)</span>
              </button>
              <button onclick="window.quizGame.handleAnswer(false)" class="btn" style="background-color: var(--accent-red); flex-direction: column; gap: 4px; padding: 22px 10px; font-size: 2rem;">
                <span>❌</span>
                <span style="font-size: 0.82rem; font-weight: 700;">아니다 (X)</span>
              </button>
            </div>
          `
              : q.options
                  .map(
                    (opt, i) => `
            <button onclick="window.quizGame.handleAnswer(${i})" class="btn secondary" style="justify-content: flex-start; text-align: left;">
              <span class="choice-marker choice-marker-${i % 3}" aria-hidden="true">${i + 1}</span>
              <span style="font-size: 0.92rem;">${opt}</span>
            </button>
          `
                  )
                  .join('')
          }
        </div>

        <!-- 실시간 피드백 모달/오버레이 -->
        <div id="quiz-feedback-box" style="display: none; margin-top: 20px; padding: 14px; border-radius: 12px; border: 1px solid;"></div>
      </div>
    `;

    this.startTimer();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    const bar = document.getElementById('quiz-timer-bar');

    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      const pct = (this.timeLeft / this.maxTime) * 100;
      if (bar) bar.style.width = `${pct}%`;

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.handleTimeout();
      }
    }, 1000);
  }

  handleTimeout() {
    this.handleAnswer(null, true);
  }

  handleAnswer(userAns, isTimeout = false) {
    if (this.answerLocked) return;
    this.answerLocked = true;
    if (this.timer) clearInterval(this.timer);
    const q = this.currentList[this.currentIndex];
    const isCorrect = !isTimeout && userAns === q.answer;

    if (isCorrect) {
      this.score += 10;
      if (window.sounds) window.sounds.playCorrect();
    } else {
      if (window.sounds) window.sounds.playWrong();
    }

    this.userAnswers.push({
      question: q,
      userAns,
      isCorrect,
      isTimeout
    });

    // 피드백 표시
    const optBox = document.getElementById('quiz-options');
    const fBox = document.getElementById('quiz-feedback-box');
    if (optBox) {
      optBox.style.pointerEvents = 'none';
      optBox.style.opacity = '0.5';
    }

    if (fBox) {
      fBox.style.display = 'block';
      fBox.style.background = isCorrect ? 'rgba(45, 106, 79, 0.12)' : 'rgba(138, 59, 41, 0.1)';
      fBox.style.borderColor = isCorrect ? '#2D6A4F' : 'var(--accent-red)';
      fBox.style.color = 'var(--text-main)';
      fBox.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="font-size: 1.4rem;">${isCorrect ? '🎉' : '💡'}</span>
          <div>
            <h4 style="font-weight: 800; font-size: 0.98rem; margin-bottom: 4px;">${isCorrect ? '정답입니다!' : isTimeout ? '시간 초과!' : '아쉽네요! 오답입니다.'}</h4>
            <p style="font-size: 0.85rem; line-height: 1.6; color: #554D46;">${q.explanation}</p>
          </div>
        </div>
        <button onclick="window.quizGame.nextQuestion()" class="btn" style="margin-top: 14px; background-color: var(--accent-teal);">
          다음 문제로 ➔
        </button>
      `;
    }
  }

  nextQuestion() {
    this.currentIndex++;
    this.showQuestion();
  }

  finishQuiz() {
    if (this.timer) clearInterval(this.timer);
    if (window.sounds) window.sounds.playFanfare();

    const totalQ = this.currentList.length;
    const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
    const scoreRate = Math.round((correctCount / totalQ) * 100);
    window.encyclopedia.recordQuizScore(scoreRate);

    document.getElementById('quiz-play-view').style.display = 'none';
    const resultView = document.getElementById('quiz-result-view');
    resultView.style.display = 'block';

    let rankText = '역사 꿈나무 🌱';
    if (scoreRate >= 90) rankText = '역사 박사 마스터 👑';
    else if (scoreRate >= 70) rankText = '열정의 역사 탐험가 🧭';
    else if (scoreRate >= 50) rankText = '성장하는 역사 학자 📜';

    resultView.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 76px; height: 76px; border-radius: 50%; margin: 0 auto 14px; background: var(--accent-red); display: flex; align-items: center; justify-content: center; font-size: 2.1rem;">
          🏆
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 900; color: var(--accent-red); margin-bottom: 4px;">스피드 역사 골든벨 완료!</h3>
        <p style="color: #554D46; font-size: 0.88rem; margin-bottom: 20px;">초등 5학년 역사 마무리를 멋지게 완수했습니다.</p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: var(--card-sub); padding: 16px; border-radius: 14px; border: 1px solid var(--border-color); margin-bottom: 20px;">
          <div>
            <span style="font-size: 0.72rem; color: #8C847B; display: block;">최종 점수</span>
            <strong style="font-size: 1.3rem; font-weight: 900; color: var(--accent-red);">${scoreRate}점</strong>
          </div>
          <div>
            <span style="font-size: 0.72rem; color: #8C847B; display: block;">맞힌 문제</span>
            <strong style="font-size: 1.3rem; font-weight: 900; color: #2D6A4F;">${correctCount} / ${totalQ}</strong>
          </div>
          <div>
            <span style="font-size: 0.72rem; color: #8C847B; display: block;">부여 칭호</span>
            <strong style="font-size: 0.78rem; font-weight: 800; color: var(--accent-teal); display: block; margin-top: 4px;">${rankText}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.quizGame.startQuizGame(${this.unitId || 'null'})" class="btn" style="width: auto; padding: 10px 22px; background-color: var(--accent-red);">
            🔄 다시 도전하기
          </button>
          <button onclick="window.quizGame.exitQuiz()" class="btn secondary" style="width: auto; padding: 10px 22px;">
            🏠 퀴즈 홈으로
          </button>
        </div>
      </div>
    `;
  }

  exitQuiz() {
    if (this.timer) clearInterval(this.timer);
    document.getElementById('quiz-play-view').style.display = 'none';
    document.getElementById('quiz-result-view').style.display = 'none';
    document.getElementById('quiz-intro-view').style.display = 'block';
    window.encyclopedia.renderEncyclopedia('encyclopedia-content');
  }
}

window.quizGame = new QuizGame();
