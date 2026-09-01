# PROJECT_CONTEXT.md

> **작성일**: 2026-09-01 | **버전**: v3.3 | **인수자**: OpenAI Codex
> **라이브 URL**: https://joonssem.github.io/history_game/

이 문서는 새 개발자가 프로젝트를 빠르게 파악하고 작업을 이어갈 수 있도록 작성한 인수인계 문서다.
코드로 확인할 수 없는 내용은 `확인 필요`로 표시했다.

---

## 1. 프로젝트 목적

### 무엇을 위한 것인가

초등학교 5학년 2학기 사회(역사) 교과서 48개 차시를 100% 커버하는
**인터랙티브 텍스트 MUD(Multi-User Dungeon) 교육 포털**이다.
단순 암기 대신, 학생이 역사적 결단의 순간에 직접 개입해 선택의 결과를 체험한다.

### 주요 사용자

- 초등학교 5~6학년 학생 (태블릿·스마트패드 환경)
- 초등학교 교사 (현재 범위에서는 대시보드·과제 제출 연동 제외)

### 핵심 사용 시나리오

1. 교사가 수업 중 해당 차시 MUD 버튼을 학생 기기에서 실행
2. 학생이 역사 인물의 시각에서 3지선다 결단을 선택
3. 정답 선택 → 다음 스테이지, 오답 → IF 스테이지(역사가 틀어지는 상황) → 재시도
4. MUD 완료 시 유물 도감 자동 언락, 성찰 일기 작성 후 클립보드 복사해 제출
5. 장기 확장: 선택 탐험으로 역사 단서를 발견하고, 유물을 다른 추론·공유 활동에 활용

### 최신 개발 기준선 — 교실 기반 반복 개선

이 프로젝트는 실제 수업을 핵심 테스트 환경으로 삼아 다음 순환으로 개선한다.

```text
기획 → 작은 구현 → 실제 수업 → 학생 행동·의견 관찰
→ 진단 데이터 확인 → 설계 가설 → 작은 수정 → 재수업
```

2026-09-01에는 1단원 2·3차시 연속 활동이 4분 이내 완료되었다. 빠른 완료의 원인은 선택지 표현 편향, 시뮬레이터 완료 조건, 읽기 속도, 교실 내 정보 공유로 나누어 확인하며, 학생의 유물 활용·친구 비교·역사 타이쿤 제안은 후속 실험 후보로 관리한다.

장기 플레이 루프는 `탐험 → 단서 발견 → 관찰·비교·추론 → 선택·결과 → 유물 획득 → 유물 활용·근거 공유 → 다음 탐험`으로 확장한다. 문제 수를 단순히 늘리지 않고 선택적 탐험과 역사 자료의 재사용으로 깊이를 늘리는 방향이다.

---

## 2. 기술 구조

### 사용 기술

- **순수 Vanilla JS (ES6+)** — 프레임워크 없음, 빌드 도구 없음
- **HTML5 Canvas** — 인터랙티브 시뮬레이터 렌더링
- **Web Audio API** — 브라우저 내장 효과음 (외부 파일 없음)
- **localStorage** — 개인별 진행상황 영구 저장
- **현재 배포**: GitHub Pages — 정적 파일 배포 (CI/CD 자동화)
- **목표 배포 경로**: Vercel — GitHub push 기반 자동 배포를 검토하되 현재 운영은 변경하지 않음
- **목표 데이터 확장**: Supabase — 초기 익명 플레이 로그부터 단계적으로 검토하며 아직 구현하지 않음
- **FontAwesome 6.4.0** (CDN), **Pretendard / SchoolSafetyNotification / MaruBuri** (웹폰트)

### 주요 파일과 폴더

