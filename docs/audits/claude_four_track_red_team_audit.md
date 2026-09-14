# Claude 4트랙 결과 red team 감사

`TASK-20260914-01 | Claude 4트랙 inquiry-task·확장 활동·유적 페어 red team 감사 | audit agent(Codex) | 상태: DONE`

- 감사 기준: `origin/main` `d435149` (2026-09-14)
- 요청 문서: [`codex_red_team_round3_handoff_20260914.md`](../handoff/codex_red_team_round3_handoff_20260914.md)
- 범위: inquiry-task 파일럿 4편, `나의 연표`, 신규 유물·유적 페어 2개, Codex 소유 브랜치·worktree
- 원칙: 코드와 데이터는 수정하지 않았다. 이 문서만 추가했다.

## 1. 결론과 위험도 순위

| 순위 | 결과 | 심각도 | 판정 |
|---|---|---|---|
| 1 | `나의 연표`가 개항기→조선 전기, 현대→3·1 운동처럼 실제 연대와 반대인 순서를 정답으로 요구한다 | 학생 오학습 | 확인 |
| 2 | `regular_modern_open` 4관문의 민감 주제 균형 게이트를 아예 거치지 않고 양의 변화 근거 2장만으로 완료할 수 있다 | 학생 오학습 / 게임성 붕괴 | 확인 |
| 3 | 삼국·신석기·고려 4관문에도 주장에 들어 있는 핵심 요소를 빼고 통과하는 D-027 계열 의미 결함이 남아 있다 | 학생 오학습 | 확인 |
| 4 | 네 편 모두 정답 상태를 한 번에 맞히기는 어렵지만, 상태 보존·차원별 피드백·무제한 재시도로 전수 대입 통과가 가능하다 | 게임성 붕괴 | 확인 |
| 5 | 암사동 유적의 `움집터 100여 개`가 공식 설명의 `20여 기` 및 서울역사편찬원 조사 정리의 `25기`와 어긋난다 | 학생 오학습 | 확인 |
| 6 | 근대 개항 2관문은 연도가 없는 해석인 `이용 기회의 차이 확인`을 1884·1885년 사건 뒤의 연대순 사건처럼 강제한다 | 학생 오학습 | 높은 개연성 |
| 7 | 고창 유적의 핵심 수치·성격은 맞지만 일부 출토품·사회상 해석은 현재 `sourceNote`만으로 추적 검증되지 않는다 | 경미 | 근거 부족 지적 |

계약 검증기는 정상 통과한다. 따라서 1~7은 JSON 형식 오류가 아니라 현재 계약이 표현하지 못하는 **주장 문장과 필수 근거의 의미 일치**, **정렬키와 실제 연대의 일치**, **출처가 뒷받침하는 서술 범위** 문제다.

## 2. 세부 발견

### RT-01. `나의 연표`가 실제 연대와 반대인 정답을 만든다

- 재현 경로 A: `regular_modern_open`을 완료해 `art_23`을 얻고, `regular_sejong`을 완료해 `art_sejong`을 얻은 뒤 다른 유물 하나를 더 해금한다. `확장 역사 활동 → 역사 연표 → 나의 연표`를 연다. 해금 유물이 6개를 넘으면 두 카드가 함께 뽑힐 때까지 `다른 유물로 다시 뽑기`를 누른다.
- 실제 결과 A: `getArtifactTimelineRank()`가 `art_23`을 `(2단원, 11차시)`, `art_sejong`을 `(2단원, 24차시)`로 만들어 **한양 전차·전등(개항기) → 훈민정음·앙부일구(조선 전기)** 순서를 정답으로 요구한다.
- 기대 결과 A: 세종 시기 유물이 19세기 말 전차보다 먼저 와야 한다.
- 재현 경로 B: `art_20`(전후·이산가족)과 `art_independence`(3·1 운동)를 포함해 나의 연표를 연다.
- 실제 결과 B: `(3단원, 12차시) → (3단원, 38차시)`로 정렬되어 **현대 → 일제 강점기**를 정답으로 요구한다.
- 기대 결과 B: 3·1 운동(1919)이 전후·이산가족 자료보다 먼저 와야 한다.
- 재현 경로 C: `art_8`(고려 문화)과 `art_deep_1`(선사·고조선 심화) 또는 `art_29`(백제)를 함께 포함한다.
- 실제 결과 C: 차시가 없는 보상은 해당 단원의 `lesson=99`가 되어 고려 유물 뒤에 선사·백제 유물을 놓는다.
- 기대 결과 C: 예외 보상도 실제 시대에 맞는 정렬키를 가져야 한다.
- 심각도: **학생 오학습**. 성공 화면은 이를 `완벽합니다`라고 보상한다. `같은 시대 안의 세부 순서는 실제와 다를 수 있다`는 안내도 조선 전기↔개항기, 일제 강점기↔현대처럼 서로 다른 시대가 뒤집힌 사례를 완화하지 못한다.

