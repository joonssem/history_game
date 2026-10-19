# BACKLOG에서 걷어 낸 취소 항목 (2026-10-19)

> Convex 실시간 협동 활동 취소([D-038](../../../DECISIONS.md))에 따라 BACKLOG.md에서 걷어 낸 원문이다. 재개하지 않는다. 판단 목록(1~13)은 살아 있어 BACKLOG에 남겼다.

---

<!-- 원래 제목: 상단 취소 claim 묶음 -->
- 작업 claim: `TASK-20261002-PREVIEW-AUTH | Preview 전용 인증·로그인 연결 | 상태: SUPERSEDED(2026-10-05, Auth0 제거·교사 비밀번호 로그인 운영 반영). 실행하지 않음. 참고: docs/plans/implementation_plan_preview_owned_auth.md`

- 작업 claim: `TASK-20261002-CLASSROOM-OCT29-AUDIT | 2026-10-29 수업용 협동 교실 콘텐츠·기능 점검 | audit/content agent(Claude) | 상태: READY | 1단원 15~18차시 계획(주변 나라 관계·문화와 생활) 콘텐츠 정합성, 현행 실시간 앱 지원 범위, 교사·학생 공통 기능 회귀를 읽기 전용 점검. 앱은 13차시 고려 건국과 고조선만 구현되어 있어 15~18차시는 미구현 표시·대체 활동 판정 포함. 결과·재현 조건·수업 전 필수 조치 보고. 체크리스트: docs/plans/tasks_classroom_oct29_audit.md`

- `P1-PREVIEW-AUTH0-CALLBACK` (2026-10-02 계획, 2026-10-05 종료): Auth0 Preview 로그인 계획은 교사 비밀번호 로그인으로 대체됐다. 아래 10월 29일 수업 감사와 인증 구현은 별개이며, 이 Auth0 작업은 재개하지 않는다.

- 작업 claim: `TASK-20261001-PREVIEW-OWNED-AUTH | 관리 가능한 Google 계정의 Preview 전용 SPA 인증·고정 주소·실제 로그인 | integration agent(Codex) | 상태: 보류(사용자 오늘 종료 요청; SPA 생성 직전 확인·실제 인증 연결 대기)`

- 작업 claim: `TASK-20261001-AUTH0-ACCOUNT-CHECK | Google 관리 로그인·기존 인증 테넌트 대조 | audit agent(Codex) | 상태: DONE | 실제 테넌트 메뉴·Settings 링크 확인, git diff --check 통과; 인증 경로 선택 대기`

- 과거 `P1-PREVIEW-AUTH0-CALLBACK`: 당시에는 callback 미등록과 새 테넌트 SPA 생성이 미완료였다. 2026-10-05에 Auth0를 제거하고 비밀번호 로그인을 운영에 반영해 이 차단 경로는 폐기됐다. 세부 이력은 `docs/plans/implementation_plan_preview_owned_auth.md`와 `docs/plans/tasks_classroom_recovery_preview.md`에 보존한다.

- 작업 claim: `TASK-20261001-COOP-PREVIEW-DEPLOY | 별도 Convex 개발 서버·통합 Vercel Preview 배포 및 확인 | integration agent(Codex) | 상태: DONE | npm run check·실제 서버 가상 8명·종료 삭제·Vercel READY 통과. 당시 Auth0 연결은 미완료였으며, 2026-10-05 비밀번호 로그인으로 대체됨`


---

<!-- 원래 제목: P0-COLLAB-TEACHER-PASSCODE — Auth0 제거, 교사 비밀번호 로그인 -->
## P0-COLLAB-TEACHER-PASSCODE — Auth0 제거, 교사 비밀번호 로그인

- 작업 claim: `TASK-20261005-COLLAB-TEACHER-PASSCODE | apps/cooperative-live 교사 인증 교체 | implementation agent(Claude) | 상태: DONE·운영 반영(2026-10-05, main `b54f80f0`)·별도 기기 리허설 사용자 면제(2026-10-06) | 검증: npm run check(단위 19·Convex 15·production build), git diff --check, 운영 `/teacher` 비밀번호 로그인 사용자 확인`
- 배경: Auth0 Google 로그인은 Preview 주소마다 callback 등록이 필요해 리허설과 수정 작업을 막았다. 다른 교사와의 공동 사용을 대비해 넣은 기능이었으나 현재는 교사 한 명이 운영하므로 제거한다. 이메일 일회용 코드 계획(`P1-COLLAB-EMAIL-AUTH`)은 메일 서비스가 필요해 보류한다.
- 결과: `/teacher`는 Convex 환경변수 `TEACHER_PASSCODE`(8자 이상) 하나로 로그인한다. 서버는 로그인 토큰 해시만 저장하고 12시간 유지, 10회 실패 시 15분 잠금, 비밀번호 변경 시 모든 로그인 무효. 모든 교사 함수는 `teacherToken` 인자로 확인한다. 이전 Auth0 소유 활동은 새 교사 화면에서 보이지 않고 원래 삭제 시각에 정리된다. 학생 QR·코드 입장은 그대로다.
- 같은 반영에 복구 P0·P1/P2(`1c419810`, `6c28783d`)와 대기실 내보내기(`79cd8138`)가 함께 main에 들어갔다. `feat/cooperative-lobby-kick`·`feat/cooperative-classroom-recovery-p0`·`feat/single-teacher-auth`는 내용이 모두 main에 있어 삭제 대상이다(대기실 코드는 cherry-pick 전후 동일 확인).
- 배포 기록: Convex `glorious-guanaco-616`에 `TEACHER_PASSCODE` 설정 후 함수 배포 → main fast-forward → Vercel Production 자동 배포. **주의: Vercel Production·Preview가 모두 같은 Convex 배포(`glorious-guanaco-616`)를 쓴다.** Convex 함수 배포는 곧 운영 반영이며, 호환되지 않는 함수 서명을 배포하면 운영 화면이 깨진다(이번 배포 중 실제로 잠시 발생). 운영/개발 Convex 분리는 다음 기능 작업 전에 진행한다.
- 확인(2026-10-06): Production·Preview가 여전히 같은 `glorious-guanaco-616`를 참조한다. 별도의 운영 Convex 배포 ID나 연결 전환은 확인되지 않았다. 이번 시나리오 통합은 저장소 코드와 자동 검증에 한정하며 Convex/Vercel 배포는 하지 않는다.
- 상태 갱신(2026-10-06): Vercel Production/Preview의 `NEXT_PUBLIC_AUTH0_CLIENT_ID`·`NEXT_PUBLIC_AUTH0_DOMAIN`, Convex의 `AUTH0_CLIENT_ID`·`AUTH0_DOMAIN`·`TEACHER_AUTH0_SUBS`, 로컬 `.env.local`의 두 `NEXT_PUBLIC_AUTH0_*` 항목과 Auth0 Development 테넌트의 `Default App` SPA를 제거했다. 앱 설정에는 callback/logout/web origin URL이 없었고 최근 30일 활성 사용자는 0명이었다. 같은 기간 가입 1건과 실패 로그인 2건은 기록돼 있으나, Auth0 앱 삭제와 별개인 사용자 레코드는 유지된다. `TEACHER_PASSCODE`와 비인증용 환경변수는 보존했다. 다음은 운영/개발 Convex 분리다. 별도 4~8대 리허설은 사용자 판단으로 면제했다.


---

<!-- 원래 제목: P0-COLLAB-GHOST-PLAYER — 교사 대기실 참가자 확인·내보내기 -->
## P0-COLLAB-GHOST-PLAYER — 교사 대기실 참가자 확인·내보내기

