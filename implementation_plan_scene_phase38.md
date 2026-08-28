# 구현 계획 — Phase 38: 근현대 5종 15개 활동 장면 사양

작성: Opus 5 / 실행: Sonnet 5
선행: Phase 37 완료·커밋·푸시(`5cb5e6b`, scene 81개, 검증 9종 + 스모크 2종 PASS)
병행 작업자: Codex(문서 운영 체계 7종 + 완료 조건 P1 + 기기 회귀 P3)
상위 문서: Phase 34 로드맵 §0의 결정 1~6은 그대로 유효. Phase 37에서 확립된 관례를 계승한다.

---

## 0. 범위

Phase 37 완료 시점에 프로젝트 전체에서 **`scene` 미선언 + `required: true`인 시뮬레이터 단계는 정확히 15개**만 남았고, 그것이 이번 Phase의 대상 전부다(전수 조사로 확인). 따라서 **Phase 38 완료 시 모든 필수 활동 단계가 장면을 갖게 되어 장면 사업이 종결된다.**

| MUD | 대상 단계 | mode | 이미 완료(건드리지 않음) |
|---|---|---|---|
| `regular_independence` | 1, 2, 3 | text-reading / battle-gauge / text-reading | 4 (`independence-evidence`) |
| `regular_japanese_rule_1` | 1, 2, 3 | text-reading / battle-gauge / text-reading | 4 (`colonial-1910s-evidence`) |
| `regular_japanese_rule_2` | 1, 2, 3 | text-reading / battle-gauge / culture-touch | 4 (`colonial-1930s-evidence`) |
| `regular_modern_open` | 1, 2, 3 | text-reading / culture-touch / culture-touch | 4 (`modern-open-evidence`) |
| `regular_post_war` | 1, 2, 3 | culture-touch / text-reading / culture-touch | 4 (`post-war-evidence`) |

15개 전부 `hotspots` 없는 게이지·정보형이다(전수 확인 완료). 따라서 Phase 36~37과 동일하게 **`card()` 헬퍼를 쓰지 않고 화면 전체 단일 구도**로 그린다.

---

## 1. 이번 Phase에서 새로 발견한 사항과 처리 방침

### 1-1. **[최우선] `battle-gauge` 레거시 그래픽이 내용과 정면으로 어긋나 있다**

`js/mudSimulators.js:252`의 레거시 `battle-gauge` 분기는 현재 다음을 그린다.

> 검은 배경 + 붉은 원 + **"⚔️ 호국 결전 🛡️"** + **"화면을 터치하여 승기를 잡으세요!"**

이 그래픽이 지금 표시되고 있는 세 단계는 다음과 같다.

| 단계 | 실제 내용 | 현재 표시되는 그래픽 |
|---|---|---|
| `independence:2` | 아우내 장터 만세 운동 — 글로서리가 **"무기를 들지 않고 맨손에"** 를 명시한 비폭력 시위 | ⚔️ 결전·승기 |
| `japanese_rule_1:2` | 토지 조사 사업 — 농민의 토지 상실 | ⚔️ 결전·승기 |
| `japanese_rule_2:2` | **강제 동원·일본군 '위안부' 피해자 추모** — instruction이 "평화의 불을 밝히세요", narrative가 **"피해를 자극적으로 재현하지 않고"** 를 명시 | ⚔️ 결전·승기 |

특히 세 번째는 추모를 지시하는 화면에 전투·승리 도상이 뜨는 상태로, 단순한 시각 개선이 아니라 **콘텐츠 적합성 결함**이다. Phase 38은 이 교정을 최우선 목적으로 삼는다. Sonnet은 `japanese_rule_2:2`(`memorial-candlelight`)를 **가장 먼저 구현**하고, 구현 즉시 육안 확인할 것.

레거시 분기 자체는 삭제하지 않는다(다른 MUD가 `battle-gauge`를 쓸 여지와 회귀 테스트 대상 유지). `scene` 선언으로 우회하는 기존 방식을 그대로 따른다.

### 1-2. `infoText`가 없는 단계 4개 — 대체 근거 규칙(신규)

Phase 37은 "`infoText`를 1순위 근거로 삼는다"를 확립했으나, 이번 대상 중 4개는 `infoText` 자체가 없다.

