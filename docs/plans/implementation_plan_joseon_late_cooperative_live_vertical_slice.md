# 조선 후기 실시간 협동 MUD 공개수업 수직 슬라이스 구현 계획

- 작성일: 2026-09-15
- 작업: `TASK-20260915-06`
- 기준 커밋: `f4c4c0d3`
- 상태: `제안·후속 활동` — 고려 초기 첫 실제 활동 검증과 사용자 승인 전 코드·시나리오 데이터 수정 금지
- 목표일: 2026-10-28 공개수업, 기술 Go/No-go 판정일 2026-10-22
- 원문·일정: [`INBOX.md`](../../INBOX.md)의 “2026-09-15 — 10월 28일 공개수업 역산”
- 선행 계획: [`고려 초기 실시간 협동 MUD 첫 활동 구현 계획`](./implementation_plan_early_goryeo_cooperative_live_first_activity.md)
- 구현 소유자: **Claude** — Codex는 계획·읽기 전용 감사·통합 판정만 담당

## 1. 구현 목표

4인 모둠을 기본으로 학생마다 서로 다른 조선 후기 자료를 제공한다. 학생은 친구 자료를 보기 전에 자기 기기에서 최초 판단을 남기고, 말로 자료를 공유한 뒤 모둠의 공동 해석을 `대상–근거–한계` 구조로 만든다. 현재 모둠원이 같은 초안을 모두 확인해야 완료되며, 다수결·빠른 탭·정답 맞히기로는 다음 단계가 열리지 않는다.

실시간 앱은 **모둠 안의 협동**까지만 담당한다. 모둠 산출물은 개인정보 없는 정해진 문자열로 복사해 `sticky-wall`에 사람이 붙인다. 다른 모둠의 질문·반론과 수정 이력은 `sticky-wall`에서만 다루고, 두 서비스 사이에 계정·API·세션 ID·학생 식별자를 연결하지 않는다.

### 한 문장 학습 목표

> 장시·화폐·생산과 생활 변화가 누구에게 어떤 영향을 주었는지 서로 다른 자료를 근거로 설명하고, 자료만으로 단정할 수 없는 범위를 밝힌다.

### 공개수업 핵심 흐름

```text
QR 입장·호 선택
  → 모둠 미리보기·확정
  → 역할별 비공개 자료 확인
  → 개인 최초 판단(기기 sessionStorage만)
  → 한 사람씩 말로 자료 공유·공유 완료 표시
  → 모둠 공동 해석 초안(대상·주장·근거 2개 이상·한계)
  → 현재 초안에 전원 확인
  → sticky-wall용 문자열 복사
  → 다른 모둠 질문·반론·수정(sticky-wall에서 수행)
  → 발표·교사 종료·세션 삭제
```

## 2. 현재 기준선과 필요한 최소 변화

| 현재 `apps/cooperative-live` 상태 | 공개수업에 필요한 변화 |
|---|---|
| `shared/scenario.ts`의 `SCENARIO_ID`·역할·단계가 고조선 한 편으로 고정 | 선행 고려 활동에서 버전 있는 시나리오 레지스트리로 분리하고, 이 계획에서는 조선 후기 한 편을 추가 |
| `sessions.create`가 시나리오 입력 없이 고조선 ID를 저장 | 선행 고려 활동에서 교사 선택·서버 ID·버전 검증을 구현하고, 이 계획에서는 조선 후기 정의를 같은 계약에 연결 |
| 학생 `advance`가 개인별 다음 단계 탭만 기록 | 최초 판단 제출·공유 보고·초안 저장·전원 확인을 목적별 mutation과 서버 관문으로 분리 |
| `rooms`는 모둠 번호·최저 단계만 저장 | 공동 초안 revision, 편집 담당, 확인 수, 도움 요청을 수업 중에만 저장 |
| 교사 개입은 고정 힌트/심화 2종뿐 | 시나리오별 힌트, pause/resume, 도움 요청 확인·해제를 추가 |
| 공동 산출물·외부 활동 인계 없음 | 별칭·세션 식별자 없는 sticky-wall 복사 문자열 제공 |
| 21명 함수 회귀는 고조선 선형 진행 일부만 확인 | 고려 첫 활동에서 공통 상태 회귀를 확장한 뒤 고조선·고려·조선 후기 3개 시나리오 회귀로 확대 |