- 작업 claim: `TASK-20261005-COLLAB-LOBBY-KICK | apps/cooperative-live 교사 대기실 참가자 확인·내보내기 | implementation agent(Codex) | 상태: DONE(자동 검증)·운영 반영·현장 검증 대기 | 커밋: main `79cd8138` | 검증: npm run check(단위 19·Convex 11·production build), git diff --check`
- 원문: `INBOX.md`의 2026-10-05 대기실 요청. 2026-09-29 실제 수업에서 21명 중 2명이 활동에 들어가지 못했으며, 호 선택 전 생성된 빈 참가자 레코드를 교사가 대기실에서 확인하거나 정리할 수 없었다.
- 목적: 호·접속 상태·입장 시각을 대기실에서 확인하고, 교사가 선택한 자리만 삭제해 호와 입장 자리를 다시 사용할 수 있게 한다. 모둠 미리보기와 재편성에서도 인원·권한·토큰 상태를 일관되게 유지한다.
- 범위: `apps/cooperative-live`와 작업 기록 문서. 활동 시작 후의 기존 제외·재연결 동작은 유지한다.
- 결과: 대기실 호·연결 상태·입장 시각 카드와 요약, 교사 확인 후 레코드 삭제·토큰 무효화, preview 내보내기 후 재편성·2명 이하 대기실 복귀, 미리보기 전 경고·호 미선택 자리 명시적 정리를 구현했다. 별도 4~8대 리허설은 2026-10-06 사용자 판단으로 면제했으며, 정상 인원 모둠 진행 관찰의 범위를 넘어서는 복구·로그 검증 결과로 해석하지 않는다.


---

<!-- 원래 제목: P1-COLLAB-EMAIL-AUTH — 교사 이메일 일회용 코드 인증 (보류) -->
## P1-COLLAB-EMAIL-AUTH — 교사 이메일 일회용 코드 인증 (보류)

- 작업 claim: `TASK-20261005-COLLAB-EMAIL-AUTH-PLAN | 교사 이메일 인증 전환 계획 | planning agent(Codex) | 상태: DONE | 검증: 현행 Auth0·Convex 권한 경계와 공식 인증 문서 대조, git diff --check`
- 상태: `deferred` — 2026-10-05 사용자 결정으로 메일 서비스가 필요 없는 교사 비밀번호 로그인(`P0-COLLAB-TEACHER-PASSCODE`)으로 대체해 운영에 반영했다. 여러 교사가 각자 로그인해야 할 때 다시 검토한다. 원래 계획: [구현 계획](./docs/plans/implementation_plan_cooperative_live_email_auth.md). 원문은 `INBOX.md` 2026-10-05에 보존한다.
- 문제: 교사 로그인은 Auth0 Google 연결, Preview callback 등록, Auth0 `sub` 허용목록에 의존한다. 최근 Preview에서 callback 불일치로 실제 기기 리허설이 멈췄다.
- 목적: 교사는 실제 수신 가능한 이메일 주소로 일회용 코드를 받아 인증하고, 서버가 허용한 교사만 세션을 운영한다. 학생의 QR·코드 입장과 무계정 원칙은 유지한다.
- 예상 변경 범위: `apps/cooperative-live`의 인증 공급자·교사 화면·Convex 권한 확인·환경변수·테스트·운영 문서. 기존 Auth0 소유 세션의 전환 절차가 필요하다.
- 구현 관문: 이메일 발송 공급자와 발신 주소, 허용 교사 이메일을 정하고 별도 Preview에서 송수신·권한 거부·재로그인·세션 복구를 확인한다. 실제 학생 운영 게이트는 별도로 유지한다.


---

<!-- 원래 제목: 🔶 지금 판단이 필요한 것 (2026-09-11 4트랙 세션 마무리) -->
## 🔶 지금 판단이 필요한 것 (2026-09-11 4트랙 세션 마무리)

- 작업 claim: `TASK-20261006-GORYEO-RELATIONS-P1A | apps/cooperative-live 고려 주변 나라 관계 시나리오 | implementation/content agent(Claude) | 상태: DONE(자동 검증)·main 미통합·리허설 대기 | 브랜치: feat/claude-goryeo-relations(.worktrees/claude-goryeo-relations) | 검증: npm run check(단위 22·Convex 16·build)`
- 작업 claim: `TASK-20261001-COOP-PREVIEW-PREP | 통합 커밋·Vercel/Convex 연결 조사·Preview 준비 | integration agent(Codex) | 상태: DONE | 배포 목록/API 조회·git diff --check 성공; 실제 배포 확인 대기 | 구현 worktree: .worktrees/codex-goryeo-classroom-activities`

- 작업 claim: `TASK-20261001-CLASSROOM-RECOVERY-INTEGRATION | 고려 문화 변경 보존·입장 복구·교사 진행·부족 인원 복구 | implementation/integration agent(Codex), 읽기 전용 audit agent | 상태: DONE(격리 브랜치 구현·검증)·Preview/현장 대기 | worktree: .worktrees/codex-goryeo-classroom-activities | 검증: npm run check(단위 21/21·Convex 24/24·build), 로컬 가상 UI, git diff --check`

- 작업 claim: `TASK-20261001-JOIN-RECOVERY-VERIFY | 입장 복구 자동 검증·Preview 준비 상태 조사 | integration agent(Codex) | 상태: DONE(조사)·Preview 확인 대기 | 검증: npm run check(단위 19/19·Convex 9/9·build), 브랜치 유지·clean 확인 | 후속: Vercel 계정 조회 ByteString 오류 해결·브라우저·실기기 리허설 | 체크리스트: docs/plans/tasks_student_join_preview_verification.md`

- 작업 claim: `TASK-20260930-GORYEO-CLASSROOM-READINESS | 고려 건국·문화 협동 수업 당일 대체 운영안과 재개 체크리스트 | planning agent(Codex) | 상태: DONE | 결과: 교사 진행형 대체 흐름, 수업 시간표, 체크리스트 문서화`
- 작업 claim: `TASK-20260930-GORYEO-COOP-IMPLEMENTATION | 고려 건국 복구와 문화 협동 시나리오 | implementation agent(Codex) | 상태: DONE(격리 브랜치 구현·통합 검증)·Preview/현장 대기 | worktree: .worktrees/codex-goryeo-classroom-activities | branch: feat/goryeo-classroom-activities | 검증: npm run check(단위 21/21·Convex 24/24·build)`


---

<!-- 원래 제목: P0-COLLAB-GORYEO-CLASSROOM-READINESS — 고려 건국·문화 수업 운영 및 디지털 활동 준비 -->
## P0-COLLAB-GORYEO-CLASSROOM-READINESS — 고려 건국·문화 수업 운영 및 디지털 활동 준비

- 상태: `대체 운영안·체크리스트 완료 / 실시간 구현 중 / 현장 실행 대기` — [운영 대체안](./docs/plans/implementation_plan_goryeo_classroom_readiness.md) · [실행 체크리스트](./docs/plans/tasks_goryeo_classroom_readiness.md)
- 배경: 고려 건국 실시간 활동은 2026-09-29 21명 수업에서 2명 입장 실패를 보였다. 사용자는 정상 인원 모둠이 진행됐음을 근거로 별도 4~8대 리허설은 필요하지 않다고 판단했다(2026-10-06). 복구·대기실 변경과 교사 비밀번호 로그인은 main/운영에 반영됐다.
- 고려 문화 실시간 시나리오는 격리 브랜치에서 구현되고 입장 복구·교사 진행과 통합 검증을 마쳤다. 아직 main 통합·배포·현장 확인은 남아 있다. 기존 `regular_goryeo_culture`는 별도의 개인형 활동이다.
- 당일 대안: 건국은 기존 교사용 다섯 관점·화이트보드 절차로, 문화는 기존 개인형 자료를 근거 탐색에 쓰고 모둠별 공동 주장·근거·자료 한계를 만드는 교사 진행형 방식으로 운영한다. 활동별 15분은 계획값이며 실측값이 아니다.
- 재개 관문: 기존 건국 실시간판의 별도 리허설은 사용자 판단으로 면제됐다. 남은 공통 항목은 `tasks_cooperative_live_classroom_recovery.md`의 개인정보·로그 확인과 GO/NO-GO 결정이다. 문화 실시간판은 공통 엔진 검토와 근거 출처 검토 뒤 구현한다.
- 구현 승인(2026-09-30): 사용자 요청에 따라 별도 worktree에서 건국 복구와 고려 문화 협동 시나리오를 구현한다. 이번 구현은 고려 주변국 관계 활동을 포함하지 않으며, merge·배포·학생 사용은 현장 검증 뒤 별도 판정한다.

