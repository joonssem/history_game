// =========================================================
// js/sceneArt.js - 시뮬레이터 배경 SVG 장면 로더
// assets/scenes/<scene-id>.svg가 있으면 캔버스 배경으로 그린다. 없거나 로드 전이면 false를 돌려
// mudSimulators.js의 기존 캔버스 그림이 그대로 쓰인다.
// =========================================================
const SceneArt = {
  // 한지 채색화풍으로 교체된 장면. 목록에 없는 장면은 SVG를 요청하지 않는다.
  available: new Set([
    'angbuilgu-street',
    'chiljeongsan-observatory',
    'commoner-harvest',
    'donghak-yongdamjeong',
    'ganghwa-treaty-hall',
    'gyeongbokgung-naming',
    'hansando-hakikjin',
    'hanyang-commerce-summary',
    'hanyang-gates-pavement',
    'hanyang-site-selection',
    'hanyang-tram-street',
    'hongdaeyong-globe',
    'hopae-registration',
    'hunminjeongeum-lab',
    'hwaseong-geojunggi',
    'ianbeop-farming',
    'jejungwon-postal',
    'joseon-border',
    'joseon-diplomacy-exhibit',
    'joseon-folk-evidence',
    'joseon-founding-evidence',
    'joseon-namhansanseong',
    'joseon-postwar',
    'joseon-status-evidence',
    'jungin-medicine',
    'kim-hongdo-studio',
    'modern-open-evidence',
    'namhae-suguninmul',
    'pansori-performance',
    'sangpum-crops',
    'sangpyeongtongbo-market',
    'sejong-evidence',
    'silhak-summary',
    'talchum-dance'
  ]),
  images: {},

  load(scene) {
    if (!this.available.has(scene) || this.images[scene]) return;
    const entry = { img: new Image(), ready: false };
    this.images[scene] = entry;
    entry.img.onload = () => {
      entry.ready = true;
      if (window.MudSimulators && document.getElementById('mn-canvas')) window.MudSimulators.drawSim();
    };
    entry.img.onerror = () => { this.available.delete(scene); };
    entry.img.src = `assets/scenes/${scene}.svg`;
  },

  has(scene) {
    return !!(this.images[scene] && this.images[scene].ready);
  },

  draw(ctx, w, h, scene) {
    if (!this.available.has(scene)) return false;
    if (!this.has(scene)) { this.load(scene); return false; }
    ctx.drawImage(this.images[scene].img, 0, 0, w, h);
    return true;
  }
};
window.SceneArt = SceneArt;
