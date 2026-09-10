# 트랙 1-B 지시서 — 「조작대」

- 창 이름: **조작대** (slug `inquiry-console`)
- 한 줄 정의: 학생의 손이 실제로 닿는 `inquiry-task` 화면을 **시험지에서 탐구 화면으로** 바꾼다.
- 작성: Opus 5 기획 세션 (2026-09-10)
- 기준 커밋: `origin/main` + 본 지시서가 포함된 커밋
- 담당 모델: Sonnet 5
- 권장 브랜치: `feat/inquiry-ui-console`
- 권장 worktree: `.worktrees/claude-inquiry-console`

「관문 설계실」이 *무엇을 생각하게 할지*를 설계한다면, 이 창은 *그 생각이 손끝에서 어떻게 일어나는지*를 만든다. 두 창은 파일이 완전히 분리되어 있다.

## 0. 이 창이 만지는 파일 (소유권)

**소유(단독 수정 가능)**
- `js/mudInquiry.js`
- `js/mudEngine.js`, `js/mudSimulators.js`
- `index.html`의 `#view-myeongnyang` 블록 내부 (111번 줄부터)
- `index.html` 271~273번 줄 캐시버스터 (`mudEngine` / `mudInquiry` / `mudSimulators`)

**조건부**
- `css/style.css` — `.inquiry-*` 계열만 수정한다. 다른 선택자는 **추가만** 하고 기존 규칙을 고치지 않는다. 이 파일은 세 창이 공유한다.

**읽기만 (수정 금지)**
- `data/mud/*.json` — **관문 설계실 소유.** 데이터 스키마를 바꾸지 않는다.
- `index.html`의 「확장 역사 활동」 `<section>`(69~104번 줄) — **연결 공방 소유**
- `js/miniGames.js`, `js/artifactComparison.js`, `js/encyclopedia.js`

## 1. 왜 이 트랙이 급한가

현재 `inquiry-task`는 고려 문화 1편(4관문)에만 적용되어 있다. 관문 설계실이 3편을 더 전환하면 **같은 화면 위에 7편이 올라간다.** UI 결함을 먼저 고치지 않으면 나중에 7편을 다시 손대야 한다.

Opus 세션이 운영 사이트와 로컬에서 4관문을 끝까지 플레이해 아래 결함을 실측했다.

## 2. 확인된 결함 (실측, 우선순위 순)

### [P0] 진행도 게이지가 0%에 고정된다 — 명확한 버그

관문을 넘어가도 상단 "진행도: 0%"가 그대로다.

원인: `js/mudSimulators.js:93`에서 `interaction === 'inquiry-task'`가 조기 분기해, 게이지를 갱신하는 코드(`js/mudSimulators.js:118-124` 등)에 도달하지 않는다. `#gauge-progress`와 `#gauge-bar`(`index.html:183`, `:186`)는 여전히 화면에 남아 있으므로, **학생에게는 "아무 진전이 없다"로 읽힌다.**

두 가지 선택지가 있다. 판단하고 이유를 기록한다.
- (a) `validated-state` 완료 시 게이지를 갱신한다 — 관문 통과가 곧 진행이므로 자연스럽다
- (b) inquiry-task에서는 게이지 UI 자체를 숨긴다 — 근거 누적이 이미 진행 표시 역할을 한다

### [P0] 클릭 한 번마다 패널 전체가 다시 그려진다

`js/mudInquiry.js:94`의 `panel.replaceChildren()`가 매 상태 변화마다 DOM을 통째로 버리고 새로 만든다.

결과:
- **포커스가 매번 사라진다.** 키보드 사용자는 선택 하나 할 때마다 Tab을 처음부터 눌러야 한다.
- 순서 카드의 ↑↓를 **연속으로 누를 수 없다.** 한 번 누르면 포커스가 날아가서 다시 찾아야 한다. `sequence` 관문에서 카드를 정렬하려면 이 버튼을 여러 번 눌러야 하는데, 지금은 매번 마우스로 다시 조준해야 한다.
- 스크린리더 사용자에게 특히 나쁘다.

부분 갱신으로 바꾸거나, 재렌더 후 **직전에 조작한 요소로 포커스를 복원**한다. 후자가 변경 범위가 작다.