```
history_game/
├── index.html                          # 진입점. 모든 뷰가 단일 HTML 안에 있음
├── css/
│   └── style.css                       # 전체 스타일 (CSS 변수 기반 테마 시스템)
├── js/
│   ├── app.js                          # 포털 메인: 커리큘럼 렌더링, 뷰 전환, 퀴즈 허브
│   ├── mudEngine.js                    # MUD 핵심 엔진: JSON 로드·스테이지 렌더링·회고록
│   ├── mudSimulators.js                # Canvas 인터랙티브 시뮬레이터 렌더러·이벤트
│   ├── encyclopedia.js                 # 유물 도감: localStorage 수집·배지·탐험가 레벨
│   ├── quizGame.js                     # 골든벨 퀴즈 엔진
│   ├── storyEngine.js                  # 타임머신 스토리 엔진
│   ├── miniGames.js                    # 유물 카드·역사 연표 미니게임
│   └── soundEffects.js                 # Web Audio API 효과음 (playClick/playFanfare/playWrong)
├── data/
│   ├── history_curriculum_48_lessons.json  # 48차시 커리큘럼 DB (단원·차시·색상·키개념)
│   ├── artifacts.json                  # 유물 도감 36종 DB (id, name, tier, desc 등)
│   ├── quizzes.json                    # 골든벨 퀴즈 문항 DB
│   └── mud/
│       ├── _index.json                 # 전체 MUD 메타데이터 인덱스 (32종 등록)
│       ├── regular_*.json (28개)       # 차시별 Regular MUD 시나리오
│       └── deep_*.json (4개)           # 대단원 Deep-dive MUD (30분+, 3대 멀티엔딩)
├── data/curriculum_mapping.json         # 기존 차시와 2022 개정 교육과정 매핑 기준선
├── simulator_contract.json              # 시뮬레이터 기계 계약
├── README.md                           # 프로젝트 소개
├── agents.md                           # AI 에이전트 협업 체계 및 작업 원칙
├── PRD.md                              # 제품 목표·범위·수용 기준
├── BACKLOG.md                          # 미완료 기획·검토 항목
├── INBOX.md                             # 사용자 입력·관찰 원문 단일 창구
├── EXPERIMENTS.md                       # 수업 실험·가설·결과
├── ROADMAP.md                           # 단계별 개발 방향
├── ARCHITECTURE.md                      # 현재 구조와 목표 확장
├── DECISIONS.md                        # 장기 설계 결정 기록
├── TECH_STACK.md                        # 기술 선택과 시스템 경계
├── USER_FLOWS.md                        # 사용자 흐름과 플로우차트
├── WIREFRAMES.md                         # 핵심 화면 와이어프레임
├── if_stage_audit.md                   # Regular 재시도(IF) 단계 구조 감사
├── artifact_audit.md                   # 유물·보상 카드 교육 품질 감사
├── choice_bias_audit.md                # 선택지 표현 편향 감사 결과
├── scripts/12_audit_choice_bias.py     # 선택지 길이·위치 편향 감사 스크립트
├── walkthrough.md                      # 완료 작업 누적 기록
└── project_context.md                  # 이 파일
```

### 각 파일의 역할

| 파일 | 역할 |
|---|---|
| `index.html` | 단일 페이지. `view-portal`(메인 포털)과 `view-myeongnyang`(MUD 뷰) 두 div를 display 전환으로 사용. 모달 2개(퀴즈, 도감)도 내부에 있음 |
| `js/app.js` | DOMContentLoaded 시 데이터 로드 및 초기화. `renderCurriculum(unitId)`가 핵심으로, `_index.json`을 우선 사용하고 레거시 조건문을 fallback으로 두어 MUD 버튼을 동적 생성 |
| `js/mudEngine.js` | `window.MudEngine` 전역 객체. `openMUD(mudId)`로 JSON fetch → 상태 초기화 → 뷰 전환 → 첫 스테이지 렌더링. `renderStage(stageId)`로 narrative·choices·simulator 렌더링 |
| `js/mudSimulators.js` | `window.MudSimulators` 전역 객체. Canvas `mousedown`/`touchstart` 이벤트를 `simMode` 분기로 처리. `drawSim()`이 rAF 루프에서 계속 호출됨 |
| `js/encyclopedia.js` | `window.encyclopedia`. localStorage 키 `history_explorer_save_v1`. `unlockArtifact(id)`와 `unlockBadge(id)` 호출로 수집 기록 |
| `js/quizGame.js` | `window.quizGame`. `data/quizzes.json` 로드 후 랜덤 셔플·타이머(15초)·채점 |
| `js/soundEffects.js` | `window.sounds`. Web Audio API로 생성한 비트 신스 효과음 |
| `data/mud/_index.json` | 32개 MUD의 메타 정보와 현재·목표 교육과정 상태. 등록용 `lessonNumbers`는 화면 표시 기준이며, `app.js`가 우선 사용하고 누락 시 레거시 조건문으로 보완함 |
| `INBOX.md` | 사용자가 아이디어·관찰·검토 내용을 기록하는 단일 입력 창구 |
| `PRD.md` / `BACKLOG.md` / `DECISIONS.md` | 각각 제품 요구사항, 미완료 검토 항목, 장기 설계 결정 |
| `EXPERIMENTS.md` / `ROADMAP.md` / `ARCHITECTURE.md` | 수업 실험, 구현 순서, 시스템 연결 구조 |
| `agents.md` | Codex CLI·Claude Code의 파일 소유권과 검토·병렬 작업 규칙 |

