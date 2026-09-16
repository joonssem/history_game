# 4트랙 라운드 7 지시서 — 조선 후기 콘텐츠 패킷 맞추기

> 작성: 2026-09-16, 기획 세션(Opus). 기준: `origin/main` 최신. 결정 근거: `DECISIONS.md` D-034.
> 라운드 6에서 네 창이 동시에 작업해, 역할 카드(`docs/handoff/claude_joseon_late_role_cards.md`)와 패킷 초안(`data/cooperative/joseon_late_packet.draft.json`)의 역할 id·5인 역할·3인 구성이 서로 달라졌다. 이번 라운드는 둘을 하나로 맞춘다.

## §0 공통 규칙

라운드 6 §0·§0-2를 그대로 따르고, 아래를 더한다.
- `apps/**`, `cooperative-mud/**`, `data/mud/*.json`, `js/*.js`는 건드리지 않는다.
- main에 push하지 않는다.
- **남의 파일은 고치지 않는다.**

### 확정값 (D-034) — 모든 창이 이 이름을 쓴다

| 역할 | id | evidenceId | 4인 | 3인 | 5인 |
|---|---|---|---|---|---|
| 농민 | `farmer` | `farmer-ipbeop` | O | O | O |
| 보부상 | `bobusang` | `bobusang-currency` | O | O | O |
| 장시 주민·수공업자 | `craftsman` | `jangsi-craftsman` | O | 공통 자료로 보충(`jangsi-craftsman-summary`) | O |
| 기록관 | `recordkeeper` | `record-keeper-scope` | O | **O (남긴다)** | O |
| 품팔이 | `laborer` | `laborer-wage` | — | — | **O (다섯째 역할)** |

- **공인(`gongin`)은 쓰지 않는다.** 보부상과 같은 상인 관점이라 겹친다. 품팔이는 변화로 어려움을 겪은 사람의 목소리를 준다.
- **질문 틀 3종(대상·근거·한계)은 앱 데이터가 아니다.** 패킷 JSON에서 빼고, sticky-wall용 교사 자료 `docs/handoff/claude_joseon_late_teacher_sticky_wall.md`로 옮긴다.
- **소유 경계**
  - 역할 본문(`privateInfo`·`sharePrompt`·`interest`)은 관문 설계실이 쓴다.
  - 판단·해석 옵션(`firstJudgment`·`synthesis`·`interventions`)은 연결 공방이 쓴다.
  - 역할 카드 문서 §4~§8(판단·해석·질문·개입·sticky-wall)은 연결 공방이 JSON으로 옮길 때 **참고 자료**로만 쓴다.

## 진행 순서 — 두 단계

- **1단계(지금, 네 창 동시)**: 서로 파일이 겹치지 않는 일만 한다.
- **2단계(1단계 통합 뒤)**: 관문 설계실이 대조실의 수정 요청을 반영하고, 그다음 연결 공방이 확정 문장을 JSON에 옮긴다. 2단계 지시는 기획 세션이 따로 준다.

## §1 관문 설계실 — 1단계: 공인 카드를 품팔이 카드로 바꾸기

- **파일**: `docs/handoff/claude_joseon_late_role_cards.md`만 고친다.
- **할 일**
  1. §3 5인 변형의 공인(`gongin`) 카드를 **품팔이(`laborer`)** 카드로 바꾼다.
     - 내용: 광작(한 집이 넓은 땅을 짓는 것)이 늘면서 땅을 빌려 짓지 못하게 된 일부 농민이 남의 일을 해 주고 품삯을 받는다.
     - `privateInfo` 3~5문장, `sharePrompt`, `interest`, `evidenceId: laborer-wage`를 쓴다.
     - 이해관계 충돌을 적는다: 농민(넓은 땅을 지어 이익) ↔ 품팔이(일자리는 있으나 불안정).
     - **"모든 농민이 땅을 잃었다"처럼 쓰지 않는다.** "일부"의 범위를 지킨다.
  2. 역할 id·evidenceId를 위 확정값 표와 같게 맞춘다.
  3. 문서 첫머리에 "§4~§8은 연결 공방의 참고 자료이며 확정본은 패킷 JSON"이라고 한 줄 적는다.
- 대조실의 수정 요청은 **2단계에서** 반영한다. 지금은 반영하지 않는다.

## §2 대조실 — 1단계: 역할 카드 문장 대조와 수정 요청 목록

