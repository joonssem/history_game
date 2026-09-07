# docs/plans 인덱스

이 폴더의 계획서가 각각 어떤 상태이고 다음 행동이 무엇인지 한눈에 보기 위한 색인이다. 개별 문서의 내용은 복제하지 않는다.

- 갱신: 2026-09-07
- 완료 이력은 [`walkthrough.md`](../../walkthrough.md), 현재 상태는 [`project_context.md`](../../project_context.md), 미완료 항목은 [`BACKLOG.md`](../../BACKLOG.md)에서 확인한다.
- 계획서의 상태를 바꾸면 이 표도 같이 갱신한다.

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

이 계열은 문서가 여러 개라 관계를 먼저 본다. **현재 실행 기준은 아래 제작 파이프라인이다** — 아이디어 고도화 후 정적 협동 MUD를 먼저 만들고, 검증 뒤 실시간으로 발전시킨다.

| 문서 | 상태 | 다음 행동 |
|---|---|---|
| [`COLLABORATIVE_MUD_PLAN.md`](./COLLABORATIVE_MUD_PLAN.md) | `검토안` | 전체 계획·모둠 구성·배치 방식. 첫 수직 슬라이스 착수 승인 대기 |
| [`COLLABORATIVE_MUD_ARCHITECTURE.md`](./COLLABORATIVE_MUD_ARCHITECTURE.md) | `검토안` | Convex 스키마·권한·상태 전이. 백엔드는 [D-019](../../DECISIONS.md)로 확정 |
| [`COLLABORATIVE_MUD_MVP.md`](./COLLABORATIVE_MUD_MVP.md) | `검토안` | §8 첫 수직 슬라이스가 다음 구현 단위 |
| [`implementation_plan_vercel_convex_vertical_slice.md`](./implementation_plan_vercel_convex_vertical_slice.md) | `진행 중` | `apps/cooperative-live`·고조선·가상 학생 8명·Auth0 교사 인증 구현 및 검증 |
| [`implementation_plan_cooperative_mud_gojoseon_law_v01.md`](./implementation_plan_cooperative_mud_gojoseon_law_v01.md) | `완료` · **실제 수업 운영됨** | 결과는 [`EXP-006`](../../EXPERIMENTS.md). 화면 순서 수정(P2-COLLAB-02)이 남음 |
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
