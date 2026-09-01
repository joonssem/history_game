# 구현 계획 — 학생 피드백 기반 P1 항목 실행 (항목 C: 유물 미니 기능)

> **2026-09-01 갱신**: 원래 이 문서는 P1 세 항목(A·B·C)을 모두 다뤘으나, 확인 결과 Codex가 같은 로컬 저장소에서 A·B를 이미 독립적으로 처리 중이었다.
> - **항목 B(`regular_neolithic` 2~3단계 문맥 정합성)**: Codex가 이미 수정 완료(작업트리 uncommitted). 2단계에 있던 농기구/도구 서술과 3단계에 있던 토기 서술이 서로 뒤바뀌어 있던 것을 맞는 자리로 정렬함 — 학생 제보가 실제 버그였음을 확인. 이 문서에서는 제외한다.
> - **항목 A(선택지 길이·표현 편향)**: Codex가 [`scripts/12_audit_choice_bias.py`](../../scripts/12_audit_choice_bias.py)·[`choice_bias_audit.md`](../audits/choice_bias_audit.md)로 동일 감사를 이미 수행했고, [`implementation_plan_choice_quality_batch.md`](implementation_plan_choice_quality_batch.md)에 1차 배치(3단계, 승인 대기)를 계획해 두었다. 아래 §1(항목 A 원안)은 중복이므로 실행하지 않고 기록만 남긴다. 후속 배치가 필요하면 Codex 문서를 기준으로 이어간다.
>
> 이후 이 문서는 **항목 C(유물 활용 미니 기능)** 실행 계획으로만 사용한다.

## 0. 배경과 범위

- 근거 문서: [`student_feedback_idea_note.md`](../archive/student_feedback_idea_note.md) (2026-09-01, 1단원 2·3차시 학생 현장 체험 관찰)
- `BACKLOG.md` P1-02 항목에 반영된 관찰: 1단원 2·3차시 연속 활동이 4분 이내에 끝났고, 학생이 직접 오타/문맥 문제를 제보했으며, 유물 획득 후 "다음에 뭘 하나요"라는 질문에서 확장 요구가 나왔다.
- 이번 계획은 노트의 우선순위 표에서 **P1 세 항목만** 다룬다.
  - A. 선택지 길이·표현 편향 감사 및 수정
  - B. `regular_neolithic` 2~3단계 문맥 정합성 확인·수정
  - C. 유물 활용 미니 기능(서버 불필요, 기존 도감과 연결)
- 실행 주체: Sonnet(나)가 계획과 구현을 함께 진행한다. `scene`/캔버스 신규 장면 작업이 아니므로 Opus 사양표 없이 진행하되, 완료 후 Codex 소유 문서(`BACKLOG.md`, `walkthrough.md`, `project_context.md`)에는 요약만 반영하고 문서 본문 편집은 기존 관례대로 Codex에 넘긴다.
- P2 항목(교실 비교·협력 활동, 역사 타이쿤)은 이번 범위에 포함하지 않는다.

---

## 부록 1. 항목 A 원안 — 선택지 길이·표현 편향 감사 및 수정 (실행 안 함, Codex 중복)

### 1-1. 현재 상태와 근거

기존 [`implementation_plan_choice_randomization.md`](implementation_plan_choice_randomization.md)는 2026-08-26에 "정답 위치 무작위화"(1·2단계)까지만 실행했고, "정답·오답 문장 길이·표현 균형화"(3단계)는 별도 후속 작업으로 명시적으로 남겨두었다. 이번 항목 A가 그 3단계에 해당한다.

`data/mud/regular_*.json` 전체를 스캔한 결과(2026-09-01, 임시 스크립트로 측정):

| 지표 | 값 |
|---|---|
| 정답/오답이 함께 있는 판단형 단계 수 | 101개 |
| 정답 선택지가 해당 단계에서 가장 긴 단계 수 | 95개 (94.1%) |
| 정답과 최장 오답의 글자 수 차이가 6자 이상인 단계 수 | 71개 |

