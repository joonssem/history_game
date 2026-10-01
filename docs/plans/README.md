# docs/plans 인덱스

이 폴더의 계획서가 각각 어떤 상태이고 다음 행동이 무엇인지 한눈에 보기 위한 색인이다. 개별 문서의 내용은 복제하지 않는다.

- 갱신: 2026-09-30
- 완료 이력은 [`walkthrough.md`](../../walkthrough.md), 현재 상태는 [`project_context.md`](../../project_context.md), 미완료 항목은 [`BACKLOG.md`](../../BACKLOG.md)에서 확인한다.
- 계획서의 상태를 바꾸면 이 표도 같이 갱신한다.

- [고려 문화·입장 복구·교사 진행 통합](./implementation_plan_classroom_recovery_integration.md) — 격리 브랜치 구현·자동 검증 완료, 실제 Preview·현장 리허설 대기.

## 상태 표기

| 표기 | 뜻 |
|---|---|
| `검토안` | 설계만 작성. 구현 승인 전 |
| `제안` | 착수 전 사용자·에이전트 확정 대기 |
| `진행 중` | 일부 반영됐고 남은 확인 항목이 있음 |
| `완료` | 구현·검증이 끝났고 근거 기록으로 보존 |
| `보류` | 사용자 결정으로 중단. 후속 후보로만 보존 |
| `미실행` | 준비는 끝났으나 실제 운영·검증이 없음 |
| `콘텐츠 원본` | 문안은 확보됐고 정적 협동 MUD 제작에 재사용 |

---

## 1. 협동 MUD 계열

이 계열은 문서가 여러 개라 관계를 먼저 본다. **현재 실행 기준은 아래 제작 파이프라인이다** — 고조선 실시간 구현은 기술 회귀 기준으로 유지하며, 고려 초기 활동은 2026-09-29 21명 수업에서 1차 운영했다. 복구 변경과 고려 문화 활동은 격리된 구현 브랜치에서 자동 검증하고, Auth0 callback 및 4~8대 실기기 리허설과 학생 파일럿이 끝나기 전까지 다음 실시간 학급 운영에 쓰지 않는다. 정적 협동 MUD는 다른 차시의 콘텐츠이며 고려 건국·문화 실시간 활동을 대신하지 않는다.