- 작업 claim: `TASK-20260916-01 | apps/cooperative-live 및 고려 초기 활동 | implementation/content agent | 상태: DONE` — `npm run check`, production build, client bundle 비공개 본문 검사 통과. 실제 기기 리허설은 별도 대기.
- 작업 claim: `TASK-20260915-T2 | 벽란도 순서 및 원문 미대조 유물 페어 공식 출처 대조 | audit agent(Codex) | 상태: DONE`
- 작업 claim: `TASK-20260915-T3 | art_12 판옥선 시대 라벨 및 연표 영향 조사 | audit agent(Codex) | 상태: DONE`
- 작업 claim: `TASK-20260915-T4 | claude-deep-prehistoric 브랜치 미반영 작업 분석 | audit agent(Codex) | 상태: DONE`
- 작업 claim: `TASK-20260915-T5-PLAN | 고조선 정적 협동 MUD 최초 판단 순서 교정 계획 | planning agent(Codex) | 상태: DONE`
- 작업 claim: `TASK-20260915-T5-1 | 고조선 정적 협동 MUD 최초 판단 순서 교정 | implementation agent(Codex) | 상태: DONE | 검증: node --check ×3, 06_validate_static_assets.py, git diff --check, 브라우저 3인·5분형/5인·10분형`
- 작업 claim: `TASK-20260917-JOSEON-LATE-C1-AUDIT | 조선 후기 협동 패킷 C1 읽기 전용 감사 | audit agent(Codex) | 상태: DONE | 판정: T1 착수 NO-GO(실제 런타임 계약 정렬·공개 경로 차단 전) | 검증: scripts/15 --final/--cards, 04/05/13/14, apps/cooperative-live npm run check`
- 작업 claim: `TASK-20260928-CODEX-LT-R11-AUDIT | 라운드 11 연대표 통합본·validator 브랜치 읽기 전용 대조 | audit agent(Codex) | 상태: DONE | 판정: LT-08·09 해결, LT-03·10 부분 해결 | 검증: node scripts/16_validate_lesson_track.js --ci, origin/feat/codex-lesson-track-validator 읽기 전용 diff`
- 작업 claim: `TASK-20260929-COLLAB-QR-DISPLAY | 실시간 협동 교사용 QR 확대 요구 문서화 | planning agent(Codex) | 상태: DONE | 검증: INBOX 원문 보존, P2-COLLAB-06 목적·기능·범위·수용 기준 등록, git diff --check`
- 작업 claim: `TASK-20260929-COLLAB-CLASSROOM-RECOVERY-PLAN | 유령 참가자·진행 관문·교사 운영 UX 해결 계획 | planning agent(Codex) | 상태: DONE | 검증: 현행 Convex/UI 계약 대조, 구현 순서·수용 기준·회귀 시나리오 문서화, git diff --check`
- 작업 claim: `TASK-20260929-COLLAB-RECOVERY-TASKS | 복구 구현 우선순위와 실행 체크리스트 작성 | planning agent(Codex) | 상태: DONE | 검증: P0~P2 의존성·완료 기준·검증 명령·중단 조건 문서화, git diff --check`
- 작업 claim: `TASK-20260929-COLLAB-RECOVERY-P0 | apps/cooperative-live P0-0~P0-5 | implementation agent(Codex) | 상태: DONE(자동 검증)·운영 반영(main `1c419810`)·별도 기기 리허설 사용자 면제(2026-10-06). Auth0 차단은 교사 비밀번호 로그인으로 해소 | 원 커밋: 0cbc90d | 검증: npm run check, 단위 19건, Convex 6건, 21명 신규 복구 회귀, production build, git diff --check, Convex dev functions ready, Vercel Preview Ready(dpl_4YeiHEfWc8M2FhoQCGkyQVqxDw9a)`
- 작업 claim: `TASK-20260929-COLLAB-RECOVERY-P1P2 | 개입 이력·확인 표시와 교실용 QR 확대 | implementation agent(Codex) | 상태: DONE(자동 검증)·별도 기기 리허설 사용자 면제(2026-10-06) | 브랜치: feat/cooperative-classroom-recovery-p0 | 커밋: f71ca7d | 검증: npm run check, 단위 19건, Convex 6건, production build, git diff --check`
- 작업 claim: `TASK-20260929-GORYEO-RELATIONS-CULTURE-PLAN | 고려 후속 실시간 협동 활동 2종 계획 | planning agent(Codex) | 상태: DONE | 범위: 15~16차시 주변 나라 관계, 17~18차시 문화·생활 | 검증: 기존 정규 MUD·48차시·협동 시나리오 계약 대조, git diff --check`
- 작업 claim: `TASK-20260929-GORYEO-RELATIONS-CULTURE-TASKS | 고려 후속 활동 우선순위·실행 체크리스트 | planning agent(Codex) | 상태: DONE | 순서: P0 선행 관문 → P1-A 주변 나라 관계 → P1-B 문화와 생활 → 통합 리허설 | 검증: 의존성·완료 기준·중단 조건·검증 명령 문서화, git diff --check`


---

<!-- 원래 제목: P1-COLLAB-GORYEO-RELATIONS-CULTURE — 고려 후속 협동 활동 2종 -->
## P1-COLLAB-GORYEO-RELATIONS-CULTURE — 고려 후속 협동 활동 2종

- 상태(2026-10-06): `코드 통합·자동 검증 완료 / 미배포·현장 확인 대기`. P1-A·P1-B는 main 병합 커밋 `b310dbe`에 포함. `npm run check` 통과(단위 24건·Convex 17건·build). Production·Preview가 같은 Convex를 사용하므로 배포하지 않는다. [구현 계획](./docs/plans/implementation_plan_goryeo_relations_culture_cooperative_live.md) · [실행 체크리스트](./docs/plans/tasks_goryeo_relations_culture_cooperative_live.md)
- 목적: 13차시 고려 건국 협동 활동 뒤에 15~16차시 `고려와 주변 나라들의 관계`와 17~18차시 `고려의 문화와 사람들의 생활`을 같은 실시간 협동 엔진으로 연결한다.
- 현행 자산: 정규 MUD `regular_goryeo_war`와 `regular_goryeo_culture`가 있으므로 사실·자료 후보는 재사용하되, 정규 MUD의 개인 관문을 그대로 복제하지 않는다.
- 핵심 보완: 기존 `regular_goryeo_culture`는 팔만대장경·직지·벽란도 중심이어서 `6사04-03`의 사회 모습과 사람들의 생활 추론을 충분히 다루지 못한다는 기존 감사 결과가 있다. 새 협동 활동은 고려청자 제작·사용, 가족·상속, 신분과 생업 등 생활 근거를 포함하되 한 사례를 고려인 전체로 일반화하지 않는다.
- 구현 전 관문(미완료): 운영/개발 Convex 분리를 먼저 완료하고, `tasks_cooperative_live_classroom_recovery.md`의 로그·개인정보 확인과 GO/NO-GO 판정을 한다. 별도 4~8대 실제 기기 리허설은 사용자 판단으로 면제했다. 복구 기능 통합과 Auth0 차단은 2026-10-05에 해소했다.
- 문화 콘텐츠는 가족·상속 사례, 대장경 제작 노동과 계층 참여, 청자 사용 계층의 자료 한계를 포함한다. 최종 초안 저장 때 가족 생활 정책·가족 기록 역할·자료 범위 연결을 서버에서 요구한다. 출처표 A-2의 C1~C11 밖의 주장은 쓰지 않았고 C8 미확인 항목은 제외했다.
- 남은 작업: 출처 원문과 교과서 쪽수 재대조, 실제 수업 관찰·기기 리허설, 운영/개발 Convex 분리 후 Preview 검증. 실제 학생 사용 전에는 이 항목들을 닫는다.
- 예상 범위: `apps/cooperative-live/shared/scenario.ts`, `apps/cooperative-live/convex/scenarios.ts`, 시나리오 레지스트리·서버 검증 테스트, 교사 운영 문서. 정규 MUD JSON 변경은 별도 감사에서 필요성이 확인될 때만 분리한다.

상세와 근거는 [`claude_four_track_session_close_20260911.md`](./docs/handoff/claude_four_track_session_close_20260911.md).


---

