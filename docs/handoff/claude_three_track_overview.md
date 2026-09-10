# 3트랙 병렬 작업 개요 (2026-09-10)

Opus 5 기획 세션의 결과물이다. Claude 쪽 작업을 세 창으로 나누고, 각 창은 자기 지시서만 읽으면 되도록 범위와 파일 소유권을 분리했다.

## 창 이름과 지시서

| # | 창 이름 | slug | 담당 | 지시서 |
|---|---|---|---|---|
| 1 | **관문 설계실** | `gate-grammar` | 트랙 1-A · Regular MUD 콘텐츠 | [claude_track1a_gate_grammar_instruction.md](./claude_track1a_gate_grammar_instruction.md) |
| 2 | **대조실** | `artifact-site-lens` | 트랙 2 · 유물·유적 비교 확장 | [claude_track2_artifact_site_instruction.md](./claude_track2_artifact_site_instruction.md) |
| 3 | **연결 공방** | `activity-loop` | 트랙 3 · 확장 역사 활동 전반 | [claude_track3_activity_loop_instruction.md](./claude_track3_activity_loop_instruction.md) |

Codex는 별도로 실시간 협동 MUD 시스템을 구축 중이며 위 세 트랙과 파일이 겹치지 않는다.

## 파일 소유권 표

한 파일은 한 창만 수정한다. 읽기는 자유다.

| 파일 | 소유 창 |
|---|---|
| `data/mud/regular_*.json` | 관문 설계실 |
| `js/mudInquiry.js`, `js/mudEngine.js`, `js/mudSimulators.js` | **없음 — 트랙 1-B 미배정** |
| `data/artifactComparisons.json`, `js/artifactComparison.js`, `js/encyclopedia.js` | 대조실 |
| `js/miniGames.js`, `js/storyEngine.js`, `data/causeEffectChains.json`, `data/timeline.json`, `data/stories*.json` | 연결 공방 |
| `index.html` 구조·레이아웃 | 연결 공방 |
| `index.html` 캐시버스터 줄 | 각 창이 **자기 파일 줄만** |
| `css/style.css` | 공유 — **추가만**, 기존 규칙 수정 금지 |
| `BACKLOG.md`, `DECISIONS.md`, `EXPERIMENTS.md` | 공유 — **말미에 추가만**, 기존 항목 수정 금지 |

`index.html`의 캐시버스터는 파일별로 분리되어 있어 서로 다른 줄을 만지면 충돌하지 않는다.

```
260  js/encyclopedia.js?v=...        ← 대조실
261  js/artifactComparison.js?v=...  ← 대조실
264  js/miniGames.js?v=...           ← 연결 공방
265  js/mudEngine.js?v=...           ← 트랙 1-B
266  js/mudInquiry.js?v=...          ← 트랙 1-B
267  js/mudSimulators.js?v=...       ← 트랙 1-B
268  js/app.js?v=...                 ← 공유(사전 협의)
```

## 미배정 — 트랙 1-B (UI/UX)

`inquiry-task` 화면은 세로로 긴 폼이고, 아이패드 가로에서 제출 버튼이 보이지 않는다. Canvas와 DOM 버튼이 이중화되어 지도가 장식이 됐고, 진행도 게이지가 0%에 고정된다. 이 작업에는 아직 담당 창이 없다.

관문 설계실이 전환하는 3편은 **현재 UI 위에서 동작**하므로 1-B 없이도 진행할 수 있다. 다만 1-B가 늦어질수록 나중에 다시 손대야 할 편수가 늘어난다.

## 시작 전 필수 정리

`feat/cooperative-group-preview`에 확장 역사 활동 작업 2개(`76f7cde`, `2108f0f`)가 main에 반영되지 않은 채 남아 있다. **연결 공방이 첫 작업으로 정리**한다. 이것이 끝나기 전에 다른 창이 `index.html`이나 `css/style.css`를 만지면 충돌한다.

## 공통 원칙

- 각 창은 `origin/main`에서 자기 worktree와 브랜치를 만든다. 공유 폴더에서 브랜치만 바꾸지 않는다.
- 수업 관찰 증거 없이 점수·타이머·콤보·경쟁 요소를 추가하지 않는다.
- 새 아이디어는 `INBOX.md` 또는 `BACKLOG.md`에 먼저 기록한다. 실험하지 않은 아이디어를 `PRD.md`의 확정 요구사항으로 승격하지 않는다.
- 판정 조건을 넣을 때는 **그 조건이 실패할 수 있는지** 직접 확인한다(`DECISIONS.md` D-027).
- 코드 변경 시 `walkthrough.md`와 검증 명령을 함께 갱신한다.
- 완료 보고는 자동 검증 결과 + **실제 브라우저 플레이 결과**를 모두 포함한다. 검증 스크립트 통과만으로 완료로 보고하지 않는다.
