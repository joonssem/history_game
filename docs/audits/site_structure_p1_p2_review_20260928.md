# 웹사이트 구성 P1·P2 JS 읽기 전용 검토 (2026-09-28)

`TASK-20260928-CODEX-SITE-STRUCTURE-P1-P2-REVIEW | 496835b3·3aa7571c JS 읽기 전용 검토 | audit agent(Codex) | 상태: DONE`

## 결론

- 판정: **조건부 수용**. 요청한 주요 경로를 막는 회귀는 찾지 못했다.
- 코드·데이터는 수정하지 않았다.
- 보완 권고는 3건이다.
  1. 첫 포털 렌더의 28편 JSON 중복 요청 가능성
  2. 유효한 JSON이지만 필드 형식이 깨진 저장 데이터의 정규화 부족
  3. 비교/스토리/미니게임 `tablist`의 ARIA 탭 키보드 계약 미구현
- 연대기 분기 판별은 현재 28편 데이터에는 맞지만 ID 문자열 규칙을 런타임에서 암묵적으로 추론하므로 검증 계약으로 고정하는 편이 안전하다.

## 1. `MudEngine.syncMudLayout`

판정: **수용**.

- 좁은 화면에서 `#mn-interactive-card`를 왼쪽 카드의 `#mn-choice-area` 바로 앞으로 옮긴다. DOM 노드를 복제하거나 `innerHTML`로 다시 만들지 않으므로 캔버스의 `mousedown`·`touchstart` 리스너와 `MudInquiry`가 만든 버튼 리스너가 유지된다.
- 캔버스 입력은 `clientX/clientY - getBoundingClientRect()`로 매번 좌표를 다시 구한다. 이동 직후 `resizeCanvas()`가 CSS 크기와 내부 비트맵 크기, device-pixel-ratio transform을 다시 맞추므로 기존 절대 좌표를 재사용하는 부작용은 없다.
- `setupSimulator()`가 먼저 기존 `MudInquiry`를 unmount하고 새 단계의 inquiry를 mount한다. 카드의 부모가 바뀌어도 `#mn-inquiry-panel` 자체는 그대로 있어 탐구형 관문의 상태 전환과 충돌하지 않는다.
- `layoutResizeHandler`가 없을 때만 등록하므로 `openMUD()`를 반복해도 resize 리스너는 한 번만 생긴다. 150ms debounce도 기존 timer를 지운다.
- 넓은 화면 복귀 시 같은 카드 노드를 `#mn-aside` 맨 앞으로 돌려놓는다.

남은 비차단 권고:

- 현재 판별은 계산된 `gridTemplateColumns`의 공백 분리 결과에 의존한다. 현재 Edge/Chromium에서는 실제 track 폭(`NNNpx`)으로 계산돼 맞지만, 장기적으로는 CSS media query와 같은 `matchMedia('(max-width: ...)')` 또는 카드 위치를 기준으로 한 테스트를 두면 브라우저 차이를 줄일 수 있다.
- resize 리스너의 단일 등록과 `inquiry-task` mount 후 2열↔1열 왕복을 자동 회귀 예시로 남길 가치가 있다.

## 2. `ArtifactComparisonEngine.prepareStandaloneView`

판정: **수용**.

- 포털과 도감 경로는 모두 `startFromEncyclopedia()`를 거쳐 `prepareStandaloneView()` 후 `start()`를 호출한다.
- 완료 화면 제안은 이미 MUD 화면 안에 있으므로 기존 `start()`를 직접 호출한다. 이 경로는 standalone용 헤더 변경을 하지 않는 것이 자연스럽다.
- standalone 비교가 숨기는 요소는 `mn-character-card`, `mn-aside`, `mn-interactive-card`, 선택지 제목·잠금 안내다. 이후 MUD를 열면:
  - `openMUD()`가 `mn-aside`를 복구하고 헤더·연대기를 다시 그린다.
  - `renderStage()`가 단계에 따라 인물 카드를 다시 보이거나 숨긴다.
  - `setupSimulator()`가 시뮬레이터 유무에 따라 카드를 다시 보이거나 숨긴다.
  - 선택지 제목은 `renderStage()`에서 다시 표시된다.
