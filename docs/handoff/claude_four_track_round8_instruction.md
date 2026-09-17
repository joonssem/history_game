# 4트랙 라운드 8 지시서 — 조선 후기 콘텐츠를 실제 앱 계약으로 옮기기

> 작성: 2026-09-17, 기획 세션(Opus). 기준: `origin/main` 최신. 결정: `DECISIONS.md` D-035.
> 입력:
> - Codex 감사 `docs/audits/joseon_late_packet_red_team_audit.md`(C1-01~05)
> - 실제 앱 계약 `apps/cooperative-live/convex/scenarios.ts`(**읽기만 한다**)
> - 고려 초기 예시 `early-goryeo-unity`

## §0 공통 규칙

- **`apps/**` 파일은 읽기만 한다.** 앱 등록은 Codex가 한다(D-035).
- main에 push하지 않는다. 남의 파일은 고치지 않는다.
- 사실 대조 규칙은 라운드 4~7과 같다.

### 확정 매핑 (모든 창이 이 모양을 쓴다)

최종 산출물은 `docs/handoff/claude_joseon_late_runtime_scenario.json` 한 파일이다(2단계, 연결 공방이 쓴다). 모양은 앱의 `CooperativeScenario`와 공개 `PublicScenario`를 합친 것이다.

```json
{
  "id": "joseon-late-market",
  "version": 1,
  "publicMeta": { "title": "…", "lesson": "2단원 …차시 조선 후기 사회 변화", "recommendedMinutes": 10 },
  "groupSizes": {
    "3": ["farmer", "bobusang", "recordkeeper"],
    "4": ["farmer", "bobusang", "craftsman", "recordkeeper"],
    "5": ["farmer", "bobusang", "craftsman", "recordkeeper", "laborer"]
  },
  "roles": [
    { "id": "farmer", "icon": "🌾", "name": "농민", "privateInfo": "문장들을 한 문자열로", "interest": "…",
      "firstChoices": [ {"id":"…","label":"…"} ], "evidence": [ {"id":"farmer-…","label":"…"} ] }
  ],
  "sharedPrompt": {
    "question": "…",
    "policies": [ {"id":"…","label":"…"} ],
    "limitations": [ {"id":"…","label":"…"} ],
    "connections": [ {"id":"…","label":"…"} ],
    "whyTogetherStem": "서로 다른 사람의 자료를 함께 보면"
  },
  "commonEvidenceByGroupSize": { "3": [ {"id":"common-craftsman","label":"공통 자료: …"} ], "4": [], "5": [] },
  "teacherStages": ["role", "first", "share", "draft", "confirm", "finished"],
  "interventions": { "hint": "…", "deepen": "…" },
  "sources": [ { "claim": "…", "url": "…", "accessedAt": "2026-09-…" } ]
}
```

| 패킷 초안 | 앱 계약으로 | 규칙 |
|---|---|---|
| `firstJudgment.choices` | 모든 역할의 같은 `firstChoices` | 고려와 같게 3~4개. "아직 잘 모르겠다"는 앱 선택지로 두지 않는다. 앱에는 이유 입력이 따로 없다. |
| 역할 근거 여러 개 | 역할당 `evidence` **1개** | 관문 설계실이 대표 근거를 고른다 |
| `firstJudgment` 변화 선택지 | `sharedPrompt.policies` | 장시·화폐·농사법 변화 3개. 모둠이 2개를 고른다 |
| `limitOptions` | `limitations` | 2~3개. "이 자료만으로 알 수 없다" 형태 |
| `targetOptions` + 주장 | `connections` | "누구에게 어떤 영향"이 드러나는 연결 문장 3개. 이득과 어려움을 함께 담는다 |
| `sharePrompt`, 질문 틀 | 앱에 넣지 않음 | 교사 자료 문서로 옮긴다 |
| 3인 공통 수공업자 자료 | `commonEvidenceByGroupSize.3` | 읽기 전용 공통 자료. 공동 근거 계산에는 들어가지 않는다(앱 현재 동작) |

## 진행 순서

- **1단계(지금, 세 창 동시)**: 관문 설계실, 대조실, 조작대
- **2단계(1단계 통합 뒤)**: 연결 공방이 JSON 한 파일로 조립하고, 패킷 초안 `data/cooperative/joseon_late_packet.draft.json`을 저장소에서 지운다.

## §1 관문 설계실 — 역할 본문 확정본 v2

