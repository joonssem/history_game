# Codex 전달 — Claude 사용량 제한 기간 작업 (2026-09-14)

- 작성: Claude Opus 5 (기획·통합 세션)
- 기준 커밋: `origin/main` `de13948`
- 받는 쪽: Codex
- 배경: Claude 사용량 제한이 다가와 한동안 기획·통합 세션이 멈춘다. 그동안 **사용자 판단이 필요 없고, Claude 트랙 작업과 겹치지 않으며, 결과를 검증할 수 있는 일**만 골랐다.

먼저 읽을 것: [`claude_four_track_session_close_20260911.md`](./claude_four_track_session_close_20260911.md)의 "2026-09-14 갱신" 절, `DECISIONS.md` D-027~D-030.

## 0. 공통 규칙

- **`.worktrees/claude-*` 네 worktree와 그 브랜치는 건드리지 않는다.** Claude 창들이 다음 라운드에 쓴다.
- **판단 대기 항목은 구현하지 않는다**: 설계 문서 4건(`perspective`, 단계 진행형, 스토리 관계, 캔버스 옵션 B), 캔버스 옵션 A 승인, 근거 인벤토리 기본 펼침. 조사·보고만 한다.
- **새 콘텐츠를 만들지 않는다.** 새 MUD 전환, 새 유물 페어, 새 미니게임 없음.
- 사실 확인은 **공식 출처 원문**(국사편찬위원회 우리역사넷, 한국민족문화대백과사전, 국립중앙박물관, 국가유산포털, UNESCO)과 대조한다. 위키백과·블로그는 근거로 쓰지 않는다. 원문을 받아 오지 못하면 "확인 불가"로 적는다.
- 데이터 수정은 아래 T2에서 허용한 범위만 한다. 수정했다면 커밋 전에 검증 명령(§5)을 모두 돌리고, 캐시버스터 규칙을 지킨다(데이터 JSON만 바꿨다면 해당 없음).
- 결과 문서는 `docs/audits/`에 둔다. 항목마다 **재현 경로 또는 근거 URL·확인 날짜**, 판정, 심각도(학생 오학습 / 게임성 / 경미)를 적는다.

---

## T1. 라운드 3 결과 red team 감사 — 우선순위 1

Claude 네 창이 라운드 3에서 만든 것은 **아직 누구도 교차 감사하지 않았다.** 지난 감사(`claude_four_track_red_team_audit.md`)와 같은 방식으로 본다. **코드·데이터는 수정하지 않고 보고만** 한다.

1. **`scripts/13_audit_inquiry_combinatorics.js`가 실제 판정 공간을 빠짐없이 세는가.** 제출 가능한데 열거에서 빠진 상태(예: 한계 선택 해제, 근거 선택 순서, 첫 판단 변경), 반대로 UI에서는 불가능한데 센 상태가 있는지. 스크립트가 출력한 기대값(고려 11/40, 신석기 2/8, 삼국 2/8, 근대 4/24)이 **판정 코드가 바뀌어도 자동으로 따라 바뀌는지, 아니면 하드코딩된 기대값과만 비교하는지**.
2. **`scripts/05_test_simulator_runtime.js`의 D-030 회귀 테스트가 과잉 차단을 잡는가.** 정상 조합 통과 케이스가 충분한지.
3. **`docs/audits/inquiry_pilot_semantic_review.md`의 "빠진 요소 없음" 판정 중 틀린 것이 있는가.** 16관문 중 15관문을 "조치 없음"으로 판정했다. 특히 `map-evidence` 세 편과 `sequence` 세 편의 의미 질문.
4. **근대 1관문 신규 근거 "항구 개방 조항"**(`port-opening-clause`): 조일수호조규 원문의 조항 내용·번호와 서술("부산 외에 두 항구를 20개월 안에 추가로 열어 통상을 허용")이 맞는가.
5. **대조실의 9개 페어 연대 정정**(`56f8013`): 좁힌 연대 표기(예: 신라 금관 "5세기 말~6세기 초로 짐작", 가야 금동관 "6세기 전반", 청자 매병 "12세기경")가 인용한 출처와 실제로 일치하는가.

결과: `docs/audits/round3_red_team_audit.md`. 이전 감사처럼 끝에 요약 표를 둔다.

---

## T2. 공식 출처 대조 보완 — 우선순위 2

라운드 3에서 **출처 규칙을 채우지 못하고 남은 것**이다. 여기는 **확인된 사실 오류에 한해 데이터 수정을 허용**한다.

### T2-1. 원인과 결과 고려 세트 벽란도 순서의 근거 교체

- 연결 공방이 "귀주대첩 → 벽란도 교류 → 몽골 침입·팔만대장경"으로 순서를 바꿨는데, 근거가 **한국어 위키백과**다(`BACKLOG.md` 591행 부근).
- 우리역사넷 또는 한국민족문화대백과에서 **벽란도가 번성한 시기**와 **몽골 침입(1231~) 이전 번성**을 확인할 원문을 찾는다.
- 순서가 맞으면 `BACKLOG.md`에 공식 출처 URL·확인 날짜·인용 문구로 근거를 교체 기록한다. 틀리면 **데이터를 고치지 말고** 보고한다(순서 판단이 뒤집히는 일이라 Claude 확인이 필요하다).

### T2-2. 대조실 원문 미대조 3개 페어