### 중요한 의존 관계

- **스크립트 로드 순서** (index.html): `soundEffects` → `encyclopedia` → `storyEngine` → `quizGame` → `miniGames` → `mudEngine` → `mudSimulators` → `app.js`
  - `mudSimulators.js`는 `window.MudEngine`을 직접 참조하므로 `mudEngine.js` 이후 로드 필수
  - `app.js`는 마지막에 로드되어 나머지 모듈이 전역에 등록된 상태를 전제함
- **뷰 전환**: `MudEngine.openMUD()` → `view-portal` hide + `view-myeongnyang` show. `showPortalView()` → 반대
- **유물 언락 흐름**: MUD 클리어 → `renderFinalReflection()` → `encyclopedia.unlockArtifact(r.name || r.artifactId)` 순서로 호출

---

## 3. 현재 구현된 기능

### 완료된 기능

- **Regular MUD 28종**: 10분 이내, 설계 목표 약 9분의 복습 활동으로 48개 차시 본문 학습 차시 100% 커버
- **Deep-dive MUD 4종**: Regular의 대체가 아닌 확장 탐구 활동. 선사/삼국/조선/근현대 각 대단원 통사 롤플레이와 3대 멀티엔딩(ending_true / ending_normal / ending_bad)
- **캔버스 인터랙티브 시뮬레이터**: 20종 모드 (고인돌 물리, 명량해전 포격, 태극기 컬러링, 사료 두루마리, 호국 게이지, 문화 파티클 등)
- **유물 도감 수집 시스템**: 국보·보물 36종, MUD·스토리 ID 연동, localStorage 영구 저장, 탐험가 레벨
- **골든벨 퀴즈**: `data/quizzes.json` 기반 단원별 랜덤 퀴즈, 15초 타이머, 점수 기록
- **확장 역사 활동**: 타임머신 스토리 3종, 유물 카드 게임, 역사 연표 게임
- **성찰 일기**: MUD 완료 후 textarea 작성 → 클립보드 복사 제출
- **용어 돋보기(Glossary)**: narrative 내 핵심 용어를 tooltip으로 자동 변환
- **시대별 컬러 테마**: MUD별 themeColor를 CSS 변수(`--current-mud-color`)로 동적 적용
- **Phase 38 근현대 장면**: 5종 MUD의 15개 고유 scene과 전체 97개 JSON↔JS scene 연결을 완료했다.
- **유물 아이콘·보상 토스트 정합성**: 불일치 아이콘 7종을 교체하고 MUD 완료 토스트에 유물명을 표시한다.
- **MUD 등록 primary/supplementary 분리**: 중복 차시의 기본 버튼은 primary 하나만 표시한다.
- **모달 키보드 접근성**: Tab 순환·Escape 닫기·원래 트리거 포커스 복귀를 지원한다.

### 부분적으로 구현된 기능

- **_index.json 활용**: Regular MUD는 인덱스 기반 매핑을 우선 사용하며, 기존 조건문은 인덱스 로드 실패 시 호환성을 위한 fallback으로 남아 있음. 2단원 7차시와 3단원 12차시는 primary/supplementary 계약으로 중복을 해결했다. 보조 MUD 별도 노출은 후속 검토 대상이다.
- **브라우저 회귀 점검**: 실제 화면·터치·접근성 확인 순서는 [`BROWSER_REGRESSION_CHECKLIST.md`](./BROWSER_REGRESSION_CHECKLIST.md)에 기록함

---

## 4. 주요 동작 흐름

### 기본 흐름: 포털 → MUD 플레이

