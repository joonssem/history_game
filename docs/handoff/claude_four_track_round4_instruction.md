# 4트랙 라운드 4 지시서 — 남은 콘텐츠 사실 검증과 의미 lint (2026-09-15)

- 작성: Opus 5 기획·통합 세션
- **기준: 브랜치 `fix/round3-red-team` `b4dca60` 이후** (main이 아니다 — §0-1)
- 각 창은 **§0(공통) + 자기 절**만 읽는다.
- 창 이름·포트는 [`claude_four_track_overview.md`](./claude_four_track_overview.md) 그대로다. 파일 소유권은 이번 라운드에 일부 바뀐다(§0-4).

## §0 네 창 공통

### 0-1. 기준 브랜치가 main이 아닌 이유

- Codex 라운드 3 red team 감사(`docs/audits/round3_red_team_audit.md`)를 기획 세션이 `fix/round3-red-team`에 반영했다. 신석기 1·2관문, 삼국 2·3관문 의미 수정, 첫 판단 보존, 조합 감사·회귀 테스트가 들어 있다.
- **Codex가 지금 main 체크아웃(`D:\codexwork\history_game`)에서 T2(공식 출처 대조)를 커밋하지 않은 채 진행 중**이라 이 브랜치를 아직 main에 합치지 못했다.
- 네 worktree는 기획 세션이 이 브랜치 끝으로 맞춰 두었다. 통합은 기획 세션이 Codex 커밋 뒤에 한 번에 한다.

### 0-2. 이번 라운드의 성격 — 넓히지 않는다, 아직 대조하지 않은 것을 대조한다

학생 관찰은 여전히 0회다. 새 편·새 페어·새 게임·새 퀴즈를 만들지 않는다. 라운드 3까지 **파일럿 4편, 유물 비교 11페어, 원인과 결과·연표**는 공식 출처와 대조했다. 이번에는 **학생에게 이미 보이는데 한 번도 공식 출처와 대조하지 않은 콘텐츠**를 대조한다.

기존 감사와 겹치지 않게 먼저 읽는다:
- `docs/audits/content_claim_audit.md`, `docs/audits/historical_language_audit.md` — 2026-09-01. **표현**(최초·유일·완벽, 영웅 중심, 가상 결과 단정)을 다듬은 기록이다. 공식 출처와 수치·연도를 대조한 것은 아니다.
- `docs/audits/artifact_audit.md` — 스크립트가 필드·길이·과장어 **신호**만 모은다. 사실 확인이 아니라고 스스로 적어 두었다.

### 0-3. 사실 확인 규칙 (라운드 3 §0-3과 같다, 한 줄 추가)

- 수치·연도·인물·"최대/최초"·인과 단정은 **공식 출처 원문**(국사편찬위원회 우리역사넷, 한국민족문화대백과사전, 국립중앙박물관, 국가유산포털, UNESCO)과 대조한다. **위키백과·블로그는 근거가 아니다.** 라운드 3에서 위키백과를 근거로 쓴 사례가 있었다.
- 원문으로 확인되면 정정하고 출처 필드(`sources`, `sourceNote` 등)에 확인 날짜와 근거를 남긴다.
- 원문으로 확인되지 않으면 오류로 단정하지 말고 "짐작할 수 있다·단서가 된다" 범위로 낮춘다.
- **원문 페이지를 실제로 열지 못했으면 "확인 불가"로 적는다.** 다른 감사가 확인했다는 사실을 인용할 때는 누가 언제 확인했는지 밝힌다.
- 결과는 표로: 대상 · 문장 · 대조 결과(일치/오류/확인 불가) · 조치(정정/완화/유지/보고) · 근거 URL·확인 날짜.

### 0-4. 작업 환경과 금지

- **main 체크아웃(`D:\codexwork\history_game`)에서 아무것도 하지 않는다.** Codex가 작업 중이다. 파일을 쓰는 명령은 절대경로나 `git -C <자기 worktree>`를 쓴다. 셸의 작업 위치가 다음 명령에 남는다.
- **main에 push하지 않는다.** 자기 브랜치에만 커밋한다(원격 push도 하지 않는다). 라운드 3에서 한 창이 main에 직접 올려 다른 창이 뒤처졌다.
- 커밋 직전 `git status --short`로 바뀐 파일이 의도한 것뿐인지 확인한다.
- 공용 런타임(`js/*.js`)이나 `css/style.css`를 고치면 캐시버스터를 올린다. 데이터 JSON만 고쳤으면 해당 없다.
- **3단원(일제 강점기·전쟁·광복) 콘텐츠는 고치지 않는다.** 민감 주제 기준 확인 전이다. 보고만 한다.
- 파일 소유권(이번 라운드): 관문 설계실 `data/mud/regular_*.json`(1단원 비파일럿 9편) / 대조실 `data/artifactComparisons.json`, **`data/artifacts.json`** / 연결 공방 **`data/quizzes.json`, `data/stories.json`, `data/stories_chasi2.json`** / 조작대 `scripts/14_*`, `js/mudInquiry.js`. 소유가 아닌 파일은 읽기만 한다.