- 비교 완료·건너뛰기는 `showPortalView()`로 돌아가고, 그 뒤 포털·도감·완료 화면 어느 경로에서 MUD를 열어도 위 복구 순서를 탄다.

비차단 관찰:

- 완료 화면 제안에서 시작한 비교는 MUD의 헤더·마지막 인물·연대기를 유지한다. 기능 복구 문제는 아니지만 비교를 독립 활동처럼 보이게 할지, 방금 끝낸 탐험의 후속 활동처럼 보이게 할지 제품 의도를 문서로 고정하면 좋다.

## 3. 연대기 오답 분기 판별

판정: **현재 데이터 수용 / 계약 보완 필요**.

- 28개 `regular_*.json`을 대조했다. 현재 하이픈을 포함한 roadmap ID는 모두 숫자 본 단계에 대응하는 재시도 단계이며, 이번 숨김 동작의 의도와 맞는다.
- 그러나 `isRoadmapBranch(id) = String(id).includes('-')`는 미래의 정상 단계가 `자료-비교`, `2-a` 같은 ID를 쓰면 조용히 오답 분기로 오판한다.
- `simulator_contract.json`은 시뮬레이터 상호작용 계약이므로 여기에 억지로 넣기보다 Regular MUD 구조 검증(`scripts/03` 또는 전용 데이터 계약)에 아래 중 하나를 고정하는 편이 낫다.
  - 명시 필드: roadmap/stage에 `kind: "retry"`, `retryOf: "2"`
  - 현 규칙 유지: 재시도 ID는 `^\d+-1$`, 단일 선택지가 원 본 단계로 돌아감, 그 외 하이픈 ID 금지
- 새 표현을 추가하기 전까지는 두 번째 방식이 최소 변경이다.

## 4. `renderContinueCard`와 `refreshPortalProgress`

판정: **보완 필요**.

수용되는 점:

- `rewardKeysByMudId`는 한 번 완료된 각 JSON 결과를 저장하므로 첫 렌더가 끝난 뒤 포털로 돌아올 때마다 28편을 다시 읽지는 않는다.
- `LessonTrack.loadPromise`도 `lesson_track.json`의 동시·반복 요청을 막는다.
- 저장 데이터가 없거나 JSON 파싱 자체가 실패하면 `EncyclopediaManager.loadData()`가 기본값을 반환한다.

보완 1 — 초기 중복 요청:

- `DOMContentLoaded`에서 `switchUnitTab(1)`이 `renderPortal()`을 시작한 직후 `refreshPortalProgress({ includeTrack: false })`가 `renderContinueCard()`를 시작한다.
- 두 렌더 모두 `computeStatuses()`를 호출한다. `rewardKeysByMudId`는 fetch가 끝난 뒤에만 값이 들어가므로, 첫 번째 요청이 진행 중일 때 두 번째 호출이 같은 28개 JSON을 다시 요청할 수 있다.
- 권고: `rewardKeysByMudId`에 결과 배열 대신 진행 중 Promise까지 즉시 저장하거나, 초기에는 연대표 렌더가 끝난 뒤 이어서 카드를 그리도록 한 번의 상태 계산을 공유한다.

보완 2 — 부분 손상 저장 데이터:

- `loadData()`는 `seenArtifactComparisons`와 `completedMuds`만 배열로 정규화한다.
- 저장값이 문법상 유효한 JSON이지만 `unlockedArtifacts`가 없거나 문자열·객체이면 `LessonTrack.isCompleted()`의 `unlocked.includes(...)`, 비교 목록, 도감 렌더가 예외를 낼 수 있다.
- 권고: 로드시 모든 배열 필드와 숫자 필드를 기본 스키마에 맞춰 정규화한다. ‘저장 데이터가 깨졌다’의 수용 기준에는 JSON 파싱 실패뿐 아니라 잘못된 필드 형식도 포함한다.

## 5. 접근성

판정: **부분 수용**.