- **파일**: `docs/handoff/claude_joseon_late_role_cards.md`
- **할 일**
  1. **C1-04 반영**: 직접 근거가 없는 추론 문장 세 곳을 역할의 추론·걱정으로 낮춘다.
     - 보부상의 값 오르내림 이문
     - 수공업자의 안 팔리는 달 살림
     - 품팔이의 농번기 밖 벌이 불안정
     - 예: "~할까 걱정입니다", "~일 때도 있을 것입니다". 사실로 단정하는 문장이 남지 않게 한다.
  2. 역할마다 **대표 근거 1개**를 고른다. `evidence` id와 30자 안팎의 label을 쓰고, 고른 이유를 한 줄 적는다.
     - 5개 역할의 근거가 서로 겹치지 않아야 한다.
     - 기록관 근거는 "자료의 한계"를 가리킨다.
  3. `privateInfo`는 앱에서 한 문자열로 이어진다. 이어 읽어도 자연스럽게 다듬는다(3~5문장).
  4. **줄 끝의 출처·편집 메모를 학생 문장과 분리한다.** 문장은 목록 항목에만 쓰고, 메모는 항목 아래 들여쓴 "메모:" 줄로 옮긴다. C1-05의 `--cards` 오탐 원인이다.
  5. 상태를 "확정(v2, 앱 계약)"으로 바꾼다.

## §2 대조실 — 앱용 `sources` 목록과 연결 문장 검토 기준

- **파일**: `docs/audits/joseon_late_source_review.md`
- **할 일**
  1. 앱 `sources` 형식(`claim`, `url`, `accessedAt`)으로 **학생 화면 사실 문장마다** 출처 항목을 정리한 절을 추가한다(고려 초기 4건 참고).
     - 원문이 확인한 사실만 `claim`에 적는다.
     - 추론 문장은 `sources`에 넣지 않는다. 대신 "추론(출처 없음)" 목록에 따로 적는다(C1-04 수용 기준).
  2. `connections` 문장이 지켜야 할 범위를 3~5줄로 적는다. "누구에게 이득/어려움"을 말할 때 원문이 허용하는 대상과 표현이다. 예를 들어 "부유한 농민"은 되지만 "지주가 모두 이득"은 안 된다.
  3. `target_landlord` 삭제(D-035 5)에 따라 지주 관련 서술이 남아 있으면 표시만 한다.

## §3 조작대 — `scripts/15` 오탐 수정과 앱 계약 검사

- **파일**: `scripts/15_validate_cooperative_packet.js`, `walkthrough.md`
- **할 일**
  1. **C1-05 문장 분리 수정**
     - 마침표·물음표·느낌표·줄바꿈에서만 나눈다. 어중의 "다"·"요"에서는 나누지 않는다.
     - 회귀 fixture를 넣는다: 현재 기록관 `interest`, "내다 팔아", "다 조사".
  2. **부정문 fixture**: 기록관 `interest`의 "모든 사람…알 수 없다"는 경고하지 않아야 한다.
  3. **`--cards`**: 항목 아래 "메모:" 줄과 줄 끝의 `[...]`·백틱 메모를 제거하고 학생 문장만 센다.
  4. **`--runtime <파일>` 추가**: 위 "확정 매핑" 모양의 JSON을 앱 계약 기준으로 검사한다. `convex/scenarios.ts`의 타입과 `students.ts` 서버 검사를 **읽고** 규칙을 옮긴다.
     - 필수 필드가 모두 있는가
     - `groupSizes`의 id가 모두 `roles`에 있는가
     - 역할마다 `evidence` ≥ 1, `firstChoices` ≥ 2인가
     - `policies` ≥ 3(모둠이 2개를 고르므로), `limitations` ≥ 1, `connections` ≥ 1인가
     - `commonEvidenceByGroupSize`에 3·4·5 키가 모두 있는가
     - `sources` ≥ 1이고 각 항목에 `claim`·`url`·`accessedAt`이 있는가
     - **앱 계약에 없는 필드**(`sharePrompt`, `targetOptions`, `questionFrames` 등)는 실패로 낸다(C1-01 "버려지는 학생용 필드 0개")
     - 과잉 단정어와 길이 검사는 그대로 적용한다
  5. 기존 계획서 모델 검사(`--final`)는 2단계에서 패킷 초안이 지워지므로, 대상 파일이 없으면 건너뛰게 한다.
- 보고에 적을 것: `--runtime`은 **콘텐츠 모양 검사**이며, 실제 등록 가능 여부는 Codex의 `validateScenarioRegistry()`와 앱 테스트로 판정한다(C1-05 수용 기준).

## §4 연결 공방 — 2단계 (기획 세션이 알린 뒤)

- `docs/handoff/claude_joseon_late_runtime_scenario.json`을 확정 매핑대로 조립한다. 역할 본문은 §1 v2, 출처는 §2 목록을 쓴다.
- `sharePrompt`·질문 틀은 `docs/handoff/claude_joseon_late_teacher_sticky_wall.md`로 옮긴다.
- `git rm data/cooperative/joseon_late_packet.draft.json`(C1-02 부분 수용).
- 완료 기준: `node scripts/15_validate_cooperative_packet.js --runtime docs/handoff/claude_joseon_late_runtime_scenario.json`이 PASS해야 한다.
