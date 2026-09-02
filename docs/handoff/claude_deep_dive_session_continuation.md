# Claude Deep-dive 작업 이어가기 (다른 PC 세션용)

이 문서는 다른 컴퓨터(예: 집 노트북)의 새 Claude Code 세션이 이 작업을 이어받을 때 필요한 맥락을 담는다. 새 세션은 이전 대화 기록이나 이 PC의 로컬 메모리에 접근할 수 없으므로, 이어가는 데 필요한 사실은 전부 이 문서와 저장소 커밋에 있어야 한다.

## 1. 이 저장소의 현재 구조 (반드시 먼저 읽을 것)

- 원래 작업 PC(`D:\codexwork\history_game`)는 Codex와 **같은 로컬 작업 폴더를 실시간 공유**하는 브랜치 `codex-deep-three-kingdoms`로 되어 있었다. Codex가 `data/mud/deep_three_kingdoms.json`과 `js/mudSimulators.js`를 그 폴더에서 계속 편집하고 있었다.
- 이를 피하기 위해 2026-09-01, 같은 로컬 저장소에 `git worktree`로 별도 폴더(`D:\codexwork\history_game-claude`)와 별도 브랜치 `claude-deep-prehistoric`를 새로 만들어 Claude 전용 작업 공간으로 분리했다.
- `claude-deep-prehistoric`는 `main`(커밋 `1963309`)에서 분기한 뒤, Claude가 만든 prehistoric 개선 커밋 2개만 cherry-pick했다. **Codex의 three_kingdoms 관련 변경은 포함되어 있지 않다** — 의도적으로 분리된 것.
- **다른 PC에서는 worktree를 만들 필요 없이**, 저장소를 평소대로 clone/pull한 뒤 다음만 하면 된다:
  ```bash
  git fetch origin
  git checkout claude-deep-prehistoric   # 이미 origin에 push되어 있다면
  # 또는 origin에 없다면: git checkout -b claude-deep-prehistoric origin/claude-deep-prehistoric
  ```

## 2. 배경: Deep-dive 경쟁 개선 과제

- 과제 원본 정의: [`docs/handoff/deep_dive_competition_task.md`](deep_dive_competition_task.md)
- 원래 설계: Codex = `deep_three_kingdoms.json`, Claude = `deep_prehistoric.json`을 각자 독립적으로 개선한 뒤 완성도·5학년 적합성·플레이 시간·시뮬레이터 품질을 비교.
- **2026-09-01 사용자 결정**: 두 결과물을 비교해 본 사용자가 "Codex보다 Claude가 담당한 deep-dive 결과물이 더 낫다"고 판단 → **앞으로 deep-dive MUD 활동 전반을 Claude가 담당하는 방향으로 전환**하기로 함. 단, 이 결정의 구체적 범위(예: `deep_joseon.json`/`deep_modern.json`도 포함인지, 이미 Codex가 작업한 `deep_three_kingdoms.json`을 Claude가 이어받는지)는 아직 확정되지 않았다 — **다음 세션에서 사용자에게 먼저 확인할 것.**

## 3. 지금까지 완료한 작업 (`deep_prehistoric.json`)

- 커밋: `e04496f`(feat: 게이팅 추가 + 신규 6장 구현), `ff8f1d5`(docs: Codex 핸드오프 문서)
- 상세 내용은 [`docs/handoff/deep_prehistoric_codex_handoff.md`](deep_prehistoric_codex_handoff.md) 참고 — 변경 스테이지, scene/hotspot/completion 목록, 검증 결과가 전부 정리되어 있음.
- 핵심 요약:
  - 원본 파일은 15개 스테이지 전부 `required`/`completion` 미선언 상태라, 시뮬레이터를 한 번도 조작하지 않아도 선택지가 즉시 활성화되는 문제가 있었음 → 9곳(1, 1a, 1b, 2b, 3, 4, 7, 8, 신규 6)에 실제 게이팅 추가.
  - 로드맵에만 있고 실제 스테이지가 없던 "6. 단군왕검의 고조선 건국"을 신규 구현(신화-유물 종합 판단형 선택지 + `6-fail` 복습 화면 포함).
  - 죽은 로드맵 항목 "8-F" 제거.
  - `scripts/03~09_validate_mud_*.py` 검증 스크립트 4종 전부 PASS.
  - 브라우저(Claude Browser pane)로 시작→새 6장→엔딩까지 전체 클릭 재생 완료, 게이팅 동작·씬 렌더링·콘솔 에러 없음 확인.

## 4. 다음에 할 일 (제안 — 확정된 지시는 아님)

> **먼저 읽을 것**: [`docs/plans/implementation_plan_deep_dive_redesign.md`](../plans/implementation_plan_deep_dive_redesign.md) (2026-09-02 작성). Deep-dive 전면 재설계 계획으로, 뿌리 문제 재정의·4종 구조 감사·해결 아이디어 5종·사고축 구획 원리·신규 Deep-dive 후보 6종·결정 대기 쟁점 4건이 정리되어 있다. 아래 목록보다 이 문서가 최신이다.

1. **사용자에게 먼저 확인**: "Claude가 deep-dive 전체 담당" 결정의 구체적 범위(대상 파일, `deep_three_kingdoms.json` 인수 여부, Codex와의 역할 재조정 필요 여부).
2. 실제 학생 기준 플레이 시간 재측정 — 지금까지는 에이전트가 클릭하는 방식으로만 검증했고, 실제 5학년 학생의 읽기·조작 속도를 반영한 실측은 아직 없음. `docs/handoff/deep_dive_competition_task.md`의 "결과 보고 형식"·"플레이 시간" 항목 참고.
3. `deep_joseon.json`/`deep_modern.json`도 `deep_prehistoric.json`과 같은 감사(게이팅 누락 여부, 로드맵-스테이지 정합성, 5학년 어휘 난이도)가 필요할 가능성이 높음 — 아직 미착수.
4. 신규 스테이지 "6"의 판단형 선택지 난이도가 5학년 수준에 적절한지 재검토.

## 5. 참고

- 원래 PC의 공유 작업 폴더(`D:\codexwork\history_game`, `codex-deep-three-kingdoms` 브랜치, Codex와 실시간 공유)는 이 저장소와는 별개로 그 PC에만 존재한다. 다른 PC에서는 접근할 수 없고, 접근할 필요도 없다.
- 로컬 프리뷰는 `python -m http.server <port>`로 저장소 루트를 서빙하면 된다(Claude Code라면 `.claude/launch.json`에 등록된 `static-server` 설정을 그대로 써도 됨 — 포트 번호는 새 PC에서 비어 있는 아무 포트로 바꿔도 무방).
