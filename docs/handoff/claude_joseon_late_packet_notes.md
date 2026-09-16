# 조선 후기 협동 패킷 초안 — 연결 공방 작업 노트 (라운드6 §3, 라운드7 §3 갱신)

- 작성: Claude Sonnet 5 (연결 공방 / activity-loop, 2026-09-16)
- 산출물: [`data/cooperative/joseon_late_packet.draft.json`](../../data/cooperative/joseon_late_packet.draft.json)
- 이 파일은 **초안**이며 어떤 코드에서도 로드되지 않는다(`apps/**`, `js/*.js` 어디에도 연결 안 함). 이번 라운드에서 만들지 않기로 한 것(§0)과 겹치지 않게, 이 창은 오직 이 JSON 파일과 이 노트만 썼다.

## 0. 라운드7 갱신 사항 (D-034 맞추기)

라운드6에서 관문 설계실과 이 창이 서로 다른 역할 id·5인 역할·3인 구성을 썼던 것을, `DECISIONS.md` D-034 확정값에 맞췄다.

- **역할 id 변경**: `nongmin→farmer`, `artisan→craftsman`, `rokgwan→recordkeeper`, `pumpali→laborer`(`bobusang`은 그대로). `evidenceId`도 확정값(`farmer-ipbeop`/`bobusang-currency`/`jangsi-craftsman`/`record-keeper-scope`/`laborer-wage`)으로 바꿨고, `evidenceOptions[].roleId`도 함께 갱신했다.
- **3인 구성이 뒤바뀜**: 라운드6 초안은 3인에서 `rokgwan`(기록관)을 빼고 `artisan`(수공업자)을 남겼는데, D-034는 정확히 반대다 — **`craftsman`을 빼고 `recordkeeper`를 남긴다**("기록관은 자료 한계를 짚는 역할이라 인원이 적을수록 오히려 더 필요하다"는 판단으로 이해했다). 3인 `sharedEvidenceIds`를 `jangsi-craftsman-summary`로 맞췄다.
- **`questionFrames` 제거**: 앱 데이터가 아니라는 지시에 따라 JSON에서 빼고, 새 문서 [`claude_joseon_late_teacher_sticky_wall.md`](./claude_joseon_late_teacher_sticky_wall.md)로 옮겼다. sticky-wall 복사 문자열 형식(계획서 §6)도 이 문서에 함께 정리했다.
- **"전국" 과잉 단정 2건 정정**:
  - `ev3_market_spread`: "5일장이 **전국** 곳곳에 생겨" → "5일장이 **여러 고을**에 생겨"
  - `bobusang` 역할의 라운드6 placeholder 문장에 있던 "장시가 **전국에** 늘어나"라는 표현 삭제 — placeholder 자체가 앞으로 관문 설계실 확정본으로 교체될 것이므로, 이번엔 그 표현이 남지 않도록 placeholder 문구를 짧게 다시 썼다.
  - `limit_scope`("전국 모든 지역에서 똑같이 일어났는지는 **알 수 없다**")는 지시대로 **손대지 않았다** — 단정이 아니라 단정을 막는 부정문이라 과잉 단정에 해당하지 않는다.
- **역할 본문은 여전히 자리표시자**: `privateInfo`/`sharePrompt`/`interest`는 이번에도 채우지 않았다(§3-5 지시). 2단계에서 관문 설계실 확정본(현재 `claude_joseon_late_role_cards.md`에 4개 역할 + `laborer` 카드로 이미 작성되어 있다)을 그대로 옮긴다.

## 1. 무엇을 채웠는가

`implementation_plan_joseon_late_cooperative_live_vertical_slice.md` §4의 `CooperativeScenario` 타입을 그대로 따랐다. 이 창이 맡은 부분(§3):

- **`firstJudgment`**: 장시·화폐·농사법 중 무엇이 가장 큰 변화였는지 묻는 질문. **정답 선택지가 없다** — "아직 잘 모르겠다"까지 포함해 관점이 갈리도록 설계했고, `reasonPrompt`에 "정답은 없다"고 명시해 학생이 눈치껏 "정답"을 찾으려 하지 않도록 했다.
- **`synthesis`**: `targetOptions` 5개(부농·빈농·보부상·수공업자·지주), `evidenceOptions` 8개(역할마다 1~2개, `roleId`로 출처 표시), `limitOptions` 3개(전국·전시기 일반화 금지, 신분제 소멸 여부 불명, 개인별 유불리 불명) — 셋 다 "이 자료만으로 알 수 없다"는 문장으로 통일해 과잉 단정을 구조적으로 막았다. `minEvidence: 2`, `minDistinctRoleSources: 2`로 한 역할의 자료만으로는 완료되지 않게 했다.
- **`questionFrames`** (대상·근거·한계 3종): 다른 모둠이 발표를 들은 뒤 던질 질문의 틀. **주의**: 이 필드는 계획서 §4의 `CooperativeScenario` 타입에는 없다. 라운드6 지시(§3-3)가 "질문 틀 3종을 쓰고... JSON으로 만든다"고 명시해 이 파일에 넣었지만, 타입 정의를 그대로 따르라는 지시와는 별도 확장이다. **기획 세션이 판단할 것**: 이 필드를 타입에 정식으로 추가할지, 아니면 sticky-wall 인계 자료나 교사용 별도 문서로 옮길지.
- **`interventions.hint`/`deepen`**: 자료를 다 못 나눴을 때 힌트, 공동 해석이 나온 뒤 심화 질문("이득을 본 사람과 어려움을 겪은 사람을 모두 찾아보라") — 한쪽 관점에 치우치지 않도록 양쪽을 다 찾게 했다.
- **`stickyWall`**: `heading`/`templateVersion`만 스키마대로 채웠다. 실제 복사 문자열 포맷은 계획서 §6에 이미 있어 새로 만들지 않았다.
- **`groupVariants`**(라운드7 갱신, §0 참조): 3인은 `craftsman`(수공업자)을 빼고 `recordkeeper`(기록관)를 남기며, 겸임 없이 빠진 관점(수공업자)을 `sharedEvidenceIds`(`jangsi-craftsman-summary`)로 보충한다. 5인은 `laborer`(품팔이)를 다섯째 역할로 쓴다 — 광작으로 땅을 빌리지 못한 농민이 품팔이가 되었다는 것은 조선 후기 사회 변화 서술에서 흔히 함께 다뤄지는 내용이라 이 창이 라운드6에 처음 제안했고, D-034로 확정됐다. 단순 서기 역할이 아니라 고유 근거(`ev8_wage_labor`)와 `interest`(부농과의 이해관계 충돌)를 갖는다.