근거: [`miniGames.js`](../../js/miniGames.js)의 `getArtifactTimelineRank()`는 차시가 있으면 그대로 쓰고, 심화·무차시 보상은 `lesson=99`로 보낸다(402~419행). `buildPersonalTimelineEvents()`는 이 키만 정렬한다(429~435행). 혼재된 힌트는 [`artifacts.json`](../../data/artifacts.json)의 `art_23`, `art_sejong`, `art_independence`, `art_korean_war`, `art_29`, `art_deep_1~4`에서 확인된다.

인계서가 의심한 첫 번째 가정인 `unlockedArtifacts 배열 순서 = 클리어 순서`는 현재 코드에는 없다. 코드는 해금 배열을 membership 확인에만 사용하고 `artifacts.json`의 canonical 목록을 별도 정렬한다. 따라서 **차시 건너뛰기 자체는 결함 원인이 아니며**, 두 번째 가정인 `hint의 차시 = 일관된 역사 순서`가 실제 원인이다.

### RT-02. 근대 개항 4관문의 양극단 방지가 선택 사항이라 균형 게이트가 우회된다

- 재현 경로: `regular_modern_open` 1~3관문을 정상 완료한다. 4관문에서 주장 `connect-treaty-institution-city`를 고르고, 근거는 `modern-institution-access` + `tram-urban-change`만 선택한다. 자료의 한계는 아무것도 선택하지 않고 `판단 확인`을 누른다.
- 실제 결과: 조약 근거가 0장인데도 `complete / connector`가 반환되고 관문이 열린다. 직접 evaluator 실행 결과도 같은 상태를 `complete`로 판정했다.
- 기대 결과: `조약의 불평등성과 근대 시설·도시 생활의 변화를 함께 연결`한다는 주장은 적어도 `treaty-unequal-clauses`와 변화 근거 하나를 요구해야 한다. 편 전체 완료 메시지도 실제 사용한 근거 범위를 넘어서 `조약·시설·도시 생활의 근거를 연결`했다고 말해서는 안 된다.
- 심각도: **학생 오학습 / 게임성 붕괴**.

양극단 선택지 `tram-alone-enough`, `treaty-erases-progress`는 [`regular_modern_open.json`](../../data/mud/regular_modern_open.json) 457~473행에 있으나 `limitId` 자체가 선택 사항이다. [`mudInquiry.js`](../../js/mudInquiry.js) 495행은 한계를 선택했을 때만 오답을 검사한다. 따라서 학생은 두 극단을 검토하지 않아도 된다. 더 나아가 두 번째 주장 `institution-and-city-show-change`와 양의 변화 근거 두 장만 고르면 불평등 조약을 최종 종합에서 완전히 제외하고도 동일하게 완료된다.

1관문 자체는 일본의 무력 위협과 불평등 조항을 명시하므로 `발전만 정답`으로 만들지는 않았다. 다만 정답 문장의 `개항의 계기` 부분을 뒷받침하는 자료는 없고, 필수 자료 두 장은 모두 불평등 조항뿐이다. 국사편찬위원회 자료는 강화도 조약을 `강요된 개항, 불평등한 조약`으로 설명한다. 따라서 1관문의 균형은 **결론 문구에는 있으나 근거 묶음에는 절반만 구현**되어 있다.

### RT-03. 다른 4관문의 D-027 계열 의미 누락

