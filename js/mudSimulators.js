// =========================================================
// js/mudSimulators.js - 캔버스 인터랙티브 시뮬레이터 렌더러 모듈
// =========================================================

const MudSimulators = {
  // === 캔버스 이벤트 리스너 초기화 ===
  init() {
    const canvas = document.getElementById('mn-canvas');
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => this.handleCanvasTouch(e.clientX, e.clientY));
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleCanvasTouch(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
  },

  // === 터치/클릭 이벤트 디스패처 ===
  handleCanvasTouch(clientX, clientY) {
    const canvas = document.getElementById('mn-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const engine = window.MudEngine;
    if (!engine) return;

    const simMode = engine.simMode;

    if (simMode.startsWith('dolmen')) {
      if (simMode === 'dolmen-step1') {
        engine.dolmenState.baseSet = true;
        if (window.sounds) window.sounds.playClick();
      } else if (simMode === 'dolmen-step2') {
        engine.dolmenState.earthProgress = Math.min(100, engine.dolmenState.earthProgress + 25);
        const gp = document.getElementById('gauge-progress');
        if (gp) gp.textContent = `${engine.dolmenState.earthProgress}%`;
        const gb = document.getElementById('gauge-bar');
        if (gb) gb.style.width = `${engine.dolmenState.earthProgress}%`;
        if (window.sounds) window.sounds.playClick();
        if (engine.dolmenState.earthProgress >= 100 && window.sounds) window.sounds.playCorrect();
      } else if (simMode === 'dolmen-step3') {
        engine.dolmenState.stoneProgress = Math.min(100, engine.dolmenState.stoneProgress + (engine.dolmenState.workers * 0.35));
        if (window.sounds) window.sounds.playClick();
        if (engine.dolmenState.stoneProgress >= 100 && window.sounds) window.sounds.playCorrect();
      } else if (simMode === 'dolmen-step4') {
        engine.dolmenState.earthRemoved = true;
        if (window.sounds) window.sounds.playFanfare();
      }
    } else if (simMode === 'gwangbok-vote') {
      if (!engine.voteState.stamped) {
        engine.voteState.stamped = true;
        if (window.sounds) window.sounds.playClick();
      } else if (!engine.voteState.voteInserted) {
        engine.voteState.voteInserted = true;
        if (window.sounds) window.sounds.playFanfare();
      }
    } else if (simMode === 'paleo-fire' || simMode === 'neolithic-pottery' || simMode.startsWith('economy') || simMode.startsWith('battle-gauge') || simMode.startsWith('culture-touch') || simMode.startsWith('text-reading')) {
      engine.gaugeProgress = Math.min(100, (engine.gaugeProgress || 0) + 25);
      const gp = document.getElementById('gauge-progress');
      if (gp) gp.textContent = `${engine.gaugeProgress}%`;
      const gb = document.getElementById('gauge-bar');
      if (gb) gb.style.width = `${engine.gaugeProgress}%`;
      if (window.sounds) window.sounds.playClick();
      if (engine.gaugeProgress >= 100 && window.sounds) window.sounds.playCorrect();
    } else if (simMode === 'paleo-stone') {
      engine.stoneHits = Math.min(100, engine.stoneHits + 25);
      const gp = document.getElementById('gauge-progress');
      if (gp) gp.textContent = `${engine.stoneHits}%`;
      const gb = document.getElementById('gauge-bar');
      if (gb) gb.style.width = `${engine.stoneHits}%`;
      if (window.sounds) window.sounds.playClick();
      if (engine.stoneHits >= 100 && window.sounds) window.sounds.playCorrect();
    } else if (simMode.startsWith('gwangbok-flag')) {
      if (!engine.taegeukState.yangColor) engine.taegeukState.yangColor = true;
      else if (!engine.taegeukState.yinColor) engine.taegeukState.yinColor = true;
      else if (!engine.taegeukState.geon) engine.taegeukState.geon = true;
      else if (!engine.taegeukState.gon) engine.taegeukState.gon = true;
      else if (!engine.taegeukState.gam) engine.taegeukState.gam = true;
      else if (!engine.taegeukState.ri) engine.taegeukState.ri = true;
      if (window.sounds) window.sounds.playClick();
      engine.checkTaegeukComplete();
    } else if (simMode === 'mn-combat-active') {
      engine.bullets.push({
        x: engine.playerShip.x + 10,
        y: engine.playerShip.y,
        vx: (x - (engine.playerShip.x + 10)) * 0.09,
        vy: (y - engine.playerShip.y) * 0.09,
        active: true
      });
      if (window.sounds) window.sounds.playClick();
    }
  },

  // === 중앙 캔버스 렌더러 ===
  drawSim() {
    const canvas = document.getElementById('mn-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    const engine = window.MudEngine;
    if (!engine) return;
    const simMode = engine.simMode;

    if (simMode.startsWith('dolmen')) {
      this.drawPreciseDolmen(ctx, w, h, engine.dolmenState, simMode);
    } else if (simMode === 'gwangbok-vote') {
      this.drawPreciseVote(ctx, w, h, engine.voteState);
    } else if (simMode.startsWith('gwangbok-flag') || simMode === 'gwangbok-flag') {
      this.drawPreciseTaegeukgi(ctx, w/2, h/2 - 8, 195, 130, engine.taegeukState);
      const allCompleted = engine.taegeukState.yangColor && engine.taegeukState.yinColor && engine.taegeukState.geon && engine.taegeukState.gon && engine.taegeukState.gam && engine.taegeukState.ri;
      ctx.fillStyle = allCompleted ? '#F59E0B' : '#FFFFFF';
      ctx.font = 'bold 11px "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      if (allCompleted) {
        ctx.fillText("✨ 대한독립만세! 1945.8.15 광복과 태극기 완성 🇰🇷", w/2, h - 10);
      } else {
        ctx.fillText("🎨 화면이나 아래 버튼을 눌러 태극기를 완성하세요!", w/2, h - 10);
      }
    } else if (simMode.startsWith('mn-')) {
      this.drawPreciseMyeongnyang(ctx, w, h, simMode);
    } else if (simMode === 'hanyang-map' || simMode === 'hanyang-gates' || simMode === 'hanyang-bakseok') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#8A3B29';
      ctx.fillRect(w/2 - 40, h/2 - 40, 80, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("한양 도성과 4대문", w/2, h/2 + 5);
    } else if (simMode.startsWith('economy')) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#B8860B';
      ctx.beginPath();
      ctx.arc(w/2, h/2, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(w/2 - 12, h/2 - 12, 24, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("常平通寶 (상평통보)", w/2, h - 15);
    } else if (simMode.startsWith('silhak')) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(w/2, h/2, 45, 18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("서양 문물: 둥근 지구의", w/2, h - 15);
    } else if (simMode === 'paleo-intro') {
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#6F4E37';
      ctx.beginPath();
      ctx.arc(w/2, h/2 + 20, 70, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#A77950';
      ctx.font = 'bold 13px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("🏕️ 한탄강변 전곡리 바위그늘", w/2, h - 25);
    } else if (simMode === 'paleo-fire') {
      ctx.fillStyle = '#110e0c';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#4a2f1b';
      ctx.fillRect(w/2 - 30, h/2 + 25, 60, 10);
      const flameSize = 10 + (engine.gaugeProgress * 0.4);
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(w/2, h/2 + 20, flameSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(w/2, h/2 + 20, flameSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (simMode === 'paleo-stone') {
      ctx.fillStyle = '#161412';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#6F4E37';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w/2, h/2 - 45);
      ctx.lineTo(w/2 + 35, h/2 + 35);
      ctx.lineTo(w/2 - 35, h/2 + 35);
      ctx.closePath();
      ctx.fill();
      if (engine.stoneHits > 0) ctx.stroke();
    } else if (simMode.startsWith('neolithic')) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#A77950';
      ctx.beginPath();
      ctx.moveTo(w/2 - 30, h/2 - 30);
      ctx.lineTo(w/2 + 30, h/2 - 30);
      ctx.lineTo(w/2, h/2 + 40);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '11px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("암사동 빗살무늬 뾰족 토기", w/2, h - 15);

    } else if (simMode.startsWith('text-reading')) {
      // 📜 역사 기록 & 사료 두루마리 모드
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(w/2 - 70, h/2 - 45, 140, 90);
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(w/2 - 70, h/2 - 45, 140, 90);
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 12px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("📜 史料 & 記録 (사료 탐구)", w/2, h/2 - 15);
      ctx.fillStyle = '#B45309';
      ctx.font = '10px "Pretendard"';
      ctx.fillText("진본 역사 기록을 탐구합니다", w/2, h/2 + 8);
      ctx.fillStyle = '#DC2626';
      ctx.fillText("【 대한국새 / 옥새 직인 】", w/2, h/2 + 28);
    } else if (simMode.startsWith('battle-gauge')) {
      // ⚔️ 구국 결전 & 방어선 게이지 모드
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(w/2, h/2, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("⚔️ 호국 결전 🛡️", w/2, h/2 + 5);
      ctx.fillStyle = '#FCD34D';
      ctx.font = '10px "Pretendard"';
      ctx.fillText("화면을 터치하여 승기를 잡으세요!", w/2, h - 15);
    } else if (simMode.startsWith('culture-touch')) {
      // ✨ 문화 예술 & 생활 유물 체험 모드
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(w/2, h/2 - 10, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px "Pretendard"';
      ctx.textAlign = 'center';
      ctx.fillText("✨ 찬란한 민족 문화 🏺", w/2, h/2 - 5);
      ctx.fillStyle = '#A7F3D0';
      ctx.font = '10px "Pretendard"';
      ctx.fillText("신명 나는 터치로 흥과 문화를 피워내세요!", w/2, h - 15);
    }
  },

  // === 1단원: 고인돌 정밀 렌더러 ===
  drawPreciseDolmen(ctx, w, h, state, mode) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.55, '#bae6fd');
    grad.addColorStop(0.56, '#65a30d');
    grad.addColorStop(1, '#4d7c0f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(w * 0.25, h * 0.55, 60, Math.PI, 0);
    ctx.arc(w * 0.75, h * 0.55, 80, Math.PI, 0);
    ctx.fill();

    const groundY = h * 0.72;
    const leftPostX = w * 0.36;
    const rightPostX = w * 0.64;
    const postW = 22;
    const postH = 48;

    if (state.baseSet || mode !== 'dolmen-step1') {
      ctx.fillStyle = '#78716c';
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.5;
      ctx.fillRect(leftPostX - postW/2, groundY - postH, postW, postH);
      ctx.strokeRect(leftPostX - postW/2, groundY - postH, postW, postH);
      ctx.fillRect(rightPostX - postW/2, groundY - postH, postW, postH);
      ctx.strokeRect(rightPostX - postW/2, groundY - postH, postW, postH);
    } else {
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(leftPostX - postW/2, groundY - postH, postW, postH);
      ctx.strokeRect(rightPostX - postW/2, groundY - postH, postW, postH);
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("터치하여 받침돌 세우기", w/2, groundY - 15);
    }

    if ((mode === 'dolmen-step2' || mode === 'dolmen-step3') && !state.earthRemoved) {
      const rampProgress = mode === 'dolmen-step3' ? 100 : (state.earthProgress || 0);
      const rampHeight = postH * (rampProgress / 100);
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(w * 0.1, groundY);
      ctx.lineTo(rightPostX + 15, groundY - rampHeight);
      ctx.lineTo(rightPostX + 15, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.stroke();
    }

    if (mode === 'dolmen-step3') {
      const moveRatio = Math.min(1, (state.stoneProgress || 0) / 100);
      const startX = w * 0.18;
      const targetX = w * 0.5;
      const currentStoneX = startX + (targetX - startX) * moveRatio;
      const currentStoneY = groundY - (postH * (0.3 + 0.7 * moveRatio)) - 14;

      ctx.fillStyle = '#d97706';
      for (let i = 0; i < 4; i++) {
        const logX = currentStoneX - 35 + (i * 24);
        ctx.beginPath();
        ctx.arc(logX, currentStoneY + 16, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = '#57534e';
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(currentStoneX, currentStoneY, 52, 18, -0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentStoneX + 45, currentStoneY);
      ctx.lineTo(w * 0.88, groundY - 10);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`👥 부족민 ${state.workers}명이 끄는 중!`, w * 0.75, groundY - 24);
    }

    if (mode === 'dolmen-step4' || state.earthRemoved) {
      ctx.fillStyle = '#57534e';
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, groundY - postH - 12, 60, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px "SchoolSafetyNotification", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("✨ 탁자식 고인돌 축조 완수! 👑", w/2, 28);
    }
  },

  // === 2단원: 명량대첩 정밀 렌더러 ===
  drawPreciseMyeongnyang(ctx, w, h, mode) {
    const engine = window.MudEngine;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const time = Date.now() * 0.003;
    const isCurrentReversed = engine ? engine.targetCurrent >= 80 : false;

    ctx.strokeStyle = isCurrentReversed ? '#38bdf8' : '#64748b';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const waveY = 30 + (i * 35);
      ctx.beginPath();
      ctx.moveTo(w * 0.15, waveY);
      for (let x = w * 0.15; x <= w * 0.85; x += 15) {
        const waveOffset = Math.sin((x * 0.05) + (isCurrentReversed ? -time : time)) * 4;
        ctx.lineTo(x, waveY + waveOffset);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.14, 0);
    ctx.lineTo(w * 0.18, h);
    ctx.lineTo(0, h);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.86, 0);
    ctx.lineTo(w * 0.82, h);
    ctx.lineTo(w, h);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("진도", w * 0.08, h/2);
    ctx.fillText("해남", w * 0.92, h/2);

    const playerX = isCurrentReversed ? w * 0.45 : w * 0.28;
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.fillRect(playerX - 16, h/2 - 12, 32, 24);
    ctx.strokeRect(playerX - 16, h/2 - 12, 32, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText("대장선", playerX, h/2 + 4);

    ctx.fillStyle = '#92400e';
    for (let i = 1; i <= 3; i++) {
      ctx.fillRect(playerX - 25, (h/2) - (i * 26), 20, 14);
      ctx.fillRect(playerX - 25, (h/2) + (i * 26) - 10, 20, 14);
    }

    if (mode === 'mn-combat-active' && engine) {
      engine.enemyShips.forEach(s => {
        if (!s.alive) return;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(s.x - 8, s.y - 8, s.size, s.size);
        ctx.fillStyle = '#ef4444';
        ctx.fillText("왜선", s.x, s.y + 4);
      });

      engine.bullets.forEach(b => {
        if (!b.active) return;
        b.x += b.vx;
        b.y += b.vy;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();

        engine.enemyShips.forEach(s => {
          if (!s.alive) return;
          if (Math.hypot(b.x - s.x, b.y - s.y) < s.size) {
            s.alive = false;
            b.active = false;
            engine.gaugeProgress = Math.min(100, engine.gaugeProgress + 25);
            const gp = document.getElementById('gauge-progress');
            if (gp) gp.textContent = `${engine.gaugeProgress}%`;
            const gb = document.getElementById('gauge-bar');
            if (gb) gb.style.width = `${engine.gaugeProgress}%`;
          }
        });
      });
    } else {
      ctx.fillStyle = '#450a0a';
      for (let row = -2; row <= 2; row++) {
        for (let col = 0; col < 3; col++) {
          ctx.fillRect(w * 0.68 + (col * 22), (h/2) + (row * 24) - 6, 16, 12);
        }
      }
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText("왜선 133척 대함대", w * 0.76, 20);
    }

    ctx.fillStyle = isCurrentReversed ? '#38bdf8' : '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(isCurrentReversed ? "🌊 썰물 역전! 왜군 쪽으로 총돌격! ➔➔" : "⬅️⬅️ 밀물 (왜군 쪽에서 밀려오는 중)", w/2, h - 8);
  },

  // === 3단원: 5·10 총선거 투표소 렌더러 ===
  drawPreciseVote(ctx, w, h, state) {
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(0, 0, w, h);

    const boxX = w * 0.68;
    const boxY = h * 0.42;
    const boxW = 85;
    const boxH = 95;

    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.fillRect(boxX - boxW/2, boxY, boxW, boxH);
    ctx.strokeRect(boxX - boxW/2, boxY, boxW, boxH);

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(boxX - 25, boxY + 6, 50, 6);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("투표구 제1호함", boxX, boxY + 36);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#d4d4d8';
    ctx.fillText("1948.5.10", boxX, boxY + 52);
    ctx.fillText("대한민국 총선거", boxX, boxY + 66);

    const paperX = state.voteInserted ? boxX : w * 0.28;
    const paperY = state.voteInserted ? boxY + 10 : h * 0.22;
    const paperW = 85;
    const paperH = 115;

    if (!state.voteInserted) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 8;
      ctx.fillRect(paperX - paperW/2, paperY, paperW, paperH);
      ctx.restore();

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(paperX - paperW/2, paperY, paperW, paperH);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("제헌 국회의원 투표용지", paperX, paperY + 14);

      ctx.strokeRect(paperX - 35, paperY + 22, 70, 36);
      ctx.fillText("기호 1번 독립투사", paperX - 5, paperY + 42);

      ctx.strokeRect(paperX - 35, paperY + 62, 70, 36);
      ctx.fillText("기호 2번 민족대표", paperX - 5, paperY + 82);

      if (state.stamped) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(paperX + 22, paperY + 40, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText("卜", paperX + 22, paperY + 44);
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px sans-serif';
        ctx.fillText("👆 터치 기표", paperX + 20, paperY + 43);
      }

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.stamped ? "📥 아래 [투표함에 넣기]를 누르세요!" : "🔴 투표용지를 터치해 기표(卜)하세요!", w/2, h - 10);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("✨ 투표 완료! 소중한 민주 주권 행사 🗳️", w/2, h - 10);
    }
  },

  // === 3단원: 대한민국 공식 태극기 정밀 렌더러 ===
  drawPreciseTaegeukgi(ctx, cx, cy, flagW, flagH, state) {
    const x = cx - flagW / 2;
    const y = cy - flagH / 2;

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 8;
    ctx.fillRect(x, y, flagW, flagH);
    ctx.restore();

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, flagW, flagH);

    const radius = flagH / 4;
    const rSmall = radius / 2;
    const theta = Math.atan2(flagH, flagW);

    const barLength = radius * 0.9;
    const barThickness = radius * 0.24;
    const barGap = radius * 0.12;
    const centerGap = radius * 0.14;
    const gwaeDist = radius * 1.68;

    function drawGwae(angle, dist, lines, isColored, name) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.translate(dist, 0);

      lines.forEach((isBroken, idx) => {
        const lineX = (idx - 1) * (barThickness + barGap);
        ctx.fillStyle = isColored ? '#1E293B' : '#E2E8F0';

        if (!isBroken) {
          ctx.fillRect(lineX - barThickness/2, -barLength/2, barThickness, barLength);
          if (!isColored) {
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(lineX - barThickness/2, -barLength/2, barThickness, barLength);
          }
        } else {
          const halfLen = (barLength - centerGap) / 2;
          ctx.fillRect(lineX - barThickness/2, -barLength/2, barThickness, halfLen);
          ctx.fillRect(lineX - barThickness/2, centerGap/2, barThickness, halfLen);
          if (!isColored) {
            ctx.strokeStyle = '#94A3B8';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(lineX - barThickness/2, -barLength/2, barThickness, halfLen);
            ctx.strokeRect(lineX - barThickness/2, centerGap/2, barThickness, halfLen);
          }
        }
      });

      if (!isColored) {
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, 0, barLength/2 + 10);
      }
      ctx.restore();
    }

    drawGwae(Math.PI + theta, gwaeDist, [false, false, false], state.geon, '건(하늘)');
    drawGwae(theta, gwaeDist, [true, true, true], state.gon, '곤(땅)');
    drawGwae(-theta, gwaeDist, [true, false, true], state.gam, '감(달·물)');
    drawGwae(Math.PI - theta, gwaeDist, [false, true, false], state.ri, '리(해·불)');

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(theta);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = state.yinColor ? '#0047A0' : '#E2E8F0';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = state.yangColor ? '#CD2E3A' : '#F1F5F9';
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = state.yangColor ? '#CD2E3A' : '#F1F5F9';
    ctx.beginPath();
    ctx.arc(-rSmall, 0, rSmall, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = state.yinColor ? '#0047A0' : '#E2E8F0';
    ctx.beginPath();
    ctx.arc(rSmall, 0, rSmall, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (!state.yangColor) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔴 양(빨강)', 0, -radius * 0.4);
    }
    if (!state.yinColor) {
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔵 음(파랑)', 0, radius * 0.6);
    }
    ctx.restore();
  }
};

window.MudSimulators = MudSimulators;
document.addEventListener('DOMContentLoaded', () => {
  MudSimulators.init();
});