## 2. 무엇을 자리표시자로 남겼는가

`roles[].privateInfo`, `sharePrompt`, `interest` **3개 필드 전부**를 자리표시자로 남겼다. §1이 명시적으로 "역할별 자료 카드 본문"을 관문 설계실 소유로 지정했기 때문이다(`docs/handoff/claude_joseon_late_role_cards.md`). 자리표시자에는 그 역할이 다뤄야 할 **내용의 방향**만 한 줄로 적어 두어, 관문 설계실이 참고만 하고 자기 문서에서 출처와 함께 확정하도록 했다 — 이 파일의 자리표시자 문장 자체를 출처 대조 없이 베끼지 않도록 "[PLACEHOLDER — 관문 설계실 확정 예정]" 표시를 문장 앞에 명확히 붙였다.

역할 5개 중 `laborer`(품팔이)는 §1 원 지시서의 "4인 역할 후보"(농민·보부상·수공업자·기록관)에는 없던, 이 창이 5인 변형을 위해 라운드6에 처음 제안한 역할이었다. 라운드7 D-034로 정식 확정되어(§0 참조) 이제는 다른 창과 어긋날 위험이 없다.

## 3. 설계 의도 — "한 장만 봐도 답이 나오는가?" 자체 점검

§1의 판단 기준("자료 4장을 나란히 놓고 한 장만 봐도 답이 나오는가")을 스키마 레벨에서 적용해 봤다.

- `farmer`(농민) 혼자로는 "장시가 늘었다"(bobusang), "수공업자가 자유로워졌다"(craftsman) 근거를 낼 수 없다.
- `evidenceOptions`가 8개 중 최소 2개, 서로 다른 역할 출처 2개를 요구하므로, 한 역할만으로는 `synthesis`가 구조적으로 완료되지 않는다(`scripts/15`가 이 조건을 기계적으로 검사한다, §4).
- `recordkeeper`(기록관)의 근거(`ev7_record_bias`, "기록에 남지 못한 사람들의 삶은 잘 드러나지 않는다")는 다른 역할의 주장을 뒷받침하는 근거가 아니라 **한계를 직접 가리키는 근거**라, `limitOptions`와 자연스럽게 연결되도록 설계했다.

## 4. 2단계에 넘길 것 (남의 파일은 고치지 않음)

라운드7 §0 지시대로 §1(역할 본문 확정)·§2(대조실 수정 요청 반영)가 끝난 뒤, 이 창이 확정 문장을 JSON에 옮기는 2단계가 온다. 그때 할 일:

- `claude_joseon_late_role_cards.md`의 5개 역할(`farmer`/`bobusang`/`craftsman`/`recordkeeper`/`laborer`) `privateInfo`/`sharePrompt`/`interest`를 이 JSON의 자리표시자와 그대로 교체한다.
- 대조실이 `evidenceOptions`의 8개 문장(특히 `ev6_mining`의 "설점수세제", `ev8_wage_labor`의 "품팔이" 서술)에 수정 요청을 남기면 반영한다.
- 역할 카드 문서에 남아 있는 `[출처 후보: 대조실 확인 필요]` 6곳이 2단계에서 대조실 확인을 거쳐 관문 설계실 문서에 반영되면, 그 변경이 이 JSON의 `evidenceOptions` 라벨과도 어긋나지 않는지 다시 대조한다.

## 5. 검증

- `python -c "json.load(...)"` — 통과
- 스키마 자체 대조(§1 관문): `roleIds` 3/4/5개, `evidenceOptions`의 `roleId`가 전부 `roles[].id`와 일치, `minEvidence`/`minDistinctRoleSources` 모두 2 이상, `limitOptions`에 "알 수 없다" 항목 3개 포함 — 눈으로 직접 대조 완료(`scripts/15_validate_cooperative_packet.js`는 조작대가 이번 라운드에 신설 중이라 아직 실행할 수 없음 — 대상 파일이 있어도 그 스크립트가 없으면 자동 통과 규칙이라 명시).
- `python scripts/01_validate_game_data.py`, `python scripts/06_validate_static_assets.py` — 기존 정적 데이터 대상 검사라 이 신규 파일과 무관하게 통과(참고용으로 실행).
- `apps/**`를 열지 않았고, `js/*.js`·`data/mud/*.json`을 수정하지 않았다. `git status --short`로 이 JSON 1개 + 이 노트 1개만 바뀌었음을 확인.
