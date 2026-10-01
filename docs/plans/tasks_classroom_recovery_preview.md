# 통합 복구 Preview 준비·연결 검증

- 작성일: 2026-10-01
- 작업: `TASK-20261001-COOP-PREVIEW-PREP`
- 사용자 원문: “다음 작업 진행하기”
- 대상: `feat/goryeo-classroom-activities`, 기존 Vercel `history-game` 기술 Preview와 Convex 개발 환경
- 선행 검증: 단위 21/21·Convex 24/24·lint·TypeScript·production build, 별도 읽기 전용 감사와 로컬 가상 UI 확인

## 준비

- [x] 기존 변경 보존과 브랜치 유지 확인
- [x] 검증된 통합 코드·교사 안내·계획을 로컬 커밋으로 정리 (`13dbaa6`)
- [x] Vercel CLI 인증 오류를 비밀값 노출 없이 진단
- [x] 기존 Preview의 커밋과 Convex 연결 설정을 대조 (아래 결과)
- [x] 프런트의 공개 환경변수와 Convex의 함수·스키마·교사 인증 계약을 확인 (실제 Auth0 로그인은 별도 대기)
- [x] 필요한 Preview 변경 대상을 구체화하고 기존 배포 관문에 따라 실행

## 연결 뒤 확인

- [ ] 교사 로그인·callback과 학생 QR/코드 입장
- [ ] 동시 재시도·같은 탭 재접속·자리 재연결
- [ ] 선택 모둠 한 단계·사유·동의·개인 완료값 보존
- [ ] 1~2명 복구·빠진 역할 요약·다른 모둠 보존
- [ ] 초안 수정·제외 학생 복귀·최신 revision 재확인
- [ ] 테스트 세션 종료 및 하위 데이터·교사 이력 삭제
- [ ] 학교 네트워크·물리 기기 4~8대 리허설

기존 `main`의 테마·문서 변경은 보존한다. 가상 UI 확인을 인증·운영 서버·물리 기기 검증으로 기록하지 않는다. 비밀키·교사 식별값·학생 토큰·QR 원문은 문서나 도구 출력에 남기지 않는다.

## 2026-10-01 준비 결과와 배포 대상

