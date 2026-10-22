# Claude 세션 마감 — 2026-10-05

> 작성: Claude Code 세션(Opus). 기준: `origin/main` `a1d952c8` 이후 이 문서 커밋.
> Codex 사용량 한도로 중간부터 Claude가 실시간 협동 앱 작업을 이어받았다. 다음 작업자(Claude·Codex·사용자)가 오늘 바뀐 것과 남은 것을 한 번에 보도록 모았다.
> 세부 기록은 각 절의 링크에 있고, 이 문서는 요약과 연결만 한다.

## 1. 한 줄 요약

**실시간 협동 앱의 교사 로그인을 Auth0에서 교사 비밀번호로 바꾸고, 9/29 수업 장애를 고친 복구 기능과 카훗식 대기실을 함께 운영에 반영했다.**
- 운영 주소 `https://history-game-kappa-gilt.vercel.app/teacher`에서 사용자가 비밀번호 로그인을 확인했다.
- 실제 기기 리허설은 아직 하지 않았다. 다음 실제 수업 전에 해야 한다.

## 2. 흐름

| 순서 | 무엇 | 결과 | 근거 |
|---|---|---|---|
| 1 | Codex CLI 터미널 창 문제(Windows) | `~/.codex/config.toml`의 `[windows] sandbox`를 `elevated`→`unelevated`로 바꿔 창이 잠깐 깜빡이는 정도로 줄었다 | 이 문서만 |
| 2 | 9/29 수업 장애 요구 정리 | 빈 참가자 레코드가 자리를 차지해 21명 중 2명 입장 실패. 교사는 대기실에서 숫자만 볼 수 있었다 | `BACKLOG.md` `P0-COLLAB-GHOST-PLAYER` |
| 3 | 대기실 내보내기 구현(Codex) | 호·접속 상태·입장 시각 카드, 내보내기, 미리보기 전 경고. Claude 코드 리뷰 통과 | `walkthrough.md` 2026-10-05 대기실 절 |
| 4 | Auth0 제거 결정 | 이메일 일회용 코드 대신 비밀번호 하나로 결정(메일 서비스 불필요) | `BACKLOG.md` `P0-COLLAB-TEACHER-PASSCODE`, `P1-COLLAB-EMAIL-AUTH`(보류) |
| 5 | 비밀번호 로그인 구현(Claude) | 17개 교사 함수와 개입 전송에 `teacherToken` 확인, 로그인 테스트 4건 추가 | `b54f80f0` |
| 6 | 배포 | Convex 함수 배포 → main fast-forward(복구 P0·P1/P2·대기실·비밀번호 4커밋) → Vercel 운영 자동 배포 | `walkthrough.md` 2026-10-05 비밀번호 절 |
| 7 | 정리 | 로컬 main 동기화, Codex 이메일 계획 보류 표시, 문서 갱신, Convex tsconfig 경로 수정, 다 쓴 브랜치 3개·worktree 2개 삭제 | `6724cdb2`, `a1d952c8` |

## 3. 오늘 바뀐 규칙·사실 (다음 작업자가 알아야 할 것)

- **교사 로그인**
  - `/teacher`는 Convex 환경변수 `TEACHER_PASSCODE`(8자 이상) 하나로 로그인한다. 값은 Convex 대시보드에서만 바꾼다. 저장소·대화에 남기지 않는다.
  - 로그인 12시간 유지, 10회 실패 시 15분 잠금, 비밀번호를 바꾸면 모든 로그인이 끊긴다.
  - 교사는 한 명으로 가정한다. 모든 활동은 `passcode-teacher` 소유다. 이전 Auth0 소유 활동은 화면에 보이지 않는다.
  - 서버 교사 함수는 모두 `teacherToken` 인자가 필요하다. 클라이언트는 `lib/teacher-auth.ts`의 `useTeacherMutation`으로 자동으로 붙인다. 테스트는 `virtual-load.test.ts`의 `loginTeacher` 도우미를 쓴다.