<!-- 원래 제목: P0-COLLAB-GHOST-PLAYER — 유령 참가자 제거·자리 복구 부재 -->
## P0-COLLAB-GHOST-PLAYER — 유령 참가자 제거·자리 복구 부재

- 작업 claim: `TASK-20260929-COLLAB-GHOST-PLAYER | 21명 실제 수업 입장 실패·전원 관문 차단 감사 | audit agent(Codex) | 상태: DONE | 검증: 라이브 교사 대시보드 21명·5/4/4/4/4 편성 확인, 세션·학생 관문 코드 읽기 전용 확인`
- 상태: `P0 / planned / checklist-ready / implementation-approval-needed` — [해결 계획](./docs/plans/implementation_plan_cooperative_live_classroom_recovery.md) · [실행 체크리스트](./docs/plans/tasks_cooperative_live_classroom_recovery.md)
- 실제 수업 관찰(2026-09-29): 실제 학생 21명 중 2명이 활동 화면에 들어가지 못했지만 교사 대시보드는 21명 접속으로 표시했다. 이전 시도에서는 22명 접속이 표시되어 중복·복구 불가 참가자 레코드가 편성 인원에 포함될 가능성이 확인됐다.
- 원인 범위: 서버 참가자 레코드는 세션 토큰을 잃은 기기와 연결이 끊겨도 접속 인원과 모둠 구성에 남는다. 교사 화면에는 개별 참가자 제거·자리 재연결·활성 상태 표시가 없다.
- 영향: 복구 불가 참가자가 `최초 판단`, `자료 말하기`, `공동 초안 확인`을 수행할 수 없다. 교사의 `전체 다음 단계`도 최초 판단·자료 공유 전원 완료를 요구하며, 공동 초안 이후에는 모든 모둠원의 같은 revision 확인을 요구하므로 해당 모둠 또는 전체 활동이 멈출 수 있다.
- 구분: 3인 모둠은 `early-goryeo-unity`의 공식 지원 크기이며 발해 관점 공통 자료가 제공된다. 이 결함은 3인 역할 구성 문제가 아니라 **실제 기기와 참가자 레코드의 불일치** 문제다.
- 필요한 기능 후보:
  1. 교사가 시작 전·진행 중 특정 참가자를 확인 후 제거할 수 있는 기능.
  2. 제거된 자리를 같은 학생이 새 토큰으로 다시 입장하거나 기존 역할에 재연결하는 복구 흐름.
  3. 최근 heartbeat를 바탕으로 `접속 중 / 연결 끊김`을 구분하되 일시적인 탭 전환만으로 자동 삭제하지 않는 상태 표시.
  4. 시작 전 실제 출석 인원과 서버 참가자 수가 다를 때 경고하고, 교사가 정리하기 전 편성을 확정하지 않도록 하는 관문.
  5. 제거·재연결 뒤 모둠 인원, 역할 중복, 공통 자료, confirmation 합계가 다시 계산되는 회귀 검사.
- 즉시 운영 폴백: 최초 입장 탭 새로고침으로 세션 토큰 복구 → 실패하면 세션 종료·삭제 후 한 기기·한 탭 재입장. 유령 참가자가 있는 상태에서 `전체 다음 단계` 또는 편성 확정을 강행하지 않는다.
- **2026-09-30 코드 감사·사용자 요청** ([`INBOX`](./INBOX.md), `TASK-20260930-COLLAB-JOIN-RECOVERY`): 복구 기준 `f71ca7d`의 QR `joinWithEntryKey`와 수업 코드 `joinWithCode`가 매 성공 호출마다 새 `players` 행을 만든다. `attemptId`는 rate-limit 상태에만 쓰여 성공 mutation 재시도를 같은 자리로 묶지 못한다. 응답 유실·연속 탭이 유령 좌석을 만들 수 있는 P0 경로다.
- 구현 완료(자동 검증): 클라이언트는 요청 전 좌석 토큰을 `sessionStorage`에 저장하고 QR·수업 코드 재시도에서 재사용한다. 서버는 같은 세션·토큰의 활성 자리를 재사용하며, 한도 초과 뒤에도 자기 자리 재시도를 허용한다. QR 실패 시 같은 QR 재시도 버튼을 제공한다. 상세 구현·검증은 worktree의 `docs/plans/implementation_plan_student_join_idempotency.md`와 `walkthrough.md`에 기록했다.
- 운영 복구안: 동일 탭 새로고침/재시도를 먼저 안내하고, 저장 정보를 잃었을 때는 교사가 대시보드에서 해당 좌석을 선택해 12자리 재연결 코드를 발급한다. 학생은 수업 코드와 코드를 입력해 같은 역할·모둠·진도로 돌아온다. 코드는 개별 전달하고, 5분 만료·1회용으로 운영한다.
- 한계·수용 기준: 별도 기기 두 개에서 생성한 서로 다른 좌석 키만으로 동일 학생인지 식별할 수 없다. 계정·학생 이름을 수집하지 않는다. 같은 탭·동일 join key 재시도는 서버 행을 1개만 만들고 같은 자리로 응답해야 하며, 예전 자리 복구는 기존의 교사 확인 절차를 유지한다.
- 작업 claim: `TASK-20260930-COLLAB-JOIN-RECOVERY | apps/cooperative-live 입장 멱등성·재접속 안내 | implementation agent(Codex) | 상태: WAITING-PREVIEW | 기준: f71ca7d | worktree: .worktrees/codex-student-join-idempotency`
- 검증: `apps/cooperative-live`의 `npm run check` 통과(ESLint, TypeScript, 단위 테스트 19개, Convex 테스트 9개, production build). 남은 일은 Preview의 실제 QR 재시도·교사 재연결과 4~8대 기기 리허설 기록이다. 독립 기기에서 서로 다른 새 토큰으로 들어온 요청은 이름·계정 없이 같은 학생인지 자동 판별하지 않는다.


---

<!-- 원래 제목: P0-COLLAB-LIVE-CONTROLS — 교사 개입 흔적·설명 완료 오류·모둠별 진행 부재 -->
## P0-COLLAB-LIVE-CONTROLS — 교사 개입 흔적·설명 완료 오류·모둠별 진행 부재

- 작업 claim: `TASK-20260929-COLLAB-LIVE-CONTROLS | 실제 수업 중 교사·학생 진행 결함 기록 | audit agent(Codex) | 상태: DONE | 검증: 사용자 현장 관찰 원문 보존, 현행 교사 전체 진행·학생 공유 관문 코드 읽기 전용 확인`
- 상태: `P0 / planned / checklist-ready / implementation-approval-needed` — [해결 계획](./docs/plans/implementation_plan_cooperative_live_classroom_recovery.md) · [실행 체크리스트](./docs/plans/tasks_cooperative_live_classroom_recovery.md)
- 문제·영향:
  1. `힌트`·`심화 상황`을 보낸 뒤 교사 대시보드에서 적용 여부와 최근 전송 이력이 분명하지 않아 중복 전송하거나 개입한 모둠을 놓칠 수 있다.
  2. 학생의 `설명했어요` 탭에서 빨간 오류 문구가 나타나는 경우가 있어 공유 완료 관문이 막힐 수 있다. 현행 전체 진행은 모든 참가자의 `sharedAt`을 요구하므로 한 명의 실패가 전체 활동을 멈출 수 있다.
  3. `전체 다음 단계`만 있고 모둠별 진행 제어가 없어, 정상 완료한 모둠과 복구가 필요한 모둠을 분리해 운영하기 어렵다.
