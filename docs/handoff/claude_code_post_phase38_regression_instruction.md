# Claude Code 다음 작업 지시 — Phase 38 이후 장면 회귀 점검

Phase 38 구현은 완료되었으므로 신규 장면을 추가하거나 기존 장면을 재설계하지 말고, 아래 독립 회귀 점검만 수행해 주세요.

## 기준

- 현재 기준 커밋: `88ed08c` 및 부모 구현 커밋 `4a3c577`
- Codex의 미커밋 문서 변경과 untracked 지시서는 보존하세요.
- `README.md`, `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `agents.md`, `walkthrough.md`, `activity_duration_audit.md`를 수정하지 마세요.
- JSON, `js/mudSimulators.js`, `index.html`을 수정하지 마세요. 문제를 발견해도 먼저 보고만 하세요.
- 커밋·push하지 마세요.

## 점검 범위

1. 현재 데이터의 전체 고유 `scene` 키 수를 집계하세요. 기대값은 97개입니다.
2. 모든 JSON scene 키가 `js/mudSimulators.js`의 `drawConfiguredSceneBackground`에서 처리되는지 확인하세요.
3. `scene` 미선언 합성 요청에 대해 `battle-gauge`, `text-reading`, `culture-touch` 레거시 분기가 계속 동작하는지 확인하세요.
4. Phase 38 신규 15개를 포함해 전체 scene 렌더링을 실제 브라우저 캔버스에서 확인하세요.
5. 특히 다음 장면을 별도 확인하세요.
   - `memorial-candlelight`: 촛불·꽃·기록 문서 중심인지, 피해 재현·군인·무기·전투 그래픽이 없는지
   - `aunae-market-rally`: 인물 실루엣 크기와 배치가 균등한지
   - `land-survey-office`: 수치·그래프 없이 필지와 측량 도구로 표현되는지
   - `dmz-reunion-peace`: 통일 완성 지도·국기·정치 구호가 없는지
   - `korean-language-society`: 점선 경로를 사용한 뒤 `setLineDash([])`가 복원되는지
6. Phase 37 조선 20개 장면과 기존 62개 장면에 회귀가 없는지 확인하세요.
7. 브라우저 콘솔 오류, 빈 캔버스, 상단 UI 침범, 핫스팟 가림, 대비 문제를 기록하세요.

## 검증 명령

가능한 범위에서 다음을 실행하세요.

```powershell
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
python scripts/06_validate_static_assets.py
python scripts/08_validate_mud_catalog.py
python scripts/09_validate_mud_sources.py
node scripts/05_test_simulator_runtime.js
node --check js/mudSimulators.js
git diff --check
```

활동 시간 감사는 `activity_duration_audit.md`를 덮어쓸 수 있으므로 실행하지 마세요. 필요하면 별도 임시 복사본에서 실행하세요.

## 보고 형식

점검 후 다음 내용을 Codex에 보고하세요.

1. 점검 기준 커밋과 브라우저 URL
2. 전체 scene 수와 JSON↔JS 누락·중복 결과
3. Phase 38 신규 15개 장면별 렌더링 결과
4. 대표 5개 장면의 콘텐츠 적합성 결과
5. Phase 37 및 기존 장면 회귀 결과
6. 콘솔 오류·빈 캔버스·레이아웃 문제
7. 실행한 검증 명령과 결과
8. 수정이 필요하다고 판단한 항목은 파일명·scene 키·문제·수정 제안으로만 제시

이번 점검의 목적은 승인 후 안정성 확인이다. 수정이 필요해 보여도 직접 고치지 말고 Codex에 보고해 주세요.
