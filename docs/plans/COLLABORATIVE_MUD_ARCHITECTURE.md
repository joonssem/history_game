# 협동 실시간 MUD — 아키텍처·데이터 검토안

2026-09-06 · TASK-20260906-01 · 미구현 설계. [전체 계획](./COLLABORATIVE_MUD_PLAN.md)과 [MVP](./COLLABORATIVE_MUD_MVP.md)를 함께 읽는다.

> 배포 배치 후속 검토: [전체 계획 §10](./COLLABORATIVE_MUD_PLAN.md)의 Vercel 통합 운영안을 추가로 검토한다. 아래 별도 저장소/Pages 유지 그림은 최초 제안이며 필수 구조가 아니다. 같은 저장소·두 Vercel 프로젝트에서도 아래 권한·데이터·상태 설계는 적용된다.

## 1. 실행 경계

```text
기존 저장소 → GitHub Pages → 기존 포털 / 정적 협동 v0.1
                                 └─ 후속 연결 링크
신규 별도 저장소 → Vercel → Next.js 학생 화면 / 교사 화면
                                  ↕ 인증된 useQuery / useMutation
                               Convex
                         권한·전이·모둠 결정·DB
```

Next.js는 화면·라우팅·인증 연결을 담당한다. Convex는 모든 공동 상태의 기준이다. 서버 렌더링이 필요 없는 학생 게임은 Client Component를 중심으로 구성한다. 화면 컴포넌트에 별도의 게임 상태 머신이나 WebSocket 서버를 만들지 않는다. Vercel은 프런트 배포이며 Convex 배포와 환경을 별도로 연결한다.