### 0-5. 사용자 판단 대기 — 구현하지 않는다

- 설계 문서 4건(`perspective`, 단계 진행형, 스토리 관계, 캔버스 옵션 B)
- 캔버스 옵션 A 승인, 근거 인벤토리 기본 펼침
- `art_12` 판옥선 `era` 라벨 — **대조실도 이 필드는 바꾸지 않는다**
- `claude-deep-prehistoric` 미반영 7커밋

---

## §1 관문 설계실 — `feat/mud-gate-grammar` · `.worktrees/claude-gate-grammar`

### 1-1. 1단원 비파일럿 9편 사실 대조 (주 작업)

대상: `regular_paleolithic`, `regular_bronze_age`, `regular_gojoseon`, `regular_three_kingdoms_life`, `regular_silla`, `regular_balhae`, `regular_goryeo_founding`, `regular_goryeo_society`, `regular_goryeo_war`.

- 각 편의 `narrative`, `choices`, `glossary`, `location`, `badge`, 시뮬레이터 `feedback`에서 **수치·연도·인물·인과 단정**을 뽑아 공식 출처와 대조한다.
- **IF 단계**(`N-1` 등)는 가상 상황임이 드러나면 사실 오류로 보지 않는다. 가상 결과를 사실처럼 단정하는 문장만 대상이다(`historical_language_audit.md` C등급 기준).
- 편마다 `sources`에 **실제로 대조한 개별 출처**를 추가한다. 지금 대부분은 교육과정 문서와 "개별 서술은 별도 검증 필요" 출처만 있다.
- 확인된 사실 오류는 해당 문자열만 고친다. 게임 구조(선택지 수, 정답 위치, `next`)는 바꾸지 않는다.
- 결과: `docs/audits/unit1_regular_fact_check.md`.

### 1-2. 하지 않는 것

2단원·3단원 편 수정(2단원은 다음 라운드), 파일럿 4편 재수정, inquiry-task 전환, `js/` 수정.

---

## §2 대조실 — `feat/artifact-site-comparison` · `.worktrees/claude-artifact-site`

### 2-1. 유물 도감 36종 사실 대조 (주 작업)

`data/artifacts.json`의 `name`, `desc`, `hint`, `era`, `tierName`은 학생이 도감에서 직접 읽지만 공식 출처와 대조한 적이 없다.

- 유물명과 소장처·지정 명칭(국보·보물·사적), `desc`의 연도·제작자·용도·단정 표현을 대조한다.
- 여러 유물을 한 카드에 묶은 경우(예: "직지심체요절 영인본과 고려 비색 청자")는 각각 확인한다. "영인본"·"복원품" 같은 표기가 실물과 혼동되지 않는지 본다.
- **`art_12`의 `era`는 바꾸지 않는다**(사용자 판단 대기). 다른 유물의 `era`가 공식 편년과 명백히 다르면 정정하되, **나의 연표 판정(`js/miniGames.js`의 `getArtifactTimelineRange`)에 영향이 있는지** 함께 적는다. `era` 문자열이 기간표에 없는 값으로 바뀌면 나의 연표에서 빠진다.
- `hint`의 "N단원 M차시" 표기가 실제 MUD의 `unitId`·`lessonNumbers`와 다르면 보고한다(나의 연표는 더 이상 이 번호로 정렬하지 않지만 학생에게 보인다).
- 결과: `docs/audits/artifacts_fact_check.md`.

### 2-2. R3-08·R3-09 — Codex T2 커밋 뒤에만

- 먼저 `git -C .worktrees/claude-artifact-site fetch origin && git -C .worktrees/claude-artifact-site log --oneline origin/main -3`로 **Codex T2 커밋이 main에 올라왔는지** 확인한다. 올라오지 않았으면 이 절은 하지 않고 2-1만 한다.
- 올라왔으면 기획 세션에 알리고 지시를 기다린다. Codex T2가 같은 파일을 고쳤으므로 기준을 다시 맞춰야 한다.
- 내용(참고): R3-08 가야 금동관(`cmp_crown_1.artifactB`)에 리움·도쿄국립박물관 소장 **가야 금관**의 "6세기 전반"을 적용한 출처 대상 오인. R3-09 청자 매병(`cmp_ceramics_1/2.artifactA`)의 "12세기경"을, 같은 박물관 큐레이터 글이 "12세기 후반~13세기"로 적은 사실을 확인하지 않고 좁힘.

### 2-3. 하지 않는 것

신규 페어, `js/` 수정, `art_12` `era` 변경, 실물 사진 추가.

---

## §3 연결 공방 — `feat/extended-activity-loop` · `.worktrees/claude-activity-loop`

### 3-1. 골든벨 퀴즈 사실 대조 (주 작업)

`data/quizzes.json` 10문항. **퀴즈는 정답이 틀리면 학생이 틀린 사실을 정답으로 외운다.** 가장 위험도가 높다.

- 각 문항의 `question`, `answer`, `explanation`을 공식 출처와 대조한다. 특히 OX 문항은 문장 일부만 틀려도 정답이 뒤집힌다.
- 설명문의 해석 단정(예: 신화의 내용을 역사적 사실처럼 서술)도 본다.
- 확인된 오류는 정정한다. **문항을 새로 만들거나 빼지 않는다.** 정답을 바꿔야 할 정도면 고치고 반드시 표에 적는다.