상위 격차 단계(글자 수 차이 14자 이상, 13개): `regular_gwangbok`(1), `regular_goryeo_society`(1·2·3), `regular_balhae`(4), `regular_myeongnyang`(1), `regular_sejong`(3), `regular_joseon_folk`(1·2), `regular_gojoseon`(3), `regular_goryeo_culture`(3), `regular_independence`(2), `regular_joseon_founding`(2), `regular_goryeo_war`(1).

이 수치는 학생이 말한 "긴 문장이 정답처럼 보인다"는 관찰과 정확히 일치한다. 다만 71개 전체를 한 번에 수정하면 역사적 사실 오류를 낼 위험이 커지므로, 기존 저장소 관례(tap resistance batch, IF stage quality batch 등)처럼 **배치 단위**로 진행한다.

### 1-2. 목표

- 정답이 단순히 "더 길고 자세하다"는 이유로 맞혀지지 않게 한다.
- 오답도 그럴듯한 역사적 선택지로 유지하고, 선택 후 IF 화면에서 근거를 설명하는 기존 구조는 바꾸지 않는다.
- `next`/`correct` 분기, `simulator` 블록, 보상 연결은 건드리지 않는다.

### 1-3. 실행 단계

1. **감사 스크립트 정식화**: 임시로 사용한 길이 비교 로직을 `scripts/08_audit_choice_length_bias.py`로 정리해 저장소 스크립트 관례(`scripts/0N_*.py`)에 맞춘다. 출력은 MUD ID·단계 ID·글자 수 차이 목록.
2. **배치 1 (즉시 진행, 13단계)**: 위 표의 격차 14자 이상 단계부터 수정한다. 각 단계에서
   - 오답 선택지에 그럴듯한 역사적 근거 어휘를 보강해 정답과 문장 길이 차이를 6자 이내로 좁힌다.
   - 정답 선택지에서 전문 용어를 과도하게 몰아넣지 않는다(이미 옳은 핵심 개념은 유지).
   - 선택지 순서·`next`·`correct` 값은 변경하지 않는다.
3. **배치 2 (배치 1 검증 후)**: 격차 6~13자 구간(약 58단계)을 5~7개 MUD 단위로 나눠 순차 진행한다.
4. **재감사**: 각 배치 후 스크립트를 재실행해 격차 6자 이상 단계 수 감소를 확인하고 결과를 이 문서 §1-5에 기록한다.

### 1-4. 검증 계획

- 정적: `python scripts/01_validate_game_data.py`, `python scripts/03_validate_mud_integrity.py`, `python scripts/08_audit_choice_length_bias.py`
- 브라우저: 수정한 MUD를 각 1회 이상 플레이해 정답 클릭 시 정상 분기, 오답 클릭 시 기존 IF 재시도 화면으로 이동하는지 확인. 콘솔 오류 0건.
- 배치 1 완료 후 walkthrough 기록용으로 수정 전/후 문장 예시 3~5개를 캡처해 둔다.

### 1-5. 실행 결과

*(진행 후 기록)*

---

## 부록 2. 항목 B 원안 — `regular_neolithic` 2~3단계 문맥 정합성 확인 (실행 안 함, Codex가 이미 완료)

### 2-1. 1차 자체 검수 결과

`data/mud/regular_neolithic.json`을 직접 대조한 결과:

- 2단계("빗살무늬 토기의 비밀") 서사는 잉여 식량 보관을 위한 토기 필요성 → 뾰족 바닥·빗살무늬 디자인으로 이어지고, 선택지·시뮬레이터 핫스팟(`clay`/`pointed-base`/`comb-pattern`)이 모두 토기 제작 흐름과 일치한다.
- 3단계("가락바퀴와 뼈바늘") 서사는 추위 대비 옷감 필요성 → 가락바퀴로 실 뽑기·뼈바늘로 꿰매기로 이어지고, 선택지·핫스팟(`spindle-whorl`/`bone-needle`/`thread`)도 일치한다.
- 로드맵 라벨(`2. 빗살무늬 토기 제작`, `3. 가락바퀴 옷감 짜기`)과 실제 단계 내용도 일치한다.

