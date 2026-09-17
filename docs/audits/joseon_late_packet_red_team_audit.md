# 조선 후기 협동 패킷(C1) 읽기 전용 red-team 감사

- 감사일: 2026-09-17
- 대상 기준: `origin/main` `ad74ccb`
- 요청: `docs/handoff/codex_joseon_late_packet_audit_request_20260917.md`
- 역할: audit agent(Codex)
- 변경 원칙: 패킷·앱·검증기 문안과 코드는 고치지 않고 문제·재현·수용 기준만 기록한다.

## 1. 결론

**판정: C1 역사 콘텐츠는 조건부 수용 가능하지만, T1 런타임 등록 착수는 NO-GO다.**

가장 먼저 확인하도록 요청받은 §2-4 결과, 패킷이 따르는 계획서상의 `CooperativeScenario`와 고려 초기 활동이 실제로 사용하는 타입·화면·서버 검증 계약이 서로 다르다. 단순 필드명 변경으로 옮길 수 있는 차이가 아니라 공동 산출물의 의미가 다르다. `scripts/15_validate_cooperative_packet.js --final`은 통과하지만 이 차이를 검사하지 않는다.

역사 서술에서는 대동법 시기 오류가 없고, 광작→품팔이는 “일부” 범위를 지켰으며, `ev6_mining`도 설점수세제 범위로 낮아졌다. 다만 출처 검토가 “확인 불가”로 확정한 경제적 추론 세 곳이 여전히 학생 화면 문장에 남아 있다.

### 심각도 요약

| ID | 심각도 | 결과 |
|---|---|---|
| C1-01 | **P1 · T1 차단** | 패킷 계약과 실제 고려 초기 런타임 계약이 구조·의미 양쪽에서 불일치 |
| C1-02 | **P1 · T1 차단** | 최종 역할 본문을 둔 `data/cooperative` 경로가 현재 GitHub Pages에서 공개됨 |
| C1-03 | **P1** | 대상–주장–근거 설계가 현재 런타임의 정책 2개–역할 근거 2개 설계로 손실 없이 변환되지 않음 |
| C1-04 | **P2** | “확인 불가” 경제 추론 세 곳이 `interest`·`privateInfo`에 남음 |
| C1-05 | **P2** | `scripts/15`의 문장 분리·부정문·문서 메모 제거가 오탐을 만들며 실제 타입 호환성을 검사하지 않음 |

## 2. 발견 사항

### C1-01 — 계획 패킷과 실제 런타임 타입이 호환되지 않는다

- 심각도: **P1 · T1 착수 차단**
- 위치:
  - `data/cooperative/joseon_late_packet.draft.json`
  - `apps/cooperative-live/convex/scenarios.ts:5-32`
  - `apps/cooperative-live/shared/scenario.ts:31-40`
  - `apps/cooperative-live/convex/students.ts:368-439, 534-585`
  - `apps/cooperative-live/components/LiveStudentActivity.tsx:18-26, 236-295`

#### 재현

1. 패킷에는 `title`, `lessonLabel`, `commonPrompt`, `roles[].evidenceId`, `roles[].sharePrompt`, `groupVariants`, `firstJudgment`, `synthesis`, `stickyWall`이 있다.
2. 실제 공개 타입은 `publicMeta`, `roles` 공개 목록, `groupSizes`를 요구한다.
3. 실제 서버 타입은 역할마다 `firstChoices`와 `evidence[]`, 그리고 `sharedPrompt.policies/limitations/connections/whyTogetherStem`, `commonEvidenceByGroupSize`, `teacherStages`, `sources`를 요구한다.
4. `node scripts/15_validate_cooperative_packet.js --final`은 이 차이에도 PASS를 반환한다.

#### 차이 목록

| 패킷 | 실제 고려 초기 계약 | 영향 |
|---|---|---|
| `title`, `lessonLabel` | `publicMeta.title`, `publicMeta.lesson`, `recommendedMinutes` | 시간 값이 패킷에 없음 |
| `commonPrompt` | 대응 필드 없음 | 학생 화면에 표시할 경로 없음 |
| `roles[].sharePrompt` | 대응 필드 없음 | 역할별 말하기 질문이 현재 UI에 표시되지 않음 |
| 역할 공통 `firstJudgment` | 각 역할의 `firstChoices` | 질문·선택지의 소유 위치가 다르고 `prompt`·`reasonPrompt` 대응 없음 |
| `roles[].evidenceId` + 전역 `evidenceOptions` | 역할별 `evidence[]` | 어떤 라벨을 어느 역할 첫 근거로 쓸지 변환 규칙이 없음 |
| `groupVariants` | 공개 `groupSizes` + 서버 `commonEvidenceByGroupSize` | 역할 배치와 공통 근거를 두 레지스트리에 나누어야 함 |
| `synthesis.targetOptions/claimPrompt/claimMaxLength` | 대응 필드 없음 | 대상 선택·자유 주장 문장이 런타임에서 사라짐 |
| `minEvidence/minDistinctRoleSources` | 서버가 정책 2개·모둠 역할 2개를 하드코딩 | 패킷 수치가 실제 판정에 쓰이지 않음 |
| `stickyWall` | 대응 필드 없음 | 완료 화면·복사 문자열로 연결되지 않음 |
| 없음 | `teacherStages`, `sources` | 런타임 필수 필드가 패킷에 없음 |

