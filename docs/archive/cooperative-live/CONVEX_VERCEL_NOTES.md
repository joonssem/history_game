# Convex + Vercel 재사용 노트

- 정리일: 2026-10-07
- 대상: `apps/cooperative-live` 실시간 협동 앱
- 읽는 법: **코드/설정 확인**은 저장소에서 확인한 내용, **운영 기록**은 점검·마감 문서에 적힌 실제 이력, **추정**은 설정 파일의 기본 동작에 근거한 추론, **확인 불가**는 대시보드·기기·계정에 접근하지 않고 판단할 수 없는 항목이다.
- 비밀값, 비밀번호, 배포 키, 토큰, 학생 이름과 학생별 정보는 이 문서에 기록하지 않는다. 변수 이름과 비식별 운영 사실만 적는다.

## 1. 버전과 구성

### 버전

| 항목 | 확인 내용 | 근거 |
|---|---|---|
| Convex | `1.45.0` | `apps/cooperative-live/package.json`, `package-lock.json` |
| React / React DOM | `19.2.8` | 같은 파일 |
| 프론트엔드 프레임워크 | Next.js `16.3.4` App Router | 같은 파일, `apps/cooperative-live/app/` |
| Vite | 프론트엔드 빌드 도구로 사용하지 않는다. 테스트 도구 Vitest `4.1.11`은 사용한다. Vite 직접 의존 버전은 확인 불가 | `package.json`, `vitest.config.ts` |
| TypeScript | `5.9.3` | `package.json` |
| Node.js | 패키지 요구 조건 `>=20.9`; 구현 계획서의 당시 로컬 기록은 `v24.14.1`, 이 문서 작성 시 현재 작업 PC도 `v24.14.1` | `package.json`, `docs/plans/implementation_plan_vercel_convex_vertical_slice.md`; 현재 PC `node --version` |
| npm | 현재 작업 PC `11.11.0`; 프로젝트 고정 요구 버전은 확인 불가 | 현재 PC `npm --version`, `package-lock.json` |

패키지 버전은 앱 디렉터리의 `package.json` 기준이다. 저장소 루트의 기존 GitHub Pages 앱과 실시간 앱은 별도 앱이다. 기존 정적 앱은 GitHub Pages에 남기고, Next.js + Convex 앱만 Vercel 프로젝트에 연결했다. 근거: `docs/plans/implementation_plan_vercel_convex_vertical_slice.md`, `apps/cooperative-live/README.md`.

### 폴더 구조와 설정 파일

```text
apps/cooperative-live/
  app/          Next.js App Router 페이지와 전역 스타일
  components/   교사 콘솔, 학생 활동, 입장 화면 등 UI
  convex/       Convex 스키마, 함수, 보안, 정리 함수, 테스트
    _generated/ Convex 생성 파일(로컬에는 존재, Git에는 미추적)
  lib/          Convex 연결, API 참조, 런타임/로그인 유틸리티
  shared/       서버와 클라이언트가 공유하는 시나리오·보안 규칙
  package.json
  package-lock.json
  next.config.ts
  tsconfig.json
```

위 구조는 `apps/cooperative-live` 실제 폴더와 파일을 확인한 것이다. `convex/_generated`는 앱 `.gitignore`에서 제외하고 있으며, `git ls-files` 결과에도 없어 Git에 올리지 않는다. 현재 작업 PC에는 폴더가 있으므로 **로컬 생성물은 존재하지만 저장소 추적 대상은 아니다**. 근거: `apps/cooperative-live/.gitignore`, `apps/cooperative-live/convex/_generated/`.

저장소에서 `vercel.json`, `convex.json`을 찾지 못했다. `next.config.ts`에는 `reactStrictMode: true`만 설정돼 있다. 따라서 Vercel/Convex 세부 배포값은 대시보드 또는 CLI 설정에서 관리하고 저장소 설정 파일로 고정하지 않은 구성이다. 근거: `apps/cooperative-live/next.config.ts`, `apps/cooperative-live/README.md`.

## 2. 배포 설정

### Vercel 빌드 설정

