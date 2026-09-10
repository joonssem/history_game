# 트랙 2 지시서 — 「대조실」

- 창 이름: **대조실** (slug `artifact-site-lens`)
- 한 줄 정의: 유물 두 개를 비교하던 활동을 **유물과 유적을 함께 다루는 사료 대조 활동**으로 확장한다.
- 작성: Opus 5 기획 세션 (2026-09-10)
- 기준 커밋: `origin/main` + 본 지시서가 포함된 커밋
- 담당 모델: Sonnet 5
- 권장 브랜치: `feat/artifact-site-comparison`
- 권장 worktree: `.worktrees/claude-artifact-site`

## 0. 이 창이 만지는 파일 (소유권)

**소유(단독 수정 가능)**
- `data/artifactComparisons.json`
- `js/artifactComparison.js`
- `js/encyclopedia.js`
- `TEACHING_artifact_comparison.md`

**조건부**
- `index.html` — **자기 파일의 캐시버스터 줄만** 수정한다. 현재 261번 줄 `js/artifactComparison.js?v=20260910-sitelinks1`, 260번 줄 `js/encyclopedia.js?v=20260909-detective1`. 다른 줄은 건드리지 않는다.
- `css/style.css` — 이 활동 전용 클래스만 추가한다. 기존 규칙을 수정하지 않는다.

**읽기만 (수정 금지)**
- `js/miniGames.js` (트랙 3 소유), `js/mud*.js` (트랙 1 소유), `data/artifacts.json`

`js/encyclopedia.js`는 트랙 3도 읽는다. **쓰기는 이 창만** 한다. 기존 함수 시그니처를 바꾸지 말고 추가만 한다.

## 1. 검증된 현재 상태 (2026-09-10 실측)

- 비교 페어 **9개**, 유물 마스터 데이터 **36개**(`data/artifacts.json`).
- 활동 흐름: 관찰 → 근거 카드 선택 → 빈칸 주장 완성 → 결과 비교. 결과 화면은 "정답/오답" 표현을 쓰지 않고 학생 생각을 먼저 요약한 뒤 학계 관점을 병치한다.
- 진입점은 **MUD 클리어 직후 제안 카드 하나뿐**이다. 도감에서 직접 시작할 수 없다.
- **`site` 필드는 이미 존재한다.** `artifactA.site` / `artifactB.site`에 국가유산포털 링크와 확인 메모가 들어 있다. 다만 현재 쓰임은 `siteLinksHtml()`(`js/artifactComparison.js:135`)이 **결과 화면 하단에 링크를 붙이는 것뿐**이다.

`site` 보유 현황:

| 페어 | A | B |
|---|---|---|
| `cmp_pottery_1` | O 서울 암사동 유적 | O 부여 송국리 유적 |
| `cmp_crown_1` | O 경주 대릉원 일원 | O 고령 지산동 고분군 |
| `cmp_crown_2` | O 공주 무령왕릉과 왕릉원 | O 경주 대릉원 일원 |
| `cmp_paleo_neo_1` | O 연천 전곡리 유적 | X |
| `cmp_metal_tech_1` | O 부여 송국리 유적 | X |
| `cmp_ceramics_1` / `cmp_ceramics_2` / `cmp_folk_paintings_1` / `cmp_science_1` | X | X |

## 2. 이 트랙의 핵심 설계 판단

**유적은 유물을 하나 더 늘리는 것이 아니라, 비교 축을 하나 늘리는 것이다.**

- 유물 → 개별 물건. 묻는 것: 기술, 용도, 소유자, 양식
- 유적 → 장소. 묻는 것: 규모, 배치, 주변 관계 → **몇 명이 살았나, 어떤 권력이 있었나, 어디에 자리 잡았나**

따라서 비교 유형이 셋이 된다.

| 유형 | 예시 | 학생이 하는 사고 | 상태 |
|---|---|---|---|
| 유물 vs 유물 | 빗살무늬 토기 vs 민무늬 토기 | 기술·양식의 변화 | 구현됨(9개) |
| **유적 vs 유적** | 암사동 움집터 vs 고창 고인돌 | 정착과 계급의 등장 | **신규** |
| **유물 ↔ 유적** | 빗살무늬 토기 ↔ 암사동 유적 | **유물을 맥락으로 되돌리기** | **신규** |

세 번째가 교육적으로 가장 강하다. 학생은 지금 유물을 "카드"로 모으는데, **그 유물이 원래 어디에 있던 것인지**를 되묻는 활동이 없다. 유물 비교 활동의 원래 가설("보상으로 받은 유물을 역사 자료로 다시 쓰게 한다")을 한 단계 더 밀어붙이는 방향이다.

## 3. 작업 순서

### P0 — 출처 규칙부터 정한다

지금 `sourceNote`에 "개별 소장품번호 확인하지 못함", "이용조건 확인 못 함"이 누적되고 있다. 유적은 박물관 소장품번호가 아예 없으므로 유물과 같은 기준을 쓸 수 없다.

`docs/plans/artifact_site_source_policy.md`를 작성한다. 포함할 것:
- 유물: 국립중앙박물관 소장품번호 + `relicId` + 공공누리 유형
- 유적: 국가유산포털 `ccbaCpno` + 지정 종별(사적 등) + 확인 날짜
- **확인하지 못한 항목을 추측으로 채우지 않는다**는 규칙과, 그 경우 데이터에 한계를 명시하는 방식
- 이 활동은 실물 사진을 쓰지 않으므로 이미지 이용조건은 기능상 영향이 없다는 점을 명시