#### 수용 기준

다음 중 하나를 기획 결정으로 확정해야 한다.

1. 실제 런타임 타입을 패킷의 대상–주장–근거–한계 모델로 바꾸거나,
2. 패킷에서 실제 타입으로 옮기는 **명시적이고 손실 없는 변환 계약**을 작성한다.

어느 쪽이든 다음 자동 검사가 필요하다.

- 변환된 조선 후기 시나리오가 `validateScenarioRegistry()`를 통과한다.
- 공개 카탈로그에는 역할 비공개 본문이 없다.
- 3·4·5인 배치, 최초 판단 질문, 역할별 말하기 문구, 공동 산출물, sticky-wall 문자열이 실제 화면 필드까지 대응한다.
- 패킷에 있는데 런타임에서 버려지는 학생용 필드가 0개다.
- 알 수 없는 ID·version은 최신판으로 대체하지 않고 중단한다.

### C1-02 — 역할 비공개 본문을 둔 패킷 경로가 GitHub Pages에 공개된다

- 심각도: **P1 · T1 착수 차단**
- 위치: `data/cooperative/joseon_late_packet.draft.json`
- 재현 URL: `https://joonssem.github.io/history_game/data/cooperative/joseon_late_packet.draft.json`

#### 재현

2026-09-17 감사 시 HEAD 요청이 `HTTP/1.1 200 OK`, `Content-Type: application/json`을 반환했다. GET 본문도 내려왔으며, 현재 배포본은 라운드 6의 오래된 자리표시자·구 역할 ID를 포함한 초안이었다. 즉 `data/cooperative`는 배포 제외 경로가 아니다. 최신 main이 배포되면 확정 `roles[].privateInfo`도 같은 예측 가능한 URL에 놓인다.

이것은 개인정보 유출은 아니지만 “학생은 자기 역할 자료만 받는다”는 정보 비대칭 수업 계약과, 계획서의 “전체 역할 본문은 서버 전용 레지스트리” 원칙에 어긋난다. 공개 Git 저장소 자체를 비밀 저장소로 볼 수는 없지만, 운영 URL이 역할 카드 전체를 직접 제공하는 상태는 별도 문제다.

#### 수용 기준

- 최종 역할 본문 원본을 GitHub Pages가 배포하는 경로에서 제외한다.
- 운영 URL의 해당 JSON은 404이거나 학생용 역할 본문을 포함하지 않아야 한다.
- 조선 후기 시나리오를 서버 전용 모듈에 등록하고, production client bundle에서 다른 역할 `privateInfo`와 출처 URL이 검출되지 않아야 한다.
- 공개 저장소라 완전한 비밀을 보장하지 못한다는 위협 모델을 운영 문서에 명시한다.

### C1-03 — 공동 해석 의미와 근거 선택 규칙이 아직 닫혀 있지 않다

- 심각도: **P1**
- 위치:
  - `data/cooperative/joseon_late_packet.draft.json:80-106`
  - `apps/cooperative-live/convex/students.ts:558-585`
  - `apps/cooperative-live/components/LiveStudentActivity.tsx:277-295`

#### 재현과 영향

1. 패킷은 “대상 1개 + 주장 + 근거 2개 이상 + 한계”를 요구한다.
2. 현재 런타임은 “정책 정확히 2개 + 모둠원 역할 정확히 2개 + 연결 1개 + 한계 1개”만 저장한다. 대상과 자유 주장은 없다.
3. 런타임 UI는 역할별 `evidence[0]`만 표시한다. 농민·보부상·수공업자에게 2개씩 있는 패킷 근거 중 무엇을 보존할지 정해져 있지 않다.
4. 3인 공통 자료 `jangsi-craftsman-summary`는 패킷에서 `roleId`가 없다. 현재 런타임은 공통 자료를 읽기 전용으로 보여 주지만 초안의 `evidenceRoleIds`에는 모둠원 역할만 허용한다. 따라서 빠진 수공업자 관점을 공동 근거로 선택할 수 없다.
5. `target_landlord`는 직접 대응하는 역할·근거가 없다. 현재 검증기는 대상과 근거의 연결을 검사하지 않아 무관한 근거 두 개로도 형식상 완성될 수 있다.
6. `limitOptions` 세 개는 모두 그럴듯한 한계이지만, 선택한 대상·주장·근거와의 의미 일치 검사가 없다. 예를 들어 영향의 유불리를 주장한 뒤 `limit_winner`로 유불리를 알 수 없다고 마무리하는 조합도 구조상 막히지 않는다.

