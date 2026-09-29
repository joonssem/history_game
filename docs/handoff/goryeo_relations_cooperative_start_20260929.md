# 고려 후속 실시간 협동 활동 제작 착수 인계

- 작성일: 2026-09-29
- 작업 브랜치: `feat/goryeo-relations-cooperative`
- 작업 worktree: `.worktrees/codex-goryeo-relations-coop`
- 상태: `P0-GATE 진행 중 · 신규 시나리오 콘텐츠 미작성`
- 작업 claim: `TASK-20260929-GORYEO-RELATIONS-P0-GATE`

## 1. 지금까지 완료

### 계획·문서

- 사용자 원문을 `INBOX.md`에 보존했다.
- `BACKLOG.md`에 고려 후속 협동 활동 2종을 등록했다.
- 구현 계획과 실행 체크리스트를 작성하고 사용자 `다음 관문 진행`으로 계획 기준을 승인했다.
  - [`implementation_plan_goryeo_relations_culture_cooperative_live.md`](../plans/implementation_plan_goryeo_relations_culture_cooperative_live.md)
  - [`tasks_goryeo_relations_culture_cooperative_live.md`](../plans/tasks_goryeo_relations_culture_cooperative_live.md)

### 기준선·브랜치

- 복구 기능 기준: `0cbc90d`, `f71ca7d`
- 계획 기준: `f32e4fd`
- 새 구현 브랜치는 복구 기능 브랜치에서 분기한 뒤 최신 `main` 계획 문서를 병합했다.
- P0-GATE 착수 기록: `cedb11f`

### 자동 검증

`apps/cooperative-live`에서 다음 명령을 통과했다.

```powershell
npm ci
npm run check
```

결과:

- lint 통과
- TypeScript typecheck 통과
- 단위 테스트 19건 통과
- Convex 통합 테스트 6건 통과
- Next.js production build 통과

## 2. 현재 차단점

Vercel Preview는 `Ready`지만 Auth0가 새 Preview 주소를 허용하지 않아 교사 로그인이 차단된다.

등록이 필요한 Callback URL:

```text
https://history-game-eem0w3prh-joon0noh-3339.vercel.app/teacher
```

Auth0 등록 뒤 기존 `early-goryeo-unity` 활동으로 교사 로그인, 세션 생성, QR 확대, 학생 역할 4~8대 재연결·모둠별 진행·종료 삭제를 확인해야 P0-GATE가 열린다.

계획의 명시적 중단 조건에 따라 이 관문 전에는 `goryeo-foreign-relations`와 `goryeo-culture-life`의 프로덕션 시나리오 데이터를 추가하지 않는다.

## 3. 승인된 제작 순서

```text
P0-GATE 공통 엔진·인증·실기기
→ P1-A goryeo-foreign-relations
→ P1-B goryeo-culture-life
→ P1-C 기존 3편+신규 2편 통합 회귀·Preview·Go/No-go
```

P1-A가 학생 문장 난이도와 8~10분 운영 관문을 통과하기 전에는 P1-B를 병렬 구현하지 않는다.

## 4. P1-A 첫 구현 범위

활동 가제: **고려의 선택 회의 — 주변 나라의 위기에 어떻게 대응할까?**

기본 역할:

1. 외교 기록 검토자 — 서희 담판의 조건과 국제 관계
2. 북방 방어 담당자 — 강동 6주·방어 거점·귀주 전투
3. 전란 속 마을 사람 — 생업·피난·세금 등 생활 부담
4. 강화·항쟁 기록자 — 강화도 천도·대몽 항쟁·삼별초
5. 5인 전용 관계 연표 검토자 — 거란과 몽골 시기의 선후·차이

서버 수용 기준:

- 서로 다른 역할 근거 2개 이상
- 거란과 몽골 시기 구분
- 국가 대응과 사람들의 생활 영향 연결
- 한 사건으로 전체 대외 관계를 일반화하지 않는 자료 한계
- 다른 세션·모둠·시나리오의 근거 ID 거부
- 제외·복원·자리 복구 뒤 근거 소유권 재계산

예상 수정 파일:

- `apps/cooperative-live/shared/scenario.ts`
- `apps/cooperative-live/convex/scenarios.ts`
- `apps/cooperative-live/shared/scenario.test.ts`
- `apps/cooperative-live/shared/scenario-registry.test.ts`
- `apps/cooperative-live/convex/virtual-load.test.ts`
- `apps/cooperative-live/TEACHING_GORYEO_RELATIONS.md`

## 5. 다음 세션의 첫 행동

1. `git status --short`와 `git branch --show-current` 확인
2. Auth0 callback 등록 여부 확인
3. 등록됐다면 Preview 교사 로그인과 기존 고려 건국 활동 P0 실기기 리허설
4. P0-GATE 통과를 체크리스트와 claim에 기록
5. `TASK-20260929-GORYEO-RELATIONS-P1A`를 별도로 claim
6. 공식 출처 주장표를 먼저 작성한 뒤 프로덕션 시나리오 구현

## 6. 모델 운용 제안

- **GPT-5.6 Sol Medium 권장:** 공식 사료 범위 판단, 역할 간 관점 균형, 5학년 문장 난이도, 서버 검증 계약 설계, 감사·Go/No-go.
- **GPT-5.6 Sol Low 사용 가능:** 승인된 역할·근거를 코드 구조에 옮기기, 반복 fixture 작성, 정형 테스트 추가, 체크리스트 갱신, lint/typecheck/build 수정.
- Low로 작업할 때도 이 계획과 체크리스트를 변경하지 않으며, 새로운 역사 주장이나 계약 변경이 필요하면 구현을 멈추고 Medium 판단으로 되돌린다.