| 항목 | 확인 내용 |
|---|---|
| Root Directory | `apps/cooperative-live` (README에 명시) |
| Framework | Next.js |
| Build Command | 프로젝트 스크립트는 `npm run build` → `next build`. Vercel 대시보드에서 명령을 덮어썼는지는 확인 불가 |
| Output Directory | 저장소 설정은 없음. Next.js 기본 출력 디렉터리 `.next`를 쓸 것으로 **추정**하며 대시보드의 override 여부는 확인 불가 |
| Install Command | 확인 불가. 저장소에는 `package-lock.json`이 있고 로컬 절차는 `npm ci`지만, Vercel 대시보드의 실제 명령은 저장소에서 볼 수 없음 |
| Vercel 설정 파일 | `vercel.json` 없음 |

근거: `apps/cooperative-live/package.json`, `apps/cooperative-live/package-lock.json`, `apps/cooperative-live/README.md`.

### 환경 변수 이름과 용도

값은 적지 않는다. `.env.local`은 읽지 않았다.

| 변수 이름 | 설정 위치/용도 | 근거와 상태 |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | 브라우저가 연결할 Convex URL. Vercel과 로컬 프론트엔드 설정에 사용 | README는 현재 Vercel에 등록한 공개 변수로 명시. `app/providers.tsx`, `lib/runtime.ts`에서 사용 |
| `NEXT_PUBLIC_DEMO_MODE` | `true`면 가상 데모, `false`면 Convex 실시간 연결 경로 | `.env.example`, `lib/runtime.ts`, README. README의 현재 Vercel 설정은 `false` |
| `CONVEX_DEPLOYMENT` | 로컬 Convex CLI가 개발 배포 대상을 기억하는 변수 | `.env.example`; Vercel 환경 변수라는 근거는 없음 |
| `TEACHER_PASSCODE` | Convex 서버에서 교사 비밀번호 확인에 사용. Vercel에 복제하지 않음 | `convex/security.ts`, README, 2026-10-05 인계 기록 |
| `JOIN_ATTEMPT_HMAC_SECRET` | Convex 서버에서 입장 실패 제한 버킷을 HMAC 처리 | `convex/students.ts`, README, `.env.example` |
| `CONVEX_DEPLOY_KEY` | 현재 저장소의 Vercel 설정 목록에는 없음. Production/Preview에 실제 등록됐는지 별도 대시보드 확인 없이는 단정할 수 없음 | 최초 계획은 환경별 배포 키 분리를 제안했으나 현재 README의 Vercel 변수 목록에는 키가 없음. `docs/plans/implementation_plan_vercel_convex_vertical_slice.md`, README, `docs/archive/handoff/claude_session_close_20261005.md` |

README 기준 현재 Vercel에는 `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_DEMO_MODE`만 두며 비밀번호와 HMAC 비밀값은 Convex 배포 환경에만 둔다. 2026-10-06 기록은 Auth0 관련 이전 변수를 Vercel Production/Preview, Convex, 로컬에서 제거했다고 한다. 현재 코드 경로에는 Auth0 로그인이 없다. 근거: `apps/cooperative-live/README.md`, `walkthrough.md`(2026-10-06), `docs/archive/handoff/claude_session_close_20261005.md`.

### 배포 분리와 접속 주소

- Convex 개발 배포와 운영 배포를 분리하지 않았다. 인계 기록에 Vercel Production과 Preview 모두 같은 Convex **개발** 배포를 가리킨다고 명시돼 있다. 따라서 Convex 함수 배포가 운영 동작에도 즉시 반영될 수 있다. 이는 다른 프로젝트에서 그대로 복제하기보다 먼저 환경 분리를 설계할 중요한 운영 교훈이다. 근거: `docs/archive/handoff/claude_session_close_20261005.md`.
- 2026-09-28 리허설 기록에서 그 공용 대상은 `glorious-guanaco-616`으로 식별돼 있다. 이는 Convex 배포 이름이며 비밀 키가 아니다. 계정 설정은 바뀔 수 있으므로 현재 대시보드에서 여전히 같은 대상인지 확인은 필요하다. 근거: `docs/audits/cooperative_live_deployment_rehearsal_20260928.md`.
- `CONVEX_DEPLOY_KEY`를 Production/Preview별로 설정한 흔적이나 키 분리 여부는 확인 불가다. 초기 계획서에는 개발·미리보기·운영용 키 분리를 제안했지만 현재 공유 배포 구조와 일치하지 않는다. 근거: 계획서 §6, 10월 인계 기록.
- 2026-10-05에는 Convex 함수를 배포한 뒤 `main` 반영, Vercel 운영 자동 배포 순서로 진행했다고 기록돼 있다. GitHub의 `main` 반영 후 Vercel 배포는 자동화돼 있다. Convex 배포는 별도 단계다. 근거: `docs/archive/handoff/claude_session_close_20261005.md`.
- 안정 주소 형태는 `https://<프로젝트 별칭>.vercel.app`; 현재 README/리허설 기록의 별칭은 `history-game-kappa-gilt.vercel.app`이다. 사용자 도메인 연결 여부는 확인되지 않았다. 이 주소는 문서상 실제 학생 운영 승인이 아닌 가상 데이터 기술 Preview다. Git 기반 임시 Preview에는 Vercel 로그인 보호가 적용됐다고 인계 기록에 적혀 있다. 근거: README, `docs/audits/cooperative_live_deployment_rehearsal_20260928.md`, 10월 인계 기록.
- Vercel Preview는 현재 Production과 동일한 Convex 개발 배포를 바라본다. Preview에서 운영과 독립된 데이터를 쓰지 않는 구성이다.

