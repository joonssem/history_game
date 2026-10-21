// =========================================================
// js/sceneArt.js - 시뮬레이터 배경 SVG 장면 로더
// assets/scenes/<scene-id>.svg가 있으면 캔버스 배경으로 그린다. 없거나 로드 전이면 false를 돌려
// mudSimulators.js의 기존 캔버스 그림이 그대로 쓰인다.
// =========================================================
const SceneArt = {
  // 한지 채색화풍으로 교체된 장면. 목록에 없는 장면은 SVG를 요청하지 않는다.
  available: new Set([
    'angbuilgu-street',
    'aunae-market-rally',
    'balhae-document',
    'balhae-dongmosan',
    'balhae-evidence',
    'balhae-heritage',
    'bronze-dolmen-transport',
    'bronze-village',
    'busan-shanty-rebuild',
    'chiljeongsan-observatory',
    'colonial-1910s-evidence',
    'colonial-1930s-evidence',
    'commoner-harvest',
    'dmz-reunion-peace',
    'donghak-yongdamjeong',
    'ganghwa-treaty-hall',
    'gaya-ironware',
    'gendarme-rule-ordinance',
    'goguryeo-mural-costume',
    'gojoseon-artifacts',
    'gojoseon-bronze-culture',
    'gojoseon-law',
    'gojoseon-map',
    'gojoseon-summary',
    'goryeo-balhae-refuge',
    'goryeo-buseoksa',
    'goryeo-byeokrando',
    'goryeo-culture-evidence',
    'goryeo-founding-summary',
    'goryeo-gwiju',
    'goryeo-heunghwajin',
    'goryeo-hunyo',
    'goryeo-inheritance-trial',
    'goryeo-metal-type',
    'goryeo-seohui-negotiation',
    'goryeo-society-summary',
    'goryeo-tripitaka-carving',
    'goryeo-unification-map',
    'goryeo-war-evidence',
    'gwangbok-ballot-booth',
    'gwangbok-committee-office',
    'gwangbok-radio-announcement',
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
    'imperial-subject-policy',
    'independence-evidence',
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
    'korean-language-society',
    'korean-war-armistice',
    'korean-war-exhibit',
    'korean-war-front',
    'korean-war-outbreak',
    'land-survey-office',
    'memorial-candlelight',
    'modern-open-evidence',
    'namhae-suguninmul',
    'neolithic-pottery',
    'neolithic-summary',
    'neolithic-village',
    'neolithic-weaving',
    'paleo-community',
    'paleo-environment',
    'paleo-fire',
    'paleo-hunt',
    'paleo-reflection',
    'paleo-stone',
    'pansori-performance',
    'post-war-evidence',
    'righteous-army-background',
    'righteous-army-exhibit',
    'righteous-army-flag',
    'righteous-army-trial',
    'sangpum-crops',
    'sangpyeongtongbo-market',
    'secret-society-oath',
    'sejong-evidence',
    'shanghai-provisional-government',
    'silhak-summary',
    'talchum-dance',
    'tapgol-declaration',
    'tent-classroom',
    'three-kingdoms-baekje',
    'three-kingdoms-goguryeo',
    'three-kingdoms-life-summary',
    'three-kingdoms-silla',
    'three-kingdoms-summary',
    'unified-silla-bulguksa',
    'unified-silla-government',
    'unified-silla-seokguram',
    'unified-silla-summary'
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

  // 그림이 있는 장면이면 로드 중에도 true. 옛 캔버스 그림이 잠깐 비치지 않게 한다.
  expects(scene) {
    return this.active(scene);
  },

  // 장면 그림은 정규 MUD 핫스팟 배치에 맞춰 그렸다. 같은 장면 키를 다른 배치로 쓰는 deep MUD에는 쓰지 않는다.
  active(scene) {
    const mud = window.MudEngine && window.MudEngine.currentMudData;
    return this.available.has(scene) && !!mud && mud.tier === 'regular';
  },

  preloadAll() {
    [...this.available].forEach((scene) => this.load(scene));
  },

  draw(ctx, w, h, scene) {
    if (!this.active(scene)) return false;
    if (!this.has(scene)) {
      this.load(scene);
      ctx.fillStyle = '#efe5c9'; ctx.fillRect(0, 0, w, h);
      return true;
    }
    ctx.drawImage(this.images[scene].img, 0, 0, w, h);
    return true;
  }
};
window.SceneArt = SceneArt;
SceneArt.preloadAll();
