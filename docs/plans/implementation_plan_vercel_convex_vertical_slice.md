# Vercel·Convex 실시간 협동 MUD 첫 수직 슬라이스 구현 계획

- 작성일: 2026-09-07
- 작업: TASK-20260907-02
- 상태: `integrated-main-local` — 2026-09-08 `main` 통합과 전체 로컬 검증 완료. 실제 Convex 런타임·Auth0·Vercel 연결은 계정 설정과 P1 개인정보 게이트 전까지 대기
- 목적: 앱 위치, 첫 수직 슬라이스, 교사 인증을 확정하고 실제 구현 범위를 한 목적 단위로 제한한다.

## 1. 확정 제안

| 결정 | 제안 | 이유 |
|---|---|---|
| 신규 앱 위치 | 같은 저장소의 `apps/cooperative-live/` | 기존 정적 앱·GitHub Pages를 건드리지 않고 Vercel Root Directory를 독립 지정할 수 있다. 앱 자체 `package.json`을 두어 루트 저장소에 빌드 도구를 강제하지 않는다. |
| 첫 시나리오 | 수업 검증 이력이 있는 고조선 8조법 | 새 콘텐츠와 새 실시간 구조를 동시에 검증하지 않는다. 콘텐츠는 기존 정적 시나리오에서 가져오되 실시간용 계약으로 명시적으로 변환한다. |
| 첫 수직 슬라이스 | 교사 1명 + 가상 학생 8명 + 4인 모둠 2개 | QR 입장, 활동별 새 호 선택, 무작위 편성, 역할 분리, 진행 대시보드, 힌트/심화, 종료 삭제까지 핵심 가치를 한 번 관통한다. |
| 교사 인증 | Auth0의 Google 로그인 + Convex 서버 측 교사 `sub` 허용목록 | 학생 인증을 만들지 않으면서 교사 권한은 검증된 OIDC 주체로 제한한다. beta인 Convex Auth를 첫 운영 경로에서 제외한다. |
| 학생 인증 | 계정 없음. QR 입장 후 서버가 세션 한정 난수 토큰 발급, 서버에는 해시만 저장 | 학생 이름·이메일·장기 계정을 만들지 않는다. 토큰은 URL·로그에 남기지 않고 기기 `sessionStorage`에만 둔다. |
| 배포 구조 | 기존 정적 앱은 GitHub Pages 유지, 신규 앱만 Vercel 프로젝트로 연결 | 첫 슬라이스에서 기존 포털 이전까지 섞지 않는다. Vercel Root Directory는 `apps/cooperative-live`로 지정한다. |
| Convex 리전 | 운영 리전은 P1 개인정보 게이트에서 확정. 그 전에는 로컬 또는 가상 데이터 전용 개발 배포만 사용 | Convex Cloud의 미국 동부·아일랜드 모두 국외 처리이며 기존 배포는 리전 변경이 불가능하다. |

## 2. 첫 수직 슬라이스 범위

```text
교사 Google 로그인
  → 고조선 활동 생성
  → QR 표시·입장 열기
  → 가상 학생 8명 입장
  → 무작위 후보에서 활동별 새 호 선택(미선택 시 자동 배정)
  → 4인 모둠 2개 + 역할 무작위 배정
  → 각 학생 역할 단서 확인·개인 판단 완료 표시
  → 교사 대시보드에 모둠 구성·단계·제출 0~4·경과 표시
  → 교사가 한 모둠에 기본 힌트, 다른 모둠에 심화 상황 전송
  → 학생 화면 실시간 반영
  → 교사 종료
  → 서버·기기 세션 데이터 삭제 확인
```

첫 슬라이스에서는 전체 고조선 학습 루프, 자유 입력 법안, 여러 시나리오, 학생 장기 기록, 다른 교사 초대, 기존 포털 Vercel 이전을 구현하지 않는다.

## 3. 데이터 경계

### Convex에 활동 중만 저장

- 세션 ID·상태·단계·만료 시각
- 임시 참여 ID, 무작위 호, 모둠·역할
- 제출 여부·시각(선택 내용과 이유 제외)
- 모둠별 진행 상태, 도움 요청, 힌트·심화 이력
- 해시 처리한 입장·복구 자격

### 학생 기기에만 저장

- 개인 선택과 이유
- 현재 화면 복구에 필요한 세션 한정 초안
- 저장 위치는 메모리 또는 `sessionStorage`; 종료 시 제거

### 수집·저장하지 않음

