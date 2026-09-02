# Claude Track C — 역사 웹앱 제품 방향·실험 설계 지시서

상태: `ready-for-claude`

## 1. 목적

학생 피드백에서 나온 세 방향을 비교하고, 다음 구현을 결정할 수 있는 작은 실험안을 작성한다.

1. 현재의 차시별 MUD 중심 웹앱 유지
2. 유물 수집을 관찰·비교·추론으로 확장
3. 역사 타이쿤형 운영 활동 확장

이번 트랙의 산출물은 제품 방향 제안서이지, 기능 구현이나 최종 의사결정이 아니다.

## 2. 먼저 읽을 문서

- [`PRD.md`](../../PRD.md)
- [`INBOX.md`](../../INBOX.md)
- [`ROADMAP.md`](../../ROADMAP.md)
- [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
- [`TECH_STACK.md`](../../TECH_STACK.md)
- [`student_feedback_idea_note.md`](../archive/student_feedback_idea_note.md)
- [`student_ideas_strategy_consult_brief.md`](../archive/student_ideas_strategy_consult_brief.md)
- [`data/artifacts.json`](../../data/artifacts.json)
- [`js/encyclopedia.js`](../../js/encyclopedia.js)

## 3. 수정 가능 범위

- 결과 보고서: `docs/handoff/claude_track_c_product_direction_result.md`
- 필요하면 보고서 안에 표·간단한 사용자 흐름·저충실도 화면 설명을 포함한다.
- 현재 코드와 데이터는 읽기만 한다.

## 4. 수정 금지 범위

- 모든 `js/` 파일
- 모든 `data/` 파일
- `index.html`, `css/`
- `PRD.md`, `BACKLOG.md`, `DECISIONS.md`, `project_context.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `TECH_STACK.md`, `walkthrough.md`
- Supabase 프로젝트·테이블·RLS·로그인·Realtime

기준 문서에 반영할 내용은 제안서에만 기록하고, Codex가 사용자 확인 후 승격한다.

## 5. 반드시 비교할 기준

각 방향을 다음 기준으로 1~5점 평가하고 근거를 적는다.

- 교육과정·역사적 사고 목표와의 적합성
- 현재 학생 피드백과의 연결성
- 3~5분 또는 5~10분 작은 실험 가능성
- 기존 JSON·Vanilla JS·localStorage 구조 재사용성
- 콘텐츠 제작·유지보수 부담
- 태블릿 조작성
- 개인정보·서버 의존성 위험
- 장기 반복 사용 동기
- Regular·Deep-dive와의 중복 위험

## 6. 제안해야 할 최소 실험

### 실험 A — 유물 2개 비교 추론

- 해금 유물 2개를 고른다.
- 각 유물에서 관찰 단서 2개 이상을 확인한다.
- 공통점·차이점에 근거해 주장을 고른다.
- 선택한 근거를 한 문장으로 설명한다.
- 예상 시간: 3~5분
- 성공 신호: 학생이 유물 이름이나 등급이 아니라 관찰 단서를 근거로 설명함

### 실험 B — 역사 타이쿤 마이크로 프로토타입

- 한 시대와 5개 이하의 선택만 사용한다.
- 자원 수치보다 식량·환경·기술·공동체·역사적 제약을 중심에 둔다.
- 승리·정복·공격력 대신 “어떤 자료를 근거로 어떤 생활 조건을 만들었는가”를 결과로 보여 준다.
- 코딩하지 말고 종이 설계 또는 화면 흐름 수준으로 제안한다.
- 유물 비교 실험보다 교육 효과와 구현 부담이 낮은지 비교한다.

## 7. 권고 형식

1. 현재 제품이 해결하는 핵심 문제와 놓치는 문제
2. 세 방향 비교표
3. 권장 제품 문장 1개
4. 지금 채택할 것·보류할 것·범위 밖으로 둘 것
5. 유물 비교 실험의 화면 흐름·성공 기준·관찰 질문
6. 타이쿤 마이크로 실험의 시대·제약·선택·결과 구조
7. 학생 3명 이상에게 확인할 측정 항목
8. PRD·ROADMAP·BACKLOG로 승격하기 전 필요한 의사결정
9. 구현하지 않은 항목과 그 이유

권장 결론은 반드시 하나의 다음 행동으로 수렴해야 한다. 단순히 모든 아이디어를 병렬 추진하자는 결론은 허용하지 않는다.

작업 시작 시 `TASK-... | 대상 | 담당: Claude | 상태: DOING`, 종료 시 `DONE`을 결과 보고서에 기록한다. 외부 자료를 사용하면 출처와 확인 날짜를 함께 적는다.
