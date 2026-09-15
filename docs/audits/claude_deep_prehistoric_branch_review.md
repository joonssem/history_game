# `claude-deep-prehistoric` 브랜치 검토

`TASK-20260915-T4 | claude-deep-prehistoric 브랜치 미반영 작업 분석 | audit agent(Codex) | 상태: DONE`

- 확인일: **2026-09-15**
- 기준: `main` `3c77437`, 대상 `claude-deep-prehistoric` `3c47568`
- merge-base: `1963309`
- 범위: 미반영 콘텐츠·문서의 적용 가능성 조사와 임시 적용 검증
- 원칙: 대상 브랜치와 기존 `D:\codexwork\history_game-claude` worktree는 읽기만 했다. `main`에는 콘텐츠를 적용하지 않았고 병합·브랜치 삭제·원격 변경도 하지 않았다.

## 1. 결론

권고는 제시된 선택지 중 **(c) 기타**다.

1. 남은 5개 커밋을 그대로 cherry-pick하거나 병합하지 않는다.
2. 콘텐츠 커밋 `6fee7fc`의 유효한 부분은 사용자 승인 후 **7개 단계의 선택지 문구 14개만 새 커밋으로 수동 이식**한다. `stage 4`의 과거 선택지 배열은 가져오지 않는다.
3. 문서 커밋은 그대로 가져오지 않는다. 과거 계획의 채택된 결론은 이미 `D-024~D-026`과 `PRD.md`에 있고, 미해결·진행 중으로 쓰인 상태가 현재와 충돌한다.
4. 현재 main의 끊어진 두 문서 링크는 별도 문서 정리에서 해결한다. 필요하면 재설계 계획은 `docs/archive/`에 역사 자료로 보존하고, 세션 전환 노트 링크는 현재 역할 인계 문서로 교체한다.
5. 위 선별 반영과 문서 정리가 끝난 뒤에만 사용자 승인을 받아 `3c47568`에 archive 태그를 남기고 로컬 worktree·로컬/원격 브랜치를 정리한다.

직접 cherry-pick은 현재 구조를 되돌릴 위험이 있고, 브랜치 전체 폐기는 아직 main에 없는 유용한 선택지 문구와 과거 설계 근거를 잃는다. 따라서 선별 이식 후 보관·정리가 가장 안전하다.

## 2. 커밋별 판정

`git cherry -v main claude-deep-prehistoric` 기준으로 7개 중 앞의 2개는 patch-equivalent이고 5개가 고유하다.

| 커밋 | 내용 | 판정 | 근거 |
|---|---|---|---|
| `e04496f` | 선사 Deep-dive 게이팅·6장 추가 | 이미 반영 | main의 `6e94b6e`와 patch-equivalent |
| `ff8f1d5` | 선사 Deep-dive 인계 문서 | 이미 반영 | main의 `6d736f3`와 patch-equivalent이며 현재 파일도 동일 |
| `e4ce1dd` | 다른 PC 세션 전환 노트 | 직접 반영하지 않음 | 과거 공유 폴더·진행 상태를 전제로 한 세션용 문서로 현재 상태와 불일치 |
| `da0a8b4` | 경쟁 과제 + 전면 재설계 계획 | 선별 보존 후보 | 경쟁 과제 파일은 main과 동일. 계획의 핵심은 이미 채택됐지만 원문은 main에 없어 역사 자료 가치는 있음 |
| `9b34883` | 세션 노트가 재설계 계획을 가리키게 수정 | 직접 반영하지 않음 | 대상 세션 노트 자체가 현행 인계 문서로 부적합 |
| `6fee7fc` | 단서명을 선택지에 인용 | 수동 이식 후보 | 아이디어는 유효하지만 직접 cherry-pick 충돌 1건. 현행 구조를 유지하면 7단계 14문구로 축소됨 |
| `3c47568` | Deep-dive 역할 분담 확정 | 이미 다른 문서에 반영 | `codex_deep_three_kingdoms_ownership_handoff.md`와 `project_context.md`에 같은 결정이 존재 |

## 3. `6fee7fc` 적용 시험

### 3-1. 직접 cherry-pick 결과

`main`에서 분리한 detached 임시 worktree `.worktrees/codex-t4-review`에서 다음을 시험했다.

```text
git cherry-pick --no-commit 6fee7fc
```

결과는 `data/mud/deep_prehistoric.json`의 `stage 4`에서 **content conflict**였다.

- 과거 커밋: 일반 `choices` 3개를 유지하면서 그 문구를 단서 인용형으로 수정
- 현재 main: `hotspot-choice`가 지도 위 선택 자체를 분기로 사용하므로 `choices: []`

과거 배열을 선택하면 현재의 “시뮬레이터가 곧 선택지” 구조와 일반 선택지가 함께 생겨 설계가 퇴행한다. 시험본에서는 main의 `choices: []`를 유지했다.

### 3-2. 현행 구조에 맞춘 결과

충돌 부분을 제외하면 다음 7개 단계에 **14개 문구 변경**이 남는다.

