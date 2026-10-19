# 다른 PC에서 같은 작업 환경 만들기 (VS Code + Claude Code CLI)

- 작성: 2026-09-18
- 목적: 지금 쓰는 **Claude 데스크톱 앱 창 5개** 구성을 다른 PC의 **VS Code 터미널 5개**로 그대로 옮긴다.
- 전제: 이 저장소의 모든 브랜치가 GitHub에 올라가 있다. worktree 폴더와 대화 기록은 PC마다 따로다.

## 0. 작업 구조 한눈에

세션 5개가 **서로의 대화를 모른다.** 서로 아는 것은 git과 저장소 문서뿐이다. 그래서 기획 세션이 지시서를 파일로 써서 `main`에 올리고, 작업 세션이 그 파일을 읽고, 결과를 자기 브랜치에 커밋하면 기획 세션이 합친다. 이 규칙은 PC가 바뀌어도 같다.

```
기획 세션(Opus)           작업 세션 4개(Sonnet)
 .worktrees/claude-r3-fix   .worktrees/claude-gate-grammar     feat/mud-gate-grammar
   fix/round3-red-team      .worktrees/claude-artifact-site    feat/artifact-site-comparison
   ├ 지시서 작성·push       .worktrees/claude-activity-loop    feat/extended-activity-loop
   ├ 네 브랜치 병합         .worktrees/claude-inquiry-console  feat/inquiry-ui-console
   └ main에 push(배포)
```

| 세션 | worktree | 브랜치 | 역할 | 포트 |
|---|---|---|---|---|
| 기획·통합 | `claude-r3-fix` | `fix/round3-red-team` | 지시서, 결정 기록, 병합, 배포 | — |
| 관문 설계실 | `claude-gate-grammar` | `feat/mud-gate-grammar` | MUD 본문·역할 카드·차시 데이터 | 8801 |
| 대조실 | `claude-artifact-site` | `feat/artifact-site-comparison` | 유물·출처·사실 대조 | 8802 |
| 연결 공방 | `claude-activity-loop` | `feat/extended-activity-loop` | 퀴즈·스토리·원인결과·화면 사양 | 8803 |
| 조작대 | `claude-inquiry-console` | `feat/inquiry-ui-console` | `js/`·`scripts/` 구현과 검증 | 8804 |

## 1. 설치

```bash
npm install -g @anthropic-ai/claude-code
```

- VS Code 확장 `Claude Code`도 설치한다(편집기 연동).
- 처음 `claude` 실행 시 기존 계정으로 로그인한다.
- Node.js, Python, Git이 필요하다. 검증 스크립트가 `python`과 `node`를 모두 쓴다.

## 2. 저장소와 worktree 복원

```bash
git clone https://github.com/joonssem/history_game.git D:/codexwork/history_game
```

```bash
cd D:/codexwork/history_game && git worktree add .worktrees/claude-r3-fix fix/round3-red-team && git worktree add .worktrees/claude-gate-grammar feat/mud-gate-grammar && git worktree add .worktrees/claude-artifact-site feat/artifact-site-comparison && git worktree add .worktrees/claude-activity-loop feat/extended-activity-loop && git worktree add .worktrees/claude-inquiry-console feat/inquiry-ui-console
```

- **폴더 이름을 그대로 써야 한다.** 지시서와 `.claude/launch.json`이 이 경로를 가리킨다.
- 경로가 `D:/codexwork/history_game`이 아니면 `.claude/launch.json`의 절대 경로도 함께 고쳐야 한다.
- `.worktrees/`는 `.gitignore`에 있다. 저장소에 커밋하지 않는다(2026-09-11에 gitlink로 잘못 커밋된 적이 있다).

## 3. VS Code 터미널 5개

1. `D:/codexwork/history_game`을 VS Code로 연다.
2. 터미널을 5개 만든다(`+` 또는 `Ctrl+Shift+5` 분할).
3. 탭을 **우클릭 → Rename**으로 역할 이름을 붙인다. 안 그러면 전부 `powershell`로 보여 구분이 안 된다.
4. 탭마다 아래를 실행한다.

```bash
cd D:/codexwork/history_game/.worktrees/claude-r3-fix && claude
```
```bash
cd D:/codexwork/history_game/.worktrees/claude-gate-grammar && claude
```
```bash
cd D:/codexwork/history_game/.worktrees/claude-artifact-site && claude
```
```bash
cd D:/codexwork/history_game/.worktrees/claude-activity-loop && claude
```
```bash
cd D:/codexwork/history_game/.worktrees/claude-inquiry-console && claude
```

- 기획 세션만 `/model opus`, 나머지 넷은 Sonnet으로 둔다.
- 각 세션은 자기 worktree 안에서만 작업한다. **공유 폴더에서 브랜치를 바꾸지 않는다.**

## 4. 데스크톱 앱과 달라지는 점

