# 고조선 협동 MUD UX 후속 2건 — Codex 전달 문서

작성: Claude (실행·코딩 에이전트) | 날짜: 2026-09-04
대상 파일럿: `cooperative-mud/gojoseon-law/` (독립 정적 페이지, 기존 Regular/Deep-dive MUD 엔진과 무관)

INBOX.md `TASK-20260904-04`(뒤로가기 UX), `TASK-20260904-05` 후속(모둠별 진행 편차 흡수 장치) 두 건을 처리했다. 두 건 모두 사용자 승인 아래 진행했고, 이 문서는 사용자가 Codex에게 전달할 수 있도록 요약한다.

## 1. 작업한 커밋 ID

- `67e53db` feat: add in-app back navigation to Gojoseon cooperative MUD
- `6fb327d` docs: close TASK-20260904-04 back-navigation UX in INBOX
- `c9b1f9f` feat: add optional extra missions for early-finishing groups
- `9cdd040` docs: close TASK-20260904-05 extra-missions follow-up in INBOX

브랜치: `codex-deep-three-kingdoms` (push 완료, origin과 일치)

## 2. 변경 파일과 단계

- `cooperative-mud/gojoseon-law/app.js` — 화면 히스토리 스택(`screenHistoryStack`), `setScreen(id, {recordHistory})`, `updateBackButton()`, `renderScreenContent()` 디스패처, `bindFirstChoices()` 분리, `renderExtraMissions()`, extra-toggle 핸들러 추가.
- `cooperative-mud/gojoseon-law/index.html` — `#nav-row`(뒤로가기 버튼), `#extra-toggle`/`#extra-missions-list`(탐구 완료 화면) 마크업 추가.
- `cooperative-mud/gojoseon-law/scenario.js` — `extraMissions` 배열 3건 추가(정적 텍스트, 역할·법 데이터 구조는 변경 없음).
- `cooperative-mud/cooperative.css` — `.nav-row`/`.back-nav-button`, `.extra-missions*` 스타일 추가.

## 3. 추가·수정한 `scene` 정보

해당 없음. `data/mud/*.json`의 `scene` 필드나 Regular/Deep-dive 씬 팔레트는 건드리지 않았다.

## 4. 핫스팟·interaction·completion 변경 여부

해당 없음. `js/mudEngine.js`, `js/mudSimulators.js`, 시뮬레이터 계약(`simulator_contract.json`) 등 공용 엔진 코드는 이번 작업 범위 밖이며 수정하지 않았다.

## 5. 실행한 검증 결과

- `node --check cooperative-mud/gojoseon-law/app.js`, `node --check cooperative-mud/gojoseon-law/scenario.js` 통과.
- 브라우저(정적 서버, `cooperative-mud/gojoseon-law/index.html`)로 실제 플레이:
  - 5인 모둠·10분형: 역할→최초판단→추가 증거→사건 2→법 만들기→역사 자료 비교→탐구 완료 전 구간에서 뒤로가기→다시 진행 반복, 5분형/10분형 분기 모두 정상 복귀 확인.
  - 5인 모둠·5분형: 완료 화면까지 재생, 추가 미션 토글 펼침/접힘, "기록 지우고 다시 하기" 시 토글·스택 초기화 확인.
  - 두 세션 모두 `read_console_messages`로 콘솔 오류·경고 0건 확인.
- Regular/Deep-dive MUD 대상 파이썬·Node 검증 스크립트(`scripts/0*_validate_*.py`, `scripts/05_test_simulator_runtime.js` 등)는 이번 변경과 무관한 범위라 실행하지 않았다.

## 6. Codex 작업과 충돌할 수 있는 파일

없음으로 판단. `cooperative-mud/` 하위 전체는 이번 세션에서만 다뤘고, Codex가 소유한 Regular MUD 데이터(`data/mud/*.json`)·엔진(`js/*.js`)·공용 관리 문서(`walkthrough.md` 등)는 건드리지 않았다. 다만 같은 브랜치를 공유하므로 병합 전 `git fetch`로 최신 상태 확인을 권장한다.

## 7. 후속 검토가 필요한 콘텐츠·기획 이슈

- INBOX `TASK-20260904-05` 1차 분류 메모에 있던 `단계별 시간 안내`·`모둠 토론 문장틀`·`교사 개입 신호`는 이번 범위에 포함하지 않았다. 필요하면 별도 항목으로 승격 검토.
- 다음 협동 MUD 신규 파일럿(삼국 시조 설화, INBOX `TASK-20260904-06`/`-07`)은 이번 세션에서 착수하지 않았다 — 사용량 제약으로 다음 세션으로 이월. 우선순위·후보 순위는 INBOX.md 871~908행 참고.
- 공용 문서(`walkthrough.md`/`BACKLOG.md`/`DECISIONS.md`/`project_context.md`) 반영은 관례대로 Codex 담당 — 이 핸드오프 문서로 전달만 하고 해당 문서들은 직접 수정하지 않았다.