| 단계 | 대체 근거 |
|---|---|
| `independence:1` | `gaugeLabel`("만세 함성 확산도") + `badge`(3·1 독립선언서 낭독) + `location`(탑골공원) + `glossary` |
| `japanese_rule_1:2` | `gaugeLabel`("토지 수탈 저항 의지") + `badge`(토지 조사 사업) + `location`(동양척식주식회사 & 농촌) |
| `japanese_rule_2:2` | `gaugeLabel`("진실과 인권의 촛불") + `instruction`(평화의 불) + `narrative`의 명시 지침 |
| `post_war:1` | `gaugeLabel`("피난민 재건 에너지") + `instruction`(판잣집·밥 한 그릇) + `location`(영도다리·청계천 판자촌) |

**규칙: `infoText`가 없으면 `gaugeLabel` → `badge`/`location` → `glossary` → `instruction` 순으로 근거를 삼는다.** `narrative`는 이번 Phase에서 예외적으로 승격한다(§1-3).

### 1-3. `narrative`에 교육 지침이 내장되어 있다 — 이번 Phase는 narrative를 지침으로 읽는다

Phase 37에서는 `narrative`를 무시했으나(silhak 3단계 불일치 사례), 근현대 5종의 `narrative`는 **주제를 서술하는 대신 해석상 주의사항을 명시**하는 형태다. 이는 장면 설계에 직접 구속력을 갖는 지침이므로 **반드시 반영한다.**

| 단계 | narrative에 명시된 지침 | 장면 반영 방식 |
|---|---|---|
| `independence:1` | "많은 시위가 비폭력을 내세웠다" | 무기 없음, 맨손·깃발만 |
| `independence:2` | **"한 사람의 영웅담으로만 좁히지 말고"** | 중앙 단독 주인공 금지, 실루엣 전원 동일 크기 |
| `japanese_rule_1:2` | "한 숫자로 단정하기보다" | 수치·그래프 금지, 필지 형태 차이로만 표현 |
| `japanese_rule_1:3` | **"특정 행동을 영웅적으로만 평가하기보다"** | 인물 영웅화 금지, 둘러앉은 동일 실루엣 |
| `japanese_rule_2:2` | **"피해를 자극적으로 재현하지 않고, 기록·증언·기억 활동"** | 피해 장면 전면 금지, 추모·기록만 |
| `modern_open:2` | "이용 기회는 사람마다 달랐습니다" | 만능 미화 금지 |
| `modern_open:3` | "시설 하나가 모든 사람의 삶을 바꾸었다고 단정할 수 없다" | 화려한 근대 잔치 금지 |
| `post_war:1` | "어려움과 서로 돕는 모습을 함께" | 폐허 과장·풍요 미화 양쪽 다 금지 |
| `post_war:2` | **"한 가지 성공 신화가 아니라"** | 감동 서사 과장 금지, 물건 위주 |
| `post_war:3` | **"평화는 개인의 다짐만으로 만들어지지 않습니다"** | 통일 완성 도상 금지, 진행형으로 |

`independence:2`의 경우 `infoText`는 유관순 개인을 중심에 두지만 `narrative`는 개인 영웅화를 경계한다. 이는 silhak 사례와 달리 **주제 불일치가 아니라 같은 주제에 대한 서술 층위 차이**이므로, 주제는 `infoText`(아우내 장터 만세)를, 인물 비중은 `narrative`(집단적 참여)를 따른다. 문구는 어느 쪽도 수정하지 않는다.

### 1-4. 근현대 장면 공통 금지 사항 (신규 — 이번 Phase의 핵심 결정)

기존 `balhae-dongmosan` 주석의 "병사·무기는 그리지 않는다" 선례를 근현대 전체로 확장·명문화한다.

1. **무기·군인·폭력·구타·구속·부상 묘사 전면 금지.** 칼(헌병 도검 포함)·총·대포·군함·철창 도상 금지.
2. **가해 주체를 특정하는 국가·정치 상징 금지.** 일장기·욱일기·신사 도리이 등을 그리지 않는다.
3. **피해 장면 재현 금지.** 탄광 내부, 전선, 강제 이송, 수용 시설을 그리지 않는다. 기록물·추모물로 대체한다.
4. **인물은 동일 크기 실루엣으로만.** 얼굴 이목구비를 그리지 않는다(표정 부여 금지). 특정 실존 인물을 지목하는 복식·소품 금지.
5. **태극 문양을 정밀 묘사하지 않는다.** 깃발이 필요하면 흰 사각형 + 중앙 원 하나까지만(4괘·태극 곡선 오기 위험 회피).
6. **추모 조형물(평화의 소녀상 등 특정 상징물)을 그리지 않는다.** 해석 논란을 피해 촛불·꽃 등 일반적 추모 기호만 쓴다.

