# BACKLOG

> 완료된 기능은 이 목록에 넣지 않는다. 완료 이력은 [`walkthrough.md`](./walkthrough.md), 현재 상태는 [`project_context.md`](./project_context.md)에서 확인한다.

## 구현 우선순위

현재 구현 순서는 학습 흐름의 안정성, 모바일 사용성, 교육 콘텐츠 품질 순으로 정한다. 아래 순서는 문서 검토 후 정한 다음 구현 후보이며, 실제 코딩은 별도 구현 계획과 사용자 확인 후 시작한다.

1. **P1-01 설계·실제 화면 정합성 대표 MUD 검증** — `regular_paleolithic`을 기준으로 포털→MUD→시뮬레이터→선택지→엔딩 흐름과 세로형 태블릿 레이아웃을 대조한다. *(완료: 820×1180 Chrome 점검 통과)*
2. **P1-02 Regular 활동 시간·무작위 탭 내성** — 반복 탭으로 핵심 자료를 우회하는 경로를 검토하고 필요한 완료 조건을 보강한다. *(5개 MUD 15단계 코드 반영, 대표 `regular_independence` 1~3단계 로컬 Chrome 회귀 확인; 실제 학생 활동 시간 측정과 잔여 구조 후보 40개 검토는 별도)*
3. **P1-03 IF 스테이지 교육적 품질** — 재시도 단계의 자료·해석 단서를 보강할 대상을 선별한다. *(1차 6개 반영, 감사 신호 94개 → 92개; 교사 검토 대기)*
4. **P1-04 민감한 역사 주제 상호작용 검토** — `regular_japanese_rule_2`의 강제 동원·피해자 관련 단서를 비재현적 자료 탐색으로 설계한다.
5. **P2-01 접근성·상태 표현** — 모달, 선택지, 시뮬레이터 진행 상태와 오류 상태를 개선한다. *(1차 정적 반영, 실제 보조기기 확인 대기)*
6. **P2-02 유물·보상 설명 교육적 검수** — 사실성·출처·문장 난이도를 검토한다. *(자동 감사 신호 6종 해소, 교사 최종 검토 대기)*
7. **P2-03 MUD 등록 경로 단순화** — `_index.json` 단일 등록원 전환 여부를 결정한다. *(정상 로드 시 인덱스 단일 경로 반영; 브라우저·보조 MUD 노출 확인 대기)*
8. **P3-01 브라우저·기기 회귀 점검** — 지원 기기와 브라우저별 정기 점검 체계를 만든다. *(브라우저 도구 버전 불일치로 실행 보류)*

### 현재 선정된 첫 구현 계획

- 대상: `P1-01`, `regular_paleolithic` 대표 수직 슬라이스
- 계획서: [`implementation_plan_design_alignment_vertical_slice.md`](./implementation_plan_design_alignment_vertical_slice.md)
- 상태: `completed` — 정적·브라우저 대표 흐름 검증 완료
- 구현 시작 조건: 계획 범위와 검증 결과에 대한 사용자 확인

### P1-02 첫 구현 계획

- 대상: `regular_independence` 및 `regular_modern_open` 각 1~3단계의 비장면 `text-reading`·`battle-gauge`·`culture-touch` 활동
- 계획서: [`implementation_plan_tap_resistance_batch.md`](./implementation_plan_tap_resistance_batch.md)
- 상태: `planned` — 기존 감사 결과 기반 계획 검토 대기
- 원칙: 장면이 있는 단계와 기존 좌표는 이번 묶음에서 변경하지 않는다.

### P1-04 민감한 역사 주제 검토 계획

- 대상: `regular_japanese_rule_2` 1~3단계
- 계획서: [`implementation_plan_sensitive_history_interactions.md`](./implementation_plan_sensitive_history_interactions.md)
- 상태: `planned` — 교육적 검토 후 구현

### P1-03 IF 스테이지 1차 구현 계획

- 대상: 설명이 짧고 자료·비교 단서가 부족한 IF 단계 6개
- 계획서: [`implementation_plan_if_stage_quality_batch.md`](./implementation_plan_if_stage_quality_batch.md)
- 상태: `planned` — 문장 보강 전 교육적 검토 대기

### P2-01 접근성·상태 표현 1차 계획

- 계획서: [`implementation_plan_accessibility_state.md`](./implementation_plan_accessibility_state.md)
- 상태: `in-progress` — 정적 반영 완료, 실제 보조기기 확인 대기

### P2-02 유물·보상 설명 1차 계획

- 대상: 자동 감사에서 표현 검토 신호가 나온 6종
- 계획서: [`implementation_plan_artifact_wording.md`](./implementation_plan_artifact_wording.md)
- 상태: `planned` — 표현 범위와 출처 확인 후 수정

### P2-03 MUD 등록 경로 단순화 계획

- 계획서: [`implementation_plan_registration_single_source.md`](./implementation_plan_registration_single_source.md)
- 상태: `in-progress` — 인덱스 단일 경로와 비상 호환 경로 반영, 브라우저 확인 대기
- 감사 결과: `_index.json` 32종 등록, 커리큘럼 48차시 중 39차시 매칭, `app.js` 레거시 Regular 조건문 약 140줄 잔존
- 주의할 중복: 2단원 7차시(`regular_myeongnyang`/`regular_joseon_diplomacy`), 3단원 12차시(`regular_korean_war`/`regular_post_war`). 주 MUD는 각각 외교·전후 재건으로 적용