- 재현에 필요한 추가 기록: 빨간 오류 문구 전문, 수업 코드·모둠·역할, 탭 시점의 학생 단계, 단일/연속 탭 여부, 네트워크 상태, 새로고침 뒤 복구 여부. 학생 이름·학번은 기록하지 않는다.
- 필요한 기능 후보:
  1. 각 모둠 카드에 `최근 개입: 힌트/심화 · 시각 · 확인 여부`를 표시하고, 버튼을 누른 직후 명확한 성공 상태를 남긴다.
  2. 동일 개입 재전송 여부를 교사가 구분할 수 있게 하며, 학생 화면에서도 새 개입과 이미 본 개입을 구별한다.
  3. `설명했어요` mutation 실패 시 서버 오류 원문 대신 학생이 할 행동을 알려 주는 메시지와 `다시 시도`를 제공하고, 중복 탭은 멱등적으로 성공 처리한다.
  4. 모둠 카드에 `이 모둠 다음 단계`를 제공하되, 기본값은 그 모둠 구성원이 현재 관문의 필수 행동을 모두 마쳤을 때만 활성화한다.
  5. 연결 끊김 등 예외를 교사가 강제로 넘길 수 있게 할지는 별도 결정으로 남기고, 허용한다면 확인창·사유·대시보드 흔적과 공동 초안 confirmation 재계산을 필수로 한다.
  6. 전체 진행과 모둠별 진행이 섞여도 다른 모둠의 단계·초안·확인 상태가 바뀌지 않는 통합 회귀를 추가한다.
- 예상 변경 범위: `apps/cooperative-live/components/LiveTeacherConsole.tsx`, `LiveStudentActivity.tsx`, 개입·학생 진행 Convex mutation/query, 관련 통합 테스트. 정규 MUD 28편·`js/mudEngine.js`·`scripts/18*`·조선 후기 콘텐츠 원본은 범위 밖이다.
- **2026-09-29 라이브 재현 — `전체 다음 단계` 작동 불능**: 수업 코드 `859220`, 서버 표시 21명에서 1모둠은 공동 초안, 2·3모둠은 자료 말하기 중 각각 1명이 개인 최초 판단, 4모둠은 전원 확인, 5모둠은 활동 마침 상태였다. 버튼은 활성화돼 있었지만 `sessions.advanceStage`는 전체 참가자의 가장 이른 단계를 기준으로 잡고, `first` 단계 참가자 중 한 명이라도 `submittedAt`이 없으면 전체 요청을 거부한다. 따라서 서로 다른 단계가 섞인 실제 수업에서 두 참가자의 탭·토큰이 복구되지 않으면 교사가 정상 모둠만 진행시키거나 문제 참가자를 우회할 방법이 없다.
  - 판정: 단순 버튼 비활성화 표시 문제가 아니라 `P0-COLLAB-GHOST-PLAYER`와 결합된 전체 수업 진행 차단이다.
  - 추가 수용 기준: 전체 진행 버튼은 실행 전 차단 사유와 미완료 인원·모둠을 보여 주고, 조건이 안 되면 비활성화한다. 모둠별 진행은 해당 모둠의 필수 행동만 검사하며 다른 모둠의 느린 참가자 때문에 차단되지 않는다. 복구 불가 참가자는 교사 제거·재연결 절차로 confirmation 분모에서 안전하게 정리돼야 한다.
- **2026-09-30 전체 학생 테스트 관찰** ([`EXP-011`](./EXPERIMENTS.md), 원문은 [`INBOX`](./INBOX.md)): 중복 접속으로 학생이 입장하지 못하는 사례와 인원 부족 모둠의 진행 불가가 보고됐다. 교사는 모든 학생이 동의한 경우에도 설계가 진행을 막는 점을 문제로 지적하며 대시보드 마스터 진행 기능을 요구했다. 모둠별 상황 가시성이 낮고 현재 `힌트`·`난이도 높이기` 두 기능만 있는 것이 불편하며, 도움 요청에 앱으로 조치할 수 없다는 점도 확인됐다. 정확한 인원·오류 문구·발생 횟수는 제공되지 않았다.
- **승인됨 — 마스터 진행 범위 (2026-09-30)**: 사용자가 선택한 모둠만 한 번에 한 단계씩 넘기는 권장안을 승인했다. 교사 확인·사유를 기록하고 미접속 학생을 완료로 처리하지 않는다. 승인 원문은 `INBOX.md`의 `TASK-20260930-COLLAB-CLASSROOM-RETEST`에 기록했다.
- 작업 claim: `TASK-20260930-COLLAB-MASTER-ADVANCE | 선택 모둠 교사 마스터 1단계 진행 | implementation agent(Codex) | 상태: DONE(격리 브랜치 구현·자동/가상 UI 검증)·Preview 대기 | 실제 구현: .worktrees/codex-goryeo-classroom-activities / feat/goryeo-classroom-activities` — 2026-10-01 사용자 진행 승인에 따라 문화·입장 복구와 함께 통합했다. 기존 teacher-master worktree는 변경하지 않았다.
- **2026-10-01 구현 정책 — 부족 인원·도움 요청**: 사용자 진행 승인에 따라 시작 편성 3~5인은 유지하고 활동 중 교사가 명시 복구 모드를 켠 모둠만 1~2인 진행을 허용했다. 빠진 원래 역할의 근거 요약과 공통 자료를 제공하고 개인 완료값은 보존한다. 도움 요청은 단계·미완료 수 확인, 기존 힌트, 사유/동의가 있는 한 단계 진행, 해결 완료로 대응한다. 격리 브랜치의 코드·가상 UI 검증까지 완료했으며 실제 수업 효과·현장 리허설은 대기다.


---

<!-- 원래 제목: P1-COLLAB-EARLY-GORYEO-COMPREHENSION — 고려 초기 활동 내용 이해도 -->
## P1-COLLAB-EARLY-GORYEO-COMPREHENSION — 고려 초기 활동 내용 이해도

- 작업 claim: `TASK-20260929-EARLY-GORYEO-CLASS-RESULT | 첫 21명 실제 수업 장단점·이해도 관찰 정리 | audit agent(Codex) | 상태: DONE | 검증: 사용자 원문 보존, EXP-009 결과·다음 결정 반영`
- 상태: `classroom-observed / localization-needed`
- 관찰: 첫 21명 수업에서 교사는 내용이 전반적으로 나쁘지 않다고 평가했지만, 학생 반응으로 "내용이 어려움(무슨 소리 하는지 모르겠음)"이 보고됐다.
- 영향: 역사 내용의 사실성만으로는 5학년 학생이 역할 자료를 이해하고 친구에게 설명할 수 있다는 수용 기준을 충족하지 못한다. 이해되지 않은 채 버튼만 누르면 협동 활동의 근거 공유 목적이 약해진다.
- 다음 작은 실험: 학생 3~5명에게 같은 활동을 다시 보여 주고 역할 자료, 최초 판단 질문, 공동 초안, 자료의 한계 중 막힌 화면을 표시한다. 모르는 단어와 자기 말로 바꾸어 설명한 문장을 익명으로 기록한다.
- 수정 후보는 관찰 뒤 결정한다: 문장 분할, 핵심어 한 줄 풀이, 역할별 `내가 말할 한 문장` 예시, 교사 도입 설명. 역사 의미를 없애는 일괄 축약이나 정답 문장 제공은 하지 않는다.
- 유지할 요소: 편리함, 빠른 진행, 자동 모둠 구성, 내용의 기본 방향은 첫 수업의 긍정 관찰로 보존한다.



---

<!-- 원래 제목: P2-COLLAB-LIVE-THEME-ALIGNMENT — 실시간 협동 앱 역사 테마 정렬 -->
## P2-COLLAB-LIVE-THEME-ALIGNMENT — 실시간 협동 앱 역사 테마 정렬

