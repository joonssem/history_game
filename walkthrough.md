# Walkthrough

> **보관 안내 (2026-10-22)**: 2026-09 이전 기록은 [`docs/archive/walkthrough/`](./docs/archive/walkthrough/)의 월별 파일로 옮겼다. 이 파일에는 2026-10 기록만 둔다.

## 2026-10-22 — 저장소 슬림화 단계 B: walkthrough·INBOX 분할

`TASK-20261022-REPO-SLIMMING | walkthrough.md, INBOX.md | integration agent(Claude) | 상태: 단계 B DONE`

- walkthrough: 2026-10 기록만 루트에 두고(386KB → 37KB) 2026-08·09 기록은 `docs/archive/walkthrough/2026-08.md`·`2026-09.md`로 옮겼다. 항목 순서와 본문은 그대로이고, 날짜 없는 `반복 문제 점검 결과` 절은 앞 항목과 같은 파일에 두었다.
- INBOX: 날짜 기준(사용자 답이 없어 권장안 채택)으로 2026-09 항목 104개를 `docs/archive/inbox/2026-09.md`로 옮기고(209KB → 21KB) 루트에는 2026-10 항목과 `사용 규칙`·`처리 상태`만 남겼다. 코드 펜스 안의 `##`는 항목 경계로 보지 않았다. 처리 상태 기준 분할은 하지 않았다.
- 링크: 보관 파일 안의 루트 기준 상대 링크는 `../../../`로 고쳤다. 깨진 링크 수는 125개로 그대로다(보관 파일의 24개는 옮기기 전부터 깨져 있던 링크).
- 남은 일: `DECISIONS.md`(57KB) 분리는 결정 번호 링크가 많아 보류했다.

## 2026-10-22 — 저장소 슬림화 단계 A: 완료 계획서·지난 핸드오프 보관, 루트 문서 이동

`TASK-20261022-REPO-SLIMMING | docs/plans·docs/handoff·루트 문서 | integration agent(Claude) | 상태: 단계 A DONE`

- 계획: [`implementation_plan_repo_slimming_20261022.md`](./docs/plans/implementation_plan_repo_slimming_20261022.md)
- 옮김(`git mv`): 완료 계획서 16개 → `docs/archive/plans/`, `docs/handoff/` 61개 → `docs/archive/handoff/`, `activity_duration_audit.md` → `docs/audits/`, `TEACHING_artifact_comparison.md`·`USER_FLOWS.md`·`WIREFRAMES.md`·`BROWSER_REGRESSION_CHECKLIST.md` → `docs/product/`, `agents.md` → `AGENTS.md`.
- 링크: 모든 `.md`의 상대 링크와 저장소 루트 기준 경로 표기를 새 경로로 바꿨다. INBOX·walkthrough·DECISIONS도 경로 문자열만 바꿨고 문장은 고치지 않았다. 이전부터 깨져 있던 링크 125개는 그대로이고 새로 깨진 링크는 없다.
- 코드: `scripts/07_audit_activity_duration.py`의 보고서 경로와 `.github/workflows/quality-gate.yml`의 비교 경로를 `docs/audits/activity_duration_audit.md`로 바꿨다.
- 검증: CI 단계 전체를 로컬에서 실행해 통과(01·03·04·08·09·05·16·06·07·10·11, 보고서 재생성 후 diff 없음, `node --check js/*.js`, `git diff --check`).
- 남김: 상태 표기가 낡아 완료 여부를 판단하지 못한 계획서(`implementation_plan_lesson_track_ui`, `implementation_plan_personal_timeline`, `story_mud_relationship`, `tasks_site_structure`, `classroom_observation_*`)는 `docs/plans/`에 두었다.

## 2026-10-20 — 장면 그림 개선: 조선 건국 건물을 궁궐·성균관답게, 개항기 건물과 구분 (D-046)

`TASK-20261020-SCENE-HANOK | assets/scenes 7개, scratch/gen_scene_art_unit2.js | implementation agent(Claude) | 상태: DONE — 생성기 재실행·Chrome 렌더링 확인, 실제 시뮬레이터 화면·iPad 확인은 미실시`

- 사용자 관찰: 조선 건국 2~3차시의 궁궐·대문·성균관이 조선 건물 같지 않고, 개항 이후 건물과 너무 비슷하다. 명량·세종·서민 문화·개항 이후 장면 자체는 좋다.
- 원인: 건물 소품이 삼각 지붕에 사각 몸체인 하나의 도형(`palace`, `gate`, `city`)을 조선 건국과 개항기 장면이 함께 썼다.
- 수정: 처마 끝이 들린 기와지붕, 단청 띠, 붉은 기둥, 월대를 갖춘 근정전형 중층 전각과 홍예문 궁궐 정문을 만들었다. 성균관은 단청 없이 흰 벽·나무 기둥·편액(明倫堂)·은행나무로 구분했다. 한양 민가도 기와집으로 바꿨다. 개항기는 벽돌 서양식 건물·아치창·삼각 박공과 서양식 거리 배경으로 따로 만들었다.
- 바뀐 장면 7개: `joseon-founding-evidence`, `gyeongbokgung-naming`, `hanyang-gates-pavement`, `hanyang-site-selection`, `jejungwon-postal`, `hanyang-tram-street`, `modern-open-evidence`. 핫스팟·JSON·코드는 건드리지 않았다.
- 2단원 34장면 전체 재점검(사용자 요청, 2026-10-20): 나머지 장면은 유지하고, 같은 문제가 남은 두 곳을 추가로 고쳤다. 조선 시장 거리 배경(`street`)을 곡선 처마 기와집(한 채는 초가)으로, 성벽 소품(`wall`)을 돌 쌓기·여장·성문으로 바꿨다. 영향 장면: `angbuilgu-street`, `sangpyeongtongbo-market`, `hanyang-commerce-summary`, `hanyang-site-selection`, `hwaseong-geojunggi`, `joseon-namhansanseong`. 서민 문화 마당(`courtyard`)·실내 배경은 사용자가 좋다고 해서 유지했다.
- 남은 일: 사용자의 시각 검토(근정전·광화문·명륜당 형태는 교과서 이미지와 대조 필요). 브라우저가 이전 SVG를 캐시했다면 강력 새로고침.

