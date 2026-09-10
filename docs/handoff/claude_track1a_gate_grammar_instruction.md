# 트랙 1-A 지시서 — 「관문 설계실」

- 창 이름: **관문 설계실** (slug `gate-grammar`)
- 한 줄 정의: Regular MUD 28편의 관문을 "무엇을 누르는가"가 아니라 "무엇을 생각하는가"로 다시 설계한다.
- 작성: Opus 5 기획 세션 (2026-09-10)
- 기준 커밋: `origin/main` + 본 지시서가 포함된 커밋
- 담당 모델: Sonnet 5
- 권장 브랜치: `feat/mud-gate-grammar`
- 권장 worktree: `.worktrees/claude-gate-grammar`

## 0. 이 창이 만지는 파일 (소유권)

**소유(단독 수정 가능)**
- `data/mud/regular_*.json`
- `docs/plans/` 아래 이 트랙이 새로 만드는 문서

**읽기만 (절대 수정 금지)**
- `js/mudInquiry.js`, `js/mudEngine.js`, `js/mudSimulators.js`, `css/style.css`, `index.html`

런타임 코드는 트랙 1-B(UI/UX)의 소유다. 이 창은 **기존 런타임이 이미 지원하는 문법만** 사용한다. 새 문법이 필요하면 구현하지 말고 §4의 설계 문서로만 남긴다.

## 1. 검증된 현재 상태 (2026-09-10 실측)

Regular 28편, 필수 단계의 조작 분포:

| interaction | 개수 | 성격 |
|---|---|---|
| `ordered-hotspot` | 81 | 원을 정해진 순서로 누르기 |
| `hotspot-discovery` | 46 | 원을 아무 순서로 누르기 |
| `hotspot-choice` | 1 | — |
| `resource-allocation` | 4 | 실제로는 hotspot 처리기 사용 |
| `reflection` | 2 | 실제로는 hotspot 처리기 사용 |
| **`inquiry-task`** | **4** | **고려 문화 1편뿐** |

즉 **27편은 전부 "원 3개 누르기"** 하나로 수렴한다. 배경과 라벨만 다르다.

파일럿 1편(`regular_goryeo_culture`)은 4관문 모두 `inquiry-task`로 전환되어 운영 중이며, Opus 세션이 운영 사이트에서 4관문을 끝까지 플레이해 동작을 확인했다. 이 파일이 **유일한 참조 구현**이다.

## 2. 이 트랙의 목표

28편을 한꺼번에 바꾸지 않는다. **시대별 1편씩, 서로 다른 사고 문법으로** 전환해 난이도 곡선과 문법 다양성을 함께 시험한다.

전면 전환을 금지하는 이유는 두 가지다.
1. 차시마다 필요한 역사적 사고가 다르다. 임진왜란과 신석기를 같은 문법으로 다루면 형태만 바뀐 획일화다.
2. 현재 `inquiry-task`의 화면은 세로로 긴 폼(1./2./3. 섹션)이라 아이패드 가로에서 제출 버튼이 보이지 않는다. 이 UI로 27편을 확장하면 나중에 27편을 다시 손대야 한다. UI 개선은 트랙 1-B가 담당한다.

## 3. 1차 범위 — 파일럿 3편

기존 런타임이 지원하는 3종 문법을 시대별로 하나씩 배정한다. **같은 문법을 두 번 쓰지 않는다.**

| 대상 | 단원·차시 | 배정 문법 | 그 문법을 고른 이유 |
|---|---|---|---|
| `regular_neolithic.json` | U1 3차시 · 신석기 암사동 | `sequence` | 채집에서 정착·농경으로 가는 **과정의 앞뒤 관계**가 핵심이다. 순서를 외우는 게 아니라 "이 단계 없이 다음이 가능한가"를 묻는다. |
| `regular_three_kingdoms.json` | U1 7~8차시 · 한강 쟁탈전 | `map-evidence` | 영토 변화가 주제이고, 비석·유물의 **발견 위치 자체가 근거**다. 지도와 근거와 자료 범위를 한 묶음으로 다루기에 가장 적합하다. |
| `regular_modern_open.json` | U2 11~12차시 · 강화도 조약과 근대 문물 | `commit-revise` | "근대 문물은 발전인가 침탈인가"에서 학생의 첫 판단이 갈린다. 첫 판단 → 자료 확인 → 판단 수정이 그대로 작동한다. |

**3단원(일제 강점기·전쟁)은 1차 파일럿에서 제외한다.** 민감 주제 서술 기준을 먼저 확인해야 한다(`docs/handoff/claude_code_sensitive_history_crosscheck_instruction.md` 참조). 이 트랙에서 임의로 판단하지 않는다.

### 작업 순서

한 편씩 완료하고 검증한 뒤 다음 편으로 넘어간다. 세 편을 동시에 열지 않는다.

1. `regular_neolithic.json` — `sequence`
2. `regular_three_kingdoms.json` — `map-evidence`
3. `regular_modern_open.json` — `commit-revise`

### 편당 작업 절차

