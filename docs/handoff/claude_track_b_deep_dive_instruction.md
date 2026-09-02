# Claude Track B — Deep-dive MUD 고도화 작업 지시서

상태: `ready-for-claude`

## 1. 목적

현재 Deep-dive MUD를 단순히 길게 늘리는 것이 아니라, `자료 관찰 → 자료 비교 → 역사적 판단 → 결과 확인 → 근거 성찰`의 확장 탐구 흐름으로 개선한다.

첫 작업은 네 편 전체가 아니라 `data/mud/deep_joseon.json` 한 편을 파일럿으로 삼는다. 현재 `deep_joseon`은 주요 단계의 시뮬레이터 완료 조건이 대부분 선택 사항이므로, Deep-dive의 실제 학습 깊이와 진행 조건을 검증하기에 적합하다.

## 2. 먼저 읽을 문서

- [`PRD.md`](../../PRD.md)
- [`DECISIONS.md`](../../DECISIONS.md)
- [`USER_FLOWS.md`](../../USER_FLOWS.md)
- [`ROADMAP.md`](../../ROADMAP.md)
- [`data/mud/deep_joseon.json`](../../data/mud/deep_joseon.json)
- [`deep_dive_competition_task.md`](./deep_dive_competition_task.md)
- [`historical_language_audit.md`](../audits/historical_language_audit.md)

## 3. 수정 가능 범위

- 주 대상: `data/mud/deep_joseon.json`
- 결과 보고서: 이 지시서와 별도의 `docs/handoff/claude_track_b_deep_dive_result.md`
- 기존 JSON MUD 계약과 현재 시뮬레이터 모드를 우선 재사용한다.

## 4. 수정 금지 범위

- `js/app.js`
- `js/mudEngine.js`
- `js/mudSimulators.js`
- `data/mud`의 다른 MUD 파일
- `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `ROADMAP.md`, `walkthrough.md`
- Supabase, 로그인, Realtime, 경쟁 기능, 역사 타이쿤 장기 상태

공용 엔진 수정이 꼭 필요하면 직접 수정하지 말고 결과 보고서에 `파일·필요한 인터페이스·영향 범위`를 기록한다.

## 5. 설계 요구사항

1. 각 핵심 판단은 서술문만 읽는 것이 아니라 최소 2개의 자료 단서 또는 비교 단서를 확인해야 충분히 이해되도록 한다.
2. 시뮬레이터는 장식용 반복 클릭이 아니라 해당 역사 판단과 연결되는 관찰·비교·순서·선택 활동이어야 한다.
3. 필수 활동을 선언할 경우 `required`, `completion.target`, `completion.minActions`, `progressKey`, `successText`를 일관되게 작성한다.
4. 오답 경로는 공포·처벌·집단 비하가 아니라 자료의 한계와 다른 결과를 보여 주고 다시 판단하게 한다.
5. 선택지의 위치·길이·구체성만으로 정답이 드러나지 않게 한다.
6. 30분 이상 메타데이터를 전제하지 말고, 정상·빠른 경로·오답 포함 경로의 실제 시간을 각각 측정한다. 활동을 억지로 늘리지 않는다.
7. 엔딩은 단순한 성공 점수가 아니라 자료 종합·부분 해석·재검토 등 서로 다른 학습 결과를 보여 준다.

## 6. 완료 보고서 형식

1. 수정 파일
2. 수정 전·후 단계와 분기 요약
3. 필수 시뮬레이터별 입력·완료 조건·피드백
4. 정상·빠른·오답 포함 실제 플레이 시간
5. 선택지 편향과 자료 근거 여부
6. 초등학교 5학년 적합성 5점 평가
7. 역사적 정합성·정서 안전성 점검
8. 수정하지 않은 문제와 공용 엔진 요청 사항
9. 다음 파일럿에 적용할 수 있는 설계 규칙

## 7. 검증 명령

```text
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/09_validate_mud_sources.py
python scripts/12_audit_choice_bias.py
node scripts/05_test_simulator_runtime.js
node --check js/mudEngine.js
node --check js/mudSimulators.js
```

브라우저 점검이 불가능하면 실행하지 않은 항목과 그 이유를 보고서에 명시한다. 작업 시작 시 `TASK-... | 대상 | 담당: Claude | 상태: DOING`, 종료 시 동일 항목을 `DONE`으로 기록한다.