## 3. 실시간 기능 구현

### 학생과 교사 식별

- 학생 계정·이름·이메일 없이 수업별 임시 무작위 토큰과 별칭으로 구분한다. 서버에는 토큰 원문 대신 해시를 저장하고, 학생 브라우저는 토큰과 개인 선택·이유를 `sessionStorage`에 둔다. 학생 토큰은 영구 저장소나 URL에 두지 않는다. 근거: `apps/cooperative-live/convex/students.ts`, `convex/schema.ts`, `components/LiveStudentActivity.tsx`, README.
- 학생 QR은 `/join#entry=...` 형식의 URL fragment를 쓴다. fragment는 서버 요청 경로에 포함되지 않고, 화면은 읽자마자 주소창에서 제거한다. 수동 입장 코드는 URL에 넣지 않는다. 근거: README, `components/LiveJoinForm.tsx`, `shared/join-security.ts`.
- 교사는 단일 `TEACHER_PASSCODE` 로그인으로 구분한다. 로그인 토큰은 브라우저 `localStorage`에 저장되고 서버에는 토큰 해시를 저장한다. 로그인 유효기간 12시간, 실패 10회 뒤 15분 잠금이다. 근거: `convex/teacherAuth.ts`, `convex/security.ts`, `lib/teacher-auth.ts`, README.

### Presence / heartbeat

- 학생 클라이언트는 입장 토큰이 있으면 즉시 heartbeat mutation을 보내고 이후 30초마다 전송한다. 서버는 `lastSeenAt`만 갱신한다. 근거: `components/LiveStudentActivity.tsx`, `convex/students.ts`의 `heartbeat`.
- 교사 대시보드는 마지막 heartbeat 기준 60초 이내를 online, 60~180초를 delayed, 180초 초과를 disconnected로 표시한다. 근거: `convex/sessions.ts`의 dashboard 연결 상태 계산.
- 이는 앱이 구현한 기준이며, iPad 화면 잠금 상태에서 브라우저가 타이머를 얼마나 늦추는지와 현장 재접속 성공률은 실측되지 않았다.

### 예약 실행, 자동 정리, 파일 저장소

- 별도 cron 설정은 찾지 못했다. Convex scheduler의 `runAt`을 각 세션/자격 생성 시 등록한다. 세션은 생성 2시간 뒤 `cleanup:deleteExpired`, 입장 QR 자격은 만료 시각에 `cleanup:expireEntryCredentials`, 입장 시도 버킷은 만료 시 `cleanup:deleteJoinAttempt`가 정리한다. 근거: `convex/sessions.ts`, `convex/students.ts`, `convex/cleanup.ts`, `shared/join-security.ts`.
- 교사가 세션을 종료하면 세션 하위 테이블 데이터를 즉시 삭제하고, 종료하지 않은 세션도 예약 삭제를 갖는다. 앱 DB 행의 정리 동작은 구현돼 있으나 공급자 로그·백업까지 즉시 지워진다는 뜻은 아니다. 근거: `convex/data.ts`, `convex/sessions.ts`, 개인정보 감사 `docs/audits/convex_elementary_school_privacy_audit.md`.
- Convex 파일 저장소 사용은 확인되지 않았다. 저장소에서 `ctx.storage` / 업로드 URL 사용을 찾지 못했고 스키마에도 파일 저장 ID가 없다. 근거: `apps/cooperative-live/convex/` 전체, `convex/schema.ts`.