현재 검증기는 `minCategories`의 구조적 죽음과 `requiredCategories`의 도달 가능성은 잡지만, **주장 문장에 들어 있는 역사 요소마다 필수 근거가 있는지**는 알지 못한다.

| 편·관문 | 재현 선택 순서 | 실제 결과 | 기대 결과 | 심각도 |
|---|---|---|---|---|
| 삼국 4관문 | 주장 `han-river-changed-hands` → 백제 + 고구려 근거 → 한계 미선택 → 제출 | 신라 근거 없이 `백제→고구려→신라` 주장이 `complete` | 세 나라의 순차 교체를 말하면 백제·고구려·신라 근거를 모두 요구 | 학생 오학습 |
| 신석기 4관문 | 주장 `environment-and-technology` → 환경 + 토기 근거 → 한계 미선택 → 제출 | 의생활 근거 없이 `여러 기술`을 갖췄다는 주장이 `complete` | 복수 기술을 말하면 토기·의생활을 모두 요구하거나 주장을 단수 범위로 제한 | 학생 오학습 |
| 고려 4관문 | 주장 `technology-and-exchange` → 보관 + 교류 근거 → 한계 미선택 → 제출 | 제작·인쇄 근거 없이 `제작·인쇄 기술과 국제 교류` 주장이 `complete` | 교류뿐 아니라 제작 또는 인쇄 근거도 필수로 요구 | 학생 오학습 |

직접 evaluator 실행에서 세 상태 모두 `complete / connector`를 반환했다. 삼국 첫 주장은 가능한 2~3장 조합 4개가 모두 통과하며, 그중 3개는 한 나라를 빼고 통과한다. 신석기 첫 주장은 4개 조합 중 3개가 통과한다. 고려 첫 주장은 교류 근거를 포함한 10개 조합이 통과하며 그중 `보관+교류`도 포함된다.

### RT-04. 전수 대입은 가능하며 특히 `commit-revise`와 마지막 관문이 약하다

재현 방법은 각 관문의 제출 가능한 모든 상태를 만들어 [`mudInquiry.js`](../../js/mudInquiry.js) `evaluateTask()`에 대입하는 것이다. 1~3관문의 `awards`를 실제 런의 누적 근거로 넣었고, 4관문의 한계는 UI에서 허용하는 대로 미선택했다.

| 편 | 1관문 | 2관문 | 3관문 | 4관문 |
|---|---:|---:|---:|---:|
| 고려 문화 | commit `3/9` | sequence `1/72` | map `1/27` | claim `19/40` |
| 신석기 | map `1/12` | sequence `1/18` | commit `3/9` | claim `4/8` |
| 삼국 | commit `3/9` | map `1/12` | sequence `1/18` | claim `5/8` |
| 근대 개항 | commit `3/9` | sequence `1/18` | map `1/12` | claim `5/8` |

분모는 해당 관문에서 제출 가능한 구조적 상태 수, 분자는 `complete` 상태 수다. 이 표는 학생의 실제 무작위 확률 측정이 아니라 판정 공간 전수 열거다.

- `commit-revise`: 첫 판단은 정오 판정에 전혀 쓰이지 않는다. 자료 버튼 두 개를 모두 연 뒤 최종 선택지 세 개를 차례로 제출하면 최대 세 번에 통과한다. 자료를 `열었는지`만 확인하며 읽기·관계 판단은 확인하지 않는다.
- `map-evidence`: 3×2×2 또는 3×3×3 중 정답 조합은 하나다. 그러나 오답 피드백이 장소→근거→한계 중 처음 틀린 차원을 알려 주고 앞선 선택을 보존하므로, 학생은 차원별로 선택지를 순회할 수 있다.
- `sequence`: 초기 정답 배열은 피하도록 셔플되고 의미 질문도 실제로 판정하므로 한 번 찍기 통과에는 강하다. 다만 모든 순열을 만들 수 있고 시도 제한·상태 초기화가 없으며 첫 불일치 카드의 이유를 알려 주므로 끝까지 대입하면 통과한다.
- `claim-evidence`: 마지막 관문의 통과 밀도가 `1/2`, `5/8`, `19/40`으로 높다. 한계 미선택이 허용되고 주장 두 개 모두 통과 가능한 주장이라 무작위 근거 조합에 대한 저항이 가장 약하다.