## 2026-10-20 — 동료 교사 피드백 2건: 단서 다시 보기·마지막 단서 설명 유지

`TASK-20261020-CLUE-FEEDBACK | js/mudSimulators.js, js/mudEngine.js | implementation agent(Claude) | 상태: DONE — node --check, scripts/05, scripts/04 통과, 브라우저 실사용 확인은 미실시`

- 관찰(동료 교사): 확인한 단서를 다시 볼 수 없다. 마지막 단서를 고르면 설명 대신 "모두 확인" 문구가 나온다.
- 원인: 확인한 단서 버튼이 `disabled`가 되고 캔버스 재클릭은 "이미 확인했습니다"만 표시했다. 완료 시 `updateSimulatorCompletion`이 `successText`로 마지막 단서 설명을 덮어썼다.
- 수정: 확인한 단서를 다시 누르면 설명을 다시 보여 준다(진행도·행동 수에는 영향 없음, 버튼은 ✓ 표시만 유지). 완료 문구는 마지막 단서 설명 아래에 덧붙인다.
- 미확인: 모둠 탐험(협동 활동)은 해당 교사가 학생과 시험 후 피드백 예정.

## 2026-10-19 — pstack 검토와 audit 스킬 2종 추가 (`/interrogate`, `/blast-radius`)

`TASK-20261019-PSTACK-SKILLS | .claude/skills/{interrogate,blast-radius} | implementation agent(Claude) | 상태: DONE — 스킬 시험(sonnet·opus 교차)과 수정 반영 완료, 재검증 실행은 생략`

- cursor/plugins `pstack`을 검토해 이 저장소에 맞는 것만 골랐다. 원문을 verbatim으로 가져올 수 없어 요약을 바탕으로 새로 썼고 각 파일에 출처를 밝혔다. 기존 `grill-me`·`retro`와 같은 형식이다.
- 시험: 새 스킬 두 개에 `/interrogate`를 한 번 돌렸다(sonnet·opus 서브에이전트, 읽기 전용 Explore). 두 모델이 독립적으로 같은 문제를 짚었다. 읽기 전용 강제 약함, `git diff main...HEAD`가 main 작업·미추적 파일에서 비는 문제, Vercel 전제 오류, `scripts/01~18` 표기 오류(15번 없음)다.
- opus만 찾은 것: `scripts/02_fix_missing_next.py`와 07·10·11·13·14·17·18은 실행하면 데이터·보고서를 다시 쓴다. audit 스킬이 "검증 스크립트를 돌린다"를 그대로 따르면 파일이 바뀐다(직접 확인함). 02 실행 금지와 실행 뒤 `git status` 확인을 스킬에 넣었다.
- 수정 반영(Act on 7건): `Explore` 고정과 금지 사항 명시, 범위를 `git status --short` 기준으로 변경, GitHub Pages 전제로 교정, `/interrogate` 직접 호출 문구를 사용자 제안으로 변경, 세션 scratchpad만 사용(`scratch/` 금지), 경로 구분 정리.
- 도입하지 않은 것: `/poteto-mode`·플레이북(AGENTS.md의 문서 우선 흐름과 겹침), `/setup-pstack`(grok·opus 5.5 전제), `/swarm`·`/arena`(worktree 규칙과 충돌 위험).
- 미확인: 수정 후 스킬 재실행, 교육 렌즈의 실제 쓸모. 보류한 4건은 BACKLOG `P3-AUDIT-SKILLS`에 올렸다.

## 2026-10-19 — 조선 후기 확장 2종 신규 (서민 문화·개항 이후)

`TASK-20261019-COOP-STATIC-JOSEON-EXTRA | cooperative-mud/joseon-{commoner-culture,open-ports} | implementation/content agent(Claude) | 상태: DONE — 사용자 검토 반영(탈놀이 대사 풀이 삭제), push·Pages 반영·운영 주소 Chrome 2종 E2E ALL OK (2026-10-19)`

- 교과서 5-2 2단원 100~102쪽, 104~108쪽을 쪽수 범위로 옮겼다([D-045](./DECISIONS.md)). 사용자 인터뷰 결정: 서민 문화 10분형은 101쪽 민화 고르기, 개항 이후는 학생 눈높이 제목, 109~110쪽은 쓰지 않음.
- 바뀐 파일: `cooperative-mud/joseon-{commoner-culture,open-ports}/{scenario.js,index.html}`(신규), `cooperative-mud/{index.html,TEACHING.md}`(허브 13개·조선 묶음 7개), `DECISIONS.md`(D-045), 자동 생성 검토 문서.
- 검증(실행함): `node --check`, `check_static_coop_scenario.js` 2종 OK(조합 81·81, 함정 각 2), 로컬 Chrome `e2e_coop_generic.js` 2종 ALL OK.
- 미확인: 사용자 콘텐츠 검토, Pages 반영·운영 주소 검증, 쪽별 출처 링크(우리역사넷 첫 화면만), 실제 소요 시간.

## 2026-10-19 — 저장소 정리: 실시간 협동 앱 제거와 문서 보관 (D-040)