- 통합 코드 커밋: `13dbaa6`, 브랜치 `feat/goryeo-classroom-activities`. 선행 45개 검사와 빌드 통과. main의 미커밋 변경 보존.
- 기존 Preview: `https://history-game-8pyxmoxkb-joon0noh-3339.vercel.app`, 배포 `dpl_BQE3BBuvB5WotsCaQmUMbvBD21RQ`, READY. 실제 소스는 입장 복구 브랜치의 `387dabe1aaff6644ed7374db2b6712463dafc506`이며 이번 통합 코드는 없다.
- 프로젝트: `history-game`, rootDirectory `apps/cooperative-live`, Next.js.
- 공개 설정 이름: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`, `NEXT_PUBLIC_DEMO_MODE`. 모두 production/preview에 함께 적용되며 별도 브랜치 설정이 없다. 2026-10-01 배포 실행 전 공식 개별 환경변수 조회 API로 다시 확인했으며, Convex URL은 로컬 복구 worktree의 개발 URL과 같다. 이전 목록 API의 암호화된 값을 대조하여 다르다고 기록한 판단을 정정한다. 이 공유 서버에 통합 코드를 적용하지 않는다.
- CLI 61.0.0 OAuth 코드가 `os.hostname()`을 User-Agent에 삽입해 ByteString 오류가 발생했다. 실행 한정 preload에서 해당 헤더의 Unicode만 URL 인코딩했다. 이후 TLS 오류 `SELF_SIGNED_CERT_IN_CHAIN`은 Node `--use-system-ca`로 Windows 인증서 저장소를 사용해 해결했다. TLS 검증·설치 CLI·저장된 토큰·컴퓨터 이름은 변경하지 않았다. 배포 목록과 API 조회 모두 성공.
- 승인 대상: 별도 Convex 개발 환경에 이 커밋의 함수·스키마를 적용하고, 해당 개발 URL을 명시한 Vercel **Preview만** 배포한다. 공통 production/preview 환경변수를 바꾸지 않고, main merge 및 Production 배포는 포함하지 않는다. 기존 로컬 서버도 공유 중이므로 전용 개발 배포 `dev/classroom-recovery-20261001`을 생성한다.
- 배포 후 Auth0 callback, Convex 인증 계약과 교사·학생 흐름을 실제로 확인한다. 아직 실제 연결 검사·학교 기기 검증은 수행하지 않았다.
- 선행 통합 계획의 “이번 승인 범위는 구현·검증이다. 기존 merge·배포·실제 학생 현장 관문을 유지한다.”에 따라 실제 서버 적용은 별도 확인 대기.

## 실행 승인

- 사용자 원문: “진행시켜”. 2026-10-01 별도 개발 서버 적용과 Vercel Preview 배포·기술 검증 승인. 위 확인 대기를 해제하고 `TASK-20261001-COOP-PREVIEW-DEPLOY`로 실행한다.

## 배포·기술 확인 결과

- 소스: `e326e1b` / `feat/goryeo-classroom-activities`. 최소 수정은 Convex 허용 모듈명 `groupState.ts`와 공유 타입 상대 경로 import 두 건이다. 로직 변경 없음.
- 새 전용 개발 서버: `dev/classroom-recovery-20261001`, `https://fiery-cobra-795.convex.cloud`. Auth0 프런트·서버 값 일치, 기존 교사 허용목록 유지, 새 HMAC 키 설정. 실제 `convex dev --once --typecheck enable` 배포 성공.
- Vercel Preview: `https://history-game-91dvkb68v-joon0noh-3339.vercel.app`, `dpl_FceMyjfHKeB7snSrtCd2HhwqXKQ4`, READY. 배포별 build/runtime Convex URL을 전용 서버로 지정했다. 공통 환경변수·Production·main은 변경하지 않았다. 기존 고정 주소의 Production은 `dpl_8Df7yhpPYCDBgpq1ST1yh8DRq78H` / `history-game-a329n3x3b-joon0noh-3339.vercel.app`으로 유지됨을 API에서 확인했다.
- 전체 `npm run check`: 21개 단위 검사·24개 Convex 검사·lint·typecheck·build 통과. 새 Preview의 학생 화면에서 잘못된 코드를 거부·재시도 안내함을 확인했고, 해당 요청의 전용 서버 도착도 확인했다. 미인증 교사 접근·잘못된 QR 키 거부 확인.
- 별도 실제 서버 검사: 가상 참여자 8명의 QR/코드 입장·동시 중복 좌석 방지, 사유/동의·stale 단계·pause 차단, 2인 복구·다른 모둠/개인 완료값 보존, 비공개 본문 제외 요약, 최신 초안 revision 재확인·정확한 완료 수, 제외 학생 복귀·원래 역할·초안 재개·이전 토큰 무효화를 통과했다.
- 위 실제 서버 검사는 Convex 관리용 테스트 identity로 수행했다. 실제 Auth0 브라우저 로그인을 검증한 것으로 취급하지 않는다. 생성한 일회용 세션은 종료했으며 sessions/players/rooms/drafts/teacherActions/helpRequests/interventions가 모두 0임을 확인했다. 인증 신원·학생 토큰·QR 원문은 파일과 출력에 기록하지 않았다.
- 화면 증거: 저장소 루트 `.worktrees/preview-diagnostics-20261001/deployed-preview.png`. CLI 조회·배포·검사 결과는 같은 무시된 디렉터리에 보관한다.

## 남은 실제 인증 연결

- 새 주소 `/teacher`에서 Auth0 `Callback URL mismatch`를 재현했다. 해당 Auth0 Application Settings에 다음 값만 추가해야 한다. 기존 값은 보존하고 wildcard를 추가하지 않는다.
  - Allowed Callback URLs: `https://history-game-91dvkb68v-joon0noh-3339.vercel.app/teacher`
  - Allowed Logout URLs 및 Allowed Web Origins: `https://history-game-91dvkb68v-joon0noh-3339.vercel.app`
- 관리 설정: `https://manage.auth0.com/#/applications/MIr6v4nHaVnvuHZN8VJqtq2P4uq4vuGp/settings`. 기존 관리 계정 로그인 필요. 현재 Google 계정으로는 신규 가입 정보 화면이 나와 등록을 진행하지 않고 로그아웃했다. 사용자에게 기존 관리 계정 로그인을 요청하고 해당 탭을 열어 두었다.
- 실제 교사 로그인·callback·학생 기기 브라우저 흐름·학교 네트워크·물리 기기 4~8대 리허설은 미완료다. 배포 READY와 관리용 서버 검사 통과로 수업 Go를 판단하지 않는다.
