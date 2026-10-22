# Codex 실행 지시서 — Regular MUD 게이팅 정합성 개선 + 활동 시간 소폭 확대

상태: `ready-for-codex`
작성: Claude (Sonnet), 사용자 확인 후 실행 요청

## 0. 배경

Deep-dive 4종 MUD를 손보면서(오늘 세션) 두 가지 문제를 고치고 패턴을 확립했다: (1) 자료를 확인하지 않고도 화면을 몇 번 터치하면 바로 선택지가 열리던 "게이팅 없음" 버그, (2) 핫스팟 3개를 아무 순서로나 눌러도 통과되던 "순서 없음" 문제. `js/mudSimulators.js`에 `ordered-hotspot` 인터랙션(`sequence` 배열 강제)과 함정 단서 판별 로직(`sequence`에 없는 핫스팟은 정답으로 안 세고 자체 정정 피드백을 보여줌)을 이미 구현·검증해 두었다(커밋 `8bcce9a` 등).

같은 문제를 Regular MUD 28개 전체에 대조한 결과, **Regular 쪽이 오히려 더 광범위했다**:

- 판단 스테이지 101개 중 **41개(약 40%)는 게이팅이 전혀 없다** — `culture-touch`/`text-reading`/`battle-gauge` 등으로 "화면을 N번 터치"만 있고 자료 확인과 무관하다.
- **56개는 `hotspot-discovery`뿐**이라 3곳을 아무 순서로나 눌러도(순서·함정 단서 없이) 통과된다 — Deep-dive 수정 전 상태와 동일하다.
- 정식으로 `ordered-hotspot`을 쓰는 곳은 `regular_neolithic`/`regular_paleolithic`에 1곳씩뿐이다.

사용자 방향: **Regular는 Deep-dive만큼 만들지 않는다.** 이미 활동 시간이 짧게(5~10분) 설계돼 있고 그 설계를 뒤집을 단계가 아니다. 목표는 두 가지뿐이다 — (a) 오류(게이팅 없음) 수정, (b) 인터랙티브 활동에서 **자료를 조금 더 확인하게** 만들어 활동 시간을 소폭 늘리는 것. Deep-dive의 전용 삽화 제작이나 다단계 사고 흐름까지는 가지 않는다.

## 1. 목표

1. 41개 무게이팅 스테이지를 최소 `hotspot-discovery`(단서 확인 강제) 이상으로 끌어올린다.
2. 이미 `hotspot-discovery`인 56개 스테이지를 `ordered-hotspot`으로 전환해 순서를 강제한다.
3. (여유가 되면) 각 스테이지에 함정 단서 1개씩 추가해 "아무거나 다 눌러보면 통과"를 막는다 — Deep-dive에서 쓴 패턴(진짜 역사적 사실이지만 **다른 시대/주제**인 단서) 그대로 재사용.
4. 이 과정에서 활동 시간이 D-007 상한(10분 이내, 목표 약 9분)을 넘지 않는지 확인한다.

## 2. 지켜야 할 원칙

- 역사적 사실·서사 내용을 새로 추가하거나 바꾸지 않는다. narrative·glossary는 그대로 두고 시뮬레이터 계약만 바꾼다.
- `choices[]`의 `text`/`next`/`correct`/`sound`는 원칙적으로 건드리지 않는다(선택지 문구 품질은 별도 트랙 `implementation_plan_choice_quality_batch.md` 소관이니 섞지 않는다).
- 새 `scene` 전용 삽화는 만들지 않는다. 기존 `js/mudSimulators.js`의 `drawConfiguredSceneBackground` 팔레트에 이미 있는 scene이면 재사용하고, 없으면 범용 hotspot 배경(그림 없음)으로 둔다 — Deep-dive처럼 신규 삽화를 그리는 건 이번 범위 밖이다.
- 완료 조건 계약은 Deep-dive와 동일하게 고정: `required: true`, `completion: { target: N, increment: 1, minActions: N, progressKey: "simulatorProgress", successText: "..." }` (N = 실제 단서 개수, 함정 제외).
- 함정 단서를 추가할 경우 `sequence` 배열에는 넣지 않는다(진짜 단서만). 함정의 `feedback`이 곧 정정 설명이 된다 — `js/mudSimulators.js`의 `processOrderedHotspot`이 `sequence`에 없는 id를 자동으로 함정으로 처리하므로 엔진 수정은 필요 없다.
- 정답 위치는 원본 JSON에서 재배열하지 않는다(런타임 셔플에 맡긴다).
- Regular 활동 시간 상한(D-007, 10분 이내)을 넘기지 않도록, 한 스테이지에 단서를 4개 넘게 넣지 않는다(진짜 단서 2~3개 + 함정 최대 1개 권장).