이번 작업은 현재 입장 보안, Auth0 교사 권한, 3~24명 균형 편성, 미리보기·재섞기, 세션 종료 삭제를 다시 만들지 않는다. 기존 동작을 보존하고 시나리오 선택과 수업 핵심 루프만 확장한다.

## 3. 범위

### 포함

1. 고조선·고려 초기·조선 후기 세 시나리오를 선택할 수 있는 교사 세션 생성
2. 세션 생성 시 `scenarioId`와 `scenarioVersion` 고정
3. 모둠 크기 3·4·5명에 맞는 역할·공통 자료 배치
4. 역할 자료 확인 → 개인 최초 판단 → 말로 공유 → 공동 해석 → 전원 확인
5. 교사 진행판의 단계·제출 수·공유 수·확인 수·도움 요청 표시
6. 세션 전체 pause/resume, 모둠 도움 요청·교사 해제
7. sticky-wall에 수동 복사할 모둠 산출물 포맷
8. 21명 가상 회귀와 실제 4개 독립 브라우저 리허설
9. 같은 콘텐츠를 사용하는 정적 협동 MUD 폴백

### 제외

- `sticky-wall` 계정·API·DB 연동 또는 자동 게시
- 학생 이름·학번·이메일·명단 업로드·자유 채팅
- 개인 선택·이유의 서버 저장 또는 교사 열람
- 다른 모둠 산출물의 실시간 피드
- 점수·순위·정답률·AI 자동 평가
- 음성 녹음, 화면 캡처, 장기 학습 이력
- 기존 Vanilla JS 개인 MUD와 실시간 세션의 상태 통합
- 고려 초기와 조선 후기 외의 신규 실시간 시나리오 추가
- `P1-COLLAB-PRIVACY` 해제 전 실제 학생 운영·Production 전환

## 4. 시나리오 콘텐츠 계약

Claude가 고려 초기 첫 활동에서 구현·검증한 계약을 유지하면서 조선 후기 문안과 검증 fixture를 같은 구현 묶음으로 연결한다. 역할명·사료 문장·선택지·역사적 해설은 출처 검토표와 함께 확정한다. 전체 역할 본문은 `convex/scenarios/*`의 서버 전용 레지스트리에 두며 Client Component는 이를 import하지 않는다. 클라이언트에는 시나리오 ID·제목·version 같은 공개 메타데이터와 서버가 권한에 맞춰 만든 DTO만 전달한다. Codex는 계약이나 문안을 직접 수정하지 않고 결과를 읽기 전용으로 감사한다.

```ts
type CooperativeScenario = {
  id: string;
  version: number;
  title: string;
  lessonLabel: string;
  commonPrompt: string;
  roles: Array<{
    id: string;
    icon: string;
    name: string;
    evidenceId: string;
    privateInfo: string;
    sharePrompt: string;
    interest: string;
  }>;
  groupVariants: {
    3: { roleIds: [string, string, string]; sharedEvidenceIds: string[] };
    4: { roleIds: [string, string, string, string]; sharedEvidenceIds: string[] };
    5: { roleIds: [string, string, string, string, string]; sharedEvidenceIds: string[] };
  };
  firstJudgment: {
    prompt: string;
    choices: Array<{ id: string; text: string }>;
    reasonPrompt: string;
  };
  synthesis: {
    targetOptions: Array<{ id: string; text: string }>;
    claimPrompt: string;
    evidenceOptions: Array<{ id: string; shortLabel: string; roleId?: string }>;
    minEvidence: number;
    minDistinctRoleSources: number;
    limitOptions: Array<{ id: string; text: string }>;
    claimMaxLength: number;
  };
  interventions: { hint: string; deepen: string };
  stickyWall: { heading: string; templateVersion: number };
};
```