1. **먼저 `data/mud/regular_goryeo_culture.json`을 끝까지 읽는다.** 4개 task 타입의 정확한 필드 구조가 거기에 있다. 스키마를 추측하지 않는다.
2. `simulator_contract.json`에서 해당 task 타입의 필수 필드를 확인한다.
3. 기존 4개 필수 단계의 **역사 내용은 유지**하고 조작 문법만 바꾼다. 새 역사 서술을 지어내지 않는다.
4. 근거(`awards`)를 관문 간에 누적되도록 설계한다. 마지막 관문에서 앞 관문의 근거를 실제로 쓰게 한다.
5. 오답 피드백은 **정답을 노출하지 않고** 왜 부족한지만 말한다.
6. 편별로 커밋한다.

## 4. 반드시 지킬 판정 규칙 (D-027)

2026-09-10에 고려 문화 4관문에서 **판정 조건이 코드에 있는데도 절대 실패할 수 없는** 결함이 발견됐다. 허용 근거 5장의 `category`가 모두 달라서 `minCategories: 2`가 자동 충족됐고, "국제 교류"를 말하는 주장이 교류 근거 없이 통과했다. 상세는 `DECISIONS.md` D-027.

따라서:

- **`category`는 표현 라벨이 아니라 판정 단위다.** 근거를 한 장씩 다른 범주로 쪼개면 범주 조건이 무력화된다. 같은 성격의 자료는 같은 범주로 묶는다.
- 주장이 여러 측면을 말하면 `requiredCategories`로 각 측면의 근거를 명시한다.
- 새 조건을 넣을 때마다 **"이 조건이 실패할 수 있는 선택이 존재하는가"** 를 직접 확인한다. `python scripts/04_validate_mud_contract.py`가 죽은 조건을 오류로 잡지만, 검증기를 통과했다고 의미가 보장되지는 않는다.

## 5. 신규 문법 설계 (구현하지 말 것)

현재 3종으로는 다룰 수 없는 사고가 하나 있다: **같은 사건을 두고 입장이 갈리는 경우**. 전쟁·외교·신분 차시 다수가 여기 해당한다.

`perspective` 문법 설계안을 `docs/plans/mud_perspective_task_design.md`로 **문서만** 작성한다. 코드는 트랙 1-B가 구현한다.

설계에 반드시 포함할 것:
- 1차 적용 후보는 `regular_joseon_diplomacy.json`(병자호란, 주화 vs 척화)이다.
- **"어느 쪽이 옳았는가"로 판정하지 않는다.** 각 입장이 어떤 근거 위에 서 있는지, 그 입장이 무엇을 감수하려 했는지를 묻는다.
- 학생이 한 입장을 고른 뒤 **반대 입장의 근거도 확인해야** 관문이 열리는 구조를 검토한다.
- 초등 5학년이 두 입장을 모두 이해할 수 있는 분량인지 판단 근거를 적는다.

## 6. 하지 말 것

- 27편 일괄 변환. 3편을 넘기지 않는다.
- `js/`, `css/`, `index.html` 수정. 트랙 1-B 소유다.
- 점수·타이머·콤보·경쟁 요소 추가. 수업 관찰 증거가 없다.
- 역사 서술 신규 작성. 기존 내용의 조작 문법만 바꾼다.
- 사실관계 수정이 필요하면 코드보다 먼저 출처를 확인하고 `DECISIONS.md`에 이유를 남긴다.
- 3단원 MUD 전환.

## 7. 완료 판정

각 편에 대해 아래를 모두 만족해야 완료다.

- 4개 필수 단계가 모두 `inquiry-task` + `completion.strategy: "validated-state"`다.
- 아래 자동 검증이 전부 통과한다.
- **로컬 정적 서버에서 해당 MUD를 직접 4관문 끝까지 플레이**해서 다음을 확인한다.
  - 무작위 클릭·연타만으로는 어떤 관문도 열리지 않는다.
  - 자료를 확인하지 않고 최종 답만 골라서는 열리지 않는다.
  - 오답 제출 시 다음 버튼이 `disabled`로 유지되고, 정답을 노출하지 않는 피드백이 나온다.
  - 마지막 관문에서 **주장과 무관한 근거 조합이 통과하지 않는다**(D-027 회귀 확인).
  - 정답 제출 후 선택 컨트롤이 전부 `disabled`가 되고 다음 버튼만 열린다.
  - 콘솔 `error`/`warning` 0건.
- 결과를 `BACKLOG.md`에 기록한다. 관찰 없이 확정한 내용을 `PRD.md`로 승격하지 않는다.

## 8. 검증 명령

```bash
node --check js/mudEngine.js
node --check js/mudInquiry.js
node --check js/mudSimulators.js
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
python scripts/06_validate_static_assets.py
python scripts/07_audit_activity_duration.py
python scripts/08_validate_mud_catalog.py
python scripts/09_validate_mud_sources.py
python scripts/09_audit_tap_resistance.py
git diff --check
```

## 9. 시작 명령

```bash
git worktree add .worktrees/claude-gate-grammar -b feat/mud-gate-grammar origin/main
cd .worktrees/claude-gate-grammar
cat docs/handoff/claude_track1a_gate_grammar_instruction.md
cat data/mud/regular_goryeo_culture.json
cat simulator_contract.json
python scripts/04_validate_mud_contract.py
```

이 문서와 `BACKLOG.md`, `project_context.md`, `DECISIONS.md`가 충돌하면 덮어쓰지 말고 충돌 지점을 먼저 보고한다.
