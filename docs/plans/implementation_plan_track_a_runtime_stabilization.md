# Track A — MUD·인터랙티브 활동 런타임 안정화 계획

TASK-20260902-03 | MUD·인터랙티브 활동 런타임 안정화 | 담당: Codex | 상태: completed

## 목적

학생이 차시별 MUD를 플레이할 때 이전 단계의 상태가 남거나, 캔버스와 대체 버튼의 완료 판정이 달라 진행이 막히는 런타임 결함을 최소 범위로 수정한다.

## 대상

- `index.html`
- `js/mudEngine.js`
- `js/mudSimulators.js`
- `scripts/05_test_simulator_runtime.js`
- 필요 시 `BACKLOG.md`, `walkthrough.md`

## 이번 묶음에서 수정할 결함

1. `renderStage()`가 `stage.simulator`가 없는 오답 재시도 단계를 렌더링할 때 현재 시뮬레이터와 위젯을 정리하지 않는 문제
2. `gwangbok-flag`·`gwangbok-vote`의 캔버스 직접 조작이 버튼 조작과 같은 canonical progress를 기록하지 않는 문제
3. 스테이지 전환 시 `simActionIds`를 초기화하지 않는 상태 수명 문제

## 변경 원칙

- JSON 스키마와 기존 MUD의 역사 서술은 변경하지 않는다.
- `setupSimulator()`를 공통 초기화 경계로 유지한다.
- 캔버스와 대체 버튼은 같은 `setSimulatorProgress()` 및 완료 판정을 사용한다.
- 기존 `localStorage` 키, 뷰 ID, 스크립트 로드 순서를 변경하지 않는다.
- Track B의 Deep-dive 파일과 Claude가 생성한 제품 방향 문서를 수정하지 않는다.

## 검증 기준

- 시뮬레이터가 없는 Regular IF 단계에서 이전 캔버스·게이지·대체 버튼이 표시되지 않는다.
- 태극기와 투표 활동은 캔버스 직접 조작 및 버튼 조작 모두 완료 후 선택지가 활성화된다.
- 스테이지를 바꾸면 action ID 집합과 진행률이 새 스테이지 기준으로 시작한다.
- 기존 hotspot 순서·중복 단서·슬라이더·legacy gauge 테스트가 계속 통과한다.
- JSON 무결성·MUD 계약·정적 자산·카탈로그·출처·JavaScript 문법 검사를 통과한다.
- 실제 브라우저에서 대표 정상·오답·재시도 흐름을 확인하고 `walkthrough.md`에 결과를 기록한다.

## 제외 범위

- 40개 반복 탭 후보의 전체 콘텐츠 재설계
- Deep-dive 콘텐츠 확장
- 유물 비교·역사 타이쿤 구현
- Vercel·Supabase·로그인·Realtime
- 감사 문서의 대규모 재작성
