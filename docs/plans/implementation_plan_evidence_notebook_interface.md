# 구현 계획 — 근거 수첩과 최종 논증 인터페이스 설계서 (아이디어 4)

작성: Claude (2026-09-02) — **설계서만. 코드·JSON 변경 없음.**
상태: **제안 — 사용자·Codex 확정 대기.** 이 문서는 착수 전 인터페이스를 먼저 굳히기 위한 것이며, 실제 구현은 별도 승인 후 진행한다.

## 0. 배경과 관계 문서

이전 대화에서 제안한 해결 아이디어 5종(자유도 0~100%) 중 4번째, "근거 수첩과 최종 논증"의 인터페이스 설계서다.

| 선행 작업 | 관계 |
|---|---|
| `hotspot-choice` 프로토타입(커밋 `bf430a8`) | 아이디어 3번(자유도 50%) — 이미 구현·검증 완료. 이번 4번(자유도 75%)은 그 위에 "누적 상태"를 얹는 것이라 상호 배타적이지 않고 같은 스테이지에서 공존 가능(§9 참고). |
| `implementation_plan_deep_dive_redesign.md`(워크트리 `claude-deep-prehistoric`) | 이 아이디어를 최초 제안한 문서. §3.4 참고. |
| `claude_track_b_deep_dive_result.md` | "다음 파일럿에 적용할 설계 규칙 1번"(선택지가 단서를 인용)이 이미 4개 Deep-dive 전체에 적용됨 — 이번 설계는 그 인용 관계를 아예 게임 상태로 승격시키는 것. |
| ROADMAP.md NEXT / EXPERIMENTS.md EXP-002 | "해금 유물 2개 관찰·비교·주장·근거" 실험과 같은 계열 — 다만 EXP-002는 MUD 완료 *이후*의 별도 활동이고, 이 설계는 MUD 진행 *중* 자연 발생하는 수첩이라는 점이 다르다. §8에서 관계를 명확히 한다.

## 1. 핵심 개념

지금까지 게이팅한 hotspot 단서는 스테이지를 넘어가면 사라진다 — 확인했다는 사실만 `simActionCount`에 잠깐 남고 다음 스테이지에서 리셋된다. 이 설계는 그 단서를 **세션 동안 누적**시켜, 최종 스테이지에서 학생이 **직접 근거를 골라 논증을 조립**하게 한다.

```text
스테이지 1 단서 확인 → 수첩에 카드 추가
스테이지 4 단서 확인 → 수첩에 카드 추가
   ...
최종 스테이지: "고조선은 실제 국가였다" 같은 주장 제시
            → 학생이 수첩 카드 중 근거가 될 것을 골라 붙인다
            → 고른 카드의 개수·다양성에 따라 엔딩이 갈린다
```

기존 3단계 엔딩 구조(`ending_true`=자료 종합, `ending_normal`=부분 해석, `ending_bad`=재검토)를 그대로 판정 기준으로 재사용한다 — **새 엔딩 카테고리를 만들지 않는다.**

## 2. 데이터 모델

### 2-1. 기존 hotspot에 필드 2개만 추가 (선택 필드, 하위 호환)

```jsonc
{
  "id": "slave-clause",
  "label": "노비가 된 도둑",
  "feedback": "...",
  "evidenceCategory": "law",      // 신규: 이 단서가 속한 자료 유형
  "notebook": true                 // 신규: true면 발견 시 수첩에 카드로 적재. 생략 시 false(기존 동작 그대로)
}
```

- `evidenceCategory`는 자유 문자열이지만 MUD 내에서 일관되게 써야 한다. 제안 어휘: `artifact`(유물) · `site`(유적·건축) · `law`(법·제도 기록) · `narrative`(건국 서사·구전) · `record`(문헌 기록). MUD마다 실제 자료 성격에 맞게 정한다.
- `notebook`을 명시적 opt-in으로 둔 이유: 모든 hotspot이 "논증에 쓸 근거"는 아니다(예: 순수 배경 설명용 단서는 수첩에 안 넣는 게 자연스러울 수 있음). 기본값 false로 두면 **기존 32개 MUD의 어떤 hotspot도 자동으로 수첩에 들어가지 않는다** — 완전한 옵트인.