```
페이지 로드
└─ DOMContentLoaded (app.js)
   ├─ encyclopedia.initArtifacts()       → data/artifacts.json fetch
   ├─ storyEngine.loadStories()          → 확장 활동의 스토리 목록 렌더링
   ├─ quizGame.loadQuizzes()             → data/quizzes.json fetch
   ├─ miniGames.init()                   → 카드·연표 미니게임 데이터 로드
   └─ loadCurriculum()                   → data/history_curriculum_48_lessons.json fetch
      └─ switchUnitTab(1)
         └─ renderCurriculum(1)          → 차시 카드 + MUD 버튼 동적 생성

학생이 MUD 버튼 클릭
└─ MudEngine.openMUD('regular_balhae')
   ├─ fetch('data/mud/regular_balhae.json')
   ├─ 상태 초기화 (visited, gaugeProgress 등)
   ├─ setTheme(themeColor)
   ├─ view-portal hide / view-myeongnyang show
   ├─ renderRoadmap()                    → 우측 연대기 노드 생성
   ├─ resizeCanvas()                     → DPR 보정 캔버스 크기 조정
   ├─ renderStage("1")                   → 첫 스테이지 렌더링
   └─ startAnimLoop()                    → rAF로 drawSim() 반복 호출

renderStage(stageId)
├─ stage.badge, location 갱신
├─ setupSimulator(stage.simulator)       → simMode 설정 + 위젯(gauge/info/slider) 표시
├─ 캐릭터 카드 표시
├─ narrative + glossary → innerHTML
└─ choices 버튼 생성
   ├─ ch.next === "end" 또는 "ending_*" → renderFinalReflection()
   └─ 그 외                             → renderStage(ch.next)

renderFinalReflection()
├─ sounds.playFanfare()
├─ encyclopedia.unlockArtifact()         → localStorage 저장
└─ 성찰 일기 UI 표시 (textarea + 복사 버튼)
```

### 골든벨 퀴즈 흐름

```
openQuizHub(unitId) → view-quiz-modal display:flex
└─ startUnitQuiz()
   └─ quizGame.startQuizGame(unitId)
      ├─ data/quizzes.json 단원 필터링
      ├─ 랜덤 셔플
      ├─ 15초 타이머
      └─ 점수·최고점 저장
```

---

## 5. 중요한 설계 결정

### 단일 HTML, 뷰 전환 방식

모든 뷰(`view-portal`, `view-myeongnyang`, 모달 2개)가 하나의 `index.html`에 존재한다.
뷰 전환은 `display: none / block` 토글로 처리한다.
라우터나 SPA 프레임워크를 쓰지 않아 GitHub Pages와 향후 Vercel 같은 정적 배포 환경에 모두 적용할 수 있다.

### MUD 데이터 분리 (JSON 기반)

초기엔 JS 함수 내에 MUD 데이터가 하드코딩되어 있었으나, 유지보수 불가 수준이 되어
`data/mud/` 디렉토리의 JSON 파일로 완전 분리했다(Phase 1 리팩토링).
이로 인해 MUD 콘텐츠 수정이 JSON 파일 편집만으로 가능하다.

### app.js 버튼 매핑 방식

Regular MUD는 `_index.json`의 `unitId`와 `lessonNumbers`를 기준으로
각 차시에 `MudEngine.openMUD('mudId')` 버튼을 생성한다.
기존 제목 키워드 조건문은 인덱스에 없는 레거시·특수 버튼을 위한 fallback으로 유지한다.
새 Regular MUD를 추가할 때는 JSON 파일과 `_index.json` 메타데이터를 함께 갱신해야 한다.

### 시뮬레이터 모드 분기

`mudEngine.js`의 `simMode`를 `mudSimulators.js`의 `drawSim()`과 `handleCanvasTouch()`가
공유하며 분기 처리한다. 새 시뮬레이터 모드를 추가하려면 두 함수 모두 수정 필요.

### 범용 시뮬레이터 3종

역사별 맞춤 렌더러를 만들기 어려운 MUD에 적용하는 범용 모드:
- `text-reading`: 사료 두루마리 (터치 → 게이지 상승)
- `battle-gauge`: 호국 결전 게이지 (터치 → 게이지 상승)
- `culture-touch`: 문화 파티클 (터치 → 게이지 상승)

이 세 모드는 모두 `handleCanvasTouch`에서 동일한 로직(`gaugeProgress += 25`)으로 처리된다.

---

## 6. 현재 알려진 문제

### 버그

#### 선택지 `next` 필드 누락 (해결)
- 15개 Regular MUD의 95개 누락 필드를 보완함
- 정답은 다음 본 스테이지, 오답은 같은 번호의 IF 재시도 스테이지로 연결함
- `scripts/02_fix_missing_next.py`로 재현 가능한 일괄 수정 가능
- `scripts/03_validate_mud_integrity.py`에서 누락·dangling·unreachable 경로를 검사함