### 3-2. 타임머신 스토리 사실 대조

`data/stories.json`(3편), `data/stories_chasi2.json`(1편)의 장면 서술에서 수치·연도·인물·인과 단정을 대조한다.

- 스토리는 이야기 형식이라 가상의 장면·대사는 허용한다. **가상 장면 속에 사실로 제시된 정보**(연도, 유물, 사건 결과)만 대상이다.
- 스토리의 위치 재정의(`story_mud_relationship.md`)는 사용자 판단 대기다. 구조는 바꾸지 않는다.

결과: `docs/audits/quiz_story_fact_check.md`.

### 3-3. 하지 않는 것

새 퀴즈·스토리·미니게임, `data/artifacts.json` 수정(이번 라운드 대조실 소유), 원인과 결과 벽란도 근거 교체(Codex T2가 진행 중).

---

## §4 조작대 — `feat/inquiry-ui-console` · `.worktrees/claude-inquiry-console`

### 4-1. inquiry-task 의미 lint 스크립트 (주 작업)

라운드 3 red team이 사람이 읽어서 찾은 결함 가운데 **기계가 경고로 잡을 수 있는 것**을 도구로 만든다. 실패가 아니라 **검토 목록**을 내는 스크립트다.

`scripts/14_lint_inquiry_semantics.js`:

1. **순서 노출** (R3-07): `sequence`에서 `instruction`, `task.prompt`, `meaningQuestion.prompt`, 정답 외 선택지 피드백이 `correctOrder` 카드 라벨(또는 그 핵심어)을 **정답 순서대로** 포함하면 경고. 예전 삼국 3관문 "영토 확보→교류→기록 순서로".
2. **날짜 없는 순서 카드** (D-030 3): `sequence` 카드 라벨·설명에 연도나 명백한 물리적 절차 표지가 없으면 "날짜로 확인되는 사건인가" 검토 경고. 오탐이 많을 수 있으니 편별 허용 목록 필드를 두지 말고, 경고 문구만 낸다.
3. **정답 장소 노출** (R3-07): `map-evidence` 오답 `feedback`이 정답 장소 `label`을 그대로 포함하면 경고.
4. **완료·단정어** (R3-04): `feedback`·`detail`·`successText`에 "완성", "가장 먼저", "반드시", "뒤에야", "마지막 단계" 같은 필연·완결 표현이 있으면 검토 경고.
5. **출처 공백**: inquiry-task 편의 `sources`에 교육과정 문서 외 개별 출처가 없으면 경고.

- 파일럿 4편에 돌려 결과를 `docs/audits/inquiry_semantics_lint.md`에 남긴다. **기획 세션이 방금 고친 삼국 3관문은 1번 경고가 사라져야 한다** — 자기 검증으로 확인한다.
- `walkthrough.md` 검증 명령 목록에 추가한다.

### 4-2. R3-03 첫 판단 보존 브라우저 확인

기획 세션이 `js/mudInquiry.js`에 `firstInitialChoice`를 넣었으나 브라우저로는 확인하지 않았다(판정 함수 단위 테스트만 있음).

- `preview_start` 이름 `inquiry-console`(포트 8804)로 고려 1관문을 실제로 플레이한다: 오답을 첫 판단으로 고른 뒤 자료를 열고, "먼저 생각"을 정답으로 바꾸고, 최종 판단 정답 제출 → **역사가 등급**(수정한 것으로 판정)인지. 처음부터 정답 유지 → **연결자 등급**인지.
- 1180×820에서 확인한다. 콘솔 오류 0건.
- 문제가 있으면 고치고 캐시버스터를 올린다.

### 4-3. 하지 않는 것

P2 설계 두 건 구현, `perspective` 구현, 근거 인벤토리 기본 펼침 변경, 데이터 JSON 수정.

---

## 완료 보고에 포함할 것 (네 창 공통)

- 사실 대조 표: 일치 / 오류(정정) / 확인 불가(완화·보고), 근거 URL·확인 날짜. **실제로 원문을 열었는지** 표시.
- 자동 검증 결과. 화면을 건드렸다면 브라우저 확인 결과.
- 커밋 직전 `git status --short` 결과.
- 지시와 다르게 판단한 곳과 이유.

## 검증 명령 (데이터나 코드를 고쳤을 때)

```bash
python scripts/01_validate_game_data.py
python scripts/03_validate_mud_integrity.py
python scripts/04_validate_mud_contract.py
node scripts/05_test_simulator_runtime.js
python scripts/06_validate_static_assets.py
python scripts/08_validate_mud_catalog.py
python scripts/09_validate_mud_sources.py
python scripts/11_audit_artifacts.py
node scripts/13_audit_inquiry_combinatorics.js
git diff --check
```

## 시작 명령

```bash
cd D:/codexwork/history_game/.worktrees/<자기 worktree> && git status --short --branch && git log --oneline -3 && cat docs/handoff/claude_four_track_round4_instruction.md
```
