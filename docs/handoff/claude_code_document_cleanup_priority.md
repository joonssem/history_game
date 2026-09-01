# Claude Code 작업 지시서 — 문서 정리 우선순위 감사

## 0. 작업 목적

현재 프로젝트는 루트 핵심 문서와 `docs/audits/`, `docs/plans/`, `docs/handoff/`, `docs/archive/`가 분리되어 있다. 다음 단계는 문서를 더 만드는 것이 아니라 기존 문서의 상태와 생명주기를 정리하는 것이다.

이번 작업은 **삭제·이동·병합이 아니라, 어떤 문서부터 정리해야 하는지 판단하는 감사 보고서 작성**이다.

현재 공식 기준 문서는 다음과 같다.

```text
INBOX.md          사용자 입력 원문
PRD.md            제품 정의
ROADMAP.md        구현 순서
DECISIONS.md      확정 결정
EXPERIMENTS.md    수업 실험·결과
BACKLOG.md        미확정 아이디어·검토 항목
TECH_STACK.md     기술 선택
ARCHITECTURE.md   시스템 연결 구조
```

## 1. 현재 상태

- 현재 브랜치: `main`
- 기준 커밋: `431cada` 이후 문서 재배치 및 링크 수정 상태
- 핵심 문서는 루트에 유지한다.
- 기록성 문서는 `docs/` 하위 폴더에 배치되어 있다.
- `docs/plans/`에 구현 계획서 14개가 있다.
- `docs/handoff/`에 에이전트 지시·인수인계 문서 17개가 있다.
- `docs/audits/`에 감사·검증 문서 11개가 있다.
- `docs/archive/`에 과거 기록 9개가 있다.

## 2. 작업 규칙

- 작업 시작 전에 현재 `git status`를 확인한다.
- 동일 파일을 두 에이전트가 동시에 수정하지 않는다.
- 이번 작업은 **읽기·분류·보고만 수행**한다.
- 파일 삭제, 이동, 이름 변경, 병합을 하지 않는다.
- 코드·JSON·설정 파일을 수정하지 않는다.
- `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `walkthrough.md`, `agents.md`, `activity_duration_audit.md`는 Codex 소유 문서이므로 수정하지 않는다.
- 문서 상태를 임의로 완료 처리하지 않는다.
- 커밋·push를 하지 않는다.

## 3. 우선 조사 대상

### 1순위 — 구현 계획서 상태

다음 문서를 실제 코드·검증 기록·현재 핵심 문서와 대조한다.

```text
docs/plans/implementation_plan_accessibility_state.md
docs/plans/implementation_plan_choice_quality_batch.md
docs/plans/implementation_plan_choice_randomization.md
docs/plans/implementation_plan_mud_depth_expansion.md
docs/plans/implementation_plan_registration_single_source.md
docs/plans/implementation_plan_sensitive_history_interactions.md
docs/plans/implementation_plan_structural_stabilization.md
docs/plans/implementation_plan_student_feedback_p1.md
docs/plans/implementation_plan_tap_resistance_batch.md
```

각 문서를 다음 중 하나로 판정한다.

```text
active / completed / superseded / archive / uncertain
```

### 2순위 — 핸드오프·작업 지시서

`docs/handoff/`의 문서를 다음 유형으로 구분한다.

- 아직 수행해야 하는 활성 작업
- 이미 완료된 일회성 작업 지시서
- 단순 전달 메시지
- 현재 기준과 충돌하는 과거 지시서
- `walkthrough.md` 또는 `DECISIONS.md`에 핵심 내용이 보존된 문서

특히 `*_message.md`, 완료된 `*_instruction.md`, `phase*_handoff.md`의 처리 우선순위를 제안한다.

### 3순위 — 감사 문서와 핵심 문서의 관계

`docs/audits/` 각 문서에 대해 다음을 확인한다.

- 현재도 반복 실행할 감사인지
- 결과가 `EXPERIMENTS.md`, `BACKLOG.md`, `PRD.md`에 반영되었는지
- 독립 문서로 계속 유지할 가치가 있는지
- 요약만 핵심 문서에 남기고 보관할 수 있는지

## 4. 반드시 확인할 충돌

1. 계획서 상단 상태와 하단 실행 결과가 다른 경우
2. 계획서가 현재 코드 동작을 과거 상태로 설명하는 경우
3. `BACKLOG.md`와 `walkthrough.md`의 완료·대기 상태가 다른 경우
4. 과거 문서가 현재 제품 요구사항처럼 읽히는 경우
5. Vercel·Supabase 방향과 GitHub Pages·서버 없음 표현이 충돌하는 경우
6. 학생 피드백 원문과 확정 요구사항이 혼합된 경우
7. 선택지 편향·활동 시간·유물 확장 내용이 여러 문서에 중복된 경우

## 5. 결과 보고 형식

### A. 요약

- 조사한 문서 수
- 가장 먼저 정리할 문서 5개
- 즉시 정리하면 안 되는 문서
- 보존 필수 문서

### B. 계획서 판정표

| 파일 | 현재 상태 | 권장 상태 | 근거 | 다음 조치 |
|---|---|---|---|---|
| `docs/plans/...` |  |  |  |  |

### C. 핸드오프 판정표

| 파일 | 유형 | 활성 여부 | 중복·충돌 | 권장 조치 |
|---|---|---|---|---|
| `docs/handoff/...` |  |  |  |  |

### D. 안전한 정리 순서

```text
상태 확인
→ 사용자 확인이 필요한 충돌 분리
→ 핵심 문서에 없는 내용만 요약
→ 완료 문서 archive 검토
→ 삭제 후보 최종 확인
```

## 6. 작업 완료 기준

- 대상 문서의 현재 상태와 권장 상태를 구분했다.
- 실제 코드·최근 walkthrough·현재 핵심 문서를 근거로 제시했다.
- 삭제·이동·병합 없이 보고서만 제출했다.
- 판단이 어려운 문서를 `uncertain`으로 남겼다.
- 커밋·push를 하지 않았다.

## Codex 회신

- Claude 감사 결과는 [`../audits/document_cleanup_priority_audit.md`](../audits/document_cleanup_priority_audit.md)에 저장된 내용을 기준으로 인수했다.
- `implementation_plan_docs_reorganization.md`의 상태를 `completed`로 정정했다.
- `docs_reorg_codex_handoff.md`, `phase37_codex_handoff.md`, `phase38_codex_handoff.md`의 push 보류 문구를 현재 `origin/main` 반영 상태에 맞게 정정했다.
- `implementation_plan_tap_resistance_batch.md`의 반영 수치를 `4개`에서 `5개`로 정정해 `BACKLOG.md`와 맞췄다.
- `implementation_plan_student_feedback_p1.md`의 유물 복원 퍼즐은 코드에 구현되지 않은 활성 작업으로 유지했다.
- 계획서·핸드오프·감사 문서의 삭제·이동·병합은 수행하지 않았다.