- 작업 문서 claim: `TASK-20260930-COLLAB-LIVE-THEME-PLAN | 실시간 협동 앱 테마 계획·체크리스트 | planning agent(Codex) | 상태: DONE`
- 구현 claim: `TASK-20260930-COLLAB-LIVE-THEME-IMPLEMENTATION | apps/cooperative-live/app/globals.css | implementation agent(Codex) | 상태: DONE | branch: main | 검증: npm run check`
- 상태: `implemented / student-state-visual-check-needed` — [구현 계획](./docs/plans/implementation_plan_cooperative_live_theme_alignment.md) · [체크리스트](./docs/plans/tasks_cooperative_live_theme_alignment.md)
- 근거: 별도 Next 앱은 남색·파랑·금색 팔레트와 22~30px 카드 모서리를 사용한다. 포털·정적 협동 MUD는 미색·먹색·적토색·청록색 계열이다. 진행 차단 문제라는 현장 증거는 아직 없다.
- 제안 우선순위: P2. 기존 48px 버튼·760px 반응형 전환·화면 구조는 유지하고 앱 내부 CSS 토큰과 색·포커스 표현을 정렬한다.
- 결과: `apps/cooperative-live/app/globals.css`에 역사 팔레트·상태 토큰·3px 키보드 포커스 테두리를 적용했다. 가상 교사 흐름에서 QR·모둠·통계를 확인했고, 4개 라우트×4개 화면 크기에서 가로 넘침은 없었다. `npm run check` 통과.
- 확인 제한: 데모 `/play/[sessionId]`는 실제 역할·선택·공동 초안 화면 대신 Convex 연결 안내를 표시한다. 그 학생 활동 상태는 실제 학생 세션을 만들지 않고는 화면으로 확인할 수 없어, 해당 상태의 시각 확인만 후속 항목으로 남긴다.
- 범위 제외: 시나리오, 실시간 상태·인증·QR 동작, Convex, 개인정보 설정, 배포. 테마 변경 완료만으로 교실 사용을 승인하지 않는다.
- 작업 경계: 사용자가 2026-09-30 계획서대로 진행을 승인했다. 고려 수업 관련 기존 미커밋 변경을 보존하기 위해 현재 `main` 체크아웃에서 테마 파일과 이 계획의 진행 기록만 수정하며, 브랜치 전환은 하지 않는다.


---

<!-- 원래 제목: P1-COLLAB-EARLY-GORYEO — 실시간 협동 MUD 첫 실제 활동 -->
## P1-COLLAB-EARLY-GORYEO — 실시간 협동 MUD 첫 실제 활동

- 작업 claim: `TASK-20260915-08 | 고려 초기 첫 실시간 활동 계획·Claude 단일 구현 소유권 정리 | 기획·점검 에이전트 | 상태: DONE`
- 상태: `implemented / rehearsal-needed` — [`구현 계획`](./docs/plans/implementation_plan_early_goryeo_cooperative_live_first_activity.md)의 T0~T5 코드·자동 검증을 완료했다. 실제 학생에게 열지 않고 교사 1명+성인·교사 역할 참가자 4~8명의 실제 기기 리허설을 기다린다.
- 활동: 1단원 13차시 “새 고려의 첫 회의 — 서로 다른 사람들을 어떻게 한 나라로 묶을까?”를 `apps/cooperative-live`의 첫 실제 학생 활동으로 만든다. 고조선은 기술 데모·회귀 기준으로 남긴다.
- 작업 경계: 별도 worktree의 implementation/content agent가 `apps/cooperative-live/**`와 고려 활동 데이터·화면·테스트를 구현했다. 구현 에이전트 시도 실패 뒤 Codex가 같은 implementation 역할을 인계했고, 통합 전 별도 audit agent가 읽기 전용 감사를 수행한다.
- 검증 순서: 자동 회귀 → 교사 1명+4~8명 실제 기기 리허설 → 실제 학생 소규모 시험 → 21명 시험 판단. 결과는 [`EXP-009`](./EXPERIMENTS.md)에 기록한다.


---

<!-- 원래 제목: P1-COLLAB-JOSEON-LATE — 10월 28일 공개수업용 조선 후기 실시간 수직 슬라이스 -->
## P1-COLLAB-JOSEON-LATE — 10월 28일 공개수업용 조선 후기 실시간 수직 슬라이스
- 작업 claim: `TASK-20261002-OCT29-SUPPLEMENT | 고려 15~18차시 보조 활동·질문·수정 활동지 | content agent(Claude) | 상태: DONE (통합 기록·선택 감사 등록; 카드 출처/난이도 및 수업 관찰 검증은 별도 대기)`

- 공개수업은 2026-10-02 사용자 확인으로 10/29 고려 15~18차시로 변경됨. 조선 후기 슬라이스는 이후 수업·회귀 기준으로 유지.

- 작업 claim: `TASK-20260915-06 | 조선 후기 실시간 협동 MUD 수직 슬라이스 구현 계획 | 기획·점검 에이전트 | 상태: DONE`
- 작업 claim: `TASK-20260918-CODEX-JOSEON-LATE | 확정 런타임 JSON의 실제 앱 등록·3·4·5인 회귀 | implementation agent(Codex) | 상태: DONE`
- 작업 claim: `TASK-20260928-CODEX-JOSEON-LATE-REHEARSAL | Preview 배포·자동 회귀·성인/교사 4~8대 실기기 리허설 | integration agent(Codex) | 상태: DOING (고정 주소 Convex 함수·스키마 동기화 및 교사 세션 생성·가상 학생 8명 입장 복구 완료, 고정 주소 기준 물리 기기 현장 실측 대기)`
- 상태: `preview-ready / rehearsal-needed` — Claude가 확정한 런타임 JSON을 공개·서버 레지스트리에 문안 변경 없이 등록하고 3·4·5인 역할 편성, 3인 공통 수공업자 자료, 다른 역할 비공개 본문 차단, 기존 고조선·고려 회귀, production build를 검증했다. 2026-09-28 `npm run check`를 다시 통과했고 새 Vercel Preview `https://history-game-ec09i4dg5-joon0noh-3339.vercel.app`(`dpl_jMT8PdAWMc3mobd88zm9JEg3es7Q`)을 배포했다. 배포는 `target: preview / Ready`, `/teacher` HTTP 200이며 공개 번들에 `joseon-late-market` v1이 포함돼 있다. 교사 1명+성인·교사 역할 4~8대의 학교 Wi-Fi·WebSocket·재접속·iPad QR·revision 실측은 계속 대기한다.
- 원문·일정: [`INBOX.md`](./INBOX.md)의 “2026-09-15 — 10월 28일 공개수업 역산” 항목.
- 작업 경계(2026-09-17 D-035로 변경): **앱 코드(`apps/cooperative-live/**`) 등록·서버·UI·테스트는 Codex**, 조선 후기 콘텐츠(`docs/handoff/claude_joseon_late_runtime_scenario.json`)·출처·`scripts/15` 검증은 Claude가 맡는다. 이전 문구("Claude가 앱까지 단독 구현")는 폐기. 순서: Claude 라운드 8 2단계 JSON이 main에 들어온 뒤 Codex가 등록한다.


---

<!-- 원래 제목: P1-COLLAB-PRIVACY — Convex 개인정보·국외 처리 착수 게이트 -->
## P1-COLLAB-PRIVACY — Convex 개인정보·국외 처리 착수 게이트

- 작업 claim: `TASK-20260908-01 | 개인정보 처리 기록·QR 입장 보안·Preview 연결 | integration agent | 상태: DONE`
- 상태: `in-progress-preview-verified` — 교육자료 분류·공급자 공개 문서 재검토와 실제 Convex/Auth0/Vercel 가상 데이터 수직 통합 시험은 완료. 학교 개인정보 처리 근거·국외 처리 허용과 공급자 비공개 보존기간·계약 조건 확인은 대기.
- 우선순위: **P1로 상향**. 기존 `P2-COLLAB-05`를 승격한 항목이며, 실시간 협동 MUD의 학생 적용과 운영 배포를 차단한다. 현재 정적 협동 MUD 수업 검증과 가상 데이터 개발은 별도 진행할 수 있다.
- 근거: 이 프로젝트는 사용자 확인에 따라 **교사 제작 교육용 저작물**로 분류하므로 학습지원 소프트웨어 선정·학교운영위원회 심의 게이트는 적용하지 않는다. 다만 이름을 받지 않아도 모둠·역할·호·제출시각이 교사의 모둠표와 결합되면 개인정보가 될 수 있다. Convex Cloud는 미국 동부·아일랜드 리전만 제공하므로 국외 처리 검토가 필요하고, Convex DPA상 하위처리자·백업 사본의 잔존 범위도 확인해야 한다.
- 감사 문서: [`convex_elementary_school_privacy_audit.md`](./docs/audits/convex_elementary_school_privacy_audit.md)
- 해제 조건:
  1. 학교 개인정보 담당자에게 개인정보처리자, 적법 근거, 법정대리인 동의 필요 여부를 확인한다.
  2. Convex·Vercel의 처리위탁, 국외 처리 근거·고지, 리전, 하위처리자, 로그·백업 보유기간을 문서화한다.
  3. 최소수집·권리행사·수업 종료 삭제·접근통제·사고대응 테스트를 통과한다.