| 문서 | 상태 | 다음 행동 |
|---|---|---|
| [`early_goryeo_cooperative_live_pilot_rough_sketch.md`](./early_goryeo_cooperative_live_pilot_rough_sketch.md) | `구현 계획으로 승격` | 1단원 13차시 “새 고려의 첫 회의”를 첫 실제 학생 활동으로 확정. 상세 실행은 아래 구현 계획 기준 |
| [`implementation_plan_early_goryeo_cooperative_live_first_activity.md`](./implementation_plan_early_goryeo_cooperative_live_first_activity.md) | `21명 실제 수업 1차 운영·복구 검증 대기` | 실제 운영에서 로그인·유령 참가자·전체 진행 차단이 확인됨. 복구 브랜치 인증·4~8대 리허설 뒤 소규모 학생 재시험 |
| [`implementation_plan_goryeo_classroom_readiness.md`](./implementation_plan_goryeo_classroom_readiness.md) | `대체 운영안·체크리스트 및 자동 검증 완료 · 현장 사용 대기` | 인증·개인정보·기기 리허설 전에는 교사 진행형 대체를 사용 |
| [`implementation_plan_goryeo_classroom_activities.md`](./implementation_plan_goryeo_classroom_activities.md) | `격리 브랜치 구현·자동 검증 완료 · 교실 사용 대기` | 고려 건국 복구 기반과 고려 문화 협동 시나리오를 만들고 자동 검사. 주변 나라 관계 활동은 제외 |
| [`implementation_plan_goryeo_relations_culture_cooperative_live.md`](./implementation_plan_goryeo_relations_culture_cooperative_live.md) | `원래 계획 유지 · 문화 별도 구현·검증 완료 · 주변 나라 관계 미착수` | 이번 작업 범위는 하위 링크 [고려 교실 활동 구현 계획](./implementation_plan_goryeo_classroom_activities.md) 참조 |
| [`implementation_plan_joseon_late_cooperative_live_vertical_slice.md`](./implementation_plan_joseon_late_cooperative_live_vertical_slice.md) | `제안·후속 활동` | 고려 첫 활동에서 검증한 엔진에 Claude가 조선 후기를 이식. Codex는 계획·읽기 전용 감사·통합 판정만 담당 |
| [`COLLABORATIVE_MUD_PLAN.md`](./COLLABORATIVE_MUD_PLAN.md) | `검토안` | 전체 계획·모둠 구성·배치 방식. 첫 수직 슬라이스 착수 승인 대기 |
| [`COLLABORATIVE_MUD_ARCHITECTURE.md`](./COLLABORATIVE_MUD_ARCHITECTURE.md) | `검토안` | Convex 스키마·권한·상태 전이. 백엔드는 [D-019](../../DECISIONS.md)로 확정 |
| [`COLLABORATIVE_MUD_MVP.md`](./COLLABORATIVE_MUD_MVP.md) | `검토안` | §8 첫 수직 슬라이스가 다음 구현 단위 |
| [`implementation_plan_vercel_convex_vertical_slice.md`](./implementation_plan_vercel_convex_vertical_slice.md) | `로컬 구현 완료` | `apps/cooperative-live` 가상 흐름·복구·3~24명 편성 검증 완료. Convex/Auth0/Vercel 연결은 개인정보 게이트 뒤 진행 |
| [`implementation_plan_cooperative_mud_gojoseon_law_v01.md`](./implementation_plan_cooperative_mud_gojoseon_law_v01.md) | `완료` · **실제 수업 운영됨** | 결과는 [`EXP-006`](../../EXPERIMENTS.md). 최초 판단 순서는 후속 계획으로 교정 완료 |
| [`implementation_plan_gojoseon_initial_judgment_order.md`](./implementation_plan_gojoseon_initial_judgment_order.md) | `완료` | 6차시를 `역할 → 최초 판단 → 공유 → 추가 증거`로 교정. 실제 수업에서 판단 변화는 재관찰 대기 |
| 정적 협동 MUD 3편 (코드) | `제작 완료` · 6차시 운영됨, 7·8차시 미운영 | `cooperative-mud/`의 `gojoseon-law`·`founding-myths`·`han-river`. 별도 계획서 없이 이 표와 `walkthrough.md`로 관리한다 |
| [`cooperative_prehistory_content_draft.md`](./cooperative_prehistory_content_draft.md) | `콘텐츠 원본` | 선사 3막 문안. 정적 협동 MUD의 원본으로 재사용. 막2·3 역사 사실 재대조 필요 |
| [`implementation_plan_cooperative_prehistory_pilot.md`](./implementation_plan_cooperative_prehistory_pilot.md) | `콘텐츠 원본` | 종이 단계 폐기. 막1부터 정적 협동 MUD로 제작 |
| [`implementation_plan_cooperative_mud_pilot.md`](./implementation_plan_cooperative_mud_pilot.md) | `보류` (2026-09-03) | 한산도. 11월 진도와 불일치로 중단. 후속 후보로만 보존 |
| [`scenario_candidates_artifact_comparison_and_cooperative_mud.md`](./scenario_candidates_artifact_comparison_and_cooperative_mud.md) | `후보 풀` | 25개 시나리오 후보. 다음 확장 소재 선정에 사용 |

**제작 파이프라인**(2026-09-06 확정): `아이디어 확장·고도화 → 정적 협동 MUD 제작·수업 검증 → Vercel + Convex로 발전`. 두 벌을 만드는 것이 아니라 **하나의 콘텐츠를 두 방식으로 활용**한다. 정적 버전은 ① 콘텐츠 검증 ② 다른 교사 배포본 ③ 실시간 장애 폴백의 세 역할을 겸한다. 상세는 [`COLLABORATIVE_MUD_PLAN.md`](./COLLABORATIVE_MUD_PLAN.md) §12.

## 2. 다음 구현 후보

| 문서 | 상태 | 다음 행동 |
|---|---|---|
| [`implementation_plan_evidence_notebook_interface.md`](./implementation_plan_evidence_notebook_interface.md) | `제안` | 착수 전 인터페이스 확정 대기 |

