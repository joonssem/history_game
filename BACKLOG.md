# BACKLOG

> 완료된 기능은 이 목록에 넣지 않는다. 완료 이력은 [`walkthrough.md`](./walkthrough.md), 현재 상태는 [`project_context.md`](./project_context.md)에서 확인한다.

## 2026-09-01 기획 기준선

학생 실제 수업 결과를 반영해 우선순위를 다음처럼 재정렬한다.

```text
NOW / EARLY: 콘텐츠 정합성·선택지 편향 QA → Vercel 배포 검토 → Supabase 최소 로그 설계
NEXT: 해금 유물 2개 기반 역사적 추론 최소 실험
LATER: 선택 탐험·유물 탐구 → 익명 활동 결과·학급 집계 → 친구 비교·협력 → Anonymous Auth
FUTURE / NOT NOW: Realtime·학급 공동 이벤트·역사 타이쿤 장기 상태·공개 순위표
```

- 2026-09-01 수업에서 1단원 2·3차시 연속 활동이 4분 이내에 완료되었다. 원인은 선택지 난이도, 시뮬레이터 완료 조건, 읽기 속도, 교실 내 정보 공유를 분리해 확인해야 한다.
- 학생 의견은 즉시 구현 요구가 아니라 관찰 → 가설 → 작은 실험 → 재관찰로 처리한다.
- 상세 아이디어는 보관 문서 [`student_feedback_idea_note.md`](./docs/archive/student_feedback_idea_note.md)와 자문 보조 문서 [`student_ideas_strategy_consult_brief.md`](./docs/archive/student_ideas_strategy_consult_brief.md)를 참고하되, 실행 기준은 이 BACKLOG와 구현 계획서로 삼는다.

## 2026-09-02 Track A 런타임 안정화 묶음

TASK-20260902-03 | MUD·인터랙티브 활동 런타임 안정화 | 담당: Codex | 상태: DONE

학생 적용 전후의 진행 불가·잘못된 화면·완료 상태 불일치 문제를 먼저 봉쇄한다. 새 게임성이나 Deep-dive 콘텐츠 확장은 이 묶음에 포함하지 않는다.

- 오답 재시도 단계에 `simulator`가 없을 때 이전 단계의 시뮬레이터·안내·상태가 남을 수 있는 문제
- `gwangbok-flag`·`gwangbok-vote` 캔버스 직접 조작이 시각 상태만 바꾸고 `simulatorProgress`를 갱신하지 않아 선택지가 계속 잠길 수 있는 문제
- 스테이지별 고유 simulator action 상태가 명시적으로 초기화되지 않는 문제
- 후속 분리: 현재 코드와 감사 문서의 수치·시뮬레이터 목록 불일치는 별도 감사 문서 동기화 작업으로 남긴다.

계획서: [`implementation_plan_track_a_runtime_stabilization.md`](./docs/plans/implementation_plan_track_a_runtime_stabilization.md)

완료 조건: 정상·오답·재시도·엔딩 흐름의 상태 정리, 캔버스·대체 버튼 완료 상태 일치, 런타임 회귀 테스트 추가, 전체 정적 품질 게이트 통과, `walkthrough.md` 기록.

## 2026-09-02 Track B Deep-dive 고도화 + Regular 게이팅 감사

TASK-20260902-02~06 | Deep-dive 4종 파일럿 + Regular MUD 게이팅 감사 | 담당: Claude | 상태: DONE(Deep-dive) / 지시서 전달(Regular)

Deep-dive MUD 4종(`deep_prehistoric`/`deep_joseon`/`deep_modern`/`deep_three_kingdoms`) 전체에 다음을 적용했다.

- 판단 스테이지가 자료 확인 없이 화면을 몇 번 터치하면 통과되던 게이팅 없음 버그를 수정하고, 전부 `hotspot-discovery` 이상으로 전환했다.
- `ordered-hotspot` 전환과 함정 단서(다른 시대·주제의 진짜 역사적 사실 1개씩)를 추가해 "아무 단서나 눌러도 통과"를 막았다. 함정 판별 로직은 `js/mudSimulators.js`(`processOrderedHotspot`)에 구현했다.
- `deep_joseon`·`deep_modern`에 전용 배경 삽화 4곳을 새로 그렸고, 나머지는 기존 scene 팔레트를 재사용했다.
- `deep_modern:3`(6·25 전쟁) 스테이지의 레거시 전투 그래픽(`battle-gauge`, "⚔️ 호국 결전")을 제거했다. 서술문은 이미 자료 기반 성찰을 안내하는데 시뮬레이터가 전투 게임화 그래픽을 보여주던 모순이었다.
- 같은 레거시 그래픽 버그를 Regular MUD 9종에 전수 점검해, IF 재시도 스테이지 5곳(`regular_goryeo_founding`·`regular_three_kingdoms`·`regular_three_kingdoms_life`)에서 추가로 발견·수정했다.

