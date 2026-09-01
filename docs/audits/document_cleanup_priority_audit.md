# 문서 정리 우선순위 감사 보고서

작성: Claude (Sonnet 5) · 작성일: 2026-09-01 · 기준 커밋: `b07a7d2`(`origin/main`과 일치)
근거 지시서: [`claude_code_document_cleanup_priority.md`](../handoff/claude_code_document_cleanup_priority.md)

> 이 보고서는 읽기·분류·보고만 수행했다. 어떤 파일도 삭제·이동·이름변경·병합하지 않았고, `PRD.md`/`BACKLOG.md`/`DECISIONS.md`/`project_context.md`/`walkthrough.md`/`agents.md`/`activity_duration_audit.md`는 편집하지 않았다. 커밋·push도 하지 않았다.

## A. 요약

- 조사한 문서 수: 구현 계획서 14개(지시서 지정 9개 + 참고 확인 5개) + 핸드오프 18개 + 감사 문서 11개 = **43개**
- **가장 먼저 정리할 문서 5개** (상태 문구가 실제 사실과 모순되는 순서):
  1. `docs/plans/implementation_plan_docs_reorganization.md` — 상단 상태가 `proposed`이지만 실제로는 4단계 전부 실행·커밋(`7581795`)·Codex 링크 반영(`b07a7d2`)까지 push 완료됨.
  2. `docs/handoff/docs_reorg_codex_handoff.md` — §1이 "아직 git commit 전"이라고 적혀 있는데, 같은 문서 하단 "## Codex 회신"은 이미 반영 완료를 보고함. 문서 내부 자기모순.
  3. `docs/handoff/phase37_codex_handoff.md` — "push는 사용자 요청으로 보류 중"이라 적혀 있지만, `implementation_plan_scene_phase38.md`가 "Phase 37 완료·커밋·푸시(`5cb5e6b`)"로 이미 push까지 확정했다고 명시.
  4. `docs/handoff/phase38_codex_handoff.md` — "아직 push 안 함 — 사용자 승인 대기"라 적혀 있지만, 이후 지시서(`claude_code_post_phase38_regression_instruction.md`)가 이 커밋을 이미 지난 부모 커밋으로 인용함.
  5. `docs/plans/implementation_plan_tap_resistance_batch.md` ↔ `BACKLOG.md` 수치 불일치 — 계획서는 "4개 MUD 반영", `BACKLOG.md`는 "주요 5개 MUD 반영"으로 서로 다른 숫자를 기재.

- **즉시 정리하면 안 되는 문서** (현재도 활성 작업의 근거로 쓰이는 중): `implementation_plan_student_feedback_p1.md`(항목 C 미구현), `implementation_plan_choice_quality_batch.md`, `implementation_plan_sensitive_history_interactions.md`, `implementation_plan_registration_single_source.md`, `implementation_plan_accessibility_state.md`, `implementation_plan_tap_resistance_batch.md`, `docs/handoff/codex_tap_resistance_priority.md`.
- **보존 필수 문서**: `docs/audits/curriculum_alignment_report_2022.md`(README가 직접 인용), `docs/audits/if_stage_audit.md`·`choice_bias_audit.md`(BACKLOG가 직접 인용하며 반복 갱신됨), `docs/handoff/phase37_codex_handoff.md`·`phase38_codex_handoff.md`(장면 작업 커밋 히스토리의 유일한 상세 근거).

## B. 계획서 판정표 (`docs/plans/`, 14개)

