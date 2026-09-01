# Phase 38 Codex 핸드오프 — 근현대 5종 15개 고유 장면

작성: Claude (Sonnet 5)
작성일: 2026-09-01
기준 지시서: `claude_code_task_instruction.md` / `claude_code_reactivation_brief.md` / `claude_code_latest_learning_directive.md` (Codex 작성), 원 사양서 `implementation_plan_scene_phase38.md` (Opus 작성)

## 1. 커밋 ID와 커밋 메시지

- 커밋: `4a3c5774e745087521e9ac9af565e1575e8ec200` (`main`, 아직 push 안 함 — 사용자 승인 대기)
- 요약: `feat: replace Phase 38 common evidence scenes with unique modern-history scenes`
- 전체 메시지는 `git show --stat 4a3c577` 참고. 변경 파일 7개, +191/-16.

## 2. 변경 파일과 단계

| 파일 | 변경 단계 | 비고 |
|---|---|---|
| `data/mud/regular_independence.json` | 1, 2, 3 | 4단계(`independence-evidence`)는 유지 |
| `data/mud/regular_japanese_rule_1.json` | 1, 2, 3 | 4단계(`colonial-1910s-evidence`)는 유지 |
| `data/mud/regular_japanese_rule_2.json` | 1, 2, 3 | 4단계(`colonial-1930s-evidence`)는 유지 |
| `data/mud/regular_modern_open.json` | 1, 2, 3 | 4단계(`modern-open-evidence`)는 유지 |
| `data/mud/regular_post_war.json` | 1, 2, 3 | 4단계(`post-war-evidence`)는 유지 |
| `js/mudSimulators.js` | `drawConfiguredSceneBackground`에 15개 `if` 블록 추가 | 팔레트 딕셔너리·`sceneRenderers` 리팩터링·`card()` 호출 없음 |
| `index.html` | `?v=20260828-p15` → `?v=20260901-p16` | 다른 스크립트 태그는 손대지 않음 |

각 JSON은 `"mode"` 다음 줄의 `"scene"` 값만 1줄 교체했습니다(재직렬화 없음, `instruction`/`infoText`/`feedback`/`narrative`/`glossary` 미수정).

## 3. 기존 scene → 새 scene 목록

| 단계 | 기존(공통 evidence) | 신규(고유 키) |
|---|---|---|
| `independence:1` | `independence-evidence` | `tapgol-declaration` |
| `independence:2` | `independence-evidence` | `aunae-market-rally` |
| `independence:3` | `independence-evidence` | `shanghai-provisional-government` |
| `japanese_rule_1:1` | `colonial-1910s-evidence` | `gendarme-rule-ordinance` |
| `japanese_rule_1:2` | `colonial-1910s-evidence` | `land-survey-office` |
| `japanese_rule_1:3` | `colonial-1910s-evidence` | `secret-society-oath` |
| `japanese_rule_2:1` | `colonial-1930s-evidence` | `imperial-subject-policy` |
| `japanese_rule_2:2` | `colonial-1930s-evidence` | `memorial-candlelight` ⚠️최우선 |
| `japanese_rule_2:3` | `colonial-1930s-evidence` | `korean-language-society` |
| `modern_open:1` | `modern-open-evidence` | `ganghwa-treaty-hall` |
| `modern_open:2` | `modern-open-evidence` | `jejungwon-postal` |
| `modern_open:3` | `modern-open-evidence` | `hanyang-tram-street` |
| `post_war:1` | `post-war-evidence` | `busan-shanty-rebuild` |
| `post_war:2` | `post-war-evidence` | `tent-classroom` |
| `post_war:3` | `post-war-evidence` | `dmz-reunion-peace` |

**최우선 교정 3건 처리 결과** (사양서 §1-1): `independence:2`, `japanese_rule_1:2`, `japanese_rule_2:2`가 더 이상 legacy `battle-gauge`(붉은 원 + "⚔️ 호국 결전 / 승기를 잡으세요")를 타지 않습니다. 특히 `japanese_rule_2:2`(강제 동원·위안부 피해자 추모)는 인물·탄광·이송 없이 촛불 4개 + 꽃 + 기록 문서만 그리는 `memorial-candlelight`로 교체했고, 브라우저 실캔버스 렌더로 단독 확인했습니다(§6 첨부 이미지 설명 참고).

## 4. 핫스팟·interaction·completion·단계 구조 변경 여부

