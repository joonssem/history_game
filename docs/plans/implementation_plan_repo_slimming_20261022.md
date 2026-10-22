# 저장소 슬림화 — 지난 문서 보관과 로그 문서 분할

- 작성: 2026-10-22 (Claude)
- 작업: `TASK-20261022-REPO-SLIMMING`
- 상태: `in-progress` — 사용자 실행 승인(2026-10-22 "진행시켜"). 단계마다 멈추고 브리핑한다.
- 범위 밖: 수업 콘텐츠·JS·CSS·MUD 데이터 내용 수정. 문서 본문 문장 수정(경로 링크만 고친다).

## 왜

에이전트가 세션마다 루트 문서를 읽는다. `walkthrough.md`(386KB)·`INBOX.md`(208KB)·`DECISIONS.md`(57KB)가 계속 커지고, `docs/plans/` 50개 중 대부분이 완료 문서이며 `docs/handoff/` 61개는 Claude 단독 진행(D-038·D-044) 이후 쓰지 않는다. 현재 할 일과 지난 기록을 폴더로 갈라 읽는 양을 줄인다.

## 링크 처리 원칙

- 파일을 옮기면 저장소 전체 `.md`의 상대 링크와 저장소 루트 기준 경로 표기(`docs/handoff/x.md`)를 새 경로로 바꾼다. 옮겨진 문서 안의 상대 링크도 새 위치 기준으로 다시 계산한다.
- INBOX·walkthrough·DECISIONS도 **경로 문자열만** 바꾼다. 문장은 고치지 않는다. 이전 정리(2026-10-16)는 이 세 문서의 링크를 고치지 않아 깨진 링크가 남았는데, 경로만 바꾸는 것은 원문 보존과 충돌하지 않는다고 판단했다.
- 이동 전후 깨진 링크 수를 세어 늘지 않았는지 확인한다.

## 단계 A — 지난 문서 보관·루트 정리

1. `docs/plans/` 완료 문서 16개 → `docs/archive/plans/`
   - `backlog_priority_review_20261019`, `implementation_plan_artifact_wording`, `implementation_plan_cause_effect_order_game`, `implementation_plan_choice_randomization`, `implementation_plan_cooperative_mud_gojoseon_law_v01`, `implementation_plan_design_alignment_vertical_slice`, `implementation_plan_docs_reorganization`, `implementation_plan_gojoseon_initial_judgment_order`, `implementation_plan_if_stage_quality_batch`, `implementation_plan_readme_refresh_20260909`, `implementation_plan_repo_cleanup_20261016`, `implementation_plan_scene_phase38`, `implementation_plan_structural_stabilization`, `implementation_plan_student_feedback_p1`, `implementation_plan_track_a_runtime_stabilization`, `implementation_plan_static_coop_goryeo`
   - 상태 표기가 낡아 판단을 미룬 문서(남겨 둠): `implementation_plan_lesson_track_ui`, `implementation_plan_personal_timeline`, `story_mud_relationship`, `tasks_site_structure`, `classroom_observation_*`. 사용자 확인 뒤 옮긴다.
2. `docs/handoff/` 전체 61개 → `docs/archive/handoff/`
3. 루트 문서 이동
   - `activity_duration_audit.md` → `docs/audits/` (`scripts/07_audit_activity_duration.py`와 CI 경로도 바꾼다)
   - `TEACHING_artifact_comparison.md`, `USER_FLOWS.md`, `WIREFRAMES.md`, `BROWSER_REGRESSION_CHECKLIST.md` → `docs/product/`
   - `simulator_contract.json`은 `scripts/04`가 읽는 계약 파일이라 이번에는 두지 않고 남긴다.
4. `agents.md` → `AGENTS.md` (대소문자 구분 환경에서 Codex·Claude가 찾을 수 있게)
5. `docs/plans/README.md`에 이동 사실을 한 줄 남긴다.

검증: 깨진 링크 수 비교, `python scripts/07_audit_activity_duration.py` 후 `git diff --exit-code` 대상 경로 확인, CI 검증 스크립트 전체 실행.

## 단계 B — 로그 문서 분할

- `walkthrough.md`: 2026-10-01 이후만 루트에 두고, 그 전은 `docs/archive/walkthrough/2026-08.md`·`2026-09.md`로 월별 이동. 루트 상단에 보관 위치 안내.
- `INBOX.md`: `처리 상태`가 끝난 원문을 `docs/archive/inbox/`로 옮겨 보존. 사용자가 쓰는 문서라 분할 기준은 단계 시작 전에 사용자에게 확인한다.
- `DECISIONS.md`: 폐기·대체된 결정 본문 분리는 결정 번호 링크가 많아 단계 B 끝에 따로 판단한다.

## 단계 C — 스크립트 정리

- `scratch/`의 상시 도구(`gen_coop_activity.js`, `check_static_coop_scenario.js`, `gen_scene_art*.js`, `gen_scene_gallery.js`, `verify_scene_art.js`, `e2e_*.js`, `shot_*.js`)를 `scripts/coop/`·`scripts/scene_art/`로 옮기고 사용 주석·생성 HTML 주석 경로를 바꾼다.
- 적용이 끝난 일회성 스크립트(`03_…`~`23_…`, `_patch_*`, `_reg.js`, `_scenes.js`, `_targets.txt`, `vercel_ascii_hostname.cjs`)는 git 이력에 맡기고 삭제한다.
- `scripts/` 번호 중복(`09` 2개)은 이름만 바꾸면 문서 참조가 많이 깨지므로 BACKLOG에만 기록한다.

## 나중 (BACKLOG에만 기록)

- `js/mudSimulators.js`(180KB) 단원별 분리 검토
- `gen_scene_art*.js` 4개를 단원 인자를 받는 생성기 하나로 통합
- 검증 스크립트 일괄 실행기 하나로 CI와 로컬 명령 일치