| 파일 | 현재 상태 | 권장 상태 | 근거 | 다음 조치 |
|---|---|---|---|---|
| `implementation_plan_accessibility_state.md` | in-progress | active | `BACKLOG.md` P2-01 "in-progress — 실제 보조기기 확인 대기"와 정확히 일치 | 유지, 실기기 확인 후 completed 전환 |
| `implementation_plan_artifact_wording.md` | completed | archive | walkthrough "유물 아이콘·보상 토스트 정합성 수정 확인" 완료 기록과 일치, 후속 작업 없음 | 정리 후보 |
| `implementation_plan_choice_quality_batch.md` | in-progress | active | `choice_randomization`·`student_feedback_p1` 둘 다 이 문서를 후속 단일 출처로 지목, 격차 71개 중 13개만 1차 반영 | 유지, 배치 2 진행 대기 |
| `implementation_plan_choice_randomization.md` | completed | archive | walkthrough "선택지 무작위화 계획 상태 정정" 항목에서 이미 completed로 확정, 후속은 choice_quality_batch로 이관됨 | 정리 후보 |
| `implementation_plan_design_alignment_vertical_slice.md` | completed | archive | `BACKLOG.md` "완료: 820×1180 Chrome 점검 통과"와 일치 | 정리 후보 |
| `implementation_plan_docs_reorganization.md` | `proposed`(문서 표기) | **completed로 갱신 필요** | 본 세션에서 4단계 전부 실행, 커밋 `7581795`/`431cada`, Codex 링크 반영 `b07a7d2`까지 push 완료 확인 | **최우선**: 상태 필드 갱신 |
| `implementation_plan_if_stage_quality_batch.md` | completed | archive | `BACKLOG.md` P1-03 completed와 일치, walkthrough "IF 승인 및 세종 simulator 중복 키 정리" 확인 | 정리 후보 |
| `implementation_plan_mud_depth_expansion.md` | superseded(문서 표기) | archive | walkthrough에서 이미 superseded로 확정 기록됨 — 상태 필드는 이미 정확 | 이동만 검토(내용 수정 불필요) |
| `implementation_plan_registration_single_source.md` | in-progress | active | `BACKLOG.md` P2-03 in-progress와 정확히 일치 | 유지 |
| `implementation_plan_scene_phase38.md` | 상태 필드 없음 | **completed(필드 신설 필요)** | walkthrough "2026-09-01 — Phase 38 Codex 승인 확인": scene 15개 전부 반영·검증·사용자 검토 통과 확인 | 상태 필드 추가 후 archive |
| `implementation_plan_sensitive_history_interactions.md` | in-progress | active | "모바일·최종 시각 점검 대기" 남음 | 유지 |
| `implementation_plan_structural_stabilization.md` | 명시적 상태 필드 없음(원 진단 문서, 2026-08-26) | **superseded(재분류 필요)** | 개별 권고 대부분이 이후 `choice_randomization`/`tap_resistance_batch`/`if_stage_quality_batch`/`accessibility_state`/`registration_single_source`/`design_alignment_vertical_slice`/`artifact_wording`로 분리·구현됨. 교사 대시보드 비도입 등 결정은 `DECISIONS.md`/`ARCHITECTURE.md`가 이미 흡수 | 상태 `superseded` 명시 + 세부 계획서 매핑 각주 추가 |
| `implementation_plan_student_feedback_p1.md` | 항목별 구분(A 중복·미실행, B Codex 완료, C 실행 대상) | active(항목 C 한정) | `js/miniGames.js`에 `startRestorationGame` 없음, `data/artifacts.json`에 `restoreClues` 없음 — 항목 C(유물 복원 퍼즐) 미구현 확인 | 유지, 문서 제목대로 "항목 C 전용" 계속 사용 |
| `implementation_plan_tap_resistance_batch.md` | in-progress(4개 MUD 반영) | active, **수치 정정 필요** | `BACKLOG.md`는 "주요 5개 MUD 반영"으로 기재해 이 계획서의 "4개"와 불일치 | 실제 반영 MUD 목록 재확인 후 두 문서 수치 통일 (BACKLOG는 Codex 소유이므로 Codex 조율 필요) |

## C. 핸드오프 판정표 (`docs/handoff/`, 18개)