- **⚠ 운영과 Preview가 같은 Convex를 쓴다**
  - Vercel Production·Preview 모두 `glorious-guanaco-616`(Convex "dev" 배포)을 쓴다. Convex 함수 배포가 곧 운영 반영이다.
  - 오늘 이 사실을 모르고 배포해, main 반영 전까지 운영 교사 화면이 새 서버와 맞지 않았다. 수업이 없는 시간이라 main 반영으로 해소했다.
  - 함수 인자·동작을 바꾸면 서버 배포와 main 반영을 한 번에 이어서 한다. 분리 전까지 Preview에서 호환되지 않는 서버를 시험하지 않는다.
- **Git Preview에는 Vercel 로그인 보호가 걸려 있다.** 학생 기기 리허설은 운영 주소에서 한다.
- **Convex 배포 타입 검사**: `convex/tsconfig.json`에 `@/*` 경로를 추가해 `--typecheck=disable` 없이 배포할 수 있다.
- **이 PC에서 배포 도구 실행**: 학교 프록시 때문에 `NODE_OPTIONS=--use-system-ca`가 필요하다. Vercel CLI는 PC 이름이 한글이라 `scratch/vercel_ascii_hostname.cjs`를 `--require`로 함께 넣는다.

## 4. 남은 일

| 구분 | 할 일 | 담당·조건 | 위치 |
|---|---|---|---|
| 현장 판정 | 별도 4~8대 리허설은 사용자 판단으로 불필요(2026-10-06). 지난 수업에서 2명 입장 실패에도 정상 인원 모둠은 진행함. 이 관찰은 부족 인원 복구·로그 검증까지 입증하지 않음 | 사용자 판단 기록, 8-3 면제 | `INBOX.md` 2026-10-06, `docs/plans/tasks_cooperative_live_classroom_recovery.md` 8-3~8-5 |
| 정리 | Vercel Production/Preview·Convex·로컬 `.env.local`의 Auth0 변수를 제거하고 Auth0 Development 테넌트의 `Default App` SPA를 삭제함(2026-10-06). 최근 30일 활성 사용자는 0명이고, 같은 기간 가입 1건·실패 로그인 2건이 기록됐으며 사용자 레코드는 별도로 유지됨. | 완료 | `BACKLOG.md` `P0-COLLAB-TEACHER-PASSCODE` |
| 구조 | 운영/개발 Convex 분리, Vercel Preview 환경변수 분리 | 고려 후속 활동 착수 전 | 같은 항목 |
| 관찰 | 대기실 카드 전체가 내보내기 버튼(태블릿 오터치), preview 내보내기 시 전체 재편성 | 리허설에서 확인 | `walkthrough.md` |
| 기능 | 고려 후속 협동 활동 2종(15~16차시, 17~18차시) | 리허설 GO·Convex 분리 뒤 | `docs/plans/tasks_goryeo_relations_culture_cooperative_live.md` |
| 판단 | 여러 교사 공동 사용이 필요해지면 이메일 인증 계획 재검토 | 사용자 | `docs/plans/implementation_plan_cooperative_live_email_auth.md` |

## 5. 오늘 배운 것

- **배포 전에 "어느 백엔드를 누가 쓰는지"를 확인한다.** 이름이 "dev"인 배포가 운영에 연결돼 있었다. 환경변수 이름이 아니라 실제 값으로 확인한다.
- **인증처럼 외부 대시보드 설정이 많은 기능은 혼자 운영하기 어렵다.** 교사 한 명이 쓰는 도구에는 비밀번호 하나가 더 맞았다. 미래 대비 기능은 실제로 필요해질 때 넣는다.
- **Codex 작업을 이어받을 때는 worktree와 브랜치부터 확인한다.** Codex가 시작만 해 둔 `feat/single-teacher-auth`를 찾아 그 위에서 이어 갔다.
- **cherry-pick한 커밋은 Git이 "병합됨"으로 보지 않는다.** 브랜치를 지우기 전에 코드 diff가 같은지 직접 대조했다.
- **자동 모드는 운영 배포·브랜치 삭제를 막는다.** 이런 단계는 사용자가 명시적으로 승인하거나 직접 실행한다.
