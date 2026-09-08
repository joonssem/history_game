# 실시간 협동 MUD 모둠 배정 미리보기·재섞기 계획

- 작성일: 2026-09-08
- 작업: TASK-20260908-03
- 상태: `completed` — 사용자 진행 승인 완료(2026-09-08), 구현·검증 완료
- 대상: `apps/cooperative-live`
- 배경: [`EXP-007`](../../EXPERIMENTS.md)(2026-09-08, 1단원 7차시)에서 "친한 학생끼리 묶이면 분위기를 저해한다"는 관찰이 나왔다. 정적 협동 MUD는 교사가 모둠·번호를 직접 부여해 교실에서 바로 피할 수 있지만, `apps/cooperative-live`는 활동마다 무작위로 모둠을 배정한다(D-023). [`BACKLOG.md`](../../BACKLOG.md) `P2-COLLAB-08`로 등록돼 있다.

## 1. 문제

`convex/sessions.ts`의 `start` 뮤테이션이 셔플과 활성화를 한 트랜잭션에서 동시에 처리한다.

```
교사가 "활동 시작" 클릭
  → assignGroups()로 무작위 셔플                      (sessions.ts:157)
  → 그 결과를 players에 즉시 patch                     (sessions.ts:169)
  → session.status = "active", 학생 화면이 role 단계로 전환 (sessions.ts:173, 188)
```

교사가 배정 결과를 보거나 다시 섞을 수 있는 중간 지점이 없다. 셔플 결과가 나오는 순간 이미 학생 화면에 반영돼 있어 되돌릴 방법이 없다.

## 2. 설계 원칙 — 기존 개인정보 결정과의 관계

- **D-023(활동마다 새 식별자, 이전 활동과 연결 금지)을 그대로 유지한다.** 이 계획은 "무작위 배정을 없애는 것"이 아니라 "무작위 배정 결과를 활성화 전에 보고 다시 섞을 수 있게" 하는 것이다.
- **새로운 영구 식별자·이름·학번을 저장하지 않는다.** 교사가 미리보기에서 보는 것은 이미 학생이 로비에서 스스로 고른 호(alias)와 새로 배정된 모둠 번호뿐이다. "이 호와 저 호를 갈라놓아라" 같은 규칙을 서버에 저장하지 않는다 — 갈라놓을지 판단은 교사가 교실에서 직접 보고 그 자리에서 다시 섞기로 해결한다.
- **D-021(개인 판단 비저장)에는 영향 없음.** 이 계획은 배정 단계(로비→활성)에서만 동작하고, 활동 시작 뒤 개인 판단·이유 처리 방식은 건드리지 않는다.
- 새 테이블·새 필드를 최소화한다. `sessions.status`에 값 하나(`"preview"`)만 추가하고, 배정 결과는 기존 `players.groupNumber`/`players.roleId` 필드에 먼저 쓰는 방식으로 처리한다.

## 3. 상태 머신 변경

```
lobby --(모둠 미리보기)--> preview --(이 배정으로 시작)--> active
  ^                           |
  └────(취소하고 대기로)──────┘
              |
        (다시 섞기: preview 안에서 반복 가능, 상태 전환 없음)
```

- **lobby**: 지금과 동일. 학생이 입장·호 선택 가능.
- **preview (신규)**: `assignGroups()` 결과를 `players.groupNumber`/`players.roleId`에 써 두었지만 `players.stage`는 그대로 `"lobby"`이고 `rooms`도 아직 만들지 않는다. 학생 화면에는 아직 역할이 공개되지 않는다. 이 상태에서 새 학생 입장·호 변경은 막는다(기존 `lobby` 전용 가드와 동일하게 처리).
- **active**: 지금과 동일. `confirmStart`가 `players.stage = "role"`로 바꾸고 `rooms`를 만든 뒤 `session.status`를 `active`로 바꾸는 시점에만 진입한다.

## 4. Convex 함수 변경

### `convex/sessions.ts`

- `start`를 셋으로 나눈다.
  - **`previewGroups`**: 기존 `start`의 셔플 로직(157~172행)만 실행해 `players.groupNumber`/`roleId`를 patch하고 `session.status = "preview"`로 바꾼다. `stage`는 바꾸지 않고 `rooms`도 만들지 않는다. `players.length < 3` 검증은 그대로 유지.
  - **`reshuffleGroups`**: `session.status === "preview"`일 때만 허용. `assignGroups()`를 새 난수로 다시 실행해 `players.groupNumber`/`roleId`를 덮어쓴다. 몇 번이든 반복 가능.
  - **`confirmStart`**: `session.status === "preview"`일 때만 허용. 각 player의 `stage`를 `"role"`로 바꾸고 `rooms`를 생성한 뒤(기존 178~186행 로직) `session.status = "active"`, `startedAt`을 기록한다.
  - **`cancelPreview`** (신규): `session.status === "preview"`일 때만 허용. `players.groupNumber`/`roleId`를 지우고 `session.status`를 `"lobby"`로 되돌린다. 수업 중 지각생이 들어와야 하는 경우를 위한 안전판이다.
