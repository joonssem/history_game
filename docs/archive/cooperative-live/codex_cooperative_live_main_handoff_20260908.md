# 실시간 협동 MUD `main` 통합 인수인계 — 2026-09-08

## 현재 기준선

- 기준 브랜치: `main`
- 통합 작업: `TASK-20260908-02`
- 앱 위치: `apps/cooperative-live/`
- 상태: 가상 데이터 수직 슬라이스와 로컬 검증 완료
- 기존 정적 GitHub Pages 앱과 `cooperative-mud/`는 유지한다.
- 실제 Convex/Auth0/Vercel 연결, Production 배포, 실제 학생 접속은 `BACKLOG.md`의 `P1-COLLAB-PRIVACY` 해제 전까지 진행하지 않는다.
- 통합 검증: 앱 `npm run check`, 저장소 데이터·MUD·런타임·정적 자산·JavaScript 검사, 생성 감사 보고서 3종 재실행이 모두 통과했다.

## 다른 PC에서 시작

```powershell
git switch main
git pull --ff-only origin main
Set-Location apps\cooperative-live
Copy-Item .env.example .env.local
npm ci
npm run check
npm run dev
```

`.env.local`은 기본 `NEXT_PUBLIC_DEMO_MODE=true`를 유지한다. 브라우저에서 `http://localhost:3000/teacher`를 열면 외부 계정 없이 가상 학생 흐름을 확인할 수 있다. 환경변수와 실제 교사 Auth0 `sub`는 커밋하지 않는다.

새 작업을 시작할 때는 `main`을 직접 수정하지 않고 목적별 브랜치나 별도 worktree를 만든다. 같은 폴더를 Claude Code와 Codex가 동시에 사용하면서 브랜치를 전환하지 않는다.

## 확인이 끝난 범위

- 교사 세션 생성·새로고침 복구·중복 생성 방지
- 학생 입장·같은 탭 재입장·세션 종료 시 로컬 복구정보 삭제
- 3~24명, 모둠당 3~5명 균형 편성 및 역할 중복 방지
- 24명 초과 입장 거부와 6자리 코드 충돌 실패 처리
- 교사용 공개 응답에서 Auth0 `ownerSub` 제외
- lint, TypeScript, 단위 테스트 5건, Next.js production build

## 다음에 이어갈 일

1. `P1-COLLAB-PRIVACY`의 학교 개인정보 처리 근거와 Convex·Vercel 위탁·국외 처리 조건을 확인한다.
2. 실제 학생 접속 전에 QR 전용 장기 난수 입장키와 6자리 수동 코드 시도 제한·만료 정책을 별도 구현 계획으로 확정한다.
3. 게이트 해제와 계정 준비 후 Convex 개발 배포, Auth0 교사 로그인, Vercel Preview를 합성 데이터로 연결 검증한다.
4. Preview에서 21명+교사 1명 동시접속, WebSocket, 재접속, 종료 삭제, 아이패드 QR 인식을 검사한다.
5. 별도 현장 과제로 7·8차시 정적 협동 MUD를 실제 수업에서 운영하고, 결과를 `EXPERIMENTS.md`에 기록한 뒤 타이머 예산을 조정한다.

세부 구현 순서는 `docs/plans/implementation_plan_vercel_convex_vertical_slice.md`, 실행 방법은 `apps/cooperative-live/README.md`, 현재 전체 상태는 `project_context.md` §7을 따른다.