- 미통과 시: 실제 학생 접속을 금지한다. 국외 처리 또는 외국산 SaaS가 불가하면 [D-019](./DECISIONS.md)을 다시 열어 국내 리전/기관 승인 서비스 또는 로컬 방식을 검토한다.
- 2026-09-07 이어받기 감사 당시 교사 QR은 수동 입력과 같은 6자리 `code`를 URL에 넣었고 반복 시도 제한도 없었다. 이 결함은 2026-09-09 QR·수동 코드 보안 구현과 Preview 검증으로 해결했다.
- 2026-09-08 사용자 확정: 이 프로젝트는 학교 교육과정 운영 지원을 목적으로 외부에서 개발·보급된 소프트웨어가 아니므로 학습지원 소프트웨어 선정·학교운영위원회 심의는 적용하지 않는다([D-022](./DECISIONS.md)). 이 판단은 개인정보 처리위탁·국외 처리 확인을 면제하지 않는다.
- 2026-09-08 공급자 재검토: Convex·Vercel의 공개 DPA, 리전, 하위처리자 관리, 로그 보존 범위를 [감사 문서](./docs/audits/convex_elementary_school_privacy_audit.md)에 기록했다. Vercel DPA는 공개 문구상 Pro·Enterprise 대상이고, Hobby 런타임 로그는 1시간이지만 빌드 로그는 배포별 무기한 보관된다. Convex의 공급자 로그·백업 삭제기간과 무료/Starter 계약 적용 범위는 공개 문서만으로 수치 확정이 되지 않아 실제 학생 적용 차단 항목으로 유지한다.
- QR·수동 코드 보안 계획: [`implementation_plan_cooperative_join_security.md`](./docs/plans/implementation_plan_cooperative_join_security.md) — 상태 `completed`. QR 토큰은 URL fragment로 전달하고 서버에는 SHA-256 해시만 저장하며, 수동 코드는 요청 본문·HMAC 시도 버킷·만료를 적용했다. Convex 개발 배포에서 동일 가상 브라우저 5회 실패 후 10분 차단과 원문 비저장을 확인했고, Vercel Preview의 요청 경로·Build/Runtime 로그에도 QR 원문·코드·호·역할이 남지 않음을 확인했다.
- 2026-09-08 기술 통합 검증: Auth0 Google 전용 SPA와 Convex 미국 동부 개발 배포를 연결하고, Vercel `history-game` 프로젝트를 `apps/cooperative-live` 루트로 배포했다. 가상 학생 8명 입장→4인 모둠 2개 편성→종료 흐름을 확인했고, 정리 후 Convex의 `sessions`·`players`·`rooms`·`interventions` 테이블이 모두 비어 있음을 확인했다. Vercel 고정 주소는 기술 Preview 용도이며 실제 학생 접속 허가를 뜻하지 않는다.
- 2026-09-15 사용자 확인: 개인정보 국외 처리 조건을 처리했다. 실제 학생 시험 전에는 위 해제 조건의 근거 문서와 사용할 Convex·Vercel 환경이 일치하는지만 운영 체크리스트에서 재확인한다. 첫 실제 활동은 [`고려 초기 실시간 협동 MUD 구현 계획`](./docs/plans/implementation_plan_early_goryeo_cooperative_live_first_activity.md)과 [`EXP-009`](./EXPERIMENTS.md)로 분리해 기록했다.


---

<!-- 원래 제목: P1-COLLAB-VERTICAL — Vercel·Convex 첫 수직 슬라이스 -->
## P1-COLLAB-VERTICAL — Vercel·Convex 첫 수직 슬라이스

- 상태: `implemented-preview` — `TASK-20260907-02 | apps/cooperative-live | implementation agent | 상태: DONE`. 로컬 구현과 Convex/Auth0/Vercel 가상 데이터 수직 통합을 완료했다. 교사 세션 복구, 같은 탭의 중복 입장 방지, 3~24명 균형 편성, 입장 정원 제한, 수업 코드 충돌 처리, QR·수동 코드 입장 보안을 포함한다. `TASK-20260909-03`에서 가상 학생 21명의 병렬 QR 입장→5개 모둠 편성→개입→종료 삭제까지 Convex 함수 회귀 테스트를 추가했다. 실제 학생 운영은 P1 개인정보 게이트 해제 뒤 진행한다.
- 계획서: [`implementation_plan_vercel_convex_vertical_slice.md`](./docs/plans/implementation_plan_vercel_convex_vertical_slice.md)
- 앱 위치: 같은 저장소 `apps/cooperative-live/`, 기존 정적 앱과 GitHub Pages는 유지.
- 첫 범위: 고조선 8조법, 교사 1명과 가상 학생 8명, 새 무작위 호·4인 모둠 2개 무작위 편성·진행 대시보드·힌트/심화·종료 삭제까지.
- 인증: 교사는 Convex 환경변수 `TEACHER_PASSCODE` 비밀번호로 로그인한다(2026-10-05 Auth0에서 교체). 학생은 계정 없이 세션 한정 난수 토큰을 사용한다.
- 착수 조건: 사용자 계획 승인 완료. 운영 리전·Production·실제 학생 접속은 `P1-COLLAB-PRIVACY` 해제 뒤 진행한다.


---

<!-- 원래 제목: 2026-09-06 실시간 협동 MUD 검토 — P2-COLLAB-01 -->
## 2026-09-06 실시간 협동 MUD 검토 — P2-COLLAB-01

- 상태: `implemented-preview` — 첫 수직 슬라이스, Convex/Auth0 개발 연결, Vercel 기술 Preview, QR·수동 코드 보안, 가상 학생 21명 함수 회귀 테스트를 완료했다. 학교 네트워크·물리 기기·실제 학생 검증은 개인정보 게이트 뒤 진행한다. 백엔드는 Convex로 확정([D-019](./DECISIONS.md)).
- 문제·목적: 기존 고조선 협동 v0.1은 기기별 정적 활동이며, 최초 판단 전에 공유하고 모둠 수는 5개로 고정한다. 21명 학급의 40분 수업 중 **10분 이내**에 운영할 활동별 무작위 편성 및 가변 학급용 실시간 협동 구조를 별도로 설계한다.
- **실측 근거 (2026-09-04 수업, [`EXP-006`](./EXPERIMENTS.md))**: 비대칭 정보로 대면 대화가 실제로 발생했고 모둠 결과도 갈렸다. 그러나 교사가 꼽은 최대 제약은 **"모둠 진행 상황을 볼 수 없음"** 이었고, 빠른 모둠에 추가 상황을·느린 모둠에 힌트를 주는 개입이 불가능했다. 이 항목이 실시간 앱의 1순위 요구사항이다.
- 교육·사용자 영향: 개인 최초 판단의 독립성, 3/4/5인 모두의 정보·발언 기회, 교사의 수업 진행·접속 복구를 확보한다.
- 예상 범위: 신규 독립 Next.js/Convex 앱과 Vercel 배포 경계, 기존 허브의 후속 연결 링크. 기존 개인 MUD와 정적 협동 버전은 유지한다.
- 관련 파일: `cooperative-mud/gojoseon-law/{app,scenario}.js`, `cooperative-mud/index.html`, `PRD.md`, `TECH_STACK.md`, `ARCHITECTURE.md`, `ROADMAP.md`.
- 원문·인터뷰: [INBOX](./INBOX.md)의 2026-09-06 항목. 설계: [전체 계획](./docs/plans/COLLABORATIVE_MUD_PLAN.md), [아키텍처](./docs/plans/COLLABORATIVE_MUD_ARCHITECTURE.md), [MVP](./docs/plans/COLLABORATIVE_MUD_MVP.md).
- 다음 판단: 첫 수직 슬라이스의 현재 실행 기준은 [`implementation_plan_vercel_convex_vertical_slice.md`](./docs/plans/implementation_plan_vercel_convex_vertical_slice.md)다. 전체 10분 학습 루프가 아니라 입장·편성·진행판·개입·삭제를 가상 학생 8명으로 먼저 관통한다. Supabase 계획은 [D-020](./DECISIONS.md)으로 보류했으므로 두 백엔드를 혼합하지 않는다.
- 2026-09-06 입장·표시 이름 결정: 학생 입장은 **QR 우선**(일회 코드 배부 폐지)이고 학생 인증 주체를 만들지 않는다 → Convex Auth beta가 임계 경로에서 빠짐. 표시 이름은 **학생이 대기 중 고르는 호(號)** 이며 시대 무관 공용 24개를 재사용한다. 미선택자는 교사 시작 시 서버가 무작위 배정한다. 설계는 [아키텍처](./docs/plans/COLLABORATIVE_MUD_ARCHITECTURE.md) §2-1·§2-2. 학교 Wi-Fi는 기존 활동에서 문제 없었음이 확인됐으나 21대 동시 접속·실시간 구독은 미실측이다.
- 10분 활동 예산: 호 선택은 QR 입장 대기 시간에 흡수되므로 별도 시간을 배정하지 않는다. 전체 학습 루프를 후속 슬라이스로 확장할 때 법 만들기 단계의 시간 제한과 `합의 미완` 정상 종료를 결정한다.
- 후속 관찰 후보: 기존 v0.1의 공유→최초 판단 순서는 이번 의도와 다르다. 기존 정적 앱 수정은 별도 범위이며 이번에는 신규 흐름의 수용 기준으로 기록한다.
- 2026-09-06 후속 검토: Vercel로 두 앱의 화면 호스팅을 통일하는 것은 가능하다. 새 맥락에서는 같은 저장소·두 Vercel 프로젝트를 우선 검토하며, 별도 저장소는 필수가 아니다. 계획 §10~11 참조. 실제 이전 승인·설정 변경은 아직 없음.
- 후속 UX 후보: 학생 첫 화면에서 오늘의 복습과 모둠 수업 진입을 구별하고 교사는 전체 차시를 탐색하도록 한다. 실제 포털의 긴 단원 탭·MUD/허브/파일럿 용어를 검토한다. `index.html`, `js/app.js`, `css/style.css`의 최소 변경으로 별도 계획화한다.