## 3. 진행 중 (남은 확인 항목 있음)

| 문서 | 상태 | 남은 것 |
|---|---|---|
| [`implementation_plan_accessibility_state.md`](./implementation_plan_accessibility_state.md) | `진행 중` | 실제 보조기기 확인 |
| [`implementation_plan_tap_resistance_batch.md`](./implementation_plan_tap_resistance_batch.md) | `진행 중` | 실제 학생 활동 시간 측정 |
| [`implementation_plan_choice_quality_batch.md`](./implementation_plan_choice_quality_batch.md) | `진행 중` | 추가 문맥 오류 점검 |
| [`implementation_plan_sensitive_history_interactions.md`](./implementation_plan_sensitive_history_interactions.md) | `진행 중` | 모바일·최종 시각 점검 |
| [`implementation_plan_registration_single_source.md`](./implementation_plan_registration_single_source.md) | `진행 중` | 보조 MUD 노출·태블릿 확인 |

## 4. 완료 — 근거 기록으로 보존

| 문서 | 대상 |
|---|---|
| [`implementation_plan_track_a_runtime_stabilization.md`](./implementation_plan_track_a_runtime_stabilization.md) | MUD 런타임 상태 정리 |
| [`implementation_plan_design_alignment_vertical_slice.md`](./implementation_plan_design_alignment_vertical_slice.md) | `regular_paleolithic` 대표 수직 슬라이스 |
| [`implementation_plan_if_stage_quality_batch.md`](./implementation_plan_if_stage_quality_batch.md) | IF 스테이지 문장 품질 |
| [`implementation_plan_choice_randomization.md`](./implementation_plan_choice_randomization.md) | 선택지 위치 무작위화 |
| [`implementation_plan_artifact_wording.md`](./implementation_plan_artifact_wording.md) | 유물 이미지·문구 정합성 |
| [`implementation_plan_scene_phase38.md`](./implementation_plan_scene_phase38.md) | 근현대 장면 15개, 장면 사업 종결 |
| [`implementation_plan_student_feedback_p1.md`](./implementation_plan_student_feedback_p1.md) | 학생 피드백 P1 배치 |
| [`implementation_plan_docs_reorganization.md`](./implementation_plan_docs_reorganization.md) | 문서 재배치. 완료된 구조 변경의 근거 |

## 5. 과거 진단 — 현재 기준 아님

| 문서 | 비고 |
|---|---|
| [`implementation_plan_structural_stabilization.md`](./implementation_plan_structural_stabilization.md) | 과거 구조 진단. 제품 코드에 그대로 적용하지 않는다 |

`superseded` 문서는 [`docs/archive/`](../archive/)로 옮긴다. 2026-09-06에 `implementation_plan_mud_depth_expansion.md`와 `cooperative_prehistory_paper_rehearsal_execution.md`(종이 단계 폐기)를 이동했다.

## 명명 규칙

- 파일명은 `implementation_plan_<주제>.md` 소문자 스네이크 케이스를 기본으로 한다.
- `COLLABORATIVE_MUD_*.md` 3종은 대문자 명명으로 먼저 작성됐다. 이름을 바꾸면 이미 기록된 문서 간 링크가 끊기므로 현재는 유지하고, 실시간 앱이 별도 저장소로 분리될 때 함께 정리한다.
- 한국어 본문에서 이 계열을 부를 때는 `협동 MUD`로 통일한다. 파일명의 `cooperative`/`collaborative` 혼용은 위 사정에 따른 것이며 서로 다른 개념이 아니다.

## 2026-10-01 Preview 진행 상태

- [통합 Preview 체크리스트](./tasks_classroom_recovery_preview.md) — 배포·전용 서버 검사 완료, 실제 OAuth·현장 검증 대기.
- [Preview 전용 인증 계획](./implementation_plan_preview_owned_auth.md) — 경로 선택 완료, 앱 생성 직전 확인에서 사용자 요청으로 보류.
- [오늘 세션 인수인계](../handoff/codex_session_close_20261001.md) — 재개 순서와 보존 범위.
