# Claude → Codex 전달 — 10/29 고려 15~18차시 보조 자료 (2026-10-02)

- 작업: `TASK-20261002-OCT29-SUPPLEMENT` (Claude, content agent)
- 브랜치: `docs/joseon-late-extra-materials` (origin에 push됨, 기준 `4f5dcb6`). 전용 worktree `.worktrees/claude-joseon-late-extra`.
- 마지막 커밋: `46a8825`. 이 브랜치는 **문서만** 바꿨고 `apps/**`·`data/**`·`js/**`는 건드리지 않았다.
- 인증·로그인(Preview 전용 Auth0 SPA)은 Codex 담당이고 Claude는 손대지 않았다.

## 1. 확정된 사실 (사용자 확인, 2026-10-02)

- 공개수업은 **10월 29일(목)** 로 변경됐다(원래 10/28 수). 주제는 **1단원 15~18차시**(고려와 주변 나라들의 관계 / 고려의 문화와 사람들의 생활)다. 기존 문서의 "조선 후기" 기록과 다르다.
- 실시간 앱(`apps/cooperative-live`)에는 15~18차시 시나리오가 없다. 10/29 수업은 **종이·교사 화면 기반 정적 협동 활동**을 기본으로 한다. 실시간판은 별도 게이트(Auth0 Preview, 실기기 리허설)를 통과해야 한다.
- 사용 교과서를 사용자가 직접 대조했다(`docs/handoff/claude_goryeo_oct29_textbook_crosscheck.md` §0).

## 2. 이 브랜치의 산출물

| 파일 | 내용 |
|---|---|
| `docs/plans/implementation_plan_goryeo_oct29_supplementary_materials.md` | 계획과 §10 진행 기록 |
| `docs/handoff/claude_goryeo_oct29_source_table.md` | 출처 표(R1~R12, C1~C11). 23행 중 22행 한국어 원문 대조 완료 |
| `docs/handoff/claude_goryeo_relations_cards.md` | 15~16차시 역할 카드, 3·4·5인 편성, 교사 발문, §9 교과서 연계 |
| `docs/handoff/claude_goryeo_culture_life_cards.md` | 17~18차시 역할 카드, 같은 구성 |
| `docs/handoff/claude_goryeo_question_revision_worksheet.md` | 질문·수정 활동지(학생용 + 교사용) |
| `docs/handoff/claude_goryeo_oct29_textbook_crosscheck.md` | 교과서 대조표 |
| `docs/plans/classroom_observation_session_sheet.md` | F절(고려 15~18차시 관찰) 추가 |

## 3. Codex에 요청하는 일

### 3-1. 감사 문서 문구 정정 (`docs/plans/tasks_classroom_oct29_audit.md`, main 작업 폴더의 미커밋 파일)

- 이 문서는 15~18차시를 "다른 10월 29일 차시가 확정된 근거를 찾지 못해 작업 가정으로 삼았다"고 적고 있다. 사용자가 확정했으므로 **"사용자 확인(2026-10-02)으로 확정"** 으로 바꾼다.
- 감사 대상 §A~(앱 기능 감사)와 미구현 판정 구조는 그대로 두면 된다. 15~18차시 두 활동이 **실시간 앱에 없다는 판정은 유지**하고, 대체 운영 자료로 위 카드·활동지가 있음을 §범위에 한 줄 연결한다.
- 같은 날짜 정정이 필요한 곳: `BACKLOG.md`의 `TASK-20261002-CLASSROOM-OCT29-AUDIT` claim 문구("2026-10-29 수업용 … 1단원 15~18차시 계획")는 맞으므로 유지. 다만 같은 파일의 `P1-COLLAB-JOSEON-LATE` 항목은 "10월 28일 공개수업"으로 남아 있다. **고치지 말고 주석 한 줄만** 추가하는 것을 권한다: "공개수업은 2026-10-02 사용자 확인으로 10/29 고려 15~18차시로 변경됨. 조선 후기 슬라이스는 이후 수업·회귀 기준으로 유지."

### 3-2. 병합 시 처리 (이 브랜치를 main에 합칠 때)