이 문서를 먼저 만들고, 이후 모든 신규 데이터가 이 규칙을 따른다.

### P1 — 도감에서 직접 진입 (학생 요청, 미해결)

`EXPERIMENTS.md` `EXP-002`에 기록된 학생 요청이다. "유물 모음(도감)에서 바로 연결될 수 있냐"고 물었고 교사가 보류했다.

- `js/encyclopedia.js`의 도감 화면에, 해금 유물이 임계값을 넘고 아직 보지 않은 비교가 있으면 **학생이 원할 때 직접 시작**할 수 있는 진입점을 추가한다.
- 기존 MUD 클리어 직후 제안은 그대로 둔다. 두 경로가 같은 `seenArtifactComparisons` 상태를 공유해야 한다.
- 이미 본 비교를 **다시 볼 수 있게** 할지는 별도 판단이다. 다시 보기를 허용한다면 `seen` 상태와 분리해 재제안이 발생하지 않도록 한다.

### P2 — `site`를 링크에서 비교 대상으로 승격

1. `site`에 비교에 쓸 수 있는 속성을 추가한다. 링크만으로는 비교가 불가능하다. 최소한 유물의 `traits`에 대응하는 구조가 필요하다 — 예: 규모, 구조·배치, 주변 환경, 함께 나온 것.
2. 기존 `siteLinksHtml()`의 동작(결과 화면 링크)은 **유지**한다. 이미 운영 중이고 출처 표시 역할을 한다.
3. 새 비교 유형을 데이터로 표현할 수 있게 스키마를 확장한다. 기존 9개 페어가 스키마 변경으로 깨지지 않아야 한다.

### P3 — 신규 페어 제작

**최대 4개까지만** 만든다. 페어 수를 늘리는 것이 목표가 아니다.

1차 후보(모두 이미 `site` 정보가 있거나 확보하기 쉬운 것):
- **유물 ↔ 유적**: 빗살무늬 토기 ↔ 서울 암사동 유적 — "이 그릇은 어떤 곳에 있었나"
- **유적 vs 유적**: 서울 암사동 유적 vs 고창 탁자식 고인돌 — 움집이 모인 마을과 거대한 무덤. 사람 수와 권력의 차이
- 나머지 2개는 P0의 출처 규칙을 통과한 것 중에서 고른다.

각 페어는 **기존 9개와 다른 해석 유형**이어야 한다. 기존 유형은 기술 변화, 가치관 변화, 사회 격변에 따른 양식 변화, 정치 체제의 차이, 무덤 주인을 아는지 여부다.

`unlockThreshold`와 `requiredArtifactNames`는 **시대 순서를 지키도록** 설정한다. 2026-09-08에 "청자·분청사기 페어가 삼국시대 MUD 직후 등장"하는 버그가 있었고, 시대 구간별로 임계값을 분리해 고쳤다. 같은 실수를 반복하지 않는다.

## 4. 하지 말 것

- 실물 사진 추가. 학생 요청이 있었지만 저작권·용량·유지보수 부담과 함께 저울질할 사안이며 아직 결정되지 않았다(`EXP-002`).
- 페어 5개 이상 추가.
- 출처를 확인하지 못한 유적을 추측으로 채우기.
- `js/miniGames.js`, `js/mud*.js` 수정.
- "정답/오답" 표현 도입. 이 활동은 학생 생각을 먼저 요약하고 학계 관점을 병치하는 톤을 유지한다.
- 점수·순위·경쟁 요소 추가.

## 5. 완료 판정

- P0 출처 규칙 문서가 있고, 신규 데이터가 전부 그 규칙을 따른다.
- 도감 진입점으로 활동을 시작할 수 있고, MUD 클리어 경로와 `seen` 상태를 공유한다.
- 신규 페어가 **로컬 정적 서버에서 실제로 4단계 끝까지 플레이**되고, 결과 화면의 두 톤 분기(근접/차이)가 모두 재현된다.
- 시대 구간별로 `getEligibleComparison()`을 호출해 **같은 시대 페어만 제안되는지** 확인한다.
- 기존 9개 페어가 스키마 확장 후에도 정상 동작한다(회귀).
- 콘솔 `error`/`warning` 0건.
- `BACKLOG.md`와 `EXPERIMENTS.md` `EXP-002`에 결과를 기록한다.

## 6. 검증 명령

```bash
node --check js/artifactComparison.js
node --check js/encyclopedia.js
python scripts/01_validate_game_data.py
python scripts/06_validate_static_assets.py
git diff --check
```

`scripts/01_validate_game_data.py`는 `data/artifactComparisons.json`을 검증 대상으로 포함한다. 스키마를 확장하면 이 스크립트도 함께 갱신한다.

## 7. 시작 명령

```bash
git worktree add .worktrees/claude-artifact-site -b feat/artifact-site-comparison origin/main
cd .worktrees/claude-artifact-site
cat docs/handoff/claude_track2_artifact_site_instruction.md
cat js/artifactComparison.js
python -c "import json;d=json.load(open('data/artifactComparisons.json',encoding='utf-8'));print(len(d));print(list(d[0].keys()))"
grep -n "EXP-002" -A 20 EXPERIMENTS.md
```

이 문서와 `BACKLOG.md`, `EXPERIMENTS.md`, `TEACHING_artifact_comparison.md`가 충돌하면 덮어쓰지 말고 충돌 지점을 먼저 보고한다.