- 실제 결과: 새 세 편은 `첫 배열 그대로/같은 곳 연타`로 즉시 열리는 구형 게이트는 아니지만, **읽지 않고 선택지를 순회하는 전략을 막지는 못한다**.
- 기대 결과: 오답 횟수 제한을 뜻하지는 않는다. 다만 주장에 필요한 요소를 빠뜨린 조합은 막고, 재시도 피드백이 단순한 차원별 정답 탐색표로만 기능하지 않아야 한다.
- 심각도: **게임성 붕괴**. 특히 4관문은 학생 오학습과 결합한다. 1~3관문은 수업 관찰 없이 실제 이탈 정도를 단정하지 않는다.

기존 `scripts/09_audit_tap_resistance.py`는 inquiry-task를 후보로 보고하지 않는다. 이번 감사의 조합 대입 문제는 이 스크립트가 다루는 `target/minActions` 기반 반복 탭과 다른 검증 공백이다.

### RT-05. `commit-revise`·`sequence`·`map-evidence`의 잔존 조건 점검

#### `commit-revise.requiredEvidenceIds`

- 재현: 네 편의 1~3관문 중 `commit-revise`를 열고 첫 판단 후 지정 자료를 각각 연다.
- 실제 결과: 모든 ID가 실제 `evidence`에 존재하고 버튼으로 도달 가능하며, 전부 열기 전 최종 판단은 비활성화된다. 중복·미도달 ID는 없었다.
- 기대 결과: 구조적으로 동일하다.
- 심각도: **결함 없음**. 다만 RT-02처럼 `필수 자료가 정답 문장 전체를 받치는가`는 별도 의미 검증이 필요하다.

#### `sequence.meaningQuestion`

- 재현: 각 sequence에서 정답 순서 + 오답 의미, 오답 순서 + 정답 의미를 각각 제출한다.
- 실제 결과: 둘 중 하나라도 틀리면 `revise`, 둘 다 맞아야 `complete`다. 의미 질문 자체는 노출되며 판정된다.
- 기대 결과: 구조적으로 동일하다.
- 심각도: **구조 결함 없음**.

단, `regular_modern_open` 2관문의 의미는 사실·연대 모델에 문제가 있다.

- 재현 경로: `우정총국 설립(1884) → 제중원 설립(1885) → 이용 기회의 차이 확인`으로 놓고 정답 의미를 선택하면 완료된다. `이용 기회의 차이`를 앞에 놓으면 실패한다.
- 실제 결과: 연도가 없는 분석적 결론을 1885년 뒤에 일어난 세 번째 사건처럼 취급한다. 편의 `sources`에는 두 시설의 이용 격차가 그 순서로 `나중에 드러났다`는 근거도 없다.
- 기대 결과: 날짜가 확인된 사건만 연대 정렬하거나, 이용 격차는 순서 밖의 의미·한계 질문으로 다뤄야 한다.
- 심각도: **학생 오학습**. 확신도는 높지만, 별도 1차 사료가 있다면 재검토할 수 있다.

#### `map-evidence` 조합

- 재현: 네 편에서 정답 장소에 오답 근거 또는 오답 한계를 섞어 제출한다.
- 실제 결과: 모두 `revise`; 정답 장소·근거·한계가 함께 맞아야 `complete`다. 각 편의 세 정답은 의미상 서로 연결된다. `labels.location/support/limit`와 hotspot/location ID도 모두 존재한다.
- 기대 결과: 구조적으로 동일하다.
- 심각도: **결함 없음**. 단, RT-04의 차원별 전수 대입 내성은 별개다.

### RT-06. 신규 유물·유적 페어 사실관계

#### 확인된 오류 — 암사동 움집터 수