**변경 없음.** `hotspots`, `interaction`, `completion.target`, 단계 ID·구조, `required` 등은 15개 단계 모두 원본 그대로입니다. `js/mudSimulators.js`도 기존 `if (scene === ...) { ...; return true; }` 압축 스타일 그대로 15개 블록만 추가했고, 레거시 `battle-gauge`/`text-reading`/`culture-touch` 분기와 팔레트 딕셔너리는 수정하지 않았습니다.

## 5. 실행한 검증과 결과

표준 스크립트 전부 PASS(활동 시간 감사의 `activity_duration_audit.md` 부수 변경은 커밋 전 `git checkout --`으로 되돌림):

| 스크립트 | 결과 |
|---|---|
| `python scripts/01_validate_game_data.py` | PASS |
| `python scripts/03_validate_mud_integrity.py` | PASS (기존 경고 1건 — 무관) |
| `python scripts/04_validate_mud_contract.py` | PASS |
| `python scripts/06_validate_static_assets.py` | PASS |
| `python scripts/07_audit_activity_duration.py` | 실행됨(감사 리포트, PASS/FAIL 게이트 아님); 부수 변경은 revert |
| `python scripts/08_validate_mud_catalog.py` | PASS |
| `python scripts/09_audit_tap_resistance.py` | exit 0; Phase 38 대상 5개 파일은 목록에 없음(탭 저항 이슈 없음) |
| `python scripts/09_validate_mud_sources.py` | PASS |
| `node scripts/05_test_simulator_runtime.js` | PASS |
| `node --check js/app.js` / `mudEngine.js` / `mudSimulators.js` | 전부 OK |
| `git diff --check` | 이상 없음(CRLF 경고만, 실패 아님) |

추가로 임시 스모크 스크립트(커밋 대상 아님, `scripts/`에 없음)를 작성해 확인:

- **스모크(a)**: 신규 15개 키 전부 `drawConfiguredSceneBackground`가 `true` 반환, `setLineDash` 사용한 `korean-language-society`·`dmz-reunion-peace` 포함 전부 `[]` 복원 확인. 미지 키(`not-a-real-scene`)는 `false`.
- **스모크(b)**: `scene` 미지정 상태에서 `drawSim()`을 `battle-gauge`/`text-reading`/`culture-touch`로 호출 — 셋 다 예외 없이 레거시 분기 도달 확인(합성 시뮬레이터 객체 사용).
- **JSON↔JS 교차 검사**: 전체 고유 `scene` 키 97개, JSON·JS 완전 일치(양쪽 다 97). **사양서의 "81+15=96" 예상과 1개 차이** — 재확인 결과 Phase 38 착수 시점 기존 고유 scene 키가 81개가 아니라 **82개**였습니다(사양서 집계 오차로 추정, Phase 38 작업으로 생긴 차이는 아님). 신규 15개는 기존 키와 충돌 없이 정확히 더해졌습니다.

## 6. 15개 장면 육안 검수 결과

실제 브라우저(로컬 정적 서버, `http://localhost:8791`)에서 `js/mudSimulators.js`를 로드하고 `MudSimulators.drawConfiguredSceneBackground`를 실캔버스(`#mn-canvas`)에 15개 모두 그려 3×5 몽타주로 확인했습니다. 이어서 `memorial-candlelight`는 별도 확대 이미지로 단독 재확인했습니다.

결과 요약:

- 15개 전부 렌더링 성공, 상단 `y<0.16` 영역 비움, 도형 4~6개 내외 유지.
- `memorial-candlelight`: 어두운 배경 + 촛불 4개(온기 포인트만 허용) + 꽃 1송이 + 기록 문서 1장. **인물·탄광·전선·이송·구속·피해 장면·특정 추모 조형물·붉은 전투색 전부 없음.** 이전 legacy `battle-gauge`의 "⚔️ 호국 결전" 그래픽이 완전히 사라졌음을 확인.
- `tapgol-declaration`/`aunae-market-rally`: 인물 실루엣은 전부 동일 크기·얼굴 없음, 깃발은 흰 사각형 + 중앙 붉은 원 하나로만 표현(태극 정밀 묘사 없음). `aunae-market-rally`는 legacy 전투 그래픽 교정 대상이었으나 이제 시장 좌판 + 균등 배치 실루엣만 표시.
- `gendarme-rule-ordinance`: 빈 교실 + 법령 문서 + 붉은 도장 자국만 있고 헌병·칼 도상 없음.
- `land-survey-office`: legacy 전투 그래픽 교정 대상이었으나 이제 항공뷰 필지 격자 + 측량 삼각대만 표시(수치·인물 없음).
- 나머지 10개(`secret-society-oath`, `imperial-subject-policy`, `korean-language-society`, `ganghwa-treaty-hall`, `jejungwon-postal`, `hanyang-tram-street`, `busan-shanty-rebuild`, `tent-classroom`, `dmz-reunion-peace`, `shanghai-provisional-government`)도 무기·군인·가해국 상징·피해 재현이 없음을 확인했습니다. `dmz-reunion-peace`는 통일 완성 도상(합쳐진 지도·국기) 없이 진행형(끊어진 점선 울타리 + 마주 선 실루엣 + 비둘기)으로 표현했습니다.