| 파일 | 유형 | 활성 여부 | 중복·충돌 | 권장 조치 |
|---|---|---|---|---|
| `claude_code_artifact_image_crosscheck_instruction.md` | 검증 지시서 | 완료 | 없음(승인판 `_fix_instruction`으로 이어짐) | archive |
| `claude_code_artifact_image_fix_instruction.md` | 승인된 수정 지시서 | 완료 | walkthrough "유물 아이콘·보상 토스트 정합성 수정 확인"과 일치 | archive |
| `claude_code_document_cleanup_priority.md` | 작업 지시서 | **진행 중(본 보고서 대상)** | 없음 | 이 감사 완료 후 archive |
| `claude_code_if_sejong_approval_instruction.md` | 승인 요청 지시서 | 완료 | `remaining_work_instruction`이 "IF 6개 승인 완료·세종 키 정리 완료"로 재확인 | archive |
| `claude_code_latest_learning_directive.md` | Codex→Claude 콘텐츠 기준 문서 | 완료(Phase 38 반영 종료) | `phase38_codex_handoff.md`와 내용 중첩 | archive(장면 작업 근거로 보존) |
| `claude_code_next_review_instruction.md` | 작업 지시서 | 완료 | 출력물 = `codex_if_stage_review.md` + walkthrough "문서 상태 대조 1차 정리" | archive |
| `claude_code_next_review_message.md` | **단순 전달 메시지** | 완료 | instruction 본체와 내용 100% 중복 | **정리 우선순위 1순위** — archive/삭제 후보 |
| `claude_code_post_phase38_regression_instruction.md` | 회귀 점검 지시서 | 완료 | walkthrough 607~644 각 P-번호 브라우저 회귀 항목으로 반영 확인 | archive |
| `claude_code_reactivation_brief.md` | 역할·경계 재확인 브리프 | 개념은 유효하나 내용은 `agents.md`와 중복 | `agents.md`가 같은 경계 규칙의 대표 소유 문서 | archive(핵심 규칙은 agents.md 기준) |
| `claude_code_remaining_work_instruction.md` | 작업 지시서 | 완료 | walkthrough 607~644 항목들로 반영 확인 | archive |
| `claude_code_remaining_work_message.md` | **단순 전달 메시지** | 완료 | instruction 본체와 내용 중복 | **정리 우선순위 1순위** — archive/삭제 후보 |
| `claude_code_sensitive_history_crosscheck_instruction.md` | 검증 지시서 | 완료 | 출력물 = `sensitive_history_crosscheck_report.md`, walkthrough "민감 역사 glossary 표현 완화" | archive |
| `claude_code_task_instruction.md` | 작업 재개 지시서 | 완료(Phase 38 완료) | `phase38_codex_handoff.md`의 근거 문서로 상호 참조 | archive(상호 참조 유지) |
| `codex_if_stage_review.md` | Codex 1차 검토 결과 | **상태 문구 stale** | "사용자 최종 승인 대기"라 적혀 있으나 walkthrough 721·805에서 이미 최종 승인 완료로 확정됨 | archive, 단 문구 정정은 Codex 소유 판단 필요 |
| `codex_tap_resistance_priority.md` | Codex 1차 분류 | **active** | `tap_resistance_batch` 진행 중 계획서가 근거 목록으로 계속 참조 중; 이 문서의 "40개 후보"와 계획서·BACKLOG의 반영 수치(4/5개)가 나란히 있어 진행률 표기가 문서마다 흩어짐 | 유지 |
| `docs_reorg_codex_handoff.md` | 인수인계 | **완료(§1만 stale)** | 본 세션 커밋 `7581795`/`431cada`/`b07a7d2`로 전부 반영·push 완료했으나 §1은 "아직 git commit 전"으로 남아 문서 내부 §1↔§Codex 회신이 서로 모순 | **최우선 정정 대상**, 이후 archive |
| `phase37_codex_handoff.md` | 완료 보고 | **완료(상태 문구 stale)** | "push는 보류 중"이라 적혀 있으나 `implementation_plan_scene_phase38.md`가 "Phase 37 완료·커밋·푸시(`5cb5e6b`)"로 명시해 모순 | 문구 정정 후 archive |
| `phase38_codex_handoff.md` | 완료 보고 | **완료(상태 문구 stale)** | "아직 push 안 함"이라 적혀 있으나 이후 지시서가 이 커밋을 이미 지난 parent로 참조 | 문구 정정 후 archive |

## D. 감사 문서 판정표 (`docs/audits/`, 11개)

| 파일 | 최신 갱신 | 핵심 문서 반영 여부 | 반복 재실행 스크립트 | 권장 |
|---|---|---|---|---|
| `artifact_audit.md` | 2026-09-01 | `BACKLOG.md` P2 유물 검수 항목에 요약 반영됨 | `scripts/11_audit_artifacts.py` | 요약은 BACKLOG에 있으므로 원본은 근거자료로 유지 |
| `baseline_report_structural_stabilization.md` | 2026-08-26 | walkthrough 286~292에 결과 반영됨 | 없음(1회성 기준선) | 성격상 `docs/archive/`에 더 가까움 — 재분류 검토 후보 |
| `choice_bias_audit.md` | 2026-09-01(최신) | `BACKLOG.md` P1 항목1과 수치 동기화(walkthrough 703~708) | `scripts/12_audit_choice_bias.py` | 계속 갱신되는 활성 문서 — 유지 |
| `content_claim_audit.md` | 2026-08-26 | 반영 여부 미확인 | 불명 | `uncertain` |
| `curriculum_alignment_report_2022.md` | 2026-08-27 | `README.md`가 직접 인용(성취기준 매핑 근거) | 불명 | 살아있는 참고 문서 — 유지 필수 |
| `historical_language_audit.md` | 2026-08-27 | 반영 여부 미확인 | 불명 | `uncertain` |
| `if_stage_audit.md` | 2026-09-01(최신) | `BACKLOG.md`가 "IF 재설계" 항목의 기준 문서로 직접 링크 | `scripts/10_audit_if_stages.py` | 유지 필수 |
| `ipad_ux_regression_report.md` | 2026-08-27 | `BROWSER_REGRESSION_CHECKLIST.md`와 성격(브라우저·기기 점검) 중복 가능성 | 없음(수동) | `uncertain` — 두 문서 역할 구분 필요 |
| `pilot_mapping_report_2022.md` | 2026-08-26 | `curriculum_alignment_report_2022.md`와 주제(2022 개정 매핑) 중복 | 불명 | 통합 검토 후보(이번엔 병합 안 함) |
| `sensitive_history_crosscheck_report.md` | 2026-09-01 | walkthrough "민감 역사 glossary 표현 완화"와 연결 확인 | 없음(수동 검토) | 유지 |
| `simulator_report.md` | 2026-08-25(가장 오래됨, 20KB) | 현재 `js/mudSimulators.js` 구조와 실제 일치 여부 미확인 | 없음 | `uncertain` — 가장 오래된 문서라 재검토 우선순위 높음 |

