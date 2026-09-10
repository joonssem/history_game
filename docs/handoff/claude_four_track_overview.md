# 4트랙 병렬 작업 개요 (2026-09-10)

Opus 5 기획 세션의 결과물이다. Claude 쪽 작업을 네 창으로 나누고, 각 창은 자기 지시서만 읽으면 되도록 범위와 파일 소유권을 분리했다.

## 창 이름과 지시서

| # | 창 이름 | slug | 담당 | 지시서 |
|---|---|---|---|---|
| 1 | **관문 설계실** | `gate-grammar` | 트랙 1-A · Regular MUD 콘텐츠 | [claude_track1a_gate_grammar_instruction.md](./claude_track1a_gate_grammar_instruction.md) |
| 2 | **대조실** | `artifact-site-lens` | 트랙 2 · 유물·유적 비교 확장 | [claude_track2_artifact_site_instruction.md](./claude_track2_artifact_site_instruction.md) |
| 3 | **연결 공방** | `activity-loop` | 트랙 3 · 확장 역사 활동 전반 | [claude_track3_activity_loop_instruction.md](./claude_track3_activity_loop_instruction.md) |
| 4 | **조작대** | `inquiry-console` | 트랙 1-B · inquiry-task UI/UX | [claude_track1b_inquiry_console_instruction.md](./claude_track1b_inquiry_console_instruction.md) |

관문 설계실과 조작대는 같은 활동의 다른 층을 맡는다. 설계실은 *무엇을 생각하게 할지*(데이터), 조작대는 *그 생각이 손끝에서 어떻게 일어나는지*(런타임·화면)다. 파일이 완전히 분리되어 있어 동시에 진행할 수 있다.

Codex는 별도로 실시간 협동 MUD 시스템을 구축 중이며 위 네 트랙과 파일이 겹치지 않는다.

## 파일 소유권 표

한 파일은 한 창만 수정한다. 읽기는 자유다.

| 파일 | 소유 창 |
|---|---|
| `data/mud/regular_*.json` | 관문 설계실 |
| `js/mudInquiry.js`, `js/mudEngine.js`, `js/mudSimulators.js` | 조작대 |
| `data/artifactComparisons.json`, `js/artifactComparison.js`, `js/encyclopedia.js` | 대조실 |
| `js/miniGames.js`, `js/storyEngine.js`, `data/causeEffectChains.json`, `data/timeline.json`, `data/stories*.json` | 연결 공방 |
| `index.html` 「확장 역사 활동」 section (69~97) | 연결 공방 |
| `index.html` `#view-myeongnyang` 블록 (105~) | 조작대 |
| `index.html` 캐시버스터 줄 | 각 창이 **자기 파일 줄만** |
| `css/style.css` | 공유 — **추가만**, 기존 규칙 수정 금지 |
| `BACKLOG.md`, `DECISIONS.md`, `EXPERIMENTS.md` | 공유 — **말미에 추가만**, 기존 항목 수정 금지 |

`index.html`의 캐시버스터는 파일별로 분리되어 있어 서로 다른 줄을 만지면 충돌하지 않는다.

```
260  js/encyclopedia.js?v=...        ← 대조실
261  js/artifactComparison.js?v=...  ← 대조실
264  js/miniGames.js?v=...           ← 연결 공방
265  js/mudEngine.js?v=...           ← 조작대
266  js/mudInquiry.js?v=...          ← 조작대
267  js/mudSimulators.js?v=...       ← 조작대
268  js/app.js?v=...                 ← 공유(사전 협의)
```

## 관문 설계실 ↔ 조작대 조율

두 창은 파일이 겹치지 않지만 같은 화면을 공유한다.

- 설계실이 전환하는 3편은 **현재 UI 위에서 동작**하므로 조작대를 기다릴 필요가 없다.
- 조작대는 **`data/mud/*.json`을 절대 수정하지 않는다.** 데이터 구조가 부족하면 고치지 말고 설계실에 넘긴다.
- 설계실은 **`js/mud*.js`를 절대 수정하지 않는다.** 새 문법이 필요하면 설계 문서만 남기고 조작대가 구현한다.
- 조작대가 상호작용 모델 자체를 바꾸는 변경(단계 진행형 전환, Canvas 역할 정리)을 할 때는 **사용자 확인을 먼저 받는다.** 설계실이 만든 편의 전제가 흔들릴 수 있다.

현재 미배정 작업은 없다.

## 시작 전 필수 정리

`feat/cooperative-group-preview`에 확장 역사 활동 작업 2개(`76f7cde`, `2108f0f`)가 main에 반영되지 않은 채 남아 있다. **연결 공방이 첫 작업으로 정리**한다. 이것이 끝나기 전에 다른 창이 `index.html`이나 `css/style.css`를 만지면 충돌한다.

## 공통 원칙

- 각 창은 `origin/main`에서 자기 worktree와 브랜치를 만든다. 공유 폴더에서 브랜치만 바꾸지 않는다.
- 수업 관찰 증거 없이 점수·타이머·콤보·경쟁 요소를 추가하지 않는다.
- 새 아이디어는 `INBOX.md` 또는 `BACKLOG.md`에 먼저 기록한다. 실험하지 않은 아이디어를 `PRD.md`의 확정 요구사항으로 승격하지 않는다.
- 판정 조건을 넣을 때는 **그 조건이 실패할 수 있는지** 직접 확인한다(`DECISIONS.md` D-027).
- 코드 변경 시 `walkthrough.md`와 검증 명령을 함께 갱신한다.
- 완료 보고는 자동 검증 결과 + **실제 브라우저 플레이 결과**를 모두 포함한다. 검증 스크립트 통과만으로 완료로 보고하지 않는다.
