# 고조선 협동 MUD 최초 판단 순서 교정 계획

- 작성일: 2026-09-15
- 작업: `TASK-20260915-T5-PLAN`
- 대상: `P2-COLLAB-02`
- 상태: **완료 — 기능 교정·브라우저 검증 완료, 실제 수업 재관찰 대기**
- 구현 역할: implementation agent
- 목적: 고조선 정적 협동 MUD에서도 친구의 설명을 듣기 전 개인 판단을 먼저 기록해, 공유 뒤 판단 변화라는 수업 가설을 관찰할 수 있게 한다.

## 1. 문제와 근거

현재 `cooperative-mud/gojoseon-law/app.js`의 흐름은 다음과 같다.

```text
역할 카드와 공유 문장 확인
→ “모둠에 이야기했어요”
→ state.shared = true
→ 최초 판단 선택
→ 추가 증거와 재판단
```

화면에는 “친구와 상의하기 전에 내 최초 판단”이라고 쓰여 있지만 실제 상태 전이는 공유가 먼저다. `EXPERIMENTS.md`의 `EXP-006`도 이 때문에 2026-09-04 수업에서 판단 변화 가설을 검증하지 못했다고 기록한다. 반면 시조 설화와 한강 유역 편은 공용 `episode.js`에서 다음 순서를 사용한다.

```text
역할 확인 → 최초 판단 → 정보 공유 → 새로운 자료 → 재판단
```

고조선 편의 법 만들기·역사 비교 구조는 유지하면서 이 순서만 맞춘다.

## 2. 목표 상태

### 2-1. 화면 흐름

```text
활동 소개
→ 모둠·번호 선택
→ 내 역할 정보 읽기(아직 공유 금지)
→ 사건 1 최초 판단
→ 모둠에 역할별 정보 공유
→ 추가 증거 공개·재판단
→ 10분형만 사건 2
→ 모둠의 법
→ 역사 자료 비교
→ 완료
```

최초 판단은 `firstChoice`에 저장되고, 공유 화면에 처음 들어갔을 때 `shared`는 반드시 `false`다. 공유 확인 버튼을 누른 뒤에만 `shared=true`가 되고 추가 증거로 이동한다.

### 2-2. 진행 단계와 시간 예산

진행 표시를 7단계에서 8단계로 맞춘다.

| 화면 | 단계 | 표시 |
|---|---:|---|
| intro | 1 | 활동 소개 |
| setup | 2 | 모둠·좌석 선택 |
| role | 3 | 역할 정보 |
| first | 4 | 최초 판단 |
| share | 5 | 정보 공유 |
| reveal / second | 6 | 추가 증거 / 두 번째 사건 |
| law | 7 | 모둠의 법 |
| history / finish | 8 | 역사 자료 비교 / 탐구 완료 |

기존 전체 예산은 늘리지 않고 역할 화면에 포함됐던 공유 시간을 분리한다.

| 모드 | 기존 role | 변경 role | 신규 share | 전체 합계 |
|---|---:|---:|---:|---:|
| 5분형 | 80초 | 35초 | 45초 | 310초 유지 |
| 10분형 | 140초 | 50초 | 90초 | 600초 유지 |

`scenario.pacing.order`에 `share`를 `first`와 `reveal` 사이에 추가하고, 역할 화면의 “친구 이야기를 먼저 들어 보라”는 fast prompt는 공유 화면으로 옮긴다.

## 3. 구현 방법

### 3-1. `cooperative-mud/gojoseon-law/index.html`

- 초기 진행 표시를 `1 / 8`과 12.5%로 조정한다.
- 역할 화면 문구를 “아직 친구에게 설명하지 말고 혼자 읽는다”로 바꾼다.
- 역할 화면의 `share-button`을 `role-continue-button`으로 교체한다.
- 최초 판단 화면과 추가 증거 화면 사이에 `screen-share`를 추가한다.
- 공유 화면에는 현재 역할의 `shareText`, 다른 역할의 사정을 들을 때 볼 질문, `share-button`, `share-state`를 둔다.
- 기존 class를 재사용하고 새 CSS는 추가하지 않는다.

### 3-2. `cooperative-mud/gojoseon-law/app.js`

- `screenIds`에 `share`를 추가하고 `totalSteps=8`을 상수로 둔다.
- `progressInfo`를 §2-2 표에 맞춘다.
- `renderRole()`에서는 개인 정보와 이해관계만 렌더링한다. 공유 문장은 아직 노출하지 않는다.
- `renderShare()`를 추가해 공유 화면에서만 `role.shareText`를 보여 준다.
- `role-continue-button` 클릭 시 최초 판단 선택지를 렌더링하고 `first`로 이동한다.
- 최초 판단 선택 시 `firstChoice`를 저장하고 `shared=false`로 초기화한 뒤 `share`로 이동한다.
- `share-button` 클릭 시에만 `shared=true`를 저장하고 `reveal`로 이동한다.
- `renderScreenContent()`가 뒤로가기 복원 시 `share`도 다시 렌더링하게 한다.

### 3-3. 뒤로가기 상태 규칙

고조선 편은 자체 뒤로가기 스택이 있으므로 다음을 명시적으로 보호한다.