## E. §4 필수 확인 충돌 — 항목별 결과

1. **계획서 상단 상태 ↔ 하단 실행 결과 불일치**: `implementation_plan_docs_reorganization.md`(§B 참고, 상단 `proposed` vs 실제 완료).
2. **과거 상태로 현재 코드를 설명**: 없음(추가 발견 없음) — `implementation_plan_mud_depth_expansion.md`·`implementation_plan_structural_stabilization.md`는 이미 과거 진단임을 문서 스스로 명시하거나 이번 보고서가 명시함.
3. **`BACKLOG.md` ↔ `walkthrough.md` 완료·대기 상태 불일치**: 발견 안 됨 — 오히려 walkthrough 805~821에서 이미 한 차례 정합화된 흔적을 확인함.
4. **과거 문서가 현재 요구사항처럼 읽힘**: `implementation_plan_structural_stabilization.md`의 §9 교사용 대시보드 단계 표(D0/D1/D2)가 최신 `ARCHITECTURE.md`/`DECISIONS.md`의 결정과 별도로 존재해, 처음 읽는 사람은 이것이 아직 유효한 로드맵으로 오인할 수 있음.
5. **Vercel·Supabase 방향 ↔ GitHub Pages·서버 없음 표현 충돌**: 발견 안 됨 — `ARCHITECTURE.md`가 "현재/목표"를 명확히 구분해 관리 중.
6. **학생 피드백 원문 ↔ 확정 요구사항 혼합**: 발견 안 됨 — `docs/archive/student_feedback_idea_note.md`(원문 성격)와 `implementation_plan_student_feedback_p1.md`(실행 계획)가 이미 분리되어 있음.
7. **선택지 편향·활동 시간·유물 확장 수치 중복**: `implementation_plan_tap_resistance_batch.md`(4개) ↔ `BACKLOG.md`(5개) 불일치(§B 참고). `codex_tap_resistance_priority.md`의 "40개 후보" 총량과 두 문서의 반영 수치가 서로 다른 문서에 흩어져 있어 진행률을 한눈에 보기 어려움.

## F. 안전한 정리 순서 제안

```text
1. 상태 확인
   → implementation_plan_docs_reorganization.md, docs_reorg_codex_handoff.md,
     phase37/38_codex_handoff.md의 stale 문구부터 정정(§A 상위 5개)

2. 사용자 확인이 필요한 충돌 분리
   → tap_resistance_batch 4개/5개 수치 불일치는 실제 반영 MUD 목록을 다시 세어
     사용자·Codex와 확정한 뒤 양쪽 문서에 같은 숫자를 남긴다.
   → implementation_plan_structural_stabilization.md는 세부 계획서로 완전히
     흡수되었는지 사용자가 최종 확인한 뒤 superseded 처리한다.

3. 핵심 문서에 없는 내용만 요약
   → docs/audits/*의 uncertain 4건(content_claim, historical_language,
     ipad_ux_regression, simulator_report)은 최신 코드와 대조해 반영 여부부터
     확인한 뒤, 반영된 내용은 요약만 남기고 원본은 archive 검토.

4. 완료 문서 archive 검토
   → §B에서 archive로 판정한 계획서 6개, §C에서 archive로 판정한 핸드오프 14개.

5. 삭제 후보 최종 확인
   → *_message.md 2건(`claude_code_next_review_message.md`,
     `claude_code_remaining_work_message.md`)만 내용이 100% 중복되어
     삭제 영향이 가장 작다. 나머지는 삭제보다 archive를 권장한다(커밋 히스토리·
     역사적 근거로서의 가치가 있음).
```

## 작업 완료 기준 체크

- [x] 대상 문서의 현재 상태와 권장 상태를 구분했다.
- [x] 실제 코드(`js/miniGames.js`, `data/artifacts.json`)·최근 walkthrough·현재 핵심 문서(`BACKLOG.md`)를 근거로 제시했다.
- [x] 삭제·이동·병합 없이 보고서만 제출했다.
- [x] 판단이 어려운 문서 4건을 `uncertain`으로 남겼다.
- [x] 커밋·push를 하지 않았다.