렌더 검수에 쓴 임시 정적 서버 설정(`.claude/launch.json`)과 스모크 스크립트는 검수 후 삭제/미포함했고, 커밋 diff에는 포함되지 않았습니다.

## 7. Codex 작업과 충돌할 수 있는 파일

- 착수 직전 `git status` 기준으로 이미 작업 트리에 `BACKLOG.md`, `implementation_plan_tap_resistance_batch.md`, `walkthrough.md`가 수정되어 있었고, 작업 도중 `implementation_plan_accessibility_state.md`, `implementation_plan_sensitive_history_interactions.md`도 추가로 수정된 상태를 확인했습니다(Codex 병행 작업으로 추정). **이 5개 파일은 전혀 건드리지 않았고 이번 커밋(`4a3c577`)에도 포함하지 않았습니다.** Codex가 별도로 커밋할 대상으로 보입니다.
- 저장소 루트의 `claude_code_task_instruction.md`, `claude_code_reactivation_brief.md`, `claude_code_latest_learning_directive.md`(Codex 작성으로 표기됨)는 untracked 상태 그대로 두었습니다. 이 핸드오프 문서에도 커밋하지 않았습니다 — 필요하면 Codex가 정리해 주세요.
- `activity_duration_audit.md`는 `07_audit_activity_duration.py` 실행으로 부수 변경되었으나 커밋 전 `git checkout --`으로 되돌렸습니다.
- Phase 38 대상 파일 5개(JSON)는 이번 커밋으로 종결되었으므로 이후 Codex의 P1(완료 조건 재설계) 작업이 같은 파일의 `simulator` 블록을 만질 경우 `scene` 필드 위치(각 "mode" 다음 줄)에 유의해 주세요.

## 8. 후속 검토가 필요한 콘텐츠·기획 이슈

1. **사양서 집계 오차**: `implementation_plan_scene_phase38.md`가 "기존 81개 + 신규 15개 = 96개"로 명시했으나 실측 결과 기존 82개였습니다(§5 참고). 계획 문서 자체의 사소한 집계 오류로, 이번 Phase 결과에는 영향 없습니다. `DECISIONS.md`/`project_context.md` 반영 시 정정 참고해 주세요.
2. **근현대 장면 공통 금지 사항(사양서 §1-4)**과 **`infoText` 없을 때 대체 근거 순서(§1-2)**를 신규 설계 원칙으로 확립했습니다. 두 항목 모두 `DECISIONS.md` 반영 후보라고 원 사양서가 지목했으니, Codex가 문서 통합 시 검토해 주세요.
3. **장면 사업 종결**: Phase 38 완료로 `scene` 미선언 필수 시뮬레이터 단계가 0개가 되었고, 전체 고유 scene 키는 97개(계획 대비 +1, 위 §1 사유)입니다. `README.md`/`walkthrough.md` 등 공용 문서 통합은 Codex 담당이므로 별도로 반영 부탁드립니다.
4. Phase 38 자체에서는 Opus 재호출이 필요한 사례(사양서 §8: 시각적 구분 불가, 형태 반복, 새로운 콘텐츠 적합성 판단)가 발생하지 않았습니다.

## 9. Codex 승인 절차 안내

`claude_code_reactivation_brief.md` §4에 따라 다음을 확인해 주시면 됩니다.

1. `git show --stat 4a3c577`로 변경 범위 확인.
2. 위 §3 표와 JSON 5개 파일의 `scene` 값을 대조.
3. 위 §5의 검증 스크립트 재실행.
4. 브라우저에서 특히 `memorial-candlelight`와 대표 정상·오답 흐름 확인.
5. 통과 시 공용 문서에 최종 확인 기록. **push는 사용자 확인 전까지 보류합니다.**
