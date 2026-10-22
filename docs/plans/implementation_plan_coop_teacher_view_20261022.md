# 구현 계획 — 협동 MUD 교사용 한눈 보기 (P1-COOP-TEACHER-VIEW)

- 작성: 2026-10-22, 방법 A 사용자 선택
- 작업 claim: `TASK-20261022-COOP-TEACHER-VIEW | cooperative-mud/teacher/ 신규 | implementation agent(Claude) | 상태: DOING — 구현·로컬 검증 완료, push 전`
- 사용자 추가 요구(2026-10-22): 조선 예정 활동만, 순회지도 중 학생 번호별 자료 확인이 1순위 → 번호 탭을 화면 맨 위에 고정

## 목표

교사가 남은 협동 활동 6개(공개수업 `joseon-late-economy` 포함)의 전체 내용을 한 페이지에서 단계 순서대로 확인하고 인쇄할 수 있게 한다.

## 데이터 출처 (생성 단계 없음)

| 내용 | 출처 |
|---|---|
| 역할 카드 전부, 첫 선택지, 3인 단서, 단계별 시간·발문, 모둠 설명 선택지·예시 문장, 함정과 되묻는 메모, 비교 문구, 교과서 정리 자료, 출처 | 각 활동 `scenario.js` (`window.CoopScenario`) |
| 도입·첫 질문·공유 안내·공통 자료·두 번째 자료·교과서 정리·교사 관찰 질문, 5분형/13분형 이름 | 각 활동 `index.html`의 `#screen-*` 정적 문구 |

`joseon-late-economy`는 `page` 객체 없이 `index.html`을 직접 쓴 활동이라, 화면 문구는 6개 모두 `index.html`에서 읽어 출처를 하나로 맞춘다.

## 범위

- 신규: `cooperative-mud/teacher/index.html`, `cooperative-mud/teacher/teacher.js`
- 활동 목록은 `teacher.js` 안의 배열에 운영 상태와 함께 둔다. 운영이 끝나면 상태만 바꾼다(`TEACHING.md` 표와 같은 판정).
- 수정하지 않음: `episode.js`·`pacing.js`·`cooperative.css`·각 활동 파일·학생 허브 링크.
- 접근: GitHub Pages라 진짜 제한은 불가. 허브 미링크 + `noindex`. PIN 가림막은 넣지 않음(필요하면 후속).
- `fetch`를 쓰므로 `file://`이 아니라 Pages나 로컬 HTTP 서버에서 연다.

## 검증

- `node --check cooperative-mud/teacher/teacher.js`
- 로컬 HTTP 서버 + Chrome headless로 6개 활동 각각 역할 수·함정·화면 문구가 렌더되는지 확인
- `git diff --check`
