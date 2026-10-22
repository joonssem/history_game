# 저장소 정리 — Convex 실시간 협동 취소 후속

- 작성: 2026-10-16 (Claude, 기획)
- 작업: `TASK-20261016-REPO-CLEANUP`
- 상태: `planned` — 사용자 방향 결정 완료(2026-10-16), 실행 승인 대기
- 근거: [D-038](../../../DECISIONS.md) Convex 실시간 협동 취소. 사용자 결정(2026-10-16, 이 문서 §1).
- 범위 밖: 수업 콘텐츠·JS·CSS·MUD 데이터 수정, INBOX·walkthrough·DECISIONS 기존 본문 수정(새 항목 추가만), 교과서 PDF 기록 재작성.

## 1. 사용자 결정 (2026-10-16)

| 항목 | 결정 |
|---|---|
| `apps/cooperative-live` | 태그로 보관한 뒤 main에서 제거. D-038 규칙 2 "저장소에 보관"을 "태그 보관"으로 개정(D-040). |
| worktree·브랜치 | 모두 태그로 보관한 뒤 정리. `claude-deep-prehistoric`(미해결 Deep-dive)만 브랜치로 남김. |
| 취소된 문서 | `docs/archive/cooperative-live/`로 이동. BACKLOG의 CANCELLED 섹션은 걷어 내고 이력은 walkthrough에 남김. |
| 루트 잡동사니 | 보관할 것은 옮기고 나머지는 삭제. |

## 2. 실행 단계

### 단계 0 — 사전 확인 (실행 전에 멈추고 확인)

- [ ] `git rev-parse --abbrev-ref HEAD` = `main`이고, 미커밋 변경은 `CONVEX_VERCEL_NOTES.md`뿐인지 확인한다.
- [ ] `f529e76`(조선 후기 활동)을 먼저 push한다. 10/29 수업에 필요하다.
- [ ] **Vercel Git 연동 확인(사용자).** Vercel 프로젝트가 이 저장소 main의 `apps/cooperative-live`를 빌드하도록 연결되어 있다면, 폴더를 지운 push부터 빌드가 실패한다. 이미 배포된 주소는 마지막 배포본으로 남는다. 연동을 끊을지, 실패를 감수할지 사용자가 정한다.

### 단계 1 — 태그로 보관 후 worktree·브랜치 정리

1. 보관 태그를 만들고 원격에 push한다.
   - `archive/cooperative-live-20261016` → 현재 main(`apps/cooperative-live` 포함 상태)
   - 미반영 브랜치마다 `archive/<브랜치명의 /를 ->` 태그 하나씩 만든다.
2. worktree 10개를 제거한다(`git worktree remove`). 사전 점검에서 모두 미커밋 변경이 없었고, 실행 직전에 다시 확인한다. `../history_game-claude`(`claude-deep-prehistoric`)는 폴더만 지우고 브랜치는 남긴다.
3. 로컬 브랜치를 삭제한다.
   - main에 이미 반영된 5개: `audit/joseon-late-packet-20260917`, `feat/cooperative-live-early-goryeo`, `feat/goryeo-culture-main-integration`, `feat/joseon-late-runtime-registration`, `fix/round3-red-team`
   - 태그로 보관한 뒤 지우는 12개: `docs/joseon-late-extra-materials`(10커밋), `feat/goryeo-classroom-activities`(8), `feat/goryeo-relations-cooperative`(5), `feat/cooperative-student-join-idempotency`(3), `feat/cooperative-teacher-master-advance`(3), `feat/cooperative-classroom-recovery-p0`(2), `feat/claude-goryeo-relations`(1), `feat/codex-lesson-track-validator`(1), `feat/artifact-site-comparison`(1), `feat/extended-activity-loop`(1), `feat/inquiry-ui-console`(1), `feat/mud-gate-grammar`(1)
4. 같은 이름의 원격 브랜치를 삭제한다. `origin/claude-deep-prehistoric`은 남긴다.
5. 검증: `git tag -l 'archive/*'`가 13개, `git worktree list`가 1줄, `git branch`가 `main`과 `claude-deep-prehistoric`뿐인지 확인한다.

### 단계 2 — 실시간 앱 제거

- `apps/cooperative-live/` 전체를 삭제한다(로컬 `node_modules` 546MB 포함).
- `scripts/15_validate_cooperative_packet.js`를 삭제한다. 실시간 앱 계약 전용이고 CI에서 쓰지 않는다. 정적 활동 검사는 `scratch/check_static_coop_scenario.js`가 맡는다.
- `.gitignore`의 `apps/*` 규칙 3줄을 삭제한다.
- 고려 3종 정적 이식 때 원본 콘텐츠는 `git show archive/cooperative-live-20261016:apps/cooperative-live/convex/scenarios.ts`로 읽는다. 이 방법을 `implementation_plan_static_coop_goryeo.md`에 한 줄 적는다.

### 단계 3 — 문서 보관 이동 (`git mv` → `docs/archive/cooperative-live/`)