### 계약 관문

- `id`는 레지스트리에 유일하고 세션에서 클라이언트가 임의 문자열로 바꿀 수 없다.
- `(id, version)`으로 정확한 정의를 찾으며, 활성 세션이 참조하는 version은 세션 TTL이 끝날 때까지 레지스트리에서 제거하지 않는다. 찾지 못하면 최신판으로 조용히 대체하지 않고 명시적으로 중단한다.
- 모든 `roleIds`·`evidenceIds`는 실제 항목을 참조한다.
- 3·4·5인 모두 참여자마다 고유하게 설명할 자료가 하나 이상 있다.
- 3인 변형은 한 학생에게 두 역할을 겸임시키지 않는다. 빠진 관점은 짧은 공통 자료로 보충한다.
- 5인 변형의 다섯째 역할도 고유 근거와 최초 판단·발화·초안 확인을 수행한다. 단순 서기 역할은 금지한다.
- 4인 기본안의 역할 후보는 농민, 보부상, 장시 주민·수공업자, 기록관이다. 명칭·근거·역사 서술은 Claude 검토 뒤 확정한다.
- 공동 해석은 서로 다른 역할 출처의 근거를 2개 이상 요구한다. 한 역할의 자료만으로는 완료되지 않는다.
- `limitOptions`에는 “이 자료만으로 알 수 없는 것”을 고르는 항목이 반드시 있다.
- 콘텐츠 패킷에는 학생 화면 문안과 별도로 각 주장 범위·출처 URL·열람일·직접 인용 여부를 기록한다.

## 5. 서버 상태와 관문

### 세션

기존 `lobby → preview → active`를 유지한다. `active`와 별도로 `pausedAt?: number`를 두어 일시정지 때문에 현재 학습 단계를 잃지 않게 한다.

- `pause`: 소유 교사만 가능. 학생의 학습 제출·초안 수정·확인은 거부한다.
- `resume`: 소유 교사만 가능. 현재 room 단계와 초안 revision을 그대로 유지한다.
- pause 중에도 학생 조회·재접속·도움 요청과 교사의 종료·삭제는 허용한다.
- 교사 종료가 최우선이며, pause 상태에서도 모든 세션 하위 데이터를 삭제한다.

### 학생·모둠 학습 단계

```text
role → first → share → synthesis → handoff → finished
```

| 전이 | 서버 관문 |
|---|---|
| `role → first` | 본인 역할 자료 확인 시각 기록 |
| `first → share` | 선택·이유는 기기에만 저장하고 서버에는 `firstSubmittedAt`만 기록 |
| `share → synthesis` | 모든 현재 모둠원이 `sharedReportedAt`을 기록해야 모둠 관문 개방 |
| `synthesis → handoff` | 유효한 공동 초안 revision에 모든 현재 모둠원이 `agree`; 한 명이라도 `discuss`이면 유지 |
| `handoff → finished` | sticky-wall 문자열 복사 확인 또는 교사 종료 |

기존 범용 `advance` 한 번으로 모든 의미를 처리하지 않는다. 구현 시 `confirmRoleRead`, `submitFirst`, `reportShared`, `saveTeamDraft`, `reviewTeamDraft`, `confirmHandoff`처럼 의도가 드러나는 mutation으로 분리한다. 각 함수는 인증 → 세션 참가 → 모둠 → pause → 현재 단계 → 예상 revision 순으로 검증한다.

### 공동 초안

`rooms`에는 수업 중에만 다음 최소 공동 상태를 둔다.