결과 보고서: [`claude_track_b_deep_dive_result.md`](./docs/handoff/claude_track_b_deep_dive_result.md)(`deep_joseon`), [`claude_track_b_deep_modern_result.md`](./docs/handoff/claude_track_b_deep_modern_result.md)

이 감사 기준을 Regular MUD 28종에도 대조한 결과, 판단 스테이지 101개 중 41개(약 40%)는 게이팅이 전혀 없고 56개는 순서 없는 `hotspot-discovery`뿐임을 확인했다 — Deep-dive와 같은 문제가 훨씬 넓게 퍼져 있다. 사용자 방향에 따라 Regular는 짧은 활동 시간 설계를 유지하면서 오류만 고치고 인터랙티브 활동 시간을 소폭 늘리는 것으로 범위를 한정해, Codex에게 실행 지시서를 전달했다.

지시서: [`codex_regular_mud_activity_gating_instruction.md`](./docs/handoff/codex_regular_mud_activity_gating_instruction.md) — 상태: `ready-for-codex`. 우선순위 1(게이팅 전무 14개 파일)·우선순위 2(순서 없음 12개 파일) 목록, 원칙, 검증 명령, 완료 조건 포함.

## 학생 현장 체험 피드백 (2026-09-01)

학생들이 직접 체험한 뒤 다음과 같은 반응을 남겼다.

상세 아이디어 정리: [`student_feedback_idea_note.md`](./docs/archive/student_feedback_idea_note.md)

- 긍정: 재미있다는 반응이 있었고, 활동 자체의 흥미도는 확인됨.
- 난이도·정답 추론: 긴 문장을 고르면 정답처럼 보이며, 전반적으로 너무 쉽다는 의견이 있음. 선택지 길이와 정답 위치·표현의 단서를 점검하고, 자료를 읽고 판단해야 풀 수 있도록 난이도 개선을 검토한다.
- 유물 활용: 획득한 유물로 추가 행동을 하거나 성장할 수 있는 기능 아이디어가 필요함.
- 경쟁 요소: 유물 컬렉션을 활용해 친구들과 경쟁할 수 있는 모드 아이디어가 제안됨. 경쟁의 교육적 안전성, 협력 대안, 개인정보·점수 공개 범위를 함께 설계한다.
- 역사 타이쿤: 역사 시대·마을·국가를 운영하는 ‘역사 타이쿤’ 확장 활동 아이디어가 제안됨. 기존 Regular MUD와의 범위·학습 목표 중복을 먼저 검토한다.
- 오타·문맥 제보: 1단원 3차시 `regular_neolithic`에서 ‘신석기’ 관련 오류가 제보되었다. ‘신석기’ 표기 자체는 정상이었고, 2단계 토기·3단계 의생활 흐름에 맞지 않던 네 개의 설명 문구를 정렬해 해결했다.

### 후속 검토 항목