- 계획(`docs/plans/`): `COLLABORATIVE_MUD_PLAN.md`, `COLLABORATIVE_MUD_ARCHITECTURE.md`, `COLLABORATIVE_MUD_MVP.md`, `implementation_plan_vercel_convex_vertical_slice.md`, `implementation_plan_joseon_late_cooperative_live_vertical_slice.md`, `implementation_plan_cooperative_join_security.md`, `implementation_plan_cooperative_group_preview.md`, `implementation_plan_cooperative_virtual_load_test.md`, `implementation_plan_cooperative_live_classroom_recovery.md`, `implementation_plan_cooperative_live_email_auth.md`, `implementation_plan_cooperative_live_theme_alignment.md`, `implementation_plan_early_goryeo_cooperative_live_first_activity.md`, `early_goryeo_cooperative_live_pilot_rough_sketch.md`, `implementation_plan_goryeo_relations_culture_cooperative_live.md`, `implementation_plan_goryeo_classroom_readiness.md`, `implementation_plan_preview_owned_auth.md`, `tasks_classroom_recovery_preview.md`, `tasks_cooperative_live_classroom_recovery.md`, `tasks_cooperative_live_theme_alignment.md`, `tasks_goryeo_classroom_readiness.md`, `tasks_goryeo_relations_culture_cooperative_live.md`, `tasks_student_join_preview_verification.md`, `tasks_classroom_oct29_audit.md`(주제 정정으로 무효)
- 감사(`docs/audits/`): `convex_elementary_school_privacy_audit.md`, `cooperative_live_deployment_rehearsal_20260928.md`, `early_goryeo_cooperative_live_review.md`
- 핸드오프(`docs/archive/handoff/`): `codex_cooperative_live_main_handoff_20260908.md`, `claude_early_goryeo_live_result.md`, 그리고 실행 시 grep으로 찾은 실시간 앱 전용 문서(목록은 보고에 포함). 정적 협동·조선 후기 출처 검토처럼 지금도 쓰는 문서는 옮기지 않는다.
- 루트: `CONVEX_VERCEL_NOTES.md`. 커밋 전에 비밀값·학생 정보가 없는지 점검한다(문서는 변수 이름만 적었다고 밝힘).
- `docs/archive/cooperative-live/README.md`를 새로 만든다. 취소 경위(D-038), 보관 태그, 문서 목록을 적는다.
- 링크: BACKLOG·ROADMAP·README·project_context·`docs/plans/README.md`처럼 현재 상태를 담은 문서의 링크는 새 경로로 고친다. INBOX·walkthrough·DECISIONS 본문은 원문 보존을 위해 고치지 않는다. 깨진 링크 목록은 보고에 남긴다.

### 단계 4 — BACKLOG 정리

- `CANCELLED`인 `*-COLLAB-*` 섹션과 실시간 앱 claim(`TASK-20261002-PREVIEW-AUTH`, `TASK-20261001-PREVIEW-OWNED-AUTH`, `TASK-20261002-CLASSROOM-OCT29-AUDIT`, `P1-PREVIEW-AUTH0-CALLBACK`)을 BACKLOG에서 걷어 낸다.
- 걷어 낸 섹션은 원문 그대로 `docs/archive/cooperative-live/BACKLOG_cancelled_20261016.md`로 옮긴다. 원문을 잃지 않게 한다.
- 정적 협동·사이트·콘텐츠처럼 아직 살아 있는 항목은 건드리지 않는다.

### 단계 5 — 루트 정리

- 삭제: `202610021201.png`(참조 없음), `debug.log`(미추적), `extracted_script.js`, `extracted_style.css`(2026-08 구조 안정화 기준선 기록에서만 참조, git 이력에 남음)
- 이동: `다른pc_vscode터미널5개창작업설명.md` → `docs/archive/`. 참조 1곳(`docs/archive/handoff/codex_status_and_requests_20260921.md`)은 핸드오프 원문이라 고치지 않는다.

### 단계 6 — 기록·검증·커밋

- `DECISIONS.md`에 D-040을 추가한다. D-038 규칙 2를 "태그 `archive/cooperative-live-20261016` 보관"으로 개정한다는 내용이다.
- `walkthrough.md`에 완료 항목을 추가한다. `project_context.md`·`README.md`에서 실시간 앱 안내를 걷어 낸다.
- 검증
  - quality-gate 스크립트 전체(`.github/workflows/quality-gate.yml`과 같은 명령)
  - `node --check js/*.js`
  - 정적 협동 4개 활동 시작 화면 로컬 확인
  - 문서 상대 링크 검사(scratch 스크립트)
- 커밋 단위: ① 앱 제거 ② 문서 이동·BACKLOG ③ 루트 정리 ④ 기록. push는 단계별 검증 뒤 한 번에 한다.

## 3. 위험과 되돌리기

- 모든 삭제 대상은 태그나 git 이력으로 되돌릴 수 있다. 예: `git checkout archive/cooperative-live-20261016 -- apps/cooperative-live`
- 원격 브랜치 삭제는 태그 push가 성공한 것을 확인한 뒤에만 한다.
- 다른 세션이 worktree를 쓰고 있지 않은지, 실행 직전에 사용자에게 확인한다(AGENTS.md 다중 에이전트 규칙).
