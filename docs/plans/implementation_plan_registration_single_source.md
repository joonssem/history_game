# 구현 계획: MUD 등록 경로 단순화

## 상태

`in-progress` — 인덱스 주·보조 구분과 포털 단일 경로·주요 브라우저 회귀 완료. **보조 노출은 2026-09-07 구현·검증 완료**(아래 §실행 결과). 남은 보류 항목은 `lessonKeys` 도입 여부와 실제 물리 기기 확인뿐.

## 실행 결과 (2026-09-07, Claude)

- **`app.js` 레거시 조건문 fallback**: `!mudIndexData.length`(인덱스 로드 실패) 안에만 갇혀 있는 것을 코드로 재확인했다. 정상 운영 중에는 절대 실행되지 않는 죽은 경로이지만, `_index.json` fetch가 실패하는 극단적 상황(배포 오류 등)에서 포털 전체가 빈 화면이 되는 것을 막아주는 유일한 안전망이다. **제거하지 않고 유지하기로 판단**했다 — 위험 대비 비용이 0에 가깝고(런타임에 전혀 실행 안 됨), 제거 시 잃는 것(전체 포털 마비 방지)이 더 크다.
- **보조(supplementary) MUD 노출**: 감사 결과 `regular_myeongnyang`(2단원 7차시)·`regular_korean_war`(3단원 10~12차시)가 `placement: "supplementary"`로만 등록돼 있고 **포털 어디에도 노출 경로가 없어 완전히 도달 불가능한 상태**였다(3단원 44·45번 차시 카드는 primary MUD도 없어 이전엔 아예 빈 카드였다). `findSupplementaryMud()`를 추가하고, primary 버튼 아래 `.btn.secondary` 스타일의 "+확장 활동" 보조 버튼을 렌더링하도록 `js/app.js`를 수정했다.
  - `regular_korean_war`는 `lessonNumbers: [10, 11, 12]`라서 관련 카드 3장(44·45·46번 차시) 모두에 버튼이 뜬다 — 같은 활동이 3번 노출되는 건 다소 중복이지만, 이전에는 그중 2장(44·45)이 아예 빈 카드였던 것에 비하면 개선이다. 완전한 중복 제거는 이번 범위 밖으로 남긴다.
  - 검증: `node --check js/app.js`, `scripts/08_validate_mud_catalog.py` PASS. 브라우저에서 데스크톱·태블릿(768×1024) 두 뷰포트로 1·2·3단원 전체 카드를 확인, 보조 버튼 클릭 시 `regular_myeongnyang`이 정상 오픈되는 것을 `MudEngine.currentMudData.mudId`로 확인, 콘솔 에러 0건.
  - 캐시 이슈: `index.html`의 `js/app.js?v=...` 캐시 버스터를 갱신하지 않으면 브라우저가 이전 `app.js`를 계속 쓴다는 것을 이번에 다시 확인했다(버전 문자열을 `20260907-supplementary1`로 갱신, `APP_VERSION`도 `2026.09.07-p7`로 동기화). 앞으로 `js/app.js`를 수정할 때마다 이 버전 문자열도 함께 올려야 한다.

## 목표

`data/mud/_index.json`을 Regular MUD 등록의 단일 원천으로 삼아 새 MUD 추가 시 `js/app.js`의 제목·차시 조건문을 수정하지 않도록 한다. 기존 Deep-dive 고정 진입, 퀴즈, 미등록 차시 안내는 MUD 등록 매핑과 분리해 유지한다.

## 현재 감사 결과

- `_index.json`에 Regular 28종과 Deep-dive 4종, 총 32개 파일이 등록되어 있다.
- 커리큘럼 48차시 중 `_index.json`과 매칭되는 차시는 39개이며, 도입·정리 차시 등 9개는 의도적으로 MUD가 없다.
- `app.js`에는 인덱스 매칭 뒤 약 140줄의 레거시 조건문이 남아 있다.
- 단순히 `unitId + lessonNumbers`의 첫 일치 항목을 반환하면 다음 중복이 발생한다.
  - 2단원 7차시: `regular_myeongnyang`과 `regular_joseon_diplomacy`
  - 3단원 12차시: `regular_korean_war`와 `regular_post_war`