1. **P1 — 선택지 문장 품질 보정**: 감사·1차 보정 완료. 전체 124개 결정 단계 중 정답이 오답 평균보다 10자 이상 긴 단계 34개, 모든 오답보다 긴 단계 114개가 남아 있다. 후속 보정은 교사 검토 후 진행하며, 상세 결과는 [`choice_bias_audit.md`](./docs/audits/choice_bias_audit.md) 참조.
2. **P1 — 유물 활용 시스템 기획**: 유물 조합·전시·복원·교환 등 학습과 연결되는 사용처를 설계한다.
3. **P2 — 유물 기반 친구 경쟁/협력 모드 기획**: 실시간 네트워크 없이 가능한 비교·협력 방식부터 검토한다.
4. **P2 — 역사 타이쿤 확장 활동 기획**: 대상 시대, 핵심 자원, 역사적 제약, 예상 활동 시간을 정의한다.
6. **P1 — 최소 플레이 진단 로그 설계**: 서버·계정 없이 `mudId`, `stageId`, 단계·시뮬레이터·선택·완료 시각, 정답 여부, 재시도 횟수만 기록하는 방안을 설계한다. 개인정보·장기 추적은 금지한다.
7. **P2 — 유물 2개 기반 역사적 추론 프로토타입**: 해금 유물 2개를 관찰·비교·주장·근거로 연결하는 3~5분 활동을 설계하고, 기존 도감·미니게임 재사용 범위를 확인한다.
8. **P2 — 콘텐츠 정합성 lint 설계**: 구조 오류는 Node/Python 검사로, narrative·choices·evidence·simulator·reward의 의미 정합성은 AI·사람 검토로 분리한다.
9. **P2 — 에이전트 작업 claim 규칙**: TASK ID·담당 역할·상태(DOING/DONE)를 작업 시작 전에 기록하고, 같은 파일 동시 수정과 중복 구현을 방지한다.
10. **P1 — Vercel 배포 경로 검토**: 현재 GitHub Pages를 유지한 채 정적 구조가 Vercel에서 동일하게 작동하는지 확인하고, 실제 이전 여부는 별도 결정한다.
11. **P1 — Supabase `play_events` 설계**: 익명 세션 UUID와 최소 이벤트 필드, RLS 정책, 보관 기간을 설계한다. 프로젝트·테이블·코드 구현은 설계 승인 후 진행한다.
12. **P2 — 선택 탐험 단서 실험**: 기존 MUD 한 편에 선택 탐험 1개를 추가하는 최소 설계를 만들고, 추가 단서 발견과 근거 공유가 실제로 발생하는지 관찰한다.
13. **P2 — 역할 기반 협동 역사 MUD 파일럿·종이 리허설** *(상태: in-progress, 막 1 준비)*: 첫 후보는 선사 시대(구석기·신석기·청동기·고조선)이며, 1차는 막 1 구석기 역할 카드·정보 공유·모둠 선택을 종이로 시험한다. 한산도는 해당 차시 학습 시점의 후속 후보로 유지한다. 실시간 서버와 프레임워크 전환은 첫 실험 범위에서 제외한다. 계획: [`implementation_plan_cooperative_prehistory_pilot.md`](./docs/plans/implementation_plan_cooperative_prehistory_pilot.md), 실행표: [`cooperative_prehistory_paper_rehearsal_execution.md`](./docs/handoff/cooperative_prehistory_paper_rehearsal_execution.md)

## 구현 우선순위

현재 구현 순서는 학습 흐름의 안정성, 모바일 사용성, 교육 콘텐츠 품질 순으로 정한다. 아래 순서는 문서 검토 후 정한 다음 구현 후보이며, 실제 코딩은 별도 구현 계획과 사용자 확인 후 시작한다.

1. **P1-01 설계·실제 화면 정합성 대표 MUD 검증** — `regular_paleolithic`을 기준으로 포털→MUD→시뮬레이터→선택지→엔딩 흐름과 세로형 태블릿 레이아웃을 대조한다. *(완료: 820×1180 Chrome 점검 통과)*
2. **P1-02 Regular 활동 시간·무작위 탭 내성** — 실제 학생 활동 시간과 잔여 구조 후보를 검토한다. *(주요 5개 MUD 반영·대표 브라우저 회귀 완료; 반복 탭 구조 감사 40개 후보, 활동 시간 감사 보완 신호 16종은 별도 지표; 2026-09-01 1단원 2·3차시 연속 활동은 4분 이내 완료 관찰, 전체 학생 측정은 계속 필요)*
3. **P1-03 IF 스테이지 교육적 품질** — 6개 단계의 교육적 문장을 검토한다. *(문장 보강·Codex/Claude 검토·사용자 최종 승인 완료; 후속 품질 검토는 별도 backlog로 관리)*
4. **P2-01 접근성·상태 표현** — 실제 보조기기와 색상 독립 상태 표현을 확인한다. *(정적·Chrome 키보드 검증 완료, 실제 기기 확인 대기)*
5. **P2-03 MUD 등록 경로 단순화** — 보조 MUD 노출과 태블릿 확인을 마무리한다. *(primary 경로·중복 차시 브라우저 확인 완료)*
6. **P3-01 브라우저·기기 회귀 점검** — 지원 기기와 브라우저별 정기 점검을 수행한다.

### 현재 선정된 첫 구현 계획

