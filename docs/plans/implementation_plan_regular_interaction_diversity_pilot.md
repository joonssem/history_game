# 구현 계획 — Regular MUD 상호작용 다양성 수직 파일럿

## 상태

- 작업: `TASK-20260910-04`
- 우선순위: P1 후보
- 대상: `regular_goryeo_culture`
- 상태: `implemented / technical-validation-complete / classroom-validation-needed`
- 구현 여부: `TASK-20260910-06`에서 고려 문화 한 편과 공용 계약·검증기를 구현했다. 다른 27개 Regular MUD는 변경하지 않았다.
- 선행 근거: [`regular_interaction_diversity_audit.md`](../audits/regular_interaction_diversity_audit.md), [`regular_gameplay_red_team_audit.md`](../audits/regular_gameplay_red_team_audit.md), [`regular_interaction_gameplay_idea_options.md`](./regular_interaction_gameplay_idea_options.md)

## 1. 목적과 검증할 가설

현재 Regular MUD의 필수 활동은 대체로 서로 다른 원형 표식을 세 번 누르면 완료된다. 이번 파일럿은 장면 수나 문제 수를 늘리는 실험이 아니라, **완료 판정을 조작 횟수에서 역사적 관계 판단으로 바꾸는 실험**이다.

검증할 가설은 다음과 같다.

1. `관찰 → 순서화 → 공간·자료 범위 추론 → 주장·근거·한계`의 네 단계 곡선은 10분 안팎 Regular 형식 안에서도 작동한다.
2. 학생은 모든 버튼을 시험하는 것만으로 완료하지 못하고, 적어도 한 번은 단서 사이의 관계를 사용해야 한다.
3. 감점·목숨·강제 타이머 없이도 `첫 판단 → 근거 확인 → 수정`과 제한된 제출 기회가 선택의 무게를 만든다.
4. 하나의 범용 계약으로 네 가지 학습 행동을 표현할 수 있어 시대별 전용 엔진의 증가를 막을 수 있다.

## 2. 이번 계획에서 확정하는 설계

### 2-1. 새 계약은 하나만 추가한다

공개 interaction 값은 `inquiry-task` 하나를 추가한다. 앞선 아이디어의 `card-placement`는 순서·분류에는 맞지만 첫 판단과 지도 추론까지 포괄하는 이름으로는 부정확하다. 과거 미구현 계획의 `argument-builder`도 별도 interaction으로 추가하지 않고 `inquiry-task`의 `claim-evidence` 작업으로 흡수한다.

```text
interaction: inquiry-task
└─ task.type
   ├─ commit-revise   최초 판단 후 근거를 보고 유지·수정
   ├─ sequence        실제 절차·시간·인과 순서 배열
   ├─ map-evidence    장소와 그 해석 근거 연결
   └─ claim-evidence  주장·근거·자료의 한계 구성
```

하나의 이름 아래에 아무 행동이나 넣는 범용 위젯이 되지 않도록 `task.type`별 필수 필드와 판정기를 계약·검증기에 명시한다.

### 2-2. 완료는 숫자가 아니라 검증된 상태가 결정한다

기존 `target + minActions` 방식은 그대로 유지해 기존 MUD에 회귀를 만들지 않는다. `inquiry-task`만 `completion.strategy: "validated-state"`를 사용한다.

```jsonc
{
  "interaction": "inquiry-task",
  "task": {
    "type": "sequence",
    "prompt": "금속활자로 책을 찍는 과정을 배열하세요.",
    "cards": [],
    "rules": {}
  },
  "completion": {
    "strategy": "validated-state",
    "target": 1,
    "increment": 1,
    "minActions": 1,
    "progressKey": "simulatorProgress",
    "successText": "✅ 과정과 그 의미를 연결했습니다."
  }
}
```

- 카드 선택·이동만으로는 완료되지 않는다.
- 학생이 `판단 확인`을 눌렀을 때 task 판정기가 현재 상태를 검사한다.
- 타당하면 진행도를 1로 바꾸고 기존 `updateSimulatorCompletion()` 게이트를 통과시킨다.
- 부족하거나 잘못 연결하면 진행도는 0에 머물고, 정답 공개 대신 충돌한 관계와 대조 단서를 보여 준다.
- `attempts`, `firstChoice`, `revised`, `hintsUsed`, `misconceptionFlags`는 현재 MUD 실행 메모리에만 둔다. localStorage나 서버에는 저장하지 않는다.

### 2-3. DOM이 기본 조작이고 Canvas는 맥락 표현이다

