# Claude Code 작업 지시서 — 다음 중간 점검 묶음

## 목적

다음 세 가지 후속 작업을 준비한다.

1. IF 스테이지 6개 최종 검토 자료 정리
2. `regular_sejong` 2단계 중복 키 정리안 확정
3. 완료·진행 상태 문서의 불일치 목록 정리

이번 묶음은 **점검·제안 중심**이다. 사용자가 승인하지 않은 학습 내용과 JSON은 수정하지 않는다.

## 1. IF 스테이지 6개 최종 검토 자료

대상:

- `regular_korean_war:3-1`
- `regular_joseon_diplomacy:1-1`, `2-1`, `3-1`
- `regular_independence_army:3-1`
- `regular_goryeo_culture:1-1`

확인할 내용:

- `narrative`와 원래 단계 복귀 선택지가 자료 재확인·비교 활동으로 연결되는가
- 역사적 사실과 가상 실패 결과가 구분되는가
- 초등학생이 문장을 이해할 수 있는가
- 공포·죄책감·집단 비하 또는 정답 감정 강요가 없는가
- 기존 출처 범위를 벗어난 새 주장·수치·사례가 없는가

변경 제한:

- 문구·JSON을 수정하지 않는다.
- 단계별로 “승인 가능 / 사용자 확인 필요 / 수정 제안”만 보고한다.
- 최종 사용자 승인은 Codex가 받는다.

## 2. `regular_sejong` 중복 키 정리안

대상 파일: `data/mud/regular_sejong.json`

확인할 내용:

- 2단계 simulator 내부의 중복 `instruction`·`feedback`이 실제로 존재하는지 재확인
- JSON 파서가 현재 어떤 값을 사용하는지 확인
- hotspot·`infoText`와 더 잘 맞는 유지 문구를 판단
- 2-1·3·3-1에는 동일한 중복이 없는지 함께 확인
- 브라우저에서 현재 표시되는 안내·피드백을 확인

권장 방향:

- 자료 중심의 앞쪽 `instruction`·`feedback`을 유지
- 뒤쪽의 중복 `instruction`·`feedback` 삭제

단, 사용자 승인 전에는 JSON을 수정하지 않는다. 보고서에는 삭제 전후 문구와 영향 범위를 제시한다.

## 3. 문서 불일치 목록

다음 문서의 현재 상태를 실제 코드·데이터·최근 커밋과 대조한다.

- `BACKLOG.md`
- `project_context.md`
- `implementation_plan_if_stage_quality_batch.md`
- `implementation_plan_registration_single_source.md`
- `implementation_plan_tap_resistance_batch.md`
- `implementation_plan_scene_phase38.md`
- `DECISIONS.md`
- `walkthrough.md`

다음 유형만 표로 정리한다.

- 완료됐지만 문서에는 대기 중으로 남은 항목
- 실제 수치와 문서 수치가 다른 항목
- 현재 코드와 설명이 다른 항목
- 사용자 검토가 아직 필요한 항목

Codex 소유 문서(`PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `walkthrough.md`, 구현 계획서)는 직접 수정하지 않는다. 파일명·문장·수정 제안만 보고한다.

## 결과 보고 형식

### A. IF 6개

| 단계 | 판정 | 사용자 확인 포인트 | 수정 필요 여부 |
|---|---|---|---|

### B. 세종 중복 키

| 파일·단계 | 현재 파서 사용 값 | 유지 권장 값 | 삭제 대상 | 영향 |
|---|---|---|---|---|

### C. 문서 동기화

| 문서 | 현재 기록 | 실제 상태 | 권장 수정 |
|---|---|---|---|

반드시 실제로 확인한 파일, 명령, 브라우저 결과를 덧붙인다.

## 커밋·push

- 이번 점검에서 JSON·JS·Codex 문서를 수정하지 않는다.
- 결과 보고서만 작성한다.
- 보고서 작성 시에도 커밋·push하지 말고 Codex에 전달한다.