### 1-5. 팔레트 딕셔너리는 건드리지 않는다 (Phase 37 계획서 오류 정정)

Phase 34~37 계획서는 관례적으로 "팔레트 N줄 추가"를 지시했으나, `drawPaleoActivity`의 `colors` 딕셔너리는 **핫스팟 원의 테두리 색으로만 쓰인다.** 대상 15개는 전부 `hotspots`가 없어 `drawPaleoActivity`가 호출되지 않으므로 **팔레트 항목을 추가하면 죽은 코드가 된다.** Phase 37에서도 실제로 추가하지 않았고 정상 동작했다. Sonnet은 **팔레트에 아무것도 추가하지 않는다.**

---

## 2. 장면 키 15개

| MUD:단계 | mode | `scene` 키 |
|---|---|---|
| `regular_independence:1` | text-reading | `tapgol-declaration` |
| `regular_independence:2` | battle-gauge | `aunae-market-rally` |
| `regular_independence:3` | text-reading | `shanghai-provisional-government` |
| `regular_japanese_rule_1:1` | text-reading | `gendarme-rule-ordinance` |
| `regular_japanese_rule_1:2` | battle-gauge | `land-survey-office` |
| `regular_japanese_rule_1:3` | text-reading | `secret-society-oath` |
| `regular_japanese_rule_2:1` | text-reading | `imperial-subject-policy` |
| `regular_japanese_rule_2:2` | battle-gauge | `memorial-candlelight` |
| `regular_japanese_rule_2:3` | culture-touch | `korean-language-society` |
| `regular_modern_open:1` | text-reading | `ganghwa-treaty-hall` |
| `regular_modern_open:2` | culture-touch | `jejungwon-postal` |
| `regular_modern_open:3` | culture-touch | `hanyang-tram-street` |
| `regular_post_war:1` | culture-touch | `busan-shanty-rebuild` |
| `regular_post_war:2` | text-reading | `tent-classroom` |
| `regular_post_war:3` | culture-touch | `dmz-reunion-peace` |

기존 81개 키와 충돌 없음(확인 완료). 완료 후 총 **96개**.

---

## 3. 장면별 시각 사양

공통: 도형 4~6개, 배경에 글자 금지, 상단 `y<0.16` 비우기, `setLineDash` 사용 시 즉시 `[]` 복원, §1-4 금지 사항 전면 적용.

### 팔레트 원칙 (시대별 채도 — 기존 evidence 장면의 톤을 계승)

| 시대 | 하늘/배경 | 지면 | 성격 |
|---|---|---|---|
| 개항기(`modern_open`) | `#dee6ec` → `#eef2ea` | `#8ab0c2` | 청회색 전환기 |
| 1910년대(`japanese_rule_1`) | `#e2ded2` → `#eeeae0` | `#a9a08c` | 가장 탈색된 회갈색 |
| 1930~40년대(`japanese_rule_2`) | `#ded9d0` → `#eae6dc` | `#9a9284` | 가장 어두움, 온기 포인트 1개만 허용 |
| 3·1·임시정부(`independence`) | `#eee6d2` → `#f6f0dd` | `#c9b98c` | 회백색 + 절제된 적/청 포인트 |
| 전후(`post_war`) | `#e6e2d4` → `#f0ece0` | `#9a9284` | 1→3단계로 갈수록 온기 증가 |

---

### `tapgol-declaration` (독립 1) — 근거: gaugeLabel "만세 함성 확산도" + 탑골공원 + 비폭력
탑골공원 팔각정을 중앙에 크게(팔각 지붕 = 넓은 사다리꼴 + 기둥 2~3개). 정자 앞에 펼쳐진 선언서 문서 한 장(가로 기록선 3줄, 글자 없음). 정자를 향해 선 **동일 크기 사람 실루엣 5~6개**, 각자 손에 작은 사각 깃발(흰 사각 + 중앙 원 하나만). 팔각정에서 바깥으로 퍼지는 옅은 동심원 호 2~3개로 함성 확산을 표현. **무기 없음.**