### [P1] 아이패드 가로에서 제출 버튼이 보이지 않는다

섹션 1/2/3이 세로로 모두 펼쳐지고 "판단 확인" 버튼이 맨 아래에 있다. 1180×820에서는 1번 섹션만 보이고 제출 버튼이 화면 밖이다.

같은 문제가 이 프로젝트에서 반복해서 나왔다 — `76f7cde`, `2108f0f`가 확장 활동 영역에서 같은 증상을 고쳤고 `b18d658`로 main에 들어와 있다. 그쪽 해법(`.activity-toggle` 탭 전환, 가로 배치 — `index.html:77`, `css/style.css:585`)을 참고하되, 이 트랙은 탐구 화면에 맞는 방식을 쓴다. 제출 버튼 하단 고정(sticky)이 가장 작은 변경이다.

### [P1] 근거 인벤토리가 텍스트 한 줄뿐이다

`js/mudInquiry.js:99`가 "이번 탐구에서 모은 근거 4장"이라고만 표시한다. **무엇을 모았는지 볼 수 없다.** 마지막 관문에서 그 근거들로 주장을 세워야 하는데, 학생은 앞 관문에서 무엇을 얻었는지 기억에 의존해야 한다.

이 활동의 핵심 가설이 "앞에서 모은 자료를 뒤에서 다시 쓴다"이므로, **모은 근거가 항상 보이는 것**이 설계상 중요하다.

### [P2] Canvas와 DOM 버튼이 이중화되어 지도가 장식이 됐다

`map-evidence`(3관문)는 `simulator.hotspots`에 지도 좌표가 정의되어 있고 Canvas에 그려진다. 그런데 실제 선택은 DOM 버튼으로도 완전히 가능하다. 그 결과 **지도를 보지 않아도 관문을 통과한다.** 공간 추론을 묻는 문법인데 공간이 선택 사항이 됐다.

모바일 대체 조작은 접근성상 반드시 필요하므로 DOM 버튼을 없애면 안 된다. Canvas와 DOM이 같은 상태를 공유하되 **지도가 정보를 실제로 전달하도록** 역할을 정리한다.

### [P2] 섹션 3개가 한 번에 노출되어 답을 역산할 수 있다

`commit-revise`에서 3번(최종 판단) 선택지는 자료를 다 열기 전까지 `disabled`지만 **텍스트는 처음부터 보인다.** 학생은 1번을 고르기 전에 3번의 정답 후보를 읽을 수 있다. 세로가 길어지는 원인이기도 하다.

단계 진행형으로 바꾸는 안을 검토한다. **다만 이는 상호작용 모델 변경이므로 §5의 절차를 따른다.**

## 3. 반드시 보존할 것 (이미 잘 되어 있다)

아래는 Codex가 red team으로 구현한 부분 중 **검증된 강점**이다. 리팩터링 과정에서 깨뜨리지 않는다. 각 항목은 완료 판정에서 다시 확인한다.

1. **3단 잠금** — `commit-revise`의 최종 판단 선택지는 `requiredEvidenceIds`를 **모두** 열기 전까지 `disabled`다. 1개만 열면 여전히 잠긴다. 자료를 읽지 않고 정답을 찍는 경로가 DOM 레벨에서 막혀 있다.
2. **접근성 속성** — `aria-pressed`, `role="group"`, `role="status"`, `aria-live="polite"`가 이미 쓰이고 있다.
3. **오답 시 포커스 이동** — `setFeedback(message, { focus: true })`(`js/mudInquiry.js:323`, `:455-457`)가 피드백으로 포커스를 옮긴다.
4. **반복 오답 힌트** — `repeatHint()`가 정답을 노출하지 않고 질문 형태로 안내한다.
5. **완료 후 전체 잠금** — 정답 제출 시 패널의 모든 버튼이 `disabled`가 되고 다음 버튼만 열린다.
6. **셔플** — `shuffleForTask()`는 섞은 결과가 우연히 정답 순서가 되면 한 칸 회전시킨다.
7. **실패 후 상태 보존** — 오답을 제출해도 이미 고른 선택이 유지된다.

## 4. 하지 말 것

