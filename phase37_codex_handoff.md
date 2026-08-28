# Phase 37 완료 보고 — Codex 전달용

- 작성: Claude (Sonnet 5)
- 작성일: 2026-08-28
- 대상 Phase: Phase 37 — 조선 6종 20개 활동 장면 사양 구현
- 커밋: `1658b5d` (로컬 커밋 완료, **push는 사용자 요청으로 보류 중** — 원격 반영 전)

---

## 1. 변경한 커밋 ID

`1658b5d` — `feat: add contextual scenes for Joseon founding/folk/silhak/status/sejong/economy (Phase 37)`

원래 로드맵 문서(`plan_scene_phase34_roadmap.md`)의 "최종 커밋은 Codex" 방침은 이번 Phase 지시로 갱신되어, Phase 단위로 Claude가 직접 커밋했습니다. push는 사용자 확인 후 진행 예정입니다.

## 2. 변경한 MUD 파일과 단계

| 파일 | 단계 |
|---|---|
| `data/mud/regular_joseon_founding.json` | 1, 2, 3 |
| `data/mud/regular_joseon_folk.json` | 1, 2, 3 |
| `data/mud/regular_joseon_silhak.json` | 1, 2, 3, 4 |
| `data/mud/regular_joseon_status.json` | 1, 2, 3 |
| `data/mud/regular_sejong.json` | 1, 2, 3 |
| `data/mud/regular_joseon_economy.json` | 1, 2, 3, 4 |

각 파일에서 지정된 단계의 `simulator` 블록에 `"scene"` 키 한 줄만 `"mode"` 다음 줄에 추가했습니다. `instruction`/`infoText`/`feedback`/`narrative` 등 문구는 한 글자도 수정하지 않았습니다. 이미 완료된 4단계 evidence scene(`joseon-founding-evidence`, `joseon-folk-evidence`, `joseon-status-evidence`, `sejong-evidence`)은 건드리지 않았습니다.

## 3. 추가한 scene 20개

| 위치 | scene 키 |
|---|---|
| 건국 1 | `hanyang-site-selection` |
| 건국 2 | `gyeongbokgung-naming` |
| 건국 3 | `hanyang-gates-pavement` |
| 서민문화 1 | `kim-hongdo-studio` |
| 서민문화 2 | `pansori-performance` |
| 서민문화 3 | `talchum-dance` |
| 실학 1 | `hongdaeyong-globe` |
| 실학 2 | `hwaseong-geojunggi` |
| 실학 3 | `donghak-yongdamjeong` |
| 실학 4 | `silhak-summary` |
| 신분제 1 | `hopae-registration` |
| 신분제 2 | `jungin-medicine` |
| 신분제 3 | `commoner-harvest` |
| 세종 1 | `hunminjeongeum-lab` |
| 세종 2 | `chiljeongsan-observatory` |
| 세종 3 | `angbuilgu-street` |
| 경제 1 | `ianbeop-farming` |
| 경제 2 | `sangpum-crops` |
| 경제 3 | `sangpyeongtongbo-market` |
| 경제 4 | `hanyang-commerce-summary` |

`js/mudSimulators.js`의 `drawConfiguredSceneBackground`에 20개 `if` 분기를 추가했습니다(기존 Phase 33~36 스타일과 동일한 압축 단일 라인 포맷, `card()` 미사용, 별도 palette 항목 불필요 — 20개 전부 hotspots 없는 게이지형이라 `card()`용 팔레트 딕셔너리 대상이 아님).

**구현 중 실제 브라우저 캔버스로 20개 전부 렌더링해 육안 검수**했고, 그 과정에서 3건을 수정했습니다:
- `kim-hongdo-studio`: 씨름하는 두 사람의 자세가 웃는 얼굴처럼 보여, 머리를 벌리고 몸통이 교차하며 다리가 다시 벌어지는 구도로 다시 그림(구도 사양은 그대로, 좌표만 조정).
- `commoner-harvest`: 벼 이삭 사선이 배경 색과 겹쳐 거의 안 보이던 것을 대비되는 어두운 색으로 조정.
- `sangpum-crops`: 밭 이랑 줄무늬 색이 하늘 그라데이션 바닥 색과 완전히 같아 안 보이던 버그를 수정(그라데이션 바닥 색을 밝은 톤으로 변경).

