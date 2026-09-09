# 협동 역사 MUD · 실시간 수직 슬라이스

기존 정적 GitHub Pages 앱과 분리된 Next.js + Convex 앱이다. Vercel 프로젝트의 Root Directory는 `apps/cooperative-live`로 지정한다.

## 현재 범위

- 고조선 8조법 한 시나리오
- 교사 1명, 가상 학생 8명, 4인 모둠 2개
- 실제 연결 모드에서는 3~24명을 3~5명 모둠으로 균형 편성
- 자동 함수 테스트에서는 가상 학생 21명의 병렬 입장, 5개 모둠 편성, 개입, 종료 삭제를 검증
- 활동별 새 호, 무작위 모둠·역할
- 교사 진행 대시보드와 모둠별 힌트·심화 상황
- 교사 화면 새로고침 시 진행 중인 세션 복구, 같은 학생 탭의 중복 입장 방지
- QR은 URL fragment의 256비트 일회 입장키를 사용하고 Convex에는 SHA-256 해시만 저장
- 6자리 수동 코드는 브라우저별 5회/5분, 코드 전체 30회/5분 실패 제한 적용
- QR·수동 코드 입장은 15분, 학생 복구 토큰은 최대 2시간 뒤 만료
- 학생 개인 선택·이유는 `sessionStorage`에만 저장
- 종료 시 Convex 세션 하위 데이터와 학생 기기 세션 정보 삭제

## 로컬 가상 데이터 확인

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

`.env.local`의 `NEXT_PUBLIC_DEMO_MODE=true` 상태에서 `/teacher`를 열면 외부 계정 없이 가상 학생 8명 흐름을 확인할 수 있다.

## Convex·Auth0 개발 연결

1. Auth0에서 교사용 Single Page Application을 만들고 Google 연결만 활성화한다.
2. Callback URL에는 `http://localhost:3000/teacher`와 `https://<vercel-domain>/teacher`, Logout URL과 Allowed Web Origins에는 각각의 기본 origin을 등록한다.
3. `.env.local`에 `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`를 설정한다.
4. `npx convex dev`로 개발 배포를 만들고 `NEXT_PUBLIC_CONVEX_URL`을 받는다.
5. Convex 개발 배포 환경변수에 `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `TEACHER_AUTH0_SUBS`, 32자 이상의 `JOIN_ATTEMPT_HMAC_SECRET`을 설정한다.
6. `NEXT_PUBLIC_DEMO_MODE=false`로 바꾸고 개발 서버를 다시 시작한다.

학생 토큰은 URL이나 로컬 영구 저장소에 넣지 않는다. Auth0·Convex·Vercel 비밀값과 실제 교사 `sub`도 저장소에 커밋하지 않는다.

교사 QR에는 `/join#entry=...` 형식만 사용한다. `#` 뒤 fragment는 Vercel 요청 경로로 전송되지 않으며, 학생 화면은 값을 읽은 직후 주소창에서 제거한다. 수동 코드는 URL에 넣지 않고 Convex mutation 인자로만 전송한다.

## 가상 데이터 기술 Preview

- Vercel 프로젝트: `history-game`
- Root Directory: `apps/cooperative-live`
- 고정 주소: <https://history-game-kappa-gilt.vercel.app>
- Vercel에는 `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`, `NEXT_PUBLIC_DEMO_MODE=false`만 등록한다.
- 교사 `sub` 허용목록은 Convex 배포 환경변수에만 두며 Vercel이나 Git 저장소에 복제하지 않는다.

Vercel이 고정 production alias를 발급했지만 현재 운영 판정은 **가상 데이터 기술 Preview**다. 실제 학생 접속 허가와는 별개다.

## 검증

```powershell
npm run check
```

`npm run test`는 순수 함수 단위 테스트 12건과 `convex-test` 기반 가상 학급 통합 테스트 1건을 함께 실행한다. 통합 테스트는 실제 학생 데이터나 운영용 우회 API 없이 교사 1명·가상 학생 21명의 전체 흐름을 검사한다.

실제 학생 접속과 수업 운영 전환은 저장소의 `BACKLOG.md`에 있는 `P1-COLLAB-PRIVACY` 해제 뒤에만 진행한다.