#### 정보 비대칭 판정

- 긍정: 역할별 본문은 농업·유통·수공업·기록 한계·임노동으로 구분되어 있다. `minDistinctRoleSources: 2`가 실제로 집행된다면 한 역할 카드만으로 완료할 수 없다. `firstJudgment`에도 객관식 정답은 없다.
- 한계: `scripts/15`는 `minDistinctRoleSources`가 숫자 2 이상인지 볼 뿐, 3·4·5인별 제출 가능한 조합을 실행하지 않는다. 한 카드 단독 제출 차단과 공통 자료의 출처 계산은 아직 증명되지 않았다.

#### 수용 기준

- 대상–근거 허용 관계와 한계의 의미 관계를 시나리오 데이터 또는 서버 판정으로 정의한다.
- `target_landlord`에 직접 근거를 추가하거나 선택지에서 제거한다.
- 3인 공통 자료가 공동 근거로 선택 가능한지 명시하고, 가능하다면 서버 계약이 역할 없는 공통 근거를 출처 하나로 안전하게 계산해야 한다.
- 3·4·5인 각각에 대해 단일 역할 근거 조합은 실패하고, 서로 다른 두 출처의 정상 조합은 통과하는 회귀 테스트를 둔다.
- 최초 판단의 네 선택지는 어느 것도 정답/오답으로 채점하지 않는다는 계약을 유지한다.

### C1-04 — 출처 검토가 “확인 불가”로 남긴 추론이 학생 문장에 남아 있다

- 심각도: **P2**
- 위치:
  - `data/cooperative/joseon_late_packet.draft.json:25`
  - `data/cooperative/joseon_late_packet.draft.json:32-34`
  - `data/cooperative/joseon_late_packet.draft.json:50-52`
  - `docs/audits/joseon_late_source_review.md:119,126,180,206-208`

#### 일치 확인

- 대동법·공인 문장은 패킷에 없다. 1608년 경기 시행→1708년 전국 완료를 “즉시 전국화”로 잘못 쓰는 문제도 없다.
- 광작→품팔이는 “몰락 농민 중 일부”, “모두가 같은 길을 걷진 않는다”로 범위를 지켰다.
- `ev6_mining`은 “정부 허가 받은 사람이 은광 등을 캐고 세금 냈다”로 좁혀 설점수세제 범위와 맞는다.

#### 남은 불일치

- 보부상 `interest`: 곡식·물건 값의 오르내림을 이용해 이문을 남긴다는 구체 서술은 원문을 확정하지 못했다.
- 수공업자 `privateInfo`·`interest`: “안 팔리는 달에는 살림이 어렵다/불안정하다”는 서술은 상식적 추론이지만 직접 근거를 찾지 못했다.
- 품팔이 `privateInfo`·`interest`: 농번기 밖 벌이 불안정은 타당한 추론이나 직접 근거는 확인되지 않았다.
- 기록관의 고을별 기록 편차도 직접 근거는 없지만, 역할이 밝히는 조사 범위 한계라는 성격이므로 위험은 상대적으로 낮다.

위 문장들은 오류로 확인된 것이 아니라 **검증된 사실과 교과적 추론의 경계가 데이터에 표시되지 않은 상태**다.

#### 수용 기준

- 직접 근거가 없는 문장은 “그럴 수 있습니다”, “걱정합니다”처럼 역할의 추론·바람임이 드러나게 낮추거나,
- 시나리오 `sources`에 `claimScope: inference`와 근거 범위를 명시해 런타임 등록 검토자가 사실 문장으로 오인하지 않게 한다.

### C1-05 — `scripts/15`가 실제 위험을 놓치고 길이·단정 경고에는 오탐이 있다

- 심각도: **P2**
- 위치: `scripts/15_validate_cooperative_packet.js:65-68, 127-151, 174-212, 294-372`

#### 재현

```powershell
node scripts/15_validate_cooperative_packet.js --final
node scripts/15_validate_cooperative_packet.js --cards
```