#### 보상 ID·유물 DB 불일치 (해결)
- 중복 사용되던 보상 ID에 고유 ID를 부여하고 유물 카드 36종으로 정리함
- MUD 보상 ID와 보상명이 `artifacts.json`의 카드 ID·이름과 일치함
- Deep-dive와 스토리 보상도 ID 기반으로 도감에 연결함

#### 1단원 3차시 신석기 MUD 문맥 불일치 (해결)
- `regular_neolithic` 2단계의 토기 활동과 3단계의 의생활 활동에 맞게 정상·IF narrative 네 개를 정렬함
- 선택지·시뮬레이터·단계 전환·보상 구조는 변경하지 않음
- JSON·MUD 계약·출처·시뮬레이터 런타임 검증을 통과함

#### 광복 MUD 2단계 문맥 불일치 (해결)
- `regular_gwangbok` 2단계의 건국준비위원회 활동과 맞지 않던 총선거 narrative를 광복 직후 치안·건국 준비 문맥으로 수정함
- 2-1 IF도 치안 공백의 자료 해석으로 정렬하고, 2단계 선택지 길이를 균형화함
- Chrome에서 1단계 정상 진행 후 2단계 진입과 콘솔 오류·경고 0건을 확인함

#### 선택지 버튼 외형이 모두 동일함 (UX 문제)
- **증상**: 모든 choice 버튼이 동일하게 "결단 ➔" 뱃지로 표시되어 정답/오답을 구분할 수 없음
- **현재 동작**: 의도된 것으로 추정 (역사 탐구의 비결정적 경험)
- **개선 필요 여부**: 확인 필요

### 미완성 기능

- **MUD 콘텐츠 품질 확장**: 일부 자동 생성 IF 스테이지와 유물 설명은 추가 교육적 검수가 필요함. IF 구조 선별 결과는 `if_stage_audit.md`에서 확인함
- **실제 활동 시간 검증**: 2026-09-01 학생들이 1단원 2·3차시 Regular 활동을 연속으로 4분 이내에 완료했다. 빠른 학습자용 선택형 확장 활동과 전체 학생 표본 측정은 후속 검토 대상이다.
- **최소 플레이 진단 로그**: 아직 구현하지 않았다. 서버·계정 없이 단계·선택·시뮬레이터·완료 시각과 재시도 정도만 기록하는 설계가 다음 P1 후보이며, 학생 식별 정보는 수집하지 않는다.

### 임시 구현

- 오답 선택지의 IF 스테이지: 일부 MUD는 IF 스테이지(`1-1`, `2-1` 등)가 잘 구성되어 있으나, 자동 생성된 일부는 "올바른 결단으로 다시 시도한다" 단일 선택지만 있는 최소 구현 상태

### 기술 부채

- `app.js`의 `renderCurriculum()` 내 MUD 버튼 조건문이 140줄 이상의 if-else 체인으로 구성됨. 새 MUD 추가 시 이 체인에 계속 붙여야 하므로 유지보수 어려움. 등록 단일화 계획은 [`implementation_plan_registration_single_source.md`](./implementation_plan_registration_single_source.md)에서 관리함
- `_index.json` 차시 중복 감사: 2단원 7차시는 `regular_myeongnyang`/`regular_joseon_diplomacy`, 3단원 12차시는 `regular_korean_war`/`regular_post_war`가 동시에 일치하여 배열 순서 의존성이 있음
- `mudSimulators.js`의 `drawSim()`도 유사하게 simMode 분기가 많아 300줄 이상

---

## 7. 다음 작업 후보

### 우선순위 높음 (기능 정상화)

1. **선택지 버튼 차별화 (UX 개선)**
   - 사용자 요청: "오른쪽 화살표의 내용과 모양이 같은 것이 너무 많음"
   - 아이콘, 색상 또는 힌트 텍스트로 선택지 유형 구분 방안 검토

### 우선순위 보통

2. **IF 스테이지 콘텐츠 보강**
   - 자동 생성된 최소 구현 IF 스테이지에 실제 역사적 설명 추가

### 우선순위 낮음 (추후 확장)

3. **유물·보상 콘텐츠 품질 검수**: 카드 설명의 교육과정 표현과 역사적 세부 사실 추가 검수

---

### 최신 단기 로드맵