- 따라서 조건문 제거보다 인덱스의 주·보조 MUD 등록 계약을 먼저 확정해야 한다.

## 결정할 인덱스 계약

1. `placement: "primary" | "supplementary"`를 Regular 항목에 추가한다. 미지정 Regular는 기존 호환성을 위해 `primary`로 취급한다.
2. 한 차시의 포털 기본 버튼은 `primary` 하나만 허용한다.
3. `supplementary` MUD는 포털 기본 차시 버튼의 후보에서 제외하고, 별도 확장 활동 영역에서만 노출한다.
4. 기존 `lessonNumbers`는 당장 유지하되, 구현 단계에서 `lessonKeys` 또는 동일한 고유 차시 키를 도입할지 결정한다. 전역 `lessonNumber`와 단원 내 표시 차시가 다른 현재 데이터 구조를 그대로 혼용하지 않는다.
5. 인덱스 검증 스크립트는 동일한 주 차시·단원에 primary가 2개 이상이거나, Regular 파일이 누락되거나, 존재하지 않는 MUD 파일을 참조할 때 실패해야 한다.

## 구현 순서

### 1. 인덱스 메타데이터 정리 *(1차 완료)*

- 32개 항목의 `placement`와 차시 매핑을 교육적 의도에 맞게 판정한다.
- 중복 차시인 2단원 7차시와 3단원 12차시의 주 MUD를 교육과정 제목과 기존 포털 조건 기준으로 확정했다.
- 기존 제목·보상·스토리 ID는 변경하지 않고 등록 메타데이터만 수정한다.

### 2. 등록 계약 검증 *(1차 완료)*

- 기존 `03_validate_mud_integrity.py`에 placement 유효성, ID 중복, primary 중복 검사를 추가했다.
- 인덱스와 커리큘럼의 매칭 결과를 출력하는 감사 스크립트 또는 검증 보고를 추가한다.
- 48차시 중 MUD 없음이 의도된 9개인지 확인한다.

### 3. 포털 매칭 단순화 *(1차 완료)*

- `findIndexedMud()`가 `placement: "primary"`만 반환하도록 한다.
- `renderCurriculum()`에서 Regular 관련 레거시 조건문을 제거한다.
- 인덱스에 없는 차시는 기존의 퀴즈·탐구·준비 중 안내 분기로 처리한다.
- Deep-dive 진입은 현재처럼 별도 확장 활동 영역에서 유지한다.
- `supplementary` 항목은 기본 매칭에서 제외했다.
- 기존 Regular 조건문은 인덱스 로드 실패 시에만 실행되는 비상 호환 경로로 격리했다.

### 4. 회귀 검증

- 전체 JSON/MUD/정적 자산/런타임 검증을 실행한다.
- 2단원 7차시와 3단원 12차시의 버튼이 의도한 주 MUD로 연결되는지 확인한다.
- 새 Regular MUD를 인덱스에만 추가했을 때 포털에 표시되는지 확인한다.
- 브라우저·태블릿 육안 검증은 현재 브라우저 도구 연결 오류가 해소된 뒤 수행한다.

## 브라우저 회귀 확인 (2026-09-01)

- 2단원 7차시: 기본 포털에 `regular_joseon_diplomacy`만 표시되고 `regular_myeongnyang`은 표시되지 않음.
- 3단원 12차시: 기본 포털에 `regular_post_war`만 표시되고 `regular_korean_war`는 표시되지 않음.
- 두 primary MUD 모두 버튼 클릭 후 해당 MUD 화면으로 진입했으며 콘솔 오류 0건.
- 별도 보조 MUD 노출 영역과 실제 태블릿 육안 검증은 아직 남아 있음.

## 완료 기준

- 새 Regular MUD 등록 시 `app.js` 조건문 수정이 필요 없다.
- 한 차시에 primary MUD가 정확히 하나만 선택된다.
- 보조 MUD와 Deep-dive의 별도 노출 의도가 유지된다.
- 검증 스크립트와 문서가 새 등록 절차를 설명한다.
- 기존 포털·퀴즈·MUD 실행 회귀가 없다.

## 보류 사항

- 보조 MUD를 별도 확장 활동 영역에 노출할지 여부
- `lessonKeys` 도입 여부
- 실제 브라우저·태블릿 확인 — 브라우저 도구 버전 불일치로 보류