### 교사 전용 접근과 재사용 코드

교사 함수는 전달받은 `teacherToken`을 서버의 로그인 레코드와 비교해 보호한다. 모든 권한을 클라이언트 플래그에만 맡기지 않고 Convex 함수에서 검사한다. 근거: `convex/security.ts`, `convex/teacherAuth.ts`, 각 `convex/sessions.ts` mutation.

**Convex React 연결** (`apps/cooperative-live/app/providers.tsx`):

```tsx
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

if (!isLiveConfigured || !convex) return children;
return <ConvexProvider client={convex}>{children}</ConvexProvider>;
```

**세션 TTL 예약 정리** (`apps/cooperative-live/convex/sessions.ts`, 정리 함수는 `convex/cleanup.ts`):

```ts
await ctx.scheduler.runAt(
  deleteAfter,
  makeFunctionReference<"mutation">("cleanup:deleteExpired"),
  { sessionId },
);
```

**30초 heartbeat** (`apps/cooperative-live/components/LiveStudentActivity.tsx`):

```ts
send();
const timer = window.setInterval(send, 30_000);
return () => window.clearInterval(timer);
```

실제 구현은 토큰 검사·실패 처리·타입 정의도 포함하므로 새 프로젝트에서는 코드 조각만 떼기보다 위 경로의 함수 전체와 함께 읽는 편이 안전하다.

## 4. 겪었던 문제와 해결, 확인되지 않은 운영 항목

### 기록으로 확인된 문제

1. **Convex TypeScript 배포 검사 실패**: 당시 `convex/tsconfig.json`에 앱 `@/*` alias 경로가 없어 Convex 배포 typecheck가 실패했고, 한 차례 `--typecheck=disable`로 우회했다. 이후 `allowImportingTsExtensions`와 `@/*` paths를 설정해 typecheck 비활성화 없이 배포하도록 수정했다. 현재 설정은 `apps/cooperative-live/convex/tsconfig.json`; 과거/해결 기록은 `walkthrough.md`, `docs/archive/handoff/claude_session_close_20261005.md`.
2. **Vercel 프론트와 Convex 함수 버전 불일치**: 2026-09-28 고정 주소에서 새 프론트가 보낸 `scenarioId` 인자를 연결된 Convex 함수 validator가 거부했다. 현재 저장소의 `convex/sessions.ts`와 스키마를 해당 개발 배포에 다시 반영해 복구했다. 함수 시그니처·스키마를 바꾸면 Convex 배포와 프론트 배포를 함께 맞춰야 한다. 근거: `docs/audits/cooperative_live_deployment_rehearsal_20260928.md`.
3. **21명 수업에서 빈 참가자 레코드가 자리 차지**: 2026-09-29 실제 수업 관찰에서 참가자 대기실이 접속 수만 보이고 유령 슬롯을 교사가 복구할 수 없어 일부 입장이 막혔다. 이후 heartbeat 기반 접속 상태, 대기실 카드, 내보내기/재편성·복구 기능을 구현해 2026-10-05 운영 반영했다고 기록돼 있다. 이는 문제/해결 이력만 요약한 것이며 학생별 정보는 포함하지 않는다. 근거: `docs/archive/handoff/claude_session_close_20261005.md`, `walkthrough.md` 2026-10-05 대기실 항목, `BACKLOG.md` `P0-COLLAB-GHOST-PLAYER`.
4. **로컬 Convex 익명 개발 서버 인증서 오류**: 초기 개발 중 백엔드 바이너리 다운로드에서 인증서 체인 오류가 있어 해당 시점에는 로컬 Convex 실행이 막혔다. 인증서 검증을 끄지 않고 신뢰할 CA 또는 원격 Convex 개발 배포를 사용하도록 기록했다. 특정 PC의 학교 프록시 환경에서는 배포 도구에 `NODE_OPTIONS=--use-system-ca`가 필요했다고 한다. 근거: `docs/plans/implementation_plan_vercel_convex_vertical_slice.md`, `docs/archive/handoff/claude_session_close_20261005.md`.

### 비밀값 유출 / 키 교체