즉 노트에 적힌 "2단계 농기구 설명과 토기 선택지 불일치", "3단계 토기 설명과 가락바퀴·뼈바늘 선택지 불일치"는 **현재 파일 내용에서는 재현되지 않는다.** 노트 자체도 "학생이 제보한 오타인지 별도 문맥 오류인지 원문 대조가 필요하다"고 명시해 확정된 결함이 아님을 밝히고 있다.

### 2-2. 남은 확인 필요 사항 (사용자 확인 요청)

아래 정보가 없으면 내가 추측으로 "수정"했을 때 오히려 정확한 기존 서술을 훼손할 위험이 있으므로, 다음 중 하나를 알려주시면 바로 반영하겠다.

- 학생이 정확히 어떤 문장/화면에서 문제를 제기했는지 (단계 번호, 캡처, 또는 기억나는 문구)
- 혹시 2·3차시가 아니라 다른 차시(예: 2차시 `regular_paleolithic`)였을 가능성

### 2-3. 실행 단계

- **제보 내용이 확인되면**: 해당 문장만 최소 수정하고, 같은 방식으로 `scripts/01_validate_game_data.py`·브라우저 회귀로 검증한다.
- **제보 내용이 끝내 특정되지 않으면**: 이 항목을 "내부 정합성 이상 없음, 원문 오타 재현 불가로 종결"로 `BACKLOG.md`에 기록하도록 Codex에 전달한다(단, `BACKLOG.md` 편집은 Codex 소유 문서 규칙에 따라 내가 직접 쓰지 않는다).

---

## 1. 항목 C — 유물 활용 미니 기능: 유물 복원 단서 맞추기 (실행 대상)

### 1-1. 설계 방침

노트의 아이디어 묶음 B 중 서버가 필요 없고 기존 자산을 가장 많이 재사용할 수 있는 **"유물 복원 퍼즐"**을 첫 실험으로 선택한다. "전시관 꾸미기"는 배치/꾸미기 UI가 새로 필요해 범위가 커지므로 이번에는 제외한다.

기존 `js/miniGames.js`의 `MiniGameEngine`은 이미 두 개의 미니게임(카드 짝맞추기, 연표 순서 맞추기)을 같은 패턴(컨테이너 렌더 → 클릭 상호작용 → `encyclopedia` 보상 연동)으로 제공한다. 연표 순서 맞추기의 "섞인 항목을 올바른 순서로 배열" 메커니즘을 그대로 재사용해 세 번째 게임을 추가하면 새 UI 프레임워크나 드래그 앤 드롭 라이브러리 없이 구현할 수 있다.

**게임 개념**: 학생이 이미 도감에서 획득한(unlockedArtifacts) 유물 중 하나를 골라, 그 유물을 설명하는 짧은 단서 3개를 무작위 순서로 보여주고, 원래 관찰→비교→추론 순서로 재배열하면 "복원 완료"로 처리한다. 점수보다 "왜 이 순서인지" 근거를 함께 보여주는 데 초점을 둔다.

### 1-2. 데이터 확장

`data/artifacts.json`의 각 항목에 선택적 필드 `restoreClues`(문자열 배열, 정답 순서)를 추가한다. 처음에는 이미 해금 가능한 유물(도감에 실제로 등록되는 항목) 위주로 8~12종만 채우고 나머지는 필드가 없으면 게임 후보에서 제외한다. 문구는 각 MUD의 `narrative`/`glossary`에서 이미 검증된 내용만 재사용해 새 역사적 주장을 만들지 않는다.

예시(`art_2` 암사동 빗살무늬 토기):
```json
"restoreClues": [
  "강가·바닷가에 모래밭이 있는 곳에 정착했다",
  "모래에 꽂아 세우기 좋게 바닥을 뾰족하게 빚었다",
  "굽는 동안 갈라지지 않도록 겉에 빗살무늬를 새겼다"
]
```

### 1-3. 코드 변경