### 2-2. 최종 스테이지의 새 인터랙션 `argument-builder`

```jsonc
{
  "simulator": {
    "interaction": "argument-builder",
    "type": "info",
    "claim": "고조선은 청동기 문화와 법 기록을 갖춘 실제 국가였다.",
    "minCards": 1,
    "instruction": "🔎 <b>수첩에서 이 주장을 뒷받침할 근거를 골라 붙이세요</b>",
    "outcomeRules": {                 // 선택: 생략 시 §4의 엔진 기본 규칙 사용
      "trueMinCategories": 3,
      "normalMinCards": 1
    }
  }
}
```

- `choices` 배열은 **비워 둔다**(아이디어 3번과 동일한 이유 — 카드 선택 자체가 결정이다).
- `outcomeRules`을 생략하면 엔진 기본값(§4)을 쓴다. MUD마다 다른 기준이 필요할 때만 override.
- `claim`은 화면 상단에 고정 표시되는 주장 문구. 여러 주장을 연속으로 논증하게 하고 싶다면(예: "자료 종합" 스테이지를 2단계로 나누기) `claims: [...]` 배열 확장을 다음 버전 후보로 남긴다 — 이번 1차 설계는 주장 1개로 제한한다.

## 3. 엔진 상태 모델 (`js/mudEngine.js`)

| 상태 | 생명주기 | 비고 |
|---|---|---|
| `engine.evidenceNotebook` | 배열. MUD 시작(`loadMud`/처음 `renderStage("1")` 호출) 시 `[]`로 리셋 | 스테이지를 넘어가도 **유지된다** — 기존 `simulatorState`(스테이지마다 리셋)와 다른 유일한 상태 |
| 카드 형태 | `{ id, label, feedback, category, stageId }` | `stageId`는 어느 스테이지에서 얻었는지 — 나중에 "몇 장 중 몇 장 왔는지" UI에 씀 |
| `engine.argumentSelection` | 배열(카드 id). `argument-builder` 스테이지 진입 시 `[]`로 리셋 | 최종 논증 화면에서 학생이 지금 고른 카드 |

### 3-1. 카드 적재 지점

`processPaleoDiscovery`·`processOrderedHotspot`·`processHotspotChoice`(아이디어 3번 프로토타입) 세 핸들러 모두 "hotspot을 처음 발견했다"는 동일한 순간이 있다(`state.found.push(hotspot.id)` 직후). 그 지점에 공통 호출을 하나 추가한다:

```js
// 세 핸들러 공통, state.found.push(hotspot.id) 직후에 추가
if (hotspot.notebook) engine.addEvidenceCard(hotspot, this.currentStageId);
```

`engine.addEvidenceCard(hotspot, stageId)`는 새 헬퍼 함수 하나만 추가하면 된다(중복 id 방지 후 push). **기존 세 핸들러의 나머지 로직은 전혀 바꾸지 않는다** — 호출 한 줄만 얹는 것이라 회귀 위험이 낮다.

### 3-2. `argument-builder` 전용 핸들러

`interactionHandlers`에 `'argument-builder': 'processArgumentCard'`를 추가하고, 새 함수를 만든다:

```js
processArgumentCard(mode, hotspot, engine) {
  // 이 스테이지에서는 화면의 "카드"가 hotspot이 아니라 수첩 카드다.
  // 클릭 = 토글(선택/해제)이며, "논증 완성" 버튼을 눌러야 확정된다.
}
```

카드 토글 UI는 캔버스 탭이 아니라 **접근성 버튼 목록**(`renderAlternativeControls`와 같은 패턴)을 기본 입력 수단으로 삼는 것을 권장한다(§5). 캔버스 위에 카드 여러 장을 좌표로 배치하는 건 카드 수가 가변적이라 레이아웃이 불안정하다.

### 3-3. 판정 로직 (엔진 기본값)