Convex의 `useQuery`는 데이터 변화에 따라 화면을 갱신하고 클라이언트는 연결 복구를 지원한다. 이것이 학생 간 권한, 단계 규칙, 오프라인 공동 결정을 자동 구현해 주는 것은 아니다. [Convex React](https://docs.convex.dev/client/react/overview), [Next.js 연동](https://docs.convex.dev/client/nextjs/app-router/)

Convex를 추천하는 이유는 학생·모둠·교사 화면의 동일 상태 구독과 TypeScript 기반 서버 규칙이 이번 요구에 맞기 때문이다. 기존 Supabase 코드가 없어 마이그레이션 비용은 없다. 대신 운영 서비스 의존성·인증·학교 네트워크를 검증해야 한다. 가격·무료 한도 안에서 운영 가능하다고 이번 문서에서 단정하지 않으며 배포 준비 시 실제 요금과 수업 사용량을 확인한다.

## 2. 소유권·인증

> **2026-09-06 개정 — 입장 방식을 QR 우선으로 바꾼다.** 사용자 확인: 학생들은 QR 입장에 이미 익숙하고, 학교 Wi-Fi는 지금까지 여러 활동에서 문제가 없었다. 아래 "1회 입장 코드 배부" 전제는 QR 흐름으로 대체하며, 원 서술은 기기 교체·복구 경로의 근거로 보존한다. 상세는 §2-1.

회원가입 없는 학생 UX와 인증 없는 서버는 다르다. 학생은 익명 인증 후 수업 코드와 1회 입장 코드를 입력하고, 서버가 해당 수업의 사전 생성된 참가 슬롯에 인증 주체를 묶는다. 화면에 보이는 S01 같은 코드는 비밀번호가 아니다.

### 2-1. QR 입장 흐름 (권장 1안)

```text
교실 앞 화면: QR 1개 (세션 입장 주소 + 수업 코드. 개인 비밀 없음)
  → 학생이 찍고 입장          = 서버가 대기 명단에 익명 슬롯 생성
  → 교사가 편성 확정          = 서버가 모둠·역할 배정 + entryLocked = true
  → 학생이 호를 선택          = 대기 중 선택, 미선택자는 시작 시 서버가 무작위 배정
  → 재접속은 브라우저 토큰으로 복원, 기기 교체만 교사가 개별 처리
```

이 방식의 이점:

- **학생용 일회 코드 배부가 사라진다.** 21장 인쇄·배부·오타 처리에 쓰던 수업 시간이 없어진다.
- **학생 인증이 임계 경로에서 빠진다.** 교사만 로그인하고 학생은 인증 주체를 만들지 않으므로, Convex Auth(beta)의 Anonymous provider 검증이 첫 슬라이스의 차단 요인이 아니게 된다.
- 무단 입장은 `sessions.entryLocked`로 막는다. 교사가 편성을 확정하는 순간 잠근다.

지켜야 할 경계:

- **QR에는 세션 입장 주소와 수업 코드까지만 담는다.** 개인 슬롯 토큰·역할·단서는 담지 않는다. 이래야 "토큰·코드를 URL에 넣지 않는다"는 아래 원칙과 충돌하지 않는다.
- 수업 코드는 관리자 비밀번호가 아니다. QR을 본 사람이 들어올 수는 있어도, 편성 확정 이후에는 들어올 수 없고 들어와도 다른 모둠 자료를 조회할 수 없다.
- 개인 슬롯은 입장 **후** 서버가 부여한다. 학생이 자기 슬롯·역할을 지정하거나 요청할 수 없다.
- 기기 저장소 삭제·기기 교체 학생을 위한 교사 발급 단기 복구 코드는 그대로 유지한다(§8). 배부가 사라지는 것은 평상시 입장 코드이지 복구 경로가 아니다.

### 2-2. 학생 활동명 — 호(號) 방식

학생을 화면에서 구분하는 이름은 `S07` 같은 시스템 코드 대신 **학생이 스스로 고른 호(號)** 로 한다. 목적은 학생이 그 시대 안에 있다고 느끼게 하는 것이다.

**왜 호인가.** 호는 조선 시대에 이름 대신 쓰던 별칭으로, 살던 곳이나 좋아하는 자연물, 삶의 태도에서 따 **본인이 직접 짓는다**. `퇴계`(물러난 시내), `율곡`(밤나무 골), `다산`(차 나는 산)이 모두 자연 풍경 한 장면이다. 학생이 대기 화면에서 스스로 이름을 고르는 이 기능과 형태가 정확히 같고, 이황·이이·정약용은 5학년 교과 내용이라 학습으로 연결된다. 앱은 "옛사람들은 이름 말고 스스로 지은 호로 불렸어요" 한 줄로 안내한다.

**호는 역할과 충돌하지 않는다.** 호는 직업이나 신분을 주장하지 않으므로, 서버가 배정한 역할과 나란히 쓸 수 있다. `다산 정약용`처럼 호와 역할을 병기한다. 따라서 이름 선택과 역할 배정의 시점을 나눌 필요가 없다.

```text
대기 화면   학생이 호를 고른다              "새벽 안개"
교사 시작   서버가 역할을 배정한다           + 농부
표시        새벽 안개 · 농부
```

**대기 시간을 그대로 쓴다.** 21명이 QR로 들어오는 동안이 곧 선택 시간이다. 먼저 들어온 학생은 고를 여유가 있고, 교사가 시작 버튼을 누르는 순간 **미선택자에게는 서버가 남은 호를 무작위로 배정**한다. 늦게 들어온 학생 때문에 수업이 지연되지 않는다. (Blooket의 대기 화면 캐릭터 선택에서 가져온 방식이다.)

#### 공용 호 목록 (24개)

시대·장면과 무관하게 모든 시나리오에서 재사용한다. 시나리오별로 새로 만들지 않는다.

| # | 호 | # | 호 |
|---|---|---|---|
| 1 | 새벽 안개 | 13 | 흐르는 시내 |
| 2 | 달빛 그림자 | 14 | 큰 바위 |
| 3 | 첫눈 발자국 | 15 | 오래된 나무 |
| 4 | 바람 소리 | 16 | 어린 새싹 |
| 5 | 강물 소리 | 17 | 흔들리는 갈대 |
| 6 | 아침 이슬 | 18 | 먼 산울림 |
| 7 | 저녁 노을 | 19 | 지는 해 |
| 8 | 밤하늘 별 | 20 | 뜨는 달 |
| 9 | 산 너머 구름 | 21 | 서리 내린 아침 |
| 10 | 돌 틈의 샘 | 22 | 봄비 |
| 11 | 마른 나뭇가지 | 23 | 여름 소나기 |
| 12 | 이슬 맺힌 풀 | 24 | 겨울 나무 |

24개 > 학급 21명이므로 학급 전체에서 유일한 호를 보장할 수 있다. 더 큰 학급을 지원할 때 목록을 늘린다.

#### 규칙

- **자유 입력을 받지 않는다.** 서버가 제시한 목록에서만 고른다. 놀림·부적절한 이름을 원천 차단한다.
- **자연물·풍경만 사용한다.** 성격·외모·능력(`힘센`, `똑똑한`)과 순위·지각을 암시하는 표현(`가장 늦게 온`)은 넣지 않는다. 실제로 늦게 입장한 학생에게 무작위로 붙으면 놀림이 된다.
- **선착순으로 유일성을 보장한다.** 이미 선택된 호는 목록에서 비활성으로 표시한다. 세션 단위로 판정한다.
- **역할은 서버만 배정한다.** 학생은 호만 고르고 역할을 고르거나 요청할 수 없다. 비대칭 정보 배분의 전제다.
- **교사 화면에는 모둠·번호를 병기한다**(`2모둠 3번 · 새벽 안개 · 농부`). 호만으로는 교사가 실제 학생을 찾을 수 없다.
- **세션 한정이다.** 같은 학생에게 반복 부여해 준식별자로 만들지 않는다. 세션 삭제 시 함께 지운다.

#### 시나리오와의 경계

호 목록은 **앱 공통 상수**이고, 역할 명사는 **시나리오 콘텐츠**다. 고조선은 `농부`·`사냥꾼`·`마을 어른`·`이웃`·`마을 기록자`이고, 다른 시나리오는 자기 역할 이름을 갖는다. 시나리오를 추가할 때 호는 그대로 재사용한다.

첫 검증 후보는 Convex Auth의 교사용 OAuth와 학생용 Anonymous provider다. 교사 로그인은 검증된 인증 주체를 `teachers` 허용 목록에 연결하며, OAuth로 로그인했다는 이유만으로 교사 권한을 주지 않는다. 학생은 계정 생성 화면·이름·이메일 입력 없이 임시 인증만 거친다. Convex Auth는 beta이고 Next.js 서버 인증 지원은 실험 단계이므로, CSR 중심 인증·새로고침·아이패드 복구를 첫 슬라이스에서 확인한 뒤 채택한다. 실패하면 인증 계층만 재선정하며 Next/Convex 전체를 즉시 교체하지 않는다. [Convex Auth 상태](https://docs.convex.dev/auth/convex-auth), [Anonymous provider](https://labs.convex.dev/auth/config/anonymous)

| 주체 | 허용 범위 |
|---|---|
| 수업에 연결되지 않은 방문자 | 공개 소개와 입장 시도. 역할·세션 명단·결과 조회 금지 |
| 참가 학생 | 본인의 역할 정보·선택, 소속 모둠의 공개 단서·단계·법 초안 |
| 다른 모둠 학생 | 자기 모둠 이외 상태·미공개 정보 접근 금지 |
| 수업 소유 교사 | 자기 세션 전체 진행·필요한 개인 응답·개입·종료·삭제 |
| 다른 교사 | 소유하지 않은 세션 접근 금지. 협업 교사 초대는 후속 기능 |

모든 공개 query/mutation에서 인증→세션 소유 또는 참가 관계→모둠 관계→허용 단계 순으로 확인한다. 클라이언트가 전달한 `teacherId`, `playerId`, `roleId`를 그대로 신뢰하지 않는다. Convex는 함수에서 인증 주체를 확인할 수 있으며, 이 앱의 권한 규칙은 직접 구현해야 한다. Supabase RLS 정책을 그대로 적용하는 구조가 아니다. [함수 인증](https://docs.convex.dev/auth/functions-auth)

입장 코드·복구 코드는 충분히 예측하기 어렵게 발급하고 서버에는 해시만 저장한다. 학생에게 전달할 원문은 생성 시 교사에게 한 번 반환한다. 실패 횟수 제한·입장 만료·교사 입장 잠금·재발급을 구현한다. 재발급 시 이전 코드는 무효화한다. 토큰·코드를 URL, 분석 로그, 공개 저장소에 넣지 않는다. 익명 인증 자체의 대량 생성 제한도 확인한다.

기존 공개 `scenario.js`를 브라우저에 통째로 보내고 CSS로 숨기는 방식은 신규 앱의 역할 접근 제어가 아니다. 서버는 현재 참가자에게 허용된 단서만 반환한다. 학생용 조회는 다른 학생의 최초 선택을 최초 판단 완료 전 반환하지 않는다. 공개 저장소 원문이나 옆자리 화면까지 기술로 감출 수는 없다.

## 3. 초안 스키마

다음은 TypeScript 형태의 필드 설계이며 실행 가능한 `schema.ts` 완성본이 아니다. 구현 시 `defineTable`, `v.id`, `v.union`, `v.optional`로 변환한다. 모든 문서는 Convex 기본 `_id`, `_creationTime`을 사용한다. `Timestamp`는 서버 epoch milliseconds, `Id<T>`는 해당 테이블 참조다. 날짜·단계·좌석 범위는 mutation에서도 검증한다.

```ts
type SessionStatus = 'waiting' | 'running' | 'finished' | 'closed';
type Step = 'waiting' | 'role_reveal' | 'private_info' | 'decision_1'
  | 'discussion' | 'new_evidence' | 'decision_2' | 'case_2'
  | 'team_law' | 'awaiting_history' | 'history_reveal' | 'finished';

teachers {
  authSubject: string; enabled: boolean;
  // index by_subject(authSubject)
}

sessions {
  ownerTeacherId: Id<'teachers'>;
  classLabel: string;              // 교사 지정 별칭, 학생 명부 없음
  expectedPlayers: number;         // 기본 사례 21, 상수가 아님
  scenarioId: string; scenarioVersion: string;
  includeCase2: boolean;           // MVP는 false 고정, 다음 버전의 선택 확장
  roomCode: string; status: SessionStatus;
  entryLocked: boolean; paused: boolean;
  historyReleasedAt?: Timestamp;   // 학급 공통 공개 장벽
  startedAt?: Timestamp; finishedAt?: Timestamp;
  expiresAt: Timestamp; deleteAfter: Timestamp;
  groupingVersion: number;
  // indexes by_owner(ownerTeacherId), by_code(roomCode), by_delete_after(deleteAfter)
}

rooms {
  sessionId: Id<'sessions'>; roomNumber: number;
  plannedSize: number;             // 3 | 4 | 5
  participantIds: Id<'players'>[];  // 현재 수업 참여자, 접속 수와 별개
  step: Step; stepVersion: number;
  stepStartedAt: Timestamp; paused: boolean;
  membershipVersion: number;
  releasedClueIds: string[];       // 이탈 등으로 공통 공개한 단서
  editorPlayerId?: Id<'players'>;
  lawDraft?: { targetId: string; responseId: string; conditionId: string };
  lawRevision: number;
  finalLaw?:
    | { mode: 'consensus'; targetId: string; responseId: string;
        conditionId: string; revision: number; membershipVersion: number;
        confirmedPlayerIds: Id<'players'>[]; finalizedAt: Timestamp }
    | { mode: 'teacher_closed_unresolved'; fromStep: Step; reasonCode: string;
        draft?: { targetId: string; responseId: string; conditionId: string };
        finalizedAt: Timestamp };
  // index by_session_number(sessionId, roomNumber)
}

players {
  sessionId: Id<'sessions'>; roomId?: Id<'rooms'>;
  displayCode: string; authSubject?: string;
  displayNameId?: string;          // §2-2 호. 대기 중 학생 선택, 미선택 시 교사 시작 때 서버가 무작위 배정
  displayNameAssignedBy?: 'student' | 'auto';
  joinCodeHash?: string;           // QR 입장(§2-1)에서는 미사용. 기기 교체 복구 코드에만 사용
  joinCodeExpiresAt?: Timestamp;
  seat?: number; roleId?: string; assignedClueIds: string[];
  membershipStatus: 'invited' | 'active' | 'withdrawn';
  joinedAt?: Timestamp; lastSeenAt?: Timestamp;
  roleAcknowledgedAt?: Timestamp;
  privateInfoAcknowledgedAt?: Timestamp;
  newEvidenceAcknowledgedAt?: Timestamp;
  case2AcknowledgedAt?: Timestamp;
  sharedReportedAt?: Timestamp; helpRequestedAt?: Timestamp;
  firstDecision?: { choiceId: string; reasonId: string; submittedAt: Timestamp };
  revisedDecision?: { choiceId: string; reasonId: string; submittedAt: Timestamp };
  lawReview?: { revision: number; membershipVersion: number;
    response: 'agree' | 'discuss'; submittedAt: Timestamp };
  historyReflection?: { comparisonId: string; questionId?: string };
  // indexes by_session_code(sessionId, displayCode), by_room(roomId),
  // by_subject_session(authSubject, sessionId), by_session_join(sessionId, joinCodeHash)
}

teacher_actions {
  sessionId: Id<'sessions'>; teacherId: Id<'teachers'>;
  roomId?: Id<'rooms'>; requestId: string;
  kind: 'start' | 'pause' | 'resume' | 'hint' | 'release_history'
    | 'reissue_entry' | 'withdraw_player' | 'change_editor'
    | 'close_unresolved' | 'close_session';
  templateId?: string; reasonCode?: string;
  at: Timestamp;
  // indexes by_session_time(sessionId, at), by_room_time(roomId, at),
  // by_teacher_request(teacherId, requestId)
}

step_events {
  sessionId: Id<'sessions'>; roomId?: Id<'rooms'>;
  step: Step; kind: 'enter' | 'pause' | 'resume';
  at: Timestamp; stepVersion?: number;
  // indexes by_session_time(sessionId, at), by_room_time(roomId, at)
}
```

`messages` 테이블은 MVP에서 만들지 않는다. 실제 대화와 공유 자기 보고, 개인 판단, 법 초안 확인으로 충분하다. `teachers`는 학생과 구별된 소유권을 위해 필요하고, `step_events`는 단계 체류 시간과 일시정지를 복원하기 위한 최소 추가 테이블이다. Convex Auth를 채택하면 인증 라이브러리 관리 테이블도 별도로 필요하며, 위 게임 테이블만으로 인증 전체를 구현했다고 보지 않는다.

인덱스는 조회 경로이며 고유성 제약 자체가 아니다. 수업 코드 생성, 동일 슬롯 입장, 세션 내 표시 코드 중복은 해당 인덱스로 기존 문서를 읽고 하나의 mutation에서 검사·생성한다. 슬롯 획득은 `authSubject`가 비어 있을 때만 성공하고 동일 주체의 재호출은 같은 슬롯을 반환한다. 방·학생의 `sessionId` 일치도 매번 확인한다. [Convex 인덱스](https://docs.convex.dev/database/reading-data/indexes/)

`connected: boolean`은 저장하지 않는다. `lastSeenAt`으로 최근 접속/연결 확인 필요를 추정하고 화면에서 시간 경과를 반영한다. 연결 끊김을 자동 결석 처리하면 합의 정족수가 변하므로 참석 상태는 교사가 관리한다. `currentDecision` 하나로 개인 최초·수정·모둠 법을 덮어쓰지 않는다. `players.currentStep`도 두지 않고 방 단계와 개인 제출 여부에서 화면을 도출한다.

## 4. 상태와 전이 권한

세션은 수업 생명주기·전체 일시정지·역사 공개 시점, 모둠은 학습 단계, 학생은 읽기 확인·선택·공유·법 확인을 소유한다. `globalStep`과 `rooms.currentStep`을 함께 자유롭게 수정하지 않는다.

| 전이 | 조건과 권한 |
|---|---|
| waiting → role_reveal | 교사가 인원·편성 확정 후 시작. 서버가 역할 배정 고정 |
| role_reveal → private_info | 방의 참여 학생 전원이 역할 확인. 교사가 확인한 이탈자는 명시적 처리 |
| private_info → decision_1 | 전원 읽기 확인. 단서 읽기 자기 보고는 학습 이해의 자동 판정이 아님 |
| decision_1 → discussion | 전원 최초 선택·이유 저장. 저장 전 다른 학생의 선택·개인 정보를 반환하지 않음 |
| discussion → new_evidence | 전원 공유 자기 보고와 진행자 완료 요청. 고정 타이머만으로 통과시키지 않음 |
| new_evidence → decision_2 | 전원 새 자료 확인. 자기 첫 판단과 같은 선택 가능 |
| decision_2 → team_law 또는 case_2 | 전원 수정/유지 판단 저장. MVP는 team_law로 직행, 사건 2는 후속 includeCase2 옵션 |
| case_2 → team_law | 반복 사건 확인·토론 후 완료 요청 |
| team_law → awaiting_history | 현재 법 revision에 참여자 전원의 agree. discuss가 있으면 토론 계속 |
| awaiting_history → history_reveal | 교사 전체 공개. 미완 모둠은 교사가 ‘합의 미완’으로 명시 종료 후 공개 |
| history_reveal → finished | 비교 응답 제출 또는 교사 수업 종료 시 미제출 표시 |

교사 `close_unresolved`는 실행 중인 미완 학습 단계에서 `awaiting_history`로 이동하는 명시적 예외다. 원래 단계·사유·존재하는 초안만 미완 결과로 보존하고 학생의 동의를 합성하지 않는다.

개인 응답과 자료 확인은 위 `players`의 명시적 필드로 관리한다. 무제한 단계 배열보다 첫 시나리오의 작은 명시적 필드를 우선한다.

pause는 별도 bool로 유지해 현재 학습 단계를 잃지 않는다. 실효 pause는 session 또는 room이 paused인 경우다. pause 중 학습 제출·단계 전이는 서버에서 거부하며 재접속·도움 요청은 허용한다. 단계 시간은 서버 이벤트 차이에서 pause 구간을 제외해 집계한다.

교사의 복구·합의 미완 정리·세션 종료 명령은 pause 중에도 허용한다. 역사 전체 공개는 미완 모둠 정리와 pause 해제·공개 기록을 하나의 교사 명령에서 처리하고 이후 학생 응답을 허용한다. 단순 학생 진행 요청으로 pause를 해제할 수 없다.

## 5. 공동 결정·동시 입력

법 작성자 1명은 입력 담당이며 결정권자가 아니다. 다른 학생도 같은 초안을 보고 각자 agree/discuss를 제출한다. 초안 변경 시 `lawRevision`을 증가시켜 이전 동의를 무효화한다. 교착 상태에서는 교사가 도움을 주거나 합의 미완으로 닫는다. 다수결·강한 처벌·가장 빠른 제출을 성공 조건으로 삼지 않는다.

편성 확정 시 서버가 입력·진행 요청 담당을 배정하고 교사가 필요하면 교체한다. E 역할을 항상 입력 담당으로 고정하지 않는다. 최종 법 확정 후 역사 공개 전 인원이 바뀌면 교사가 법 확인 단계를 다시 열고 새 membershipVersion으로 재확인한다. 역사 공개 뒤에는 결과를 소급 변경하지 않는다.

mutation은 권한·세션 상태·pause·예상 stepVersion·lawRevision을 확인하고 상태와 이벤트를 한 트랜잭션에서 기록한다. 초안 수정도 expectedRevision을 검사해 늦은 저장을 거부한다. 첫 판단은 최초 제출 뒤 불변이며 수정 판단은 별도 필드다. 단계 완료 요청은 현재 단계가 이미 진행됐으면 재진행하지 않는다. 교사 명령은 requestId로 중복을 막는다.

Convex mutation의 원자성과 충돌 재시도는 DB 일관성에 도움이 되지만, 학생의 이중 탭이나 오래된 화면의 제출 의미를 판단하는 앱 규칙을 대신하지 않는다. [Convex OCC와 원자성](https://docs.convex.dev/database/advanced/occ)

이탈한 학생은 기존 응답을 보존하고 `withdrawn`으로 표시한다. 방 참여 목록과 membershipVersion을 변경하고 법의 기존 동의는 재확인한다. 그 학생의 미공유 핵심 단서는 공통 카드로 전환한다. 3인 미만이 되면 방을 일시정지하고 교사가 합치기 대신 정적 버전으로 마무리할 수 있게 한다. 이미 시작한 모둠을 자동으로 섞거나 새 참가자가 이전 학생 답안을 소유하게 하지 않는다.

## 6. query/mutation API 경계

| API 후보 | 반환·변경 범위 |
|---|---|
| `sessions.create`, `grouping.preview/commit` | 소유 교사만 세션·가명 슬롯·크기 배열·배정을 생성/확정 |
| `players.join` | roomCode+일회 코드 검증, 익명 인증 주체를 슬롯에 원자적으로 연결 |
| `players.getMyView` | 본인 역할·허용된 단서·개인 응답·방의 공개 정보만 |
| `rooms.getTeamView` | 같은 방의 공개 참여 상태·단계·법 초안만. 다른 역할 비밀 제외 |
| `players.submitFirst/submitRevised/reportShared/reviewLaw` | 본인 상태만, 해당 단계에서 갱신 |
| `rooms.saveLawDraft/advance` | 서버가 편집 권한과 준비 상태·버전을 검증 |
| `teacher.getDashboard` | 소유 세션의 모둠별 집계, 필요 시 한 모둠 개인 응답 펼치기 |
| `teacher.intervene` | 허용된 명령만 처리, 결과와 teacher_actions 동시 기록 |

모든 학생이 전체 학급 데이터를 구독하지 않는다. 학생별 뷰/모둠별 뷰/교사용 세션 집계를 나눈다. 첫 버전은 21명의 작은 집계부터 시작하고 아직 불필요한 통계 캐시 테이블은 만들지 않는다.

## 7. 파일 구조 제안

아래 디렉터리는 신규 별도 저장소의 제안이며 이번 작업에서 생성하지 않는다.

```text
collaborative-history-mud/
  app/
    page.tsx
    join/page.tsx
    play/[sessionId]/page.tsx
    teacher/page.tsx
    teacher/sessions/new/page.tsx
    teacher/sessions/[sessionId]/page.tsx
  components/
    student/          # 역할·판단·공유·법 확인·역사 비교
    teacher/          # 편성표·진행 카드·개입·결과
    common/           # 상태 알림·터치 버튼
  lib/
    game/             # 단계 정의·표시 타입, 작은 순수 함수
    grouping.ts       # 3/4/5인 크기 후보·무작위 편성
  convex/
    schema.ts
    auth.ts
    sessions.ts
    players.ts
    rooms.ts
    teacher.ts
    permissions.ts
    game/             # 서버 전이·합의·인원 변경 규칙
    scenarios/
      gojoseon.ts     # 버전 고정 콘텐츠·역할별 단서·공개 조건
  tests/              # 권한·동시 입력·상태 전이·브라우저
  public/             # 비밀 단서와 정답 미리보기는 두지 않음
  docs/               # 원 설계 링크·신규 앱 구현 기록
  package.json
```

시나리오 ID와 version을 세션 생성 시 고정하고 수업 중 배포가 기존 버전 내용을 바꾸지 않게 한다. `convex/scenarios` 콘텐츠를 client component에서 import하지 않는다. UI는 서버에서 반환한 표시용 DTO만 사용한다. 한산도·위화도는 실제 두 번째 시나리오 요구가 생길 때 공통 콘텐츠 계약을 추출한다. 범용 multiplayer engine 패키지는 지금 만들지 않는다.

## 8. 복구·운영·보관

연결이 끊기면 전송 대기와 서버 저장 완료를 구분한다. 최종 공동 결정·다음 단계는 서버 응답 전 완료 표시하지 않는다. 오래된 오프라인 제출은 버전 검사로 거부하고 현재 단계로 복구한다. localStorage는 필요하면 미제출 초안 캐시로만 사용하며 공동 상태를 덮어쓰는 기준으로 삼지 않는다.

새로고침은 같은 인증 주체의 슬롯·역할·응답 복원, 저장소 삭제/기기 교체는 교사가 단기 복구 코드를 발급해 기존 슬롯을 새 주체로 재연결한다. 이전 주체 권한은 즉시 철회한다. 첫 파일럿은 같은 슬롯에서 마지막으로 승인한 주체만 허용한다. 실시간 서비스 장애가 지속되면 **같은 콘텐츠의 정적 버전으로 전환한다**(GitHub Pages, 서버 불필요). 학생은 같은 기기에서 계속 진행하고, 온라인 상태가 자동 병합된다고 약속하지 않는다. 종이 카드는 사용하지 않는다 — 기기 화면이 곧 역할 카드이며, 정적 버전이 더 빠르고 준비물이 없는 폴백이다.

보관 기본 제안은 수업 후 7일 자동 삭제와 교사의 즉시 삭제다. 인터뷰에서 확정 전 운영 설정으로 고정하지 않는다. 삭제 작업은 세션 하위 rooms/players/actions/events와 입장·복구 자격을 함께 제거하고 세션 전용 익명 인증 잔여 데이터도 정리한다. 인증·호스팅 제공자의 운영 로그·백업 보관은 별도 확인한다. 후속 연구용 내보내기·학생 장기 추적·다른 교사 초대는 MVP 밖이다.

개발·미리보기·실수업 Convex 환경을 분리하고 Vercel의 각 환경 변수도 대응시킨다. 배포 키는 서버/CI 비밀로 보관한다. 공동 수업 상태의 인터넷 의존성은 기존 정적 앱과 다르며 실제 아이패드·학교 Wi-Fi 검증을 공개 수업의 완료 조건으로 둔다.