## 4. 핫스팟 좌표·상호작용 계약 변경 여부

**없음.** 대상 20개 단계는 원래 `hotspots` 자체가 없는 게이지형(`type: "info"` 또는 `"gauge"`)이므로, 좌표·`interaction`·`completion.target`/`minActions`을 전혀 건드리지 않았습니다.

## 5. 실행한 검증 결과

**표준 검증 스크립트 9종 — 전부 PASS**
- `01_validate_game_data.py`, `02_fix_missing_next.py`, `03_validate_mud_integrity.py`, `04_validate_mud_contract.py`, `05_test_simulator_runtime.js`, `06_validate_static_assets.py`, `07_audit_activity_duration.py`, `08_validate_mud_catalog.py`, `09_audit_tap_resistance.py`, `09_validate_mud_sources.py`
- `node -c` 문법 검사: `app.js`, `mudEngine.js`, `mudSimulators.js` 전부 통과

**스모크 테스트 2종 (임시 스크립트, 세션 scratchpad에서 실행 후 폐기 — 저장소에는 포함하지 않음)**
- (a) 신규 scene 키 20개 전부 `drawConfiguredSceneBackground`에서 `true` 반환, `ctx.setLineDash`가 `[]`로 복원됨을 확인, 미지의 키/undefined는 `false` 반환(레거시 폴백 유지) 확인
- (b) `scene` 미선언 `economy-farm`/`economy-market` 합성 요청은 기존 동전 placeholder(`常平通寶`)를 그대로 렌더링 — 회귀 없음. `scene` 선언 시에는 신규 장면으로 정상 전환됨을 확인

**JSON↔JS scene 키 교차 검사**: 총 **81개**(기존 61 + 신규 20) 완전 일치, 양쪽 다 orphan 없음.

## 6. Codex 작업과 충돌 가능성이 있는 공유 JSON 파일

이번 Phase가 건드린 6개 파일:
`regular_joseon_founding.json`, `regular_joseon_folk.json`, `regular_joseon_silhak.json`, `regular_joseon_status.json`, `regular_sejong.json`, `regular_joseon_economy.json`

- **`regular_joseon_economy.json`**, **`regular_joseon_silhak.json`**: 세션 시작 시점에 이미 Codex의 `playTime` 필드 수정(`"5-10min"` → `"10min"`)이 로컬 워킹트리에 커밋되지 않은 채 남아 있었습니다. Git hunk 단위로 분리 스테이징하여 **이번 커밋(`1658b5d`)에는 `scene` 추가 4줄만 포함**시켰고, `playTime` 변경분은 손대지 않고 워킹트리에 uncommitted 상태로 그대로 남겨뒀습니다. Codex가 별도로 확인 후 커밋하면 됩니다.
- **`regular_joseon_economy.json`은 특히 주의**: 로드맵에서 Codex의 P1(완료 조건 재설계) 대상이 될 가능성이 있다고 미리 언급된 파일입니다. 이번 Phase는 해당 파일의 `mode`/`type`/`completion`/`choices` 등은 전혀 건드리지 않고 `scene` 키 4줄만 추가했으므로, P1 작업과 직접 충돌하지는 않을 것으로 예상하지만 병합 시 확인이 필요합니다.

## 7. 추가로 확인이 필요한 사항 (Opus/Codex 재검토 권장)