| 항목 | 데스크톱 앱(현재) | CLI(다른 PC) |
|---|---|---|
| 브라우저 확인 | 앱에 내장된 브라우저로 Claude가 직접 클릭·스크린샷 | **기본으로는 불가.** 아래 두 방법 중 하나 |
| 미리보기 서버 | `.claude/launch.json`을 앱이 실행 | 터미널에서 직접 실행 |
| 대화 기록 | 이 PC에만 있음 | 새 PC에는 없음. `claude --resume`은 그 PC의 기록만 본다 |
| 창 전환 | 앱 사이드바 | VS Code 터미널 탭 |

### 브라우저 확인 방법

**방법 A — 사람이 확인(간단).** 해당 worktree에서 서버를 띄우고 선생님이 직접 본 뒤 결과를 세션에 알려 준다.

```bash
python -m http.server 8804 --directory D:/codexwork/history_game/.worktrees/claude-inquiry-console
```

**방법 B — Claude가 직접 확인(설정 1회).**

```bash
claude mcp add playwright -- npx -y @playwright/mcp@latest
```

- 라운드 9처럼 "실제 화면에서 확인했는가"가 완료 조건인 작업에는 방법 B가 유리하다.
- 방법 A를 쓸 때는 지시서의 완료 조건을 "선생님 확인 결과를 보고에 적는다"로 바꿔 적는다.

## 5. 새 PC의 첫 세션에 넣을 말

새 PC의 Claude는 지금까지의 대화를 모른다. 기획 세션에 아래를 넣으면 저장소 문서로 상태를 복구한다.

> `docs/handoff/claude_four_track_overview.md`, `docs/handoff/claude_four_track_round9_instruction.md`, `DECISIONS.md`의 D-027~D-036, `walkthrough.md`의 마지막 3개 항목, `BACKLOG.md`의 2026-09 항목, `EXPERIMENTS.md`의 EXP-008을 읽고 현재 상태를 파악해 줘. 그다음 라운드 9의 남은 일(조작대 2단계)부터 이어서 진행하자.

## 6. 지켜야 할 규칙 (PC가 바뀌어도 같음)

1. 작업 세션은 **main에 push하지 않는다.** 병합과 배포는 기획 세션만 한다.
2. 작업 시작 전 `git status --short --branch`와 `git log --oneline -3`으로 기준을 확인한다.
3. 공유 파일 규칙
   - `index.html`: 캐시버스터만 건드린다.
   - `css/style.css`: 덧붙이기만 한다.
   - `BACKLOG.md`·`walkthrough.md`: 덧붙이기만 한다(충돌 시 양쪽을 모두 남긴다).
   - `apps/**`, `cooperative-mud/**`: Codex 영역. 읽기만 한다.
4. 메인 체크아웃(`D:/codexwork/history_game`)에서 `git add -A`를 쓰지 않는다.
5. 사실 확인은 공식 출처만 쓴다(우리역사넷, 한국민족문화대백과, 국립중앙박물관, 국가유산포털, UNESCO). 위키백과는 쓰지 않는다. 원문을 열지 못하면 "확인 불가"로 적는다.
6. 완료 보고에는 **검증 명령 결과와 실제 화면 확인 결과를 모두** 넣는다.

## 7. 자주 쓰는 검증 명령

```bash
python scripts/01_validate_game_data.py && python scripts/04_validate_mud_contract.py && node scripts/05_test_simulator_runtime.js && node scripts/13_audit_inquiry_combinatorics.js && node scripts/14_lint_inquiry_semantics.js && node scripts/16_validate_lesson_track.js
```

| 스크립트 | 확인하는 것 |
|---|---|
| `01` | 게임 데이터 스키마 |
| `04` | MUD 계약·차시 매핑 |
| `05` | 시뮬레이터 런타임과 회귀(D-030, R3-02, R3-03) |
| `11` | 유물 카드 문구 |
| `13` | inquiry-task 조합 감사 |
| `14` | inquiry-task 의미 lint |
| `15` | 협동 시나리오 콘텐츠(`--runtime`, `--cards`, `--final`) |
| `16` | 연대표 띠 데이터 |

## 8. Codex와 함께 쓸 때

- Codex는 **메인 체크아웃**과 자기 worktree에서 일한다. Claude 세션은 그 폴더를 건드리지 않는다.
- Codex가 `main`에 직접 push하므로, 기획 세션은 병합·push 전에 항상 `git fetch`로 확인한다.
- 앱 코드(`apps/cooperative-live/**`)는 Codex, 콘텐츠는 Claude다(`DECISIONS.md` D-035).

## 9. PC를 옮기기 전 확인표

- [ ] 네 `feat/*` 브랜치와 `fix/round3-red-team`을 원격에 push했는가
- [ ] 각 worktree에 커밋하지 않은 변경이 없는가 (`git status --short`)
- [ ] 메인 체크아웃에 Codex의 커밋하지 않은 파일이 없는가
- [ ] `git stash list`에 남은 것이 없는가 (stash는 PC에 남는다)