- 카드 선택, 순서 변경, 연결, 제출은 실제 `<button>`과 목록으로 제공한다.
- 드래그는 보조 조작으로만 허용한다. 탭하여 선택한 뒤 `앞으로`, `뒤로`, `여기에 놓기`로 동일하게 완료할 수 있어야 한다.
- Canvas 장면은 기존 시대별 그림을 유지하고, `map-evidence`에서만 지점 선택을 보조 입력으로 사용한다.
- Canvas를 사용할 때도 같은 지점과 설명을 DOM 버튼으로 제공한다.
- 새 패널은 `#mn-inquiry-panel` 하나를 추가하고 기존 `#mn-hotspot-actions`는 레거시 활동용으로 유지한다.

## 3. 고려 문화 4단계 상세 사양

### 공통 흐름

```text
문제 제시
→ 학생의 선택·배치
→ 판단 확인
→ 타당: 근거 카드 획득 + 다음 단계 해제
→ 보완 필요: 오개념별 대조 피드백 + 수정
→ 4단계에서 앞서 얻은 근거를 다시 사용
```

오답은 생명이나 점수 손실이 아니라 **추가 자료를 보게 되는 비용**을 만든다. 무한 추측을 막기 위해 같은 오개념을 반복하면 두 번째부터 질문형 힌트를 표시하되 정답 버튼을 자동 선택하지 않는다.

| 단계 | task.type | 학생 행동 | 완료 판정 | 획득 근거 |
|---|---|---|---|---|
| 1. 팔만대장경 | `commit-revise` | 보존 이유를 먼저 고르고, 제작·보관 단서를 연 뒤 판단을 유지하거나 수정 | 제작 조건과 보관 환경을 함께 고려한 최종 판단 | `tripitaka-making`, `tripitaka-storage` |
| 2. 직지 | `sequence` | 금속활자 인쇄의 핵심 절차 카드를 배열하고 재조합 가능성의 의미를 선택 | 검수된 절차 배열 + “다시 조합 가능한 글자”와 기술 의미 연결 | `jikji-process`, `reusable-type` |
| 3. 벽란도 | `map-evidence` | 지도에서 항구·교류망 단서를 고르고 자료가 보여 주는 범위를 구분 | 국제 연결의 근거 1개와 과잉 일반화를 막는 한계 1개를 함께 선택 | `byeokrando-network`, `record-limit` |
| 4. 문화 종합 | `claim-evidence` | 앞의 근거 중 두 종류 이상을 주장에 붙이고 자료 한계 카드를 선택 | 타당한 주장 + 서로 다른 출처의 근거 2개. 한계까지 붙이면 최고 등급 | 새 카드 없음 |

### 3-1. 팔만대장경 — 판단·공개·수정

- 첫 질문은 “오늘까지 남은 까닭을 무엇으로 설명할 수 있을까?”로 둔다.
- 첫 판단 후보는 `제작 과정만`, `보관 환경만`, `제작과 보관을 함께`의 세 범주로 만든다. 오답도 역사적 사실을 거짓으로 만들지 않고 **설명 범위가 부족한 판단**으로 구성한다.
- 첫 판단을 고른 뒤에만 목재 가공 단서와 장경판전 환경 단서를 공개한다.
- 최종 판단에서 둘을 함께 고려하면 완료한다. 첫 판단과 최종 판단이 달라졌으면 “근거를 보고 생각을 수정함”을 긍정적으로 표시한다.

### 3-2. 직지 — 의미 있는 순서화

- 기존 세 핫스팟을 그대로 누르는 방식은 제거한다.
- 절차 카드 문구와 순서는 구현 전에 현재 JSON의 공식 출처와 추가 공공기관 자료로 재검증한다. 계획 단계의 임시 예시는 `활자 준비 → 조판 → 인쇄 → 활자 재사용`이다.
- 오배열 시 전체를 초기화하지 않고 처음 충돌한 두 카드만 강조한다.
- 순서만 맞혀 끝내지 않고 “금속활자가 다시 조합될 수 있다는 점은 무엇을 가능하게 하는가?”를 한 번 연결해야 완료한다.

### 3-3. 벽란도 — 공간 근거와 자료의 범위

- 목적은 항구 위치 맞히기가 아니라 “이 자료로 어디까지 말할 수 있는가”를 판단하는 것이다.
- 항구·교류 상대·기록 범위 중 하나만 누르면 끝나지 않는다.
- `국제 교류를 뒷받침하는 근거`와 `고려 사회 전체로 일반화하지 않게 하는 한계`를 한 쌍으로 제출해야 한다.
- 지도 지점 선택과 동일한 DOM 목록을 제공한다. 좌표를 외워도 근거–한계 쌍이 없으면 완료되지 않는다.

