// =========================================================
// js/mudSimulators.js - 캔버스 인터랙티브 시뮬레이터 렌더러 모듈
// =========================================================

const MudSimulators = {
  // 입력 판정과 화면 표현이 같은 계약을 공유하도록 한 진입점이다.
  interactionHandlers: {
    'ordered-hotspot': 'processOrderedHotspot',
    'hotspot-discovery': 'processPaleoDiscovery',
    'resource-allocation': 'processPaleoDiscovery',
    reflection: 'processPaleoDiscovery'
  },

  dispatchHotspotInteraction(mode, hotspot, engine) {
    const interaction = engine.currentSimulator?.interaction;
    const handlerName = this.interactionHandlers[interaction];
    return handlerName ? this[handlerName](mode, hotspot, engine) : false;
  },

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
    const interaction = engine.currentSimulator?.interaction || simMode;
    let actionAccepted = false;
    let hotspotInteracted = null;

    if (simMode.startsWith('dolmen') && !['hotspot-discovery', 'ordered-hotspot', 'resource-allocation', 'reflection'].includes(interaction)) {
      if (simMode === 'dolmen-step1') {
        if (!engine.dolmenState.baseSet) {
          engine.dolmenState.baseSet = true;
          engine.setSimulatorProgress(1);
          actionAccepted = true;
        }
        if (window.sounds) window.sounds.playClick();
      } else if (simMode === 'dolmen-step2') {
        engine.dolmenState.earthProgress = Math.min(100, engine.dolmenState.earthProgress + 25);
        engine.setSimulatorProgress(engine.dolmenState.earthProgress);
        actionAccepted = true;
        const gp = document.getElementById('gauge-progress');
        if (gp) gp.textContent = `${engine.dolmenState.earthProgress}%`;
        const gb = document.getElementById('gauge-bar');
        if (gb) gb.style.width = `${engine.dolmenState.earthProgress}%`;
        if (window.sounds) window.sounds.playClick();
        if (engine.dolmenState.earthProgress >= 100 && window.sounds) window.sounds.playCorrect();
      } else if (simMode === 'dolmen-step3') {
        engine.dolmenState.stoneProgress = Math.min(100, engine.dolmenState.stoneProgress + (engine.dolmenState.workers * 0.35));
        engine.setSimulatorProgress(engine.dolmenState.stoneProgress);
        actionAccepted = true;
        if (window.sounds) window.sounds.playClick();
        if (engine.dolmenState.stoneProgress >= 100 && window.sounds) window.sounds.playCorrect();
      } else if (simMode === 'dolmen-step4') {
        if (!engine.dolmenState.earthRemoved) {
          engine.dolmenState.earthRemoved = true;
          engine.setSimulatorProgress(1);
          actionAccepted = true;
          if (window.sounds) window.sounds.playFanfare();
        }
      }
    } else if (simMode === 'gwangbok-vote' || simMode === 'precise-vote') {
      if (!engine.voteState.stamped) {
        engine.voteState.stamped = true;
        engine.setSimulatorProgress(1);
        actionAccepted = true;
        if (window.sounds) window.sounds.playClick();
      } else if (!engine.voteState.voteInserted) {
        engine.voteState.voteInserted = true;
        engine.setSimulatorProgress(2);
        actionAccepted = true;
        if (window.sounds) window.sounds.playFanfare();
      }
    } else if (interaction === 'ordered-hotspot') {
      hotspotInteracted = this.getPaleoHotspot(simMode, x, y, canvas);
      actionAccepted = this.dispatchHotspotInteraction(simMode, hotspotInteracted, engine);
    } else if (interaction === 'hotspot-discovery' || interaction === 'resource-allocation' || interaction === 'reflection') {
      hotspotInteracted = this.getPaleoHotspot(simMode, x, y, canvas);
      actionAccepted = this.dispatchHotspotInteraction(simMode, hotspotInteracted, engine);
    } else if (simMode === 'neolithic-pottery' || simMode.startsWith('economy') || simMode.startsWith('battle-gauge') || simMode.startsWith('culture-touch') || simMode.startsWith('text-reading')) {
      engine.gaugeProgress = Math.min(100, (engine.gaugeProgress || 0) + engine.simulatorIncrement());
      actionAccepted = true;
      const gp = document.getElementById('gauge-progress');
      if (gp) gp.textContent = `${engine.gaugeProgress}%`;
      const gb = document.getElementById('gauge-bar');
      if (gb) gb.style.width = `${engine.gaugeProgress}%`;
      if (window.sounds) window.sounds.playClick();
      if (engine.gaugeProgress >= 100 && window.sounds) window.sounds.playCorrect();
    } else if (simMode.startsWith('gwangbok-flag') || simMode === 'precise-taegeukgi') {
      if (!engine.taegeukState.yangColor) { engine.taegeukState.yangColor = true; actionAccepted = true; }
      else if (!engine.taegeukState.yinColor) { engine.taegeukState.yinColor = true; actionAccepted = true; }
      else if (!engine.taegeukState.geon) { engine.taegeukState.geon = true; actionAccepted = true; }
      else if (!engine.taegeukState.gon) { engine.taegeukState.gon = true; actionAccepted = true; }
      else if (!engine.taegeukState.gam) { engine.taegeukState.gam = true; actionAccepted = true; }
      else if (!engine.taegeukState.ri) { engine.taegeukState.ri = true; actionAccepted = true; }
      if (actionAccepted) {
        engine.setSimulatorProgress(Object.values(engine.taegeukState).filter(Boolean).length);
      }
      if (window.sounds) window.sounds.playClick();
      engine.checkTaegeukComplete();
    } else if (simMode === 'mn-combat-active') {
      actionAccepted = true;
      engine.bullets.push({
        x: engine.playerShip.x + 10,
        y: engine.playerShip.y,
        vx: (x - (engine.playerShip.x + 10)) * 0.09,
        vy: (y - engine.playerShip.y) * 0.09,
        active: true
      });
      if (window.sounds) window.sounds.playClick();
    }

    if (actionAccepted) {
      engine.registerSimulatorAction();
      if (hotspotInteracted) engine.registerUniqueSimulatorAction(hotspotInteracted.id);
    }
    engine.updateSimulatorCompletion();
    this.renderAlternativeControls();
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
    const interaction = engine.currentSimulator?.interaction || simMode;

    // JSON에 핫스팟을 선언한 활동은 시대별 레거시 렌더러보다 먼저 공통 렌더러를 사용한다.
    if (Array.isArray(engine.currentSimulator?.hotspots) && engine.currentSimulator.hotspots.length > 0) {
      this.drawPaleoActivity(ctx, w, h, simMode, engine.simulatorState, engine.simulatorState.step || engine.simulatorState.found.length);
      return;
    }

    // 핫스팟이 없는 게이지형 활동도 scene을 선언하면 시대 배경을 그린다. scene 미선언 활동은 아래 레거시 분기를 그대로 탄다.
    const declaredScene = engine.currentSimulator?.scene;
    if (declaredScene && this.drawConfiguredSceneBackground(ctx, w, h, declaredScene)) return;

    if (engine.currentMudData?.mudId === 'deep_three_kingdoms' && simMode.startsWith('text-reading')) {
      this.drawThreeKingdomsDocument(ctx, w, h, engine.currentStage);
      return;
    }

    if (simMode.startsWith('dolmen')) {
      this.drawPreciseDolmen(ctx, w, h, engine.dolmenState, simMode);
    } else if (simMode === 'gwangbok-vote' || simMode === 'precise-vote') {
      this.drawPreciseVote(ctx, w, h, engine.voteState);
    } else if (simMode.startsWith('gwangbok-flag') || simMode === 'gwangbok-flag' || simMode === 'precise-taegeukgi') {
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
      if (engine.currentMudData?.mudId === 'deep_three_kingdoms' && simMode === 'mn-combat-active') {
        this.drawThreeKingdomsNaval(ctx, w, h);
      } else {
        this.drawPreciseMyeongnyang(ctx, w, h, simMode);
      }
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
    } else if (simMode.startsWith('neolithic') && !engine.currentSimulator?.interaction) {
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
      const isThreeKingdomsDeepDive = engine.currentMudData?.mudId === 'deep_three_kingdoms';
      const readingTitle = isThreeKingdomsDeepDive ? '⚔️ 삼국 통일 전쟁 사료' : '📜 史料 & 記錄 (사료 탐구)';
      const readingSubtitle = isThreeKingdomsDeepDive ? '나당 전쟁과 발해 건국 자료를 살펴봅니다' : '진본 역사 기록을 탐구합니다';
      const readingArtifact = isThreeKingdomsDeepDive ? '【 황산벌 · 매소성 · 기벌포 기록 】' : '【 대한국새 / 옥새 직인 】';
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
      ctx.fillText(readingTitle, w/2, h/2 - 15);
      ctx.fillStyle = '#B45309';
      ctx.font = '10px "Pretendard"';
      ctx.fillText(readingSubtitle, w/2, h/2 + 8);
      ctx.fillStyle = '#DC2626';
      ctx.fillText(readingArtifact, w/2, h/2 + 28);
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
    } else if (interaction === 'hotspot-discovery' || interaction === 'resource-allocation' || interaction === 'reflection' || interaction === 'ordered-hotspot') {
      const state = engine.getSimulatorState(simMode);
      if (simMode === 'paleo-environment') {
        this.drawPaleoEnvironment(ctx, w, h, state);
      } else {
        this.drawPaleoActivity(ctx, w, h, simMode, state, simMode === 'paleo-fire' ? engine.paleoFireStep : state.found.length);
      }
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

  getPaleoEnvironmentHotspots(canvasWidth, canvasHeight) {
    return [
      { id: 'rock-shelter', label: '바위 그늘', x: 0.22, y: 0.52, radius: Math.min(canvasWidth, canvasHeight) * 0.14, feedback: '바람과 추위를 피할 수 있는 보금자리입니다.' },
      { id: 'riverbank', label: '강가', x: 0.72, y: 0.48, radius: Math.min(canvasWidth, canvasHeight) * 0.14, feedback: '물을 얻고 동물 흔적을 찾을 수 있지만 범람에 주의해야 합니다.' },
      { id: 'open-plain', label: '트인 평야', x: 0.48, y: 0.76, radius: Math.min(canvasWidth, canvasHeight) * 0.13, feedback: '시야는 넓지만 바람과 추위에 그대로 노출됩니다.' }
    ];
  },

  getPaleoEnvironmentHotspot(x, y, canvas) {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    return this.getPaleoEnvironmentHotspots(w, h).find(hotspot => {
      const dx = x - hotspot.x * w;
      const dy = y - hotspot.y * h;
      return Math.sqrt(dx * dx + dy * dy) <= hotspot.radius;
    });
  },

  setPaleoEnvironmentFeedback(message, hotspotId = null) {
    const feedback = document.getElementById('mn-canvas-feedback');
    if (feedback) feedback.textContent = message;
    if (hotspotId) this.drawSim();
  },

  drawPaleoEnvironment(ctx, w, h, state) {
    const hotspots = this.getPaleoEnvironmentHotspots(w, h);
    const found = state?.found || [];
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#b9d7d5');
    sky.addColorStop(0.58, '#dce5c4');
    sky.addColorStop(0.59, '#8da35c');
    sky.addColorStop(1, '#5c713d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 한탄강과 강가
    ctx.fillStyle = '#4d9ab3';
    ctx.beginPath();
    ctx.moveTo(w * 0.62, 0);
    ctx.bezierCurveTo(w * 0.48, h * 0.28, w * 0.83, h * 0.5, w * 0.64, h);
    ctx.lineTo(w * 0.93, h);
    ctx.bezierCurveTo(w * 0.96, h * 0.54, w * 0.68, h * 0.32, w * 0.78, 0);
    ctx.closePath();
    ctx.fill();

    // 바위 그늘
    ctx.fillStyle = '#66564a';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.64);
    ctx.lineTo(w * 0.08, h * 0.32);
    ctx.quadraticCurveTo(w * 0.22, h * 0.17, w * 0.38, h * 0.36);
    ctx.lineTo(w * 0.42, h * 0.64);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2e2925';
    ctx.beginPath();
    ctx.arc(w * 0.23, h * 0.55, Math.min(w, h) * 0.12, Math.PI, 0);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "Pretendard", sans-serif';
    hotspots.forEach(hotspot => {
      const cx = hotspot.x * w;
      const cy = hotspot.y * h;
      const isFound = found.includes(hotspot.id);
      ctx.fillStyle = isFound ? '#f59e0b' : 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = isFound ? '#fff7ed' : '#345c4b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, hotspot.radius * 0.68, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isFound ? '#422006' : '#16352b';
      ctx.fillText(isFound ? `✓ ${hotspot.label}` : hotspot.label, cx, cy + 4);
    });

    ctx.fillStyle = '#173b31';
    ctx.font = 'bold 12px "Pretendard", sans-serif';
    ctx.fillText(`환경 단서 찾기: ${found.length}/3`, w / 2, h - 16);
  },

  getPaleoHotspots(mode, canvasWidth, canvasHeight) {
    const configured = window.MudEngine?.currentSimulator?.hotspots;
    if (Array.isArray(configured) && configured.length > 0) {
      const radius = Math.min(canvasWidth, canvasHeight) * 0.14;
      return configured.map(hotspot => ({ ...hotspot, radius: hotspot.radius || radius }));
    }
    if (mode === 'paleo-environment') return this.getPaleoEnvironmentHotspots(canvasWidth, canvasHeight);
    const base = {
      'paleo-fire': [
        { id: 'dry-grass', label: '마른 풀', x: 0.23, y: 0.68, feedback: '불씨를 살릴 가벼운 재료입니다.' },
        { id: 'branches', label: '나뭇가지', x: 0.50, y: 0.67, feedback: '불씨를 오래 유지할 연료입니다.' },
        { id: 'stone', label: '부싯돌', x: 0.76, y: 0.66, feedback: '마찰로 불꽃을 만들 도구입니다.' }
      ],
      'paleo-stone': [
        { id: 'stone-edge', label: '가장자리', x: 0.25, y: 0.52, feedback: '가장자리부터 얇게 다듬어 날을 만듭니다.' },
        { id: 'stone-face', label: '돌의 면', x: 0.50, y: 0.43, feedback: '한쪽 면을 고르게 다듬어 쥐기 좋은 모양을 만듭니다.' },
        { id: 'stone-tip', label: '뾰족한 끝', x: 0.75, y: 0.52, feedback: '끝부분을 뾰족하게 다듬어 다양한 작업에 사용할 수 있습니다.' }
      ],
      'paleo-hunt': [
        { id: 'tracks', label: '동물 발자국', x: 0.24, y: 0.52, feedback: '동물이 지나간 방향을 알려 주는 단서입니다.' },
        { id: 'wind', label: '바람 방향', x: 0.50, y: 0.38, feedback: '바람을 거슬러 접근하면 냄새를 들키지 않을 수 있습니다.' },
        { id: 'rock-funnel', label: '바위 길목', x: 0.76, y: 0.54, feedback: '무리가 함께 움직일 때 동물을 유도하기 좋은 지형입니다.' }
      ],
      'paleo-community': [
        { id: 'food', label: '식량', x: 0.22, y: 0.48, feedback: '모두가 먹을 수 있도록 공동으로 나누어야 합니다.' },
        { id: 'fire', label: '불씨', x: 0.50, y: 0.38, feedback: '불씨를 지키는 사람이 있어야 공동체가 안전합니다.' },
        { id: 'tool', label: '도구', x: 0.78, y: 0.48, feedback: '필요한 사람이 함께 사용하도록 공유해야 합니다.' },
        { id: 'hide', label: '가죽', x: 0.50, y: 0.70, feedback: '추위를 막는 재료이므로 필요한 구성원에게 배분합니다.' }
      ],
      'paleo-reflection': [
        { id: 'environment', label: '환경 관찰', x: 0.22, y: 0.50, feedback: '구석기 사람들은 자연환경을 관찰해 생활 터전을 정했습니다.' },
        { id: 'technology', label: '도구와 불', x: 0.50, y: 0.40, feedback: '도구와 불은 추위와 위험을 이겨 내는 기술이었습니다.' },
        { id: 'cooperation', label: '공동체 협력', x: 0.78, y: 0.50, feedback: '이동 생활에서는 자원과 역할을 나누는 협력이 중요했습니다.' }
      ]
    }[mode] || [];
    const radius = Math.min(canvasWidth, canvasHeight) * 0.14;
    return base.map(hotspot => ({ ...hotspot, radius }));
  },

  getPaleoHotspotLabel(id) {
    const configured = window.MudEngine?.currentSimulator?.hotspots;
    const configuredHotspot = Array.isArray(configured) && configured.find(hotspot => hotspot.id === id);
    if (configuredHotspot) return configuredHotspot.label;
    const labels = { 'dry-grass': '마른 풀', branches: '나뭇가지', stone: '부싯돌' };
    return labels[id] || id;
  },

  getPaleoHotspot(mode, x, y, canvas) {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    return this.getPaleoHotspots(mode, w, h).find(hotspot => {
      const dx = x - hotspot.x * w;
      const dy = y - hotspot.y * h;
      return Math.sqrt(dx * dx + dy * dy) <= hotspot.radius;
    });
  },

  processPaleoDiscovery(mode, hotspot, engine) {
    const state = engine.getSimulatorState(mode);
    if (!hotspot) {
      this.setPaleoFeedback('화면의 표시된 단서를 눌러 활동을 계속하세요.');
      return false;
    }
    if (state.found.includes(hotspot.id)) {
      this.setPaleoFeedback(`${hotspot.label}은(는) 이미 확인했습니다. 다른 단서를 찾아보세요.`);
      return false;
    }
    state.found.push(hotspot.id);
    state.lastId = hotspot.id;
    engine.setSimulatorProgress(state.found.length);
    const total = this.getPaleoHotspots(mode, 100, 100).length;
    if (mode === 'paleo-stone') this.updatePaleoGauge(state.found.length, total);
    this.setPaleoFeedback(`${hotspot.label}: ${hotspot.feedback} (${state.found.length}/${total})`, hotspot.id);
    if (window.sounds) window.sounds.playClick();
    return true;
  },

  processOrderedHotspot(mode, hotspot, engine) {
    const state = engine.getSimulatorState(mode);
    const configured = Array.isArray(engine.currentSimulator?.hotspots);
    const sequence = engine.currentSimulator?.sequence || ['dry-grass', 'branches', 'stone'];
    const step = Number(state.step) || 0;
    if (!hotspot) {
      this.setPaleoFeedback(configured ? '화면의 재료를 안내된 순서대로 찾아보세요.' : '마른 풀·나뭇가지·부싯돌을 순서대로 찾아보세요.');
      return false;
    }
    // sequence에 없는 단서는 순서가 이른 게 아니라 이 판단과 무관한 함정 단서다. 힌트를 다르게 준다.
    if (!sequence.includes(hotspot.id)) {
      this.setPaleoFeedback(hotspot.feedback || `${hotspot.label}은(는) 이 판단과 관련이 없습니다. 다른 단서를 확인하세요.`);
      if (window.sounds) window.sounds.playWrong();
      return false;
    }
    if (hotspot.id !== sequence[step]) {
      this.setPaleoFeedback(`${hotspot.label}보다 먼저 ${this.getPaleoHotspotLabel(sequence[step])}을(를) 준비해야 합니다.`);
      return false;
    }
    state.found.push(hotspot.id);
    state.lastId = hotspot.id;
    state.step = step + 1;
    engine.setSimulatorProgress(state.step);
    this.updatePaleoGauge(state.step, sequence.length);
    this.setPaleoFeedback(`${hotspot.label}: ${hotspot.feedback} (${state.step}/${sequence.length})`, hotspot.id);
    if (window.sounds) window.sounds.playClick();
    return true;
  },

  drawPaleoActivity(ctx, w, h, mode, state, progress) {
    const scene = window.MudEngine?.currentSimulator?.scene;
    const colors = {
      'paleo-fire': ['#21150e', '#9a3412'],
      'paleo-stone': ['#27221d', '#78716c'],
      'paleo-hunt': ['#d9e8c1', '#537044'],
      'paleo-community': ['#eadfc9', '#9a7052'],
      'paleo-reflection': ['#e9eef2', '#4b6475'],
      'neolithic-village': ['#d8e8e5', '#5f806a'],
      'neolithic-pottery': ['#e7c79e', '#9b5d35'],
      'neolithic-weaving': ['#ead5b9', '#866145'],
      'neolithic-summary': ['#c7ddd0', '#57745f'],
      'gojoseon-map': ['#d7d4bc', '#617a52'],
      'gojoseon-law': ['#d8c4a1', '#7f5338'],
      'gojoseon-artifacts': ['#d8c5a4', '#7c5a2e'],
      'gojoseon-summary': ['#d8d0a8', '#796038'],
      'three-kingdoms-baekje': ['#d9e6ef', '#3f6f8f'],
      'three-kingdoms-goguryeo': ['#dfe3e8', '#4d5f6b'],
      'three-kingdoms-silla': ['#dde8dc', '#4f7050'],
      'unified-silla-government': ['#efe3c6', '#8a6435'],
      'unified-silla-bulguksa': ['#e3e6e2', '#6d7a6a'],
      'unified-silla-seokguram': ['#dcdad6', '#5b5751'],
      'unified-silla-summary': ['#e8ddc8', '#7b6242'],
      'balhae-evidence': ['#dee3d8', '#5f6f57'],
      'goryeo-culture-evidence': ['#e6ded0', '#7d6a45'],
      'goryeo-war-evidence': ['#dee3da', '#5f6f57'],
      'independence-evidence': ['#eee6d2', '#8a6435'],
      'colonial-1910s-evidence': ['#e2ded2', '#6b6255'],
      'colonial-1930s-evidence': ['#ded9d0', '#5c554a'],
      'joseon-folk-evidence': ['#efe2c8', '#8a5a35'],
      'joseon-founding-evidence': ['#e3e6da', '#5f7050'],
      'joseon-status-evidence': ['#e6ddc9', '#7c6640'],
      'modern-open-evidence': ['#dee6ec', '#456580'],
      'post-war-evidence': ['#e6e2d4', '#736355'],
      'sejong-evidence': ['#e9e2c9', '#7c6a3a'],
      'righteous-army-background': ['#e3ded0', '#8a734a'],
      'righteous-army-flag': ['#3d4450', '#c9b98c'],
      'righteous-army-trial': ['#e6e2d4', '#8a7355'],
      'righteous-army-exhibit': ['#e6e2d4', '#8a7355'],
      'joseon-border': ['#dfe6d8', '#4f7050'],
      'joseon-namhansanseong': ['#96a0ab', '#5c6b78'],
      'joseon-postwar': ['#e3e6da', '#5f6f57'],
      'joseon-diplomacy-exhibit': ['#e3e6da', '#8a734a'],
      'korean-war-outbreak': ['#dfe3e0', '#7c8480'],
      'korean-war-front': ['#dfe3e0', '#5f6f57'],
      'korean-war-armistice': ['#dfe6ec', '#456580'],
      'korean-war-exhibit': ['#e3e6da', '#5c6b78'],
      'three-kingdoms-summary': ['#d9e6ef', '#4f7050'],
      'goguryeo-mural-costume': ['#5c554a', '#4a4438'],
      'three-kingdoms-buddhism': ['#dcdad6', '#8a5a35'],
      'gaya-ironware': ['#3a3630', '#8a5a35'],
      'three-kingdoms-life-summary': ['#e6ded0', '#8a7355'],
      'balhae-dongmosan': ['#dfe3d8', '#5f6f57'],
      'balhae-document': ['#6f4b36', '#734526'],
      'balhae-heritage': ['#dee3d8', '#5f6f57']
    }[scene || mode] || ['#1f2937', '#64748b'];
    if (!this.drawConfiguredSceneBackground(ctx, w, h, scene)) {
      this.drawPaleoSceneBackground(ctx, w, h, mode, colors);
    }
    const hotspots = this.getPaleoHotspots(mode, w, h);
    const found = state?.found || [];
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px "Pretendard", sans-serif';
    hotspots.forEach(hotspot => {
      const cx = hotspot.x * w;
      const cy = hotspot.y * h;
      const isFound = found.includes(hotspot.id);
      ctx.fillStyle = isFound ? '#f59e0b' : 'rgba(255,255,255,0.92)';
      ctx.strokeStyle = isFound ? '#fff7ed' : colors[1];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, hotspot.radius * 0.68, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isFound ? '#422006' : '#1f2937';
      ctx.fillText(isFound ? `✓ ${hotspot.label}` : hotspot.label, cx, cy + 4);
    });
    ctx.fillStyle = mode === 'paleo-fire' || mode === 'paleo-stone' ? '#fef3c7' : '#1f2937';
    ctx.fillText(`진행: ${progress}/${hotspots.length}`, w / 2, h - 16);
  },

  // MUD JSON의 scene 키가 시대별 그림을 선택한다. 핫스팟·완료 로직은 공통으로 유지한다.
  drawConfiguredSceneBackground(ctx, w, h, scene) {
    if (!scene) return false;
    const groundY = h * 0.68;
    const fillSky = (top, bottom, ground) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, top); sky.addColorStop(0.64, bottom); sky.addColorStop(0.65, ground); sky.addColorStop(1, ground);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    };
    // 자료 종합형 장면이 공유하는 카드 3장 레이아웃. 좌·우 카드는 상단 핫스팟, 중하 카드는 하단 핫스팟과 짝을 이룬다.
    const card = (x, y, cw, ch) => {
      ctx.fillStyle = '#f7f1de'; ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 2;
      ctx.fillRect(w * x, h * y, w * cw, h * ch); ctx.strokeRect(w * x, h * y, w * cw, h * ch);
    };
    if (scene === 'neolithic-village') {
      fillSky('#b7dbe0', '#e5e2b7', '#77965b');
      ctx.fillStyle = '#539ab4'; ctx.beginPath(); ctx.moveTo(0, h * 0.44); ctx.bezierCurveTo(w * 0.2, h * 0.5, w * 0.13, h * 0.78, 0, h); ctx.lineTo(w * 0.2, h); ctx.bezierCurveTo(w * 0.3, h * 0.7, w * 0.32, h * 0.55, w * 0.18, h * 0.42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#755640'; ctx.beginPath(); ctx.ellipse(w * 0.78, groundY, w * 0.16, h * 0.12, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#47362a'; ctx.beginPath(); ctx.arc(w * 0.78, groundY, w * 0.05, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#c8a84f'; ctx.lineWidth = 3; [0.42, 0.47, 0.52, 0.57].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.72); ctx.lineTo(w * x + 10, h * 0.92); ctx.stroke(); });
      return true;
    }
    if (scene === 'bronze-dolmen-transport') {
      fillSky('#c9d9df', '#e9dfc2', '#9b825d');
      ctx.fillStyle = '#7b6447';
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.72);
      ctx.lineTo(w * 0.92, h * 0.72);
      ctx.lineTo(w * 0.78, h * 0.51);
      ctx.lineTo(w * 0.22, h * 0.51);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8d9a86';
      ctx.fillRect(w * 0.36, h * 0.36, w * 0.28, h * 0.09);
      ctx.fillStyle = '#6f7b70';
      ctx.fillRect(w * 0.4, h * 0.46, w * 0.06, h * 0.23);
      ctx.fillRect(w * 0.54, h * 0.46, w * 0.06, h * 0.23);
      ctx.strokeStyle = '#72553a';
      ctx.lineWidth = 5;
      for (let x = 0.31; x <= 0.69; x += 0.09) {
        ctx.beginPath();
        ctx.moveTo(w * x, h * 0.63);
        ctx.lineTo(w * (x + 0.04), h * 0.69);
        ctx.stroke();
      }
      ctx.fillStyle = '#4d6b55';
      ctx.fillRect(w * 0.08, h * 0.24, w * 0.12, h * 0.04);
      ctx.fillRect(w * 0.8, h * 0.28, w * 0.1, h * 0.04);
      return true;
    }
    if (scene === 'neolithic-pottery') {
      fillSky('#f0c77e', '#e5a45d', '#a35f3b');
      ctx.fillStyle = '#7e442b'; ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#bc7040'; ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.7); ctx.quadraticCurveTo(w * 0.4, h * 0.35, w * 0.5, h * 0.3); ctx.quadraticCurveTo(w * 0.6, h * 0.35, w * 0.62, h * 0.7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#633821'; ctx.lineWidth = 2; for (let y = 0.4; y < 0.64; y += 0.06) { ctx.beginPath(); ctx.moveTo(w * 0.43, h * y); ctx.lineTo(w * 0.57, h * (y + 0.05)); ctx.stroke(); }
      ctx.fillStyle = '#7b4c2d'; ctx.beginPath(); ctx.ellipse(w * 0.2, h * 0.75, w * 0.11, h * 0.045, 0, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'neolithic-weaving') {
      fillSky('#e8d3ae', '#f6e7ca', '#9c7652');
      ctx.fillStyle = '#704c37'; ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = '#79543b'; ctx.lineWidth = 7; ctx.strokeRect(w * 0.36, h * 0.25, w * 0.28, h * 0.42);
      ctx.strokeStyle = '#e9d8ad'; ctx.lineWidth = 2; for (let x = 0.4; x < 0.62; x += 0.045) { ctx.beginPath(); ctx.moveTo(w * x, h * 0.27); ctx.lineTo(w * x, h * 0.65); ctx.stroke(); }
      ctx.fillStyle = '#ded7c6'; ctx.beginPath(); ctx.arc(w * 0.18, h * 0.56, w * 0.06, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#4b3528'; ctx.beginPath(); ctx.arc(w * 0.18, h * 0.56, w * 0.018, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e7d8bd'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.76, h * 0.4); ctx.lineTo(w * 0.88, h * 0.63); ctx.stroke();
      return true;
    }
    if (scene === 'neolithic-summary') {
      fillSky('#a8d0c2', '#f1d59c', '#67865d');
      ctx.fillStyle = '#715441'; ctx.beginPath(); ctx.moveTo(w * 0.16, groundY); ctx.lineTo(w * 0.3, h * 0.4); ctx.lineTo(w * 0.44, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ba7444'; ctx.beginPath(); ctx.moveTo(w * 0.67, h * 0.66); ctx.quadraticCurveTo(w * 0.69, h * 0.39, w * 0.78, h * 0.38); ctx.quadraticCurveTo(w * 0.87, h * 0.4, w * 0.89, h * 0.66); ctx.closePath(); ctx.fill();
      return true;
    }
    if (scene === 'gojoseon-map') {
      fillSky('#d8dec0', '#eee0b2', '#88a35e');
      ctx.fillStyle = '#8fa15c'; ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.33); ctx.lineTo(w * 0.42, h * 0.25); ctx.lineTo(w * 0.66, h * 0.43); ctx.lineTo(w * 0.86, h * 0.35); ctx.lineTo(w * 0.84, h * 0.77); ctx.lineTo(w * 0.55, h * 0.83); ctx.lineTo(w * 0.28, h * 0.67); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#607342'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.moveTo(w * 0.67, 0); ctx.bezierCurveTo(w * 0.55, h * 0.3, w * 0.83, h * 0.55, w * 0.7, h); ctx.lineTo(w * 0.88, h); ctx.bezierCurveTo(w * 0.98, h * 0.5, w * 0.72, h * 0.28, w * 0.84, 0); ctx.closePath(); ctx.fill();
      return true;
    }
    if (scene === 'gojoseon-law') {
      fillSky('#6f4b36', '#bc8a55', '#5d422f');
      ctx.fillStyle = '#8b5f3e'; ctx.fillRect(w * 0.12, h * 0.18, w * 0.76, h * 0.54);
      ctx.fillStyle = '#e6c991'; ctx.fillRect(w * 0.34, h * 0.26, w * 0.32, h * 0.34); ctx.strokeStyle = '#734526'; ctx.lineWidth = 3; ctx.strokeRect(w * 0.34, h * 0.26, w * 0.32, h * 0.34);
      ctx.strokeStyle = '#885731'; ctx.lineWidth = 2; [0.35, 0.43, 0.51].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.39, h * y); ctx.lineTo(w * 0.61, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'gojoseon-artifacts') {
      fillSky('#d7c39e', '#ebd99f', '#86633a');
      ctx.fillStyle = '#7f6248'; ctx.beginPath(); ctx.moveTo(w * 0.35, groundY); ctx.lineTo(w * 0.42, h * 0.38); ctx.lineTo(w * 0.61, h * 0.38); ctx.lineTo(w * 0.68, groundY); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#bfa77c'; ctx.fillRect(w * 0.3, h * 0.35, w * 0.42, h * 0.09);
      ctx.fillStyle = '#9a6a27'; ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.7); ctx.quadraticCurveTo(w * 0.12, h * 0.46, w * 0.2, h * 0.34); ctx.quadraticCurveTo(w * 0.29, h * 0.46, w * 0.23, h * 0.7); ctx.closePath(); ctx.fill(); ctx.fillRect(w * 0.195, h * 0.68, w * 0.012, h * 0.16);
      return true;
    }
    if (scene === 'gojoseon-summary') {
      fillSky('#d7c882', '#efdda3', '#7c9255');
      ctx.fillStyle = '#795238'; ctx.beginPath(); ctx.moveTo(w * 0.12, groundY); ctx.lineTo(w * 0.28, h * 0.35); ctx.lineTo(w * 0.44, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.72, h * 0.34, w * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#7e5a28'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.46); ctx.lineTo(w * 0.72, h * 0.73); ctx.stroke();
      return true;
    }
    if (scene === 'hwangsanbeol-battle') {
      fillSky('#e7d4ad', '#f3e5c7', '#9a744d');
      ctx.fillStyle = '#78624a';
      ctx.beginPath(); ctx.moveTo(w * 0.04, h * 0.7); ctx.lineTo(w * 0.3, h * 0.35); ctx.lineTo(w * 0.5, h * 0.7); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.55, h * 0.7); ctx.lineTo(w * 0.76, h * 0.4); ctx.lineTo(w * 0.98, h * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b33b32'; ctx.fillRect(w * 0.08, h * 0.76, w * 0.18, h * 0.06);
      ctx.fillStyle = '#315b86'; ctx.fillRect(w * 0.74, h * 0.76, w * 0.18, h * 0.06);
      ctx.fillStyle = '#3f3125'; ctx.font = 'bold 11px "Pretendard"'; ctx.textAlign = 'center'; ctx.fillText('황산벌 · 신라군과 백제 결사대', w / 2, h - 15);
      return true;
    }
    if (scene === 'maesoseong-defense') {
      fillSky('#c9d8df', '#e7e1c5', '#6f875d');
      ctx.fillStyle = '#596b5b'; ctx.beginPath(); ctx.moveTo(w * 0.05, h * 0.72); ctx.lineTo(w * 0.24, h * 0.28); ctx.lineTo(w * 0.42, h * 0.72); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4b5563'; ctx.fillRect(w * 0.09, h * 0.6, w * 0.28, h * 0.07);
      ctx.fillStyle = '#b45309'; ctx.fillRect(w * 0.63, h * 0.36, w * 0.26, h * 0.08);
      ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 3; ctx.setLineDash([8, 5]); ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.78); ctx.lineTo(w * 0.9, h * 0.45); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#1f2937'; ctx.font = 'bold 11px "Pretendard"'; ctx.textAlign = 'center'; ctx.fillText('매소성 · 산성 방어와 당군 보급로', w / 2, h - 15);
      return true;
    }
    if (scene === 'cheomunryeong-battle') {
      fillSky('#b8d0d5', '#dbe4cf', '#526b4e');
      ctx.fillStyle = '#405c4b'; ctx.beginPath(); ctx.moveTo(0, h * 0.82); ctx.lineTo(w * 0.28, h * 0.2); ctx.lineTo(w * 0.46, h * 0.82); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w, h * 0.82); ctx.lineTo(w * 0.72, h * 0.16); ctx.lineTo(w * 0.54, h * 0.82); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9bb36b'; ctx.fillRect(w * 0.44, h * 0.6, w * 0.12, h * 0.12);
      ctx.strokeStyle = '#d6b66a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.74); ctx.quadraticCurveTo(w * 0.62, h * 0.58, w * 0.86, h * 0.34); ctx.stroke();
      ctx.fillStyle = '#fef3c7'; ctx.font = 'bold 11px "Pretendard"'; ctx.textAlign = 'center'; ctx.fillText('천문령 · 협곡을 지나 동모산으로', w / 2, h - 15);
      return true;
    }
    if (scene === 'three-kingdoms-baekje') {
      fillSky('#cfe6ee', '#eef2d6', '#8ab36e');
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.34, 0); ctx.bezierCurveTo(w * 0.22, h * 0.28, w * 0.3, h * 0.5, w * 0.16, h * 0.66); ctx.lineTo(0, h * 0.56); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b7d79a'; ctx.beginPath(); ctx.ellipse(w * 0.3, h * 0.44, w * 0.1, h * 0.09, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w * 0.62, h); ctx.lineTo(w * 0.62, h * 0.82); ctx.bezierCurveTo(w * 0.4, h * 0.7, w * 0.18, h * 0.86, 0, h * 0.78); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.9); ctx.quadraticCurveTo(w * 0.32, h * 0.78, w * 0.52, h * 0.84); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#6b4c33'; ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.82); ctx.lineTo(w * 0.56, h * 0.82); ctx.lineTo(w * 0.52, h * 0.9); ctx.lineTo(w * 0.48, h * 0.9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8e2c8'; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.82); ctx.lineTo(w * 0.5, h * 0.72); ctx.lineTo(w * 0.57, h * 0.82); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3f6f8f'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(w * 0.64, h * 0.22); ctx.lineTo(w * 0.93, h * 0.3); ctx.lineTo(w * 0.9, h * 0.7); ctx.lineTo(w * 0.66, h * 0.74); ctx.lineTo(w * 0.6, h * 0.46); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'three-kingdoms-goguryeo') {
      fillSky('#dbe6ec', '#eef0e4', '#7f9468');
      ctx.fillStyle = '#5a6b78'; ctx.beginPath(); ctx.moveTo(w * 0.58, groundY); ctx.lineTo(w * 0.7, h * 0.3); ctx.lineTo(w * 0.82, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4d5f6b'; ctx.beginPath(); ctx.moveTo(w * 0.74, groundY); ctx.lineTo(w * 0.85, h * 0.4); ctx.lineTo(w * 0.97, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8b7355'; ctx.fillRect(w * 0.7, h * 0.56, w * 0.16, h * 0.12); ctx.fillRect(w * 0.73, h * 0.5, w * 0.02, h * 0.06); ctx.fillRect(w * 0.81, h * 0.5, w * 0.02, h * 0.06);
      ctx.fillStyle = '#8b7355'; ctx.fillRect(w * 0.13, h * 0.54, w * 0.2, h * 0.14); ctx.fillRect(w * 0.16, h * 0.47, w * 0.02, h * 0.07); ctx.fillRect(w * 0.28, h * 0.47, w * 0.02, h * 0.07);
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.lineTo(w, h * 0.86); ctx.quadraticCurveTo(w * 0.5, h * 0.94, 0, h * 0.84); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(w * 0.82, h * 0.5); ctx.quadraticCurveTo(w * 0.65, h * 0.72, w * 0.5, h * 0.86); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'three-kingdoms-silla') {
      fillSky('#dce9dc', '#eef2e0', '#7f9468');
      ctx.fillStyle = '#7f9468'; ctx.beginPath(); ctx.moveTo(w * 0.08, groundY); ctx.lineTo(w * 0.24, h * 0.32); ctx.lineTo(w * 0.4, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9d2b8'; ctx.fillRect(w * 0.2, h * 0.36, w * 0.05, h * 0.14); ctx.fillStyle = '#3a3630'; ctx.fillRect(w * 0.205, h * 0.4, w * 0.04, h * 0.015); ctx.fillRect(w * 0.205, h * 0.44, w * 0.04, h * 0.015); ctx.fillRect(w * 0.205, h * 0.48, w * 0.04, h * 0.015);
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.lineTo(w, h * 0.84); ctx.quadraticCurveTo(w * 0.5, h * 0.94, 0, h * 0.86); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.moveTo(w * 0.92, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.62); ctx.bezierCurveTo(w * 0.94, h * 0.5, w * 0.98, h * 0.32, w * 0.9, h * 0.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7c8f74'; ctx.fillRect(w * 0.68, h * 0.42, w * 0.16, h * 0.14); ctx.strokeStyle = '#5c6b52'; ctx.lineWidth = 1.5; ctx.strokeRect(w * 0.68, h * 0.42, w * 0.16, h * 0.14); ctx.fillRect(w * 0.71, h * 0.36, w * 0.02, h * 0.06); ctx.fillRect(w * 0.83, h * 0.36, w * 0.02, h * 0.06);
      return true;
    }
    if (scene === 'unified-silla-government') {
      fillSky('#efe3c6', '#f7f0da', '#d9c58f');
      ctx.fillStyle = '#f3ecd6'; ctx.fillRect(w * 0.06, h * 0.16, w * 0.88, h * 0.62);
      ctx.fillStyle = '#8a6435'; ctx.fillRect(w * 0.03, h * 0.14, w * 0.03, h * 0.66); ctx.fillRect(w * 0.94, h * 0.14, w * 0.03, h * 0.66);
      ctx.strokeStyle = '#a98b52'; ctx.lineWidth = 1.5;
      for (let r = 0; r < 3; r++) { for (let c = 0; c < 3; c++) { ctx.strokeRect(w * (0.13 + c * 0.06), h * (0.32 + r * 0.09), w * 0.05, h * 0.07); } }
      ctx.fillStyle = '#8a6435'; [0.42, 0.47, 0.52, 0.57, 0.62].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.7); ctx.lineTo(w * x - w * 0.012, h * 0.62); ctx.lineTo(w * x + w * 0.012, h * 0.62); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = '#b5342a'; ctx.fillRect(w * 0.74, h * 0.32, w * 0.12, h * 0.12);
      ctx.strokeStyle = '#8a6435'; ctx.lineWidth = 2; [0.52, 0.58, 0.64].forEach(yy => { ctx.beginPath(); ctx.moveTo(w * 0.72, h * yy); ctx.lineTo(w * 0.92, h * yy); ctx.stroke(); });
      return true;
    }
    if (scene === 'unified-silla-bulguksa') {
      fillSky('#cfe3ea', '#eef1ea', '#c2bb9f');
      ctx.fillStyle = '#b9b29a'; ctx.fillRect(0, h * 0.82, w, h * 0.18); ctx.fillStyle = '#a39c86'; ctx.fillRect(0, h * 0.82, w, h * 0.04);
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.15, h * 0.62, w * 0.14, h * 0.06); ctx.fillRect(w * 0.17, h * 0.52, w * 0.1, h * 0.1); ctx.fillRect(w * 0.19, h * 0.42, w * 0.06, h * 0.1); ctx.fillRect(w * 0.205, h * 0.34, w * 0.03, h * 0.08);
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.44, h * 0.64, w * 0.22, h * 0.05); ctx.fillRect(w * 0.47, h * 0.5, w * 0.16, h * 0.08); ctx.fillRect(w * 0.5, h * 0.4, w * 0.1, h * 0.1); ctx.beginPath(); ctx.arc(w * 0.55, h * 0.37, w * 0.02, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6d6653'; ctx.lineWidth = 1.2; [0.46, 0.5, 0.54, 0.58, 0.62].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.64); ctx.lineTo(w * x, h * 0.58); ctx.stroke(); });
      ctx.fillStyle = '#8f8975'; ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.86); ctx.lineTo(w * 0.7, h * 0.6); ctx.lineTo(w * 0.78, h * 0.6); ctx.lineTo(w * 0.78, h * 0.34); ctx.lineTo(w * 0.9, h * 0.34); ctx.lineTo(w * 0.9, h * 0.86); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#6d6653'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(w * 0.7, h * (0.86 - i * 0.065)); ctx.lineTo(w * 0.9, h * (0.86 - i * 0.065)); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(w * 0.8, h * 0.86, w * 0.05, Math.PI, 0); ctx.stroke();
      return true;
    }
    if (scene === 'unified-silla-seokguram') {
      fillSky('#3a3d42', '#5c5f5b', '#cfc9bb');
      ctx.strokeStyle = '#83807a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.72); ctx.quadraticCurveTo(w * 0.5, h * 0.02, w * 0.92, h * 0.72); ctx.stroke();
      ctx.lineWidth = 1.3; [[0.22, 0.5], [0.36, 0.24], [0.5, 0.14], [0.64, 0.24], [0.78, 0.5]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.72); ctx.lineTo(w * x, h * y); ctx.stroke(); });
      ctx.fillStyle = '#5f5c54'; ctx.beginPath(); ctx.arc(w * 0.22, h * 0.5, w * 0.045, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9c988e'; ctx.beginPath(); ctx.moveTo(w * 0.47, h * 0.14); ctx.lineTo(w * 0.53, h * 0.14); ctx.lineTo(w * 0.5, h * 0.05); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4a4740'; [0.42, 0.48, 0.54, 0.6].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.86); ctx.lineTo(w * x + w * 0.035, h * 0.86); ctx.lineTo(w * x + w * 0.018, h * 0.72); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = '#9c988e'; ctx.beginPath(); ctx.arc(w * 0.78, h * 0.55, w * 0.09, Math.PI, 0); ctx.lineTo(w * 0.71, h * 0.7); ctx.lineTo(w * 0.85, h * 0.7); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c9a34a'; ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.72, w * 0.07, h * 0.02, 0, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'unified-silla-summary') {
      fillSky('#e8ddc8', '#f3ecda', '#dcc89a');
      ctx.fillStyle = '#f7f1de'; ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 2;
      ctx.fillRect(w * 0.08, h * 0.28, w * 0.22, h * 0.42); ctx.strokeRect(w * 0.08, h * 0.28, w * 0.22, h * 0.42);
      ctx.fillRect(w * 0.39, h * 0.44, w * 0.22, h * 0.4); ctx.strokeRect(w * 0.39, h * 0.44, w * 0.22, h * 0.4);
      ctx.fillRect(w * 0.7, h * 0.28, w * 0.22, h * 0.42); ctx.strokeRect(w * 0.7, h * 0.28, w * 0.22, h * 0.42);
      ctx.strokeStyle = '#9c8f6c'; ctx.lineWidth = 1.2;
      for (let r = 0; r < 3; r++) { for (let c = 0; c < 2; c++) { ctx.strokeRect(w * (0.11 + c * 0.08), h * (0.34 + r * 0.09), w * 0.06, h * 0.06); } }
      ctx.fillStyle = '#8f8975'; ctx.beginPath(); ctx.moveTo(w * 0.45, h * 0.78); ctx.lineTo(w * 0.49, h * 0.6); ctx.lineTo(w * 0.55, h * 0.6); ctx.lineTo(w * 0.59, h * 0.78); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.73, h * 0.58); ctx.quadraticCurveTo(w * 0.78, h * 0.52, w * 0.83, h * 0.58); ctx.quadraticCurveTo(w * 0.88, h * 0.64, w * 0.93, h * 0.58); ctx.stroke();
      ctx.fillStyle = '#6b4c33'; ctx.beginPath(); ctx.moveTo(w * 0.76, h * 0.62); ctx.lineTo(w * 0.86, h * 0.62); ctx.lineTo(w * 0.83, h * 0.68); ctx.lineTo(w * 0.79, h * 0.68); ctx.closePath(); ctx.fill();
      return true;
    }
    if (scene === 'balhae-evidence') {
      fillSky('#c9d2c2', '#e7e6d2', '#b9c2a0');
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.1, h * 0.5, w * 0.24, h * 0.06);
      ctx.strokeStyle = '#5f5c54'; ctx.lineWidth = 1.5; [0.55, 0.6, 0.65].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.12, h * y); ctx.lineTo(w * 0.32, h * y); ctx.stroke(); });
      ctx.fillStyle = '#96906f'; ctx.beginPath(); ctx.ellipse(w * 0.22, h * 0.42, w * 0.09, h * 0.09, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#e8e2c8'; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.36); ctx.lineTo(w * 0.58, h * 0.36); ctx.lineTo(w * 0.58, h * 0.72); ctx.lineTo(w * 0.42, h * 0.72); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a7a4e'; ctx.lineWidth = 1.5; [0.46, 0.5, 0.54].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.4); ctx.lineTo(w * x, h * 0.68); ctx.stroke(); });
      ctx.fillStyle = '#7c8a68'; ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.6); ctx.lineTo(w * 0.68, h * 0.44); ctx.lineTo(w * 0.75, h * 0.36); ctx.lineTo(w * 0.82, h * 0.44); ctx.lineTo(w * 0.82, h * 0.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a9678'; ctx.beginPath(); ctx.moveTo(w * 0.84, h * 0.6); ctx.lineTo(w * 0.84, h * 0.44); ctx.lineTo(w * 0.91, h * 0.36); ctx.lineTo(w * 0.98, h * 0.44); ctx.lineTo(w * 0.98, h * 0.6); ctx.closePath(); ctx.fill();
      return true;
    }
    if (scene === 'goryeo-culture-evidence') {
      fillSky('#e6ded0', '#f2ecdd', '#c9b98c');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.fillStyle = '#8a734a'; ctx.fillRect(w * 0.12, h * 0.42, w * 0.14, h * 0.05); ctx.fillRect(w * 0.12, h * 0.5, w * 0.14, h * 0.05); ctx.fillRect(w * 0.12, h * 0.58, w * 0.14, h * 0.05);
      ctx.strokeStyle = '#6d5a38'; ctx.lineWidth = 1; [0.445, 0.525, 0.605].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.13, h * y); ctx.lineTo(w * 0.25, h * y); ctx.stroke(); });
      ctx.fillStyle = '#5c4a2e'; for (let r = 0; r < 2; r++) { for (let c = 0; c < 3; c++) { ctx.fillRect(w * (0.43 + c * 0.045), h * (0.56 + r * 0.09), w * 0.03, h * 0.06); } }
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.73, h * 0.58); ctx.quadraticCurveTo(w * 0.78, h * 0.52, w * 0.83, h * 0.58); ctx.quadraticCurveTo(w * 0.88, h * 0.64, w * 0.93, h * 0.58); ctx.stroke();
      ctx.fillStyle = '#6b4c33'; ctx.beginPath(); ctx.moveTo(w * 0.76, h * 0.5); ctx.lineTo(w * 0.86, h * 0.5); ctx.lineTo(w * 0.83, h * 0.58); ctx.lineTo(w * 0.79, h * 0.58); ctx.closePath(); ctx.fill();
      return true;
    }
    if (scene === 'goryeo-war-evidence') {
      fillSky('#dee3da', '#eef1e6', '#8a9678');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = '#a9915f'; ctx.lineWidth = 1.5;
      ctx.fillRect(w * 0.12, h * 0.4, w * 0.08, h * 0.16); ctx.strokeRect(w * 0.12, h * 0.4, w * 0.08, h * 0.16);
      ctx.fillRect(w * 0.17, h * 0.48, w * 0.08, h * 0.16); ctx.strokeRect(w * 0.17, h * 0.48, w * 0.08, h * 0.16);
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.56); ctx.quadraticCurveTo(w * 0.5, h * 0.68, w * 0.58, h * 0.56); ctx.stroke();
      ctx.fillStyle = '#5f6f57'; [[0.43, 0.58], [0.46, 0.54], [0.5, 0.52], [0.54, 0.53], [0.57, 0.56], [0.6, 0.6]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.009, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.74, h * 0.42, w * 0.14, h * 0.2);
      ctx.strokeStyle = '#6d6653'; ctx.lineWidth = 1.2; [0.48, 0.54, 0.6].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.74, h * y); ctx.lineTo(w * 0.88, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'independence-evidence') {
      fillSky('#eee6d2', '#f6f0dd', '#c9b98c');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#8a6435'; ctx.lineWidth = 1.5; [0.42, 0.5, 0.58].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.13, h * y); ctx.lineTo(w * 0.26, h * y); ctx.stroke(); });
      ctx.fillStyle = '#8a7355'; [0.43, 0.5, 0.57].forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.54, w * 0.018, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.02, h * 0.72); ctx.lineTo(w * x + w * 0.02, h * 0.72); ctx.lineTo(w * x + w * 0.014, h * 0.58); ctx.lineTo(w * x - w * 0.014, h * 0.58); ctx.closePath(); ctx.fill(); });
      ctx.strokeStyle = '#8a6435'; ctx.lineWidth = 1.5; [0.42, 0.5].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.75, h * y); ctx.lineTo(w * 0.88, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#b5342a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.83, h * 0.58, w * 0.035, 0, Math.PI * 2); ctx.stroke();
      return true;
    }
    if (scene === 'colonial-1910s-evidence') {
      fillSky('#e2ded2', '#eeeae0', '#a9a08c');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#6b6255'; ctx.lineWidth = 1.5; [0.42, 0.5, 0.58].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.13, h * y); ctx.lineTo(w * 0.26, h * y); ctx.stroke(); });
      ctx.fillStyle = '#4a4740'; ctx.fillRect(w * 0.19, h * 0.62, w * 0.05, h * 0.05);
      ctx.strokeStyle = '#6b6255'; ctx.lineWidth = 1; for (let c = 0; c < 4; c++) { ctx.beginPath(); ctx.moveTo(w * (0.42 + c * 0.05), h * 0.5); ctx.lineTo(w * (0.42 + c * 0.05), h * 0.78); ctx.stroke(); } for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.moveTo(w * 0.42, h * (0.5 + r * 0.09)); ctx.lineTo(w * 0.57, h * (0.5 + r * 0.09)); ctx.stroke(); }
      ctx.fillStyle = '#6b6255'; [0.44, 0.49, 0.54].forEach(x => { ctx.fillRect(w * x, h * 0.44, w * 0.006, h * 0.08); });
      ctx.fillStyle = '#efe9dc'; ctx.beginPath(); ctx.moveTo(w * 0.76, h * 0.42); ctx.lineTo(w * 0.87, h * 0.42); ctx.lineTo(w * 0.87, h * 0.54); ctx.lineTo(w * 0.815, h * 0.6); ctx.lineTo(w * 0.76, h * 0.54); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a7355'; ctx.beginPath(); ctx.arc(w * 0.815, h * 0.5, w * 0.015, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'colonial-1930s-evidence') {
      fillSky('#ded9d0', '#eae6dc', '#9a9284');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1.5; [0.42, 0.48, 0.54].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.13, h * y); ctx.lineTo(w * 0.26, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#7c5a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.19, h * 0.62, w * 0.03, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#efe9dc'; ctx.fillRect(w * 0.42, h * 0.5, w * 0.15, h * 0.26);
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1; [0.45, 0.49, 0.53].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.52); ctx.lineTo(w * x, h * 0.74); ctx.stroke(); });
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1; for (let r = 0; r < 4; r++) { for (let c = 0; c < 4; c++) { ctx.strokeRect(w * (0.75 + c * 0.03), h * (0.42 + r * 0.045), w * 0.026, h * 0.038); } }
      return true;
    }
    if (scene === 'joseon-folk-evidence') {
      fillSky('#efe2c8', '#f7eeda', '#c9a86a');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 3; ctx.strokeRect(w * 0.11, h * 0.34, w * 0.16, h * 0.28);
      ctx.fillStyle = '#8a7355'; [0.17, 0.22].forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.44, w * 0.016, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.018, h * 0.58); ctx.lineTo(w * x + w * 0.018, h * 0.58); ctx.lineTo(w * x + w * 0.012, h * 0.46); ctx.lineTo(w * x - w * 0.012, h * 0.46); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.ellipse(w * 0.46, h * 0.66, w * 0.035, h * 0.06, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5c3d24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.43, h * 0.6); ctx.lineTo(w * 0.49, h * 0.6); ctx.moveTo(w * 0.43, h * 0.72); ctx.lineTo(w * 0.49, h * 0.72); ctx.stroke();
      ctx.fillStyle = '#c9a86a'; ctx.beginPath(); ctx.moveTo(w * 0.53, h * 0.66); ctx.arc(w * 0.53, h * 0.66, w * 0.05, Math.PI * 1.2, Math.PI * 1.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9b877'; ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(w * 0.81, h * 0.5, w * 0.07, h * 0.09, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8a5a35'; [0.775, 0.845].forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.47, w * 0.012, 0, Math.PI * 2); ctx.fill(); });
      return true;
    }
    if (scene === 'joseon-founding-evidence') {
      fillSky('#e3e6da', '#eef1e6', '#7f9468');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.62); ctx.quadraticCurveTo(w * 0.19, h * 0.54, w * 0.28, h * 0.62); ctx.stroke();
      ctx.fillStyle = '#5f7050';
      ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.54); ctx.lineTo(w * 0.14, h * 0.44); ctx.lineTo(w * 0.18, h * 0.54); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.54); ctx.lineTo(w * 0.2, h * 0.38); ctx.lineTo(w * 0.25, h * 0.54); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.21, h * 0.54); ctx.lineTo(w * 0.25, h * 0.46); ctx.lineTo(w * 0.29, h * 0.54); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.41, h * 0.58, w * 0.06, h * 0.18); ctx.beginPath(); ctx.arc(w * 0.44, h * 0.58, w * 0.03, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.51, h * 0.62); ctx.lineTo(w * 0.58, h * 0.5); ctx.lineTo(w * 0.65, h * 0.62); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * 0.535, h * 0.5); ctx.lineTo(w * 0.58, h * 0.42); ctx.lineTo(w * 0.625, h * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.76, h * 0.44, w * 0.14, h * 0.1); ctx.beginPath(); ctx.moveTo(w * 0.74, h * 0.44); ctx.lineTo(w * 0.83, h * 0.36); ctx.lineTo(w * 0.92, h * 0.44); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8e2c8'; ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 1;
      ctx.fillRect(w * 0.75, h * 0.56, w * 0.13, h * 0.035); ctx.strokeRect(w * 0.75, h * 0.56, w * 0.13, h * 0.035);
      ctx.fillRect(w * 0.755, h * 0.6, w * 0.13, h * 0.035); ctx.strokeRect(w * 0.755, h * 0.6, w * 0.13, h * 0.035);
      ctx.fillRect(w * 0.76, h * 0.64, w * 0.13, h * 0.035); ctx.strokeRect(w * 0.76, h * 0.64, w * 0.13, h * 0.035);
      return true;
    }
    if (scene === 'joseon-status-evidence') {
      fillSky('#e6ddc9', '#f2ecd9', '#a9915f');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = '#8a734a'; ctx.lineWidth = 2; ctx.fillRect(w * 0.13, h * 0.4, w * 0.14, h * 0.24); ctx.strokeRect(w * 0.13, h * 0.4, w * 0.14, h * 0.24);
      ctx.strokeStyle = '#7c6640'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.13, h * 0.52); ctx.lineTo(w * 0.27, h * 0.52); ctx.moveTo(w * 0.13, h * 0.58); ctx.lineTo(w * 0.27, h * 0.58); ctx.stroke();
      ctx.fillStyle = '#8a734a'; ctx.beginPath(); ctx.ellipse(w * 0.45, h * 0.68, w * 0.03, h * 0.05, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * 0.435, h * 0.5, w * 0.03, h * 0.18);
      ctx.strokeStyle = '#5c3d24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.55, h * 0.74); ctx.lineTo(w * 0.58, h * 0.5); ctx.stroke(); ctx.fillStyle = '#3a3630'; ctx.beginPath(); ctx.arc(w * 0.58, h * 0.48, w * 0.012, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = '#7c6640'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.75, h * 0.42, w * 0.14, h * 0.22); ctx.strokeRect(w * 0.75, h * 0.42, w * 0.14, h * 0.22);
      ctx.strokeStyle = '#7c6640'; ctx.lineWidth = 1; [0.79, 0.83, 0.87].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.44); ctx.lineTo(w * x, h * 0.62); ctx.stroke(); });
      return true;
    }
    if (scene === 'modern-open-evidence') {
      fillSky('#dee6ec', '#eef2ea', '#8ab0c2');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#456580'; ctx.lineWidth = 1.5; [0.42, 0.48, 0.54].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.13, h * y); ctx.lineTo(w * 0.26, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.15, h * 0.62, w * 0.022, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(w * 0.23, h * 0.62, w * 0.022, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.43, h * 0.56, w * 0.14, h * 0.16);
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.41, h * 0.56); ctx.lineTo(w * 0.5, h * 0.48); ctx.lineTo(w * 0.59, h * 0.56); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#456580'; ctx.fillRect(w * 0.585, h * 0.62, w * 0.03, h * 0.04); ctx.fillRect(w * 0.598, h * 0.66, w * 0.004, h * 0.06);
      ctx.fillStyle = '#5c6b78'; ctx.fillRect(w * 0.74, h * 0.54, w * 0.16, h * 0.1); ctx.strokeStyle = '#3a4148'; ctx.lineWidth = 1; ctx.strokeRect(w * 0.74, h * 0.54, w * 0.16, h * 0.1);
      ctx.fillStyle = '#3a4148'; [0.775, 0.86].forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.66, w * 0.014, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.84, h * 0.42, w * 0.022, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#7e5a28'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.84, h * 0.44); ctx.lineTo(w * 0.84, h * 0.5); ctx.stroke();
      return true;
    }
    if (scene === 'post-war-evidence') {
      fillSky('#e6e2d4', '#f0ece0', '#9a9284');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.14, h * 0.56, w * 0.12, h * 0.1);
      ctx.fillStyle = '#736355'; ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.56); ctx.lineTo(w * 0.2, h * 0.46); ctx.lineTo(w * 0.28, h * 0.56); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.2, h * 0.68, w * 0.025, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.72); ctx.lineTo(w * 0.5, h * 0.48); ctx.lineTo(w * 0.58, h * 0.72); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.48); ctx.lineTo(w * 0.5, h * 0.72); ctx.stroke();
      ctx.fillStyle = '#3a4148'; ctx.fillRect(w * 0.6, h * 0.58, w * 0.1, h * 0.08);
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#736355'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.76, h * 0.44); ctx.lineTo(w * 0.9, h * 0.44); ctx.lineTo(w * 0.9, h * 0.58); ctx.lineTo(w * 0.83, h * 0.51); ctx.lineTo(w * 0.76, h * 0.58); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.2; [0.62, 0.66].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.76, h * y); ctx.lineTo(w * 0.9, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'sejong-evidence') {
      fillSky('#e9e2c9', '#f5efdb', '#c9a86a');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = '#7c6a3a'; ctx.lineWidth = 2; ctx.fillRect(w * 0.13, h * 0.42, w * 0.14, h * 0.2); ctx.strokeRect(w * 0.13, h * 0.42, w * 0.14, h * 0.2);
      ctx.strokeStyle = '#7c6a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.17, h * 0.52, w * 0.015, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.21, h * 0.52); ctx.lineTo(w * 0.25, h * 0.52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.23, h * 0.47); ctx.lineTo(w * 0.23, h * 0.57); ctx.stroke();
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.62, w * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7c6a3a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.62, w * 0.09, h * 0.1, 0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#8f8975'; ctx.beginPath(); ctx.arc(w * 0.82, h * 0.6, w * 0.07, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1; [0.75, 0.79, 0.86, 0.9].forEach((x) => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.6); ctx.lineTo(w * x, h * 0.55); ctx.stroke(); });
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.82, h * 0.6); ctx.lineTo(w * 0.82, h * 0.44); ctx.stroke();
      return true;
    }
    if (scene === 'righteous-army-background') {
      fillSky('#e3ded0', '#efeadb', '#8a9678');
      ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = '#8a734a'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.1, h * 0.28, w * 0.16, h * 0.22); ctx.strokeRect(w * 0.1, h * 0.28, w * 0.16, h * 0.22);
      ctx.strokeStyle = '#7c6640'; ctx.lineWidth = 1; [0.36, 0.42, 0.48].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.13, h * y); ctx.lineTo(w * 0.23, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#8a3b2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.2, h * 0.56, w * 0.022, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#8a7355'; [0.4, 0.47, 0.54, 0.61].forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.56, w * 0.016, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.018, h * 0.78); ctx.lineTo(w * x + w * 0.018, h * 0.78); ctx.lineTo(w * x + w * 0.012, h * 0.6); ctx.lineTo(w * x - w * 0.012, h * 0.6); ctx.closePath(); ctx.fill(); });
      ctx.strokeStyle = '#5c3d24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.47, h * 0.6); ctx.lineTo(w * 0.47, h * 0.7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.54, h * 0.7); ctx.lineTo(w * 0.6, h * 0.66); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.61, h * 0.6); ctx.lineTo(w * 0.67, h * 0.64); ctx.stroke();
      ctx.fillStyle = '#5f6f57'; ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.6); ctx.lineTo(w * 0.78, h * 0.4); ctx.lineTo(w * 0.84, h * 0.6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * 0.8, h * 0.6); ctx.lineTo(w * 0.87, h * 0.44); ctx.lineTo(w * 0.94, h * 0.6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a3b2e'; [[0.76, 0.5], [0.84, 0.46], [0.9, 0.53]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.012, 0, Math.PI * 2); ctx.fill(); });
      return true;
    }
    if (scene === 'righteous-army-flag') {
      // 태극기 원본은 훼손된 유물이지만, 신체 훼손을 연상시키지 않도록 유물 보존실 관찰 장면으로 구성한다.
      fillSky('#2a2f38', '#3d4450', '#8a7355');
      ctx.fillStyle = '#efe9dc'; ctx.fillRect(w * 0.28, h * 0.48, w * 0.44, h * 0.3);
      ctx.strokeStyle = '#8a3b2e'; ctx.lineWidth = 2; ctx.strokeRect(w * 0.28, h * 0.48, w * 0.22, h * 0.15); ctx.strokeRect(w * 0.5, h * 0.63, w * 0.22, h * 0.15);
      ctx.fillStyle = '#e8e2ce'; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.2); ctx.lineTo(w * 0.38, h * 0.44); ctx.lineTo(w * 0.62, h * 0.44); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.22, h * 0.5, w * 0.05, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.26, h * 0.54); ctx.lineTo(w * 0.32, h * 0.6); ctx.stroke();
      ctx.fillStyle = '#e8e2ce'; ctx.strokeStyle = '#8a9678'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.78, h * 0.56); ctx.lineTo(w * 0.9, h * 0.56); ctx.lineTo(w * 0.9, h * 0.66); ctx.quadraticCurveTo(w * 0.84, h * 0.72, w * 0.78, h * 0.66); ctx.closePath(); ctx.fill(); ctx.stroke();
      return true;
    }
    if (scene === 'righteous-army-trial') {
      fillSky('#e6e2d4', '#f0ece0', '#9a9284');
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.1, h * 0.32, w * 0.18, h * 0.26); ctx.strokeRect(w * 0.1, h * 0.32, w * 0.18, h * 0.26);
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 1; [0.38, 0.44, 0.5].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.13, h * y); ctx.lineTo(w * 0.25, h * y); ctx.stroke(); });
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.39, h * 0.46, w * 0.22, h * 0.32); ctx.strokeRect(w * 0.39, h * 0.46, w * 0.22, h * 0.32);
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 1; [0.45, 0.49, 0.53, 0.57, 0.61, 0.65, 0.69].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.48); ctx.lineTo(w * x, h * 0.76); ctx.stroke(); });
      ctx.strokeStyle = '#5c6b78'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.73, h * 0.5); ctx.lineTo(w * 0.83, h * 0.42); ctx.moveTo(w * 0.83, h * 0.42); ctx.lineTo(w * 0.93, h * 0.5); ctx.stroke();
      ctx.fillStyle = '#8a9678'; ctx.beginPath(); ctx.arc(w * 0.73, h * 0.5, w * 0.024, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(w * 0.83, h * 0.42, w * 0.024, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(w * 0.93, h * 0.5, w * 0.024, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'righteous-army-exhibit') {
      fillSky('#e6e2d4', '#f0ece0', '#c9c0ab');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.13, h * 0.4); ctx.lineTo(w * 0.13, h * 0.6); ctx.moveTo(w * 0.25, h * 0.4); ctx.lineTo(w * 0.25, h * 0.6); ctx.stroke();
      ctx.fillStyle = '#efe9dc'; ctx.fillRect(w * 0.13, h * 0.44, w * 0.12, h * 0.12);
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#8a3b2e'; ctx.lineWidth = 2; ctx.fillRect(w * 0.44, h * 0.56, w * 0.12, h * 0.1); ctx.strokeRect(w * 0.44, h * 0.56, w * 0.12, h * 0.1);
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.75, h * 0.42); ctx.lineTo(w * 0.83, h * 0.38); ctx.lineTo(w * 0.91, h * 0.42); ctx.lineTo(w * 0.91, h * 0.56); ctx.lineTo(w * 0.83, h * 0.6); ctx.lineTo(w * 0.75, h * 0.56); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w * 0.83, h * 0.4); ctx.lineTo(w * 0.83, h * 0.58); ctx.stroke();
      return true;
    }
    if (scene === 'joseon-border') {
      fillSky('#dfe6d8', '#eef1e6', '#7f9468');
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, h * 0.36); ctx.quadraticCurveTo(w * 0.2, h * 0.28, w * 0.38, h * 0.4); ctx.stroke();
      ctx.fillStyle = '#8f8975'; [[0.04, 0.4], [0.13, 0.36], [0.22, 0.36], [0.31, 0.4]].forEach(([x, y]) => { ctx.fillRect(w * x, h * y, w * 0.03, h * 0.05); });
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.66); ctx.quadraticCurveTo(w * 0.5, h * 0.58, w * 0.7, h * 0.7); ctx.stroke();
      ctx.fillStyle = '#8f8975'; [[0.32, 0.68], [0.4, 0.63], [0.48, 0.61], [0.56, 0.62], [0.63, 0.65], [0.68, 0.7]].forEach(([x, y]) => { ctx.fillRect(w * x - w * 0.014, h * y, w * 0.028, h * 0.045); });
      ctx.fillStyle = '#8a5a35'; [[0.74, 0.4], [0.81, 0.44], [0.88, 0.4]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(w * x - w * 0.025, h * y); ctx.lineTo(w * x, h * (y - 0.06)); ctx.lineTo(w * x + w * 0.025, h * y); ctx.closePath(); ctx.fill(); ctx.fillRect(w * x - w * 0.018, h * y, w * 0.036, h * 0.05); });
      ctx.strokeStyle = 'rgba(90,90,90,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(w * 0.95, h * 0.85); ctx.lineTo(w * 0.81, h * 0.5); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'joseon-namhansanseong') {
      fillSky('#7c8794', '#a9b4bc', '#96a0ab');
      ctx.strokeStyle = '#e6e2d4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.5); ctx.lineTo(w * 0.16, h * 0.34); ctx.lineTo(w * 0.24, h * 0.4); ctx.lineTo(w * 0.32, h * 0.3); ctx.stroke();
      ctx.strokeStyle = 'rgba(230,226,212,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.5); ctx.lineTo(w * 0.1, h * 0.6); ctx.moveTo(w * 0.32, h * 0.3); ctx.lineTo(w * 0.34, h * 0.4); ctx.stroke();
      ctx.strokeStyle = '#8a734a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.7); ctx.quadraticCurveTo(w * 0.42, h * 0.56, w * 0.5, h * 0.54); ctx.quadraticCurveTo(w * 0.58, h * 0.56, w * 0.56, h * 0.7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.5; [[0.68, 0.44], [0.74, 0.4], [0.62, 0.46], [0.78, 0.48]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(w * x, h * (y - 0.016)); ctx.lineTo(w * x, h * (y + 0.016)); ctx.moveTo(w * x - w * 0.014, h * y); ctx.lineTo(w * x + w * 0.014, h * y); ctx.stroke(); });
      ctx.fillStyle = '#8a7355'; [[0.76, 0.42], [0.85, 0.46], [0.92, 0.42]].forEach(([x, y]) => { ctx.fillRect(w * x - w * 0.02, h * y, w * 0.04, h * 0.04); });
      ctx.strokeStyle = 'rgba(230,226,212,0.7)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.6); ctx.lineTo(w * 0.85, h * 0.5); ctx.moveTo(w * 0.85, h * 0.62); ctx.lineTo(w * 0.95, h * 0.5); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'joseon-postwar') {
      fillSky('#e3e6da', '#eef1e6', '#8a9678');
      ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = '#8a734a'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.09, h * 0.36, w * 0.1, h * 0.2); ctx.strokeRect(w * 0.09, h * 0.36, w * 0.1, h * 0.2);
      ctx.fillRect(w * 0.22, h * 0.4, w * 0.1, h * 0.2); ctx.strokeRect(w * 0.22, h * 0.4, w * 0.1, h * 0.2);
      ctx.strokeStyle = '#7c6640'; ctx.lineWidth = 1; [0.42, 0.47].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.11, h * y); ctx.lineTo(w * 0.17, h * y); ctx.stroke(); }); [0.46, 0.51].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.24, h * y); ctx.lineTo(w * 0.3, h * y); ctx.stroke(); });
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.44, h * 0.56, w * 0.12, h * 0.16); ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.56); ctx.lineTo(w * 0.5, h * 0.46); ctx.lineTo(w * 0.58, h * 0.56); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1; [0.5, 0.55, 0.6, 0.65].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.62); ctx.lineTo(w * x, h * 0.68); ctx.stroke(); });
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.76, h * 0.42); ctx.lineTo(w * 0.83, h * 0.34); ctx.lineTo(w * 0.9, h * 0.42); ctx.closePath(); ctx.fill(); ctx.fillRect(w * 0.78, h * 0.42, w * 0.1, h * 0.06);
      ctx.strokeStyle = 'rgba(90,90,90,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(w * 0.95, h * 0.6); ctx.lineTo(w * 0.83, h * 0.5); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'joseon-diplomacy-exhibit') {
      fillSky('#e3e6da', '#eef1e6', '#c9c0ab');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.5); ctx.quadraticCurveTo(w * 0.19, h * 0.42, w * 0.26, h * 0.5); ctx.stroke();
      ctx.fillStyle = '#8f8975'; [0.14, 0.19, 0.24].forEach(x => { ctx.fillRect(w * x, h * 0.52, w * 0.02, h * 0.03); });
      ctx.fillStyle = '#efe6cf'; ctx.strokeStyle = '#8a734a'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.43, h * 0.56, w * 0.14, h * 0.2); ctx.strokeRect(w * 0.43, h * 0.56, w * 0.14, h * 0.2);
      ctx.strokeStyle = '#7c6640'; ctx.lineWidth = 1; [0.6, 0.65, 0.7].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.45, h * y); ctx.lineTo(w * 0.55, h * y); ctx.stroke(); });
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.74, h * 0.44); ctx.lineTo(w * 0.83, h * 0.36); ctx.lineTo(w * 0.92, h * 0.44); ctx.closePath(); ctx.fill(); ctx.fillRect(w * 0.76, h * 0.44, w * 0.14, h * 0.1);
      return true;
    }
    if (scene === 'korean-war-outbreak') {
      // 남북을 동일한 회색으로 그려 어느 쪽도 적대색으로 표시하지 않는다. 군인·무기는 그리지 않는다.
      fillSky('#dfe3e0', '#eceeea', '#c7ccc7');
      ctx.fillStyle = '#a9afa8'; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.1); ctx.lineTo(w * 0.58, h * 0.1); ctx.lineTo(w * 0.64, h * 0.4); ctx.lineTo(w * 0.6, h * 0.7); ctx.lineTo(w * 0.66, h * 0.92); ctx.lineTo(w * 0.5, h * 0.98); ctx.lineTo(w * 0.36, h * 0.86); ctx.lineTo(w * 0.4, h * 0.5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7c8480'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(w * 0.34, h * 0.25); ctx.lineTo(w * 0.66, h * 0.25); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(90,90,90,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.3); ctx.quadraticCurveTo(w * 0.44, h * 0.48, w * 0.4, h * 0.55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.32); ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.48, h * 0.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.32); ctx.quadraticCurveTo(w * 0.58, h * 0.5, w * 0.58, h * 0.62); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#8a9678'; ctx.beginPath(); ctx.moveTo(w * 0.58, h * 0.78); ctx.lineTo(w * 0.68, h * 0.78); ctx.lineTo(w * 0.66, h * 0.88); ctx.lineTo(w * 0.6, h * 0.88); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.82); ctx.lineTo(w * 0.76, h * 0.8); ctx.stroke();
      return true;
    }
    if (scene === 'korean-war-front') {
      fillSky('#dfe3e0', '#eceeea', '#8a9678');
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.08, h * 0.62); ctx.quadraticCurveTo(w * 0.2, h * 0.5, w * 0.32, h * 0.6); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,90,90,0.7)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(w * 0.06, h * 0.4); ctx.lineTo(w * 0.34, h * 0.44); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.4, h * 0.5, w * 0.2, h * 0.28); ctx.strokeRect(w * 0.4, h * 0.5, w * 0.2, h * 0.28);
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.5); ctx.lineTo(w * 0.5, h * 0.78); ctx.stroke();
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 1; [0.56, 0.6, 0.64, 0.7].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.42, h * y); ctx.lineTo(w * 0.48, h * y); ctx.stroke(); });
      ctx.fillStyle = '#8a7355'; ctx.beginPath(); ctx.ellipse(w * 0.79, h * 0.5, w * 0.05, h * 0.06, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5c3d24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.75, h * 0.46); ctx.lineTo(w * 0.83, h * 0.46); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,90,90,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.62); ctx.lineTo(w * 0.85, h * 0.72); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'korean-war-armistice') {
      // 회담 탁자를 좌우 대칭으로 그려 승패를 암시하지 않는다. 깃발·비둘기 등 상징을 넣지 않는다.
      fillSky('#dfe6ec', '#eef2ea', '#8ab0c2');
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w * 0.36, h); ctx.lineTo(w * 0.3, h * 0.66); ctx.lineTo(0, h * 0.72); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#456580'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.24, h * 0.62, w * 0.03, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.42, h * 0.36, w * 0.16, h * 0.05);
      ctx.fillStyle = '#5c6b78'; ctx.fillRect(w * 0.44, h * 0.42, w * 0.05, h * 0.08); ctx.fillRect(w * 0.51, h * 0.42, w * 0.05, h * 0.08);
      ctx.strokeStyle = 'rgba(90,90,90,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(w * 0.6, h * 0.54); ctx.lineTo(w * 0.98, h * 0.54); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.6, h * 0.6); ctx.lineTo(w * 0.98, h * 0.6); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'korean-war-exhibit') {
      fillSky('#e3e6da', '#eef1e6', '#c9c0ab');
      card(0.08, 0.28, 0.22, 0.42); card(0.39, 0.44, 0.22, 0.4); card(0.7, 0.28, 0.22, 0.42);
      ctx.fillStyle = '#a9afa8'; ctx.beginPath(); ctx.moveTo(w * 0.15, h * 0.38); ctx.lineTo(w * 0.2, h * 0.38); ctx.lineTo(w * 0.22, h * 0.5); ctx.lineTo(w * 0.2, h * 0.6); ctx.lineTo(w * 0.13, h * 0.58); ctx.lineTo(w * 0.14, h * 0.46); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7c8480'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(w * 0.12, h * 0.46); ctx.lineTo(w * 0.23, h * 0.46); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.43, h * 0.56, w * 0.14, h * 0.18); ctx.strokeRect(w * 0.43, h * 0.56, w * 0.14, h * 0.18);
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 1; [0.61, 0.66, 0.7].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.45, h * y); ctx.lineTo(w * 0.55, h * y); ctx.stroke(); });
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#5c6b78'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.75, h * 0.42, w * 0.14, h * 0.18); ctx.strokeRect(w * 0.75, h * 0.42, w * 0.14, h * 0.18);
      ctx.strokeStyle = 'rgba(90,90,90,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.77, h * 0.5); ctx.lineTo(w * 0.87, h * 0.5); ctx.moveTo(w * 0.77, h * 0.54); ctx.lineTo(w * 0.87, h * 0.54); ctx.stroke();
      return true;
    }
    if (scene === 'three-kingdoms-summary') {
      // 핫스팟 없는 종합 단계이므로 좌우 3분할 대신, 삼국이 함께 주목한 한강을 화면 전체 구도로 그린다.
      fillSky('#d9e6ef', '#eef2e0', '#7f9468');
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w * 0.5, 0); ctx.quadraticCurveTo(w * 0.38, h * 0.4, w * 0.5, h * 0.7); ctx.quadraticCurveTo(w * 0.6, h * 0.85, w * 0.5, h); ctx.stroke();
      ctx.fillStyle = 'rgba(95,111,87,0.35)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.42, 0); ctx.lineTo(w * 0.3, h * 0.5); ctx.lineTo(0, h * 0.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(138,90,53,0.3)'; ctx.beginPath(); ctx.moveTo(w * 0.58, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.5); ctx.lineTo(w * 0.66, h * 0.3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(79,144,176,0.25)'; ctx.beginPath(); ctx.moveTo(w * 0.28, h * 0.55); ctx.lineTo(w * 0.7, h * 0.6); ctx.lineTo(w * 0.6, h); ctx.lineTo(w * 0.35, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, w * 0.02, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'goguryeo-mural-costume') {
      fillSky('#5c554a', '#7c7364', '#4a4438');
      ctx.fillStyle = '#8f8570'; ctx.fillRect(w * 0.1, h * 0.14, w * 0.8, h * 0.64); ctx.strokeStyle = '#4a4438'; ctx.lineWidth = 2; ctx.strokeRect(w * 0.1, h * 0.14, w * 0.8, h * 0.64);
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.28, w * 0.035, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9974a'; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.32); ctx.lineTo(w * 0.58, h * 0.32); ctx.lineTo(w * 0.55, h * 0.48); ctx.lineTo(w * 0.45, h * 0.48); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b5342a'; ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.48); ctx.lineTo(w * 0.6, h * 0.48); ctx.lineTo(w * 0.67, h * 0.72); ctx.lineTo(w * 0.33, h * 0.72); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#7c231c'; ctx.lineWidth = 1; [0.53, 0.58, 0.63, 0.68].forEach(y => { const spread = (y - 0.48) / (0.72 - 0.48); ctx.beginPath(); ctx.moveTo(w * (0.4 - spread * 0.04), h * y); ctx.lineTo(w * (0.6 + spread * 0.04), h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'three-kingdoms-buddhism') {
      fillSky('#dcdad6', '#eceae4', '#8a9678');
      ctx.fillStyle = '#8f8975'; ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.7); ctx.lineTo(w * 0.38, h * 0.5); ctx.lineTo(w * 0.62, h * 0.5); ctx.lineTo(w * 0.62, h * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.34, h * 0.5); ctx.lineTo(w * 0.5, h * 0.36); ctx.lineTo(w * 0.66, h * 0.5); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.36); ctx.lineTo(w * 0.5, h * 0.26); ctx.lineTo(w * 0.6, h * 0.36); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.26); ctx.lineTo(w * 0.5, h * 0.16); ctx.stroke();
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.22, h * 0.6, w * 0.05, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#7e5a28'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.52); ctx.lineTo(w * 0.22, h * 0.46); ctx.stroke();
      ctx.fillStyle = '#8a7355'; [[0.72, 0.66], [0.78, 0.6], [0.84, 0.66]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.013, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.015, h * 0.78); ctx.lineTo(w * x + w * 0.015, h * 0.78); ctx.lineTo(w * x + w * 0.01, h * (y + 0.02)); ctx.lineTo(w * x - w * 0.01, h * (y + 0.02)); ctx.closePath(); ctx.fill(); });
      return true;
    }
    // 고려 Regular MUD: 게이지형 활동도 한 장면 안에서 자료의 핵심 단서를 읽게 한다.
    if (scene === 'goryeo-unification-map') {
      fillSky('#e3ded0', '#eee8d8', '#b9b28f');
      [[0.12,0.28,0.3,0.26,'rgba(112,132,101,.35)'],[0.52,0.48,0.32,0.27,'rgba(151,105,73,.3)'],[0.62,0.23,0.18,0.17,'rgba(100,128,151,.28)']].forEach(([x,y,ww,hh,c])=>{ctx.fillStyle=c;ctx.setLineDash([5,4]);ctx.fillRect(w*x,h*y,w*ww,h*hh);ctx.strokeStyle='#8a734a';ctx.strokeRect(w*x,h*y,w*ww,h*hh);ctx.setLineDash([]);});
      ctx.fillStyle='#6d5d46';ctx.beginPath();ctx.moveTo(w*.25,h*.48);ctx.lineTo(w*.3,h*.34);ctx.lineTo(w*.35,h*.48);ctx.closePath();ctx.fill();ctx.fillRect(w*.285,h*.45,w*.04,h*.08);return true;
    }
    if (scene === 'goryeo-balhae-refuge') { fillSky('#dee3d8','#eef0e7','#a6b396');ctx.fillStyle='#6b7a5c';ctx.fillRect(w*.67,h*.34,w*.22,h*.36);ctx.fillStyle='#485740';ctx.beginPath();ctx.arc(w*.78,h*.62,w*.05,Math.PI,0);ctx.fill();ctx.strokeStyle='#7b725e';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(w*.1,h*.65);ctx.lineTo(w*.67,h*.62);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#7b725e';[.18,.28,.38,.48,.58].forEach(x=>{ctx.beginPath();ctx.arc(w*x,h*.59,w*.017,0,Math.PI*2);ctx.fill();ctx.fillRect(w*x-3,h*.61,6,h*.09);});return true; }
    if (scene === 'goryeo-hunyo') { fillSky('#efe3c6','#f7edd5','#d8bf8d');ctx.fillStyle='#f8edcf';ctx.fillRect(w*.26,h*.28,w*.48,h*.45);ctx.strokeStyle='#8a6435';ctx.lineWidth=2;ctx.strokeRect(w*.26,h*.28,w*.48,h*.45);ctx.strokeStyle='#a98b59';ctx.lineWidth=1;for(let y=.35;y<.67;y+=.03){ctx.beginPath();ctx.moveTo(w*.32,h*y);ctx.lineTo(w*.68,h*y);ctx.stroke();}ctx.fillStyle='#77634c';ctx.beginPath();ctx.moveTo(w*.12,h*.68);ctx.lineTo(w*.18,h*.42);ctx.lineTo(w*.24,h*.68);ctx.closePath();ctx.fill();ctx.fillRect(w*.78,h*.53,w*.12,h*.15);return true; }
    if (scene === 'goryeo-founding-summary') { fillSky('#d9e6ef','#edf1dd','#91a27b');ctx.fillStyle='#657956';ctx.fillRect(0,h*.69,w,h*.31);ctx.strokeStyle='#4f90b0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,h*.76);ctx.quadraticCurveTo(w*.5,h*.67,w,h*.76);ctx.stroke();ctx.fillStyle='#7b5a42';[.27,.47,.67].forEach((x,i)=>{ctx.fillRect(w*x,h*(.47+i*.03),w*.13,h*.2);ctx.beginPath();ctx.moveTo(w*(x-.02),h*(.47+i*.03));ctx.lineTo(w*(x+.065),h*(.35+i*.02));ctx.lineTo(w*(x+.15),h*(.47+i*.03));ctx.closePath();ctx.fill();});return true; }
    if (scene === 'goryeo-civil-exam') { fillSky('#e6ddc9','#f2eadb','#bda982');ctx.fillStyle='#8a7355';[.14,.3,.46,.62,.78].forEach(x=>{ctx.fillRect(w*x,h*.3,w*.11,h*.19);ctx.fillStyle='#f8edcf';ctx.fillRect(w*(x+.02),h*.34,w*.07,h*.1);ctx.fillStyle='#8a7355';});ctx.fillStyle='#b34d3d';ctx.fillRect(w*.39,h*.62,w*.22,h*.16);ctx.strokeStyle='#f5d6b0';ctx.beginPath();ctx.moveTo(w*.43,h*.68);ctx.lineTo(w*.57,h*.68);ctx.stroke();return true; }
    if (scene === 'goryeo-inheritance-trial') { fillSky('#e6e2d4','#f1eee4','#b9ad91');ctx.strokeStyle='#7a674f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(w*.5,h*.34);ctx.lineTo(w*.5,h*.7);ctx.moveTo(w*.3,h*.45);ctx.lineTo(w*.7,h*.45);ctx.stroke();ctx.lineWidth=2;[.3,.7].forEach(x=>{ctx.beginPath();ctx.moveTo(w*x,h*.45);ctx.lineTo(w*x,h*.62);ctx.stroke();ctx.beginPath();ctx.ellipse(w*x,h*.63,w*.09,h*.025,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#a48c68';ctx.fillRect(w*(x-.03),h*.57,w*.06,h*.04);});return true; }
    if (scene === 'goryeo-buseoksa') { fillSky('#dfe6d8','#eff1e6','#9bab86');ctx.fillStyle='#806146';[.28,.5,.72].forEach(x=>{ctx.beginPath();ctx.moveTo(w*(x-.035),h*.72);ctx.quadraticCurveTo(w*(x-.07),h*.51,w*(x-.035),h*.3);ctx.lineTo(w*(x+.035),h*.3);ctx.quadraticCurveTo(w*(x+.07),h*.51,w*(x+.035),h*.72);ctx.closePath();ctx.fill();});ctx.fillRect(w*.2,h*.27,w*.6,h*.05);ctx.beginPath();ctx.moveTo(w*.16,h*.27);ctx.lineTo(w*.5,h*.13);ctx.lineTo(w*.84,h*.27);ctx.closePath();ctx.fill();return true; }
    if (scene === 'goryeo-society-summary') { fillSky('#e6ded0','#f2eadf','#bda987');ctx.strokeStyle='#8a7355';ctx.strokeRect(w*.12,h*.23,w*.76,h*.52);ctx.fillStyle='#b34d3d';ctx.fillRect(w*.2,h*.34,w*.14,h*.15);ctx.fillStyle='#8fb5a8';ctx.beginPath();ctx.ellipse(w*.52,h*.65,w*.06,h*.08,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#745a42';[.68,.73,.78].forEach(x=>ctx.fillRect(w*x,h*.58,w*.04,h*.12));return true; }
    if (scene === 'goryeo-seohui-negotiation') { fillSky('#e3ded0','#efeadc','#a9b090');ctx.fillStyle='#8a7355';ctx.fillRect(w*.38,h*.53,w*.24,h*.08);ctx.fillStyle='#f4e7c8';ctx.fillRect(w*.44,h*.45,w*.12,h*.08);ctx.strokeStyle='#4f90b0';ctx.beginPath();ctx.moveTo(w*.45,h*.49);ctx.quadraticCurveTo(w*.5,h*.46,w*.55,h*.5);ctx.stroke();ctx.fillStyle='#a89270';ctx.fillRect(w*.18,h*.58,w*.12,h*.06);ctx.fillRect(w*.7,h*.58,w*.12,h*.06);return true; }
    if (scene === 'goryeo-heunghwajin') { fillSky('#96a0ab','#c7ccd0','#71808a');ctx.fillStyle='#68785c';ctx.beginPath();ctx.moveTo(0,h*.7);ctx.lineTo(w*.25,h*.32);ctx.lineTo(w*.45,h*.7);ctx.closePath();ctx.fill();ctx.fillStyle='#5d6b58';ctx.fillRect(w*.14,h*.35,w*.12,h*.12);ctx.strokeStyle='#4f90b0';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,h*.68);ctx.quadraticCurveTo(w*.5,h*.58,w,h*.7);ctx.stroke();ctx.fillStyle='#6b6257';ctx.fillRect(w*.48,h*.58,w*.12,h*.05);return true; }
    if (scene === 'goryeo-gwiju') { fillSky('#dfe6d8','#edf0e5','#819567');ctx.fillStyle='#78905f';ctx.fillRect(0,h*.68,w,h*.32);ctx.fillStyle='#697d57';ctx.beginPath();ctx.moveTo(0,h*.68);ctx.lineTo(w*.22,h*.47);ctx.lineTo(w*.4,h*.68);ctx.closePath();ctx.fill();ctx.fillStyle='#6f765f';ctx.fillRect(w*.1,h*.52,w*.12,h*.14);ctx.strokeStyle='#8a7355';ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(w*.75,h*.3);ctx.lineTo(w*.75,h*.78);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#755a3b';ctx.beginPath();ctx.moveTo(w*.48,h*.72);ctx.lineTo(w*.48,h*.55);ctx.moveTo(w*.56,h*.72);ctx.lineTo(w*.56,h*.55);ctx.stroke();return true; }
    if (scene === 'goryeo-tripitaka-carving') { fillSky('#3a3630','#4b4238','#2d2924');ctx.fillStyle='#c29a68';ctx.fillRect(w*.28,h*.43,w*.44,h*.18);ctx.strokeStyle='#6b4a2d';ctx.lineWidth=2;[.35,.42,.49,.56,.63].forEach(x=>{ctx.beginPath();ctx.moveTo(w*x,h*.46);ctx.lineTo(w*x,h*.58);ctx.stroke();});ctx.strokeStyle='#d0a16c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(w*.56,h*.35);ctx.lineTo(w*.66,h*.48);ctx.stroke();ctx.fillStyle='#765437';[.08,.13,.18,.23].forEach(y=>ctx.fillRect(w*.08,h*(.55+y),w*.16,h*.025));return true; }
    if (scene === 'goryeo-metal-type') { fillSky('#e6ded0','#f1e9dc','#b8a78d');ctx.strokeStyle='#7e6750';ctx.strokeRect(w*.08,h*.32,w*.22,h*.35);for(let x=.1;x<.29;x+=.055){for(let y=.35;y<.64;y+=.08)ctx.strokeRect(w*x,h*y,w*.04,h*.055);}ctx.strokeRect(w*.4,h*.39,w*.24,h*.22);ctx.fillStyle='#74604b';[.43,.49,.55].forEach(x=>ctx.fillRect(w*x,h*.46,w*.045,h*.04));ctx.fillStyle='#f7edda';ctx.beginPath();ctx.moveTo(w*.73,h*.35);ctx.lineTo(w*.9,h*.4);ctx.lineTo(w*.86,h*.69);ctx.lineTo(w*.7,h*.64);ctx.closePath();ctx.fill();return true; }
    if (scene === 'goryeo-byeokrando') { fillSky('#d9e6ef','#eff2e7','#7fa7b5');ctx.fillStyle='#4f90b0';ctx.fillRect(0,h*.66,w,h*.34);ctx.fillStyle='#735941';[.18,.45,.72].forEach((x,i)=>{ctx.beginPath();ctx.ellipse(w*x,h*(.75-i*.05),w*.08,h*.025,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(w*x,h*(.73-i*.05));ctx.lineTo(w*x,h*(.48-i*.05));ctx.lineTo(w*(x+.09),h*(.73-i*.05));ctx.closePath();ctx.fill();});ctx.fillStyle='#806246';ctx.fillRect(w*.7,h*.49,w*.12,h*.16);ctx.fillRect(w*.84,h*.54,w*.1,h*.11);return true; }
    if (scene === 'gaya-ironware') {
      // instruction 문구가 '결전'을 언급하지만 실제 내용은 제철·판갑옷 제작 기술이므로 전투 장면 없이 공방으로 그린다.
      fillSky('#3a3630', '#5c544a', '#736355');
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.14, h * 0.7); ctx.lineTo(w * 0.14, h * 0.42); ctx.quadraticCurveTo(w * 0.14, h * 0.32, w * 0.24, h * 0.32); ctx.lineTo(w * 0.24, h * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.ellipse(w * 0.19, h * 0.66, w * 0.03, h * 0.04, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5c554a'; ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.42, h * 0.38, w * 0.2, h * 0.34);
      [0.44, 0.48, 0.52, 0.56].forEach(y => { ctx.strokeRect(w * 0.42, h * y, w * 0.2, h * 0.04); });
      ctx.fillStyle = '#8a7355'; [0.7, 0.78, 0.86].forEach(x => { ctx.fillRect(w * x, h * 0.62, w * 0.04, h * 0.1); });
      return true;
    }
    if (scene === 'three-kingdoms-life-summary') {
      fillSky('#e6ded0', '#f2ecdd', '#c9b98c');
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.1, h * 0.72, w * 0.8, h * 0.06);
      ctx.fillStyle = '#8f8570'; ctx.fillRect(w * 0.18, h * 0.5, w * 0.16, h * 0.22); ctx.strokeStyle = '#4a4438'; ctx.lineWidth = 1.5; ctx.strokeRect(w * 0.18, h * 0.5, w * 0.16, h * 0.22);
      ctx.fillStyle = '#b5342a'; ctx.beginPath(); ctx.moveTo(w * 0.23, h * 0.58); ctx.lineTo(w * 0.29, h * 0.58); ctx.lineTo(w * 0.3, h * 0.68); ctx.lineTo(w * 0.22, h * 0.68); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.62); ctx.lineTo(w * 0.5, h * 0.44); ctx.lineTo(w * 0.58, h * 0.62); ctx.closePath(); ctx.fill(); ctx.fillRect(w * 0.46, h * 0.62, w * 0.08, h * 0.1);
      ctx.fillStyle = '#5c554a'; ctx.fillRect(w * 0.68, h * 0.52, w * 0.14, h * 0.2); ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 1; [0.56, 0.6, 0.64].forEach(y => { ctx.strokeRect(w * 0.68, h * y, w * 0.14, h * 0.03); });
      return true;
    }
    if (scene === 'balhae-dongmosan') {
      // '결전' 대신 산세·깃발·이동 경로로만 건국 장면을 표현한다. 병사·무기는 그리지 않는다.
      fillSky('#dfe3d8', '#eef1e6', '#7f9468');
      ctx.fillStyle = '#7f9468'; ctx.beginPath(); ctx.moveTo(w * 0.14, h * 0.7); ctx.lineTo(w * 0.32, h * 0.32); ctx.lineTo(w * 0.5, h * 0.7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6a8058'; ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.7); ctx.lineTo(w * 0.56, h * 0.42); ctx.lineTo(w * 0.72, h * 0.7); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5c3d24'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.42); ctx.lineTo(w * 0.56, h * 0.24); ctx.stroke();
      ctx.fillStyle = '#8a3b2e'; ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.24); ctx.lineTo(w * 0.72, h * 0.3); ctx.lineTo(w * 0.56, h * 0.36); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(90,90,90,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(w * 0.9, h * 0.6); ctx.quadraticCurveTo(w * 0.75, h * 0.68, w * 0.6, h * 0.6); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'balhae-document') {
      fillSky('#6f4b36', '#a97a4e', '#5d422f');
      ctx.fillStyle = '#8b5f3e'; ctx.fillRect(w * 0.14, h * 0.16, w * 0.72, h * 0.6);
      ctx.fillStyle = '#e6c991'; ctx.fillRect(w * 0.22, h * 0.24, w * 0.56, h * 0.44); ctx.strokeStyle = '#734526'; ctx.lineWidth = 3; ctx.strokeRect(w * 0.22, h * 0.24, w * 0.56, h * 0.44);
      ctx.strokeStyle = '#885731'; ctx.lineWidth = 1.5; [0.32, 0.4, 0.48, 0.56].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.28, h * y); ctx.lineTo(w * 0.72, h * y); ctx.stroke(); });
      ctx.fillStyle = '#8a3b2e'; ctx.fillRect(w * 0.6, h * 0.62, w * 0.1, h * 0.1);
      return true;
    }
    if (scene === 'balhae-heritage') {
      fillSky('#dee3d8', '#eef1e6', '#8a9678');
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.12, h * 0.5, w * 0.32, h * 0.06);
      ctx.strokeStyle = '#5f5c54'; ctx.lineWidth = 1.5; [0.56, 0.6, 0.64].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.15, h * y); ctx.lineTo(w * 0.42, h * y); ctx.stroke(); });
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.6, h * 0.62, w * 0.06, h * 0.14);
      ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.62); ctx.lineTo(w * 0.7, h * 0.62); ctx.lineTo(w * 0.66, h * 0.5); ctx.lineTo(w * 0.6, h * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.63, h * 0.42, w * 0.04, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.57, h * 0.5); ctx.lineTo(w * 0.69, h * 0.5); ctx.lineTo(w * 0.63, h * 0.34); ctx.closePath(); ctx.fill();
      return true;
    }
    // Phase 37: 조선 6종(건국·서민문화·실학·신분제·세종·경제) 20개 게이지형 활동. hotspots가 없으므로 card() 없이 화면 전체 단일 구도로 그린다.
    if (scene === 'hanyang-site-selection') {
      fillSky('#cfe0d4', '#eef0e0', '#7f9468');
      ctx.fillStyle = '#6f8a5c'; ctx.beginPath(); ctx.moveTo(w * 0.08, groundY); ctx.lineTo(w * 0.2, h * 0.42); ctx.lineTo(w * 0.34, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5f7a4f'; ctx.beginPath(); ctx.moveTo(w * 0.62, groundY); ctx.lineTo(w * 0.76, h * 0.46); ctx.lineTo(w * 0.9, groundY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4f90b0'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, h * 0.82); ctx.quadraticCurveTo(w * 0.5, h * 0.7, w, h * 0.86); ctx.stroke();
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.5; [[w * 0.5, h * 0.4], [w * 0.5, h * 0.76], [w * 0.28, h * 0.58], [w * 0.72, h * 0.58]].forEach(([x2, y2]) => { ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.58); ctx.lineTo(x2, y2); ctx.stroke(); });
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.58, w * 0.025, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'gyeongbokgung-naming') {
      fillSky('#dfe6d8', '#eef1e6', '#8a9678');
      ctx.fillStyle = '#6f7d5e'; ctx.beginPath(); ctx.moveTo(w * 0.2, groundY); ctx.lineTo(w * 0.5, h * 0.28); ctx.lineTo(w * 0.82, groundY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 3; ctx.strokeRect(w * 0.28, h * 0.58, w * 0.44, h * 0.14);
      ctx.fillStyle = '#c9b98c'; ctx.strokeStyle = '#734526'; ctx.lineWidth = 2; ctx.fillRect(w * 0.42, h * 0.4, w * 0.16, h * 0.08); ctx.strokeRect(w * 0.42, h * 0.4, w * 0.16, h * 0.08);
      ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.72); ctx.lineTo(w * 0.62, h * 0.72); ctx.moveTo(w * 0.4, h * 0.76); ctx.lineTo(w * 0.6, h * 0.76); ctx.stroke();
      return true;
    }
    if (scene === 'hanyang-gates-pavement') {
      fillSky('#e6e2d0', '#f2ecd9', '#c9b98c');
      ctx.fillStyle = '#8a5a35'; ctx.fillRect(0, h * 0.24, w, h * 0.05);
      const tiles = [[.08, .58, .24, .52, .32, .66, .14, .72], [.26, .54, .42, .5, .46, .64, .28, .68], [.44, .52, .58, .56, .56, .7, .42, .68], [.6, .58, .74, .52, .78, .66, .62, .72], [.12, .72, .3, .7, .32, .86, .14, .88], [.32, .7, .48, .7, .5, .86, .34, .88], [.5, .72, .66, .68, .68, .84, .52, .88], [.68, .68, .82, .64, .86, .8, .7, .84]];
      const tones = ['#d8c49c', '#cbb589']; ctx.strokeStyle = '#a08256'; ctx.lineWidth = 1.5;
      tiles.forEach((pts, i) => { ctx.fillStyle = tones[i % 2]; ctx.beginPath(); for (let k = 0; k < pts.length; k += 2) { const x = w * pts[k], y = h * pts[k + 1]; k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke(); });
      ctx.fillStyle = '#734526'; [[.06, .2], [.94, .2], [.06, .92], [.94, .92]].forEach(([x, y]) => { ctx.fillRect(w * x - 7, h * y - 7, 14, 14); });
      return true;
    }
    if (scene === 'kim-hongdo-studio') {
      fillSky('#e6ded0', '#f3ecdd', '#c9b98c');
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.78); ctx.lineTo(w * 0.5, h * 0.28); ctx.lineTo(w * 0.7, h * 0.78); ctx.stroke();
      ctx.fillStyle = '#f7f1de'; ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 2; ctx.fillRect(w * 0.34, h * 0.34, w * 0.32, h * 0.4); ctx.strokeRect(w * 0.34, h * 0.34, w * 0.32, h * 0.4);
      // 씨름 자세: 얼굴처럼 보이지 않도록 머리를 벌리고 몸통이 가운데서 교차한 뒤 다리가 다시 벌어지게 그린다.
      ctx.strokeStyle = '#4a4438'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(w * 0.44, h * 0.5, w * 0.016, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.516); ctx.lineTo(w * 0.48, h * 0.58); ctx.lineTo(w * 0.46, h * 0.68); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.56, h * 0.5, w * 0.016, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.516); ctx.lineTo(w * 0.52, h * 0.58); ctx.lineTo(w * 0.54, h * 0.68); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.58); ctx.lineTo(w * 0.52, h * 0.58); ctx.stroke();
      ctx.fillStyle = '#8a5a35'; ctx.fillRect(w * 0.72, h * 0.62, w * 0.03, h * 0.14);
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.arc(w * 0.78, h * 0.78, w * 0.03, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'pansori-performance') {
      fillSky('#efe6d2', '#f8f1de', '#c9b98c');
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.arc(w * 0.42, h * 0.5, w * 0.03, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * 0.4, h * 0.53, w * 0.04, h * 0.14);
      ctx.strokeStyle = '#734526'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.55); ctx.lineTo(w * 0.54, h * 0.46); ctx.stroke();
      ctx.fillStyle = '#b34d3d'; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.42); ctx.lineTo(w * 0.58, h * 0.46); ctx.lineTo(w * 0.5, h * 0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.arc(w * 0.62, h * 0.52, w * 0.03, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * 0.6, h * 0.55, w * 0.04, h * 0.12);
      ctx.fillStyle = '#5c4a34'; ctx.beginPath(); ctx.ellipse(w * 0.66, h * 0.63, w * 0.045, h * 0.03, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a7355'; [[.14, .72], [.26, .78], [.78, .78], [.9, .72]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * (y - 0.08), w * 0.022, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * x - w * 0.015, h * y - h * 0.01, w * 0.03, h * 0.09); });
      return true;
    }
    if (scene === 'talchum-dance') {
      fillSky('#efe6d2', '#f8f1de', '#b9ab86');
      ctx.fillStyle = '#8a7355'; [[.5, .26], [.74, .38], [.74, .64], [.5, .78], [.26, .64], [.26, .38]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * (y - 0.05), w * 0.02, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * x - w * 0.014, h * y - h * 0.01, w * 0.028, h * 0.08); });
      ctx.fillStyle = '#b34d3d'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.55, w * 0.035, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2d2924'; ctx.beginPath(); ctx.arc(w * 0.492, h * 0.548, w * 0.006, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(w * 0.508, h * 0.548, w * 0.006, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.58); ctx.lineTo(w * 0.38, h * 0.5); ctx.moveTo(w * 0.5, h * 0.58); ctx.lineTo(w * 0.62, h * 0.5); ctx.stroke();
      return true;
    }
    if (scene === 'hongdaeyong-globe') {
      fillSky('#2a2f3d', '#3c4356', '#232733');
      ctx.fillStyle = '#e4c46a'; [[.16, .22], [.28, .2]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.008, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#8a5a35'; ctx.fillRect(w * 0.2, h * 0.62, w * 0.6, h * 0.06);
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, w * 0.13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#dfe6ec'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.5, w * 0.13, h * 0.05, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.5, w * 0.06, h * 0.13, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#7c6440'; [.28, .34].forEach((x, i) => { ctx.fillRect(w * x, h * (0.56 - i * 0.005), w * 0.06, h * 0.08); });
      return true;
    }
    if (scene === 'hwaseong-geojunggi') {
      fillSky('#e3ded0', '#efeadc', '#b9ab86');
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.66, h * 0.72, w * 0.28, h * 0.14); ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 1.5; [.76, .8, .84].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.66, h * y); ctx.lineTo(w * 0.94, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.78); ctx.lineTo(w * 0.3, h * 0.24); ctx.lineTo(w * 0.48, h * 0.24); ctx.lineTo(w * 0.48, h * 0.78); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.3); ctx.lineTo(w * 0.56, h * 0.3); ctx.stroke();
      ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.3, h * 0.3, w * 0.045, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(w * 0.48, h * 0.3, w * 0.045, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.34); ctx.lineTo(w * 0.3, h * 0.56); ctx.stroke();
      ctx.fillStyle = '#8a8478'; ctx.fillRect(w * 0.24, h * 0.56, w * 0.12, h * 0.12);
      return true;
    }
    if (scene === 'donghak-yongdamjeong') {
      // infoText·feedback·location(경주 용담정)이 가리키는 동학·인내천을 따른다. narrative 본문(홍대용 혼천의)은 원본 데이터 불일치로 보고 무시한다.
      fillSky('#dfe6d8', '#eef1e6', '#8a9678');
      ctx.fillStyle = '#a9895c'; ctx.beginPath(); ctx.moveTo(w * 0.36, h * 0.42); ctx.lineTo(w * 0.5, h * 0.26); ctx.lineTo(w * 0.64, h * 0.42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.4, h * 0.42, w * 0.03, h * 0.22); ctx.fillRect(w * 0.57, h * 0.42, w * 0.03, h * 0.22);
      ctx.fillStyle = '#6b5a42'; [[.24, .72], [.36, .8], [.5, .84], [.64, .8], [.76, .72]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * (y - 0.06), w * 0.02, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(w * x, h * y, w * 0.03, h * 0.02, 0, 0, Math.PI * 2); ctx.fill(); });
      return true;
    }
    if (scene === 'silhak-summary') {
      fillSky('#e6ded0', '#f2ecdd', '#c9b98c');
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.1, h * 0.66, w * 0.8, h * 0.05);
      ctx.fillStyle = '#4f90b0'; ctx.beginPath(); ctx.arc(w * 0.24, h * 0.5, w * 0.07, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#dfe6ec'; ctx.beginPath(); ctx.ellipse(w * 0.24, h * 0.5, w * 0.07, h * 0.025, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.46, w * 0.06, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.52); ctx.lineTo(w * 0.5, h * 0.66); ctx.stroke();
      ctx.fillStyle = '#a9895c'; ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.58); ctx.lineTo(w * 0.76, h * 0.44); ctx.lineTo(w * 0.84, h * 0.58); ctx.closePath(); ctx.fill();
      return true;
    }
    if (scene === 'hopae-registration') {
      fillSky('#e6ded0', '#f2ecdd', '#b9ab86');
      ctx.fillStyle = '#8a5a35'; ctx.fillRect(0, h * 0.22, w, h * 0.06);
      ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 1.5; ctx.fillStyle = '#c9b98c'; [.18, .32, .46, .6, .74].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.28); ctx.lineTo(w * x, h * 0.34); ctx.stroke(); ctx.fillRect(w * x - w * 0.02, h * 0.34, w * 0.04, h * 0.1); ctx.strokeRect(w * x - w * 0.02, h * 0.34, w * 0.04, h * 0.1); });
      ctx.fillStyle = '#f2ecdd'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 2; ctx.fillRect(w * 0.24, h * 0.62, w * 0.52, h * 0.2); ctx.strokeRect(w * 0.24, h * 0.62, w * 0.52, h * 0.2);
      ctx.strokeStyle = '#a08256'; ctx.lineWidth = 1.5; [.68, .74, .8].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.3, h * y); ctx.lineTo(w * 0.72, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'jungin-medicine') {
      fillSky('#e6ded0', '#f2ecdd', '#b9ab86');
      ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 1.5; ctx.fillStyle = '#a9895c'; ctx.fillRect(w * 0.1, h * 0.32, w * 0.36, h * 0.4);
      for (let r = 0; r < 4; r++) { for (let c = 0; c < 2; c++) { ctx.strokeRect(w * (0.13 + c * 0.16), h * (0.36 + r * 0.09), w * 0.13, h * 0.07); } }
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.56, h * 0.5, w * 0.05, h * 0.2);
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 1.5; [.54, .6, .66].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.56, h * y); ctx.lineTo(w * 0.61, h * y); ctx.stroke(); });
      ctx.fillStyle = '#f2ecdd'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 2; ctx.fillRect(w * 0.7, h * 0.56, w * 0.22, h * 0.16); ctx.strokeRect(w * 0.7, h * 0.56, w * 0.22, h * 0.16);
      ctx.strokeStyle = '#a08256'; [.62, .68].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.73, h * y); ctx.lineTo(w * 0.89, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'commoner-harvest') {
      fillSky('#d8dec0', '#eee0b2', '#8a9052');
      ctx.strokeStyle = '#4a3d18'; ctx.lineWidth = 2.5; for (let row = 0; row < 3; row++) { for (let x = 0.08; x < 0.92; x += 0.06) { const y = h * (0.72 + row * 0.06); ctx.beginPath(); ctx.moveTo(w * x, y); ctx.lineTo(w * x + 8, y - 14); ctx.stroke(); } }
      ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.58); ctx.quadraticCurveTo(w * 0.78, h * 0.5, w * 0.74, h * 0.42); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.58); ctx.lineTo(w * 0.6, h * 0.66); ctx.stroke();
      ctx.fillStyle = '#a9895c'; ctx.beginPath(); ctx.moveTo(w * 0.14, h * 0.6); ctx.quadraticCurveTo(w * 0.16, h * 0.46, w * 0.24, h * 0.44); ctx.quadraticCurveTo(w * 0.32, h * 0.46, w * 0.34, h * 0.6); ctx.closePath(); ctx.fill();
      return true;
    }
    if (scene === 'hunminjeongeum-lab') {
      fillSky('#e6ded0', '#f2ecdd', '#c9b98c');
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.16, h * 0.6, w * 0.68, h * 0.06);
      ctx.fillStyle = '#f7f1de'; ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.24, h * 0.5, w * 0.2, h * 0.1); ctx.strokeRect(w * 0.24, h * 0.5, w * 0.2, h * 0.1);
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.56); ctx.lineTo(w * 0.56, h * 0.4); ctx.stroke();
      // 발음 기관을 본뜬 추상 도형(반원+세로선)만 그리고, 실제 자음자는 그리지 않는다.
      ctx.strokeStyle = '#5c4a34'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(w * 0.7, h * 0.34, w * 0.05, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.66, h * 0.34); ctx.lineTo(w * 0.66, h * 0.44); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.74, h * 0.34); ctx.lineTo(w * 0.74, h * 0.44); ctx.stroke();
      ctx.fillStyle = '#7c6440'; [.78, .84].forEach((x, i) => { ctx.fillRect(w * x, h * (0.6 - i * 0.02), w * 0.06, h * 0.08); });
      return true;
    }
    if (scene === 'chiljeongsan-observatory') {
      fillSky('#232733', '#3c4356', '#4a5266');
      ctx.fillStyle = 'rgba(255,255,255,.8)'; [[.14, .22], [.26, .2], [.82, .24], [.88, .28]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.006, 0, Math.PI * 2); ctx.fill(); });
      ctx.strokeStyle = 'rgba(230,225,200,.85)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(w * 0.72, h * 0.24, w * 0.05, Math.PI * 0.2, Math.PI * 1.6); ctx.stroke();
      ctx.fillStyle = '#5f6b78'; ctx.fillRect(w * 0.46, h * 0.68, w * 0.08, h * 0.16);
      ctx.strokeStyle = '#c9b98c'; ctx.lineWidth = 2; [0.16, 0.12, 0.08].forEach(r => { ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, w * r + w * 0.02, 0, Math.PI * 2); ctx.stroke(); });
      ctx.strokeStyle = '#e4c46a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.5); ctx.lineTo(w * 0.58, h * 0.4); ctx.stroke();
      return true;
    }
    if (scene === 'angbuilgu-street') {
      fillSky('#cfe0d4', '#eef0e0', '#8a9678');
      ctx.fillStyle = '#8a7355'; ctx.fillRect(0, h * 0.6, w * 0.26, h * 0.05); ctx.fillRect(w * 0.74, h * 0.58, w * 0.26, h * 0.06);
      ctx.fillStyle = '#5c6b78'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.62, w * 0.17, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#dfe6ec'; ctx.lineWidth = 1.5; [Math.PI * 0.15, Math.PI * 0.38, Math.PI * 0.5, Math.PI * 0.62, Math.PI * 0.85].forEach(a => { ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.62); ctx.lineTo(w * 0.5 - Math.cos(a) * w * 0.17, h * 0.62 - Math.sin(a) * w * 0.17); ctx.stroke(); });
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.62); ctx.lineTo(w * 0.45, h * 0.5); ctx.stroke();
      ctx.fillStyle = '#4a4438'; [[.2, .86], [.78, .84], [.9, .88]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * (y - 0.08), w * 0.018, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * x - w * 0.012, h * y - h * 0.09, w * 0.024, h * 0.08); });
      return true;
    }
    if (scene === 'ianbeop-farming') {
      fillSky('#cfe0d4', '#eef0e0', '#4f90b0');
      ctx.fillStyle = '#4f90b0'; ctx.fillRect(0, h * 0.5, w, h * 0.5);
      ctx.strokeStyle = 'rgba(63,111,66,.4)'; ctx.lineWidth = 2; [.52, .55].forEach(y => { ctx.beginPath(); ctx.moveTo(0, h * y); ctx.lineTo(w, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#3f6f8f'; [.62, .72, .82].forEach(y => { ctx.beginPath(); ctx.moveTo(0, h * y); ctx.lineTo(w, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#3f6f42'; ctx.lineWidth = 2; for (let r = 0; r < 3; r++) { for (let c = 0; c < 5; c++) { const x = w * (0.12 + c * 0.18), y = h * (0.56 + r * 0.13); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 10); ctx.stroke(); } }
      return true;
    }
    if (scene === 'sangpum-crops') {
      fillSky('#e6ded0', '#f2ecdd', '#c9a15a');
      ctx.fillStyle = '#8a6a35'; [.56, .66, .76, .86].forEach(y => { ctx.fillRect(0, h * y, w, h * 0.05); });
      ctx.fillStyle = '#4f7a3f'; [.2, .3, .4].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.56); ctx.lineTo(w * x - 8, h * 0.44); ctx.lineTo(w * x, h * 0.5); ctx.lineTo(w * x + 8, h * 0.44); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = '#3f6f42'; [.62, .76].forEach(x => { ctx.beginPath(); ctx.ellipse(w * x, h * 0.6, w * 0.06, h * 0.035, 0.3, 0, Math.PI * 2); ctx.fill(); });
      return true;
    }
    if (scene === 'sangpyeongtongbo-market') {
      fillSky('#e6ded0', '#f2ecdd', '#b9ab86');
      ctx.fillStyle = '#8a7355'; [.14, .42, .68].forEach(x => { ctx.fillRect(w * x, h * 0.62, w * 0.2, h * 0.04); });
      [[.2, .56], [.24, .53], [.28, .56], [.48, .56], [.52, .53], [.76, .56]].forEach(([x, y]) => { ctx.fillStyle = '#e4c46a'; ctx.strokeStyle = '#7e5a28'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.018, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#7e5a28'; ctx.fillRect(w * x - 2, h * y - 2, 4, 4); });
      ctx.fillStyle = '#5c4a34'; [[.35, .86], [.6, .88]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * (y - 0.08), w * 0.018, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * x - w * 0.012, h * y - h * 0.09, w * 0.024, h * 0.08); });
      return true;
    }
    if (scene === 'hanyang-commerce-summary') {
      fillSky('#e6ded0', '#f2ecdd', '#c9a15a');
      ctx.fillStyle = '#8a5a35'; [.06, .24, .42, .6, .78].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.42); ctx.lineTo(w * (x + 0.09), h * 0.32); ctx.lineTo(w * (x + 0.18), h * 0.42); ctx.closePath(); ctx.fill(); ctx.fillRect(w * x + w * 0.02, h * 0.42, w * 0.14, h * 0.16); });
      ctx.fillStyle = '#c9b98c'; [.09, .27, .45, .63, .81].forEach(x => { ctx.fillRect(w * x, h * 0.34, w * 0.03, h * 0.05); });
      ctx.fillStyle = '#5c4a34'; ctx.fillRect(w * 0.4, h * 0.66, w * 0.2, h * 0.1);
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.44, h * 0.78, w * 0.025, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(w * 0.56, h * 0.78, w * 0.025, 0, Math.PI * 2); ctx.stroke();
      return true;
    }
    if (scene === 'tapgol-declaration') {
      fillSky('#eee6d2', '#f6f0dd', '#c9b98c');
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.32, h * 0.42); ctx.lineTo(w * 0.5, h * 0.26); ctx.lineTo(w * 0.68, h * 0.42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#736355'; [0.38, 0.46, 0.54, 0.62].forEach(x => { ctx.fillRect(w * x, h * 0.42, w * 0.02, h * 0.16); });
      ctx.fillStyle = '#f2ecdd'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.2; ctx.fillRect(w * 0.42, h * 0.6, w * 0.16, h * 0.1); ctx.strokeRect(w * 0.42, h * 0.6, w * 0.16, h * 0.1);
      ctx.strokeStyle = '#8a7355'; [0.635, 0.665, 0.69].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.45, h * y); ctx.lineTo(w * 0.55, h * y); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(138,99,53,0.35)'; ctx.lineWidth = 2; [0.22, 0.3].forEach(r => { ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, w * r, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); });
      const people = [0.18, 0.3, 0.7, 0.82, 0.5];
      ctx.fillStyle = '#8a8478'; people.forEach(x => {
        ctx.beginPath(); ctx.arc(w * x, h * 0.78, w * 0.016, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w * x - w * 0.018, h * 0.92); ctx.lineTo(w * x + w * 0.018, h * 0.92); ctx.lineTo(w * x + w * 0.012, h * 0.8); ctx.lineTo(w * x - w * 0.012, h * 0.8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#a13a2e'; ctx.lineWidth = 1; ctx.fillRect(w * (x + 0.012), h * 0.7, w * 0.022, h * 0.016); ctx.strokeRect(w * (x + 0.012), h * 0.7, w * 0.022, h * 0.016);
        ctx.beginPath(); ctx.arc(w * (x + 0.023), h * 0.708, w * 0.005, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#8a8478';
      });
      return true;
    }
    if (scene === 'aunae-market-rally') {
      fillSky('#eee6d2', '#f6f0dd', '#c9b98c');
      ctx.fillStyle = '#8a7355'; ctx.fillRect(w * 0.04, h * 0.62, w * 0.2, h * 0.05); ctx.fillRect(w * 0.76, h * 0.62, w * 0.2, h * 0.05);
      ctx.fillStyle = '#736355'; [[.08, .86], [.9, .86]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(w * x, h * y); ctx.lineTo(w * (x + 0.06), h * (y - 0.16)); ctx.lineTo(w * (x + 0.12), h * y); ctx.closePath(); ctx.fill(); });
      // narrative가 "한 사람의 영웅담으로만 좁히지 말고"를 명시하므로 실루엣을 전부 같은 크기·같은 높이로 배치한다.
      const rally = [0.32, 0.42, 0.5, 0.58, 0.66, 0.74];
      ctx.fillStyle = '#8a8478';
      rally.forEach(x => {
        ctx.beginPath(); ctx.arc(w * x, h * 0.66, w * 0.015, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w * x - w * 0.017, h * 0.8); ctx.lineTo(w * x + w * 0.017, h * 0.8); ctx.lineTo(w * x + w * 0.011, h * 0.68); ctx.lineTo(w * x - w * 0.011, h * 0.68); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#a13a2e'; ctx.lineWidth = 1; ctx.fillRect(w * (x + 0.011), h * 0.58, w * 0.02, h * 0.014); ctx.strokeRect(w * (x + 0.011), h * 0.58, w * 0.02, h * 0.014);
        ctx.beginPath(); ctx.arc(w * (x + 0.021), h * 0.587, w * 0.0045, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#8a8478';
      });
      return true;
    }
    if (scene === 'shanghai-provisional-government') {
      fillSky('#eee6d2', '#f6f0dd', '#c9b98c');
      ctx.fillStyle = '#c9c0a6'; ctx.fillRect(w * 0.24, h * 0.28, w * 0.52, h * 0.34);
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.2; for (let r = 0; r < 2; r++) { for (let c = 0; c < 3; c++) { ctx.strokeRect(w * (0.3 + c * 0.15), h * (0.34 + r * 0.12), w * 0.1, h * 0.08); } }
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.3, h * 0.62, w * 0.06, h * 0.16); ctx.fillRect(w * 0.47, h * 0.62, w * 0.06, h * 0.16); ctx.fillRect(w * 0.64, h * 0.62, w * 0.06, h * 0.16);
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.42, h * 0.24, w * 0.16, h * 0.05); ctx.strokeRect(w * 0.42, h * 0.24, w * 0.16, h * 0.05);
      ctx.fillStyle = '#c9c0a6'; ctx.fillRect(w * 0.2, h * 0.78, w * 0.6, h * 0.03); ctx.fillRect(w * 0.24, h * 0.81, w * 0.52, h * 0.03);
      return true;
    }
    if (scene === 'memorial-candlelight') {
      // narrative가 "피해를 자극적으로 재현하지 않고 기록·증언·기억 활동"을 명시하므로 인물·탄광·이송 없이 추모 공간만 그린다.
      fillSky('#26221d', '#3a352c', '#211d18');
      const flames = [0.36, 0.46, 0.56, 0.66];
      flames.forEach((x) => {
        ctx.fillStyle = 'rgba(230,196,106,0.18)'; ctx.beginPath(); ctx.arc(w * x, h * 0.44, w * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4a4038'; ctx.fillRect(w * x - w * 0.014, h * 0.46, w * 0.028, h * 0.16);
        ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.ellipse(w * x, h * 0.42, w * 0.014, h * 0.026, 0, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#736355'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.74, h * 0.5, w * 0.16, h * 0.18); ctx.strokeRect(w * 0.74, h * 0.5, w * 0.16, h * 0.18);
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.2; [0.56, 0.61].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.77, h * y); ctx.lineTo(w * 0.87, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#3f6f42'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.7); ctx.lineTo(w * 0.18, h * 0.56); ctx.stroke();
      ctx.fillStyle = '#c96a6a'; [[0.16, 0.52], [0.185, 0.5], [0.21, 0.52], [0.198, 0.55]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.014, 0, Math.PI * 2); ctx.fill(); });
      return true;
    }
    if (scene === 'gendarme-rule-ordinance') {
      // infoText가 즉결 처벌권을 명시하지만 폭력·헌병 도상은 금지되므로, 빈 교실과 법령 문서·도장으로만 억압을 은유한다.
      fillSky('#c9c4b6', '#e2ded2', '#a9a08c');
      ctx.fillStyle = '#8f8975'; [0.16, 0.36, 0.56].forEach(x => { ctx.fillRect(w * x, h * 0.58, w * 0.12, h * 0.05); ctx.fillRect(w * (x + 0.02), h * 0.63, w * 0.02, h * 0.1); ctx.fillRect(w * (x + 0.08), h * 0.63, w * 0.02, h * 0.1); });
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#6b6255'; ctx.lineWidth = 2; ctx.fillRect(w * 0.66, h * 0.24, w * 0.22, h * 0.28); ctx.strokeRect(w * 0.66, h * 0.24, w * 0.22, h * 0.28);
      ctx.strokeStyle = '#6b6255'; ctx.lineWidth = 1.5; [0.32, 0.38, 0.44].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.7, h * y); ctx.lineTo(w * 0.84, h * y); ctx.stroke(); });
      ctx.strokeStyle = '#a13a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.8, h * 0.47, w * 0.03, 0, Math.PI * 2); ctx.stroke();
      return true;
    }
    if (scene === 'land-survey-office') {
      const parcels = [[0.1, 0.32, 0.16, 0.12], [0.28, 0.3, 0.1, 0.16], [0.4, 0.36, 0.14, 0.1], [0.56, 0.3, 0.12, 0.14], [0.7, 0.34, 0.16, 0.12], [0.88, -0.02, 0.1, 0.14]];
      fillSky('#dcd6c6', '#eeeae0', '#a9a08c');
      parcels.forEach(([x, y, pw, ph], i) => {
        ctx.fillStyle = i % 2 === 0 ? '#b7ae94' : '#c9c0a6'; ctx.fillRect(w * x, h * (0.42 + y), w * pw, h * ph);
        ctx.strokeStyle = '#6b6255'; ctx.lineWidth = 1; ctx.strokeRect(w * x, h * (0.42 + y), w * pw, h * ph);
      });
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 2; ctx.strokeRect(w * 0.28, h * 0.72, w * 0.1, h * 0.16); ctx.strokeStyle = '#7c5a2e'; ctx.beginPath(); ctx.arc(w * 0.33, h * 0.8, w * 0.02, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#4a4438'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.86); ctx.lineTo(w * 0.76, h * 0.7); ctx.lineTo(w * 0.82, h * 0.86); ctx.stroke(); ctx.beginPath(); ctx.moveTo(w * 0.73, h * 0.79); ctx.lineTo(w * 0.79, h * 0.79); ctx.stroke();
      return true;
    }
    if (scene === 'secret-society-oath') {
      fillSky('#2a2620', '#3c362c', '#231f19');
      ctx.fillStyle = 'rgba(228,196,106,0.16)'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, w * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a4038'; ctx.fillRect(w * 0.49, h * 0.52, w * 0.02, h * 0.1); ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.5, w * 0.012, h * 0.022, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.2; ctx.fillRect(w * 0.44, h * 0.6, w * 0.12, h * 0.09); ctx.strokeRect(w * 0.44, h * 0.6, w * 0.12, h * 0.09);
      ctx.strokeStyle = '#8a7355'; [0.635, 0.665].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.46, h * y); ctx.lineTo(w * 0.54, h * y); ctx.stroke(); });
      const seats = [[0.22, 0.66], [0.32, 0.78], [0.68, 0.78], [0.78, 0.66]];
      ctx.fillStyle = '#5c554a'; seats.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * 0.018, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(w * x, h * (y + 0.06), w * 0.028, h * 0.022, 0, 0, Math.PI * 2); ctx.fill(); });
      return true;
    }
    if (scene === 'imperial-subject-policy') {
      fillSky('#d8d2c2', '#eeeae0', '#a9a08c');
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#6b6255'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.36, h * 0.24, w * 0.28, h * 0.1); ctx.strokeRect(w * 0.36, h * 0.24, w * 0.28, h * 0.1);
      ctx.fillRect(w * 0.4, h * 0.36, w * 0.1, h * 0.14); ctx.strokeRect(w * 0.4, h * 0.36, w * 0.1, h * 0.14);
      ctx.fillRect(w * 0.52, h * 0.36, w * 0.1, h * 0.14); ctx.strokeRect(w * 0.52, h * 0.36, w * 0.1, h * 0.14);
      ctx.fillStyle = '#4a4438'; ctx.fillRect(w * 0.44, h * 0.58, w * 0.12, h * 0.08);
      const people = [0.3, 0.42, 0.54, 0.66];
      ctx.fillStyle = '#8a8478'; people.forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.72, w * 0.017, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.02, h * 0.86); ctx.lineTo(w * x + w * 0.02, h * 0.86); ctx.lineTo(w * x + w * 0.014, h * 0.74); ctx.lineTo(w * x - w * 0.014, h * 0.74); ctx.closePath(); ctx.fill(); });
      return true;
    }
    if (scene === 'korean-language-society') {
      fillSky('#e6ded0', '#f2ecdd', '#a9a08c');
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.32, h * 0.58, w * 0.36, h * 0.06);
      [0, 1, 2, 3].forEach(i => {
        ctx.save(); ctx.translate(w * (0.4 + i * 0.008), h * (0.44 - i * 0.02)); ctx.rotate((i - 1.5) * 0.03);
        ctx.fillStyle = '#f2ecdd'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1; ctx.fillRect(0, 0, w * 0.18, h * 0.14); ctx.strokeRect(0, 0, w * 0.18, h * 0.14);
        ctx.strokeStyle = '#a08256'; [0.03, 0.06, 0.09].forEach(yy => { ctx.beginPath(); ctx.moveTo(w * 0.02, h * yy); ctx.lineTo(w * 0.15, h * yy); ctx.stroke(); });
        ctx.restore();
      });
      ctx.fillStyle = '#8a5a35'; ctx.strokeStyle = '#5c3d24'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.68, h * 0.52, w * 0.16, h * 0.12); ctx.strokeRect(w * 0.68, h * 0.52, w * 0.16, h * 0.12);
      ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.52); ctx.lineTo(w * 0.76, h * 0.46); ctx.lineTo(w * 0.84, h * 0.52); ctx.stroke();
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.78); ctx.quadraticCurveTo(w * 0.45, h * 0.9, w * 0.7, h * 0.66); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'ganghwa-treaty-hall') {
      fillSky('#dee6ec', '#eef2ea', '#8ab0c2');
      ctx.fillStyle = '#8a5a35'; ctx.fillRect(w * 0.12, h * 0.6, w * 0.24, h * 0.1); ctx.strokeStyle = '#5c3d24'; ctx.lineWidth = 1.5; ctx.strokeRect(w * 0.12, h * 0.6, w * 0.24, h * 0.1);
      ctx.fillStyle = '#f2ecdd'; ctx.strokeStyle = '#8a7355'; ctx.fillRect(w * 0.14, h * 0.54, w * 0.08, h * 0.06); ctx.strokeRect(w * 0.14, h * 0.54, w * 0.08, h * 0.06);
      ctx.fillRect(w * 0.24, h * 0.54, w * 0.08, h * 0.06); ctx.strokeRect(w * 0.24, h * 0.54, w * 0.08, h * 0.06);
      ctx.strokeStyle = '#a13a2e'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(w * 0.28, h * 0.57, w * 0.024, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#456580'; ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.5); ctx.lineTo(w * 0.86, h * 0.5); ctx.lineTo(w * 0.8, h * 0.42); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(69,101,128,0.5)'; ctx.lineWidth = 1.5; [0.68, 0.72].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.6, h * y); ctx.lineTo(w * 0.94, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'jejungwon-postal') {
      fillSky('#dee6ec', '#eef2ea', '#8ab0c2');
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.5); ctx.lineTo(w * 0.22, h * 0.38); ctx.lineTo(w * 0.34, h * 0.5); ctx.closePath(); ctx.fill(); ctx.fillRect(w * 0.13, h * 0.5, w * 0.18, h * 0.14);
      ctx.fillStyle = '#456580'; ctx.fillRect(w * 0.5, h * 0.56, w * 0.05, h * 0.14); ctx.strokeStyle = '#2f4657'; ctx.lineWidth = 1; ctx.strokeRect(w * 0.502, h * 0.585, w * 0.046, h * 0.03);
      const people = [0.68, 0.78, 0.88];
      ctx.fillStyle = '#8a8478'; people.forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.58, w * 0.017, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.02, h * 0.72); ctx.lineTo(w * x + w * 0.02, h * 0.72); ctx.lineTo(w * x + w * 0.014, h * 0.6); ctx.lineTo(w * x - w * 0.014, h * 0.6); ctx.closePath(); ctx.fill(); });
      return true;
    }
    if (scene === 'hanyang-tram-street') {
      fillSky('#dee6ec', '#eef2ea', '#8ab0c2');
      ctx.fillStyle = '#456580'; ctx.fillRect(w * 0.2, h * 0.46, w * 0.6, h * 0.22);
      ctx.fillStyle = '#e6eef2'; [0.28, 0.4, 0.52, 0.64].forEach(x => { ctx.fillRect(w * x, h * 0.5, w * 0.08, h * 0.08); });
      ctx.fillStyle = '#8a8478'; [0.28, 0.4, 0.52, 0.64].forEach(x => { ctx.beginPath(); ctx.arc(w * (x + 0.04), h * 0.54, w * 0.012, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#3a3630'; ctx.beginPath(); ctx.arc(w * 0.3, h * 0.7, w * 0.03, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(w * 0.7, h * 0.7, w * 0.03, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5c6b78'; ctx.fillRect(w * 0.48, h * 0.3, w * 0.014, h * 0.16);
      ctx.strokeStyle = '#3a3630'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, h * 0.28); ctx.lineTo(w, h * 0.3); ctx.stroke();
      ctx.fillStyle = '#e4c46a'; ctx.beginPath(); ctx.arc(w * 0.15, h * 0.32, w * 0.02, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    if (scene === 'busan-shanty-rebuild') {
      fillSky('#e6e2d4', '#f0ece0', '#9a9284');
      const roofs = [[0.1, 0.5, 0.16], [0.24, 0.44, 0.14], [0.38, 0.5, 0.18], [0.56, 0.46, 0.15], [0.72, 0.52, 0.16]];
      roofs.forEach(([x, y, rw]) => { ctx.fillStyle = '#8f8975'; ctx.fillRect(w * x, h * y, w * rw, h * 0.2); ctx.fillStyle = '#736355'; ctx.beginPath(); ctx.moveTo(w * x - w * 0.01, h * y); ctx.lineTo(w * (x + rw / 2), h * (y - 0.08)); ctx.lineTo(w * (x + rw) + w * 0.01, h * y); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = '#8a5a35'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.78, w * 0.05, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.72); ctx.quadraticCurveTo(w * 0.44, h * 0.66, w * 0.47, h * 0.62); ctx.stroke();
      const people2 = [0.3, 0.66];
      ctx.fillStyle = '#8a8478'; people2.forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.7, w * 0.016, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.018, h * 0.84); ctx.lineTo(w * x + w * 0.018, h * 0.84); ctx.lineTo(w * x + w * 0.012, h * 0.72); ctx.lineTo(w * x - w * 0.012, h * 0.72); ctx.closePath(); ctx.fill(); });
      return true;
    }
    if (scene === 'tent-classroom') {
      fillSky('#e6e2d4', '#f0ece0', '#9a9284');
      ctx.fillStyle = '#a9a08c'; ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.62); ctx.lineTo(w * 0.5, h * 0.3); ctx.lineTo(w * 0.8, h * 0.62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.3); ctx.lineTo(w * 0.5, h * 0.62); ctx.stroke();
      const desks = [0.3, 0.46, 0.62];
      desks.forEach(x => {
        ctx.fillStyle = '#8a5a35'; ctx.fillRect(w * x, h * 0.68, w * 0.1, h * 0.06);
        ctx.fillStyle = '#f2ecdd'; ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1; ctx.fillRect(w * (x + 0.015), h * 0.65, w * 0.07, h * 0.03); ctx.strokeRect(w * (x + 0.015), h * 0.65, w * 0.07, h * 0.03);
      });
      ctx.fillStyle = '#4a4438'; ctx.fillRect(w * 0.78, h * 0.7, w * 0.02, h * 0.05); ctx.beginPath(); ctx.moveTo(w * 0.8, h * 0.7); ctx.lineTo(w * 0.815, h * 0.685); ctx.lineTo(w * 0.8, h * 0.7); ctx.fill();
      return true;
    }
    if (scene === 'gwangju-june-democracy') {
      // narrative가 "한 사람의 영웅담이 아니라 시민 연대"를 강조하므로 실루엣을 전부 같은 크기·높이로 배치하고,
      // 진압·부상 장면 없이 거리 행진과 기록 자료만 그린다.
      fillSky('#3a3f4a', '#4a5566', '#26292f');
      const crowd = [0.14, 0.24, 0.34, 0.66, 0.76, 0.86];
      ctx.fillStyle = '#c9cdd4';
      crowd.forEach(x => {
        ctx.beginPath(); ctx.arc(w * x, h * 0.66, w * 0.015, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(w * x - w * 0.017, h * 0.82); ctx.lineTo(w * x + w * 0.017, h * 0.82); ctx.lineTo(w * x + w * 0.011, h * 0.68); ctx.lineTo(w * x - w * 0.011, h * 0.68); ctx.closePath(); ctx.fill();
      });
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#456580'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.42, h * 0.42, w * 0.16, h * 0.14); ctx.strokeRect(w * 0.42, h * 0.42, w * 0.16, h * 0.14);
      ctx.strokeStyle = '#456580'; ctx.lineWidth = 1.2; [0.47, 0.51].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.45, h * y); ctx.lineTo(w * 0.55, h * y); ctx.stroke(); });
      ctx.fillStyle = 'rgba(239,233,220,0.85)'; ctx.strokeStyle = '#736355'; ctx.lineWidth = 1; ctx.fillRect(w * 0.7, h * 0.5, w * 0.12, h * 0.16); ctx.strokeRect(w * 0.7, h * 0.5, w * 0.12, h * 0.16);
      ctx.strokeStyle = '#8a7355'; [0.56, 0.6, 0.64].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.72, h * y); ctx.lineTo(w * 0.8, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'hangang-miracle-factory') {
      // 성과와 대가를 함께 보여주려고 공장 실루엣과 노동 도구, 그리고 접힌 진정서를 나란히 그린다.
      // 전태일의 분신은 서술문에서도 직접 재현하지 않으므로 불꽃·인물을 그리지 않는다.
      fillSky('#c9d4dc', '#e6e2d0', '#7c8480');
      ctx.fillStyle = '#8f8975'; ctx.fillRect(w * 0.06, h * 0.42, w * 0.26, h * 0.28); ctx.fillRect(w * 0.34, h * 0.34, w * 0.22, h * 0.36);
      ctx.strokeStyle = '#5c554a'; ctx.lineWidth = 3; [0.12, 0.44].forEach(x => { ctx.beginPath(); ctx.moveTo(w * x, h * 0.34); ctx.lineTo(w * x, h * 0.18); ctx.stroke(); });
      ctx.fillStyle = 'rgba(180,180,180,0.35)'; [0.12, 0.44].forEach(x => { ctx.beginPath(); ctx.ellipse(w * x, h * 0.15, w * 0.03, h * 0.02, 0, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#736355'; ctx.fillRect(w * 0.6, h * 0.62, w * 0.22, h * 0.05);
      ctx.strokeStyle = '#a13a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * 0.66, h * 0.58, w * 0.025, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.6); ctx.lineTo(w * 0.86, h * 0.6); ctx.stroke();
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#736355'; ctx.lineWidth = 1.2; ctx.fillRect(w * 0.66, h * 0.72, w * 0.16, h * 0.14); ctx.strokeRect(w * 0.66, h * 0.72, w * 0.16, h * 0.14);
      ctx.strokeStyle = '#8a7355'; [0.77, 0.81].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.69, h * y); ctx.lineTo(w * 0.79, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'namhae-suguninmul') {
      // 이 스테이지는 전투가 아니라 지휘관 기용 판단이므로, 정박한 판옥선과 임명 문서만 그리고 교전 요소는 넣지 않는다.
      fillSky('#c9d9df', '#e9dfc2', '#4f7a8f');
      ctx.fillStyle = '#4f7a8f'; ctx.fillRect(0, h * 0.58, w, h * 0.42);
      const ships = [0.18, 0.42, 0.66];
      ctx.fillStyle = '#6f5a3f';
      ships.forEach(x => {
        ctx.beginPath(); ctx.moveTo(w * x - w * 0.08, h * 0.6); ctx.lineTo(w * x + w * 0.08, h * 0.6); ctx.lineTo(w * x + w * 0.05, h * 0.52); ctx.lineTo(w * x - w * 0.05, h * 0.52); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#4a3c29'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * x, h * 0.52); ctx.lineTo(w * x, h * 0.38); ctx.stroke();
      });
      ctx.fillStyle = '#efe9dc'; ctx.strokeStyle = '#736355'; ctx.lineWidth = 1.5; ctx.fillRect(w * 0.76, h * 0.32, w * 0.16, h * 0.2); ctx.strokeRect(w * 0.76, h * 0.32, w * 0.16, h * 0.2);
      ctx.strokeStyle = '#8a7355'; ctx.lineWidth = 1.2; [0.4, 0.44, 0.48].forEach(y => { ctx.beginPath(); ctx.moveTo(w * 0.79, h * y); ctx.lineTo(w * 0.89, h * y); ctx.stroke(); });
      return true;
    }
    if (scene === 'hansando-hakikjin') {
      // 학익진의 부채꼴 대형 자체는 교육 자료지만, 화포·화염·적선 침몰 묘사는 넣지 않고 대형 배치만 보여준다.
      fillSky('#c9d9df', '#e9dfc2', '#4f7a8f');
      ctx.fillStyle = '#4f7a8f'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
      const arc = [[0.18, 0.66], [0.32, 0.58], [0.5, 0.55], [0.68, 0.58], [0.82, 0.66]];
      ctx.fillStyle = '#6f5a3f';
      arc.forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(w * x - w * 0.055, h * y + h * 0.02); ctx.lineTo(w * x + w * 0.055, h * y + h * 0.02); ctx.lineTo(w * x + w * 0.035, h * y - h * 0.04); ctx.lineTo(w * x - w * 0.035, h * y - h * 0.04); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#4a3c29'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * x, h * y - h * 0.04); ctx.lineTo(w * x, h * y - h * 0.12); ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(74,60,41,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(w * 0.14, h * 0.5); ctx.quadraticCurveTo(w * 0.5, h * 0.32, w * 0.86, h * 0.5); ctx.stroke(); ctx.setLineDash([]);
      return true;
    }
    if (scene === 'dmz-reunion-peace') {
      fillSky('#e6e2d4', '#f0ece0', '#9a9284');
      ctx.strokeStyle = '#736355'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(0, h * 0.62); ctx.lineTo(w, h * 0.62); ctx.stroke(); ctx.setLineDash([]);
      const left = [0.16, 0.28]; const right = [0.72, 0.84];
      ctx.fillStyle = '#8a8478';
      [...left, ...right].forEach(x => { ctx.beginPath(); ctx.arc(w * x, h * 0.72, w * 0.017, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(w * x - w * 0.02, h * 0.86); ctx.lineTo(w * x + w * 0.02, h * 0.86); ctx.lineTo(w * x + w * 0.014, h * 0.74); ctx.lineTo(w * x - w * 0.014, h * 0.74); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = '#efe9dc'; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.3, w * 0.05, h * 0.03, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.45, h * 0.3); ctx.lineTo(w * 0.4, h * 0.26); ctx.lineTo(w * 0.45, h * 0.32); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.55, h * 0.3); ctx.lineTo(w * 0.6, h * 0.26); ctx.lineTo(w * 0.55, h * 0.32); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5f6f57'; ctx.beginPath(); ctx.ellipse(w * 0.1, h * 0.8, w * 0.04, h * 0.03, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.9, h * 0.78, w * 0.04, h * 0.03, 0, 0, Math.PI * 2); ctx.fill();
      return true;
    }
    return false;
  },

  // 구석기 단서가 배경 맥락 없이 떠 보이지 않도록, 활동별 장면을 캔버스로 직접 그린다.
  // 외부 이미지 요청을 피하므로 GitHub Pages 배포·iPad 오프라인 캐시에서도 같은 화면을 유지한다.
  drawPaleoSceneBackground(ctx, w, h, mode, colors) {
    const groundY = h * 0.68;
    const sky = ctx.createLinearGradient(0, 0, 0, h);

    if (mode === 'paleo-fire') {
      sky.addColorStop(0, '#120c09');
      sky.addColorStop(1, '#4b2e1d');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2b1d16';
      ctx.beginPath();
      ctx.moveTo(0, h); ctx.lineTo(0, h * 0.2); ctx.quadraticCurveTo(w * 0.2, h * 0.02, w * 0.42, h * 0.28);
      ctx.quadraticCurveTo(w * 0.72, h * 0.04, w, h * 0.3); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6b4428';
      ctx.fillRect(w * 0.27, groundY, w * 0.46, h * 0.32);
      ctx.strokeStyle = '#3b2416'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.66); ctx.lineTo(w * 0.58, h * 0.77); ctx.moveTo(w * 0.58, h * 0.66); ctx.lineTo(w * 0.42, h * 0.77); ctx.stroke();
      ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.63, Math.min(w, h) * 0.09, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.62, Math.min(w, h) * 0.045, 0, Math.PI * 2); ctx.fill();
    } else if (mode === 'paleo-stone') {
      sky.addColorStop(0, '#c8d8dc'); sky.addColorStop(0.6, '#e8e0cd'); sky.addColorStop(0.61, '#9b8e79'); sky.addColorStop(1, '#6c6258');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#6598af'; ctx.beginPath(); ctx.moveTo(w * 0.68, 0); ctx.bezierCurveTo(w * 0.5, h * 0.36, w * 0.9, h * 0.55, w * 0.74, h); ctx.lineTo(w, h); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9f9587';
      [[0.12, 0.78, 0.06], [0.27, 0.86, 0.045], [0.7, 0.8, 0.07], [0.86, 0.7, 0.04]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(w * x, h * y, w * r, h * r * 0.65, 0, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = '#b6afa6'; ctx.beginPath(); ctx.ellipse(w / 2, h * 0.46, w * 0.2, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#776f66'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.43); ctx.lineTo(w * 0.59, h * 0.5); ctx.moveTo(w * 0.5, h * 0.31); ctx.lineTo(w * 0.48, h * 0.59); ctx.stroke();
    } else if (mode === 'paleo-hunt') {
      sky.addColorStop(0, '#b9d7d5'); sky.addColorStop(0.62, '#dce5c4'); sky.addColorStop(0.63, '#789357'); sky.addColorStop(1, '#506b3d');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#617e50'; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w * 0.26, h * 0.37); ctx.lineTo(w * 0.42, groundY); ctx.lineTo(w, h * 0.46); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(w * 0.16, h * 0.57); ctx.bezierCurveTo(w * 0.32, h * 0.44, w * 0.52, h * 0.58, w * 0.7, h * 0.47); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#6d4c38'; ctx.beginPath(); ctx.ellipse(w * 0.79, h * 0.35, w * 0.055, h * 0.035, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * 0.75, h * 0.37, w * 0.008, h * 0.12); ctx.fillRect(w * 0.81, h * 0.37, w * 0.008, h * 0.12);
    } else if (mode === 'paleo-community') {
      sky.addColorStop(0, '#efd5a5'); sky.addColorStop(0.62, '#f4b878'); sky.addColorStop(0.63, '#967151'); sky.addColorStop(1, '#6e523d');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#a07452'; ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#6b4428'; ctx.beginPath(); ctx.moveTo(w * 0.12, groundY); ctx.lineTo(w * 0.27, h * 0.37); ctx.lineTo(w * 0.42, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d9c09a'; ctx.beginPath(); ctx.moveTo(w * 0.16, groundY); ctx.lineTo(w * 0.27, h * 0.47); ctx.lineTo(w * 0.37, groundY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(w * 0.58, h * 0.67, Math.min(w, h) * 0.055, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a3425'; [0.48, 0.69, 0.82].forEach((x) => { ctx.beginPath(); ctx.arc(w * x, h * 0.54, w * 0.025, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(w * x - 3, h * 0.57, 6, h * 0.12); });
    } else {
      sky.addColorStop(0, '#9bb6c5'); sky.addColorStop(0.58, '#f2d2a1'); sky.addColorStop(0.59, '#778d61'); sky.addColorStop(1, '#4f6949');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(w * 0.75, h * 0.22, Math.min(w, h) * 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4e6144'; ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w * 0.18, h * 0.45); ctx.lineTo(w * 0.36, groundY); ctx.lineTo(w, h * 0.52); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6b4428'; ctx.beginPath(); ctx.moveTo(w * 0.39, h * 0.72); ctx.lineTo(w * 0.5, h * 0.48); ctx.lineTo(w * 0.61, h * 0.72); ctx.closePath(); ctx.fill();
    }
  },

  setPaleoFeedback(message, hotspotId = null) {
    const feedback = document.getElementById('mn-canvas-feedback');
    if (feedback) feedback.textContent = message;
    if (hotspotId) this.drawSim();
  },

  updatePaleoGauge(progress, total) {
    const safeProgress = Number(progress);
    const safeTotal = Number(total);
    const percent = Number.isFinite(safeProgress) && Number.isFinite(safeTotal) && safeTotal > 0
      ? Math.max(0, Math.min(100, Math.round((safeProgress / safeTotal) * 100)))
      : 0;
    const gp = document.getElementById('gauge-progress');
    const gb = document.getElementById('gauge-bar');
    if (gp) gp.textContent = `${percent}%`;
    if (gb) gb.style.width = `${percent}%`;
  },

  renderAlternativeControls() {
    const container = document.getElementById('mn-hotspot-actions');
    const engine = window.MudEngine;
    if (!container || !engine) return;

    const supported = ['hotspot-discovery', 'resource-allocation', 'reflection', 'ordered-hotspot'];
    const interaction = engine.currentSimulator?.interaction;
    if (!engine.currentSimulator?.required || !supported.includes(interaction)) {
      container.replaceChildren();
      container.style.display = 'none';
      return;
    }

    const canvas = document.getElementById('mn-canvas');
    const hotspots = this.getPaleoHotspots(engine.simMode, canvas?.width || 100, canvas?.height || 100);
    const state = engine.getSimulatorState(engine.simMode);

    container.replaceChildren();
    hotspots.forEach(hotspot => {
      const button = document.createElement('button');
      const found = state?.found?.includes(hotspot.id);
      button.type = 'button';
      button.className = 'btn secondary';
      button.style.cssText = 'width: auto; flex: 1 1 30%; min-width: 92px; min-height: 44px; padding: 7px 8px; font-size: 0.82rem;';
      button.textContent = `${found ? '✓ ' : ''}${hotspot.label}`;
      button.disabled = Boolean(found);
      button.addEventListener('click', () => this.activateHotspot(hotspot.id));
      container.appendChild(button);
    });
    container.style.display = hotspots.length ? 'flex' : 'none';
  },

  activateHotspot(hotspotId) {
    const engine = window.MudEngine;
    const canvas = document.getElementById('mn-canvas');
    if (!engine || !canvas) return;
    const hotspot = this.getPaleoHotspots(engine.simMode, canvas.width || 100, canvas.height || 100)
      .find(item => item.id === hotspotId);
    if (!hotspot) return;

    let actionAccepted = false;
    actionAccepted = this.dispatchHotspotInteraction(engine.simMode, hotspot, engine);
    if (actionAccepted) {
      engine.registerSimulatorAction();
      engine.registerUniqueSimulatorAction(hotspot.id);
    }
    engine.updateSimulatorCompletion();
    this.renderAlternativeControls();
    this.drawSim();
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

  drawThreeKingdomsDocument(ctx, w, h, stageId) {
    const labels = {
      '1-fail': ['황산벌 전투 기록', '관창과 반굴 · 합류 시한', '황산벌의 전투 상황을 다시 살펴봅니다'],
      '2': ['백제 유민과 신라의 통합', '웅진도독부 · 백제 부흥 운동', '유민 포용과 나당 전쟁의 관계를 살펴봅니다'],
      '2-fail': ['백제 유민 포용의 기록', '신라 관등 · 후방 안정', '통합 정책이 전쟁에 미친 영향을 살펴봅니다'],
      '3': ['나당 전쟁의 기록', '안동도호부 · 보덕국', '당의 지배 시도와 신라의 대응을 살펴봅니다'],
      '3-fail': ['당의 한반도 지배 시도', '도독부 · 고구려·백제 유민', '자료를 다시 연결해 대응을 생각합니다'],
      '4-fail': ['매소성 전투 기록', '병력 수 · 지형 · 보급', '기록의 수치와 전투 조건을 함께 살펴봅니다'],
      '5-fail': ['기벌포 해전 기록', '금강 하구 · 갯벌 · 조류', '신라 수군이 물길을 활용한 까닭을 살펴봅니다'],
      '6': ['발해 건국의 기록', '고구려 유민 · 말갈 · 동모산', '여러 집단의 이동과 발해 건국을 살펴봅니다'],
      '7-fail': ['천문령 전투 기록', '협곡 · 높은 지대 · 이동로', '전투와 발해 건국 과정을 다시 연결합니다'],
      '8': ['남북국 시대의 기록', '신라와 발해 · 고구려 계승', '발해 건국 이후의 역사를 살펴봅니다']
    }[stageId] || ['삼국 통일 전쟁 기록', '황산벌 · 매소성 · 기벌포', '역사 자료를 살펴봅니다'];

    ctx.fillStyle = '#263b4a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f5e7c8'; ctx.fillRect(w * 0.12, h * 0.12, w * 0.76, h * 0.7);
    ctx.strokeStyle = '#b08957'; ctx.lineWidth = 3; ctx.strokeRect(w * 0.12, h * 0.12, w * 0.76, h * 0.7);
    ctx.fillStyle = '#7c2d12'; ctx.font = 'bold 13px "Pretendard"'; ctx.textAlign = 'center'; ctx.fillText(`📜 ${labels[0]}`, w / 2, h * 0.33);
    ctx.fillStyle = '#92400e'; ctx.font = 'bold 11px "Pretendard"'; ctx.fillText(labels[1], w / 2, h * 0.52);
    ctx.fillStyle = '#57534e'; ctx.font = '10px "Pretendard"'; ctx.fillText(labels[2], w / 2, h * 0.68);
  },

  drawThreeKingdomsNaval(ctx, w, h) {
    const engine = window.MudEngine;
    const time = Date.now() * 0.003;
    ctx.fillStyle = '#0f3551'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#5aa4c7'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const y = 28 + i * 34;
      ctx.beginPath(); ctx.moveTo(w * 0.08, y);
      for (let x = w * 0.08; x <= w * 0.92; x += 14) ctx.lineTo(x, y + Math.sin(x * 0.05 + time) * 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#8b7355'; ctx.fillRect(0, 0, w * 0.12, h); ctx.fillRect(w * 0.88, 0, w * 0.12, h);
    ctx.fillStyle = '#fef3c7'; ctx.font = 'bold 10px "Pretendard"'; ctx.textAlign = 'center'; ctx.fillText('금강 하구 갯벌', w * 0.06, h * 0.18); ctx.fillText('당나라 수군', w * 0.94, h * 0.18);
    const playerX = engine.targetCurrent >= 80 ? w * 0.45 : w * 0.28;
    ctx.fillStyle = '#1d4ed8'; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.fillRect(playerX - 16, h / 2 - 12, 32, 24); ctx.strokeRect(playerX - 16, h / 2 - 12, 32, 24);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('신라 대장선', playerX, h / 2 + 4);
    engine.enemyShips.forEach(ship => {
      if (!ship.alive) return;
      ctx.fillStyle = '#7f1d1d'; ctx.strokeStyle = '#fca5a5'; ctx.strokeRect(ship.x - 8, ship.y - 8, ship.size, ship.size);
      ctx.fillStyle = '#fee2e2'; ctx.fillText('당군선', ship.x, ship.y + 4);
    });
    engine.bullets.forEach(b => {
      if (!b.active) return;
      b.x += b.vx; b.y += b.vy; ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill();
      engine.enemyShips.forEach(ship => {
        if (!ship.alive || Math.hypot(b.x - ship.x, b.y - ship.y) >= ship.size) return;
        ship.alive = false; b.active = false; engine.gaugeProgress = Math.min(100, engine.gaugeProgress + 25);
        const gp = document.getElementById('gauge-progress'); if (gp) gp.textContent = `${engine.gaugeProgress}%`;
        const gb = document.getElementById('gauge-bar'); if (gb) gb.style.width = `${engine.gaugeProgress}%`;
        engine.updateSimulatorCompletion();
      });
    });
    ctx.fillStyle = '#bfdbfe'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('🌊 금강의 조류를 읽고 당나라 수군을 맞혀 보세요', w / 2, h - 10);
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
        ctx.fillText(engine.currentMudData?.mudId === 'deep_three_kingdoms' ? "당군선" : "왜선", s.x, s.y + 4);
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
            engine.updateSimulatorCompletion();
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
      ctx.fillText(engine.currentMudData?.mudId === 'deep_three_kingdoms' ? "당나라 함대 4척" : "왜선 133척 대함대", w * 0.76, 20);
    }

    ctx.fillStyle = isCurrentReversed ? '#38bdf8' : '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    const isThreeKingdomsDeepDive = engine.currentMudData?.mudId === 'deep_three_kingdoms';
    const enemySide = isThreeKingdomsDeepDive ? '당군' : '왜군';
    ctx.fillText(isCurrentReversed ? `🌊 썰물 역전! ${enemySide} 쪽으로 총돌격! ➔➔` : `⬅️⬅️ 밀물 (${enemySide} 쪽에서 밀려오는 중)`, w/2, h - 8);
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
