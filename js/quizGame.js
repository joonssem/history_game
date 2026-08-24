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
  }

  async loadQuizzes() {
    try {
      const res = await fetch('data/quizzes.json');
      this.quizzes = await res.json();
    } catch (e) {
      console.error('Failed to load quizzes.json', e);
    }
  }

  startQuizGame() {
    if (window.sounds) window.sounds.playClick();
    this.currentList = [...this.quizzes].sort(() => Math.random() - 0.5); // 랜덤 셔플
    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = [];

    document.getElementById('quiz-intro-view').classList.add('hidden');
    document.getElementById('quiz-result-view').classList.add('hidden');
    document.getElementById('quiz-play-view').classList.remove('hidden');

    this.showQuestion();
  }

  showQuestion() {
    if (this.currentIndex >= this.currentList.length) {
      this.finishQuiz();
      return;
    }

    const q = this.currentList[this.currentIndex];
    this.timeLeft = this.maxTime;

    const playView = document.getElementById('quiz-play-view');
    const totalQ = this.currentList.length;

    playView.innerHTML = `
      <div class="max-w-2xl mx-auto bg-stone-900/90 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur relative">
        <!-- 상단 진행도 및 타이머 -->
        <div class="flex items-center justify-between mb-4">
          <span class="px-3 py-1 bg-amber-400/20 text-amber-300 font-bold text-xs rounded-full border border-amber-400/30">
            ${q.unit}
          </span>
          <span class="text-xs font-bold text-stone-300">
            문제 <strong class="text-amber-400 text-sm">${this.currentIndex + 1}</strong> / ${totalQ}
          </span>
          <span class="text-xs font-bold text-amber-300 bg-stone-800 px-3 py-1 rounded-full border border-stone-700">
            현재 점수: <span id="current-score-display">${this.score}</span>점
          </span>
        </div>

        <!-- 타이머 게이지 -->
        <div class="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden mb-6 border border-stone-700">
          <div id="quiz-timer-bar" class="bg-gradient-to-r from-amber-400 to-red-500 h-full rounded-full transition-all duration-1000 ease-linear" style="width: 100%"></div>
        </div>

        <!-- 문제 내용 -->
        <div class="min-h-[110px] flex items-center justify-center p-4 bg-stone-800/60 rounded-2xl border border-stone-700/60 mb-6 text-center">
          <h3 class="text-lg md:text-xl font-bold text-stone-100 leading-relaxed">${q.question}</h3>
        </div>

        <!-- 선택지 영역 -->
        <div id="quiz-options" class="space-y-3">
          ${
            q.type === 'ox'
              ? `
            <div class="grid grid-cols-2 gap-4">
              <button onclick="window.quizGame.handleAnswer(true)" class="py-6 rounded-2xl bg-emerald-950/60 hover:bg-emerald-800/60 border-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-black text-4xl transition transform active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg">
                <span>⭕</span>
                <span class="text-sm font-bold">그렇다 (O)</span>
              </button>
              <button onclick="window.quizGame.handleAnswer(false)" class="py-6 rounded-2xl bg-rose-950/60 hover:bg-rose-800/60 border-2 border-rose-500/50 hover:border-rose-400 text-rose-300 font-black text-4xl transition transform active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg">
                <span>❌</span>
                <span class="text-sm font-bold">아니다 (X)</span>
              </button>
            </div>
          `
              : q.options
                  .map(
                    (opt, i) => `
            <button onclick="window.quizGame.handleAnswer(${i})" class="w-full text-left p-4 rounded-xl bg-stone-800 hover:bg-amber-950/40 border border-stone-700 hover:border-amber-400 text-stone-100 hover:text-amber-200 font-semibold transition flex items-center gap-3 group active:scale-[0.99]">
              <span class="w-7 h-7 rounded-full bg-stone-700 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-300 flex items-center justify-center text-xs font-bold">${i + 1}</span>
              <span class="text-sm md:text-base">${opt}</span>
            </button>
          `
                  )
                  .join('')
          }
        </div>

        <!-- 실시간 피드백 모달/오버레이 -->
        <div id="quiz-feedback-box" class="hidden mt-6 p-4 rounded-2xl border transition-all"></div>
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
    if (optBox) optBox.classList.add('pointer-events-none', 'opacity-50');

    if (fBox) {
      fBox.classList.remove('hidden');
      fBox.className = `mt-6 p-4 rounded-2xl border ${
        isCorrect
          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
          : 'bg-rose-950/80 border-rose-500 text-rose-200'
      }`;
      fBox.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="text-2xl">${isCorrect ? '🎉' : '💡'}</span>
          <div>
            <h4 class="font-bold text-base mb-1">${isCorrect ? '정답입니다!' : isTimeout ? '시간 초과!' : '아쉽네요! 오답입니다.'}</h4>
            <p class="text-xs md:text-sm leading-relaxed">${q.explanation}</p>
          </div>
        </div>
        <button onclick="window.quizGame.nextQuestion()" class="mt-4 w-full py-2.5 bg-stone-100 hover:bg-white text-stone-950 font-bold rounded-xl shadow text-sm transition">
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

    window.encyclopedia.recordQuizScore(this.score);

    document.getElementById('quiz-play-view').classList.add('hidden');
    const resultView = document.getElementById('quiz-result-view');
    resultView.classList.remove('hidden');

    const totalQ = this.currentList.length;
    const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
    const scoreRate = Math.round((correctCount / totalQ) * 100);

    let rankText = '역사 꿈나무 🌱';
    if (scoreRate >= 90) rankText = '역사 박사 마스터 👑';
    else if (scoreRate >= 70) rankText = '열정의 역사 탐험가 🧭';
    else if (scoreRate >= 50) rankText = '성장하는 역사 학자 📜';

    resultView.innerHTML = `
      <div class="max-w-2xl mx-auto bg-stone-900/90 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur text-center">
        <div class="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30">
          🏆
        </div>
        <h3 class="text-2xl font-black text-amber-300 mb-1">스피드 역사 골든벨 완료!</h3>
        <p class="text-stone-300 text-sm mb-6">초등 5학년 역사 마무리를 멋지게 완수했습니다.</p>

        <div class="grid grid-cols-3 gap-3 bg-stone-800/80 p-4 rounded-2xl border border-stone-700 mb-6">
          <div>
            <span class="text-xs text-stone-400 block">최종 점수</span>
            <strong class="text-2xl font-black text-amber-400">${this.score}점</strong>
          </div>
          <div>
            <span class="text-xs text-stone-400 block">맞힌 문제</span>
            <strong class="text-2xl font-black text-emerald-400">${correctCount} / ${totalQ}</strong>
          </div>
          <div>
            <span class="text-xs text-stone-400 block">부여 칭호</span>
            <strong class="text-xs md:text-sm font-bold text-yellow-300 block mt-1">${rankText}</strong>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button onclick="window.quizGame.startQuizGame()" class="py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold rounded-xl shadow transition transform active:scale-95">
            🔄 다시 도전하기
          </button>
          <button onclick="window.quizGame.exitQuiz()" class="py-3 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl border border-stone-600 transition">
            🏠 퀴즈 홈으로
          </button>
        </div>
      </div>
    `;
  }

  exitQuiz() {
    if (this.timer) clearInterval(this.timer);
    document.getElementById('quiz-play-view').classList.add('hidden');
    document.getElementById('quiz-result-view').classList.add('hidden');
    document.getElementById('quiz-intro-view').classList.remove('hidden');
    window.encyclopedia.renderEncyclopedia('encyclopedia-content');
  }
}

window.quizGame = new QuizGame();