### 3-4. 최종 관문 — 주장·근거·한계

- 앞 단계 완료 때 얻은 근거 카드만 표시한다. 스테이지 4에서 새 정답 카드를 갑자기 주지 않는다.
- 학생은 제시된 주장 하나를 고른 뒤 서로 다른 단계에서 얻은 근거 두 장 이상을 붙인다.
- 지원할 주장 예시는 다음 두 범위로 한정한다.
  - 고려에는 목판·금속활자와 관련된 제작·인쇄 기술이 있었다.
  - 고려는 주변 여러 지역과 교류했고, 남은 자료마다 보여 주는 범위가 다르다.
- `자료의 한계` 카드까지 적절히 붙이면 `역사가`, 근거 두 종류를 연결하면 `연결자`, 관련 단서만 찾은 상태는 `관찰자`로 표시한다.
- 기본 완료 기준은 `연결자`다. `역사가`는 선택형 심화 성취이며 기본 보상이나 다음 진행을 막지 않는다.

## 4. 단계 선택지와 IF 스테이지 처리

현재 1~4단계는 시뮬레이터 뒤에 다시 정답·오답 선택지를 제시하고, 오답이면 `1-1`~`4-1`로 이동한다. 새 상호작용이 이미 판단과 수정을 담당하므로 이를 그대로 두면 같은 질문을 두 번 푸는 문제가 생긴다.

파일럿에서는 다음과 같이 정리한다.

- 1~3단계의 `choices`는 완료 후 나타나는 단일 `다음 관문` 버튼으로 바꾼다.
- 4단계는 단일 `탐구 결과 확인` 버튼으로 종료한다.
- 기존 `1-1`~`4-1`의 교육적 피드백은 삭제하지 않고 각 task의 `misconceptionFeedback`으로 옮긴다.
- 이동 목적만 있던 IF 스테이지와 roadmap 노드는 제거한다. 무결성 검증으로 unreachable/dangling 경로가 없음을 확인한다.
- 선택지가 하나일 때 화면 제목은 “당신의 선택은 무엇입니까?” 대신 “다음 단계”로 표시하도록 하위 호환 가능한 문구 전환을 적용한다.

## 5. 런타임 책임 분리

| 파일·모듈 | 책임 | 하지 않는 일 |
|---|---|---|
| `js/mudEngine.js` | MUD 실행 상태, 단계 이동, 완료 게이트, MUD 실행 범위 근거 목록 | task별 정답 규칙 보유 |
| 신규 `js/mudInquiry.js` | `task.type`별 DOM 렌더링, 의미 행동 정규화, 상태 판정, 대조 피드백 | 시대별 그림 그리기, localStorage 저장 |
| `js/mudSimulators.js` | 기존 Canvas 장면과 hit test, 지도 지점을 의미 ID로 전달 | 새 task의 완료 여부 결정 |
| `data/mud/regular_goryeo_culture.json` | 문제·카드·허용 관계·오개념 피드백·근거 보상 선언 | 실행 가능한 HTML·JS 포함 |
| `simulator_contract.json` | interaction, task, completion 전략의 허용 값 선언 | 교육적 정답 자체 판단 |

스크립트 로드 순서는 `mudEngine.js → mudInquiry.js → mudSimulators.js → app.js`로 한다. 모듈 간 호출은 로드 시점이 아니라 사용자 동작 시점에 수행해 기존 전역 객체 패턴을 유지한다.

## 6. 데이터 검증 규칙

`scripts/04_validate_mud_contract.py`에 다음 오류 조건을 추가한다.

- `inquiry-task`인데 `task.type`이 허용 목록에 없음
- task별 필수 `cards`, `claims`, `zones`, `rules` 누락
- 중복 카드 ID 또는 존재하지 않는 ID를 규칙에서 참조
- 정답 구성이 하나도 없거나 기본 완료가 불가능함
- `sequence`인데 카드 수와 순서 ID 수가 다름
- `map-evidence`인데 좌표가 범위를 벗어나거나 DOM 대체 라벨이 없음
- `claim-evidence`인데 유효 근거가 두 출처 미만이라 `연결자` 달성이 불가능함
- `completion.strategy`가 `validated-state`가 아닌데 inquiry task를 사용함