- `reveal → share`로 돌아왔을 때 공유 버튼을 비활성화해 사용자를 가두지 않는다. 버튼 문구를 “다시 추가 증거 보기”로 바꾸고 재진입을 허용한다.
- `share → first`로 돌아가 최초 판단을 다시 고르면 `shared=false`, `revisedChoice=null`, `decisionChanged=null`로 되돌린다.
- 최종 요약에는 마지막으로 다시 선택한 `firstChoice`가 최초 판단으로 표시되고, 그 이후의 재판단만 변경 여부 계산에 사용된다.
- 시작 버튼으로 새 활동을 시작할 때의 기존 초기화와 `localStorage` 키는 유지한다.

### 3-4. `cooperative-mud/gojoseon-law/scenario.js`

- pacing 순서·예산을 §2-2대로 변경한다.
- `share` slow/fast prompt를 추가한다.
- 역사 콘텐츠, 역할별 `privateInfo`·`shareText`, 선택지, 법 조합은 변경하지 않는다.

## 4. 문서 변경

- `cooperative-mud/TEACHING.md`: 6차시만 순서가 반대라는 경고를 제거하고 세 활동 모두 공유 전 최초 판단을 기록한다고 수정한다.
- `cooperative-mud/index.html`: 7·8차시에만 적용된다는 교사용 안내를 세 활동 공통 안내로 바꾼다.
- `project_context.md`: 6차시 순서 예외와 자체 앱 설명을 현재 구조에 맞게 갱신한다.
- `BACKLOG.md`: `P2-COLLAB-02`를 구현·검증 결과에 따라 완료 처리한다.
- `walkthrough.md`: 변경 파일, 상태 전이, 검증 결과를 기록한다.

`EXP-006`의 과거 관찰 기록은 당시 사실이므로 고치지 않는다. 구현 뒤 실제 수업에서 다시 관찰할 때 새 실험 결과를 별도 추가한다.

## 5. 예상 변경 파일

```text
cooperative-mud/gojoseon-law/index.html
cooperative-mud/gojoseon-law/app.js
cooperative-mud/gojoseon-law/scenario.js
cooperative-mud/index.html
cooperative-mud/TEACHING.md
project_context.md
BACKLOG.md
walkthrough.md
docs/plans/README.md
```

새 패키지·프레임워크·서버 저장소·개인정보 필드는 추가하지 않는다.

## 6. 검증 계획

### 6-1. 정적 검사

```text
node --check cooperative-mud/gojoseon-law/app.js
node --check cooperative-mud/gojoseon-law/scenario.js
node --check cooperative-mud/pacing.js
python scripts/06_validate_static_assets.py
git diff --check
```

DOM ID와 이벤트 연결은 다음 항목을 추가로 대조한다.

- `role-continue-button`, `screen-share`, `share-card`, `share-button`, `share-state`가 HTML과 JS에 각각 존재한다.
- 제거한 역할 화면의 공유 버튼을 참조하는 코드가 남지 않는다.

### 6-2. 브라우저 흐름

데스크톱과 375px 모바일에서 다음 두 경로를 확인한다.

1. 3인 모둠·5분형: 역할 → 최초 판단 → 공유 → 추가 증거와 3인 추가 단서 → 재판단 → 사건 2 생략 → 법 → 역사 비교 → 완료
2. 5인 모둠·10분형: 역할 → 최초 판단 → 공유 → 추가 증거 → 재판단 → 사건 2 → 법 → 역사 비교 → 완료

각 경로에서 다음을 확인한다.

- 최초 판단 전 공유 문구와 공유 확인 버튼이 나타나지 않는다.
- 최초 판단 직후 `firstChoice`가 저장되고 `shared=false`다.
- 공유 확인 뒤에만 `shared=true`가 되고 추가 증거가 열린다.
- 유지·변경 양쪽 재판단이 정상이며 완료 요약이 최초/최종 판단을 구분한다.
- `reveal → share → first` 뒤로가기와 재선택 후에도 다시 앞으로 진행할 수 있다.
- 진행률, 페이싱 배지, 초기화 버튼, 추가 미션이 정상이다.
- 콘솔 error/warning이 없다.

## 7. 수용 기준

- 정상 UI 경로에서 공유 전에 `firstChoice`가 반드시 존재한다.
- 공유 전 개인 판단과 공유 후 재판단이 서로 다른 상태로 보존된다.
- 3·4·5인 모둠 및 5·10분형 기존 분기가 유지된다.
- 뒤로가기로 공유·판단 상태가 꼬이거나 진행이 막히지 않는다.
- 법 만들기, 역사 비교, 완료 요약, 로컬 저장·초기화에 회귀가 없다.
- 정적 검사와 대표 브라우저 경로가 모두 통과한다.
- 실제 수업 재검증 전에는 “판단 변화 효과 확인”으로 완료 처리하지 않고, 기능 교정 완료와 수업 관찰 대기를 구분한다.

## 8. 하지 않는 것

- `cooperative-mud/episode.js`로 고조선 편을 전면 이관
- `apps/cooperative-live/`의 실시간 흐름 변경
- Convex·Auth0·Vercel 설정 또는 Production 배포
- 학생 이름·답변·식별 정보 수집
- 역사 문안·선택지·법 조합 재작성
- 7·8차시 시나리오 변경
- 실제 학생 수업 결과를 구현 결과로 추정해 기록

## 9. 승인 후 실행 단위

이 계획을 한 목적 단위로 구현한다. 구현 중 별도 개선점이 보이면 현재 패치에 섞지 않고 `INBOX.md` 또는 `BACKLOG.md`에 기록한다. 구현·브라우저 검증 완료 뒤 `walkthrough.md`를 갱신하며, 실제 학생 관찰은 별도 단계로 남긴다.
