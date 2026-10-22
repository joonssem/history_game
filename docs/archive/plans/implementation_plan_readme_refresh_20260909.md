# README 최신화 구현 계획

`TASK-20260909-README | documentation agent(Codex) | 상태: verified`

## 목적

GitHub 첫 화면의 프로젝트 현황을 2026-09-09 `main` 기준 코드·검증 문서와 일치시킨다.

## 변경 범위

1. 32개 MUD, 정적 협동 MUD 3편, 유물 비교 9페어, 미니게임 4종을 현황표에 반영한다.
2. Next.js·Convex·Auth0 실시간 협동 수직 슬라이스가 기술 Preview까지 구현됐음을 명시하되, 개인정보·국외 처리 게이트 전 실제 학생 사용 금지를 분명히 한다.
3. 정적 포털과 실시간 앱의 로컬 실행·검증 명령을 추가한다.
4. 기존 MUD 카탈로그와 프로젝트 문서 링크는 유지하고 링크 유효성을 검사한다.

## 제외 범위

- 기능 코드, 데이터, 배포 설정 변경
- 실시간 Preview의 운영 승인 또는 공개 수업 전환
- 완료되지 않은 기능을 구현 완료로 표현하는 문서 승격

## 검증

- README 상대 링크의 로컬 대상 존재 여부 확인
- README의 수량을 `_index.json`, `artifactComparisons.json`, UI 진입점과 대조
- 저장소 정적 데이터·자산 검증과 실시간 앱의 lint·typecheck·test 실행

## 완료 결과

- 2026-09-09 `main` 기준 현황과 배포 경계를 README에 반영했다.
- README 로컬 링크 37개가 모두 존재함을 확인했다.
- 정적 데이터·MUD 계약·자산·카탈로그·출처·시뮬레이터 검증을 통과했다.
- 실시간 앱 `npm run check`(lint, TypeScript, 단위 테스트 12건, Convex 통합 테스트 1건, production build)를 통과했다.
