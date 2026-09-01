# 구현 계획: 루트 문서 재배치 (docs/ 폴더 도입)

## 상태

`completed` — 2026-09-01 문서 재배치 4단계와 Codex 링크 수정이 완료되었고, 관련 커밋이 `origin/main`에 반영되었다. 이 문서는 실행 계획이 아니라 완료된 구조 변경의 근거 기록으로 보존한다.

## 배경

루트에 `.md` 파일 62개가 폴더 구분 없이 평면 나열되어 있다. `PRD.md`·`DECISIONS.md` 같은 정본 기획 문서와 `claude_code_next_review_message.md` 같은 1회성 에이전트 전달 메모가 같은 위치·같은 무게로 보여 신규 참여자(사람·에이전트 모두)가 "지금 유효한 기준 문서"와 "지나간 작업 기록"을 파일 위치만으로 구분할 수 없다. 이 계획은 저장소를 실제로 움직이는 코드([[history-game-agent-split]] 기준 Codex 소유 7개 문서 포함)를 건드리지 않고 **파일 배치만** 정리하는 것을 범위로 한다. 콘텐츠·코드·검증 로직 변경은 포함하지 않는다.

## 제약 조건 (반드시 지킬 것)

1. Codex가 소유한 7개 문서 — `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `walkthrough.md`, `agents.md`, `activity_duration_audit.md` — 는 Sonnet이 직접 내용을 수정하지 않는다([[history-game-agent-split]]). 이 계획은 이 7개 파일의 **경로도 옮기지 않는다** — 옮기면 내부 링크 수정이 불가피한데, 그 수정은 Codex 소유 문서에 손대는 것이 되기 때문이다.
2. `README.md`는 GitHub가 저장소 루트에서 자동 렌더링하므로 이동하지 않는다.
3. `scripts/07_audit_activity_duration.py`가 `activity_duration_audit.md`를 루트에 직접 갱신하므로, 이 파일이 루트에 남아야 스크립트 경로 수정이 불필요하다.
4. `git mv`로 이동해 히스토리를 보존한다. 파일 내용은 이동 자체만으로는 수정하지 않는다(링크 경로 수정은 별도 단계).

## 현재 감사 결과 (분류)

루트 `.md` 62개 + `interim_reports/` 3개를 4개 그룹으로 분류했다.

### 그룹 A — 핵심 기획 문서 (14개, **이동하지 않음**, 루트 유지)

`README.md`가 "관련 문서"로 색인하는 문서 + `activity_duration_audit.md`. Codex 소유 7개를 포함한다.

```text
agents.md, project_context.md, PRD.md, BACKLOG.md, INBOX.md, EXPERIMENTS.md,
ROADMAP.md, ARCHITECTURE.md, DECISIONS.md, walkthrough.md, TECH_STACK.md,
USER_FLOWS.md, WIREFRAMES.md, BROWSER_REGRESSION_CHECKLIST.md, activity_duration_audit.md
```
(15개 — `activity_duration_audit.md` 포함)

### 그룹 B — 감사·점검 리포트 → `docs/audits/` (11개)

```text
artifact_audit.md, choice_bias_audit.md, content_claim_audit.md,
curriculum_alignment_report_2022.md, historical_language_audit.md,
if_stage_audit.md, ipad_ux_regression_report.md, pilot_mapping_report_2022.md,
sensitive_history_crosscheck_report.md, simulator_report.md,
baseline_report_structural_stabilization.md
```

### 그룹 C — 구현 계획서 → `docs/plans/` (13개, 이 문서 완료 후 자기 자신 포함 14개)

```text
implementation_plan_accessibility_state.md, implementation_plan_artifact_wording.md,
implementation_plan_choice_quality_batch.md, implementation_plan_choice_randomization.md,
implementation_plan_design_alignment_vertical_slice.md, implementation_plan_if_stage_quality_batch.md,
implementation_plan_mud_depth_expansion.md, implementation_plan_registration_single_source.md,
implementation_plan_scene_phase38.md, implementation_plan_sensitive_history_interactions.md,
implementation_plan_structural_stabilization.md, implementation_plan_student_feedback_p1.md,
implementation_plan_tap_resistance_batch.md
```

### 그룹 D — 에이전트 간 인수인계/지시 → `docs/handoff/` (16개)

```text
claude_code_artifact_image_crosscheck_instruction.md, claude_code_artifact_image_fix_instruction.md,
claude_code_if_sejong_approval_instruction.md, claude_code_latest_learning_directive.md,
claude_code_next_review_instruction.md, claude_code_next_review_message.md,
claude_code_post_phase38_regression_instruction.md, claude_code_reactivation_brief.md,
claude_code_remaining_work_instruction.md, claude_code_remaining_work_message.md,
claude_code_sensitive_history_crosscheck_instruction.md, claude_code_task_instruction.md,
codex_if_stage_review.md, codex_tap_resistance_priority.md,
phase37_codex_handoff.md, phase38_codex_handoff.md
```

### 그룹 E — 과거 기록·참고 자료 → `docs/archive/` (6개 + `interim_reports/` 3개 병합)

```text
tasks_structural_stabilization.md, simulator_runtime_architecture.md, simulator_schema.md,
student_feedback_idea_note.md, student_ideas_strategy_consult_brief.md,
역사-MUD-멀티에이전트-프로젝트-착수안.md
+ interim_reports/01~03 (파일명 유지, docs/archive/interim_reports/로 병합)
```

### 그룹 F — 이름만 수정 (이동 아님)

- `scratch/` → `production_scripts/` 이름 변경 검토. 실제로는 22개 프로덕션 콘텐츠 변환 스크립트가 들어 있어 "버려도 되는 임시 코드"라는 현재 이름이 오해를 부른다. (별도 승인 사항 — 이 계획의 필수 범위 아님, 보류 사항에 기록)

## 목표 결과

- 루트 `.md`: 62개 → 15개 (그룹 A만 유지)
- `docs/audits/`, `docs/plans/`, `docs/handoff/`, `docs/archive/` 4개 신설 폴더로 47개 문서 이동
- 그룹 A 문서들의 경로·상호 링크는 전부 무변경 (모두 루트에 그대로 있으므로)

## 구현 순서

### 1단계 — 매핑 확정 (사용자 승인 대상)

- 위 A~F 분류를 사용자가 검토·확정한다. 특히 그룹 E(아카이브 대상)는 "과거 기록"으로 접기 전에 현재도 참조되는 문서가 없는지 확인이 필요하다.
- 승인 후에만 2단계 진행.

### 2단계 — 파일 이동 (`git mv`)

- `docs/audits/`, `docs/plans/`, `docs/handoff/`, `docs/archive/`, `docs/archive/interim_reports/` 생성.
- 그룹 B~E 파일을 각각 `git mv`로 이동. 그룹 A와 스크립트·데이터 파일은 건드리지 않는다.
- 이 계획서 자신(`implementation_plan_docs_reorganization.md`)은 완료 후 `docs/plans/`로 이동한다.

### 3단계 — Sonnet 편집 권한 범위 내 링크 수정

다음은 Codex 소유 문서가 **아니므로** Sonnet이 직접 수정한다.

- `README.md`: "관련 문서" 목록 중 그룹 B~E를 가리키는 링크가 있다면 새 경로로 수정(현재 확인 결과 README의 그룹 B~E 직접 링크는 `curriculum_alignment_report_2022.md`, `activity_duration_audit.md` 2건 — 후자는 그룹 A라 무변경, 전자만 `./docs/audits/curriculum_alignment_report_2022.md`로 수정).
- 이동한 파일들 자기 자신 내부의 상호 링크(그룹 B~E 파일이 서로를 링크하는 경우) — 새 상대 경로로 수정.
- 이동한 파일이 그룹 A 문서를 링크하는 경우 — `../../파일명.md` 형태로 상대 경로 깊이만 보정.

### 4단계 — Codex 조율 필요 (Sonnet이 대신 수정하지 않음)

grep으로 확인한 결과, Codex 소유 7개 문서 중 `BACKLOG.md`와 `walkthrough.md`에 이동 대상 파일을 가리키는 링크가 있다. **Sonnet은 이 두 파일을 편집하지 않는다.** 대신 아래 표를 `docs/handoff/`에 새 인수인계 문서(`docs_reorg_codex_handoff.md`)로 남겨 Codex가 처리하도록 요청한다.

| 문서 | 줄 | 현재 링크 | 이동 후 새 경로 |
|---|---|---|---|
| `BACKLOG.md` | 18, 24 | `./student_feedback_idea_note.md` | `./docs/archive/student_feedback_idea_note.md` |
| `BACKLOG.md` | 18 | `./student_ideas_strategy_consult_brief.md` | `./docs/archive/student_ideas_strategy_consult_brief.md` |
| `BACKLOG.md` | 35 | `./choice_bias_audit.md` | `./docs/audits/choice_bias_audit.md` |
| `BACKLOG.md` | 61 | `./implementation_plan_design_alignment_vertical_slice.md` | `./docs/plans/implementation_plan_design_alignment_vertical_slice.md` |
| `BACKLOG.md` | 68 | `./implementation_plan_tap_resistance_batch.md` | `./docs/plans/implementation_plan_tap_resistance_batch.md` |
| `BACKLOG.md` | 75 | `./implementation_plan_if_stage_quality_batch.md` | `./docs/plans/implementation_plan_if_stage_quality_batch.md` |
| `BACKLOG.md` | 80 | `./implementation_plan_accessibility_state.md` | `./docs/plans/implementation_plan_accessibility_state.md` |
| `BACKLOG.md` | 85, 138 | `./implementation_plan_registration_single_source.md` | `./docs/plans/implementation_plan_registration_single_source.md` |
| `BACKLOG.md` | 126 | `./if_stage_audit.md` | `./docs/audits/if_stage_audit.md` |
| `BACKLOG.md` | 131 | `./artifact_audit.md` | `./docs/audits/artifact_audit.md` |
| `walkthrough.md` | 98 | `./implementation_plan_if_stage_quality_batch.md` | `./docs/plans/implementation_plan_if_stage_quality_batch.md` |

- `PRD.md`, `DECISIONS.md`, `project_context.md`는 그룹 A(루트 유지) 문서만 링크하고 있어 수정 불필요함을 확인함.
- 2단계(`git mv`) 실행 직후 이 표를 근거로 Codex가 두 파일의 링크만 일괄 치환하면 된다 — 다른 수정은 필요 없다.

## 완료 기준

- 루트 `.md` 파일이 15개(그룹 A)로 줄어든다.
- `git log --follow`로 이동된 각 파일의 히스토리가 보존됨을 확인한다.
- README와 이동된 문서들 내부 링크가 깨지지 않는다 (`scripts/06_validate_static_assets.py` 등 기존 검증에 문서 링크 검사가 없다면, 수동으로 전수 클릭 확인).
- `BACKLOG.md`·`walkthrough.md`의 11개 링크가 Codex에 의해 새 경로로 갱신된다.
- 그룹 A 7개 Codex 소유 문서의 내용·경로가 전혀 변경되지 않는다.

## 보류 사항

- 그룹 E(아카이브) 문서 중 여전히 능동적으로 참조되는 문서가 있는지 최종 확인 필요.
- `scratch/` → `production_scripts/` 이름 변경 여부 (이 계획과 독립적으로 결정 가능).
- 그룹 A 자체를 향후 `docs/core/`로 옮길지 여부 — Codex 소유 문서 경로 변경이 걸려 있어 별도 계획·별도 승인 없이는 진행하지 않는다.
- `data_contents/`(원본 교수학습과정안 HTML)와 `primary_data/`(원본 커리큘럼 PDF/JSON)는 이번 범위에 포함하지 않음 — 소스 자료 폴더로 이미 목적이 명확함.