`scripts/03_validate_mud_integrity.py`는 단일 다음 버튼과 제거된 IF 스테이지를 포함해 도달성·종료 경로를 검사한다. `scripts/05_test_simulator_runtime.js`는 기존 카운터 계약과 새 상태 계약을 함께 회귀 검사한다.

## 7. 접근성·태블릿 수용 기준

- 모든 상호작용을 터치, 마우스, 키보드만으로 각각 끝낼 수 있다.
- 드래그 없이도 순서 변경과 카드 배치가 가능하다.
- 선택 상태는 색만이 아니라 텍스트·아이콘과 `aria-pressed`/`aria-selected`로 표현한다.
- 피드백은 `aria-live`로 알리고, 오답 뒤 초점은 오류 요약 또는 처음 충돌한 카드로 이동한다.
- 최소 터치 영역 44×44 CSS px를 확보한다.
- 390×844 모바일과 820×1180 세로형 태블릿에서 가로 스크롤 없이 완료한다.
- Canvas가 로드되지 않아도 DOM 활동만으로 학습·진행이 가능하다.

## 8. 게임성과 교육적 안전선

포함한다.

- 첫 판단을 잠시 고정하고 근거 뒤 수정하는 긴장
- 단계 완료 때 근거 카드가 쌓이는 진행감
- 마지막에 앞선 행동을 다시 쓰는 작은 보스 관문
- 정답/오답 이진값이 아닌 `관찰자·연결자·역사가` 질적 피드백
- 오개념에 맞춘 대조 질문

포함하지 않는다.

- 필수 타이머, 목숨, 감점, 공개 순위표
- 역사적 의미가 없는 함정 카드
- 무작위 좌표만 바꾸는 난이도 조정
- 유물·배지가 정답을 대신하는 파워업
- 첫 파일럿의 랜덤 덱·관점 재플레이

## 9. 구현 범위

예상 변경 파일은 다음과 같다.

- `index.html`: `mudInquiry.js` 로드, `#mn-inquiry-panel`, 선택지 제목 식별자
- `css/style.css`: 카드·영역·순서·상태·반응형 스타일
- `js/mudEngine.js`: MUD 실행 범위 inquiry/evidence 상태, validated-state 완료 연결, 단일 이동 선택지 제목
- 신규 `js/mudInquiry.js`: 네 task 어댑터와 공통 접근성 조작
- `js/mudSimulators.js`: `map-evidence` Canvas 선택을 의미 ID로 전달하는 최소 연결
- `data/mud/regular_goryeo_culture.json`: 네 단계와 IF 피드백 변환
- `simulator_contract.json`: 버전 1.1, `inquiry-task` 및 task별 계약
- `scripts/03_validate_mud_integrity.py`
- `scripts/04_validate_mud_contract.py`
- `scripts/05_test_simulator_runtime.js`
- 필요 시 신규 `scripts/13_audit_inquiry_tasks.py`: 인지 행동·연속 반복·완료 가능성 감사
- `walkthrough.md`: 구현·검증 완료 후에만 갱신

이번 파일럿에서 변경하지 않는다.

- 다른 27개 Regular MUD
- Deep-dive와 협동 MUD
- 유물 도감·퀴즈 점수·localStorage 키
- Vercel·Convex·Supabase·로그인
- 프레임워크와 패키지

## 10. 테스트 순서

### 정적·단위 검증

```powershell
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/06_validate_static_assets.py
python scripts/08_validate_mud_catalog.py
python scripts/09_validate_mud_sources.py
node scripts/05_test_simulator_runtime.js
node --check js/mudEngine.js
node --check js/mudInquiry.js
node --check js/mudSimulators.js
git diff --check
```

반드시 포함할 자동 시나리오:

1. 모든 카드를 차례로 눌러도 제출 판정 없이 완료되지 않는다.
2. 잘못된 관계 제출은 진행도를 올리지 않는다.
3. 수정 뒤 타당한 제출은 정확히 한 번 완료된다.
4. 단계 재진입과 중복 탭으로 근거 카드가 중복되지 않는다.
5. 단계 4는 단계 1~3의 근거만 사용한다.
6. 기존 ordered/discovery/gauge/slider 활동은 이전과 똑같이 완료된다.

### 브라우저 회귀

- Chrome 390×844, 820×1180, 데스크톱에서 네 단계 완주
- 터치 상당 클릭, 키보드 Tab/Enter/Space, 스크린리더용 이름·상태 확인
- 첫 판단 유지 경로와 수정 경로 각각 완주
- 단계별 오개념 피드백 각각 한 번 확인
- 포털 복귀, 보상 해금, 다른 Regular MUD 2종의 기존 활동 회귀 확인
- 콘솔 오류·경고 0건