- 대상: `P1-01`, `regular_paleolithic` 대표 수직 슬라이스
- 계획서: [`implementation_plan_design_alignment_vertical_slice.md`](./docs/plans/implementation_plan_design_alignment_vertical_slice.md)
- 상태: `completed` — 정적·브라우저 대표 흐름 검증 완료
- 구현 시작 조건: 계획 범위와 검증 결과에 대한 사용자 확인

### P1-02 첫 구현 계획

- 대상: `regular_independence` 및 `regular_modern_open` 각 1~3단계의 비장면 `text-reading`·`battle-gauge`·`culture-touch` 활동
- 계획서: [`implementation_plan_tap_resistance_batch.md`](./docs/plans/implementation_plan_tap_resistance_batch.md)
- 상태: `in-progress` — 주요 코드 반영·대표 브라우저 검증 완료, 실제 학생 시간 측정 대기
- 원칙: 장면이 있는 단계와 기존 좌표는 이번 묶음에서 변경하지 않는다.

### P1-03 IF 스테이지 1차 구현 계획

- 대상: 설명이 짧고 자료·비교 단서가 부족한 IF 단계 6개
- 계획서: [`implementation_plan_if_stage_quality_batch.md`](./docs/plans/implementation_plan_if_stage_quality_batch.md)
- 상태: `completed` — 문장 보강·Codex/Claude 검토·사용자 최종 승인 완료

### P2-01 접근성·상태 표현 1차 계획

- 계획서: [`implementation_plan_accessibility_state.md`](./docs/plans/implementation_plan_accessibility_state.md)
- 상태: `in-progress` — 정적 반영 완료, 실제 보조기기 확인 대기

### P2-03 MUD 등록 경로 단순화 계획

- 계획서: [`implementation_plan_registration_single_source.md`](./docs/plans/implementation_plan_registration_single_source.md)
- 상태: `in-progress` — 인덱스 단일 경로·primary/supplementary·주요 브라우저 확인 완료, 보조 노출·태블릿 확인 대기
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
- 구조 선별 결과는 [`if_stage_audit.md`](./docs/audits/if_stage_audit.md)를 기준으로 삼고, 실제 문장 수정은 교사 검토 후 단계별로 진행한다.

### P2 — 유물·보상 설명 교육적 검수

- 유물 카드 설명의 사실 범위, 출처, 5학년 수준의 문장 난이도를 검수한다.
- 구조·표현 신호는 [`artifact_audit.md`](./docs/audits/artifact_audit.md)를 기준으로 확인한다.

### P2 — Regular MUD 등록 경로 단순화

- `app.js`의 레거시 조건문 fallback을 유지할 필요와 제거 조건을 검토한다.
- `_index.json`의 등록 차시 기준을 화면 표시 번호로 통일한 뒤 단일 등록원 전환 여부를 결정한다.
- 중복 매칭 차시는 `primary`와 `supplementary`를 구분한 뒤 포털 기본 버튼은 `primary` 하나만 사용한다.
- 계획서 [`implementation_plan_registration_single_source.md`](./docs/plans/implementation_plan_registration_single_source.md)의 순서에 따라 인덱스 계약·검증을 먼저 확정한다.

### P3 — 미확인 브라우저·기기 회귀 점검

- 변경된 시뮬레이터 장면과 터치 흐름을 지원 브라우저·태블릿에서 정기적으로 육안 확인한다.
- 실행 기준: [`BROWSER_REGRESSION_CHECKLIST.md`](./BROWSER_REGRESSION_CHECKLIST.md)

### P2 — 감사 보고서 출력 경로 정합성

- 문제: `scripts/10_audit_if_stages.py`와 `scripts/11_audit_artifacts.py`가 루트의 `if_stage_audit.md`·`artifact_audit.md`를 생성하지만, `BACKLOG.md`와 `project_context.md`는 `docs/audits/` 경로를 기준 문서로 가리킨다. 검증 실행 뒤 루트에 untracked 보고서가 남는다.
- 영향: 감사 결과의 기준 경로가 불명확해지고, 문서 재배치 이후 링크와 생성 산출물이 분리된다.
- 예상 변경 범위: 두 스크립트의 `REPORT` 경로, 기존 감사 문서의 보존·재생성 위치, 관련 링크의 실제 파일 존재 여부를 함께 점검한다.
- 원칙: 경로를 하나로 정한 별도 계획과 사용자 확인 후 수정하며, 감사 결과의 내용·판정 기준은 이 항목에서 변경하지 않는다.