- `--final`은 자리표시자 0곳으로 PASS하지만 C1-01의 실제 타입 불일치를 보지 않는다.
- `splitSentences()`가 구두점뿐 아니라 공백 앞의 모든 `다`·`요`를 경계로 취급한다. 그 결과 패킷의 실제 4문장 농민 카드를 6문장, 5문장 수공업자 카드를 6문장, 6문장 기록관 카드를 8문장으로 센다. “내다 팔아”, “다 조사” 같은 문장 내부가 잘린다.
- 같은 잘못된 분할 때문에 기록관 `interest`의 “모든 사람…알 수 없다”가 “모든 사람…사정을 다”와 “알 수 없다”로 갈라져 과잉 단정 경고가 난다.
- `--cards`는 학생 문장 뒤의 대괄호 출처·편집 메모 전체를 제거하지 않아 길이 경고에 교사용 메모가 섞인다.
- 검증기는 `targetOptions`–`evidenceOptions` 의미 연결, ID 중복, `claimMaxLength`, 역할별 학생용 필드 필수성, 실제 런타임 변환 가능성을 검사하지 않는다.

#### 수용 기준

- 문장 분리는 마침표·물음표·느낌표·명시적 줄바꿈을 기본으로 하고, 조사·부사 `다`와 어중 `요`에서는 나누지 않는 회귀 테스트를 추가한다.
- 부정문 오탐 테스트에 현재 기록관 `interest`를 고정 fixture로 넣는다.
- `--cards` 길이 계산 전에 줄 끝의 출처·편집 메모 전체를 제거하고 학생에게 보이는 문자열만 센다.
- 계획 패킷→실제 서버 시나리오 변환 결과를 `validateScenarioRegistry()`와 런타임 테스트가 검사하도록 한다. `scripts/15` 단독 PASS를 앱 등록 가능 판정으로 쓰지 않는다.

## 3. 문제 없는 항목

- D-034 역할 ID·5인 품팔이·3인 기록관 유지가 패킷과 역할 카드 문서에서 일치한다.
- 3인 변형은 역할 겸임 없이 공통 수공업자 자료를 둔다.
- `firstJudgment` 네 선택지에는 채점 가능한 정답이 없고 “아직 잘 모르겠다”를 허용한다.
- 역할 카드 한 장의 사실 범위는 대체로 분리되어 있으며, 공통 질문만으로 다른 역할의 구체 근거가 노출되지는 않는다.
- `limitOptions`는 모두 과잉 일반화를 막는 방향이다.
- `node scripts/15_validate_cooperative_packet.js --final`은 자리표시자 0곳과 D-034 참조 무결성을 확인한다.

## 4. 검증 기록

| 명령·확인 | 결과 |
|---|---|
| `node scripts/15_validate_cooperative_packet.js --final` | PASS, 자리표시자 0곳, 비차단 경고 14건 |
| `node scripts/15_validate_cooperative_packet.js --cards` | PASS, 경고 2건(이 중 농민 길이는 편집 메모 혼입) |
| `python scripts/04_validate_mud_contract.py` | PASS |
| `node scripts/05_test_simulator_runtime.js` | PASS |
| `node scripts/13_audit_inquiry_combinatorics.js` | PASS, 생성 날짜만 바뀐 보고서는 원복 |
| `node scripts/14_lint_inquiry_semantics.js` | PASS, 생성 날짜만 바뀐 보고서는 원복 |
| `apps/cooperative-live: npm run check` | PASS: lint, TypeScript, 단위 17건, Convex 2건, production build |
| GitHub Pages 패킷 URL HEAD/GET | HTTP 200, 현재는 오래된 라운드 6 초안 공개 상태 |

첫 `npm run check`는 샌드박스의 하위 프로세스 생성 제한으로 Vitest 시작 시 `spawn EPERM`이 났다. 같은 명령을 승인된 비샌드박스 환경에서 재실행해 전체 PASS를 확인했다. 패킷은 아직 앱에 연결되지 않았으므로 이 PASS는 기존 고조선·고려 초기 기준선이 정상이라는 뜻이며, 조선 후기 패킷의 타입 호환을 증명하지 않는다.

## 5. 권고 순서

1. C1-01의 단일 계약을 먼저 결정한다. 이 결정 전에는 T1 시나리오 등록 코드를 작성하지 않는다.
2. 서버 전용 저장 위치와 GitHub Pages 제외 경계를 정해 C1-02를 해소한다.
3. 대상–근거·3인 공통 근거·한계 조합을 닫고 실제 3·4·5인 판정 테스트를 만든다.
4. 확인 불가 추론 문장을 사실/추론으로 구분한다.
5. `scripts/15` 오탐을 고치고 실제 런타임 계약 검사를 연결한다.

이 다섯 항목을 충족한 뒤 조선 후기 시나리오를 서버 레지스트리에 추가하고 다시 읽기 전용 감사를 요청한다.