- **파일**: `docs/audits/joseon_late_source_review.md`만 고친다.
- **할 일**
  1. 라운드 6에서 비워 둔 `ROLE_CARD_REVIEW` 절을 채운다. `claude_joseon_late_role_cards.md`의 역할 카드 4개(농민·보부상·수공업자·기록관)와 공통 자료, 3인 공통 자료의 **문장마다** 다음을 적는다.
     - 판정: 맞음 / 범위 초과 / 확인 불가
     - 근거 URL
     - 고칠 문장 제안
  2. 관문 설계실이 `[출처 후보: 대조실 확인 필요]`로 표시한 6곳을 우선 확인한다. 광작-품팔이 관계, 전황, 관영→민간 수공업, 호적 누락, 대동법·공인, 지역차다.
  3. **품팔이 카드용 근거를 미리 정리한다.** 광작 확대와 임노동 증가를 원문이 어디까지 말하는지 적는다. 관문 설계실이 2단계에서 쓴다.
  4. 연결 공방 패킷의 `evidenceOptions` 짧은 라벨도 대조한다(설점수세제·품팔이 서술 포함).
- 공인 카드는 쓰지 않기로 했으니 대조하지 않는다.

## §3 연결 공방 — 1단계: 패킷 JSON 구조를 확정값에 맞추기

- **파일**: `data/cooperative/joseon_late_packet.draft.json`, `docs/handoff/claude_joseon_late_packet_notes.md`, 새 파일 `docs/handoff/claude_joseon_late_teacher_sticky_wall.md`
- **할 일**
  1. 역할 id를 확정값으로 바꾼다: `nongmin→farmer`, `artisan→craftsman`, `rokgwan→recordkeeper`, `pumpali→laborer`. `evidenceId`와 `evidenceOptions[].roleId`도 함께 바꾼다.
  2. `groupVariants`를 확정값 표대로 맞춘다.
     - 3인: `farmer`·`bobusang`·`recordkeeper`, 공통 자료 `jangsi-craftsman-summary`
     - 5인: 4인 + `laborer`
  3. **`questionFrames`를 JSON에서 빼서** 새 교사 자료 문서로 옮긴다. 그 문서에는 sticky-wall 운영 순서와 복사 문자열 형식(계획서 §6)도 함께 적는다.
  4. **"전국" 과잉 단정 2건을 고친다.**
     - `ev3_market_spread` 라벨: "5일장이 전국 곳곳에" → 범위를 낮춘 표현. 대조실 검토표의 장시 절을 참고한다.
     - `bobusang` 자리표시자 속 "전국에"
     - `limit_scope`(단정을 부정하는 한계 문장)는 **고치지 않는다.** 조작대가 오탐으로 처리한다.
  5. 역할 본문은 **자리표시자 그대로 둔다.** 2단계에서 관문 설계실 확정본을 옮긴다.

## §4 조작대 — 1단계: 검증 스크립트 보완

- **파일**: `scripts/15_validate_cooperative_packet.js`, `walkthrough.md`
- **할 일**
  1. **부정문 오탐 제거**: 과잉 단정어가 "~인지는 알 수 없다", "~라고 단정할 수 없다"처럼 부정·한계 문장 안에 있으면 경고하지 않는다. `limitOptions`가 대표 사례다.
  2. **교차 파일 검사 추가**
     - 패킷의 `roles[].id`·`evidenceId`가 D-034 확정값과 같은지 검사한다.
     - 역할 카드 문서(`claude_joseon_late_role_cards.md`)에 적힌 id가 패킷과 같은지 검사한다. 문서의 백틱 id를 읽는 정도면 충분하다.
     - 다르면 실패로 낸다. 라운드 6의 어긋남을 기계로 잡기 위해서다.
  3. **알 수 없는 최상위 필드 경고**: 계획서 §4 타입에 없는 필드(예: `questionFrames`)가 있으면 경고한다.
  4. **자리표시자 보고**: `[PLACEHOLDER` 문자열이 남아 있으면 개수를 보고한다. 1단계에서는 경고로, 2단계 뒤에는 실패로 바꿀 수 있게 옵션(`--final`)을 둔다.
- 1단계에서는 연결 공방의 id 변경과 동시에 진행하므로, 자기 worktree에서는 교차 검사가 실패해도 된다. **통합본 기준으로 통과**하면 된다. 보고서에 그렇게 적는다.

## §5 완료 보고

- 검증 결과: `04`, `05`, `13`, `14`, `15`(연결 공방·조작대는 필수)
- 바뀐 파일 목록
- 확인 불가 항목
- 2단계에 넘길 것