## 3. 실행 순서

### 3-1. 우선순위 1 — 게이팅이 아예 없는 파일 (13개)

**전체 판단 스테이지가 게이팅 없음(100%)**:
`regular_goryeo_founding`, `regular_goryeo_society`, `regular_gwangbok`, `regular_joseon_economy`, `regular_joseon_founding`, `regular_joseon_silhak`, `regular_myeongnyang`, `regular_three_kingdoms_life`

**대부분 게이팅 없음(75%, 1곳만 기존 hotspot-discovery)**:
`regular_balhae`, `regular_goryeo_culture`, `regular_goryeo_war`, `regular_joseon_folk`, `regular_joseon_status`, `regular_bronze_age`(2/3)

이 14개 파일부터 시작한다. narrative에 이미 서술된 근거(자료·수치·인물 행동 등)를 2~3개 hotspot 단서로 쪼개 `hotspot-discovery`(순서가 중요하면 `ordered-hotspot`)로 전환한다.

### 3-2. 우선순위 2 — `hotspot-discovery`뿐인 파일 (12개, 순서만 추가)

`regular_gojoseon`, `regular_independence`, `regular_independence_army`, `regular_japanese_rule_1`, `regular_japanese_rule_2`, `regular_joseon_diplomacy`, `regular_korean_war`, `regular_modern_open`, `regular_post_war`, `regular_sejong`, `regular_silla`, `regular_three_kingdoms`

기존 핫스팟 3~4개는 그대로 두고 `interaction`을 `ordered-hotspot`으로, 서술문이 암시하는 논리적 순서(원인→상황→결단 등, Deep-dive에서 쓴 방식)로 `sequence` 배열만 추가한다. 새 단서를 만들 필요는 없다.

### 3-3. 마무리 — 이미 부분 적용된 파일

`regular_neolithic`, `regular_paleolithic`은 이미 `ordered-hotspot`이 1곳씩 있다. 나머지 `hotspot-discovery` 스테이지만 3-2와 같은 방식으로 정리한다.

### 3-4. (선택) 함정 단서 추가

시간과 여유가 되면, 위 배치들에 함정 단서를 1개씩 추가한다. Deep-dive에서 쓴 예시 패턴을 그대로 따른다 — 진짜 역사적 사실이되 **이 스테이지의 시대·주제와 명백히 다른 것**을 고른다(예: 조선 후기 스테이지에 신석기 유물, 삼국시대 스테이지에 조선 시대 사건). 필수 아님 — 시간이 부족하면 3-1·3-2만으로 종료해도 된다.

## 4. 검증

각 배치 완료 후:

```bash
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/07_audit_activity_duration.py
node scripts/05_test_simulator_runtime.js
```

- `07_audit_activity_duration.py` 결과가 D-007 상한(10분)을 넘기는 파일이 있으면 해당 파일의 단서 개수를 줄인다.
- 대표 파일 2~3개는 브라우저로 실제 순서 게이팅(잘못된 순서 클릭 시 거부, 올바른 순서 클릭 시 통과)이 작동하는지 확인한다.

## 5. 작업 범위 외

- 선택지 문구 품질·길이 편향 수정 (`implementation_plan_choice_quality_batch.md` 소관)
- 신규 scene 삽화 제작
- Deep-dive 수준의 다단계 사고 흐름(예측→선택 이유→결과) 도입
- `battle-gauge` 안전성(이미 이번 세션에 전수 점검·수정 완료, 재작업 불필요)

## 6. 완료 조건

- [ ] 게이팅 없는 판단 스테이지 41개 → 0개
- [ ] `hotspot-discovery`(순서 없음) 스테이지 56개 → `ordered-hotspot`으로 전환
- [ ] 전체 정적 검증(01/03/04/05) 통과
- [ ] `07_audit_activity_duration.py` 기준 D-007 상한(10분) 초과 파일 0개
- [ ] 대표 파일 브라우저 확인(순서 게이팅 정상 작동)
- [ ] 결과를 `walkthrough.md` 또는 별도 결과 보고서에 기록

## 7. 참고 커밋(패턴 재사용)

- `8bcce9a` — 함정 단서 판별 엔진 로직(`js/mudSimulators.js:processOrderedHotspot`)
- `b0382bb`, `27e0de9`, `4938718` — Deep-dive 4종의 `ordered-hotspot` 전환 사례(순서 설계 방식 참고)
- `b3adfbc` — IF 재시도 스테이지의 `battle-gauge` 안전성 수정(참고용, 재작업 불필요)
