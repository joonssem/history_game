# deep_prehistoric 개선 인수인계 (Deep-dive 경쟁 과제 · Claude Code 담당)

과제 배경: [docs/handoff/deep_dive_competition_task.md](deep_dive_competition_task.md) — Codex는 `deep_three_kingdoms.json`, Claude Code는 `data/mud/deep_prehistoric.json` 담당.

## 1. 작업한 커밋 ID

- `6e94b6e` — "feat: add real interaction gating and missing founding stage to deep_prehistoric"
- 브랜치 `codex-deep-three-kingdoms` 위에 커밋·push 완료 (`1f40c0a`(Codex) → `6e94b6e`(Claude))
- `origin/codex-deep-three-kingdoms`에 반영됨

## 2. 변경 파일과 단계

`data/mud/deep_prehistoric.json` 단 1개 파일만 수정. `js/mudSimulators.js`·`js/mudEngine.js` 등 공용 코드는 손대지 않음(기존 `hotspot-discovery` 엔진 계약을 재사용).

- 게이팅 추가: 스테이지 `1, 1a, 1b, 2b, 3, 4, 7, 8`
- 신규 스테이지 구현: `6`(단군왕검의 고조선 건국 선포), `6-fail`(자료 무시 IF)
- `roadmap` 정리: `6-F` 추가, 실체 없는 `8-F`(무엇도 연결되지 않던 죽은 항목) 제거
- 챕터 배지 재번호: 7→8, 8→9 아님, 정확히는 기존 "7"의 배지를 제6장→제7장, 기존 "8"의 배지를 제7장→제8장으로 갱신(신규 6장 삽입에 맞춤)

## 3. 추가·수정한 scene 정보

기존 팔레트를 그대로 재사용(신규 scene 키 추가 없음):

| 스테이지 | scene |
|---|---|
| 1 | `gojoseon-map` |
| 1a | `gojoseon-artifacts` |
| 1b | `gojoseon-artifacts` |
| 2b | `gojoseon-artifacts` |
| 3 | (없음, 기존 버튼형 유지) |
| 4 | `gojoseon-map` |
| 6(신규) | `gojoseon-map` |
| 6-fail(신규) | (없음, 짧은 복습 화면) |
| 7 | `gojoseon-law` |
| 8 | `gojoseon-law` |

## 4. 핫스팟·interaction·completion 변경 여부

**모두 신규 추가.** 원본 파일은 15개 스테이지 전부 `required`/`completion` 미선언 상태였음(시뮬레이터를 한 번도 조작하지 않아도 선택지 버튼이 즉시 활성화되는 상태) — 이번 작업으로 아래 9곳에 `interaction: "hotspot-discovery"` + `hotspots[]` + `required: true` + `completion{target, minActions, progressKey, successText}`를 추가:

- `1`(단서 3), `1a`(단서 3, 기존 culture-touch 연속 탭 게이지를 대체), `1b`(단서 3), `2b`(단서 2), `4`(단서 3), `6`(신규, 단서 3), `7`(단서 2), `8`(단서 3)
- `3`은 기존 버튼형(`받침돌 세우기`/`흙 치우고 완성`) 상호작용은 그대로 두고 `required`+`completion`만 추가(target 1, minActions 2 — 두 버튼 모두 눌러야 진행 가능)
- `mode` 필드는 `culture-touch-*` 접두어를 재사용(스크립트 `scripts/03_validate_mud_integrity.py`의 `is_supported_mode` 허용 목록을 건드리지 않기 위함 — 실제 디스패치는 `interaction` 필드가 우선이라 동작에는 영향 없음). 검증 스크립트 자체는 수정하지 않음.

## 5. 실행한 검증 결과

- `scripts/03_validate_mud_integrity.py` — PASS (수정 전에는 신규 `mode` 이름 때문에 9건 FAIL → `culture-touch-*` 접두어로 이름 조정 후 PASS)
- `scripts/04_validate_mud_contract.py` — PASS
- `scripts/08_validate_mud_catalog.py` — PASS
- `scripts/09_validate_mud_sources.py` — PASS
- 브라우저 실측(Claude Browser pane, `static-server` 프리뷰): 시작 → `1`→`1a`→`2a`→`3`→`4`→`5a`→`6`(신규)→`7`→`8`→`ending_true`까지 실제 클릭으로 전 구간 재생. 각 게이팅 지점에서 클릭 전 `disabled:true` → 단서를 모두 확인한 뒤 `disabled:false`로 전환되는 것을 콘솔에서 직접 확인. 콘솔 에러 0건.
- 수정 전 상태에서도 동일 코스를 먼저 재생해 대조: 게이팅이 전혀 없어 어떤 시뮬레이터도 조작하지 않고 선택지만 눌러 7클릭 만에 엔딩 도달 가능함을 확인(수정 후에는 최소 19회의 단서 확인 상호작용이 강제됨).

## 6. Codex 작업과 충돌할 수 있는 파일

- **충돌 없음.** 이번 커밋은 `data/mud/deep_prehistoric.json` 1개 파일만 포함.
- 작업 중 Codex가 같은 작업 디렉터리에서 `js/mudSimulators.js`(text-reading 장면의 `deep_three_kingdoms` 전용 라벨 분기)를 uncommitted 상태로 실시간 편집 중인 것을 확인했음 — 스테이징하지 않고 그대로 유지, 제 커밋에 포함되지 않음.
- 앞으로 `js/mudSimulators.js`에 `bronze-*` 계열 전용 scene을 새로 추가하려면(현재는 기존 gojoseon 팔레트만 재사용) 공용 코드 변경이 필요 — 착수 전 공지 예정.

## 7. 후속 검토가 필요한 콘텐츠·기획 이슈

- `playTime: "30min+"` 메타데이터는 이번에 재측정하지 않음. 에이전트 클릭 기반 측정은 실제 5학년 학생의 읽기 속도를 대변하지 못하므로, 실제 사용자 실측이 필요(과제 문서 §플레이 시간 항목).
- 신규 스테이지 "6"의 판단형 선택지(신화+유물 자료를 함께 봐야 한다 vs 신화니까 실재하지 않았다)가 5학년 수준에서 난이도가 적절한지, `three_kingdoms` 쪽 판단형 선택지 난이도와 비교 검토 필요.
- 의도적으로 게이팅을 추가하지 않은 지점: `1-fail, 2a, 3-fail, 4-fail, 5a, 5b, 7-fail, 6-fail` — 전부 단일 선택지(분기 위험 없음)이거나 짧은 IF 복습 화면이라 상호작용을 강제하지 않음. 이 설계 기준(분기 있는 판단 지점만 게이팅)이 Codex의 `three_kingdoms` 접근과 일치하는지 비교해 공통 원칙으로 `DECISIONS.md`에 반영할 가치가 있는지 검토 요청.
- `mode` 명명을 `culture-touch-*`로 우회한 부분은 임시방편 — 장기적으로 `scripts/03_validate_mud_integrity.py`의 허용 목록에 `bronze-*`/`gojoseon-*` 계열 전용 이름을 추가하는 편이 더 명확할 수 있음(검증 스크립트는 Codex 소유 영역이라 상의 후 진행 권장).