- 학생 이름·학번·이메일·학생 계정·명단
- 기기 고유 ID·위치·음성·화면 녹화
- 활동 간 학생 연결키와 이전 호·모둠 기록
- 요청 본문·토큰·개인 답변을 포함한 애플리케이션 로그

## 4. 종료·삭제 수용 기준

교사가 종료하면 하나의 서버 작업이 해당 세션의 rooms/players/actions/events, 호·모둠·역할, 진행·힌트/심화 이력, 입장·복구 자격을 삭제한다. 학생 화면은 종료 신호를 받은 뒤 `sessionStorage`를 지운다.

- 종료 후 기존 학생 토큰으로 조회·재입장할 수 없어야 한다.
- 자동 삭제 실패 시 교사에게 실패 상태와 재시도 버튼을 보여야 한다.
- 교사 수동 강제삭제가 같은 삭제 작업을 다시 호출해야 한다.
- 종료 버튼을 누르지 못한 세션은 짧은 `deleteAfter` 만료 작업으로 정리해야 한다.
- Convex·Vercel 운영 로그와 백업 잔존기간은 애플리케이션 삭제 테스트와 별도로 P1 개인정보 게이트에서 확인한다.

## 5. 프로젝트 구조

```text
apps/cooperative-live/
  app/
    join/
    play/[sessionId]/
    teacher/
    teacher/sessions/[sessionId]/
  components/
  convex/
    schema.ts
    auth.config.ts
    sessions.ts
    players.ts
    rooms.ts
    interventions.ts
    cleanup.ts
  lib/
  tests/
  package.json
  next.config.ts
  tsconfig.json
```

기존 `cooperative-mud/gojoseon-law/scenario.js`를 런타임에서 직접 import하지 않는다. 첫 구현에서 필요한 고조선 콘텐츠를 검토 가능한 TypeScript 데이터 계약으로 옮기고, 이후 정적·실시간 콘텐츠 단일 원본화는 별도 작업으로 둔다.

## 6. 환경·계정 준비

1. Vercel, Convex, Auth0 계정을 준비하고 GitHub `joonssem/history_game` 접근 권한을 확인한다.
2. Vercel 프로젝트의 Root Directory를 `apps/cooperative-live`로 지정한다.
3. Development·Preview·Production을 분리한다. Preview는 Convex preview deploy key, Production은 production deploy key만 사용한다.
4. `CONVEX_DEPLOY_KEY`와 인증 관련 비밀은 대시보드 환경변수에만 저장하고 저장소에 커밋하지 않는다.
5. Auth0에는 교사용 Google 로그인만 연결하고, 학생 로그인·학생 사용자 레코드는 만들지 않는다.
6. 교사 허용목록은 이메일 문자열이 아니라 Auth0 `sub`를 Convex 환경변수 또는 교사 권한 테이블에 등록한다.
7. 운영 Convex 리전과 실제 학생 접속은 `P1-COLLAB-PRIVACY` 해제 뒤 확정한다.

현재 로컬 확인: Node.js `v24.14.1`, npm `11.11.0`, 기준 브랜치 `main`, 원격 `joonssem/history_game`. 기능 브랜치의 구현은 2026-09-08 `main`에 통합했다. `apps/cooperative-live/`에 독립 `package.json`, Next.js 앱, Convex 함수 폴더를 두었고 Vercel 프로젝트 연결 전이므로 `vercel.json`은 만들지 않았다.

### 2026-09-07 구현 결과

- 가상 교사 화면에서 세션 생성 → 학생 8명 입장 → 4인 모둠 2개·역할 무작위 편성 → 진행 단계 → 모둠별 힌트/심화 → 종료 삭제를 관통했다.
- 실제 연결용 Convex 스키마·권한·토큰 해시·세션/학생/개입/삭제 함수를 작성했고, 교사 대시보드에는 개인 선택·이유를 노출하지 않는다.
- 학생 개인 판단은 `sessionStorage`에만 두고 앱 전용 키만 삭제한다. 활동 간 연결 식별자는 만들지 않는다.
- lint, TypeScript, 단위 테스트 3건, Next.js production build, 데스크톱·375px 모바일 대표 흐름과 콘솔 오류 0건을 확인했다.
- Convex 익명 로컬 배포는 개발 PC가 백엔드 바이너리를 내려받을 때 `self-signed certificate in certificate chain`을 반환해 실행하지 못했다. 인증서 검증을 끄는 우회는 사용하지 않았으며, 실제 함수 통합 검증은 신뢰할 수 있는 CA 설정 또는 Convex 개발 배포 연결 뒤 진행한다.