- 재현 경로: 유물·유적 대조실에서 `cmp_artifact_site_1` 또는 `cmp_site_vs_site_1`을 연다. `서울 암사동 유적`의 규모와 학계 관점 문장을 읽는다.
- 실제 결과: [`artifactComparisons.json`](../../data/artifactComparisons.json) 660·692·712행이 `움집터 100여 개`라고 반복한다.
- 기대 결과: 국가유산포털 설명은 `20여 기의 집터`, 서울역사편찬원 자료는 지금까지의 발굴조사에서 `25기의 신석기시대 움집터`라고 정리한다. `100여 개`는 현재 연결된 공식 근거와 일치하지 않는다.
- 심각도: **학생 오학습**. 두 페어의 규모 비교와 `scholarPerspective`에 반복되어 영향 범위가 넓다.

면적 `98,354㎡`, 빗살무늬 토기 소장품번호 `신수22891`, 암사동 출토, 흙·연질, 공공누리 제1유형은 공식 페이지와 일치한다.

#### 확인된 정상 항목 — 고창 핵심 수치·성격

- 재현 경로: `cmp_site_vs_site_1`의 고창 죽림리 지석묘군 규모·성격을 읽는다.
- 실제 결과: 동서 약 1,764m, 447기, 국내 최대 고인돌 군집, 매산마을 중심 구릉 분포, 2000년 세계유산 등재라고 설명한다.
- 기대 결과: 국가유산포털과 UNESCO 설명에 부합한다. UNESCO는 고창 구역을 `over 440 dolmens`의 가장 크고 다양한 군집으로 설명한다.
- 심각도: **결함 없음**.

#### 근거가 부족한 서술 — 보류 권고

- 재현 경로: 같은 페어의 `coFinds`, `ev_uniformity`, `scholarPerspective`를 읽는다.
- 실제 결과: `고인돌 아래에서 청동기 시대 간석기·토기 조각`, `움집들이 다 비슷한 크기`, `고인돌이 커질수록 계급이 뚜렷`을 개별 사실 또는 단선적 관계처럼 제시한다.
- 기대 결과: 현재 `sourceNote`가 직접 가리키는 국가유산포털·UNESCO 페이지는 고인돌이 장례·사회·정치 체계를 이해하는 자료라는 일반 해석은 지지하지만, 이 페어의 출토품 문장과 크기-계급의 단조 관계를 그대로 입증하지 않는다. 발굴보고서 등 항목별 출처를 연결하거나 표현을 `해석할 수 있는 단서` 범위로 제한해야 한다.
- 심각도: **경미**. 사실 오류로 확정하지 않고 출처 추적 불가로 기록한다.

출처 정책 자체도 새 `kind: "site"` 대상의 `checkedAt`·`hasPhoto` 저장 위치를 정의하지 못했다. 정책은 `site.checkedAt`과 `site.hasPhoto`를 요구하지만, 신규 페어는 비교 대상 자체를 site로 승격하면서 `museumId`·`museumUrl`을 재사용하고 날짜는 `sourceNote`/`license` 문장에만 둔다. 링크는 유효하지만 기계 검증 가능한 추적성이 약해진 상태다.

## 3. 계약 변경 확인

인계서 §2의 변경을 확인했다. 이번 감사에서는 MUD JSON을 수정하지 않았다.

현재 `scripts/04_validate_mud_contract.py`는 다음을 오류로 처리한다.

1. `claim-evidence.minCategories`가 어떤 허용 선택으로도 실패할 수 없는 경우
2. `requiredCategories`가 `accepts`로 도달 불가능한 경우
3. `map-evidence.task.labels.location/support/limit`가 없거나 빈 문자열인 경우

`python scripts/04_validate_mud_contract.py`는 현재 32개 MUD에 대해 통과했다. 네 파일럿의 map-evidence 라벨도 모두 존재한다. RT-02·03은 이 세 조건을 통과하면서도 남는 의미 계약 공백이다.

화면 문구를 편 데이터에 두는 D-029 원칙과 `css/style.css` 수정 시 `index.html` 캐시버스터를 함께 갱신하는 규칙도 이후 MUD 작업의 선행 조건으로 확인했다.

## 4. Codex 브랜치·worktree 처리 권고

이번 감사에서는 브랜치, worktree, 원격 참조를 삭제하거나 변경하지 않았다.

