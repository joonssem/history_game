# 협동 역사 MUD · 실시간 수직 슬라이스

기존 정적 GitHub Pages 앱과 분리된 Next.js + Convex 앱이다. Vercel 프로젝트의 Root Directory는 `apps/cooperative-live`로 지정한다.

## 현재 범위

- 고조선 8조법 기술 회귀 시나리오와 1단원 13차시 고려 초기 “새 고려의 첫 회의” 활동
- 교사가 생성 시 시나리오를 선택하고 서버가 ID와 version을 고정·검증
- 실제 연결 모드에서 3~24명을 시나리오별 3~5명 모둠으로 균형 편성
- 학생에게 자기 역할의 비공개 자료만 전달하고 다른 역할 자료는 공유 완료 뒤 근거 요약만 공개
- `역할 확인 → 개인 최초 판단 → 말로 공유 → 공동 초안 → 같은 revision 전원 확인` 관문
- 공동 초안은 정책 2개, 서로 다른 역할 근거 2개, 한계 1개, 연결 설명 1개를 서버에서 검증
- 초안 수정 시 revision 증가와 이전 전원 확인 무효화
- 교사 진행 대시보드, 단계 이동, pause/resume, 도움 요청·해제, 모둠별 n/N 진행 표시
- 교사 화면 새로고침 시 진행 중인 세션 복구, 같은 학생 탭의 중복 입장 방지
- QR은 URL fragment의 256비트 대기실 입장키를 사용한다. 같은 QR을 여러 학생이 15분 동안 사용할 수 있고, 미리보기 전환 또는 만료 시 무효화하며 Convex에는 SHA-256 해시만 저장
- 6자리 수동 코드는 브라우저별 5회/5분, 코드 전체 30회/5분 실패 제한 적용
- QR·수동 코드 입장은 15분, 학생 복구 토큰은 최대 2시간 뒤 만료
- 학생 개인 선택·이유는 현재 탭의 `sessionStorage`에만 저장하고 서버에는 완료 여부만 기록
- 종료 시 공동 초안·도움 요청을 포함한 세션 하위 데이터와 학생 기기 세션 정보 삭제

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

`npm run test`는 공개 시나리오·서버 시나리오 레지스트리 단위 테스트와 `convex-test` 기반 가상 학급 통합 테스트를 함께 실행한다. 통합 테스트는 실제 학생 데이터나 운영용 우회 API 없이 기존 가상 학생 21명 회귀와 고려 초기 4명 전체 흐름을 검사한다. 고려 테스트에는 역할 비공개, pause 차단, 공유 관문, stale revision 거부, 전원 확인, 종료 삭제가 포함된다.

## 첫 기기 리허설

교사 1명과 성인·교사 역할 학생 4명으로 먼저 수행한다. 실제 학생에게 접속 주소를 배포하지 않는다.

1. 교사 브라우저에서 고려 초기 시나리오를 선택하고 활동을 만든다.
2. 서로 다른 브라우저 프로필 또는 기기 4대로 QR·수동 코드 입장을 각각 확인한다.
3. 모둠 미리보기 후 시작하고, 네 역할 화면에서 다른 역할의 비공개 본문이 보이지 않는지 확인한다.
4. 최초 판단을 입력한 뒤 한 명만 공유 완료를 눌렀을 때 모둠이 공동 초안으로 넘어가지 않는지 확인한다.
5. `잠시 멈춤` 중 학생 입력이 서버에서 거부되고 `계속 진행` 뒤 복구되는지 확인한다.
6. 학생 한 명을 새로고침해 같은 호·모둠·역할·단계가 복구되는지 확인한다.
7. 정책 2개와 서로 다른 역할 근거 2개로 초안을 저장하고, 한 명이 확인한 뒤 초안을 수정해 기존 확인이 0/N으로 돌아가는지 확인한다.
8. 전원이 같은 revision을 확인해 발표 문장이 열리는지 확인한다.
9. 교사가 활동을 종료한 뒤 네 학생 토큰이 모두 거부되고 서버 하위 데이터가 비워지는지 확인한다.

기록 양식과 교실용 간편 절차는 [`TEACHING_EARLY_GORYEO.md`](./TEACHING_EARLY_GORYEO.md)에 있다. 리허설 중 네트워크나 서버 장애가 생기면 교사가 `잠시 멈춤`을 누르고 1분 안에 복구를 시도한다. 복구되지 않으면 세션을 종료하고 같은 문서의 교사 읽기·화이트보드 대체 절차로 전환한다. 대체 절차는 서버에 학생 응답을 남기지 않는다.

실제 학생 접속은 `P1-COLLAB-PRIVACY`의 근거와 실제 배포 환경 일치 확인, 위 4~8대 리허설 통과, 별도 Go 판정 뒤에만 진행한다.