- **`regular_joseon_silhak.json` 3단계 서술 불일치**: `location`("경주 용담정")·`infoText`·`feedback`은 동학·인내천·평등을 가리키는데, `narrative` 본문은 홍대용의 혼천의·천문학을 서술합니다(원본 데이터 불일치로 추정). 이번 Phase는 지시에 따라 **infoText 기준으로 장면(`donghak-yongdamjeong`)만 완성**했고 JSON 문구는 전혀 수정하지 않았습니다. `narrative` 필드 자체를 수정할지는 콘텐츠 오너(Codex/사용자) 판단이 필요합니다.
- `ipad_ux_regression_report.md`는 Codex 문서 운영 체계에 따라 이번 Phase부터 Claude가 작성하지 않았습니다. P3(기기·브라우저 회귀 점검)과 내용이 겹칠 수 있으므로, 위 §5 검증 결과를 참고해 반영 여부를 Codex가 판단해 주세요.

## 8. 건드리지 않은 것 (명시적 확인용)

- `README.md`, `walkthrough.md`, `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `agents.md`, `ipad_ux_regression_report.md`, `scripts/03_validate_mud_integrity.py`, `scripts/09_audit_tap_resistance.py` — Codex의 기존 로컬 변경분이 있었다면 이번 세션에서 전혀 손대지 않았습니다.
- `activity_duration_audit.md` — 검증 스크립트 실행의 부수 효과로 워킹트리에 변경이 생겼으나(`playTime` 필드 갱신 반영), 이번 Phase 범위가 아니라고 판단해 `git checkout`으로 되돌려 커밋에 포함하지 않았습니다.
- 핫스팟 좌표, `interaction` 계약, `completion.target`/`minActions` — 전혀 수정 없음(§4 참고).

## 9. index.html 캐시 버전

`js/mudSimulators.js?v=20260827-p14` → `?v=20260828-p15` (Claude 담당 범위, 시뮬레이터 자산 변경에 따른 캐시 무효화).

## 10. 다음 범위

Phase 38(근현대 5종 15개: `independence`, `japanese_rule_1`, `japanese_rule_2`, `modern_open`, `post_war`)만 남았습니다. 착수 전 Opus가 이번과 같은 형식의 사양표를 작성할 예정입니다.

## 11. Codex 회신 (2026-08-28)

Codex가 본 보고를 검토하고 다음과 같이 확인·회신했습니다.

- `1658b5d` 커밋의 조선 6종 20개 장면 추가와 `js/mudSimulators.js` 렌더러 변경, 그리고 `scene` 키만 추가하고 핫스팟 좌표·interaction·completion·단계 구조를 변경하지 않은 점을 확인함.
- `regular_joseon_economy.json`·`regular_joseon_silhak.json`의 기존 `playTime` 변경분(`5-10min` → `10min`)은 Codex 작업으로 유지(§6에서 언급한 대로 이번 Phase 커밋에서 제외한 것이 맞았음). Regular 기준은 10분 이내, 설계 목표 약 9분.
- P1 완료 조건 검토 시 이번에 추가된 20개 scene 단계의 `scene`/`hotspots`/`interaction`/`completion.target`/단계 구조를 보호 대상으로 유지하겠다고 확인. 해당 단계의 완료 조건·핫스팟 구조 변경이 필요해지면 파일·단계·변경 필드·장면 영향 여부를 먼저 공유하기로 함.
- §7에서 지적한 `regular_joseon_silhak.json` 3단계 narrative-infoText 불일치는 콘텐츠 검토 항목으로 등록. 장면(`donghak-yongdamjeong`)은 수정하지 않고 narrative 정합성만 별도 검토 예정.
- `ipad_ux_regression_report.md`와 활동 시간 감사(`activity_duration_audit.md`) 반영은 Codex 담당으로 계속 진행.
- Codex 쪽에서 `scripts/09_audit_tap_resistance.py`(무작위 탭 조기 종료 위험 자동 선별)를 보정했고, 기존 무결성·계약·카탈로그·런타임 검증도 재통과 확인.
- Phase 37 커밋은 로컬 `main`에만 있고 `origin/main`에는 아직 push되지 않은 상태임을 서로 확인 — 사용자 확인 전까지 양측 모두 push하지 않기로 함.