| 대상 | 확인 결과 | 권고 |
|---|---|---|
| `codex-deep-three-kingdoms` | `main..branch` 18커밋, merge-base `dfa0124`. 현재 main과의 순방향 병합은 `apps/cooperative-live` 등 173개 파일의 삭제·되돌림을 포함하는 낡은 베이스다. 뒤로가기·추가 미션 코드는 main의 `5067620`, `6636734`에 이미 동등하게 반영됐다. 브랜치 전용 난이도 계획은 과거의 D-019를 가리키지만 현재 D-019는 Convex 결정이라 번호도 충돌한다. | **병합 대기 아님, 폐기 권고.** 필요하면 tip `a4d1f75`에 archive tag를 남긴 뒤 로컬·원격 브랜치를 삭제한다. 18커밋 일괄 merge/cherry-pick 금지. 전용 계획 문서도 현재 문서 체계와 충돌하므로 승격하지 않는다. |
| `fix/deep-three-choice-bias` + `.worktrees/codex-join-security` | worktree 깨끗함. `main..branch`는 3커밋이지만 `git cherry`의 2개는 patch-equivalent이고, 남은 `9ef85ae`의 두 선택지 수정도 main `d1d435d`에 동일하게 존재한다. `data/mud/deep_three_kingdoms.json`의 실질 차이 0. | **반영 완료로 간주.** worktree 제거 후 로컬·원격 브랜치 삭제. merge/cherry-pick 불필요. worktree 이름과 checkout 브랜치 이름이 다르므로 경로를 먼저 확인하고 제거한다. |
| `audit/interaction-diversity` + `.worktrees/codex-interaction-audit` | worktree 깨끗함, tip이 main ancestor, 미반영 0, 원격 있음 | worktree 제거 → 로컬 브랜치 삭제 → 원격 브랜치 삭제 |
| `integrate/interaction-diversity-deploy` + `.worktrees/codex-interaction-deploy` | worktree 깨끗함, tip이 main ancestor, 미반영 0, 원격 브랜치 없음 | worktree 제거 → 로컬 브랜치 삭제 |
| `docs/readme-refresh` + `.worktrees/codex-readme-refresh` | worktree 깨끗함, tip이 main ancestor, 미반영 0, 원격 브랜치 없음 | worktree 제거 → 로컬 브랜치 삭제 |
| `feat/cooperative-join-security` | tip이 main ancestor, 미반영 0, 원격 있음 | 로컬·원격 브랜치 삭제. 현재 실시간 협동 작업은 main의 `apps/cooperative-live`를 기준으로 계속한다. |
| `feat/cooperative-live-vertical-slice` | tip이 main ancestor, 미반영 0, 원격 있음 | 로컬·원격 브랜치 삭제 |
| `feat/cooperative-virtual-load-test` | tip이 main ancestor, 미반영 0, 원격 있음 | 로컬·원격 브랜치 삭제 |
| `chore/cooperative-live-privacy-preview` | tip이 main ancestor, 미반영 0, 원격 브랜치 없음 | 로컬 브랜치 삭제 |

삭제 실행 전에는 다시 `git worktree list`, 각 worktree의 `git status --short --branch`, `git merge-base --is-ancestor <branch> main`을 확인한다. `codex-deep-three-kingdoms`만 main ancestor가 아니므로 일반 `git branch -d` 대상처럼 취급하지 않는다.

## 5. 검증 기록

실행 결과:

- `git fetch origin` 후 `origin/main = d435149`
- `python scripts/04_validate_mud_contract.py` — PASS, 32 MUD
- `python scripts/09_audit_tap_resistance.py` — 기존 규칙 후보 6개, inquiry-task는 보고 대상 아님
- `node scripts/05_test_simulator_runtime.js` — PASS
- `MudInquiry.evaluateTask()`에 네 편의 제출 가능 상태 전수 대입 — RT-02~04 결과 재현
- `MiniGameEngine.buildPersonalTimelineEvents()`에 36개 유물 전부 해금 상태 대입 — RT-01의 역전 순서 재현
- `git branch --all`, `git worktree list --porcelain`, `git cherry main <branch>`, 각 worktree status와 ancestor 검사 — §4 근거 확인

사실관계 확인 출처:

