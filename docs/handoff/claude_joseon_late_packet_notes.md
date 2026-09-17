# 조선 후기 협동 패킷 초안 — 연결 공방 작업 노트 (라운드6 §3, 라운드7 §3 갱신, 라운드7 2단계 2-나, 라운드8 §4에서 초안 폐기)

## -2. 라운드8 §4 — 이 문서가 다루던 패킷 초안은 삭제됨

`data/cooperative/joseon_late_packet.draft.json`은 D-035·라운드8 §4 지시(`git rm`)에 따라 저장소에서 지웠다. 최종 콘텐츠는 이제 실제 앱 계약 모양(`CooperativeScenario`+`PublicScenario`)을 그대로 따르는 **`docs/handoff/claude_joseon_late_runtime_scenario.json`** 한 파일이다 — 등록은 Codex가 한다. 이 노트(§-1 이하)는 그 조립까지 오는 과정(2단계 2-나에서 확정 문장을 반영한 기록)을 남겨 두기 위해 그대로 보존한다. `sharePrompt`·질문 틀 3종은 `docs/handoff/claude_joseon_late_teacher_sticky_wall.md`로 이동했다(§0에 `sharePrompt` 표 추가).

새 런타임 파일에서 패킷 초안과 달라진 점:
- 필드 이름이 다르다 — `firstJudgment.choices`→역할별 `firstChoices`(모든 역할 동일), `targetOptions`+`claimPrompt`→`sharedPrompt.connections`(대상+영향이 이미 녹아든 완성 문장), `limitOptions`→`sharedPrompt.limitations`, "장시/화폐/농사법" 선택지→`sharedPrompt.policies`.
- 역할당 근거가 **1개**로 줄었다(역할 카드 v2가 고른 대표 근거). 패킷 초안의 `evidenceOptions` 8개(역할별 1~2개)는 앱에 옮기지 않았다 — 앱은 역할당 `evidence` 배열 1개만 받는다.
- `target_landlord`("양반 지주")는 옮기지 않았다 — 대조실이 §8-4에서 지주 역할 카드가 없어 근거가 없다고 확인했고, D-035가 삭제를 확정했다.
- `sources`는 패킷 초안에 없던 필드다. 대조실이 §8-1에서 정리한 9건을 그대로 옮겼다(§8-2 추론 문장은 제외).
- "아직 잘 모르겠다" 선택지는 앱 `firstChoices`에 넣지 않았다(지시대로) — 이유 입력 필드 자체가 앱에 없어(고려 예시와 동일하게 선택지만 있음) 이유를 요구하는 이 선택지는 애초에 어울리지 않았다.

검증: `node scripts/15_validate_cooperative_packet.js --runtime docs/handoff/claude_joseon_late_runtime_scenario.json` → PASS(길이 제안값 경고 3건, 카드 원문 그대로라 미수정). `--final`은 대상 파일이 없어 SKIP.

## -1. 라운드7 2단계(2-나) — 확정 문장 반영

`claude_joseon_late_role_cards.md`(상태 "확정(2단계)")의 `privateInfo`/`sharePrompt`/`interest`를 5개 역할 전부 옮겼다. 자리표시자 0곳.

- 문장 속 `[출처: ...]`, `[2단계 정정: ...]` 같은 편집 메모·출처 코드(`nh_033_...` 등)는 전부 뺐다 — 학생이 읽는 문장에는 근거를 남기지 않는다는 라운드5 §0 규칙 그대로다. 근거 자체는 역할 카드 문서와 `joseon_late_source_review.md`에 이미 있다.
- 보류 문장(역할 카드 문서 §11, 이모작·가격변동·"보부상이 가져온 물건과 경쟁" 등)은 되살리지 않았다 — 카드 원문에도 없는 문장이라 옮길 것 자체가 없었다.
- `ev6_mining` 라벨을 대조실 제안대로 "정부 허가 받은 사람이 은광 등을 캐고 세금 냈다"(21자)로 교체했다.
- 3인 공통 자료 라벨(`jangsi-craftsman-summary`)을 "장시에 물건 만들어 파는 사람도 있었다"(21자)로 줄이고, 역할 카드 문서 §3-1 지시("특정 roleId를 달지 않는다")대로 `roleId`도 뺐다.
- **기록관 4번 문장을 JSON에서만 두 문장으로 나눴다.** 카드 원문("상평통보를 쓰는 사람이 늘었다는 이야기는 있지만, 저희 고을 기록만으로 나라 전체에서 얼마나 퍼졌는지는 확실히 알 수 없습니다.", 71자)은 역할 카드 문서에 그대로 두되, 이 JSON의 `privateInfo`에는 "상평통보를 쓰는 사람이 늘었다는 이야기는 있습니다." / "하지만 저희 고을 기록만으로 나라 전체에서 얼마나 퍼졌는지는 확실히 알 수 없습니다."로 나눠 넣었다. 그 결과 recordkeeper의 `privateInfo` 문장 수가 6개(원래 5개 + 분할로 +1)가 됐다 — 지시받은 대로 한 것이니 "3~5문장 권장"보다 늘어난 것은 의도된 이탈이다.

### 완료 기준 확인

- `node scripts/15_validate_cooperative_packet.js --final` → **PASS(자리표시자 0곳)**.
- 같은 실행에서 길이·과잉단정 경고 다수(전부 "제안값" 경고, 실패 아님) — farmer/craftsman/recordkeeper의 `privateInfo` 문장 수가 3~5 권장을 넘거나(각 6/6/8문장 — recordkeeper는 위 분할로 의도된 것, farmer·craftsman은 카드 원문을 그대로 옮긴 결과 이미 그렇게 쓰여 있었다), 일부 `interest`·`evidenceOptions[].shortLabel`이 80자/30자 제안값을 넘는다. **이번 라운드 지시(§4)가 명시적으로 요청한 것만 고쳤고**(ev6_mining, 3인 라벨, 기록관 4번), 나머지 길이 초과는 조작대 §3이 "제안값이며 수업 리허설(10/12~16)에서 조정한다"고 스스로 적어 둔 항목이라 임의로 카드 원문을 다시 자르지 않았다 — 확정된 카드 문장을 이 창이 축약하면 관문 설계실·대조실이 검증한 내용이 달라질 위험이 있다.
- `roles[recordkeeper].interest`에 "모든 사람"이 과잉 단정어로 걸렸는데, 문장이 "…모든 사람과 모든 고을의 사정을 다 **알 수 없다**는 것도"라는 **부정문**이라 `limit_scope`와 같은 종류의 오탐이다. 카드 원문 그대로 옮긴 것이라 고치지 않았다 — 조작대의 부정문 오탐 제거가 이 새 검사(길이·과잉단정 통합, 라운드7 §3)에도 적용되면 자동으로 사라질 것으로 본다.
- `node scripts/15_validate_cooperative_packet.js --cards`(관문 설계실 문서 대상, 참고용으로 함께 실행) — 경고 2건: farmer #2(77자), recordkeeper #4(71자, 이번에 JSON에서만 분할한 바로 그 문장). 이 문서는 관문 설계실 소유라 고치지 않았다.
- `04`/`05`/`13`/`14` 재실행 — 전부 회귀 없음. 13/14가 재생성한 조작대 소유 감사 산출물 2개는 `git checkout --`로 원복.

이제 이 파일에는 `[PLACEHOLDER` 문자열이 없다 — `--final` 옵션이 기대하는 상태다.

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