`BACKLOG.md` 135행 부근에 "원문 대조는 안 했으나 헤지되어 있어 유지"로 남은 `cmp_folk_paintings_1`, `cmp_paleo_neo_1`, `cmp_metal_tech_1`의 수치·연도·단정 표현을 공식 출처와 대조한다.

- **명백한 사실 오류**(수치·연도·소장품 번호가 원문과 다름)는 `data/artifactComparisons.json`의 해당 문장만 고치고, 그 페어의 `sourceNote` 끝에 "2026-09-XX Codex 원문 대조: … 정정"을 남긴다.
- **해석·표현의 적절성**(학계 합의 여부, 초등 수준 적합성)은 고치지 말고 보고만 한다.

결과: `docs/audits/source_crosscheck_followup_20260914.md` (T2·T3 공용).

---

## T3. `art_12` 판옥선 시대 표시 조사 — 우선순위 3 (보고만)

`data/artifacts.json`의 `art_12`(조선 수군 판옥선·천자총통, 임진왜란 1592~1598)가 `era: "조선 후기"`다. 연결 공방은 `조선 전기`가 맞다고 제안했고, 기획 세션은 경계 사례라 보류했다. **결정은 사용자가 한다.** Codex는 판단 재료만 만든다.

- 2022 개정 초등 5학년 사회 교과서·교육과정에서 임진왜란이 **어느 단원·시기 구분**에 들어가는지 확인한다(`data/curriculum_standards_2022.json`, `data/history_curriculum_48_lessons.json`, `primary_data/`의 교육과정 자료 우선).
- 같은 앱 안의 다른 조선 유물(`art_22`, `art_26`, `art_sejong`, `art_19`, `art_11`, `art_13`, `art_14`)의 `era` 표기 관행과 비교한다.
- 라벨을 바꾸면 **나의 연표 판정이 어떻게 달라지는지** 적는다. `js/miniGames.js`의 `getArtifactTimelineRange()` 기간표가 조선 전기 `[1392, 1591]`, 조선 후기 `[1592, 1875]`로 되어 있어, 라벨만 바꾸면 판옥선이 어느 기간에도 맞지 않게 된다. 기간표를 함께 바꿀 때 **세종 유물과의 순서 판정이 사라지는지**도 계산해 적는다.
- **`artifacts.json`과 `miniGames.js`는 수정하지 않는다.**

---

## T4. `claude-deep-prehistoric` 브랜치 분석 — 우선순위 4 (보고만)

원격에 남은 유일한 작업 브랜치다. worktree는 `D:\codexwork\history_game-claude`. **읽기만 하고 병합·삭제·체크아웃 전환을 하지 않는다.**

`git cherry` 기준으로 7커밋 중 2개(`e04496f`, `ff8f1d5`)는 이미 main에 같은 내용이 있고, 5개가 남는다.

| 커밋 | 내용 |
|---|---|
| `e4ce1dd` | 기기 전환용 세션 이어받기 노트 |
| `da0a8b4` | Deep-dive 재설계 계획 + 경쟁 과제 문서 |
| `9b34883` | 이어받기 노트가 재설계 계획을 가리키게 수정 |
| `6fee7fc` | **콘텐츠**: `deep_prehistoric` 선택지가 단서 핫스팟을 인용하게 수정 |
| `3c47568` | Deep-dive 역할 분담 확정 반영 |

확인할 것:

1. `6fee7fc`의 `data/mud/deep_prehistoric.json` 변경이 **현재 main의 같은 파일과 충돌하는지**, 이미 다른 형태로 반영됐는지, 반영하면 계약 검증(§5)을 통과하는지. 임시 브랜치에서 cherry-pick을 **시험만** 해 보고 결과를 적은 뒤 되돌린다.
2. 문서 4개가 현재 문서 체계(`DECISIONS.md` 번호, 역할 분담)와 **충돌하는지**. 예: 지난 감사에서 `codex-deep-three-kingdoms`의 계획 문서가 D-019 번호와 충돌했다.
3. 권고: (a) 콘텐츠 커밋만 cherry-pick, (b) 전부 폐기 + archive 태그, (c) 기타 — 근거와 함께.

결과: `docs/audits/claude_deep_prehistoric_branch_review.md`.

---

## T5. 위 작업이 끝나면 — Codex 본업

실시간 협동 MUD 시스템(`apps/`, `cooperative-mud/`) 작업을 이어간다. 이 영역은 Claude가 건드리지 않는다. `BACKLOG.md`의 `P1-COLLAB-PRIVACY`(Convex 개인정보·국외 처리 게이트)는 여전히 학생 적용을 막는 조건이다.

---

## 4. 하지 않는 것 (요약)

- `.worktrees/claude-*` 수정, 그 브랜치 push·삭제
- 판단 대기 항목 구현
- 새 MUD·페어·게임
- T2 허용 범위 밖 데이터 수정, `js/` 수정
- `claude-deep-prehistoric` 병합·삭제

## 5. 검증 명령 (데이터를 고쳤을 때)

```bash
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
python scripts/06_validate_static_assets.py
node scripts/13_audit_inquiry_combinatorics.js
git diff --check
```

## 6. 끝나면

- `walkthrough.md` 말미에 작업 기록을 추가한다.
- 판단이 필요한 결과는 `BACKLOG.md` 상단 "지금 판단이 필요한 것" 목록에 한 줄씩 추가한다.
- Claude가 돌아왔을 때 읽을 수 있게, 결과 문서 경로를 이 문서 끝에 "완료 기록" 절로 덧붙인다.
