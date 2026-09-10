# 트랙 3 지시서 — 「연결 공방」

- 창 이름: **연결 공방** (slug `activity-loop`)
- 한 줄 정의: 잡동사니 서랍이 된 「확장 역사 활동」을 **MUD에서 얻은 것을 다시 쓰는 곳**으로 재정의한다.
- 작성: Opus 5 기획 세션 (2026-09-10)
- 기준 커밋: `origin/main` + 본 지시서가 포함된 커밋
- 담당 모델: Sonnet 5
- 권장 브랜치: `feat/extended-activity-loop`
- 권장 worktree: `.worktrees/claude-activity-loop`

## 0. 이 창이 만지는 파일 (소유권)

**소유(단독 수정 가능)**
- `js/miniGames.js`
- `data/causeEffectChains.json`, `data/timeline.json`
- `js/storyEngine.js`, `data/stories.json`, `data/stories_chasi2.json`
- `index.html`의 「확장 역사 활동」 `<section>`(현재 69~97번 줄 부근)

**조건부**
- `index.html` 스크립트 태그 — **자기 파일의 캐시버스터 줄만**. 현재 264번 줄 `js/miniGames.js?v=20260909-detective1`. 다른 줄은 건드리지 않는다.
- `css/style.css` — 확장 활동 전용 클래스만 추가한다.

**읽기만 (수정 금지)**
- `js/encyclopedia.js` (트랙 2 소유 — 해금 상태는 읽기만 한다)
- `js/artifactComparison.js` (트랙 2 소유)
- `js/mud*.js`, `data/mud/` (트랙 1 소유)
- `data/artifacts.json`

`index.html`을 실질적으로 수정하는 창은 이 창뿐이다. 다른 트랙은 캐시버스터 한 줄만 만진다. **레이아웃·구조 변경은 이 창이 책임진다.**

## 1. ⚠️ 가장 먼저 할 일 — 미병합 작업 정리

`feat/cooperative-group-preview` 브랜치에 이 트랙의 작업 2개가 **main에 올라가지 않은 채** 떠 있다. 브랜치 이름은 Codex 영역(협동 MUD)인데 내용은 확장 역사 활동이다.

| 커밋 | 내용 | main 반영 |
|---|---|---|
| `76f7cde` | 미니게임 버튼–결과 위치 불일치 수정 + 아이패드 가로모드 세로 스크롤 완화 | ❌ 없음 |
| `2108f0f` | **확장 역사 활동 토글 스위치** 도입 + Deep-dive 유물 설명 오류 수정 | ❌ 없음 |
| `9be09eb` | 유물비교 시대 매칭 3차 수정 | ✅ main에 `6943440`으로 존재(중복) |

**작업을 시작하기 전에** 앞의 두 커밋을 정리한다. 그러지 않으면 `index.html`과 `css/style.css`에서 곧바로 충돌한다.

절차:
1. 두 커밋의 내용을 확인한다. `git show 76f7cde`, `git show 2108f0f`
2. `origin/main` 기준 작업 브랜치에 cherry-pick 한다. `9be09eb`는 이미 main에 있으므로 **가져오지 않는다**.
3. 충돌이 나면 main 쪽을 기준으로 재적용하고, 무엇을 어떻게 합쳤는지 기록한다.
4. 정리 결과를 사용자에게 보고한 뒤 §3으로 넘어간다.

## 2. 검증된 현재 상태 (2026-09-10 실측)

「확장 역사 활동」은 `index.html`의 카드 하나에 타임머신 스토리 1개 + 미니게임 4개가 들어 있다. 서로 아무 관계가 없다. 역할이 사실상 "빨리 끝낸 학생 시간 때우기"에 머물러 있다.

| 활동 | 데이터 | 해금 유물 연동 | 문제 |
|---|---|---|---|
| 🎴 유물 카드 짝맞추기 | `artifacts.json` | ❌ **없음** | `js/miniGames.js:62`가 `[...this.artifacts].slice(0, 6)` — **항상 같은 6쌍**. 재플레이 가치가 없고, 아직 못 얻은 유물이 나온다 |
| 📜 역사 연표 순서 맞추기 | `timeline.json` | ❌ 없음 | 고정 2세트. MUD 진행과 무관 |
| 🔗 원인과 결과 순서 맞추기 | `causeEffectChains.json` | ❌ 없음 | **고정 2세트이고 둘 다 3단원(근현대)뿐.** 1·2단원이 완전히 비어 있다 |
| 🕵️ 유물 탐정 | `artifacts.json` | ✅ **있음** | `js/miniGames.js:451-453`이 해금 유물로 풀을 만든다. **이것이 올바른 참조 구현이다** |
| ⏳ 타임머신 스토리 | `stories.json`(3) + `stories_chasi2.json`(1) | — | MUD와의 관계가 정의되어 있지 않음 |

## 3. 이 트랙의 목표

**확장 역사 활동의 역할을 "MUD에서 얻은 것을 다시 쓰는 곳"으로 정의하고, 5개 활동을 그 정의에 맞춘다.**

유물 비교 활동이 이미 이 모델로 작동한다(획득 유물 → 사료로 재사용). 유물 탐정도 해금 기반이다. 나머지 3개가 그 원리를 따르지 않고 있다.

### P0 — 원인과 결과: 1·2단원 세트 신규 제작

가장 큰 구멍이다. 앱은 3단원 체계인데 이 활동은 3단원 콘텐츠만 있다.