- `editorPlayerId`: 입력 담당일 뿐 결정권자가 아니다. 역사 역할과 별도로 배정한다.
- `draftRevision`: 초안 저장마다 증가한다.
- `targetId`, `claimText`, `evidenceIds`, `limitId`: 공동 산출물로 서버 저장 허용.
- `helpRequestedAt`: 도움 요청 여부와 시각만 저장. 자유 입력 사유는 받지 않는다.
- 각 `player`의 `reviewRevision`, `reviewResponse: agree | discuss`.

초안이 바뀌면 이전 revision의 전원 확인은 자동으로 무효가 된다. 서버는 시나리오에 없는 대상·근거·한계 ID, 글자 수 초과, 근거 수 부족, 서로 다른 역할 출처 부족을 거부한다. 편집자가 새로고침해도 현재 초안과 revision을 서버에서 복구한다.

## 6. 화면 계획

### 교사 화면

1. 새 활동 생성 전에 시나리오 카드에서 고조선 또는 조선 후기를 선택한다.
2. 기존 입장·QR·호·모둠 미리보기·재섞기 흐름은 그대로 유지한다.
3. 진행판은 모둠별로 `현재 단계 / 최초 판단 n/N / 공유 n/N / 초안 revision / 확인 n/N / 도움 요청`만 보여 준다.
4. 개인 선택·이유와 역할별 비공개 자료 원문은 교사 진행판에 표시하지 않는다.
5. 전체 `일시정지`·`계속하기`, 모둠 `힌트`·`심화 질문`·`도움 해결`을 제공한다.
6. 종료 전 “sticky-wall 복사 완료 모둠 수”와 “종료 즉시 서버·기기 기록 삭제” 경고를 보여 준다.

### 학생 화면

1. 역할 화면은 자기 역할 자료만 반환하고 다른 역할의 원문을 내려주지 않는다.
2. 최초 판단의 선택·이유는 현재 `sessionStorage`에만 둔다. 빈 선택·빈 이유는 제출 표시를 만들지 않는다.
3. 공유 화면은 자기 자료의 말하기 문장과 `모둠에 설명했어요`만 제공한다. 다른 학생의 비밀 카드를 화면에 합치지 않는다.
4. 공동 해석 화면은 현재 초안을 모두가 보되 편집 담당만 저장할 수 있다. 나머지는 같은 revision에 `확인` 또는 `더 이야기 필요`를 선택한다.
5. pause 중에는 읽기와 도움 요청만 가능하고 저장 버튼은 비활성화하며 이유를 안내한다.
6. 완료 화면은 개인 최초 판단을 기기에서 다시 보여 줄 수 있지만 서버 응답과 결합하지 않는다.

### sticky-wall 인계 문자열

```text
[조선 후기 협동 탐구 · 3모둠]
처음 해석: …
근거: ① … ② …
자료의 한계: …
질문해 주세요: 누구에게? 어떤 근거로? 어디까지 말할 수 있나요?
```

- 학생 호, 역할 배정, 세션 ID, 수업 코드, 토큰은 포함하지 않는다.
- 문자열은 현재 공동 초안에서 클라이언트가 파생하며 별도 테이블에 중복 저장하지 않는다.
- `sticky-wall`의 게시물 ID나 수정 결과를 실시간 앱으로 되가져오지 않는다.
- `sticky-wall` 사용이 막히면 같은 문자열을 교사 화면에 띄워 발표·화이트보드·정적 자료로 이어 간다.

## 7. 파일 경계

### Claude — 구현·콘텐츠 단일 쓰기 소유자

| 경로 | 변경 목적 |
|---|---|
| `apps/cooperative-live/**` | 고려 활동에서 검증한 계약 유지, 조선 후기 시나리오·화면·상태·테스트·운영 문서 추가 |
| `cooperative-mud/joseon-late-market/**`, 필요 시 `cooperative-mud/index.html` | 같은 수업안의 서버 없는 정적 폴백 |
| `docs/handoff/claude_joseon_late_live_result.md` | 콘텐츠 출처 검토, 구현 결과, 검증 명령, 제한 사항 |
| `walkthrough.md` | 구현 완료 시 기술 기록. 이때 Codex는 수정하지 않음 |