- `BACKLOG.md`에 이 작업 claim 한 줄(`TASK-20261002-OCT29-SUPPLEMENT … 상태: DOING`)과 검증 후 `DONE` 전환. 이 브랜치는 BACKLOG·README를 수정하지 않았다(main의 미커밋 변경과 충돌 방지).
- `docs/plans/README.md` 색인에 위 계획서와 카드 문서 링크 추가.
- `INBOX.md`: main 작업 폴더의 미커밋 변경에 Claude가 **2026-10-02 항목 1개**를 이미 덧붙였다(공개수업 일정 변경과 역할 분담). 병합 시 그 항목의 `상태`를 `inbox → promoted`로 바꾸고 이 계획서 경로가 이미 적혀 있음을 확인한다. 다른 세션의 미커밋 변경은 stash·discard하지 않는다.
- 변경 요청을 문서만 합치고 코드는 건드리지 않는다.

### 3-3. 읽기 전용 감사 (선택, red team 역할)

- `claude_goryeo_oct29_source_table.md`의 허용 범위·금지 확대 해석이 카드 문장과 어긋나는 곳을 찾는다. 특히 확인해 달라는 곳:
  - 관계 카드 D(삼별초)와 E(R10 "강한 영향 아래")가 정복·독립 어느 쪽으로도 단정하지 않는지
  - 관계 카드 C의 백성 피해가 몽골 시기(R9)에만 쓰이고 거란 시기에 번지지 않는지
  - 문화 카드 A·E가 청자 사용층을 왕실·개경 관료·사찰까지만 말하고 평범한 백성은 "알 수 없다"로 두는지
- 발견은 직접 고치지 않고 BACKLOG 또는 감사 문서에 재현 정보와 함께 등록한다(기존 감사 규칙).

### 3-4. 앱 시나리오를 만들 때

- 이 카드를 15~18차시 시나리오의 **원본 문안**으로 쓰려면 먼저 출처 표의 "허용 범위"를 지켜 주고, 교과서 밖 보충(삼별초, 몽골 시기 피해, 상정고금예문, 청자 가마·송 평가)은 카드의 "교과서 밖" 표시를 그대로 앱 문안에 반영한다.
- 상위 계획의 결정은 그대로다: 주변 나라 관계 활동부터 한 편씩, 활동당 8~10분, 벽란도는 청자 교류의 보조 공통 자료.
- 동시 수정 금지: 카드 문안을 고칠 일이 생기면 Claude에게 요청한다. 이 문서들은 Claude 소유 파일이다.

## 4. 아직 남은 일 (Claude)

- 문장 길이·난이도 최종 점검(사용자 인터뷰로 환도·복속·삼별초·흥덕사·백운·상정고금예문 풀이는 반영 완료).
- 인쇄용 학생 본문(출처 번호 제거)과 교사 한 장 요약을 10/23~27 동결 일정에 맞춰 작성.
- 수업 후 관찰 기록을 `EXPERIMENTS.md`에 `관찰 → 가설 → 작은 실험 → 결과 → 다음 결정`으로 정리.
- 미확인 항목: C8의 유네스코 등재 연도·선원사·1398년 해인사 이전(카드 미사용).

## 5. 확인 방법

```powershell
git fetch origin docs/joseon-late-extra-materials
git diff --stat 4f5dcb6..origin/docs/joseon-late-extra-materials   # 문서 8개만 바뀌었는지
git diff --name-only 4f5dcb6..origin/docs/joseon-late-extra-materials | Select-String -NotMatch '^docs/'   # 결과가 없어야 한다
```

- 카드의 `[R번호]`·`[C번호]`가 출처 표에 모두 있는지: 계획서 §10에 기록한 스크립트 점검(카드에 쓰인 번호가 표에 없는 경우 0건, 미사용 R4·C8)을 병합 뒤에도 다시 확인한다. 카드 확정 뒤에 번호가 늘면 다시 돌린다.
- 학생용 인쇄본에는 번호를 지운다. 표 번호가 학생 화면이나 인쇄물에 남으면 안 된다.
