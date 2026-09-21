# Codex 전달 — 2026-09-21 현재 상태와 요청

> 작성: Claude 기획 세션(Opus). 기준: `origin/main` `13cd97b`.
> **먼저 `git pull --ff-only`로 main을 받으십시오.** 9/18~9/21에 Claude 쪽 커밋이 여러 건 들어갔습니다.

## 1. 그동안 Claude가 한 일

| 날짜 | 내용 | 결과물 |
|---|---|---|
| 9/17 | 조선 후기 협동 콘텐츠를 **실제 앱 계약 모양**으로 다시 만듦(감사 C1-01~05 대응) | `docs/handoff/claude_joseon_late_runtime_scenario.json` |
| 9/18 | 후속 제품 방향 메모 점검, 최소 검증 후보 제안 | `docs/handoff/claude_round8_product_link_memo_20260918.md` |
| 9/18 | 외부 사례(史뿐史뿐) 직접 열람·판단 | `docs/audits/external_reference_sbbsbb_review_20260918.md` |
| 9/18~9/21 | **정규 28편 연대표 띠**(D-036) 구현·검증 | `data/lesson_track.json`, `js/lessonTrack.js`, `scripts/16` |
| 9/18 | 다른 PC에서 같은 환경 만드는 안내 | `다른pc_vscode터미널5개창작업설명.md` |

## 2. 요청 A (우선) — 조선 후기 시나리오 앱 등록

- 요청서는 이미 main에 있습니다: `docs/handoff/codex_joseon_late_runtime_registration_20260917.md`
- 콘텐츠: `docs/handoff/claude_joseon_late_runtime_scenario.json` (id `joseon-late-market`, version 1, 역할 5개, sources 8건)
- 검사: `node scripts/15_validate_cooperative_packet.js --runtime docs/handoff/claude_joseon_late_runtime_scenario.json` PASS
- 등록 순서는 그 요청서 §"Codex가 할 일"에 있습니다(공개·서버 레지스트리 분리, `validateScenarioRegistry()`, client bundle 노출 검사, `npm run check`).
- **문안을 고쳐야 하면 직접 고치지 말고** `docs/audits/`에 항목을 남겨 주십시오. Claude가 JSON을 고칩니다.

## 3. 요청 B — 연대표 띠 읽기 전용 감사 (여유가 있을 때)

- 대상: `data/lesson_track.json`, `js/lessonTrack.js`, `js/mudEngine.js` 완료 화면, `scripts/16_validate_lesson_track.js`, `css/style.css`의 `.lesson-track-*`
- 결정 근거: `DECISIONS.md` D-036, 사양서 `docs/plans/implementation_plan_lesson_track_ui.md`
- 봐 주었으면 하는 것
  1. **완료 판정 방식의 취약점**: 현재는 "그 편의 보상 유물이 도감에 해금돼 있으면 완료"로 본다(새 저장 키를 만들지 않으려고). 보상 유물을 다른 경로로 얻거나 보상이 없는 편이 있으면 잘못 판정될 수 있는지.
  2. **28편 대응의 지속성**: 새 정규 편이 추가될 때 `_index.json`과 `lesson_track.json`이 어긋나면 `scripts/16`이 실제로 잡는지.
  3. **접근성**: 색 없이도 완료/지금/아직이 구분되는지, 키보드 이동과 스크린리더 라벨.
  4. **연대 표기**: 띠에 보이는 연대가 `docs/audits/lesson_track_era_review.md`의 검증값과 어긋나지 않는지.
- 결과는 `docs/audits/lesson_track_red_team_audit.md`에 파일·재현·심각도·수용 기준으로 남겨 주십시오. 코드는 고치지 마십시오.

## 4. 알아 두실 것

- **`.claude/launch.json`**: 통합 worktree용 포트(8805)를 추가하려다 되돌렸습니다. 이 파일은 메인 체크아웃의 것이 쓰이므로, 필요하면 Codex 쪽에서 정리해 주셔도 됩니다.
- **D-035 유지**: 앱 코드(`apps/cooperative-live/**`)는 Codex, 콘텐츠는 Claude입니다.
- **Claude가 다음에 할 일**: 3단원(일제강점기·광복·6·25) 사실 대조(D-032). 3단원 콘텐츠를 Claude 네 창이 만지게 되니, Codex는 이 기간에 3단원 데이터 파일을 건드리지 말아 주십시오.
- 수업 관찰(D-033)은 아직 진행되지 않았습니다. 새 기능 확장은 관찰 뒤에 판단합니다.