### `aunae-market-rally` (독립 2) — ⚠️ 레거시 전투 그래픽 교정 대상
장터 좌판(가로 널판) 2개를 화면 좌우에. **중앙은 비우고** 동일 크기 사람 실루엣 6~7개를 가로로 고르게 배치 — 누구도 더 크거나 앞서지 않게(내러티브의 영웅화 경계 반영). 각자 작은 사각 깃발. 배경에 낮은 초가지붕선 1~2개. **군인·무기·충돌·붉은 전투색 금지.**

### `shanghai-provisional-government` (독립 3) — infoText: 삼권분립·민주공화제
서양식 2층 건물 정면(창 격자 4~6개 = 상하이 조계 건물). 건물 앞에 **동일 높이·동일 굵기 기둥 3개**를 나란히 세워 삼권분립을 형태로만 은유. 입구 위에 빈 사각 명패(글자 없음). 바닥에 계단 2~3단.

### `gendarme-rule-ordinance` (식민1910 1) — infoText: 헌병 경찰 즉결 처벌권
**폭력 묘사 절대 금지.** 텅 빈 교실(사람 없는 책상 3~4개 나란히). 뒤쪽 벽에 걸린 법령 문서 한 장(굵은 테두리 사각 + 가로 기록선 3줄). 문서 우하단에 붉은 사각 도장 자국 하나(강제성의 절제된 기호). **칼·헌병·구타 도상 없음.**

### `land-survey-office` (식민1910 2) — ⚠️ 레거시 전투 그래픽 교정 대상
위에서 내려다본 논밭 필지 격자 — **크기가 제각각인 사각형 6~8개**. 그중 2~3개에만 굵은 테두리와 작은 도장 자국을 그려 "신고된 것과 그렇지 않은 것"의 차이를 형태로만 표현(수치·그래프 금지). 한쪽에 측량 삼각대 하나(다리 3개 + 짧은 가로대). **사람·충돌 없음.**

### `secret-society-oath` (식민1910 3) — infoText: 비밀 결사
어두운 실내. 낮은 등불 하나(작은 원 + 옅은 광원 원). 그 아래 접힌 서약 문서 한 장(가로 기록선 2줄). 주위에 **동일 크기 사람 실루엣 3~4개가 원형으로 둘러앉음**(얼굴 없음). **무기·처단 도상 금지**(글로서리에 "처단" 언급이 있으나 도상화하지 않는다).

### `imperial-subject-policy` (식민1930 1) — infoText: 창씨개명 거부 시 입학 거부·배급 중단
관공서 게시판 한 장(사각 판) 위에 빈 명부 문서 2장(가로 기록선, 글자 없음). 아래에 배급 창구를 뜻하는 작은 사각 개구부 하나. 창구 앞에 **동일 크기 사람 실루엣 3~4개가 줄지어 섬**. **신사·도리이·일장기 등 특정 국가·종교 상징 금지.**

### `memorial-candlelight` (식민1930 2) — ⚠️⚠️ 최우선 교정 대상, 가장 먼저 구현할 것
**추모 공간만 그린다.** 어두운 배경 중앙에 촛불 3~4개(작은 세로 원통 + 그 위 옅은 노란 불빛 원 — 이 장면에서만 온기 포인트 허용). 촛불 옆에 놓인 기록 문서 한 장(가로 기록선 2줄)과 작은 꽃 한 송이(줄기 + 꽃잎 원 3~4개).
**절대 금지: 인물, 탄광, 전선, 이송, 구속, 피해 장면, 특정 추모 조형물, 붉은 전투색.** narrative가 "피해를 자극적으로 재현하지 않고 기록·증언·기억 활동"을 명시한 근거를 코드 주석으로 남길 것.

### `korean-language-society` (식민1930 3) — infoText: 조선어학회, 원고 이동 경로
책상 위에 두껍게 쌓인 원고 뭉치(사각 종이 4~5장이 살짝 어긋나게 겹침, 가로 기록선만). 옆에 원고 상자 하나(사각 + 뚜껑선). 배경에 원고의 이동을 뜻하는 **점선 경로 1개**(`setLineDash` 사용 후 반드시 `[]` 복원). **고문·투옥 도상 금지.**