- 1단원(선사~고려)과 2단원(조선~개항기)에 각각 최소 1세트씩 만든다.
- 현재 스키마는 `{stage, title, description, events:[{id, title, hint}]}`이고 5개 사건이 한 세트다. `data/causeEffectChains.json`을 읽고 같은 형식을 따른다.
- **연도를 쓰지 않는다.** 기존 세트의 설계 의도가 "연도 암기가 아니라 인과 논리로 순서 맞추기"다. `description`에 그 안내가 들어 있다.
- 사건은 **학생이 MUD에서 실제로 겪은 것**에서 고른다. `data/mud/regular_*.json`의 해당 단원 MUD를 읽고 그 안의 사건을 쓴다. 새 역사 서술을 지어내지 않는다.
- 1단원 후보 주제: 고려 건국 → 거란 침입 → 강감찬의 승리 → 팔만대장경 → 벽란도 교류. 2단원 후보: 조선 건국 → 한양 천도 → 훈민정음 → 임진왜란 → 전후 복구.

### P1 — 카드 짝맞추기를 해금 유물 기반으로

`slice(0, 6)`을 해금 유물 풀에서 뽑도록 바꾼다. **유물 탐정(`js/miniGames.js:446` 이하)이 이미 올바른 방식이므로 그 패턴을 그대로 따른다.**

- 해금 유물이 6개 미만일 때의 동작을 정의한다. 게임을 막을지, 적은 쌍으로 진행할지 판단하고 이유를 기록한다.
- 매번 같은 6쌍이 나오지 않도록 한다.
- `js/encyclopedia.js`는 **읽기만** 한다. 트랙 2 소유다.

### P2 — 연표를 개인 연표로

클리어한 MUD가 연표에 채워지는 구조를 검토한다. **먼저 설계를 문서로 제안하고 사용자 확인을 받은 뒤 구현한다.** 기존 고정 2세트를 없애는 결정이 포함되므로 임의로 진행하지 않는다.

### P3 — 타임머신 스토리의 위치 재정의

스토리 4편이 MUD와 어떤 관계인지 정의되어 있지 않다. `docs/plans/`에 관계 정의안을 문서로 남긴다. **이번 범위에서 스토리 콘텐츠를 새로 쓰지 않는다.**

## 4. UI/UX — 반복해서 나오는 문제

아이패드 가로 모드의 세로 스크롤 과다가 `76f7cde`, `2108f0f`에서 두 번 나왔고, 트랙 1의 `inquiry-task` 화면에서도 같은 문제가 확인됐다. **이 트랙이 확장 활동 영역의 레이아웃을 책임진다.**

- 토글 스위치(`2108f0f`)를 main에 정착시키고, 그 위에서 나머지를 맞춘다.
- 활동 시작 버튼과 그 결과 영역이 항상 붙어 있어야 한다(`76f7cde`가 고친 문제의 재발 방지).
- 확장 활동 영역은 `index.html`에 인라인 `style` 속성이 많다. 새로 추가하는 것은 `css/style.css`의 클래스로 쓴다. 기존 인라인 스타일의 대규모 리팩터링은 **이번 범위 밖**이다.

## 5. 하지 말 것

- `9be09eb`를 cherry-pick. 이미 main에 있다.
- `js/encyclopedia.js`, `js/artifactComparison.js`, `js/mud*.js`, `data/mud/` 수정.
- `index.html`에서 다른 트랙의 캐시버스터 줄 수정.
- 미니게임 신규 추가. 5개도 이미 많다. 있는 것을 정의에 맞추는 게 목표다.
- 점수·순위·시간 압박 강화. 미니게임에는 이미 배지가 있다.
- P2 연표 구조 변경을 문서 확인 없이 구현.
- 인라인 스타일 전면 리팩터링.

## 6. 완료 판정

- §1의 미병합 커밋 2개가 정리되고, 무엇을 어떻게 합쳤는지 기록되어 있다.
- 원인과 결과에 1·2단원 세트가 각각 최소 1개 있고, 연도 없이 인과만으로 순서를 맞출 수 있다.
- 카드 짝맞추기가 해금 유물을 반영하고, 해금이 적을 때의 동작이 정의되어 있다.
- **로컬 정적 서버에서 5개 활동을 모두 직접 플레이**해서 확인한다.
  - 각 활동의 시작 버튼과 결과가 같은 위치에 나온다.
  - 토글로 활동을 전환해도 이전 활동의 결과가 남아 있지 않다.
  - 콘솔 `error`/`warning` 0건.
- **아이패드 가로(1180×820)와 세로(820×1180) 뷰포트**에서 확장 활동 영역을 확인한다. 세로 스크롤이 과도하지 않아야 한다.
- `BACKLOG.md`에 결과를 기록한다.

## 7. 검증 명령

```bash
node --check js/miniGames.js
node --check js/storyEngine.js
python scripts/01_validate_game_data.py
python scripts/06_validate_static_assets.py
python scripts/07_audit_activity_duration.py
git diff --check
```

## 8. 시작 명령

```bash
git worktree add .worktrees/claude-activity-loop -b feat/extended-activity-loop origin/main
cd .worktrees/claude-activity-loop
cat docs/handoff/claude_track3_activity_loop_instruction.md
git show 76f7cde
git show 2108f0f
cat data/causeEffectChains.json
sed -n '440,470p' js/miniGames.js
```

이 문서와 `BACKLOG.md`, `project_context.md`가 충돌하면 덮어쓰지 말고 충돌 지점을 먼저 보고한다.