- **`data/mud/*.json` 수정.** 관문 설계실 소유다. 데이터 구조가 부족하면 고치지 말고 보고한다.
- **판정 로직(`evaluate*` 함수군) 변경.** 2026-09-10에 `evaluateClaimEvidence`에서 "절대 실패할 수 없는 조건" 결함을 고쳤다(`DECISIONS.md` D-027). UI 작업이 판정을 건드릴 이유는 없다. 부득이하면 회귀 테스트를 먼저 적고 시작한다.
- 점수·타이머·콤보·경쟁 요소 추가. 수업 관찰 증거가 없다.
- `css/style.css`의 기존 선택자 수정. `.inquiry-*` 외에는 추가만.
- 인라인 스타일 전면 리팩터링. `index.html`의 MUD 뷰에 인라인 `style`이 많지만 이번 범위가 아니다.
- 접근성 속성 제거. 특히 `role="status"` / `aria-live`는 오답 피드백 전달 수단이다.

## 5. 상호작용 모델을 바꾸는 변경의 절차

P2 두 항목(Canvas 역할 정리, 단계 진행형 전환)은 학생이 겪는 흐름 자체를 바꾼다. 관문 설계실이 만드는 3편의 전제가 흔들릴 수 있다.

1. `docs/plans/`에 변경안을 문서로 먼저 쓴다. 무엇이 어떻게 달라지는지, 기존 4관문이 어떻게 동작하게 되는지 포함한다.
2. **사용자 확인을 받는다.**
3. 확인 후 구현한다.

P0·P1은 명백한 결함이므로 이 절차 없이 진행한다.

## 6. 작업 순서

한 항목씩 완료하고 검증한 뒤 다음으로 넘어간다. 여러 항목을 한 커밋에 섞지 않는다.

1. **P0** 진행도 게이지 (가장 작고 명확)
2. **P0** 재렌더/포커스 소실
3. **P1** 제출 버튼 하단 고정 + 아이패드 가로 레이아웃
4. **P1** 근거 인벤토리 가시화
5. **P2** Canvas 역할 정리 — §5 절차
6. **P2** 단계 진행형 전환 — §5 절차

## 7. 완료 판정

각 항목마다 아래를 모두 만족해야 완료다.

- 자동 검증(§8)이 전부 통과한다.
- **로컬 정적 서버에서 `regular_goryeo_culture` 4관문을 직접 끝까지 플레이**한다. 스크립트로 `.click()`만 호출하지 말고 실제 마우스·키보드 조작으로도 확인한다.
- §3의 보존 항목 7개를 **매번 다시 확인한다.** 특히:
  - 자료 1개만 열었을 때 최종 판단이 여전히 잠기는가
  - 오답 제출 시 다음 버튼이 `disabled`로 유지되는가
  - 마지막 관문에서 주장과 무관한 근거 조합이 여전히 차단되는가 (D-027 회귀)
  - 완료 후 패널 전체가 `disabled`가 되는가
- **키보드만으로** 4관문을 통과할 수 있다. Tab 순서가 논리적이고, 포커스 링이 보이며, 순서 카드 ↑↓를 연속으로 누를 수 있다.
- **아이패드 가로(1180×820)와 세로(820×1180)** 뷰포트에서 제출 버튼이 항상 보인다.
- 콘솔 `error`/`warning` 0건.
- 결과를 `BACKLOG.md`에 기록한다. 상호작용 모델 변경은 `DECISIONS.md`에 이유를 남긴다.

## 8. 검증 명령

```bash
node --check js/mudEngine.js
node --check js/mudInquiry.js
node --check js/mudSimulators.js
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
python scripts/06_validate_static_assets.py
python scripts/09_audit_tap_resistance.py
git diff --check
```

## 9. 시작 명령

```bash
git worktree add .worktrees/claude-inquiry-console -b feat/inquiry-ui-console origin/main
cd .worktrees/claude-inquiry-console
cat docs/handoff/claude_track1b_inquiry_console_instruction.md
cat js/mudInquiry.js
sed -n '85,130p' js/mudSimulators.js
sed -n '160,190p' index.html
sed -n '295,430p' css/style.css
```

이 문서와 `BACKLOG.md`, `DECISIONS.md`, `project_context.md`가 충돌하면 덮어쓰지 말고 충돌 지점을 먼저 보고한다.