### `ganghwa-treaty-hall` (개항 1) — infoText: 부산·원산·인천 개항
연무당 실내 탁자 하나. 그 위에 조약 문서 2장이 마주 놓임 — **한쪽 문서에만 도장 자국을 더 크게** 그려 불평등을 형태로만 암시. 배경 창밖에 돛단배 실루엣 1개와 물결선 2개(개항). **군함·대포 금지**(narrative의 "무력 위협"은 배경 설명일 뿐 도상화하지 않는다).

### `jejungwon-postal` (개항 2) — infoText: 제중원, 신분 차별 없는 평등한 진료
기와 지붕 한옥 건물 하나(제중원). 그 옆에 우체통 하나(세로 원통 + 상단 투입구 가로선). 건물 앞에 **동일 크기 사람 실루엣 3개**가 줄지어 섬 — 신분을 나타내는 복식 구분 없음(평등 진료가 이 장면의 핵심). 화려한 근대 도시로 과장하지 않는다.

### `hanyang-tram-street` (개항 3) — infoText: 전차, 신분 차별 없이 나란히 앉는 평등한 교통
전차 한 대 측면(직사각 차체 + 창문 4개 + 바퀴 2개 + 지붕 위 짧은 집전 폴 1개). **창문 안에 동일 크기 사람 머리 실루엣 4개가 같은 높이로 나란히**(평등). 위쪽에 전선 1줄과 전등 1개. 배경 지붕선 1~2개. 불빛 잔치로 과장하지 않는다.

### `busan-shanty-rebuild` (전후 1) — 근거: gaugeLabel "피난민 재건 에너지" + 판자촌·나눔
비탈에 붙어선 판잣집 지붕 4~5채(크기 제각각, 어긋난 사각형으로 판자 느낌). 그 앞에 온기를 뜻하는 솥/그릇 하나(반원 + 김을 뜻하는 짧은 곡선 2개). 주변에 동일 크기 사람 실루엣 2~3개. **폐허를 참혹하게 과장하지도, 풍요롭게 미화하지도 않는다**(narrative의 "어려움과 서로 돕는 모습을 함께").

### `tent-classroom` (전후 2) — infoText: 전쟁 중에도 이어진 교육
천막 한 채(사다리꼴 + 가운데 입구 세로선). 천막 앞 바닥에 **사과 궤짝 책상 3개**(동일 크기 작은 사각형)와 그 위 공책 한 권씩(가로 기록선 1줄). 옆에 몽당연필 1개(짧은 사각 + 삼각 끝). 인물은 그리지 않거나 동일 크기 실루엣 2개까지만(감동 서사 과장 금지).

### `dmz-reunion-peace` (전후 3) — infoText: 상흔 치유와 평화로운 미래
화면 중앙 가로로 **끊어진 낮은 울타리 점선 1개**(`setLineDash` 사용 후 복원) — 철조망을 상세히 그리지 않는다. 그 좌우에 **동일 크기 사람 실루엣 2개씩**이 서로를 향해 섬. 위쪽에 비둘기 1마리(타원 몸통 + 삼각 날개 2개). 배경에 DMZ 생태를 뜻하는 낮은 풀·나무 실루엣 2~3개. **통일이 이미 완성된 듯한 도상(합쳐진 한반도 지도 등)·정치 구호·국기 금지** — "여러 노력"의 진행형으로 표현.

---

## 4. 코드·데이터 지침

1. JSON: 각 대상 `simulator`의 `"mode"` 다음 줄에 `"scene"` 한 줄만 추가. 라인 단위 삽입, 재직렬화 금지. 문구(`instruction`/`infoText`/`feedback`/`narrative`/`glossary`)는 한 글자도 수정하지 않는다.
2. JS: `drawConfiguredSceneBackground`에 `if` 블록 15개 추가. 기존 압축 스타일 유지, `sceneRenderers` 맵 리팩터링 금지, `card()` 호출 금지, **팔레트 딕셔너리 수정 금지**(§1-5).
3. `js/mudSimulators.js:252`의 레거시 `battle-gauge` 분기는 **삭제하지 않는다**(회귀 테스트 대상).
4. `memorial-candlelight`와 `gendarme-rule-ordinance`에는 **왜 그렇게 그렸는지 근거를 코드 주석 1줄로 남긴다**(기존 `gaya-ironware`/`balhae-dongmosan` 주석 관례).
5. `index.html`의 `?v=` 쿼리를 1 올린다(현재 `20260828-p15` → `p16`, 착수 전 재확인).
6. `README.md` 및 Codex 소유 7개 문서 수정 금지.
7. **착수 전 필수**: `git fetch` 후 원격 상태 확인. Codex가 병행 작업 중이므로 로컬 파일이 다를 수 있다.
8. 검증 스크립트 실행이 `activity_duration_audit.md`를 부수적으로 변경하면 커밋 전 `git checkout --`으로 되돌린다(Phase 37 관례).
9. 검증 전부 PASS 시 Phase 단위로 커밋한다. 공유 JSON 수정 범위를 커밋 메시지에 명시한다.