- `seedSyntheticStudents`의 `session.status !== "lobby"` 가드는 유지(데모 시딩은 lobby에서만).

### `convex/students.ts`

- 입장(`join`)과 호 선택(`pickAlias`) 가드를 `session.status === "lobby"`에서 `session.status !== "active"`가 아니라 **`"lobby"`만 허용을 유지**한다 — 즉 `preview` 동안은 지금의 `lobby` 전용 가드와 동일하게 계속 막는다(문구만 "모둠을 배정하는 중입니다"로 구분).
- 학생 조회 함수가 돌려주는 `sessionStatus`에 `"preview"`가 새로 포함된다. 학생 쪽에는 `active`가 아니면 지금처럼 대기 화면을 보여주면 되므로 별도 대응 로직은 필요 없을 가능성이 높다 — 구현 시 `LiveStudentActivity.tsx`에서 `sessionStatus !== "active"` 분기가 이미 있는지 확인하고, 없다면 "선생님이 모둠을 배정하고 있어요" 문구를 추가한다.

### `convex/schema.ts`

- `sessions.status`를 `v.union(v.literal("lobby"), v.literal("preview"), v.literal("active"))`로 확장한다.
- `convex/security.ts`의 `status: "lobby" | "active"` 타입도 `"preview"`를 포함하도록 갱신한다.

## 5. 화면 변경

### `components/LiveTeacherConsole.tsx`

- 로비 화면의 "활동 시작" 버튼을 "모둠 미리보기"로 바꾸고 `previewGroups`를 호출한다.
- `session.status === "preview"`일 때 새 블록을 보여준다: 모둠별 호 목록, `다시 섞기`(`reshuffleGroups`) 버튼, `이 배정으로 시작`(`confirmStart`) 버튼, `취소하고 대기로 돌아가기`(`cancelPreview`) 버튼.
- 배지 문구("입장 대기"/"진행 중")에 `"preview"` 값을 추가한다("모둠 확인 중" 등).

### `components/DemoTeacherConsole.tsx`

- 데모 모드도 동일한 3단계 흐름을 흉내 내야 실제 동작과 어긋나지 않는다. `DemoStatus`에 `"preview"`를 추가하고 같은 버튼 세 개를 로컬 상태로 재현한다.

### `components/LiveStudentActivity.tsx`

- `view.sessionStatus === "active"` 조건부 렌더링(202행 부근) 앞에 `preview` 상태의 대기 화면을 추가한다.

## 6. 검증 계획

- `shared/scenario.test.ts`에 `assignGroups`를 여러 시드로 반복 호출했을 때 매번 다른 조합이 나오는지(재섞기가 실제로 값을 바꾸는지) 확인하는 테스트를 추가한다.
- Convex 함수 단위: `previewGroups` 뒤 `players.stage`가 그대로 `lobby`인지, `confirmStart` 전까지 `rooms`가 생성되지 않는지, `cancelPreview` 뒤 재입장·호 변경이 다시 가능한지 확인하는 테스트를 추가한다.
- 데모 모드(`NEXT_PUBLIC_DEMO_MODE=true`)로 로비→미리보기→재섞기(2회 이상)→확정 흐름을 직접 실행해 학생 화면에 역할이 확정 전까지 노출되지 않는지 브라우저로 확인한다.
- Convex 개발 배포에 연결해 동시 접속 상황에서 `previewGroups`/`reshuffleGroups`/`confirmStart`가 경쟁 조건 없이 동작하는지 확인한다(교사가 재섞기를 연타하는 경우 등).
- `npm run check` 통과.
- 로그 정적 검색으로 새 함수들이 alias·모둠 구성을 console에 남기지 않는지 확인(기존 join-security 계획과 동일한 기준).

## 7. 이번 계획에서 하지 않는 것

- 교사가 모둠을 완전히 수동으로(드래그 등) 배정하는 UI(대안 ②, 별도 계획 필요 시 검토)
- "이 두 호는 같은 모둠 금지" 같은 제약 조건 자동화 — 교사가 미리보기를 보고 수동으로 다시 섞는 것으로 충분한지 먼저 확인한 뒤 필요성을 재검토한다
- 지각생을 위한 "일부만 재배정" 같은 부분 재섞기 — 이번 범위는 전체 취소(`cancelPreview`) 후 재시도만 지원한다
- 실제 학생 접속·Production 배포 — `P1-COLLAB-PRIVACY` 게이트 해제 전까지 로컬·Convex 개발 배포·가상 데이터로만 검증한다

## 8. 확정된 결정 (2026-09-08 사용자 승인)

1. **`preview` 동안 학생 화면에는 모둠 번호를 보여주지 않는다.** "잠시만 기다려 주세요" 대기 화면만 노출하고, 재섞기 중간 결과가 학생에게 보이지 않게 한다.
2. **재섞기 횟수는 일단 무제한으로 시작한다.** 실제 수업에서 교사가 반복하며 시간을 끄는 문제가 관찰되면 그때 제한을 추가한다.
