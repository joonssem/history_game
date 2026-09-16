# inquiry-task 의미 lint

생성: `scripts/14_lint_inquiry_semantics.js` (2026-09-16)

기계가 신호로 잡을 수 있는 것만 본다. **실패가 아니라 검토 목록이다.** 문장의 뜻이 실제로 맞는지는 사람이 판단한다.

## D-031 구현 (2026-09-16)

라운드 5에서 제안만 했던 `task.sequenceKind: "event" | "process"` 필드가 사용자 승인을 받아 구현됐다. "날짜 없는 카드" 분류는 더 이상 추정하지 않고 이 필드를 그대로 읽는다 — 파일럿 4편(고려 문화 2관문·신석기 2관문은 `process`, 삼국 3관문·근대 2관문은 `event`) 모두 필드가 있다. 필드가 없는 편(미래의 새 편)은 라운드 5의 추정 규칙으로 대체(fallback)한다. `scripts/04`가 `sequenceKind` 존재·값 범위와, `event`일 때 카드마다 연도 표지를 계약으로 강제한다.

### regular_goryeo_culture

경고 없음.

<details><summary>허용됨(3건) — 라운드 5에서 사람이 읽고 게임 진행 표현·일반 서술어로 분류함, 재검토 불필요</summary>

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 완료·단정어 — 허용됨 | 1 | stages.1.simulator.task.options.0.feedback | "완성" — 허용("완성된 N" — 이미 만들어진 사물을 가리키는 일반 서술어) |
| 완료·단정어 — 허용됨 | 1 | stages.1.simulator.task.awards.1.detail | "완성" — 허용("완성된 N" — 이미 만들어진 사물을 가리키는 일반 서술어) |
| 완료·단정어 — 허용됨 | 2 | stages.2.simulator.feedback | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |

</details>

### regular_modern_open

경고 없음.

<details><summary>허용됨(2건) — 라운드 5에서 사람이 읽고 게임 진행 표현·일반 서술어로 분류함, 재검토 불필요</summary>

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 완료·단정어 — 허용됨 | 2 | stages.2.simulator.feedback | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |
| 완료·단정어 — 허용됨 | 4 | stages.4.simulator.feedback | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |

</details>

### regular_neolithic

경고 없음.

<details><summary>허용됨(5건) — 라운드 5에서 사람이 읽고 게임 진행 표현·일반 서술어로 분류함, 재검토 불필요</summary>

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 완료·단정어 — 허용됨 | 2 | stages.2.simulator.feedback | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |
| 완료·단정어 — 허용됨 | 3 | stages.3.simulator.task.options.1.feedback | "완성" — 허용(만드는 과정에서 사물이 완성되는지를 말하는 기능적 서술 — 해석의 필연성이 아니라 제작 조건을 설명함) |
| 완료·단정어 — 허용됨 | 3 | stages.3.simulator.task.options.2.feedback | "완성" — 허용(만드는 조건을 설명하는 기능적 서술 — 해석의 필연성 단정이 아님) |
| 완료·단정어 — 허용됨 | 3 | stages.3.simulator.completion.successText | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |
| 완료·단정어 — 허용됨 | 4 | stages.4.simulator.feedback | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |

</details>

### regular_three_kingdoms

경고 없음.

<details><summary>허용됨(2건) — 라운드 5에서 사람이 읽고 게임 진행 표현·일반 서술어로 분류함, 재검토 불필요</summary>

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 완료·단정어 — 허용됨 | 3 | stages.3.simulator.feedback | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |
| 완료·단정어 — 허용됨 | 4 | stages.4.simulator.feedback | "완성" — 허용(게임 진행 표현 — 화면 조작을 마치라는 지시문(역사 서술 아님)) |

</details>