## 5. 검증

표준 9종 + `node -c` 3개 + 스모크 2종.

- **스모크(a)**: 신규 15개 키가 전부 `true` 반환, `setLineDash` `[]` 복원, 미지 키 `false`.
  - `korean-language-society`와 `dmz-reunion-peace`는 `setLineDash`를 쓰므로 복원 확인이 특히 중요하다.
- **스모크(b) — 이번 Phase에서 성격이 바뀐다**: Phase 38 완료 후 실제 데이터에는 **`scene` 미선언 필수 단계가 하나도 남지 않는다.** 따라서 레거시 회귀 테스트는 반드시 **합성 시뮬레이터 객체**로 구성해야 한다(Phase 37 스모크(b) 방식 그대로). `battle-gauge`·`text-reading`·`culture-touch` 각각에 대해 scene 없는 요청이 여전히 레거시 분기를 타는지 확인할 것.
- **JSON↔JS 교차 검사**: 완료 후 총 **96개**(81 + 15) 일치.
- **육안 검수 필수**: Phase 37에서 육안 검수로 3건(색 대비·구도)을 잡아냈다. 이번에는 **콘텐츠 적합성까지 걸려 있으므로 15개 전부 렌더링해 반드시 눈으로 확인한다.** 특히 `memorial-candlelight`는 구현 직후 단독으로 먼저 확인할 것.

## 6. 문서화

- Codex 소유 7개 문서(`PRD.md`/`BACKLOG.md`/`DECISIONS.md`/`project_context.md`/`walkthrough.md`/`agents.md`/`activity_duration_audit.md`)는 Claude가 직접 쓰지 않는다.
- 완료 후 `phase38_codex_handoff.md`를 작성한다. 사용자가 확정한 **필수 항목 7개**를 반드시 포함한다: ① 커밋 ID ② 변경 파일·단계 ③ 추가·수정한 scene 정보 ④ 핫스팟·interaction·completion 변경 여부 ⑤ 검증 결과 ⑥ 충돌 가능 파일 ⑦ 후속 검토가 필요한 콘텐츠·기획 이슈.
- 공용 문서로의 최종 통합은 Codex가 담당한다.

## 7. 보고 시 반드시 포함할 특기 사항

1. **`battle-gauge` 레거시 전투 그래픽 교정 3건**(§1-1) — 특히 `japanese_rule_2:2`는 추모 화면에 전투 도상이 떠 있던 콘텐츠 적합성 결함이었음을 명시.
2. **장면 사업 종결** — Phase 38 완료로 `scene` 미선언 필수 단계 0개, 총 96개 장면.
3. 근현대 장면 공통 금지 사항(§1-4)을 신규 설계 원칙으로 확립했다는 점 — Codex의 `DECISIONS.md` 반영 후보.
4. `infoText` 없는 단계의 대체 근거 규칙(§1-2) — 역시 `DECISIONS.md` 반영 후보.

## 8. Opus 재호출 조건

- §1-4 금지 사항을 지키면서는 해당 단계의 학습 내용을 시각적으로 구분되게 표현할 수 없다고 판단될 때(특히 `imperial-subject-policy`, `land-survey-office`).
- 15개 중 서로 형태가 너무 비슷해져 단계 구분이 안 되는 경우(문서·서류 도상이 6개 단계에 반복 등장하므로 실제 위험이 있다). 이때는 임의로 도상을 바꾸지 말고 보고할 것.
- 콘텐츠 적합성 판단이 필요한 새 사례가 나올 때 — Sonnet은 자체 판단으로 완화하지 말고 보고한다.

## 9. 이후 남은 범위

Phase 38 완료로 **장면 사업 종결**. 이후 남는 것은 Codex 담당 영역(완료 조건 P1 재설계, 기기·브라우저 회귀 P3)과, §7-3·§7-4의 설계 원칙을 `DECISIONS.md`에 반영하는 작업이다.