- 현재 `.env.local` 파일은 로컬에 있으나 `.gitignore` 대상이며 Git 추적 파일 목록에는 없다. `.env.example`만 추적 대상이다. 실제 값은 확인하거나 기록하지 않았다. 근거: `apps/cooperative-live/.gitignore`, `git ls-files`의 환경 파일 목록.
- 과거 `.env`가 Git에 올라가 배포 키/토큰을 교체했다는 사건은 확인할 수 있는 문서나 추적 기록을 찾지 못했다. 따라서 “사건이 없었다”고 단정할 수는 없고 **확인 불가**로 둔다.

### 기기·네트워크·용량

| 질문 | 확인된 범위 |
|---|---|
| iPad Safari 화면 잠금 뒤 재연결 | Convex 앱에서 물리 iPad/Safari 절전 복귀는 **확인 불가**. 재접속 토큰·heartbeat·교사 일시정지/재개 기능은 코드에 있으나 현장 검증은 별도다. 근거: README 첫 기기 리허설, `docs/audits/cooperative_live_deployment_rehearsal_20260928.md` |
| 확대·스크롤·터치 | Convex 앱의 iPad Safari 확대/스크롤 문제는 **확인 불가**. 기존 정적 앱은 iPad 세로/가로 뷰포트와 44px 대체 터치 조작을 일부 브라우저 점검했지만 Convex 앱과 별개다. 근거: `docs/audits/ipad_ux_regression_report.md`, `walkthrough.md`의 iPad 회귀 기록 |
| 학교 Wi-Fi | 기존 활동에서 문제 없었다는 과거 관찰 기록은 있다. Convex 실시간 앱의 Wi-Fi/WebSocket 재연결은 검증되지 않았다. 근거: `walkthrough.md` 2026-09-06 협동 MUD 검토 항목, `docs/audits/cooperative_live_deployment_rehearsal_20260928.md` |
| 동시 접속 | `convex-test` 가상 학급 테스트는 다수 동시 입장과 수업 흐름을 검증했다. 이는 실제 네트워크 부하 측정이 아니다. 실제 수업에서 입장 장애가 있었고 복구 기능이 추가됐다. 대규모 지연/오류 측정 결과는 **확인 불가**. 근거: `apps/cooperative-live/convex/virtual-load.test.ts`, 10월 인계 기록 |
| Convex 무료 플랜 한도 | 호출량·대역폭·저장용량 한도에 실제 도달한 기록은 찾지 못했다. 계정 사용량/요금제 대시보드는 확인하지 않아 **확인 불가**다. 근거: 저장소 운영 기록 범위 |
| 교사 회수/운영 승인 | 현재 문서는 가상 데이터 기술 Preview로 분류하며 실제 학생 운영 허가와 다르다고 명시한다. 개인정보·국외 처리 및 공급자 계약 확인이 별도 게이트다. 근거: README, `docs/audits/convex_elementary_school_privacy_audit.md` |

### 다음 프로젝트에서 처음부터 다르게 할 점

- 개발·Preview·Production Convex를 처음부터 분리하고 Vercel 환경 변수도 각각의 배포에 명시적으로 매핑한다. 현재는 Preview와 Production이 같은 개발 배포를 공유한다.
- 세션 테이블에 빈 레코드가 남을 수 있는 모든 도중 이탈 경로와 교사 복구 UX를 설계 단계에서 포함한다. 합성 테스트뿐 아니라 접속 상태 집계와 실제 기기 재연결 시나리오를 별도 구분한다.
- 앱 validator/함수 인자 변경과 Vercel 프론트 변경을 단일 호환 가능한 배포 단위로 운영하고, 배포 후 연결된 URL이 의도한 Convex 환경인지 확인한다.
- `convex/_generated`는 Git에 넣지 않는 현재 방식을 유지하되, CI/새 작업 환경에서 codegen이 언제 실행되는지 문서화한다. 앱은 `lib/convex-api.ts`의 `makeFunctionReference`로 참조를 모으고 테스트는 `convex/test.setup.ts`에서 생성 서버 모듈을 대체한다.
- Convex 배포 전에 `convex/tsconfig.json`의 alias와 import 확장자/typecheck가 유지되는지 확인하고, `--typecheck=disable`은 임시 복구 이력으로만 취급한다.

## 5. 작업 방식

### 로컬 개발 명령 순서

가상 UI 확인의 README 순서:

