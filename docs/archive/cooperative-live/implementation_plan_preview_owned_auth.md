# 관리 가능한 계정의 Preview 전용 인증

> **상태: 폐기됨(2026-10-05).** Auth0 Preview SPA 계획은 교사 비밀번호 로그인으로 대체되어 운영 반영됐다. 이 문서는 조사 이력으로 보존하며 실행 지시로 사용하지 않는다. 현행 인증·남은 정리는 `BACKLOG.md`의 `P0-COLLAB-TEACHER-PASSCODE`와 `docs/handoff/claude_session_close_20261005.md`를 따른다.

- 날짜: 2026-10-01
- 작업: TASK-20261001-PREVIEW-OWNED-AUTH
- 승인: 사용자 “앞으로 작업 및 유지 보수 측면에서 더 나은 것으로 선택하기”로 경로 선택·후속 구성 위임.

## 선택과 범위

기존 테넌트에 접근할 수 없는 관리 계정에 의존하지 않고 현재 사용자가 직접 관리 가능한 Google 계정의 Auth0 테넌트에 Preview 전용 SPA 앱을 구성한다. 기존 운영 인증을 옮기지 않는다. 사용자·학생 권한 정책과 기존 JavaScript 구조를 유지한다.

- Auth0 테넌트: dev-52nfryf51dbtiepi.
- 앱 이름: History Game Cooperative Preview. Single Page Application, Authorization Code + PKCE, Google 로그인.
- 고정 Preview alias 후보: history-game-cooperative-preview.vercel.app. 기존 alias 소유/대상 확인 후 비어 있는 경우에만 할당한다.
- callback: 고정 주소 /teacher 및 http://localhost:3000/teacher. logout/origin은 동일 origin만 정확히 등록한다. wildcard 없음.
- Convex: fiery-cobra-795 개발 배포에만 새 Auth0 issuer/client 설정 적용. 교사 허용목록은 실제 본인 로그인 신원을 대조해 필요한 동일 사용자로 유지한다. 비공개 식별값 출력·커밋 없음.
- Vercel: 배포별 build/runtime Auth0 공개 설정과 기존 전용 Convex URL 명시. 공통 production/preview 설정 변경 없음. 새로운 READY Preview 확인 뒤 고정 alias를 해당 배포에 연결한다.

## 실행과 검증

1. 현재 테넌트의 기존 앱/Google 연결을 읽고 SPA 설정 준비.
2. 기존 운영 서버와 alias를 보존하며 Preview 전용 구성 적용.
3. 실제 Google 로그인 → 고정 주소 callback → Convex 교사 허용 검증.
4. 실제 교사·학생 브라우저에서 일회용 가상 활동 입장·모둠 진행·복구 확인.
5. 테스트 세션 종료·하위 데이터 삭제 확인, 운영 설정 유지 재확인.
6. BACKLOG·DECISIONS·project_context·walkthrough·Preview 체크리스트 업데이트.

학교 기기·실제 학생 파일럿은 후속 검증이다. 관리용 서버 테스트를 실제 OAuth 브라우저 로그인 검증으로 표시하지 않는다. SPA에서 client secret을 사용하거나 비밀값을 프런트 환경변수에 추가하지 않는다.

## 오늘 종료 상태

사용자 요청으로 오늘 작업 종료. 인증 경로 선택·SPA 생성 양식 준비까지만 완료했다. Create를 누르지 않았으며 새 앱·Google 연결·고정 alias·새 인증 환경변수 적용은 미실행이다. 브라우저 정책에 따른 새 인증 접근 생성 직전 확인도 아직 받지 않았다.

고정 alias는 후보이며 사용 가능 여부를 아직 확인하지 않았다. 브라우저 로그인 세션은 재개 시 확인한다.