## 다음 기획·검토 항목

### P1 — 설계 문서와 실제 화면의 정합성 점검

- `WIREFRAMES.md`의 `[자료 보기]`가 현재 화면에 없는 이유를 확인하고, 실제 기능을 추가하지 않고 와이어프레임에서 제거한다.
- 포털의 차시 카드·단원 탭·확장 활동 영역이 와이어프레임의 정보 구조와 일치하는지 태블릿 세로 화면에서 확인한다.
- MUD 플레이 화면의 단계 표시, 자료 본문, 시뮬레이터, 피드백, 선택지 순서가 실제 학생 흐름과 일치하는지 확인한다.
- 캔버스 조작이 어려운 시뮬레이터에 버튼 대체 조작이 제공되는지 모드별로 확인한다.
- `regular_paleolithic` 6단계 성찰 시뮬레이터를 `required: true`로 적용한 뒤, 성찰 단서 3개를 확인해야 엔딩으로 진행되는지 검증한다.
- `index.html`의 인라인 반응형 레이아웃과 `css/style.css`의 별도 미디어 쿼리 부재가 세로형 태블릿에서 문제를 일으키는지 확인한다.
- 확인 결과는 코드 수정 없이 이 항목에 기록하고, 구현이 필요한 경우 별도 구현 계획으로 분리한다.

### P2 — 접근성·상태 표현 설계 검토

- 퀴즈·도감 모달의 닫기, 키보드 포커스, `aria` 상태가 화면 설계 기준을 만족하는지 확인한다.
- 선택지와 시뮬레이터 진행 상태가 색상만으로 전달되지 않는지 확인한다.
- 로딩 실패·데이터 불러오기 실패·빈 상태를 사용자에게 설명하는 흐름을 와이어프레임과 실제 화면에서 대조한다.

### P2 — 설계 산출물 유지 규칙 확정

- PRD의 수용 기준이 `USER_FLOWS.md`와 `WIREFRAMES.md`의 화면·흐름 기준에 반영되어 있는지 검토한다.
- 설계 변경 요청은 먼저 BACKLOG에 기록하고, 우선순위 검토 전까지 관련 설계 문서와 코드를 임의로 변경하지 않는다.
- 구현 완료 후 실제 동작이 설계 문서와 달라진 경우, 문서 갱신과 `walkthrough.md` 기록을 같은 작업 묶음에 포함한다.

### P1 — Regular 활동 시간·무작위 탭 내성 검증

- Regular MUD가 실제 학생 개인 활동에서 10분 이내, 설계 목표 약 9분에 들어오는지 학생 3명 이상으로 측정한다.
- 탭 가능한 요소를 학생이 순서와 의미를 확인하지 않고 연속해서 눌러 1~2분 안에 끝내는 경로를 전수 확인한다.
- 핵심 단서 읽기·비교·해석 없이 완료되는 경우에는 완료 조건, 피드백, 단계 분량을 재설계한다.
- Deep-dive MUD는 확장 탐구 활동으로 운영할 차시 수, 교사 안내, 예상 시간을 별도로 정한다.
- 결과를 `activity_duration_audit.md`와 카탈로그 메타데이터에 반영한다.

### P1 — 자동 생성 IF 스테이지 교육적 품질 보강

- 최소 재시도 화면에 실제 역사 자료와 복수의 해석 단서를 보강할 대상을 선별한다.
- Regular의 짧은 복습 목표를 넘어서지 않도록 단계 수와 문장량을 함께 검토한다.
- 구조 선별 결과는 [`if_stage_audit.md`](./if_stage_audit.md)를 기준으로 삼고, 실제 문장 수정은 교사 검토 후 단계별로 진행한다.

### P2 — 유물·보상 설명 교육적 검수

- 유물 카드 설명의 사실 범위, 출처, 5학년 수준의 문장 난이도를 검수한다.
- 구조·표현 신호는 [`artifact_audit.md`](./artifact_audit.md)를 기준으로 확인한다.

### P2 — Regular MUD 등록 경로 단순화

- `app.js`의 레거시 조건문 fallback을 유지할 필요와 제거 조건을 검토한다.
- `_index.json`의 등록 차시 기준을 화면 표시 번호로 통일한 뒤 단일 등록원 전환 여부를 결정한다.
- 중복 매칭 차시는 `primary`와 `supplementary`를 구분한 뒤 포털 기본 버튼은 `primary` 하나만 사용한다.
- 계획서 [`implementation_plan_registration_single_source.md`](./implementation_plan_registration_single_source.md)의 순서에 따라 인덱스 계약·검증을 먼저 확정한다.

### P3 — 미확인 브라우저·기기 회귀 점검

- 변경된 시뮬레이터 장면과 터치 흐름을 지원 브라우저·태블릿에서 정기적으로 육안 확인한다.
- 실행 기준: [`BROWSER_REGRESSION_CHECKLIST.md`](./BROWSER_REGRESSION_CHECKLIST.md)