```powershell
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Convex 연결 개발은 별도 터미널에서 Convex 개발 배포를 연결한 뒤 프론트 개발 서버를 실행한다. 문서화된 흐름은 아래와 같다. 실제 비밀값은 명령 인자나 문서에 쓰지 않는다.

```powershell
npm run convex:dev
npm run dev
```

Convex CLI가 안내하는 개발 배포 URL을 `NEXT_PUBLIC_CONVEX_URL`로 로컬 설정하고, Convex 배포 환경에 `TEACHER_PASSCODE`, `JOIN_ATTEMPT_HMAC_SECRET`을 설정한다. 데모 모드에서 실시간 모드로 바꾸면 개발 서버를 다시 시작한다. 근거: `apps/cooperative-live/README.md`, `.env.example`, `package.json`.

검증 명령은 README 기준 `npm run check`이며 lint, typecheck, 단위/Convex 테스트, Next.js build를 차례로 실행하도록 정의돼 있다. 이 노트를 만들기 위해 테스트를 실행하지는 않았다. 근거: `package.json`, README.

### 브랜치와 배포 흐름

- 작업은 기능 브랜치에서 하고 통합 후 `main`에 반영하는 흐름이 기록돼 있다. 작업 디렉터리를 공유하며 브랜치만 전환하지 말고 필요하면 별도 Git worktree를 쓴다는 저장소 지침이 있다. 근거: 루트 `AGENTS.md`, `docs/plans/implementation_plan_vercel_convex_vertical_slice.md`, 10월 인계 기록.
- `main` 변경은 Vercel Git 연동을 통해 자동 배포된다. Convex 함수는 CLI로 별도 배포한 후 프론트 배포를 진행한 기록이 있다. 현재 Preview·Production이 같은 Convex 개발 대상을 쓰므로 배포 순서를 바꿔도 환경 격리는 되지 않는다.
- 임시 Preview URL에서 외부 인증 callback 허용 문제가 발생한 적이 있다. 이후 Auth0는 제거됐고 현재는 교사 비밀번호 로그인이다. 지금의 Vercel Preview는 접근 보호가 걸렸다고 기록돼 있어 학생 기기 점검 주소로 쓰지 않는다. 근거: `docs/audits/cooperative_live_deployment_rehearsal_20260928.md`, `docs/archive/handoff/claude_session_close_20261005.md`.

### AI 코딩 도구에서 자주 생기는 Convex 실수

1. **프론트만 바꾸고 서버 validator를 배포하지 않음**: `scenarioId` 인자 불일치가 실제로 재현됐다. Convex `args` validator, schema, 프론트 호출부를 함께 검토한다.
2. **로컬 생성 파일을 저장소 파일로 오인**: `_generated`는 ignore 대상이고 앱 API 참조는 `lib/convex-api.ts`에 별도로 정의돼 있다. 타입/함수 추가 때 참조와 테스트 설정도 확인한다.
3. **Convex typecheck 설정 누락**: `convex/tsconfig.json`이 루트/앱 TypeScript alias를 모르면 배포 시 테스트·공유 모듈에서 실패할 수 있다. typecheck를 끄기보다 alias와 compiler 옵션을 실제 Convex 배포 조건에 맞춘다.
4. **Vercel Preview가 별도 백엔드라고 가정**: 현재 설정에선 Production과 Preview가 같은 Convex 개발 배포를 본다. Preview 데이터가 운영과 격리됐다고 추정하지 않는다.
5. **자동 삭제 범위를 과대 해석**: Convex scheduler의 앱 DB 삭제와 공급자 로그/백업의 보존·파기는 다르다. 삭제 테스트는 앱 테이블 범위만 증명한다.

## 선생님이 계정·기기에서 직접 확인할 항목

저장소 문서만으로는 다음을 확정할 수 없다. 필요하면 Vercel 프로젝트 Settings의 Build & Development Settings/Environment Variables, Convex 대시보드의 배포·Usage 화면, 실제 수업용 iPad와 Wi-Fi에서 확인한다.

- 실제 Build / Install / Output override 및 `CONVEX_DEPLOY_KEY`의 Production·Preview 등록 여부
- 프로젝트 별칭 외에 사용자 도메인이 연결돼 있는지
- 현재 Convex 요금제와 사용량, 함수 호출·대역폭·저장 공간 한도 접근 여부
- `.env` 과거 유출/교체 이력(저장소 밖 GitHub·Vercel·Convex 보안 감사 기록 포함)
- Convex 실시간 앱의 iPad Safari 잠금/복귀, 확대/스크롤, 학교 Wi-Fi 재연결, 실제 동시접속 품질