```js
engine.resolveArgument() {
  const selected = engine.evidenceNotebook.filter(c => engine.argumentSelection.includes(c.id));
  const categories = new Set(selected.map(c => c.category));
  const rules = engine.currentSimulator?.outcomeRules || { trueMinCategories: 3, normalMinCards: 1 };
  if (selected.length === 0) return 'ending_bad';
  if (categories.size >= rules.trueMinCategories) return 'ending_true';
  if (selected.length >= rules.normalMinCards) return 'ending_normal';
  return 'ending_bad';
}
```

이 판정은 기존 모든 Deep-dive 엔딩 설명("자료를 여러 각도로 연결했는가")과 그대로 맞아떨어진다 — 새 채점 철학을 만드는 게 아니라 **이미 있는 3단계 구분을 서술형 선택지 대신 카드 조합으로 표현**하는 것뿐이다.

## 4. UI 레이아웃

### 4-1. 상시 수첩 표시 (선택 사항, 1차 프로토타입에서는 생략 가능)

로드맵 패널 근처에 `📒 근거 3장 수집` 같은 카운터만 두고, 클릭 시 전체 카드를 보여주는 모달은 **2차 확장**으로 미룬다. 1차 프로토타입은 최종 스테이지에서만 카드를 노출해도 개념 검증에는 충분하다.

### 4-2. 최종 논증 스테이지 화면

```text
┌─────────────────────────────────────┐
│  claim: "고조선은 실제 국가였다"       │
├─────────────────────────────────────┤
│  수첩 카드 (토글 버튼, 기존 대체 버튼   │
│  패턴 재사용):                        │
│  [✓ 노비가 된 도둑] [ 속전 50만 전]   │
│  [✓ 가족 연좌 없음] [ 청동기 유물]    │
├─────────────────────────────────────┤
│         [ 논증 완성 ]                │
└─────────────────────────────────────┘
```

- 카드 버튼은 `renderAlternativeControls()`가 이미 하는 `button.disabled`/`aria-pressed`류 토글 패턴을 그대로 재사용한다 — 새 CSS/컴포넌트를 만들지 않는다.
- "논증 완성" 버튼은 `minCards` 미만 선택 시 비활성 상태를 유지한다(기존 `required`+`completion` 게이팅과 동일한 활성/비활성 관례).
- 캔버스(`#mn-canvas`)는 이 스테이지에서 순수 장식(예: 붓과 두루마리 이미지)으로 남기거나, 기존 `scene` 배경을 그대로 쓴다 — 카드 선택은 캔버스 밖 DOM 버튼 목록에서 이뤄진다.

## 5. 접근성

- 카드 선택은 버튼 목록이 1차 입력 수단이므로 스크린리더·키보드 사용자도 캔버스 탭 없이 전체 흐름을 완료할 수 있다(기존 `mn-hotspot-actions` 패턴과 동일한 이유로 이미 이 프로젝트의 접근성 관례에 맞음).
- "논증 완성" 버튼에는 현재 선택 개수를 `aria-label`로 노출한다(예: "논증 완성 (2장 선택됨)").

## 6. 검증 계약 확장

| 파일 | 변경 |
|---|---|
| `simulator_contract.json` | `supportedInteractions`에 `argument-builder` 추가. `hotspotFields`에 `evidenceCategory`·`notebook`을 선택 필드로 문서화. |
| `scripts/03_validate_mud_integrity.py` | (a) reachability BFS가 `argument-builder` 스테이지에서는 `ending_true`/`ending_normal`/`ending_bad` 세 곳 모두로 도달 가능하다고 간주하도록 예외 처리(선택지가 없으므로 `choices[].next`로 못 찾음). (b) `evidenceCategory` 값이 같은 MUD 안에서 최소 2종 이상 쓰였는지 정도의 가벼운 경고(선택 사항 — 다양성 판정이 성립하려면 카테고리가 1종뿐이면 `ending_true`에 영원히 도달 불가). |
| `scripts/04_validate_mud_contract.py` | `argument-builder` 스테이지는 `choices` 필수 조건에서 제외(아이디어 3번 때 이미 이런 예외가 필요했던 것과 같은 종류). |