- **NOW**: 콘텐츠 정합성·선택지 편향 QA, 최소 플레이 진단 로그 설계
- **NEXT**: 해금 유물 2개 기반 관찰·비교·주장·근거 추론 활동
- **LATER**: 유물 탐구 확대, 익명 활동 결과·학급 집계, 친구 비교·협력, 필요 시 Anonymous Auth
- **FUTURE / NOT NOW**: Realtime·학급 공동 이벤트·역사 타이쿤 장기 상태·공개 온라인 순위표

## 8. 실행 및 테스트 방법

### 로컬 실행

```bash
# Python 내장 서버 (권장)
python -m http.server 8000
# 브라우저에서 http://localhost:8000 접속

# 또는 Node.js
npx serve .
```

> **주의**: `fetch()`를 사용하므로 파일을 직접 열면(`file://`) CORS 오류 발생.
> 반드시 로컬 서버를 통해 접근해야 한다.

### 주요 기능 확인 체크리스트

- [ ] 포털 메인 로드 → 3개 단원 탭 전환 정상 동작
- [ ] 각 단원에서 MUD 버튼 클릭 → MUD 뷰 전환 및 첫 스테이지 렌더링
- [ ] 선택지 클릭 → 다음 스테이지 이동 (next 필드 있는 MUD만 정상)
- [ ] MUD 완료 → 유물 도감 언락 및 성찰 일기 UI 표시
- [ ] 골든벨 Quiz 버튼 → 퀴즈 모달 오픈 및 타이머 동작
- [ ] 나의 도감 버튼 → 도감 모달 오픈 및 수집률 표시
- [ ] 페이지 새로고침 후 도감 수집 상태 유지 (localStorage)

### JSON 무결성 검증

```bash
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/06_validate_static_assets.py
python scripts/08_validate_mud_catalog.py
python scripts/09_validate_mud_sources.py
python scripts/10_audit_if_stages.py
python scripts/11_audit_artifacts.py
node scripts/05_test_simulator_runtime.js
```

### JS 문법 검사

```bash
node -c js/app.js
node -c js/mudEngine.js
node -c js/mudSimulators.js
```

---

## 9. 주의 사항

### 깨뜨리기 쉬운 부분

**1. 스크립트 로드 순서 (index.html)**
`mudSimulators.js`가 `window.MudEngine`을 직접 참조한다.
`mudEngine.js`보다 먼저 로드되면 `window.MudEngine`이 undefined라 `init()` 실패.
순서: `mudEngine.js` → `mudSimulators.js` → `app.js` 반드시 유지.

**2. MUD 추가 시 `_index.json`을 함께 수정**
Regular MUD는 `_index.json`의 primary 등록을 기준으로 포털 버튼이 생성된다.
인덱스 로드 실패 시에만 기존 `app.js` 조건문 fallback이 사용된다.

**3. MUD JSON 스키마 필수 필드**
`stages` 객체의 키는 문자열 숫자여야 한다(`"1"`, `"2"`, `"1-1"` 등).
`choices` 배열의 각 항목에 `next` 필드가 없으면 클릭 시 이동 불가.
`simulator.type`이 `gauge`여야 `widget-gauge`가 표시된다.

**4. Canvas DPR 보정**
`resizeCanvas()`가 `devicePixelRatio`로 캔버스를 확대한다.
시뮬레이터 드로잉 코드에서 좌표 계산 시 `canvas.width / window.devicePixelRatio`로
실제 CSS 픽셀 단위로 변환해야 올바르게 렌더링된다.

**5. localStorage 키 변경 금지**
`encyclopedia.js`의 `storageKey = 'history_explorer_save_v1'`를 바꾸면
기존 사용자의 수집 데이터가 전부 초기화된다.

**6. 뷰 ID 변경 금지**
`view-portal`, `view-myeongnyang`은 `app.js`의 `showPortalView()`와
`mudEngine.js`의 `openMUD()`에서 직접 getElementById로 참조한다.
이 ID를 바꾸면 뷰 전환이 전부 망가진다.

**7. 캔버스 애니메이션 루프**
`startAnimLoop()`은 `view-myeongnyang`이 visible인 동안 계속 rAF를 돌린다.
`showPortalView()`로 뷰가 숨겨지면 루프가 자동 중단된다.
새 MUD를 열 때 `openMUD()`에서 `startAnimLoop()`가 다시 호출되므로
중복 루프에 주의 (현재 `cancelAnimationFrame(this.animFrameId)`로 보호되어 있음).