### 관련 후속 항목

- **P2-COLLAB-03 — 협동 시나리오 확장 (진행 중, 3편 제작 완료 · 수업 검증 대기)**: 고조선 형식이 통했으므로 다른 시대로 넓힌다. 소재는 진도 순서를 기준으로 고른다.
  - 1단원 6차시 `cooperative-mud/gojoseon-law/` 고조선 8조법 — 제작·**수업 운영 완료**([`EXP-006`](./EXPERIMENTS.md))
  - 1단원 7차시 `cooperative-mud/founding-myths/` 삼국·가야 시조 설화 — 제작·**수업 운영 완료**([`EXP-007`](./EXPERIMENTS.md), 2026-09-08)
  - 1단원 8차시 `cooperative-mud/han-river/` 한강 유역 쟁탈 — 제작 완료, 수업 미운영
  - 다음 후보는 [`scenario_candidates_artifact_comparison_and_cooperative_mud.md`](./docs/plans/scenario_candidates_artifact_comparison_and_cooperative_mud.md)에서 진도에 맞춰 고른다. 폭력·아동 희생 요소가 있는 후보(살수대첩·계백과 관창)는 착수 전 별도 확인이 필요하다.
  - 세 편의 성격이 겹치지 않도록 관리한다: 고조선=이해관계로 판단, 시조 설화=예외를 만나 일반화 교정, 한강=여러 근거를 견주어 설명.
- **P2-COLLAB-07 — 타이머 예산 실측 (미착수)**: 화면별 목표 시간은 설계 추정치다. 첫 수업에서 힌트·심화 배지가 얼마나 뜨는지 관찰해 `scenario.pacing.budgets`를 조정한다. 감도는 `pacing.tuning`으로 시나리오별로 덮어쓸 수 있다.
- **P2-COLLAB-04 — 역사 비교 화면의 "정답 맞췄다" 대응 (미착수)**: 범금 8조의 절도 조항(노비·50만전)과 학생의 가혹한 처벌안이 겹칠 때 "우리가 맞췄다"로 끝나지 않도록, 누구에게 유리·불리한지 되묻는 문구를 비교 화면의 수용 기준으로 명시한다.
- **P2-COLLAB-05 — P1-COLLAB-PRIVACY로 승격**: 2026-09-07 법령·Convex 공식 문서 감사를 거쳐 문서 최상단의 **P1 착수 게이트**로 올렸다. 상세 근거와 학교 질문은 [감사 문서](./docs/audits/convex_elementary_school_privacy_audit.md)를 따른다.
  - 질문 1: 학생 이름·학번·계정을 수집하지 않고 수업 중에만 모둠 번호와 제출 여부만 서버에 두었다가 수업 종료 시 즉시 삭제하는 경우에도 사전 신고나 보호자 동의가 필요한가?
  - 질문 2: 외부 웹서비스를 수업에 활용할 때 따라야 할 학교·교육청 지침이 있는가?
  - 질문 3: 서버가 국외(Convex 미국 동부 또는 아일랜드)에 있는 서비스 사용에 제한이 있는가? → "불가" 답이면 국내 리전 또는 기관 승인 백엔드로 전환한다.
- **P2-COLLAB-06 — 네트워크·QR 실측 및 교실용 QR 확대 (수업 관찰 반영·구현 대기)**: 개인정보 게이트 해제 뒤 Preview를 배포해 교실 아이패드에서 여는 것까지 확인한다. `vercel.app` 도메인과 WebSocket이 학교 MDM·방화벽에서 열리는지, 앞 화면 QR을 뒷자리에서 읽을 수 있는지, 아이패드에서 탭을 닫았다 돌아올 때 복구되는지 실제 학생 적용 전에 검사한다.
  - **2026-09-29 실제 운영 요구**: 교사 1명·학생 21명의 “새 고려의 첫 회의” 입장 과정에서, 교사 화면의 QR을 대형 화면과 교실 뒤쪽에서도 읽기 쉽게 확대할 기능이 필요하다는 사용자 관찰이 있었다. 원문은 [`INBOX.md`](./INBOX.md)에 보존한다.
  - **목적·사용자 영향**: 학생이 교사 기기 앞으로 몰리거나 수동 코드 입력으로 우회하는 일을 줄이고, 21명 입장 시간을 단축한다. 확대 화면에서도 수업 코드와 활동 제목을 함께 보여 교사가 잘못된 세션을 배포하지 않게 한다.
  - **필요 기능 후보**:
    1. 교사 대시보드의 QR 옆에 `QR 크게 보기` 버튼을 둔다.
    2. 전체 화면에 가까운 오버레이에서 QR, 6자리 수업 코드, 활동 제목, 닫기 버튼을 표시한다.
    3. 확대는 현재 QR 이미지만 재표시하며 입장 토큰을 재발급하지 않는다. `QR 새로 만들기`와 시각적으로 분리한다.
    4. 프로젝터·전자칠판·태블릿 가로 화면에서 잘리지 않고, 키보드 `Esc`와 터치 닫기를 모두 지원한다.
    5. QR을 읽지 못하는 학생을 위해 같은 화면에 수동 입장 주소와 6자리 코드를 유지한다.
  - **예상 변경 범위**: `apps/cooperative-live`의 교사 대시보드 QR 표시 컴포넌트와 스타일, 관련 단위/UI 검사. 정규 MUD 28편·`js/mudEngine.js`·`scripts/18*`·조선 후기 콘텐츠 원본은 범위 밖이다.
  - **수용 기준 후보**: 확대 전후 QR 내용이 같고 새 토큰이 생기지 않는다. 1366×768 프로젝터와 iPad 가로에서 QR 전체·코드·제목·닫기가 한 화면에 보인다. 실제 교실 뒤쪽 스캔 거리는 다음 실측에서 기록한다.
- **미확보 입력**: 사용자가 Claude와 별도로 만들던 "다른 활동 아이디어" 문서를 찾지 못했다. 이 저장소, 발행 아티팩트 3건, 다른 Claude Code 세션 어디에도 없다. claude.ai 웹 대화로 추정되며 원문을 받으면 INBOX로 분류한다.