- 이어서 하기: 실제 `<button type="button">`이며 구체적인 `aria-label`이 있어 키보드·스크린리더 이름이 적절하다. 전 편 완료 시 링크도 목적지가 명확하다.
- 구역 이동: 실제 `<a href="#...">` 3개이며 nav에 `aria-label`이 있다. 키보드 이동과 이름이 적절하다.
- 비교 목록: 시작/다시 하기 항목은 실제 버튼이고 보이는 이름과 비교 제목이 인접해 있다. 잠긴 항목은 비활성 버튼을 만들지 않아 불필요한 포커스가 없다.
- 보완 필요: 상위 컨테이너가 `role="tablist"`인데 세 버튼에 `role="tab"`, `aria-selected`, `aria-controls`, roving tabindex와 좌우 화살표 이동이 없다. 현재는 Tab 키로 세 일반 버튼을 각각 이동할 수 있지만 ARIA 탭 패턴으로는 불완전하다.
- 최소 권고는 둘 중 하나다.
  1. 일반 버튼 전환으로 유지할 경우 `role="tablist"`를 제거한다.
  2. 탭으로 유지할 경우 버튼·패널 역할/상태/연결과 좌우·Home·End 키 동작을 구현한다.

추가 권고:

- 비교 시작 뒤 새 화면의 첫 제목으로 포커스를 옮기거나 `main`/heading에 프로그램 포커스를 주면 스크린리더 사용자가 화면 전환을 즉시 알 수 있다. 현재는 클릭한 버튼이 숨겨진 포털에 남는다.

## 6. 임시 Playwright 스크립트의 저장소 편입

판정: **수동 회귀용으로 먼저 편입, 즉시 CI 필수화는 보류**.

- 74개 체크를 다시 손으로 작성하는 비용이 크므로, 세션 임시 파일로만 두기보다 재현 가능한 핵심 흐름을 저장소에 남길 가치가 있다.
- 다만 현재 루트 정적 앱에는 Playwright를 직접 설치·고정한 package 구성이 없다. 임시 스크립트를 그대로 CI에 넣으면 브라우저 설치·서버 기동·저장 상태 초기화가 환경 의존적일 수 있다.
- 권고 순서:
  1. 체크리스트 전체가 아니라 P1/P2 핵심 8~12개를 선택한다.
  2. 390×844, 1180×820 두 viewport와 초기 localStorage fixture, 포털→MUD→복귀→비교→다른 MUD 흐름을 결정적으로 만든다.
  3. 먼저 `scripts/manual/`의 수동 회귀로 보존하고 실행법·기대 결과를 문서화한다.
  4. 두세 차례 안정적으로 재사용한 뒤 Playwright 버전과 정적 서버 명령을 고정하여 CI 편입을 별도 승인한다.

CI 후보로 우선 남길 항목:

- 좁은 화면에서 시뮬레이터 카드가 선택지보다 앞에 있고 핫스팟/대체 버튼이 계속 작동함
- 1열↔2열 왕복 후 카드가 `mn-aside`로 복구되고 resize 리스너가 하나임
- 도감·포털·완료 화면 비교 뒤 다른 MUD의 인물·시뮬레이터·연대기가 복구됨
- 첫 로드의 Regular JSON 요청 횟수와 포털 재복귀 시 추가 요청 0건
- 빈 저장, 구문 오류 저장, 필드 형식 오류 저장에서 이어서 하기와 비교 목록이 예외 없이 렌더됨
- 탭 또는 일반 버튼 중 선택한 접근성 계약의 키보드 동작

## 검증

- `git diff 496835b3^..3aa7571c`의 관련 JS·HTML·CSS 읽기 전용 대조
- 28개 `regular_*.json` roadmap/stage ID 구조 확인
- `MudEngine`·`MudInquiry`·`MudSimulators`의 DOM 이동·캔버스 좌표·리스너 경로 대조
- `EncyclopediaManager.loadData()`와 `LessonTrack` 캐시·완료 판정 경로 대조
- 앱 코드·JSON 변경 없음