Claude는 이 묶음에서 기존 `data/mud/*.json`, `js/app.js`, `js/mudEngine.js`, `js/mudSimulators.js`, `js/encyclopedia.js`를 수정하지 않는다. 기존 개인 MUD에서 발견한 문제는 현재 수직 슬라이스에 섞지 않고 별도 BACKLOG 후보와 재현 정보로 인계한다.

### Codex — 계획·읽기 전용 감사·통합 판정

Codex는 Claude 구현 claim이 열린 동안 `apps/cooperative-live/**`, 조선 후기 정적 폴백, Claude 결과 문서, `walkthrough.md`를 수정하지 않는다. 구현 커밋 뒤 화면·상태·권한·회귀·교육적 문장을 읽기 전용으로 점검하고, 문제는 `docs/audits/joseon_late_cooperative_live_review.md`에 파일·재현 절차·심각도·수용 기준으로 기록한다.

### 인계·병합 규칙

1. Claude는 고려 첫 활동에 사용한 전용 branch/worktree를 이어 쓰거나, 그 통합 커밋에서 새 전용 worktree를 만든다. 공유 폴더에서 브랜치를 전환하지 않는다.
2. 시작 전에 브랜치·기준 SHA·`git status --short`·DOING claim을 확인한다.
3. Claude는 콘텐츠·앱·테스트·walkthrough를 한 구현 브랜치에 고정하고 `READY_FOR_AUDIT` SHA를 전달한다.
4. Codex는 해당 SHA를 읽기 전용으로 감사한다. 문안이나 코드를 직접 고치지 않고 Claude에게 수정 항목을 되돌린다.
5. 통합 역할은 감사 통과 뒤 전체 회귀와 Go/No-go를 확인하고 main에 병합한다.

## 8. 구현 작업 묶음

### T1 — 고려 첫 활동 계약 재검증·조선 후기 등록 (Claude, 고려 시험 통과 뒤)

- 고려 첫 활동에서 만든 공통 타입·공개 카탈로그·서버 전용 검증·레지스트리를 변경 없이 재사용할 수 있는지 먼저 확인한다.
- 조선 후기 시나리오 정의와 version을 같은 허용 목록에 추가한다.
- 교사 선택 화면에 조선 후기를 추가한다.
- 고조선·고려의 입장·편성·역할·단계·종료 삭제 테스트가 그대로 통과해야 한다.

완료 기준: 잘못된 ID는 세션을 만들지 못하고, 활성 세션의 ID·version 정의는 TTL 동안 유지되며, 알 수 없는 version은 최신판으로 바꾸지 않고 명시적으로 중단한다. production client bundle에는 역할별 비공개 본문 전체가 포함되지 않는다.

### C1 — 조선 후기 콘텐츠 패킷 (Claude, T1과 같은 구현 묶음)

- 3·4·5인 역할 배치와 공통 자료를 작성한다.
- 역할마다 고유 근거, 말하기 문장, 이해관계를 제공한다.
- 최초 판단 문항, 공동 대상 옵션, 근거 짧은 라벨, 자료 한계 옵션, 힌트·심화 질문을 작성한다.
- 장시·화폐·농업·수공업·생활 변화의 서술을 공식·신뢰 가능한 출처로 대조하고 “모든 사람”, “전국”, “즉시” 같은 과잉 단정을 감사한다.

완료 기준: 콘텐츠 패킷과 출처 검토가 서로 대응하며, 런타임 fixture까지 Claude 소유 브랜치 안에서 일치한다. Codex가 역사 문장을 새로 만들거나 앱에 옮길 필요가 없다.

### T2 — 조선 후기 역할·최초 판단 수직 관통 (Claude, 10/2까지)