`TASK-20261016-REPO-CLEANUP | 저장소 정리 | integration agent(Claude) | 상태: DONE — worktree 9개 제거, 로컬 브랜치 17개·원격 브랜치 11개 삭제까지 완료(사용자 "전부 정리" 승인). Vercel Git 연동 확인만 Codex에 위임`

- 보관 태그 13개(`archive/cooperative-live-20261016` + 미반영 브랜치 12개)를 만들어 원격에 push했다. `apps/cooperative-live/`와 `scripts/15_validate_cooperative_packet.js`를 제거하고 `.gitignore`의 `apps/*` 규칙 3줄을 지웠다(`429d88c`).
- 취소 문서 28건과 `CONVEX_VERCEL_NOTES.md`(환경변수 이름만 있고 값 없음)를 `docs/archive/cooperative-live/`로 옮기고 README를 만들었다. BACKLOG의 취소 항목 16묶음은 같은 폴더 `BACKLOG_cancelled_20261016.md`로 옮겼다(1,043줄로 줄어듦). 살아 있던 "판단이 필요한 것 1~13"은 BACKLOG에 남겼다.
- 루트의 `202610021201.png`·`extracted_script.js`·`extracted_style.css`·`debug.log`를 삭제하고 `다른pc_vscode터미널5개창작업설명.md`를 `docs/archive/`로 옮겼다.
- README·project_context·docs/plans/README·TECH_STACK·ARCHITECTURE의 링크를 새 경로로 고쳤다. INBOX·walkthrough·DECISIONS 본문과 인계 문서의 옛 경로는 원문 보존을 위해 고치지 않았다.
- 검증(실행함): quality-gate의 JSON·MUD 정합·계약·카탈로그·출처·시뮬레이터·차시 트랙·정적 자산 검사와 `node --check js/*.js` 모두 통과.
- 후속(2026-10-19 사용자 승인): `git worktree` 9개 제거, 로컬 브랜치 17개·원격 브랜치 11개 삭제를 완료했다(삭제 전 태그와 커밋 일치를 확인). 남은 것은 Vercel Git 연동 확인(Codex 위임)과 등록되지 않은 `.worktrees/*` 폴더 5개(baseline·patch·preview 등) 처리다.

## 2026-10-19 — 조선 협동 활동 4종 신규 (건국과 유교 사회·세종 시기·임진왜란과 병자호란·조선 후기 새로운 생각)

`TASK-20261019-COOP-STATIC-JOSEON | cooperative-mud/joseon-{founding,sejong,wars,late-change} | implementation/content agent(Claude) | 상태: DONE — 사용자 검토 반영, push(`a0ca3df`)·Pages 반영·운영 주소 Chrome 4종 E2E ALL OK (2026-10-19)`

- 교과서 5-2 2단원 77~99쪽을 직접 대조해 학생 화면을 쪽수 범위로 제한했다([D-043](./DECISIONS.md)): 건국과 유교 사회 77~86쪽, 세종 시기 87~90쪽, 임진왜란·병자호란 91~92쪽, 조선 후기 새로운 생각 94·98~99쪽. 경제·신분(95~97쪽)은 `joseon-late-economy`와 겹치지 않게 뺐다.
- 바뀐 파일: `cooperative-mud/joseon-*/{scenario.js,index.html}`(신규 4종), `cooperative-mud/{index.html,TEACHING.md}`, `DECISIONS.md`(D-043), `docs/plans/joseon_coop_content_review_20261019.md`(자동 생성 검토 문서). 공용 엔진은 수정하지 않았다.
- 검증(실행함): `node --check`, `node scratch/check_static_coop_scenario.js` 4종 OK(조합 108·108·81·81, 함정 각 2), 로컬 헤드리스 Chrome `scratch/e2e_coop_generic.js` 4종 ALL OK.
- 미확인: 사용자 콘텐츠 검토, GitHub Pages 반영·운영 주소 재검증, 실제 소요 시간. 사용자 검토 반영: 병자호란 두 신하 주장을 중립 요약으로 교체, 출처 링크를 항목별 우리역사넷 페이지로 교체(접속 미확인).

## 2026-10-19 — 고려 협동 활동 3종 정적 이식 (건국·주변 나라 관계·문화와 생활)

`TASK-20261015-COOP-STATIC-GORYEO | cooperative-mud/goryeo-{founding,relations,culture} | implementation/content agent(Claude) | 상태: DONE — push·Pages 반영·운영 주소 Chrome 3종 E2E ALL OK (2026-10-19, `2c9a211`). 실제 소요 시간은 수업 뒤 측정`

- 교과서 5-2 1단원 47~63쪽을 직접 대조해 학생 화면을 교과서 쪽수 범위로 제한했다([D-042](./DECISIONS.md)). 원본의 교과서 밖 내용(사심관·여진 문제·삼별초·염경애 묘지명 등)은 `TEACHING.md` 교사 발문 자료로 옮겼다. 검토용 전문: [`docs/plans/goryeo_coop_content_review_20261019.md`](./docs/plans/goryeo_coop_content_review_20261019.md).
- 바뀐 파일: `cooperative-mud/goryeo-*/{scenario.js,index.html}`(신규 3종), `cooperative-mud/trap-note.js`(공용·신규), `cooperative-mud/{index.html,TEACHING.md}`, `scratch/gen_coop_activity.js`(`index.html`·검토 문서 생성), `scratch/e2e_coop_generic.js`(신규), `DECISIONS.md`(D-042).
- 검증(실행함): `node --check`, `node scratch/check_static_coop_scenario.js` 3종 OK(조합 144·108·108, 함정 각 2), 로컬 헤드리스 Chrome 3종 × (3·4·5인 × 5·10분형 + 함정 2종) 전부 통과.
- 미확인: 실제 소요 시간(기존 10분형이 7분 이하였다는 관찰이 있어 예산 조정 가능성), 교실 iPad. 조선 4종(건국·유교 사회, 세종, 임진왜란·병자호란, 후기 사회 변화 확장)은 미착수.
## 2026-10-19 — 10/29 협동 활동 개편: 조선 후기 경제 → 신분 변화 13분형

