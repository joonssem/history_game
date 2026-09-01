# Claude Code 재개 진행 문서 — 조선·근현대 시뮬레이터 장면

작성: Codex  
작성일: 2026-09-01  
기준 커밋: `a0d7735` (`origin/main`과 일치 확인 필요)  
목적: Claude Code가 사용량 한도 중단 이후 장면 작업을 안전하게 재개하도록 현재 범위·순서·승인 절차를 확정한다.

## 1. 역할과 보호 경계

- Claude 담당: `js/mudSimulators.js`, 지정 MUD JSON의 `simulator.scene`, 캔버스 배경·카드·벡터 장면.
- Codex 담당: P1(활동 시간·완료 조건·IF 품질), P2(등록 구조·유물·보상), P3(브라우저·기기 회귀), 공용 운영 문서.
- Claude는 다음 필드를 변경하지 않는다: `simulator.hotspots`, `simulator.interaction`, `simulator.completion.target`, 단계 키·구조, 그리고 장면 렌더링에 영향을 주는 기존 데이터.
- 위 필드 변경이 불가피하면 구현 전에 파일명·단계 ID·변경 필드·이유·장면 재조정 필요 여부를 Codex에 보고하고 대기한다.
- `README.md`, `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `agents.md`, `walkthrough.md`, `activity_duration_audit.md`는 Claude가 직접 수정하지 않는다.

## 2. 최신 데이터 기준 범위 확인

Claude 요청서의 35개 수량과 파일·단계 목록은 현재 데이터와 일치한다.

### 조선 6종 20개

| 파일 | 단계 | 현재 상태 | 재개 지시 |
|---|---:|---|---|
| `regular_joseon_founding.json` | 1~3 | 고유 scene 3개 존재 | 기존 장면 유지·필요 시 렌더링 품질만 점검 |
| `regular_joseon_folk.json` | 1~3 | 고유 scene 3개 존재 | 기존 장면 유지·필요 시 렌더링 품질만 점검 |
| `regular_joseon_silhak.json` | 1~4 | 고유 scene 4개 존재 | 기존 장면 유지. 3단계는 최신 narrative 지시서 준수 |
| `regular_joseon_status.json` | 1~3 | 고유 scene 3개 존재 | 기존 장면 유지·필요 시 렌더링 품질만 점검 |
| `regular_sejong.json` | 1~3 | 고유 scene와 hotspot 계약 존재 | 신규 장면 추가 금지. 최신 hotspot 의미와 장면 좌표 정합성만 점검 |
| `regular_joseon_economy.json` | 1~4 | 고유 scene 4개 존재 | 기존 장면 유지. `completion`·hotspot 계약 변경 금지 |

### 근현대 5종 15개

| 파일 | 단계 | 현재 상태 | 재개 지시 |
|---|---:|---|---|
| `regular_independence.json` | 1~3 | `independence-evidence` 공통 scene, hotspot 계약 존재 | Phase 38 고유 장면으로 교체 |
| `regular_japanese_rule_1.json` | 1~3 | `colonial-1910s-evidence` 공통 scene, hotspot 계약 존재 | Phase 38 고유 장면으로 교체 |
| `regular_japanese_rule_2.json` | 1~3 | `colonial-1930s-evidence` 공통 scene, hotspot 계약 존재 | Phase 38 고유 장면으로 교체 |
| `regular_modern_open.json` | 1~3 | `modern-open-evidence` 공통 scene, hotspot 계약 존재 | Phase 38 고유 장면으로 교체 |
| `regular_post_war.json` | 1~3 | `post-war-evidence` 공통 scene, hotspot 계약 존재 | Phase 38 고유 장면으로 교체 |

차이점은 “scene 미지정 35개”가 아니라, 조선 20개는 완료 상태이고 근현대 15개는 Codex의 P1 반영으로 공통 evidence scene이 선반영된 상태라는 점이다. Phase 38의 15개 고유 키는 다음으로 확정한다.

`tapgol-declaration`, `aunae-market-rally`, `shanghai-provisional-government`, `gendarme-rule-ordinance`, `land-survey-office`, `secret-society-oath`, `imperial-subject-policy`, `memorial-candlelight`, `korean-language-society`, `ganghwa-treaty-hall`, `jejungwon-postal`, `hanyang-tram-street`, `busan-shanty-rebuild`, `tent-classroom`, `dmz-reunion-peace`.

## 3. 착수 순서와 우선순위

1. `regular_japanese_rule_2:2` — `memorial-candlelight`를 최우선으로 구현한다. 현재 자료 탐색·추모 활동에 공통 evidence 장면이 연결되어 있으므로 전투·승리 그래픽이 남지 않았는지 먼저 확인한다.
2. 나머지 근현대 14개 — 파일 순서상 `independence` → `japanese_rule_1` → `japanese_rule_2` → `modern_open` → `post_war`로 진행한다. 각 단계의 최신 학습 내용은 별도 지시서(`claude_code_latest_learning_directive.md`)를 기준으로 한다.
3. 조선 20개 — 신규 제작 대상이 아니다. Claude가 이미 구현한 장면의 회귀·대비·좌표만 점검하며, 데이터 계약은 그대로 둔다.

Codex의 P1 작업과 장면 구현을 강하게 직렬화할 필요는 없다. 다만 Codex가 현재 보호 필드와 학습 내용을 확정한 근현대 15개를 기준으로 작업해야 하므로, 별도 지시서에 명시한 문구·단서와 충돌하는 변경은 먼저 보고한다.

## 4. Claude 완료 후 Codex 승인 절차

Claude는 다음 보고를 제출한다.

- 커밋 ID와 커밋 메시지
- 변경 파일과 단계 목록
- 각 단계의 이전 scene 키 → 새 scene 키
- `hotspots`, `interaction`, `completion.target`, 단계 구조 변경 여부
- `js/mudSimulators.js` 추가 분기 목록과 금지 사항 준수 여부
- 표준 검증 결과, JSON↔JS scene 교차 검사 결과, 합성 레거시 회귀 스모크 결과
- 15개 장면 육안 검수 결과와 캔버스 예외·`setLineDash` 복원 여부
- Codex 파일과 충돌 가능한 파일·필드

Codex는 다음 순서로 승인한다.

1. `git show --stat`와 diff로 변경 범위를 확인한다.
2. 보호 필드와 학습 문구가 지시서와 일치하는지 JSON 전수 대조한다.
3. `01_validate_game_data.py`, `03_validate_mud_integrity.py`, `04_validate_mud_contract.py`, `05_test_simulator_runtime.js`, `06_validate_static_assets.py`, `07_audit_activity_duration.py`, `08_validate_mud_catalog.py`, `09_audit_tap_resistance.py`, `09_validate_mud_sources.py`, `node --check` 3종, scene 스모크 2종을 재실행한다.
4. 브라우저에서 특히 `memorial-candlelight`와 대표 정상·오답 흐름을 확인한다.
5. 통과한 경우 Codex가 공용 문서에 최종 확인을 기록한다. 실패 시 Claude는 해당 Phase를 완료로 보고하지 않고 수정 후 재보고한다.

## 5. 커밋·푸시 주체

이전 합의를 유지한다. Claude가 Phase 단위로 직접 커밋하고, 커밋 ID를 보고한다. 푸시는 사용자 확인 전에는 실행하지 않는다. 사용자가 푸시를 승인하면 Claude가 자신의 Phase 커밋을 push하고, Codex는 원격 반영·diff·검증을 확인한다. Codex는 Claude의 장면 커밋을 재작성하거나 임의로 합쳐 커밋하지 않는다.

## 6. 충돌 방지

- Claude는 Codex 소유 문서와 P1/P2/P3 파일을 수정하지 않는다.
- 공용 JSON에서 장면 외 필드를 만지는 작업은 중단하고 사전 보고한다.
- `index.html` 캐시 버전은 장면 커밋에 포함할 수 있으나, 변경 전 현재 값을 확인하고 diff에 명시한다.
- 검증 스크립트가 `activity_duration_audit.md`를 바꾸면 해당 부수 변경은 커밋에서 제외하고 Codex에 알린다.
