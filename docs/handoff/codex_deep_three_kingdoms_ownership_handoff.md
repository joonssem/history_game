# Codex 핸드오프 — `deep_three_kingdoms.json` 처리 + Deep-dive 재설계 관련 PRD/DECISIONS 결정

상태: `ready-for-codex`
작성: Claude (Sonnet), 사용자 확인 후 작성 요청
관련: [`docs/plans/implementation_plan_deep_dive_redesign.md`](../plans/implementation_plan_deep_dive_redesign.md), [`docs/handoff/deep_dive_competition_task.md`](deep_dive_competition_task.md), [`docs/handoff/claude_deep_dive_session_continuation.md`](claude_deep_dive_session_continuation.md)

## 0. 배경

2026-09-01 Deep-dive 경쟁 과제(Codex = `deep_three_kingdoms.json`, Claude = `deep_prehistoric.json`)의 결과를 사용자가 비교했다. 사용자는 "Codex보다 Claude의 결과물이 낫다"고 판단했고, 그 뒤 세션들이 다른 트랙(협동 MUD, 유물 비교)으로 옮겨가면서 이 결정의 **구체적 범위**가 확정되지 않은 채 일주일 넘게 방치되어 있었다. 2026-09-09 사용자에게 재확인한 결과, 다음과 같이 역할을 나누기로 확정했다.

- **`deep_three_kingdoms.json`은 Codex가 계속 처리한다.** Claude가 인수하지 않는다.
- **`deep_joseon.json`/`deep_modern.json`은 Claude가 감사·개선에 착수한다.**
- 이 문서는 그중 Codex 담당분(`deep_three_kingdoms.json` 처리 방향 + PRD/DECISIONS 관련 결정)을 전달하는 용도다.

## 1-0. 즉시 처리 가능한 작은 항목 하나

`docs/audits/choice_bias_audit.md`(2026-09-07)가 "선택지 정답이 오답보다 10자 이상 길어 자료를 안 읽고도 정답을 찍을 수 있는" 단계 3개를 남겨 뒀다 — `deep_joseon:1`, `deep_three_kingdoms:1`, `deep_three_kingdoms:5`. `deep_joseon:1`은 2026-09-09 Claude가 같은 문서 §2가 쓴 "선택지 단서 인용형 재작성" 기법으로 고쳤다(`scripts/12_audit_choice_bias.py` 재실행으로 확인). **남은 `deep_three_kingdoms:1`·`:5` 2건은 Codex 소관**이니, `deep_three_kingdoms.json`을 다음에 손볼 때 같이 처리하면 좋다. 확인 명령: `python scripts/12_audit_choice_bias.py`.

## 1. `deep_three_kingdoms.json`에 요청하는 것

승부 판단의 근거가 됐던 구조적 격차를 재설계 계획 문서 §2.1에서 확인했다:

| MUD | 스테이지 | 게이팅 있음 | hotspot 있음 | 장식형(`text-reading` 등) |
|---|---:|---:|---:|---:|
| `deep_prehistoric`(Claude, 완료) | 15 | 9 | 8 | 6 |
| `deep_three_kingdoms`(Codex, 진행 중) | 14 | 4 | 2 | 10 |

`deep_prehistoric`에 적용한 패턴을 참고 자료로 남긴다(그대로 베끼라는 뜻은 아니고, Codex가 판단할 기준점):

- 실제 자료를 확인해야만 선택지가 열리도록 게이팅 추가 (`docs/handoff/deep_prehistoric_codex_handoff.md`에 스테이지별 상세 기록).
- 로드맵에는 있지만 실제 스테이지가 없던 항목을 신규 구현.
- `scripts/03~09_validate_mud_*.py` 통과 확인, 브라우저로 전체 클릭 재생 검증.

**다만 아래 §2-1(필수 게이팅 허용 여부)이 아직 결정되지 않았다** — `deep_prehistoric`는 이 결정 없이 먼저 게이팅을 추가해 버렸고, 재설계 계획 문서 자체가 "이것이 PRD와 충돌할 소지가 있다"고 사후에 지적한 상태다. `deep_three_kingdoms`를 손보기 전에 §2를 먼저 판단해 두면 같은 문제를 반복하지 않는다.

## 2. PRD.md/DECISIONS.md 개정이 필요할 수 있는 결정 3건

이 세 가지는 재설계 계획 문서 §8에 이미 정리되어 있고, **PRD.md·DECISIONS.md가 Codex 소유 문서**라 Claude 쪽에서 개정하지 않고 여기서 판단을 요청한다.

### 2-1. Deep-dive에 필수(게이팅) 활동을 허용할 것인가

`PRD.md`의 "필수 문제 수를 늘리지 않는다" 원칙과, `deep_prehistoric`에 이미 적용한 9곳 필수 게이팅이 충돌할 소지가 있다. Deep-dive를 예외로 명시할지, 아니면 게이팅을 선택 탐험 방식으로 되돌릴지 결정이 필요하다.

### 2-2. 여러 단원을 가로지르는 MUD를 `_index.json`에 어떻게 표기할 것인가

재설계 계획 §5에서 제안한 신규 Deep-dive 후보(예: "같은 위기, 다른 선택" — 서희·강감찬·이순신·병자호란·의병, 1~3단원을 가로지름)를 만들려면 현재 `unitId` 단일값 + `lessonNumbers` 배열 스키마로는 표현이 안 된다. 후보 3가지(§8-2 원문 참고: `unitId` 복수 허용 / `unitId: null` + `spansUnits` 신설 / `placement: "supplementary"` 유지)가 제시돼 있다. `scripts/04_validate_mud_contract.py`·`scripts/08_validate_mud_catalog.py`도 함께 바뀌어야 한다.

### 2-3. PRD의 Deep-dive 정의 개정

현재 정의("대단원 또는 여러 차시를 연결하는 확장 탐구")는 시간축을 전제한다. 재설계 계획이 제안하는 "사고축 구획"(시간이 아니라 관통·비교·사료비판 등 사고 구조로 나누기)을 채택한다면, 정의에 "여러 단원을 가로지르는 사고 구조 중심 탐구"를 포함하는 개정이 필요하다.

## 3. 참고만 하면 되는 것 (결정 불필요, Claude가 이미 진행 중)

- `deep_joseon.json`/`deep_modern.json` 구조 감사·개선은 Claude가 착수했다. `deep_three_kingdoms.json`과 겹치지 않으니 조율 불필요.
- 재설계 계획 §5의 신규 Deep-dive 후보 6종은 위 §2-2(스키마)가 정리된 뒤에야 착수 가능한 것들이 섞여 있다. 스키마 결정 전에는 신규 후보 제작을 시작하지 않는다.

## 4. 이 문서가 요청하지 않는 것

- `deep_three_kingdoms.json`을 지금 당장 고치라는 요구는 아니다 — Codex의 우선순위 판단에 맡긴다.
- Claude가 `deep_prehistoric`에서 쓴 패턴을 그대로 따르라는 것도 아니다 — 참고 자료일 뿐, Codex가 다른 접근을 택해도 무방하다.