## 7. 하위 호환성과 도입 범위

- `evidenceCategory`·`notebook`·`argument-builder`는 전부 새 필드/값이라 **기존 32개 MUD, 32×N개 스테이지는 한 글자도 안 바뀐다.**
- 아이디어 3번(`hotspot-choice`)과 이 아이디어는 **같은 스테이지에서 공존 가능**하다 — 예를 들어 중간 판단 스테이지는 `hotspot-choice`로 즉시 분기시키고, 그 hotspot에도 `notebook: true`를 달아 "이 결정 자체도 근거 카드가 된다"처럼 쓸 수 있다. 두 기능은 서로 다른 스테이지의 `interaction` 값이므로 구현이 얽히지 않는다.

## 8. `EXP-002`(유물 2개 비교)와의 관계 — 혼동 방지

- **EXP-002**: MUD *완료 후* 도감에서 해금된 유물 2개를 꺼내 비교하는 별도 화면(아직 미구현, Track C 제안).
- **이 설계(아이디어 4)**: MUD *진행 중* 자연스럽게 쌓인 단서를 그 MUD의 *결말 자체*를 결정하는 데 쓰는 것.
- 둘은 "근거를 다시 쓴다"는 점에서 철학은 같지만 별개 기능이다. 이 설계가 먼저 구현되면 EXP-002의 화면·상호작용을 상당 부분 재사용할 수 있다(수첩 카드 UI가 곧 "유물 비교" UI의 프로토타입이 될 수 있음) — 이 점은 EXP-002 착수 시 참고 사항으로 남긴다.

## 9. 프로토타입 제안 범위

**1차**: `deep_prehistoric.json` 8번 스테이지(이미 hotspot 3개 + 3-way 엔딩 구조 보유)만 `argument-builder`로 전환. 이전 스테이지에서 수첩을 쌓지 않고 8번 자체 카드 3장만으로 논증하는 최소 버전 — 아이디어 3번 프로토타입과 같은 급의 위험도.

**2차**(1차 검증 후): 1~8번 전 스테이지의 주요 hotspot에 `notebook: true`를 달아 진짜 "누적" 경험을 검증. 이때 8번 스테이지의 `outcomeRules.trueMinCategories`를 실제 누적 카드 다양성에 맞게 조정 필요.

## 10. 미해결 쟁점 (결정 필요)

1. **카테고리 분류 기준**: `evidenceCategory` 어휘(artifact/site/law/narrative/record)를 고정 목록으로 강제할지, MUD마다 자유롭게 정하게 둘지. 고정하면 검증 스크립트로 다양성 경고를 낼 수 있지만, 자유롭게 두면 유연하다.
2. **상시 수첩 UI 필요성**: §4-1처럼 최종 스테이지에서만 보여줘도 충분한지, 아니면 진행 중에도 "몇 장 모았다"는 진행감이 학습 동기에 중요한지 — 실측 필요.
3. **기본 판정 규칙의 타당성**: `trueMinCategories: 3`이 5학년 수준에서 "다각도로 논증했다"고 볼 만한 기준인지, 아니면 너무 엄격/느슨한지 — 파일럿 실측 필요.
4. **공용 코드 협의**: `js/mudEngine.js`(신규 상태 3종)·`js/mudSimulators.js`(신규 핸들러 1종 + 기존 3개 핸들러에 한 줄씩)·`scripts/03·04`·`simulator_contract.json` 변경이 필요하다. 아이디어 3번보다 손대는 지점이 많으므로, 착수 전 Codex 세션과 겹치는 시간대인지 반드시 `git status`로 재확인하고, 가능하면 저부하 시간대에 진행한다.

## 11. 이 문서가 만들지 않은 것

- 실제 코드 변경(엔진·검증 스크립트·JSON) — 전부 사용자 승인 후 별도 커밋으로 진행한다.
- 상시 수첩 모달의 시각 디자인.
- 카테고리 어휘의 최종 확정.
