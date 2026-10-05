# Codex 세션 마감 — 2026-10-01

## 보존한 작업

- 작업 폴더: `.worktrees/codex-goryeo-classroom-activities`; 브랜치: `feat/goryeo-classroom-activities`. 공유 main 브랜치는 전환하지 않는다.
- 고려 문화·생활 시나리오, QR/코드 입장 멱등, 사유·동의·최신 revision을 검사하는 교사 모둠 진행, 1~2인 명시 복구와 빠진 역할 근거 요약을 통합했다.
- 소스 커밋 `13dbaa6`, 배포 차단 최소 수정 `e326e1b`, 배포 기록 `99194bb`. 기존 문화 원본·main의 미커밋 테마/문서 변경은 보존한다.

## 검증·배포

- `apps/cooperative-live`의 `npm run check`: 단위 21/21, Convex 24/24, lint, typecheck, production build 통과. 로컬 가상 UI와 390/1024 반응형 확인.
- 전용 개발 서버: `https://fiery-cobra-795.convex.cloud`; 실제 함수 배포 성공. 가상 8명 QR/코드 중복 입장, 교사 진행 보호, 2인 복구, revision, 개인 완료 수, 제외 학생 복귀 검증 통과. 일회용 활동 하위 데이터 0 확인.
- Preview: https://history-game-91dvkb68v-joon0noh-3339.vercel.app / `dpl_FceMyjfHKeB7snSrtCd2HhwqXKQ4`, READY. 잘못된 입장 코드의 서버 요청 도착 확인.
- 기존 공유 Convex `glorious-guanaco-616`, Production `dpl_8Df7yhpPYCDBgpq1ST1yh8DRq78H`, Vercel 공통 환경변수는 유지했다. main 병합·Production 배포는 하지 않았다.
- 실제 서버 검사의 관리용 identity는 실제 교사 OAuth 로그인 검증이 아니다. 물리 기기 4~8대·학교 네트워크·학생 파일럿도 미실행이다.

## 오늘 멈춘 지점

사용자 요청으로 오늘 작업 종료. 인증 경로 선택·SPA 생성 양식 준비까지만 완료했다. Create를 누르지 않았으며 새 앱·Google 연결·고정 alias·새 인증 환경변수 적용은 미실행이다. 브라우저 정책에 따른 새 인증 접근 생성 직전 확인도 아직 받지 않았다.

- 현재 Google 관리 테넌트 `dev-52nfryf51dbtiepi`는 기존 앱 인증 테넌트와 달랐다. 사용자는 관리 가능한 현재 계정의 Preview 전용 SPA 경로를 선택했다.
- 준비한 이름: `History Game Cooperative Preview`, 유형: SPA. 고정 alias 후보 `history-game-cooperative-preview.vercel.app`는 아직 소유/사용 가능 여부를 확인하지 않았다.
- 기존 Preview는 여전히 기존 Auth0 공개 설정을 사용하며 교사 로그인에서 callback mismatch가 발생한다. 수업 Go 상태가 아니다.
- 화면 증거와 진단 도구는 무시된 루트 `.worktrees/preview-diagnostics-20261001`에 로컬 보존하며 Git에 올리지 않는다. 비밀 키·인증 신원·학생 토큰을 커밋하지 않는다.

## 다음 세션

1. 브랜치와 미커밋 변경 확인. 사용자 종료 요청을 해제하는 재개 요청을 받은 뒤 진행한다.
2. Auth0 생성 양식을 다시 확인하고 브라우저 정책상 새 인증 접근 생성 직전 확인을 받는다.
3. SPA 생성·Google 연결·정확한 callback/logout/origin 설정. 프런트 client secret은 사용하지 않는다.
4. 전용 Convex만 새 issuer/client로 맞추고 동일 교사 신원을 확인한다. 운영 서버는 보존한다.
5. Vercel 새 Preview의 build/runtime에 공개 Auth0 설정·전용 Convex URL을 명시하고 READY 확인. alias가 비어 있을 때만 고정 주소를 연결한다.
6. 실제 Google 로그인·교사 허용·학생 브라우저 활동·복구를 검증한 뒤 학교 기기 리허설과 학생 파일럿을 진행한다.

상세: [인증 계획](../plans/implementation_plan_preview_owned_auth.md), [검증 체크리스트](../plans/tasks_classroom_recovery_preview.md).
