# Codex 인수인계 — 문서 재배치 후 링크 수정 요청 (2026-09-01)

## 1. 작업 커밋

- 이동 작업은 아직 `git commit` 전 상태(작업 트리에 스테이징됨)다. 사용자 확인 후 별도 커밋으로 기록될 예정이며, 커밋되면 이 절을 커밋 해시로 갱신한다.
- 근거 계획서: [`implementation_plan_docs_reorganization.md`](../plans/implementation_plan_docs_reorganization.md)

## 2. 변경 파일과 단계

루트에 평면 나열되어 있던 `.md` 62개 중 47개(+ 계획서 자신 1개)를 `git mv`로 아래처럼 재배치했다. 콘텐츠·`scene`·핫스팟·`interaction`·`completion` 등 게임 로직/데이터는 전혀 건드리지 않았다 — 순수 파일 위치 이동이다.

| 대상 | 이동 전 | 이동 후 |
|---|---|---|
| 감사·점검 리포트 11개 | 루트 | `docs/audits/` |
| 구현 계획서 14개 | 루트 | `docs/plans/` |
| 에이전트 인수인계/지시 16개 | 루트 | `docs/handoff/` |
| 과거 기록 6개 + `interim_reports/` 3개 | 루트 / `interim_reports/` | `docs/archive/` (`interim_reports/`는 `docs/archive/interim_reports/`로 병합, 원래 폴더는 삭제됨) |

**루트에 남긴 파일(그대로 유지, 이동하지 않음)**: `README.md`, `agents.md`, `project_context.md`, `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `walkthrough.md`, `activity_duration_audit.md`, `INBOX.md`, `EXPERIMENTS.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `USER_FLOWS.md`, `WIREFRAMES.md`, `BROWSER_REGRESSION_CHECKLIST.md`. Codex 소유 7개 문서는 이 목록에 포함되며 경로가 전혀 바뀌지 않았다.

## 3. `scene`/핫스팟/`interaction`/`completion` 변경 여부

없음. `data/mud/*.json`, `js/*.js` 등 게임 로직·콘텐츠 파일은 전혀 이동·수정하지 않았다.

## 4. 실행한 검증

- `git mv` 후 `git status`로 전 항목이 `R`(rename)로 추적됨을 확인 — 히스토리 보존.
- Sonnet이 직접 수정 가능한 3개 파일(`README.md`, `docs/plans/implementation_plan_mud_depth_expansion.md`, `docs/plans/implementation_plan_student_feedback_p1.md`)의 링크 6건을 새 경로로 수정 후, `realpath`로 실제 파일 존재를 개별 확인함(모두 OK).
- **Codex 소유 문서 3개는 이 세션에서 편집하지 않았다** — 아래 §5 표가 그 이유와 필요한 수정 내용이다.

## 5. Codex가 처리해야 할 링크 수정 (총 13건)

Sonnet은 `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `walkthrough.md`, `agents.md`, `activity_duration_audit.md`를 직접 편집하지 않는 원칙에 따라, 아래 표의 수정을 Codex에게 위임한다. `PRD.md`, `DECISIONS.md`, `agents.md`, `activity_duration_audit.md`는 grep 전수 확인 결과 이동 대상 파일에 대한 링크가 없어 수정이 필요 없다.

| 문서 | 줄 | 현재 링크(깨짐) | 새 경로 |
|---|---|---|---|
| `BACKLOG.md` | 18 | `./student_feedback_idea_note.md` | `./docs/archive/student_feedback_idea_note.md` |
| `BACKLOG.md` | 18 | `./student_ideas_strategy_consult_brief.md` | `./docs/archive/student_ideas_strategy_consult_brief.md` |
| `BACKLOG.md` | 24 | `./student_feedback_idea_note.md` | `./docs/archive/student_feedback_idea_note.md` |
| `BACKLOG.md` | 35 | `./choice_bias_audit.md` | `./docs/audits/choice_bias_audit.md` |
| `BACKLOG.md` | 61 | `./implementation_plan_design_alignment_vertical_slice.md` | `./docs/plans/implementation_plan_design_alignment_vertical_slice.md` |
| `BACKLOG.md` | 68 | `./implementation_plan_tap_resistance_batch.md` | `./docs/plans/implementation_plan_tap_resistance_batch.md` |
| `BACKLOG.md` | 75 | `./implementation_plan_if_stage_quality_batch.md` | `./docs/plans/implementation_plan_if_stage_quality_batch.md` |
| `BACKLOG.md` | 80 | `./implementation_plan_accessibility_state.md` | `./docs/plans/implementation_plan_accessibility_state.md` |
| `BACKLOG.md` | 85 | `./implementation_plan_registration_single_source.md` | `./docs/plans/implementation_plan_registration_single_source.md` |
| `BACKLOG.md` | 126 | `./if_stage_audit.md` | `./docs/audits/if_stage_audit.md` |
| `BACKLOG.md` | 131 | `./artifact_audit.md` | `./docs/audits/artifact_audit.md` |
| `BACKLOG.md` | 138 | `./implementation_plan_registration_single_source.md` | `./docs/plans/implementation_plan_registration_single_source.md` |
| `walkthrough.md` | 98 | `./implementation_plan_if_stage_quality_batch.md` | `./docs/plans/implementation_plan_if_stage_quality_batch.md` |
| `project_context.md` | 292 | `./implementation_plan_registration_single_source.md` | `./docs/plans/implementation_plan_registration_single_source.md` |

`BACKLOG.md:143`의 `./BROWSER_REGRESSION_CHECKLIST.md`는 루트에 그대로 있으므로 수정 불필요.

## 6. Codex 작업과 충돌할 수 있는 파일

- `BACKLOG.md`, `walkthrough.md`, `project_context.md` — 위 §5 수정 대상. Codex가 같은 시점에 이 파일들을 편집 중이라면 병합 시 §5 표를 기준으로 링크만 추가 반영해달라.
- 그 외 이동된 47개 파일 자체의 **본문 내용은 이번 작업에서 수정하지 않았다** — 파일명·위치만 바뀌었으므로 Codex가 기존에 참조하던 상대 링크(`./choice_bias_audit.md` 등)를 절대/신규 상대 경로로 다시 걸어주기만 하면 된다.

## 7. 후속 검토가 필요한 항목

- `scratch/` → `production_scripts/` 이름 변경은 이번 범위에서 보류함(계획서 §보류 사항 참고). 결정되면 별도 커밋으로 처리한다.
- 그룹 A(루트 유지 15개 문서)를 향후 `docs/core/`로 옮길지 여부는 Codex 소유 문서 경로가 걸려 있어 이번에는 진행하지 않았다. 필요하면 별도 계획·별도 승인으로 진행한다.
- 이 핸드오프 문서 자체와 계획서(`implementation_plan_docs_reorganization.md`)의 커밋 여부는 사용자 확인 후 진행 예정.
