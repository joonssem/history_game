# Codex 전달 — 2026-09-28 현재 상태와 요청

> 작성: Claude Code 세션(Opus). 기준: `origin/main` `261964cf`(라운드 11 통합, 2026-09-21).
> 9/21 이후 main에 새 커밋은 없습니다. 이전 전달: [`codex_status_and_requests_20260921.md`](./codex_status_and_requests_20260921.md).

## 1. 9/21 전달 이후 정리된 것

| 항목 | 결과 | 근거 |
|---|---|---|
| 요청 A — 조선 후기 시나리오 앱 등록 | Codex 완료. 상태 `registered / rehearsal-needed` | `BACKLOG.md` P1-COLLAB-JOSEON-LATE |
| 요청 B — 연대표 띠 레드팀 감사 | Codex 완료(LT-01~10) | `docs/audits/lesson_track_red_team_audit.md` |
| LT-01·02·04·05·06 | 기획 세션이 수정 | `walkthrough.md` "연대표 띠 red team(LT-01~10) 1차 대응" |
| LT-03·10 | 라운드 11 조작대가 `scripts/16`에 반영(fixture 8건 포함) | `walkthrough.md` "라운드 11 통합" |
| LT-08·09 | D-037 적용. 명량·병자호란은 조선 후기, 개항기 `1876년~1910년`, 광복·대한민국 `1945년~현재` | `DECISIONS.md` D-037, `data/lesson_track.json` |
| LT-07 | 수정 안 함. 수업 관찰 뒤 판단 | 같은 절 |

**중복 작업 기록**: Codex의 `feat/codex-lesson-track-validator`(`3fcccc4`)도 LT-03·10을 구현했습니다. 통합 데이터에서 두 구현이 모두 통과했지만, 이미 병합된 조작대 구현을 기준으로 삼고 Codex 브랜치는 병합하지 않았습니다. 원인은 기획 세션이 라운드 11 착수를 Codex에 알리지 않은 것입니다. 이 문서부터 Claude 쪽 착수 예정 작업을 §4에 명시합니다.

## 2. 요청 A (우선) — 조선 후기 실시간 활동 실기기 리허설

10월 28일 공개수업까지 약 한 달 남았습니다. 앱 등록은 끝났지만 실제 Preview 배포와 물리 기기 리허설은 하지 않았습니다.

- 범위: `apps/cooperative-live/**`(D-035에 따라 Codex 소유)
- 순서(BACKLOG 검증 순서): 자동 회귀 → 교사 1명 + 4~8대 실제 기기 리허설(WebSocket 동시접속, 재접속, 학교 Wi-Fi, 아이패드 QR 인식, revision 재확인)
- 실제 학생 접속은 이 문서의 요청 범위가 아닙니다. `P1-COLLAB-PRIVACY` 게이트(학교 개인정보 처리 근거·국외 처리)가 아직 대기 중입니다.
- 결과: `EXPERIMENTS.md`와 BACKLOG 해당 항목의 상태 줄에 기록해 주십시오.
- **문안을 고쳐야 하면 직접 고치지 말고** `docs/audits/`에 항목을 남겨 주십시오. `docs/handoff/claude_joseon_late_runtime_scenario.json`은 Claude가 고칩니다.

## 3. 요청 B — 라운드 11 통합본 읽기 전용 확인 (여유가 있을 때)

- 대상: `data/lesson_track.json`, `scripts/16_validate_lesson_track.js`(기준 `261964cf`)
- 확인해 주었으면 하는 것
  1. LT-03·08·09·10이 감사의 수용 기준대로 닫혔는지
  2. `feat/codex-lesson-track-validator`의 검사 중 병합된 `scripts/16`에 없는 것이 있는지. 있으면 목록만 남겨 주십시오.
- 결과: `docs/audits/lesson_track_red_team_audit.md`에 항목별 상태(해결/부분/미해결)를 덧붙여 주십시오. 코드는 고치지 마십시오.

## 4. Claude가 착수할 작업 (Codex는 이 파일을 건드리지 마십시오)

- **3단원 MUD 2편의 `header.tag` 차시 번호 오류**
  - `data/mud/regular_independence.json:16`: `3단원 38~39차시` → 실제 4~5차시
  - `data/mud/regular_korean_war.json:17`: `3단원 44~46차시` → 실제 10~12차시
  - 3단원은 14차시뿐이라 원래 숫자는 범위를 벗어납니다. 라운드 10 대조실이 발견했고, 라운드 11에서도 범위 밖으로 넘긴 뒤 남아 있습니다. `data/artifacts.json`의 `hint`는 이미 고쳤습니다.
  - 사용자 승인 뒤 Claude가 두 줄만 고치고 `01·04·05·16` 검사를 돌립니다. 끝나면 Codex의 검토를 요청합니다.

## 5. 원격 브랜치 정리 — 사용자 확인 필요

- `origin/feat/codex-lesson-track-validator`: 병합하지 않고 참고로 남긴 상태입니다. §3-2 확인이 끝나면 보존할지 삭제할지 사용자에게 물어 주십시오.
- `feat/artifact-site-comparison`, `feat/extended-activity-loop`, `feat/inquiry-ui-console`, `feat/mud-gate-grammar`, `fix/round3-red-team`는 모두 main에 합쳐졌습니다. 남겨 두면 여기서 새 브랜치를 떴을 때 오래된 기준 문제가 재현될 수 있습니다(BACKLOG 판단 대기 5번).
- `claude-deep-prehistoric`은 BACKLOG 판단 대기 6번(수동 이식 권고)이 결정될 때까지 그대로 둡니다.
- **원격 브랜치 삭제는 사용자 승인 없이 하지 마십시오.**

## 6. 알아 두실 것

- **수업 관찰(D-033)은 여전히 0회입니다.** 새 기능 확장은 관찰 뒤에 판단합니다. 관찰 기록지 B가 A4 한 장을 넘어 줄이기로 표시만 한 상태입니다(연결 공방 소유).
- BACKLOG 맨 위 「지금 판단이 필요한 것」 13건은 사용자 판단 대기입니다. Codex가 먼저 구현하지 마십시오.
- 같은 폴더(`C:\chatGPT_test\history_game`)에서 브랜치를 바꾸지 마십시오. 병렬 작업은 `git worktree`를 쓰십시오(agents.md).
