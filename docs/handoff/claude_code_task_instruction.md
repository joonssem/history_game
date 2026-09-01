# Claude Code 작업 재개 지시문

아래 지시에 따라 시뮬레이터 장면 작업을 재개해 주세요.

## 기준 문서

- 전체 진행·승인·커밋 절차: `claude_code_reactivation_brief.md`
- 최신 학습 내용·단계별 장면 기준: `claude_code_latest_learning_directive.md`
- 반드시 위 두 문서를 먼저 읽고, 현재 `main`과 원격 상태를 확인한 뒤 착수하세요.

## 작업 목표

Phase 38 근현대 5종 15개 단계의 공통 evidence 장면을 단계별 고유 장면으로 교체합니다.

대상 파일과 단계:

- `data/mud/regular_independence.json`: 1, 2, 3
- `data/mud/regular_japanese_rule_1.json`: 1, 2, 3
- `data/mud/regular_japanese_rule_2.json`: 1, 2, 3
- `data/mud/regular_modern_open.json`: 1, 2, 3
- `data/mud/regular_post_war.json`: 1, 2, 3

고유 scene 키:

`tapgol-declaration`, `aunae-market-rally`, `shanghai-provisional-government`, `gendarme-rule-ordinance`, `land-survey-office`, `secret-society-oath`, `imperial-subject-policy`, `memorial-candlelight`, `korean-language-society`, `ganghwa-treaty-hall`, `jejungwon-postal`, `hanyang-tram-street`, `busan-shanty-rebuild`, `tent-classroom`, `dmz-reunion-peace`.

## 착수 순서

1. `regular_japanese_rule_2:2` — `memorial-candlelight`를 먼저 구현하고 육안 확인하세요. 이 단계는 피해 재현이 아니라 동원 기록·피해자 증언·기억 활동을 살피는 추모·자료 장면이어야 합니다.
2. 나머지 근현대 14개를 다음 순서로 구현하세요: `independence` → `japanese_rule_1` → `japanese_rule_2` → `modern_open` → `post_war`.
3. 조선 20개는 신규 제작하지 마세요. 기존 scene을 유지하고, 필요할 때만 렌더링 회귀를 확인하세요. 특히 `regular_sejong:1~3`의 최신 hotspot 의미와 좌표 정합성을 확인하되 데이터를 바꾸지 마세요.

## 보호 규칙

- `simulator.scene` 외에는 기존 JSON 계약을 수정하지 마세요.
- `simulator.hotspots`, `simulator.interaction`, `simulator.completion.target`, 단계 ID·단계 구조를 변경하지 마세요.
- `instruction`, `infoText`, `feedback`, `narrative`, `glossary`를 수정하지 마세요.
- 변경이 불가피한 필드가 발견되면 즉시 중단하고 파일명·단계 ID·필드·이유·장면 재조정 필요 여부를 Codex에 먼저 보고하세요.
- `README.md`, `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `agents.md`, `walkthrough.md`, `activity_duration_audit.md`는 수정하지 마세요.

## 장면 설계 기준

- 최신 내용은 `claude_code_latest_learning_directive.md`의 단계별 표를 그대로 따르세요. 과거 Phase 38 초안보다 최신 지시서가 우선입니다.
- `regular_joseon_silhak:3`은 동학·용담정·인내천·평등과 사람의 존엄을 기준으로 유지합니다. 과학·홍대용 장면으로 되돌리지 마세요.
- 근현대 장면에는 무기·군인·폭력·구타·구속·부상·군함·대포를 그리지 마세요.
- 일장기·욱일기·신사 도리이 등 가해 주체의 국가·정치 상징을 넣지 마세요.
- 강제 이송·수용·피해 현장을 재현하지 말고 기록물·추모·자료 탐색으로 표현하세요.
- 인물은 필요할 때 동일 크기 실루엣으로만 표현하고 실존 인물을 영웅화하지 마세요.
- 배경에 학습 문장을 직접 넣지 마세요. 기존 UI의 instruction과 feedback이 텍스트를 담당합니다.
- `setLineDash` 사용 후 반드시 `[]`로 복원하고, 상단 UI 영역을 침범하지 마세요.
- `battle-gauge` 레거시 분기는 삭제하지 마세요. scene 선언으로 올바른 장면에 라우팅하세요.
- 팔레트 딕셔너리에 불필요한 항목을 추가하지 마세요.

## 구현 규칙

- `js/mudSimulators.js`의 기존 `drawConfiguredSceneBackground` 스타일을 유지하세요.
- 신규 scene은 기존 렌더러 구조에 최소 범위로 추가하세요. 전체 리팩터링이나 `sceneRenderers` 맵 전환은 하지 마세요.
- 각 JSON은 기존 형식을 유지하고, 필요한 scene 값만 교체하세요. 재직렬화로 파일 전체 포맷을 바꾸지 마세요.
- `memorial-candlelight`와 `gendarme-rule-ordinance`에는 장면을 그렇게 설계한 근거를 코드 주석 한 줄로 남기세요.
- 착수 전 `index.html`의 현재 캐시 버전을 확인하고, 시뮬레이터 JS 변경 시 필요한 경우에만 한 단계 올리세요.

## 검증

다음 검증을 실행하세요.

```powershell
git fetch
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/06_validate_static_assets.py
python scripts/07_audit_activity_duration.py
python scripts/08_validate_mud_catalog.py
python scripts/09_audit_tap_resistance.py
python scripts/09_validate_mud_sources.py
node scripts/05_test_simulator_runtime.js
node --check js/app.js
node --check js/mudEngine.js
node --check js/mudSimulators.js
git diff --check
```

추가로 다음을 확인하세요.

- 신규 15개 scene 키가 모두 렌더러에서 인식되는지
- `scene` 15개에 대해 `setLineDash`가 `[]`로 복원되는지
- scene 없는 합성 요청의 `battle-gauge`, `text-reading`, `culture-touch`가 기존 레거시 분기를 계속 타는지
- JSON과 JS의 scene 키가 정확히 일치하는지
- 15개 장면을 실제 브라우저에서 모두 렌더링하고, 특히 `memorial-candlelight`를 단독으로 육안 확인했는지
- 검증 스크립트가 `activity_duration_audit.md`를 변경했다면 그 부수 변경을 커밋에서 제외했는지

## 완료 보고와 커밋

완료 후 다음 항목을 포함해 Codex에 보고하세요.

1. 커밋 ID와 커밋 메시지
2. 변경 파일·단계
3. 기존 scene → 새 scene 목록
4. `hotspots`·`interaction`·`completion.target`·단계 구조 변경 여부
5. 실행한 검증과 결과
6. 15개 장면 육안 검수 결과
7. Codex 작업과 충돌할 수 있는 파일·필드
8. 후속 검토가 필요한 콘텐츠·기획 이슈

검증이 모두 통과하면 Claude가 Phase 단위로 직접 커밋하세요. 푸시는 사용자 확인 전까지 하지 마세요. Codex가 커밋 diff와 검증 결과를 최종 승인한 뒤 원격 반영 여부를 확인합니다.