### 2026-09-07 이어받기 보강 결과

- 다른 PC에서 푸시한 `feat/cooperative-live-vertical-slice`를 다시 받아 동일 브랜치에서 작업을 재개했다.
- 교사 대시보드가 새로고침 뒤 현재 소유 세션을 서버에서 다시 찾도록 했고, 활동 생성 연타도 기존 세션을 재사용하게 했다.
- 학생이 같은 탭에서 같은 QR·수업 코드로 다시 입장하면 기존 슬롯으로 돌아가게 해 중복 참여자 생성을 막았다.
- 4명씩 단순 분할해 마지막 모둠이 1~2명이 될 수 있던 편성 로직을 3~24명 전체에서 3~5명 균형 모둠으로 바꿨다. 24명을 넘으면 입장을 거부한다.
- 6자리 수업 코드가 5회 연속 충돌하면 중복 코드를 저장하지 않고 명시적으로 실패하며, 대시보드·현재 세션 응답에서 교사 Auth0 `sub`를 제외한다.
- 이 PC에서 `npm ci` 후 `npm run check`를 재실행해 lint, TypeScript, 단위 테스트 5건, Next.js production build를 통과했다. 개발 서버의 `/`, `/teacher`, `/join` 응답도 모두 HTTP 200으로 확인했다.
- 개인정보 감사 기준과 대조하면서 QR URL도 수동 입력과 같은 6자리 코드만 사용하고 반복 시도 제한이 없음을 발견했다. 실제 학생 접속 전에 QR 전용 장기 난수 입장키와 수동 코드 제한을 별도 설계·권한 테스트해야 하므로 `P1-COLLAB-PRIVACY`에 기록했다.

## 7. 검증

- 정적 검사: lint, TypeScript typecheck, Next.js production build, Convex 함수 테스트
- 권한: 비로그인 교사 API, 허용목록 밖 교사, 다른 세션·모둠 조회, 만료 토큰 모두 거부
- 동시성: 학생 8명 동시 입장, 같은 토큰 중복 입장, 편성 확정과 늦은 입장 경합
- 실시간: 제출 수·단계·힌트·심화 상황이 두 브라우저 컨텍스트와 교사 화면에 즉시 반영
- 복구: 새로고침·탭 복귀·Wi-Fi 재연결 후 자기 슬롯만 복원
- 삭제: 종료 전 데이터 존재, 종료 후 세션 하위 데이터 0건, 토큰 재사용 거부, 실패 재시도
- 배포: Vercel Preview가 전용 Convex Preview를 사용하고 Production 데이터와 분리됨
- 교실 전 단계: 가상 데이터로만 학생 21명+교사 1명 동시접속 부하·학교 Wi-Fi·아이패드·QR 실측

## 8. 구현 순서

1. 별도 작업 브랜치 생성 및 `apps/cooperative-live` 최소 앱 뼈대
2. Convex 로컬 개발 환경·스키마·권한 테스트
3. Auth0 교사 로그인과 서버 허용목록
4. QR 입장·임시 토큰·새 호·무작위 편성
5. 학생 최소 화면과 교사 실시간 대시보드
6. 정해진 힌트·심화 상황 전송
7. 종료·자동/수동 삭제와 실패 표시
8. 가상 학생 8명 자동 브라우저 검증
9. Vercel Preview + Convex Preview 연결
10. 개인정보 P1 게이트 해제 후에만 운영 리전·Production·실제 학생 리허설

## 9. 구현 승인 시 필요한 사용자 입력

- Auth0에 연결할 교사용 Google 계정은 대화나 문서에 적지 않고 설정 화면에서 직접 등록한다.
- 운영 Convex 리전은 개인정보 게이트 결과에 따라 미국 동부 또는 아일랜드 중 선택한다.
- 첫 시나리오는 고조선 8조법을 사용한다는 제안을 승인하거나 다른 시나리오를 지정한다.

## 10. 공식 기술 근거

- [Vercel monorepo Root Directory](https://vercel.com/docs/monorepos)
- [Vercel 환경변수 분리](https://vercel.com/docs/environment-variables)
- [Convex와 Vercel 연결·Preview 배포](https://docs.convex.dev/production/hosting/vercel)
- [Convex 프로젝트의 개발·운영 배포 분리](https://docs.convex.dev/production/overview)
- [Convex Next.js App Router](https://docs.convex.dev/client/nextjs/app-router/)
- [Convex 인증 선택지](https://docs.convex.dev/auth/overview)
- [Convex 리전](https://docs.convex.dev/production/regions)
