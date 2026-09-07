# 협동 역사 MUD · 실시간 수직 슬라이스

기존 정적 GitHub Pages 앱과 분리된 Next.js + Convex 앱이다. Vercel 프로젝트의 Root Directory는 `apps/cooperative-live`로 지정한다.

## 현재 범위

- 고조선 8조법 한 시나리오
- 교사 1명, 가상 학생 8명, 4인 모둠 2개
- 활동별 새 호, 무작위 모둠·역할
- 교사 진행 대시보드와 모둠별 힌트·심화 상황
- 학생 개인 선택·이유는 `sessionStorage`에만 저장
- 종료 시 Convex 세션 하위 데이터와 학생 기기 세션 정보 삭제

## 로컬 가상 데이터 확인

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

`.env.local`의 `NEXT_PUBLIC_DEMO_MODE=true` 상태에서 `/teacher`를 열면 외부 계정 없이 가상 학생 8명 흐름을 확인할 수 있다.

## Convex·Auth0 개발 연결

1. Auth0에서 교사용 Single Page Application을 만들고 Google 연결만 활성화한다.
2. Callback URL, Logout URL, Allowed Web Origins에 `http://localhost:3000`과 Vercel Preview 주소를 등록한다.
3. `.env.local`에 `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`를 설정한다.
4. `npx convex dev`로 개발 배포를 만들고 `NEXT_PUBLIC_CONVEX_URL`을 받는다.
5. Convex 개발 배포 환경변수에 `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `TEACHER_AUTH0_SUBS`를 설정한다.
6. `NEXT_PUBLIC_DEMO_MODE=false`로 바꾸고 개발 서버를 다시 시작한다.

학생 토큰은 URL이나 로컬 영구 저장소에 넣지 않는다. Auth0·Convex·Vercel 비밀값과 실제 교사 `sub`도 저장소에 커밋하지 않는다.

## 검증

```powershell
npm run check
```

실제 학생 접속과 Production 배포는 저장소의 `BACKLOG.md`에 있는 `P1-COLLAB-PRIVACY` 해제 뒤에만 진행한다.