`TASK-20261015-COOP-STATIC-GORYEO | cooperative-mud/joseon-late-economy | implementation/content agent(Claude) | 상태: DOING — 개편 구현·로컬 검증 완료, push·GitHub Pages 반영과 운영 주소 Chrome 8경로 재검증 완료(2026-10-19, `452a35c`), 교실 iPad 확인 대기`

- 사용자 결정 4건과 콘텐츠 판단 3건을 반영해 `joseon-late-economy`를 v02로 교체했다([D-041](./DECISIONS.md)). 콘텐츠 초안: [`docs/plans/joseon_late_status_content_draft_20261019.md`](./docs/plans/joseon_late_status_content_draft_20261019.md).
- 교과서 95~97쪽 텍스트와 지도서 211~212·215쪽을 직접 대조했다. 4번 가난한 양반 카드의 "모두 부자는 아니었다"는 지도서에도 근거가 없어 만화 장면 묘사로 낮췄다.
- 바뀐 파일: `joseon-late-economy/{scenario.js,index.html,trap-note.js(신규)}`, `cooperative-mud/{index.html,TEACHING.md}`, `scratch/check_static_coop_scenario.js`(6칸·함정 검사로 일반화), `scratch/e2e_joseon_late_status.js`(신규).
- 검증(실행함): `node --check`, `node scratch/check_static_coop_scenario.js`(조선 후기 OK 조합 648·함정 2, 고려 외 두 활동 OK), 로컬 헤드리스 Chrome 8경로(3·4·5인 × 5·13분 + 함정 2종, 역할·근거·가상 표시·3인 추가 자료·6칸·함정 안내·담벼락 안내·기록 지우기·옛 v01 기록 무시 모두 통과).
- 미확인: 교실 iPad 표시·조작, 실제 소요 시간, 5분형에서 6칸을 60초에 고르는 부담. 고려 3종 이식은 미착수.


## 2026-10-06 — Auth0 제거 후 운영 문서 정합화