- 승인된 C1 문안을 런타임 시나리오로 연결한다.
- 4개 독립 브라우저에서 서로 다른 역할 자료만 보이는지 확인한다.
- 최초 판단과 이유는 기기에서만 보존하고 서버에는 제출 시각만 남긴다.
- 3·4·5인 변형과 역할 고유성을 자동 검증한다.

완료 기준: 다른 역할의 정보 없이는 공동 답안을 완성할 수 없고, 한 모둠이 10분 안에 역할 자료를 한 번씩 말할 수 있다.

### T3 — 공동 해석·전원 확인·sticky-wall 인계 (Claude, 10/9까지)

- `rooms.ts`와 공동 초안 revision을 구현한다.
- 서로 다른 역할 출처 근거 2개 이상과 자료 한계를 필수로 한다.
- 전원 같은 revision 확인 전에는 handoff를 열지 않는다.
- 별칭 없는 복사 문자열과 정적 대체 표시를 추가한다.

완료 기준: 다수결·편집자 단독 저장·오래된 revision 확인으로 완료되지 않으며, 초안 수정 시 기존 확인이 무효가 된다.

### T4 — 교사 제어·복구·도움 요청 (Claude, 10/16까지)

- 세션 pause/resume과 서버 mutation 차단을 구현한다.
- 모둠 도움 요청·해제, 단계별 n/N 진행판을 구현한다.
- 새로고침·탭 복귀·Wi-Fi 재접속에서 역할·공동 초안·확인 상태가 복구되는지 확인한다.
- 세션 종료·TTL 정리에서 신규 필드·행도 모두 삭제되는지 검증한다.

완료 기준: pause 중 중복 탭·오래된 화면 제출이 상태를 바꾸지 않고, 종료 뒤 기존 토큰으로 조회·재입장할 수 없다.

### T5 — 정적 폴백·운영 문서 (Claude, 10/19까지)

- 승인된 같은 콘텐츠로 `cooperative-mud/joseon-late-market/` 정적 버전을 만든다.
- 정적 버전도 역할 → 최초 판단 → 공유 → 공동 문장 → sticky-wall/화이트보드 인계 순서를 유지한다.
- 실시간 장애 시 어느 시점에서 정적으로 전환할지 교사 체크리스트에 기록한다.

완료 기준: 서버·로그인 없이 태블릿에서 같은 학습 목표를 끝낼 수 있고, 실시간 복구가 될 것처럼 오해시키지 않는다.

### T6 — 리허설·동결·Go/No-go (통합, 10/22 판정·10/27 동결)

- 4~8명 소규모 실제 기기 리허설 후 21명 모의 운영을 실시한다.
- 학교망, QR 거리, 세로·가로 아이패드, 새로고침, 교사 pause, sticky-wall 병행, 정적 전환을 실측한다.
- 10/22 Go/No-go 판정 뒤 실시간 또는 정적 경로를 고정하고 10/23부터 새 기능을 금지한다.

완료 기준은 §10을 모두 만족하는 것이다. 하나라도 실패하면 공개수업은 정적 폴백을 사용한다.

## 9. 검증 계획

### 자동 검증

`apps/cooperative-live`에서 다음을 실행한다.

```powershell
npm run check
```

추가할 테스트 범위:

- 시나리오 계약: ID/version 유일성, 참조 무결성, 3/4/5인 역할·근거 완결성
- 권한: 다른 교사 세션, 다른 모둠 초안, 다른 학생 역할 조회·수정 거부
- 개인정보: 학생 DTO와 교사 dashboard에 개인 선택·이유가 없음
- 번들 경계: Client Component가 `convex/scenarios/*`를 import하지 않고 production client bundle에 전체 비공개 역할 본문이 없음
- 상태: 모든 관문, pause/resume, 잘못된 단계, 오래된 revision, 이중 탭
- 동시성: 두 편집 저장 충돌, 초안 변경과 확인 경합, 전원 마지막 확인 경합
- 복구: 학생·교사 새로고침, 기존 토큰 복원, 만료·종료 토큰 거부
- 21명: 4·4·4·4·5 편성, 각 모둠 역할 유일성, 공동 초안·확인, 도움·개입, 종료 삭제
- 고조선 회귀: 기존 시나리오 생성·입장·미리보기·진행·종료 삭제
- 로그 금지: 수업 코드·토큰·호·역할 비공개 자료·개인 응답을 console에 남기지 않음