## 11. 파일럿 성공·중단 기준

### 기술 성공

- 자동·브라우저 수용 기준을 모두 통과한다.
- 기존 27개 Regular MUD의 JSON을 수정하지 않고 회귀가 없다.
- `regular_goryeo_culture`를 단순 전수 클릭만으로 완료할 수 없다.

### 소규모 수업 성공 신호

최소 학생 3명으로 기존 수업 관찰과 같은 환경에서 확인한다.

- 성인 도움 없이 네 단계를 완료한다.
- 실제 완료 시간이 대체로 7~12분 안에 들어온다. 12분 초과 자체를 실패로 단정하지 않고 막힌 UI·읽기량·사고 시간으로 원인을 분리한다.
- 최소 2명이 종료 후 팔만대장경·직지·벽란도 중 서로 다른 두 자료를 사용해 한 문장으로 설명한다.
- 학생이 대조 피드백을 읽거나 판단을 수정하는 장면이 관찰된다.
- “카드를 다 눌러 보니 됐다”는 방식으로 통과하지 않는다.

### 중단·축소 조건

- 네 task 모두 별도 예외 코드가 필요해 범용 계약이 되지 않음
- 세로형 태블릿에서 카드 조작이 본문 읽기를 지속적으로 방해함
- 역사적 순서나 정답 규칙을 공공 출처로 방어하기 어려움
- 3명 중 2명 이상이 조작법을 이해하지 못해 교사 개입을 반복 요구함

중단 조건이 나오면 전체 확장으로 넘어가지 않고, task 종류를 두 개로 줄이거나 한 단계만 다시 설계한다.

## 12. 구현 승인 후 작업 순서

1. `BACKLOG.md`에 구현 claim을 별도 번호로 `DOING` 등록하고 브랜치·worktree를 재확인한다.
2. 직지 절차와 카드 문구를 출처 대조해 확정한다.
3. 계약·검증기 테스트를 먼저 추가한다.
4. `mudInquiry.js`와 엔진 연결을 구현한다.
5. 고려 문화 JSON 한 편만 변환한다.
6. 자동 검증과 브라우저 회귀를 완료한다.
7. 실제 수업 전 결과를 `walkthrough.md`에 기록한다.
8. 수업 결과는 `EXPERIMENTS.md`에 `관찰 → 가설 → 결과 → 다음 결정` 형식으로 남긴다.

## 13. 승인 게이트

기획과 승인된 수직 파일럿 구현은 완료했다. 전체 Regular 변환은 포함하지 않았으며, 다음 게이트는 지정 뷰포트 확인과 실제 학생 수업 관찰이다.

## 14. 구현·검증 결과 (2026-09-10)

- `commit-revise`, `sequence`, `map-evidence`, `claim-evidence` 네 판정기를 DOM 우선 UI로 구현하고, `validated-state`가 아니면 기존 숫자 카운터가 올라가도 다음 선택지가 열리지 않게 했다.
- 고려 문화 4단계를 첫 판단 → 절차와 기술 의미 → 공간 근거와 자료 범위 → 주장·근거·한계의 난이도 곡선으로 변환했다. 앞의 세 단계에서 얻은 근거 6장만 마지막 관문에서 사용한다.
- 잘못된 제출, 같은 오개념 반복 시 질문형 힌트와 오류 초점 이동, 수정 후 성공, 근거 중복 방지, 캔버스–DOM 지도 지점 동기화, 최종 `연결자`·`역사가` 질적 결과를 확인했다.
- 전체 데이터·MUD 무결성·계약·정적 자산·카탈로그·출처·런타임 검사와 JS 문법 검사, `git diff --check`를 통과했다. 반복 탭 감사기는 `validated-state`를 오탐하지 않도록 계약 인식을 추가했다.
- 데스크톱 Chrome에서 네 단계 완주, 오답–수정 경로, 실제 캔버스 지점 선택, 키보드 Enter, 최종 유물·성찰 화면, 기존 구석기·신석기 첫 단계 회귀를 확인했고 콘솔 오류·경고는 0건이었다.
- 이번 세션의 브라우저 제어 환경에서는 뷰포트 크기를 지정할 수 없어 390×844와 820×1180 검증은 미완료다. 실제 학생 3명 이상 수업 관찰과 함께 다음 게이트로 남긴다.