| 단계 | 변경 문구 수 | 연결되는 현재 단서 |
|---|---:|---|
| `1` | 3 | 가득 찬 창고, 형편이 다른 두 집 |
| `1a` | 2 | 비파형 동검, 청동 거울, 거푸집 |
| `1b` | 1 | 청동 무기, 큰 무덤, 강제 노동 |
| `2b` | 1 | 거대한 덮개돌, 노동 흔적 |
| `6` | 2 | 아사달, 홍익인간, 청동기·고인돌 |
| `7` | 2 | 노동력, 이웃 간 신뢰 |
| `8` | 3 | 노비형, 속전 50만 전, 가족 연좌 여부 |

모든 문구는 현재 hotspot 이름 또는 피드백의 개념을 선택지에 직접 연결한다. 선택지 길이 감사의 10자 이상 편향 기준도 통과했다. 다만 `sources[].claimScope`가 개별 서술은 별도 검증이 필요하다고 명시하므로, 실제 이식 전 `수백 명`, `속전 50만 전`처럼 구체적인 표현은 기존 단서까지 포함해 공식 출처를 한 번 더 확인하는 편이 안전하다.

## 4. 임시 시험 검증

`stage 4`는 main을 유지하고 7단계 14문구만 적용한 시험본의 결과다.

| 검사 | 결과 |
|---|---|
| `python scripts/01_validate_game_data.py` | PASS |
| `python scripts/03_validate_mud_integrity.py` | PASS, 기존 선택지 위치 경고만 유지 |
| `python scripts/04_validate_mud_contract.py` | PASS |
| `node scripts/05_test_simulator_runtime.js` | PASS |
| `python scripts/06_validate_static_assets.py` | PASS |
| `python scripts/07_audit_activity_duration.py` | PASS, 기존 Regular 검토 후보 6개 |
| `python scripts/08_validate_mud_catalog.py` | PASS |
| `python scripts/09_audit_tap_resistance.py` | PASS, 기존 Regular 후보 6개 |
| `python scripts/09_validate_mud_sources.py` | PASS, 91개 source record |
| `python scripts/10_audit_if_stages.py` | PASS |
| `python scripts/11_audit_artifacts.py` | PASS |
| `python scripts/12_audit_choice_bias.py` | PASS, 10자 이상 편향 0개 |
| `node scripts/13_audit_inquiry_combinatorics.js` | PASS |
| `git diff --cached --check` | PASS |

과거 커밋 메시지에 적힌 `scripts/09_audit_mud_quality.py`는 현재 main에 존재하지 않는다. 현행의 `09_audit_tap_resistance.py`와 `09_validate_mud_sources.py`로 대체 확인했으며 둘 다 통과했다. 시험은 텍스트-only 변경이므로 브라우저 실플레이는 수행하지 않았다.

## 5. 문서 체계 대조

### 5-1. 결정 번호 충돌

이 브랜치의 계획은 결정 번호를 선점하지 않아 과거 `codex-deep-three-kingdoms` 계획처럼 **D-019 번호 자체와 충돌하지 않는다.** 그러나 계획서의 결정 대기 3건은 현재 이미 다음과 같이 처리됐다.

| 과거 계획 쟁점 | 현재 기준 |
|---|---|
| Deep-dive 필수 활동 허용 조건 | `D-024` 채택 |
| 교차 단원 등록 계약 | `D-025` 채택 방향 |
| 시대축 대신 사고 질문으로 구획 | `D-026` 채택 방향 + `PRD.md` 개정 |

따라서 계획서를 `docs/plans/`에 그대로 복원하면 “사용자 확정 대기” 상태와 현재 채택 결론이 동시에 존재한다. 과거 근거가 필요하면 `docs/archive/`로 옮기고 상단에 현재 결정으로 대체됐음을 표시해야 한다.

### 5-2. 역할·진행 상태

`3c47568`의 역할 분담은 main의 `codex_deep_three_kingdoms_ownership_handoff.md`와 `project_context.md`에 이미 반영됐다. 또한 main의 BACKLOG는 `deep_joseon`·`deep_modern` 감사를 완료된 Track B로 기록한다. “감사 진행 중”인 세션 노트를 다시 가져오면 상태가 후퇴한다.

### 5-3. 현재 main의 끊어진 링크

다음 현재 문서가 branch에만 있는 파일을 가리킨다.

- `docs/handoff/codex_deep_three_kingdoms_ownership_handoff.md` → 재설계 계획, Claude 세션 전환 노트
- `project_context.md` → Claude 세션 전환 노트
- `docs/plans/implementation_plan_evidence_notebook_interface.md` → 재설계 계획을 파일명으로 참조

이 문제는 branch 문서를 그대로 복원할 이유는 아니지만, 문서 근거의 추적성을 위해 별도 정리가 필요하다. 권고는 재설계 계획을 역사 자료로 보존할 경우 archive 경로로 연결하고, 세션 전환 노트의 링크는 현재 역할 인계 문서로 교체하는 것이다.

## 6. 사용자 판단 요청

다음 묶음을 하나의 최소 구현으로 승인할지 판단이 필요하다.

1. `6fee7fc`에서 `stage 4`를 제외한 7단계 14문구를 main 현행 구조에 수동 이식
2. 구체 역사 표현의 공식 출처 재확인
3. 끊어진 문서 링크 정리와 필요 시 재설계 계획의 archive 보존
4. 완료 후 `3c47568` archive 태그 및 `claude-deep-prehistoric` worktree·브랜치 정리

승인 전에는 콘텐츠·브랜치·worktree를 변경하지 않는다.
