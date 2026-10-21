import re
p='js/sceneArt.js'
s=open(p,encoding='utf-8').read()
s=s.replace("""  has(scene) {
    return !!(this.images[scene] && this.images[scene].ready);
  },
""","""  has(scene) {
    return !!(this.images[scene] && this.images[scene].ready);
  },

  // 그림이 있는 장면이면 로드 중에도 true. 옛 캔버스 그림이 잠깐 비치지 않게 한다.
  expects(scene) {
    return this.available.has(scene);
  },

  preloadAll() {
    [...this.available].forEach((scene) => this.load(scene));
  },
""")
s=s.replace("""    if (!this.has(scene)) { this.load(scene); return false; }
""","""    if (!this.has(scene)) {
      this.load(scene);
      ctx.fillStyle = '#efe5c9'; ctx.fillRect(0, 0, w, h);
      return true;
    }
""")
s=s.replace("window.SceneArt = SceneArt;","""window.SceneArt = SceneArt;
SceneArt.preloadAll();""")
open(p,'w',encoding='utf-8').write(s)
p='js/mudSimulators.js'
s=open(p,encoding='utf-8').read()
s=s.replace("if (window.SceneArt && window.SceneArt.has(scene)) {\n        // 그림 장면","if (window.SceneArt && window.SceneArt.expects(scene)) {\n        // 그림 장면")
open(p,'w',encoding='utf-8').write(s)