- `js/miniGames.js`: `startRestorationGame()` 메서드 추가. `encyclopedia.data.unlockedArtifacts`와 `artifacts.json`을 대조해 `restoreClues`가 있고 이미 해금된 유물만 후보로 삼는다(획득하지 않은 유물의 서술을 미리 보여주지 않기 위함). 후보가 0개면 "먼저 MUD를 완료해 유물을 모아보세요" 안내만 표시한다.
- 정렬 판정·클릭 교체 로직은 `startTimelineGame`/`renderTimelineUI`의 기존 구현을 그대로 재사용하도록 공통 헬퍼로 뽑아 중복을 줄인다.
- 완료 시 새 배지 `badge_restoration_master`(가칭)를 `encyclopedia.js`의 `badgesList`에 추가하고 `unlockBadge`로 지급한다.
- `index.html`의 "🎮 역사 미니게임" 카드(현재 [index.html:76-81](index.html:76)) 안에 컨테이너 `div`와 버튼 하나만 추가한다. 새 섹션·새 탭은 만들지 않는다.

### 1-4. 검증 계획

- 정적: `node --check js/miniGames.js`, `node --check js/encyclopedia.js`, `python scripts/01_validate_game_data.py`
- 브라우저:
  1. 유물을 하나도 획득하지 않은 새 상태에서 버튼 클릭 → 안내 메시지 확인.
  2. MUD 1개 완료 후 유물 1종 획득 → 복원 퍼즐에 해당 유물이 후보로 나오는지 확인.
  3. 단서를 올바른 순서로 배열 → 완료 처리·배지 지급·사운드 확인.
  4. 모바일 폭(iPad 세로 기준)에서 클릭 동작과 레이아웃 확인.

### 1-5. 위험 요소와 대응

| 위험 | 대응 |
|---|---|
| 아직 획득하지 않은 유물의 서술을 미리 노출해 스포일러가 됨 | 후보를 `unlockedArtifacts`로만 제한 |
| `restoreClues` 문구가 MUD 서술과 미묘하게 달라 학생이 혼란 | 각 문구는 대응 MUD의 `narrative`/`glossary` 원문에서 그대로 발췌·축약 |
| 정렬 로직 중복 구현으로 유지보수 부담 증가 | 연표 게임과 공통 헬퍼로 통합 |
| 새 배지 ID가 기존 저장 데이터와 충돌 | `badgesList`에 신규 ID만 추가, 기존 `unlockedBadges` 배열 구조는 변경하지 않음(로컬스토리지 하위 호환 유지) |

### 1-6. 작업 범위 외

- 유물 전시관 꾸미기, 조합 탐구, 카드 강화형 성장 — 이번 실험 결과를 본 뒤 별도 계획으로 분리.
- 서버 저장, 계정, 실시간 경쟁·순위표.

---

## 2. 권장 실행 순서

1. `data/artifacts.json`에 `restoreClues` 8~12종 작성 (기존 MUD narrative/glossary 원문 발췌).
2. `js/miniGames.js`에 `startRestorationGame()` 추가, 연표 게임 로직과 공통 헬퍼로 통합.
3. `js/encyclopedia.js`에 `badge_restoration_master` 배지 추가.
4. `index.html` 미니게임 카드에 버튼·컨테이너 추가.
5. §1-4 검증 계획대로 정적·브라우저 회귀 확인 후 결과를 이 문서 §1-5 아래에 기록.
6. 완료 후 `walkthrough.md`/`project_context.md` 갱신은 Codex 소유 규칙에 따라 요약만 전달한다.

## 3. 완료 기준

- 정적 검증(구문 검사, `python scripts/01_validate_game_data.py`) 통과.
- 브라우저 회귀에서 기존 MUD 분기·보상·도감 등록 동작이 변경되지 않음.
- 스크린샷 또는 콘솔 로그로 복원 퍼즐 동작 결과를 남긴다.
- 변경 파일과 검증 결과를 커밋 메시지와 이 문서 §1-4 아래에 기록한다.

## 부록: 실행하지 않은 항목의 후속 확인처

- 항목 A 후속 배치가 필요하면 [`implementation_plan_choice_quality_batch.md`](implementation_plan_choice_quality_batch.md)와 [`choice_bias_audit.md`](../audits/choice_bias_audit.md)를 기준으로 Codex와 조율한다.
- 항목 B는 Codex의 수정이 커밋되면 종결로 간주한다. 학생이 지적한 정확한 문구가 그 수정과 다르다면 사용자 확인이 필요하다.