- [국가유산포털 — 서울 암사동 유적](https://www.heritage.go.kr/heri/cul/culSelectDetail.do?VdkVgwKey=13%2C02670000%2C11&pageNo=5_1_1_0)
- [국가유산 디지털 서비스 — 서울 암사동 유적](https://digital.khs.go.kr/heri/heriDetail.do?ctptNo=1331102670000&ctptUid=13898859676183300884)
- [서울역사편찬원 — 서울 역사 총서(암사동 유적 발굴 정리)](https://history.seoul.go.kr/ebook/getFile/p0LtKCbceFr/pdf)
- [국립중앙박물관 — 빗살무늬토기 신수22891](https://www.museum.go.kr/site/main/relic/search/view?relicId=4328)
- [국가유산포털 — 고창고인돌유적](https://heritage.go.kr/heri/html/HtmlPage.do?pageNo=1_2_2_1&pg=%2Funesco%2FHeritage%2FHeritage_07.jsp)
- [UNESCO World Heritage Centre — Gochang, Hwasun and Ganghwa Dolmen Sites](https://whc.unesco.org/en/list/977)
- [국사편찬위원회 우리역사넷 — 강화도 조약](https://contents.history.go.kr/mobile/kc/view.do?levelId=kc_i400800)
- [국사편찬위원회 우리역사넷 — 새로운 탈것의 등장과 자동차의 도입](https://contents.history.go.kr/mobile/km/view.do?levelId=km_004_0060_0010_0010)

## 6. Claude 판정 (2026-09-14, Opus 5)

사용자 방침에 따라 좋은 지적은 반영 대상으로, 나머지는 기록만 한다. 핵심 주장은 코드와 데이터로 직접 재현해 확인했다.

| 항목 | 판정 | 확인 |
|---|---|---|
| RT-01 나의 연표 역전 | **수용** | `art_sejong`(2단원 24차시)이 `art_23`(2단원 11차시) 뒤로 정렬됨을 `getArtifactTimelineRank()`로 확인. 원인은 hint의 차시 번호가 연대순이 아니라는 점 |
| RT-02 근대 4관문 균형 우회 | **수용** | 조약 근거 0장 + 한계 미선택으로 `complete` 재현 |
| RT-03 주장 요소 누락 통과 | **수용** | 삼국 4관문에서 신라 근거 없이 `complete` 재현 |
| RT-04 전수 대입 가능 | **부분 수용** | 관찰은 맞다. 다만 오답 횟수 제한·감점을 두지 않는 것은 초등 대상 의도된 설계(BACKLOG P1 레드팀 항목)이므로 "게임성 붕괴" 판정은 과하다. RT-02·03 수정으로 마지막 관문 통과 밀도를 낮추는 것까지만 반영하고, 재시도 구조 변경은 수업 관찰 뒤로 미룬다 |
| RT-05 근대 2관문 분석 카드의 연대 강제 | **수용** | 연도 없는 해석 카드를 사건 순서에 넣은 설계 오류 |
| RT-06 암사동 움집터 수 | **수용(수정 전 출처 재확인)** | `100여 개`가 660·712행에 반복됨을 확인. 수정 시 국가유산포털 원문을 다시 열어 수치를 확정한다 |
| RT-06 고창 서술 근거 부족 | **수용(표현 완화)** | 사실 오류 확정이 아니므로 "해석할 수 있는 단서" 범위로 문장을 낮춘다 |
| 출처 정책의 `kind:"site"` 추적 필드 공백 | **기록만** | 기능 영향 없음. 다음 유적 페어 추가 시 정책 문서와 함께 정한다 |
| §4 브랜치 처리 권고 | **타당** | `fix/deep-three-choice-bias`의 `deep_three_kingdoms.json` 실질 차이 0을 확인. 원격 삭제·archive tag는 사용자 확인 후 실행 |

추가로 얻은 교훈: D-027 검증기는 **범주 조건의 구조**만 보고, **주장 문장이 말하는 요소마다 근거가 요구되는지**는 보지 못한다. 이 공백은 스크립트로 완전히 메울 수 없으므로 콘텐츠 검토 규칙으로 둔다 — 주장이 여러 요소(나라·기술·조약과 변화)를 말하면 요소마다 `requiredCategories`를 둔다.