- 사용자 확인에 따라 2026-10-05 Auth0 제거·교사 비밀번호 로그인 운영 반영을 현행 기준으로 삼았다. Preview 전용 Auth0 계획과 구형 callback 안내는 폐기·역사 기록으로 표시하고, `README.md`, `project_context.md`, `BACKLOG.md`, `docs/plans/README.md`, 고려 수업 체크리스트와 교사용 안내를 갱신했다.
- 사용자가 별도 4~8대 수업 리허설은 필요하지 않다고 판단했다. 근거인 “학생 2명 입장 실패에도 인원이 찬 모둠은 진행” 관찰과 범위를 `INBOX.md`에 보존하고, 리허설 자체를 수행한 것으로 기록하지 않았다. 남은 확인은 개인정보·로그 검사와 GO/NO-GO 판정이다.
- 코드 변경 없이 Vercel Production/Preview의 Auth0 도메인·클라이언트 ID, Convex의 Auth0 도메인·클라이언트 ID·허용목록, 로컬 `.env.local`의 Auth0 도메인·클라이언트 ID와 Auth0 Development 테넌트의 `Default App` SPA를 제거했다. Vercel/Convex 재조회에서 Auth0 변수가 사라지고 `TEACHER_PASSCODE`, `JOIN_ATTEMPT_HMAC_SECRET`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_DEMO_MODE`가 유지된 것을 확인했다. 삭제 전 앱 callback/logout/web origin은 비어 있었고 최근 30일 활성 사용자는 0명이었다. 같은 기간 가입 1건·실패 로그인 2건이 보였으며 사용자 레코드는 앱 설정 삭제 후에도 별도 유지된다. 앱 목록 새로고침 후 `Default App`이 없는 것을 확인했다. `git diff --check` 통과; 자동 테스트는 실행하지 않았다.

## 2026-10-05 교사 대기실 참가자 확인·내보내기 (자동 검증 완료)

- 작업: `TASK-20261005-COLLAB-LOBBY-KICK` (`feat/cooperative-lobby-kick`, 기준 `f71ca7d9`). 공용 `main`의 미커밋 이메일 인증 문서는 건드리지 않았다.
- 대기실에서 호 선택 완료·선택 중·연결 끊김 수를 요약하고, 참가자 카드에 호·heartbeat 기반 접속 상태·입장 시각을 표시한다. 카드를 눌러 교사가 확인하면 해당 레코드를 삭제한다. Preview에서도 내보낸 뒤 남은 인원을 다시 편성하며, 3명 미만이면 새 입장키를 발급하고 대기실로 돌아간다.
- 미리보기 전 호 미선택·연결 끊김 자리를 확인창에 표시한다. `그대로 진행`을 교사가 선택한 경우, 확인창에 보인 호 미선택 자리만 서버에서 대조한 후 삭제한다. 연결 끊김만으로 자동 삭제하지 않는다. 학생의 삭제된 토큰은 곧바로 무효가 되고, 기기에는 QR 재입장 안내가 표시된다.
- `convex/virtual-load.test.ts`에 내보내기·호 재사용·토큰 거부·재입장, 호 미선택 정리, Preview 재편성·대기실 복귀, 교사 권한 경계, 21명 중 빈자리 2명 정리 후 19명 편성 회귀를 추가했다.
- 검증: `npm run check` 통과 (lint, typecheck, 단위 19건, Convex 11건, production build). `git diff --check` 통과. 실제 기기 리허설은 Auth0 Preview callback 불일치로 대기한다.

## 2026-10-05 교사 비밀번호 로그인 교체와 운영 반영

- 작업: `TASK-20261005-COLLAB-TEACHER-PASSCODE` (Claude, Codex 사용량 한도로 인계). Auth0 Google 로그인은 Preview callback 등록 문제로 수정·리허설을 막았고, 다른 교사와의 공동 사용 대비 기능이었으므로 제거했다.
- `/teacher`는 Convex 환경변수 `TEACHER_PASSCODE` 하나로 로그인한다. 로그인 토큰 해시만 서버에 저장하고 12시간 유지, 10회 실패 시 15분 잠금, 비밀번호 변경 시 전체 로그인 무효. 17개 교사 함수와 개입 전송이 `teacherToken`으로 권한을 확인한다. 이전 Auth0 소유 활동은 새 교사 화면에서 보이지 않는다.
- 복구 P0·P1/P2, 대기실 내보내기와 함께 main에 fast-forward 반영(`b54f80f0`). 위 대기실 항목의 "Auth0 Preview callback 대기"는 해소됐다.
- 검증: `npm run check` 통과(lint, typecheck, 단위 19건, Convex 15건, production build), `git diff --check`. 사용자가 운영 `/teacher`에서 비밀번호 로그인을 확인했다. 실제 기기 리허설은 남아 있다.
- 사고와 교훈: Convex 개발 배포에만 함수를 올린다고 판단했으나 Vercel Production·Preview가 같은 Convex 배포를 써서, main 반영 전까지 운영 교사 화면이 새 서버 함수와 맞지 않았다. 수업이 없는 시간이어서 main 반영으로 해소했다. 운영/개발 Convex 분리를 다음 기능 작업 전에 진행한다.
- Convex 배포 시 `tsc` 검사는 `convex/tsconfig.json`에 `@/*` 경로가 없어 테스트 파일에서 실패했다. 이번 배포는 `--typecheck=disable`로 진행했고 같은 날 경로 설정을 보완했다.
- 세션 마감 요약: [`docs/archive/handoff/claude_session_close_20261005.md`](./docs/archive/handoff/claude_session_close_20261005.md).

## 2026-10-06 P0 개인정보·로그 검사 부분 결과

- `TASK-20261006-COLLAB-RECOVERY-LOG-AUDIT`: 소스 검토에서 학생 이름·학번 필드와 실제 `console.*` 호출은 발견되지 않았으며, 학생의 초기 판단·이유는 `completeFirst` mutation에 전달되지 않는다.
- Vercel `history-game` Logs에서 최근 30분 요청 로그 0건을 확인했다. Convex `cooperative-live`의 Development 배포(`glorious-guanaco-616`) Logs 화면은 12초 관찰 동안 `Waiting for new logs...`로 이벤트가 없었다. 앞서 실행한 Convex CLI bounded stream에서도 이벤트 형식의 로그는 수집되지 않았다.
- 로그가 없어 관찰 창의 실제 레코드에서 입장키·복구 코드·학생 토큰 원문 노출은 확인되지 않았다. 과거 Convex 런타임 로그를 조회하지 못했으므로 이 결과를 전체 로그 이력에 대한 무노출 증명으로 확대하지 않는다. 계획서 8-4와 8-5는 미완료 상태를 유지한다.
- 컴퓨터 업그레이드 이후 재개해 운영 대시보드를 다시 확인했다. Vercel Production Observability는 최근 6시간 데이터 없음, 함수 호출 0건으로 표시됐다. Convex Development Health의 표시 범위(2026-10-03~현재)에도 함수 호출 데이터가 없고, Logs 화면은 `Waiting for new logs...`만 표시해 과거 런타임 행을 열 수 없었다.
- Convex CLI `logs --history 100 --jsonl --deployment glorious-guanaco-616`도 실행했지만 30초 동안 출력이 없어 중단했다. 과거 로그 조회 결과로 계산하지 않는다.
- `apps/cooperative-live`에서 `npm run check`를 다시 실행해 통과시켰다: lint, typecheck, unit 19건, Convex 15건, Next.js production build.
- `completeFirst` 인자에는 세션 ID와 학생 토큰만 있고 첫 판단·이유는 없다. `virtual-load.test.ts`는 복구 코드가 DB 원문으로 저장되지 않는 것을 검사한다. 코드 검색에서 학생 이름·학번 필드와 앱 `console.*` 호출을 발견하지 못했다. 따라서 8-4의 코드 측 점검과 현재 대시보드 관찰은 마쳤지만, 로그가 비어 있어 과거 기록의 민감값 포함 여부는 판정할 수 없다. 8-4는 미완료, 8-5는 사용자의 GO/NO-GO 결정 대기로 둔다.
## 2026-10-06 고려 주변 나라 관계 실시간 협동 활동 추가 (P1-A)

- 작업: `TASK-20261006-GORYEO-RELATIONS-P1A` (Claude, 기준 main `1d8d48e`, 브랜치 `feat/claude-goryeo-relations`). 계획 승인 순서에 따라 주변 나라 관계 활동만 구현했다. 고려 문화 실시간판은 Codex의 `feat/goryeo-classroom-activities`에 따로 있어 건드리지 않았다.
- `goryeo-foreign-relations` v1을 `shared/scenario.ts`(공개 메타·3·4·5인 편성)와 `convex/scenarios.ts`(서버 전용 역할 본문·근거·공동 질문·교사 개입·출처 6건)에 등록했다. 교사 생성 화면은 공개 목록을 읽으므로 코드 변경 없이 선택된다. 새 상태 머신이나 필드는 만들지 않았다.
- 역할 5종(외교 기록 검토자·북방 방어 담당자·전란 속 마을 사람·강화·항쟁 기록자·관계 연표 검토자). 3인 편성은 마을 사람 자료를 공통 자료로 보충한다. 근거 문장에 시기 표지를 붙였고, 거란 시기 백성 피해는 출처가 없어 쓰지 않았다.
- 서버는 시기 조합을 강제하지 않는다(공통 엔진 계약 유지). 시기 구분은 근거 표지·한계 선택지·교사 발문으로 유도한다.
- 테스트: 공개 편성 고유성, 레지스트리 공통 자료·근거 표지, 3·4·5인 서버 편성·역할 비공개·공유 후 공통 자료 공개(Convex).
- 검증: `npm run check` 통과(lint, typecheck, 단위 22건, Convex 16건, production build). 클라이언트 번들에 비공개 역할 본문 없음 확인. 실제 기기 리허설·학생 관찰·출처 원문 재대조·교과서 쪽수 대조는 미완료이며 이 기록을 현장 검증으로 해석하지 않는다.
- 교사 운영안: `apps/cooperative-live/TEACHING_GORYEO_RELATIONS.md`. 문화 활동 병합 시 `PUBLIC_SCENARIOS`·`SCENARIOS` 배열과 테스트 파일에서 충돌이 예상된다(둘 다 추가이므로 양쪽 보존).

## 2026-10-06 고려 문화·생활 실시간 협동 활동 통합 (P1-B)

- main 병합 커밋: `b310dbe` (관계 P1-A `f16e361`와 문화 P1-B 통합). `npm run check` 통과: lint, typecheck, 단위 24건, Convex 17건, production build; `git diff --check` 통과.
- P1-A 관계 활동(`goryeo-foreign-relations` v1)과 P1-B 문화·생활 활동(`goryeo-culture-life` v1)을 현재 main의 교사 비밀번호 인증·복구 계약 위에 통합했다. 문화 활동은 5개 역할(청자 장인, 가족 기록, 대장경 제작 참여, 금속활자 인쇄, 자료 범위 검토), 3·4·5인 배치, 3인 모둠 직지 공통자료를 등록했다.
- 자료 조합만으로 고려인 전체의 삶을 일반화하지 않도록 초안 제출에 가족 생활 정책, 가족 기록 역할의 근거, `record-and-scope` 연결을 서버에서 필수화했다. 대장경의 장기간 판각·여러 계층 참여와 노동을 포함하되 구체적인 노동 조건은 자료로 알 수 없다고 한정했다. 청자 사용 계층·장인 생활도 출처표 한계를 넘지 않는다. 벽란도는 활동에서 사용하지 않으며, C8 미확인 지명·연도는 학생용 문장에 넣지 않았다.
- 변경: `shared/scenario.ts`, `convex/scenarios.ts`, `convex/students.ts`, 공개 레지스트리·배치 테스트, Convex 저장 거부 회귀, `TEACHING_GORYEO_CULTURE_LIFE.md`, 계획 체크리스트, BACKLOG, project context.
- 검증: `npm run check` 통과(lint, typecheck, 단위 24건, Convex 17건, production build), `git diff --check` 통과. 기존 관계 활동 및 레지스트리 회귀 포함.
- 운영·현장 상태: Production과 Preview가 같은 Convex `glorious-guanaco-616`를 사용 중인 것을 확인했다. 운영/개발 분리가 끝나지 않아 Convex·Vercel 배포는 하지 않았다. 실제 기기 리허설·학생 관찰·출처 원문 및 교과서 쪽수 재대조는 미완료이므로 학생용 운영 GO로 보지 않는다.

## 2026-10-15 Convex 실시간 협동 취소·동결, 조선 후기 경제 정적 협동 활동 추가

- 결정: [D-038](./DECISIONS.md) — Convex 실시간 협동 활동 취소, `apps/cooperative-live` 동결(코드 보관, Vercel·Convex 배포는 그대로 둠). [D-039](./DECISIONS.md) — 조선 후기 협동 활동을 교과서 95~96쪽의 세 갈래로 짜고, 학생 화면은 교과서 범위로 제한. D-019 폐기, D-034 역할 구성 대체.
- 정리: 협동 관련 worktree 8개 제거(브랜치 보존). `feat/cooperative-teacher-master-advance`의 미커밋 계획서 2개는 제거 전에 그 브랜치에 커밋(`4309443`).
- 교과서 PDF: 공개 저장소·Pages에 올라가 있던 `primary_data/society_5-2-1.pdf`를 main에서 추적 해제하고 `primary_data/*.pdf`와 교과서 이미지를 `.gitignore`에 추가(`e71f17c`, push 완료, Pages 404 확인). 과거 커밋·다른 원격 브랜치에는 남아 있으며, 사용자 판단으로 기록 재작성은 하지 않음.
- 새 활동: `cooperative-mud/joseon-late-economy/` (2단원 8차시, 10/29 공개수업용, 기본 10분형). 역할 순서는 모내기 농민·상품 작물 농민·보부상·화폐 담당 관리·기록관. 3인 모둠은 상평통보 공통 자료를 받는다. 새 자료는 96쪽 "상평통보 이전 쌀·옷감 거래", 10분형 추가 단계는 한 농민의 한 해 이야기(가상)다. 교과서 밖 심화(전황·품팔이·호적 누락)는 `TEACHING.md` 교사 발문 자료로만 둔다. 공용 엔진(`episode.js`·`pacing.js`·`cooperative.css`)은 수정하지 않음.
- 함께 수정: `cooperative-mud/index.html`(허브 카드), `cooperative-mud/TEACHING.md`(활동 표·역할 표·발문 자료), `apps/cooperative-live/README.md`(동결 표시).
- 검증: `node --check` 통과. `scratch/check_static_coop_scenario.js`(신규, episode.js 계약 검사·문장 36조합)가 새 활동·한강·시조 설화에서 통과. 고조선은 별도 `app.js` 형식이라 대상 아님. 로컬 Chrome 자동 진행으로 휴대폰(375px)·태블릿(820px) × 3·4·5인 × 5·10분형 12개 경로를 완료 화면까지 확인(가로 넘침 없음, 콘솔 오류는 로컬 서버 favicon 404뿐). 기존 3개 활동 시작 화면 회귀 없음. `scripts/15_validate_cooperative_packet.js`는 실시간 앱 계약 전용이라 쓰지 않음.
- 남은 일: 사용자 콘텐츠 검토, Pages 반영 후 교실 기기 확인, 10/29 수업 관찰 기록(EXPERIMENTS).

## 2026-10-19 장면 그래픽 시범: 한지 채색화풍 SVG 3장면 (D-046)

- 변경: `js/sceneArt.js`(신규), `js/mudSimulators.js`(배경 훅 + 그림 장면용 알약 라벨), `index.html`(스크립트·캐시버스터), `assets/scenes/{namhae-suguninmul,hansando-hakikjin,kim-hongdo-studio}.svg`, 생성기 `scratch/gen_scene_art.js`.
- 방식: SVG가 있으면 캔버스에 `drawImage`, 없으면 기존 그림. 인물 없음(김홍도 화실은 씨름 인물 대신 걸린 그림·병풍·붓과 벼루).
- 검증: `node --check`, `scripts/01`·`06` 통과. Chrome 820×1180에서 세 장면 핫스팟 3개 클릭 → 3/3 완료, 콘솔 오류 없음(오디오 자동재생 경고만). 현재 화면과 비교 캡처로 라벨 겹침 해소 확인.
- 남은 일: 사용자 검토 후 2단원 나머지 31장면 확장(계획서 §4).

## 2026-10-19 장면 그래픽 확장: 2단원 정규 MUD 34장면 전부 한지 채색화풍 SVG (D-046)

- 변경: `assets/scenes/*.svg` 34개(시범 3 + 31), `js/sceneArt.js` 장면 목록 확장, 생성기 `scratch/gen_scene_art.js`·`scratch/gen_scene_art_unit2.js`(소품 약 50종 재사용). 인물은 그리지 않았다(사물·배경·건물·도구만). 핫스팟 위치에 맞춰 소품을 위쪽에 두고 라벨 알약 자리를 비웠다.
- 검증: `scratch/verify_scene_art.js`(신규)로 9편의 모든 단계를 열어 34장면이 SVG로 그려지는지, 핫스팟을 모두 눌러 완료되는지, 콘솔 오류가 없는지 확인했다. 820×1180·390×844 모두 장면 34/34, 콘솔 오류 0. 예외: `modern_open:3`(전차 거리)은 `inquiry-task`로 한 지점만 고르는 상호작용이라 1/3이 정상이다. `node --check`, `scripts/06` 통과.
- 남은 일: 사용자 검토, 판옥선·한양 건물·호패 등 교과서 이미지와의 대조(사용자, 점검판 `docs/prototypes/scene_gallery.html`), 실제 iPad 확인, 1·3단원 확장 여부.
- 2026-10-19 수정(사용자 지적): `joseon-border` 지도를 실제 방향으로 다시 그렸다. 북쪽이 위이고 두 강 모두 백두산에서 시작한다. 압록강은 남서쪽으로 흘러 황해(왼쪽), 두만강은 북동쪽을 거쳐 동해(오른쪽)로 흐른다. 강 위에 핫스팟이 놓이도록 `regular_joseon_diplomacy.json`의 해당 단계 핫스팟 좌표를 바꿨다(압록강 0.325/0.42, 두만강 0.71/0.33, 주민 이주 0.5/0.67). id·문구·판정은 그대로다.

## 2026-10-21 장면 그래픽: 옛 그림 깜빡임 제거 + 1·3단원 정규 MUD 66장면 확장 (D-046)

- 사용자 승인: 2단원 34장면 승인. 요청 두 가지 — 접속 직후 옛 화면이 잠깐 보였다 바뀌는 문제 수정, 1·3단원 확장.
- 깜빡임 원인: SVG 로드 전 `SceneArt.draw`가 false를 돌려 기존 캔버스 그림이 먼저 그려지고, 로드 뒤에 SVG로 교체됐다. 수정: 등록된 장면은 로드 전 한지색 바탕만 그리고(`expects`), 핫스팟 표지도 그림 장면 모양으로 고정했으며, `sceneArt.js` 로드 때 전체를 미리 읽는다(`preloadAll`). 로드 실패한 장면만 기존 그림으로 되돌린다. 캐시버스터 `20261021-scene3`.
- 확장: 1단원(신석기·청동기·고조선·삼국·고분 벽화·고려 건국·사회·전쟁·문화·통일신라·발해) 40장면 + 3단원(광복·3·1운동·6·25·의병·1910년대·1930~40년대·전후) 26장면. 인물 없음(사물·배경만). 생성기 `scratch/gen_scene_art_unit13.js`(신규), `gen_scene_art_unit2.js`는 헬퍼를 반환하도록만 수정(2단원 SVG는 재생성해도 동일). 점검판 `docs/prototypes/scene_gallery.html`을 1~3단원 전체로 `scratch/gen_scene_gallery.js`가 다시 만든다.
- 검증: `scratch/verify_scene_art.js`가 정규 MUD 27편 모든 단계를 열어 102장면(편별 중복 포함)이 SVG로 그려지는지, 핫스팟을 눌러 완료되는지 확인. 820×1180·390×844 모두 장면 102/102, 콘솔 오류 0. 단계형 상호작용(`inquiry-task` 선택형·`ordered-hotspot` 순서형 6단계)은 무작위 클릭으로 완료되지 않는 것이 정상이다. `node --check`, `scripts/01`·`06` 통과.
- 남은 일: 사용자 검토(태극기 괘 방향, 벽화·갑옷·탑·석굴암 등 교과서 이미지 대조), 실기기 확인, 구석기·협동 활동 삽화·유물 연출은 후속.

## 2026-10-21 장면 그림 정확성 수정: 오학습 소지 21건 (D-046)

- 근거: 감사 [`docs/audits/scene_art_accuracy_20261021.md`](./docs/audits/scene_art_accuracy_20261021.md). 사용자 결정: A·B 전부 수정, 아사달은 '전해지는 도읍' 표지로만.
- 국기·지도: 태극기를 국기법 도안으로 다시 그렸다(3:2, 태극 경계 양 끝이 건-곤 대각선 위, 빨강 위·파랑 아래, 건·감·리·곤 괘 모양과 위치). 6·25 발발·정전, 고구려(평양성·국내성·한강), 고조선(요동·한반도 북부) 지도를 북쪽이 위인 실제 경위도 배치로 바꾸고 압록강·두만강·대동강·한강·요하를 넣었다. 군사분계선은 서쪽(한강 하구)이 낮고 동쪽이 높다. 아사달은 지도 밖 표지 상자('전해지는 도읍 (위치는 여러 설)').
- 장면: 학익진(왜선을 감싸는 반원), 울돌목(해남·진도 사이 좁은 물목, 판옥선 13척), 고조선 편 새 장면 `gojoseon-bronze-culture`, 청동기 편 새 장면 `bronze-village`, 신석기 마을(밭을 강 밖으로), 비파형 동검·칠지도·덩이쇠·상감 청자 모양, 통일신라 왕관→교서, 고려·신라 배→네모 돛 전통 배, 해인사→장경판전, 무량수전·발해 궁궐→단층 건물, 고려 건국의 광화문→성벽, 아우내 깃발→태극기, 1930년대 칠판의 한글 삭제, 청운교·백운교, 작은 지도(동검·고인돌 분포, 군사분계선, 의병 여러 지역).
- 데이터: `regular_bronze_age` 2단계·`regular_gojoseon` 3단계 장면 키 변경. 핫스팟 좌표 변경(id·문구·판정 유지): `regular_gojoseon` 1, `regular_three_kingdoms` 2, `regular_korean_war` 1·3, `regular_myeongnyang` 3.
- 엔진: `SceneArt.active()` — 정규 MUD에서만 SVG를 쓴다. deep MUD(같은 장면 키, 다른 핫스팟)는 기존 캔버스 그림으로 돌아간다. 캐시버스터 `20261021-scene4`.
- 검증: `scratch/verify_scene_art.js` 820×1180·390×844 장면 102/102, 콘솔 오류 0, deep MUD 미적용 확인(같은 스크립트에 추가). 좌표를 옮긴 6단계는 정해진 순서로 눌러 각 핫스팟이 자기 대상으로만 인식되는 것을 390×844에서 확인. `node --check`, `scripts/01`·`06` 통과. 태극기는 확대 렌더링으로 괘·태극 배치를 대조.
- 2026-10-21 사용자 확인: 학생 iPad에서 정상 표시, 지도 해안선도 알아볼 수 있음. Pages 배포(`10c49d1`) 반영 완료.

## 2026-10-21 장면 그래픽: 구석기 편 6활동 (D-046)

- 판단: 협동 활동(`cooperative-mud/`)에는 삽화를 넣지 않는다. 글 카드 기반이고 화면을 보여 주지 않고 말로 설명하는 것이 핵심이며, 10/29 공개수업 직전이다. 10/29 관찰에서 몰입 부족 신호가 나오면 재검토.
- 변경: `assets/scenes/paleo-{environment,fire,stone,hunt,community,reflection}.svg`(신규 6), 생성기 `scratch/gen_scene_art_paleo.js`. 구석기는 장면 키 대신 활동 이름으로 그림을 찾는다(`drawPaleoActivity`). 환경 탐색도 공통 렌더러(그림 + 알약 라벨)를 쓴다. 인물 없음, 뗀석기·불·가죽·막집·사냥감만 그렸다(간석기·토기·농경·활 제외).
- 핫스팟 이동(엔진 기본 목록, id·문구 유지): 트인 평야·바람 방향·불씨·가죽·도구와 불, 그리고 주먹도끼 한 개에 맞춘 가장자리·돌의 면·뾰족한 끝. 안내 배너·진행 글자와 겹치지 않게 했다.
- 검증: 6단계 모두 820×1180·390×844에서 확인, 정해진 순서로 누르면 6단계 모두 완료, 콘솔 오류 0. 기존 정규 MUD 102장면 점검·`node --check`·`scripts/01`·`06` 통과. 캐시버스터 `20261021-scene5`. 점검판에 구석기 구역 추가(108장면).
- 남은 일: 사용자 점검판 검토, 실기기 확인.