루트 정적 폴백 변경 뒤에는 저장소의 실제 정적 검증도 실행한다.

```powershell
python scripts/01_validate_game_data.py
python scripts/06_validate_static_assets.py
node --check cooperative-mud/episode.js
node --check cooperative-mud/joseon-late-market/scenario.js
```

### 수동 브라우저 검증

- 교사 1 + 학생 4개의 완전히 분리된 브라우저 컨텍스트
- 각 학생에게 자기 역할만 노출되고 URL·개발자 콘솔에 토큰·다른 역할 자료가 나타나지 않음
- 최초 판단 후 새로고침해도 자기 탭에서만 복원
- 한 학생 미공유 시 synthesis 잠김
- 한 학생 `더 이야기 필요` 시 handoff 잠김
- 초안 수정 후 모든 확인 수가 새 revision 기준으로 초기화
- pause 중 읽기·도움 요청만 가능, resume 뒤 정확한 단계 복귀
- sticky-wall 문자열에 모둠 번호 외 식별 정보 없음
- 375px 모바일과 아이패드 세로·가로에서 주요 버튼 44px 이상, 가로 스크롤 없음
- 종료 뒤 학생 탭의 `cooperative-live:` 키 삭제

## 10. 공개수업 Go/No-go

10월 22일에 아래를 모두 통과해야 실시간 버전을 사용한다.

1. `P1-COLLAB-PRIVACY`의 학교 개인정보·국외 처리 게이트 해제
2. 실제 학교망에서 교사 1대+학생 21대의 입장·실시간 갱신 성공
3. 3/4/5인 편성에서 역할·고유 근거 누락 없음
4. 역할 자료 확인부터 sticky-wall 복사까지 목표 10분 안에 완료
5. 참여자 전원이 자기 자료를 한 번 이상 설명
6. 교사 pause/resume·도움 요청·진행판 동작
7. 새로고침·Wi-Fi 재접속 복구와 종료 삭제 동작
8. 조선 후기 내용 감사와 5학년 가독성 승인
9. sticky-wall 질문·수정 8~10분 운영 성공, 두 서비스 무연동 확인
10. 정적 폴백이 같은 수업안으로 즉시 전환 가능

하나라도 미통과면 실시간 기능을 부분적으로 섞지 않고 정적 협동 MUD와 수동 sticky-wall 흐름으로 전환한다. 10월 23일부터는 치명적 P0 수정 외 기능을 동결한다.

## 11. 완료 시 문서 갱신

- 계획 승인·착수: 이 문서와 `BACKLOG.md` 상태를 `진행 중`으로 변경
- 각 리허설: `EXPERIMENTS.md`에 관찰 → 가설 → 작은 실험 → 결과 → 다음 결정 형식으로 기록
- 구현·검증 완료: `apps/cooperative-live/README.md`, `project_context.md`, `docs/plans/README.md`, `walkthrough.md` 갱신
- 공개수업 종료: 실제 관찰 결과와 다음 결정을 `EXPERIMENTS.md`에 기록하고, 완료된 backlog 항목은 `BACKLOG.md`에서 제거하거나 완료 이력 문서로 이동

## 12. 승인 요청 범위

이 계획 승인 시 승인되는 것은 T1~T5의 파일 범위와 10월 22일 Go/No-go 검증까지다. 실제 학생 접속·Production 사용은 계획 승인만으로 허용되지 않으며 `P1-COLLAB-PRIVACY`를 별도로 해제해야 한다. 조선 후기 역할·사료의 최종 문안도 C1 콘텐츠 감사 완료 전에는 승인된 것으로 보지 않는다.
