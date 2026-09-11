# BACKLOG

> 완료된 기능은 이 목록에 넣지 않는다. 완료 이력은 [`walkthrough.md`](./walkthrough.md), 현재 상태는 [`project_context.md`](./project_context.md)에서 확인한다.

## P1 실험 — Regular MUD 상호작용 다양성 수업 검증

- 작업 claim: `TASK-20260910-01 | Regular MUD 핫스팟 반복 구조·시대별 조작 다양성 감사 | 기획·점검 에이전트(Codex) | 상태: DONE`
- 계획 claim: `TASK-20260910-04 | 고려 문화 상호작용 다양성 파일럿 구현 계획 수립 | 기획·점검 에이전트(Codex) | 상태: DONE`
- 구조 claim: `TASK-20260910-05 | Regular MUD 상호작용 전체 구조·확장 계획 수립 | 기획·점검 에이전트(Codex) | 상태: DONE`
- 상태: `implemented / classroom-validation-needed` — `regular_goryeo_culture` 한 편의 수직 파일럿과 공용 계약·검증은 완료했다. 실제 학생 관찰과 지정 모바일·태블릿 뷰포트 검증 전에는 다른 Regular로 확장하지 않는다.
- 구현 claim: `TASK-20260910-06 | regular_goryeo_culture inquiry-task 수직 파일럿 구현 | 실행·코딩 에이전트(Codex) | 상태: DONE`
- 문제 기준선: 파일럿 전 Regular의 필수 시뮬레이터 112개 중 104개(92.9%)가 원형 핫스팟 계열이고 103개(92.0%)의 `completion.target`이 3이었다. 파일럿 후에는 `inquiry-task` 4개가 추가되어 필수 단계 중 target 3은 99개(88.4%), JSON 핫스팟 배열 단계는 99개로 줄었지만 모두 핫스팟이 정확히 3개인 전체 구조 문제는 여전히 남아 있다.
- 기존 감사와의 구분: 반복 탭 내성 감사는 “같은 단서를 연타해 게이트를 우회하는가”를 검사한다. 이번 항목은 “서로 다른 역사 단계에서 같은 조작 문법을 반복하는가”를 다루므로 기존 감사 통과 여부와 별개다.
- 교육적 영향: 배경과 라벨은 달라도 학생 행동이 `세 원을 순서대로/아무 순서로 누르기`에 수렴한다. `resource-allocation`·`reflection`도 실제로는 `hotspot-discovery`와 같은 처리기를 사용한다. 다만 4분 완료·학생 이탈의 직접 원인이라는 주장은 아직 가설이며 수업 비교 관찰이 필요하다.
- 레드팀 후속 검증: JSON 기반 `ordered-hotspot` 55개는 sequence 밖 함정 단서가 0개다. 오입력은 진행도·시도 상태에 남지 않고, 좌표 입력 뒤 feedback을 읽거나 근거 관계를 이해했는지도 판정하지 않는다. 다만 전체 앱에는 퀴즈 점수·타이머와 유물·배지가 있으므로 “게임 요소 전무”는 과장이고, 초등 역사 학습에 속도·감점을 바로 넣는 방향은 채택하지 않는다. 상세: [`regular_gameplay_red_team_audit.md`](./docs/audits/regular_gameplay_red_team_audit.md).
- 방향: 102개 장면 일괄 재작성 금지. 서로 다른 시대의 단편 3개보다 **Regular MUD 한 편의 4단계 수직 슬라이스**에서 `관찰 → 분류·순서화 → 인과·공간 추론 → 주장·근거·반례` 난이도 곡선을 시험한다. 1차 후보는 비민감 주제이고 단계별 사고 행동이 분명한 `regular_goryeo_culture`다. 기존 `hotspot-choice`와 새 범용 계약 1개까지만 허용한다.
- 아이디어 옵션: [`regular_interaction_gameplay_idea_options.md`](./docs/plans/regular_interaction_gameplay_idea_options.md) — 판단–공개–수정, `card-placement`, 지도 근거 선택, 실제 자원 배분, 반례 찾기, 근거 충분도 등급, 유물 도구화, 관점 기반 재플레이를 비교한다. 확정 사양이 아니며 계획 승인 전 구현하지 않는다.
- 파일럿 계획: [`implementation_plan_regular_interaction_diversity_pilot.md`](./docs/plans/implementation_plan_regular_interaction_diversity_pilot.md) — `inquiry-task` 하나의 하위 task로 첫 판단·순서·지도 근거·주장–근거를 구성하고, `completion.strategy: validated-state`로 의미 상태를 판정한다. 기술 구현·데스크톱 브라우저 검증 완료.
- 전체 구조 계획: [`regular_interaction_architecture_plan.md`](./docs/plans/regular_interaction_architecture_plan.md) — 표현·입력·판정·진행 계층, 상태 수명, 28종 인지 행동 매핑과 4~6종 단위 확장 게이트를 제안한다. 파일럿 증거 전에는 `ARCHITECTURE.md`·`ROADMAP.md`·`DECISIONS.md`로 승격하지 않는다.
- 구현 범위: 신규 `js/mudInquiry.js`, `simulator_contract.json`, `js/mudEngine.js`, `js/mudSimulators.js`, `index.html`, `css/style.css`, `data/mud/regular_goryeo_culture.json`, 계약·무결성·런타임·반복 탭 감사기. 다른 27개 Regular 데이터는 변경하지 않았다.
- 다음 게이트: 390×844·820×1180 실기기 또는 동등 뷰포트 점검과 학생 3명 이상 수업 관찰을 기록한다. 전체 28종 확장은 그 결과를 검토한 뒤 별도 승인한다.

### 2026-09-10 Claude 실플레이 검증 — 수정 완료 2건

Codex가 red team으로 구현한 파일럿을 Claude가 운영 사이트(GitHub Pages)에서 4관문 끝까지 직접 플레이해 확인했다. 콘솔 에러 0건.

유지·확장할 좋은 점(Codex 구현에서 취함):
- 1관문 "최종 판단" 선택지는 근거 자료 2개를 **모두** 열기 전까지 DOM에서 `disabled`다. 자료를 읽지 않고 정답만 찍는 경로가 실제로 막혀 있다.
- 2관문 순서 오답은 "틀린 카드 그 자체"를 짚어 피드백한다. 반복 오답 시 힌트가 붙지만 정답 순서를 노출하지 않는다.
- 근거 누적이 관문을 넘어 이어진다(2장 → 4장 → 6장). 4관문 근거 카드는 실제로 획득한 것만 표시된다.
- 순서 카드가 셔플되어 제시되므로 초기 배열 그대로는 통과하지 못한다.

수정한 문제(TASK-20260910-07 | Claude | 상태: DONE):
1. **[중대] 4관문이 주장과 무관한 근거로 통과됐다.** "제작·인쇄 기술과 **국제 교류**를 균형 있게 설명할 수 있다"는 주장을 고르고 팔만대장경 제작·보관 근거 2장만 연결해도(교류 근거 0장) 게이트가 열렸다. 원인과 재발 방지는 `DECISIONS.md` D-027 참조. 조치: `reusable-type`의 category를 `technology` → `printing-process`로 통합해 범주 조건을 실제로 작동시키고, 주장 1번에 `requiredCategories: ["exchange"]`를 추가했다. `js/mudInquiry.js`에 `requiredCategories` 판정과 주장별 피드백을 추가했다.
2. **[중] 3관문 3번 지시문이 정답과 논리적으로 반대였다.** "이 자료로 단정할 수 없는 범위를 고르세요"인데 정답은 *한계를 바르게 서술한 문장*이고, 문자 그대로 "단정할 수 없는 내용"은 오답(과잉 일반화)이었다. `js/mudInquiry.js`의 섹션 제목을 "3. 이 자료의 한계를 바르게 말한 문장을 고르세요"로 바꿨다.

검증기 보강: `scripts/04_validate_mud_contract.py`에 `check_claim_categories`를 추가해 (a) `requiredCategories`가 `accepts`로 도달 불가능하면 오류, (b) `minCategories`가 어떤 선택으로도 실패할 수 없으면 오류로 잡는다. 수정 전 데이터를 넣으면 두 주장 모두 "can never fail"로 검출되고, 수정 후 데이터는 통과한다.

회귀 검증(로컬 정적 서버, 4관문 실플레이): 이전에 통과하던 무관 근거 조합은 "이 주장은 국제 교류까지 말하고 있습니다…"로 차단되고 게이트가 닫힌 채 유지된다. 같은 범주(인쇄) 근거 2장도 이제 차단된다. 교류 근거를 포함한 정상 조합은 "역사가 등급"으로 통과하고 패널 전체가 잠긴다. 자동 검증 12종 + `git diff --check` 전부 통과.

기록만 하고 수정하지 않은 항목(수업 관찰 뒤 판단):
- 4관문 주장 2개가 **모두 정답**이라 "주장 고르기"가 판단 단계로 기능하지 않는다. 오답 주장이나 과잉 일반화 주장을 넣을지는 난이도 관찰 뒤 결정한다.
- 4관문 3번(자료의 한계)이 "선택 사항"이다. 3관문에서 필수였던 조건을 마지막에 선택으로 낮춘 것이 의도대로인지 확인이 필요하다.
- 성취기준 `6사04-03`은 "고려 시대 **사회 모습과 사람들의 생활**을 추론"인데, 4관문 주장 2개는 기술·교류에서 멈춘다. 3관문의 `port-record-scope`(모든 지역과 계층을 설명할 수 없다)가 유일하게 생활·계층을 건드리지만 그 산출물 `record-limit`은 4관문 근거 목록에서 빠져 있다. 주장을 생활·사회 모습까지 확장할지는 콘텐츠 재설계 범위라 파일럿 관찰 뒤로 미룬다.
- MUD 상단 "진행도" 게이지가 관문을 넘어가도 0%로 유지된다. `validated-state`가 게이지를 올리지 않는 것인지 원래 다른 축의 지표인지 아직 구분하지 못했다.

## 2026-09-08 유물 2개 비교·추론 프로토타입

TASK-20260908-CMP1 | 유물 2개 기반 역사적 추론 프로토타입 구현 | 담당: Claude Sonnet 5 | 상태: DONE

- 배경: `EXP-002`, `BACKLOG.md` P2 항목, [`scenario_candidates_artifact_comparison_and_cooperative_mud.md`](./docs/plans/scenario_candidates_artifact_comparison_and_cooperative_mud.md) §1의 브레인스토밍을 구현으로 이어받았다.
- 구현 전 재확인(2026-09-08, museum.go.kr 실제 조회): 빗살무늬 토기(신수22891, relicId=4328)·민무늬 토기 항아리(신수10470, relicId=2179) 모두 공공누리 **제1유형(출처표시)**만 적용되며 "변경금지" 조건은 없었다(기존 브레인스토밍 문서의 "빗살무늬=변경금지" 가정은 오류였음). 두 유물 모두 원본 이미지 다운로드 링크가 존재함을 확인했다.
- 사용자 확인 결과, 이번 프로토타입은 (1) 실제 박물관 사진 대신 기존 앱과 동일한 이모지+텍스트 스타일 유지, (2) 스킵 불가 대신 "건너뛰기" 버튼 제공으로 결정했다.
- 구현 범위: `js/mudEngine.js`의 `renderFinalReflection()` 직후 해금 유물이 2개 이상이고 아직 보지 않은 비교 콘텐츠가 있으면 선택형 제안 카드를 띄운다. 시작하면 관찰→근거 카드(무근거 선택지 포함)→빈칸 주장 완성→결과 비교 4단계를 거치며, 결과 화면은 "정답/오답" 표현 없이 학생 생각을 먼저 요약하고 학계 관점을 병치하되 근접도에 따라 칭찬형/안내형으로만 톤을 바꾼다. 완료·건너뛰기 모두 `encyclopedia`의 `seenArtifactComparisons`에 기록해 같은 콘텐츠를 반복 제안하지 않는다.
- 신규/변경 파일: [`data/artifactComparisons.json`](./data/artifactComparisons.json)(1번째 페어: 빗살무늬 토기 vs 민무늬 토기 항아리), [`js/artifactComparison.js`](./js/artifactComparison.js)(신규 엔진), `js/encyclopedia.js`(seen 상태 저장), `js/mudEngine.js`(제안 카드 삽입), `js/app.js`·`index.html`(로드·캐시 버스터 갱신), `scripts/01_validate_game_data.py`(신규 JSON 검증 대상 추가).
- 검증: `python scripts/01_validate_game_data.py`, `python scripts/06_validate_static_assets.py` 통과. 로컬 정적 서버에서 두 톤 분기(근접/차이)와 건너뛰기 시 재노출 안 됨을 브라우저 콘솔로 직접 실행해 확인했다(자동화 테스트는 아직 없음).
- 교사용 수업 진행 안내: [`TEACHING_artifact_comparison.md`](./TEACHING_artifact_comparison.md) (README.md에서도 링크).
- **2026-09-08 확장 1**: 교사가 직접 시험해 보고 긍정적 반응(도전 활동 같은 느낌, 시대를 넘나드는 비교의 재미)을 확인한 뒤, 2번째 페어(청자 상감 구름·학무늬 매병[고려, 덕수2182] vs 백자 달항아리[조선, 접수702])를 추가했다. museum.go.kr 재확인 결과 둘 다 공공누리 제1유형(출처표시)만 적용되고 변경금지 조건은 없다. `unlockThreshold`가 같아 첫 페어를 완료·건너뛴 뒤 다음 MUD 클리어 시 자동으로 이어서 등장한다. 검증은 위와 동일한 방식(브라우저 콘솔)으로 두 톤 분기를 재확인했다.
- **2026-09-08 확장 2**: 사용자와 함께 후속 페어 후보 5개(신라 금관 vs 가야 금동관, 무령왕릉 관식 vs 신라 금관, 청자 vs 분청사기, 상평통보 vs 오늘날 지폐, 혼천의 vs 홍대용 지구의)를 브레인스토밍했다. museum.go.kr에서 실제 확인한 결과:
  - 확정·구현: **3번째 페어** 청자 상감 구름·학무늬 매병(고려, 덕수2182) vs 분청사기 상감 물고기무늬 매병(조선 초기, 덕수253, relicId=967). 둘 다 공공누리 출처표시만 적용. "같은 상감 기법이 왕조 교체기의 혼란 속에서 자유분방한 스타일로 바뀐 이유"로 프레이밍해, 앞선 두 페어(기술 변화·가치관 변화)와 다른 세 번째 해석 유형(사회 격변에 따른 양식 변화)을 추가했다.
  - 보류(소장품번호 미확정): 신라 금관은 금관총 금관(본관9435, relicId=159727)까지 확인했으나, 짝을 이룰 가야 금동관(고령 지산동 32호분 출토)과 무령왕릉 금제관식(국립공주박물관 소장)은 museum.go.kr 검색 UI가 동적이라 신뢰할 수 있는 relicId를 확인하지 못했다. 추측으로 채우지 않고 다음 조사에서 이어간다.
  - 범위 제외: 상평통보 vs 오늘날 지폐는 박물관 유물 페어가 아니라 "그때와 지금" 비교 형식이라 이번 활동 스키마와 결이 다르다. 혼천의(구10035)는 단독으로는 확인했으나 짝(홍대용 지구의 등)이 실물 소장품으로 확인되지 않아 보류.
- **2026-09-08 확장 3**: 사용자가 museum.go.kr에서 직접 가야 금동관을 찾아 알려준 전시실 안내 페이지(고령 지산동 32호 무덤 출토, `M0201030700.do?...relicId=27014`)를 근거로 **4번째 페어**(신라 금관[금관총, 본관9435, relicId=159727] vs 가야 금동관)를 추가했다. 이 페어는 "왕관 형식이 통일됐는지"로 신라(중앙집권)와 가야(연맹체) 정치 체제의 차이를 다루는 네 번째 해석 유형이다. 가야 금동관은 상설전시 안내 페이지 설명만 확보했고 개별 소장품번호·이미지 이용조건은 확인하지 못했다 — 이 활동은 애초에 실물 사진을 쓰지 않으므로 기능상 문제는 없으나 데이터의 `sourceNote`·`license` 필드에 한계를 명시했다.
- **2026-09-08 확장 4**: 사용자가 무령왕 금제 관식 관련 링크 2개(한국민족문화대백과사전, 국가유산청 국가유산포털)를 찾아 전달해 **5번째 페어**(무령왕 금제 관식[백제, 국보154호, 국립공주박물관] vs 신라 금관[금관총, 4번째 페어와 동일])를 추가했다. 국가유산청 페이지에는 공공누리 유형이 명시되지 않아 개별 이미지 이용조건은 이번에도 확인하지 못했다(이미지 미사용이라 기능상 영향 없음). "완성된 관 vs 관에 꽂는 장식", "무덤 주인을 정확히 아는지 여부(무령왕릉 지석 vs 금관총의 무명)"라는 다섯 번째 해석 유형을 추가했다.
- 남은 질문: 실제 교실에서의 피로도·완주율은 미검증(설계 가설). 페어는 이번에 5개로 마무리하고 학생 피드백을 먼저 받기로 사용자와 합의했다.
- **2026-09-08 학생 사전 피드백(교사 전달)**: 상세는 `EXPERIMENTS.md` `EXP-002` 참조. 요약:
  1. 실물 사진을 바로 보고 싶다는 요청 — 교사가 "여러 문제가 있을 수 있어 링크로 대체했다"고 답변. 현재 이모지+텍스트+링크 설계를 유지할지는 후속 판단.
  2. "서로 다른 날 배운 내용을 한번에 비교"하는 재미에 긍정 반응 — 활동의 핵심 가설이 작동한다는 첫 신호.
  3. **후속 기능 후보**: 학생이 "유물 모음(도감)에서 바로 연결될 수 있냐"고 문의(교사 보류). 지금은 MUD 클리어 직후에만 이 활동이 뜨는데, 도감 화면(`renderEncyclopedia`)에서 해금 유물 2개 이상이면 학생이 원할 때 직접 시작할 수 있는 진입점을 추가하는 방안을 검토한다. 정식 수업 관찰(완주율·건너뛰기 비율) 이후 우선순위를 정한다.
- **2026-09-08 학생 피드백 채널 추가**: 기존 "성찰 일기 복사하기" 버튼이 실제로는 안 쓰이고("어디에 남는지 모르겠다") 사용자 수업 스타일과 안 맞는다는 것을 확인했다. 서버 없는 정적 사이트 제약상 자동 수집은 외부 도구 연결이 필요해, 사용자가 만든 구글 설문지(이메일 미수집 설정)로 연결하기로 했다. 질문 문항(공통 6개 + 유물 비교 전용 7개, 섹션 분기)은 Claude가 초안했다. `window.FEEDBACK_FORM_URL`(js/app.js)에 링크를 두고, MUD 공통 완료 화면(`renderFinalReflection`)과 유물 비교 결과 화면(`ArtifactComparisonEngine.renderResultStep`) 양쪽에 새 탭으로 여는 "📮 오늘 활동 피드백 남기기" 버튼을 추가했다. 기존 성찰 일기 버튼은 그대로 두었다(제거 요청 없었음).
- **2026-09-08 버그 수정 — 시대 순서 무시 문제**: 사용자가 "청자·분청사기 매병 페어가 삼국시대 '한강 쟁탈전' MUD 클리어 직후에 등장한다"고 보고했다. 원인: 모든 페어가 `unlockThreshold: 2`로 동일해서, 해금 유물 개수만 보고 시대와 무관하게 배열 순서대로 다음 미확인 페어를 띄웠다(한강 쟁탈전은 칠지도·순수비 2개를 한 번에 줘서 카운트가 급증). 수정: 페어별 임계값을 시대 구간에 맞게 분리했다 — `cmp_pottery_1`(신석기·청동기) 3, `cmp_crown_1`·`cmp_crown_2`(삼국) 6(한강 쟁탈전 직후 정확히 도달), `cmp_ceramics_1`·`cmp_ceramics_2`(고려·조선) 8(고려 문화 MUD 이후). 브라우저 콘솔에서 `getEligibleComparison()`을 유물 개수별로 직접 호출해 각 구간에서 같은 시대 페어만 나오는지 확인했다.
- **2026-09-09 관찰·다음 계획**: 학생마다 참여도 편차가 뚜렷하다는 관찰이 나왔다(상세는 `EXPERIMENTS.md` `EXP-002`). 구글 폼 피드백 채널(2026-09-08 연결)로 응답이 쌓이는 대로 원인을 분석해 수정 작업을 이어가기로 했다. 가까운 목표는 **다른 학급에도 이 포털 링크를 전달**해 표본을 넓히는 것 — 정적 사이트라 학급별 배포에 코드 변경은 필요 없지만, 학급이 늘면 피드백 폼에 학급 구분 필드가 필요할지는 응답이 쌓인 뒤 검토한다.
- **2026-09-09 확장 5**: Codex는 협동 MUD 실시간 서버(Convex) 트랙, Claude(이 채팅)는 유물 비교 트랙으로 역할을 다시 확인했다. **6번째 페어** 김홍도 「논갈이」(단원 풍속도첩, 본관6504-1) vs 신윤복 「저잣길」(여속도첩, 덕수1103)을 추가했다. museum.go.kr 재확인 결과 둘 다 공공누리 출처표시만 적용, 변경금지 없음. 앞선 다섯 페어와 다르게 "같은 조선 후기 화가여도 무엇을 눈여겨봤는지가 다른 이유"(시골 농사 vs 시장 장사)라는 여섯 번째 해석 유형이다. `unlockThreshold: 11`로 조선 후기 서민 문화 MUD(art_11) 이후에 등장하도록 시대 구간을 맞췄다.
- **2026-09-09 콘텐츠 적절성 재검토**: 사용자가 "6번째 페어 그림이 초등학생 수준인가?"라고 물어 다시 확인한 결과, 처음 골랐던 신윤복 「여속도첩」(전체 6면)은 그중 3면이 기녀(妓女)를 그린 것으로 국립중앙박물관이 직접 소개하고 있었다 — 처음엔 화첩 전체를 뭉뚱그려 "몸단장·나들이 등 여성의 일상"으로만 서술해 부정확했다. 사용자는 "김홍도·신윤복 두 화가는 유지"를 확인했고, 국립중앙박물관이 "기녀가 아닌 일반 부녀자를 그린 것"으로 공식 소개하는 3면 중 「저잣길」(생선 장수 여인)만 특정해 다시 작성했다. 관찰·근거·claim 문구도 "여성의 일상"에서 "시장에서 장사하는 여성"으로 구체화했다. 결과 화면의 "실물 보기" 링크도 화첩 전체가 노출되는 박물관 소장품 페이지 대신, 「미인도」(전통 복식 초상화, 안전 확인함) 한 장만 실린 한국민족문화대백과사전 신윤복 소개 글로 바꿨다. 나머지 5개 페어도 같은 기준으로 재검토해 이상 없음을 확인하고, `TEACHING_artifact_comparison.md`에 재사용 가능한 "콘텐츠 점검 체크리스트"를 추가했다.
- **2026-09-09 버그 수정 — 시대 순서 무시 문제(재발, 근본 수정)**: 사용자가 스크린샷으로 "유물 비교 활동이 을사의병·안중근 MUD에도 등장한다"고 보고했다. `unlockThreshold`(9-08 수정)는 "일반적인 순서대로 플레이"할 때만 통했고, 학생이 차시를 건너뛰거나 다른 순서로 하면(예: 근현대 MUD를 먼저 여러 개 클리어) 여전히 무관한 시대 페어가 나왔다 — 해금 유물 총 개수는 실제 진도와 별개였기 때문이다. **근본 수정**: `getEligibleComparison()`을 개수 임계값 대신 `requiredArtifactNames`(그 시대 MUD가 실제로 주는 보상 유물 이름/ID 목록)로 바꿨다. 예: `cmp_ceramics_1`은 "직지심체요절 영인본과 고려 비색 청자"(art_8, 고려 문화 MUD)를 실제로 갖고 있어야만 뜬다. 근현대 유물 9개를 먼저 갖고 있어도 이 마커가 없으면 어떤 페어도 뜨지 않고, 마커를 획득한 순간 정확히 그 페어만 뜨는 것을 브라우저 콘솔로 확인했다(비선형 플레이 시나리오 포함). `unlockThreshold`는 안전장치(마커 미지정 콘텐츠용 대체 로직)로 남겨뒀다.
- **2026-09-09 확장 6~8**: 근본 수정 뒤 새 페어 아이디어를 브레인스토밍해 사용자가 "2→1→4→3" 순서로 진행을 요청했다. museum.go.kr에서 확인한 결과:
  - 확정·구현: **7번째 페어** 휴대용 앙부일구(신수15157, relicId=2399) vs 보루각 자격루(덕수6470, relicId=4530). 세종 시대에 처음 발명됐지만 **지금 남은 실물은 둘 다 후대 제작본**이라는 사실(앙부일구=1871년 강건 제작, 자격루=1536년 중종 때 남은 부속)을 숨기지 않고 traits·scholarPerspective에 정직하게 반영했다. `requiredArtifactNames`는 art_sejong("훈민정음 해례본과 앙부일구").
  - 확정·구현: **8번째 페어** 주먹도끼(구석기, 신수51599, relicId=31578173, 연천군 출토로 게임 속 art_1과 출토지 일치) vs 바퀴날도끼(신석기, 본관6555, relicId=574). 뗀석기→간석기 기술 변화, 정착 생활과의 연결을 다룬다. `requiredArtifactNames`는 art_2("암사동 빗살무늬 토기") — pottery_1(art_3, 청동기)보다 먼저 뜨도록 신석기 MUD를 마커로 썼다.
  - 확정·구현: **9번째 페어** 비파형(요령식) 동검(고조선·청동기, 신수3094, relicId=2040, 1번 페어와 같은 부여 송국리 유적 출토) vs 용·봉황 장식 고리자루 큰 칼(삼국시대, 신수1319, relicId=1968). "무기 소재라 톤 설계 주의 필요"하다고 미리 우려했던 항목이라, 두 유물 모두 "실제 전투보다 신분·권위의 상징물로 무덤에 함께 묻혔다"는 국립중앙박물관 자체 설명을 근거로 무기 대결이 아닌 금속 기술 발전으로 서술을 한정했다.
  - **보류(3번째 후보)**: 고려 과거 합격증 '홍패' vs 5·10 총선거 투표함. 현존하는 고려 시대 홍패 실물 6건이 전부 국립중앙박물관이 아니라 개인·문중 소장(보물 지정)이었고, 국립중앙박물관 소장 홍패는 조선 시대(1814년, relicId=2374)뿐이라 게임 속 art_10(고려 홍패) 설정과 맞지 않았다. 투표함도 국립중앙박물관 소장 여부를 확인하지 못했다. 추측으로 채우지 않고 사용자 확인 하에 이번 범위에서 제외했다.
  - 세 페어 모두 검증: 브라우저 콘솔에서 각 `requiredArtifactNames` 마커만으로 `getEligibleComparison()`이 정확히 매치하는지, 결과 화면까지 진행해 문장·두 톤 분기를 확인했다. `01_validate_game_data.py`·`06_validate_static_assets.py` 통과.
- **2026-09-09 신규 활동 — 유물 탐정 미니게임**: 유물 비교 활동과 별개로 "유물 관련 다른 활동" 3개(개인 전시 준비실·유물 탐정·내 유물 연표)를 브레인스토밍했다. 개인 전시 준비실은 구현 전에 "학생 입력이 어디 저장되는지"를 사용자가 먼저 물어, `localStorage`뿐이라 서버 제출 경로가 필요하다는 걸 답하고 보류했다. 사용자가 학생 수준에 가장 적절하다고 고른 **유물 탐정: 이게 뭘까?**를 구현했다 — 그 학생이 실제로 해금한 유물만(4개 미만이면 비활성) 출제하는 4지선다 힌트 게임(시대→종류→설명 순 3단계 힌트, 오답 시 감점 없이 힌트 자동 추가). 기존 미니게임 3종과 같은 `MiniGameEngine` 클래스에 추가했고(신규 파일 없음), 새 배지 `badge_detective_master`(전 문제 힌트 1개로 완료 시)를 `js/encyclopedia.js`에 추가했다. 검증은 브라우저 콘솔에서 부족 안내·5라운드 생성·오답 힌트 증가·정답 톤 분기·배지 획득까지 전부 확인. 나머지 2개 아이디어(전시 준비실, 내 유물 연표)는 다음 후보로 남긴다.
- **2026-09-10 버그 수정 — 시대 순서 무시 문제(3차, 마커 자체의 결함)**: 사용자가 스크린샷으로 "유물 비교(두 나라의 왕관, 삼국시대)가 3·1 운동/대한민국 정부 수립(근현대) MUD 직후에도 뜬다"고 재차 보고했다. 원인 분석 결과 2가지: (1) `requiredArtifactNames` 마커 자체는 정확해도, `getEligibleComparison()`이 "지금 막 끝낸 MUD의 시대"를 전혀 받지 않아 누적 도감에 그 마커가 있으면 몇 달 뒤 전혀 다른 시대 MUD를 끝낼 때마다 계속 튀어나왔다. (2) `cmp_metal_tech_1`(비파형동검 페어)이 자기 유물(art_4)이 아니라 `cmp_crown_1`의 마커(백제 칠지도·신라 북한산 순수비)를 복붙해 갖고 있어, 고조선 MUD를 한 번도 안 한 학생에게도 뜰 수 있었다. **수정**: `js/artifactComparison.js`에 `getEraGroup(rawEra)`(선사~근현대 5개 묶음)와 `eraGroup` 필터를 추가해 `getEligibleComparison(currentEraGroup)`이 시대 불일치 페어를 아예 후보에서 제외하도록 했다. `js/mudEngine.js`의 `renderFinalReflection()`은 방금 끝낸 MUD의 실제 보상 유물 era를 `artifacts.json`에서 찾아 `currentEraGroup`을 계산해 넘긴다. `cmp_metal_tech_1`의 마커를 `["비파형 동검", "art_4"]`로 정정했다. `cmp_crown_2`(무령왕 관식↔신라 금관, 실물 보상이 따로 없는 페어)는 사용자 확인에 따라 삼국시대 보상 여러 개 중 하나(OR)로 유지하되 `eraGroup: "three_kingdoms"`로 시대 보호막을 추가했다. 5개 사고실험 시나리오(스크린샷 재현/정상 삼국시대 트리거/crown_1→crown_2 순차 노출/metal_tech_1 정상 트리거/era 미확인 시 안전 미노출)를 로컬 서버+브라우저 콘솔로 전부 검증. `01_validate_game_data.py` 통과. 캐시버스터 `?v=20260910-eragroup1`.
- **2026-09-10 콘텐츠 정정 — "8조법 목판"**: 사용자가 Deep-dive 보상 `art_deep_1`("단군왕검의 비파형 동검과 8조법 목판")의 표기를 문제 삼았다. 8조법은 후대 중국 역사서 『한서』에 3개 조항만 전해지는 기록이고, 고조선 당시의 목판 실물이 발굴된 적은 없다 — "목판"이라는 구체적 실물 형태를 단정한 것이 오해 소지가 있었다. `data/artifacts.json`의 name/desc와 `data/mud/deep_prehistoric.json`의 보상 표시명을 "…전해오는 8조법"으로 정정하고, desc에 실물이 남아있지 않다는 사실을 명시했다. (참고: name·desc 간 다른 유물을 가리키는 불일치가 있을까 우려했으나 재확인 결과 없었음.)
- **2026-09-10 신규 — 유물↔유적(발견 장소) 연결**: "유물만큼 유적도 많고 웹에 좋은 사진 자료가 많다"는 요청으로, 이미지 직접 삽입 대신 국가유산포털(heritage.go.kr) 공식 사적 페이지로 링크하는 안전한 방식을 사용자가 선택(기존 "실물 보기" 링크 패턴과 동일 철학). 6개 유적을 국가유산포털에서 직접 열어 사진·설명 일치를 확인(2026-09-10): 서울 암사동 유적(ccbaCpno=1331102670000), 부여 송국리 유적(1333402490000, 민무늬토기·비파형동검 공유), 연천 전곡리 유적(1333102680000), 경주 대릉원 일원(1333705120000, 금관총 포함), 고령 지산동 고분군(1333700790000), 공주 무령왕릉과 왕릉원(1333400130000). `data/artifactComparisons.json`의 각 유물 객체에 `site: {name, url, note}` 필드를 추가했고, 출토지를 모르는 전세품 유물(청자·백자·풍속화·앙부일구·자격루)에는 일부러 넣지 않았다(없는 정보를 지어내지 않음). `js/artifactComparison.js`에 `siteLinksHtml(cmp)`를 추가해 결과 화면(4단계)의 "실물 보기" 링크 아래 "🏛️ 이 유물이 발견된 유적" 박스로 노출, 두 유물이 같은 유적을 공유하면 중복 없이 한 번만 표시한다. 브라우저 콘솔에서 링크 텍스트·href 정확성과, site 필드가 없는 페어(풍속화)는 빈 문자열을 반환해 정보를 지어내지 않는지 확인. 캐시버스터 `?v=20260910-sitelinks1`. 상세는 `TEACHING_artifact_comparison.md`의 "2026-09-10 추가" 절 참고.
- **2026-09-10 트랙 2 「대조실」 — 유적을 비교 대상으로 승격 + 도감 진입점**: Opus 5 기획 세션이 작성한 지시서(`docs/handoff/claude_track2_artifact_site_instruction.md`)를 받아 격리 워크트리(`.worktrees/claude-artifact-site`, 브랜치 `feat/artifact-site-comparison`)에서 진행했다. 4단계로 완료:
  - **P0 출처 규칙**: `docs/plans/artifact_site_source_policy.md` 신규 작성 — 유물은 museum.go.kr(소장품번호+relicId+공공누리 유형), 유적은 heritage.go.kr(ccbaCpno+지정종별+확인일자) 기준으로 갈라서 정리하고, "확인 못 한 항목은 추측하지 않는다"는 규칙과 재사용 가능한 확인된 유적 7곳 표를 남겼다.
  - **P1 도감 진입점**: `EXPERIMENTS.md` `EXP-002`에 남아있던 학생 요청("도감에서 바로 연결될 수 있냐")을 구현했다. `js/artifactComparison.js`에 `getAllEligibleComparisons()`(시대 필터 없이 아직 안 본 것 전부 나열 — MUD 직후 제안과 달리 "방금 끝낸 MUD의 시대"라는 맥락이 없으므로)와 `encyclopediaEntryHtml()`·`startFromEncyclopedia()`를 추가하고, `js/encyclopedia.js`의 `renderEncyclopedia()`에 "🏛️ 대조실 — 지금 바로 비교해 보기" 섹션을 삽입했다. 두 진입 경로(MUD 직후/도감)는 `seenArtifactComparisons` 상태를 그대로 공유한다.
  - **P2 스키마 확장**: 각 비교에 `pairType`(`artifact_vs_artifact`/`artifact_vs_site`/`site_vs_site`, 기존 9개는 필드 자체를 안 넣어 무변경) 필드를 추가하고, 유적을 비교 대상 자체로 쓸 때는 그 쪽 객체에 `kind: "site"` + 유적용 `traits`(규모·배치·주변환경·함께나온것, 유물의 무늬·재질·모양 축과 다름)를 준다. 결과 화면의 "출처" 문구가 유물/유적에 따라 다른 라벨("국립중앙박물관 소장품 · 실물 보기" vs "국가유산청 국가유산포털 · 유적 보기")을 쓰도록 `sourceEntryMeta()`/`sourceLineHtml()`로 일반화했다. 기존 `siteLinksHtml()`(결과 화면 하단 링크)은 그대로 유지.
  - **P3 신규 페어 2개**(트랙 2 지시서의 "최대 4개" 제한 내에서, 1차 추천 2개만 구현): `cmp_artifact_site_1`("토기 하나, 마을 전체" — 빗살무늬 토기 ↔ 서울 암사동 유적, "유물을 맥락으로 되돌리기"), `cmp_site_vs_site_1`("움집 마을과 거대한 무덤" — 서울 암사동 유적 vs 고창 죽림리 지석묘군, "노동력·계급의 등장"). 둘 다 기존 9개와 다른 새 해석 유형이고, `requiredArtifactNames`·`eraGroup`을 시대 순서에 맞게 설정했다(같은 실수 반복 방지 — 2026-09-08/09/10 세 차례 있었던 시대 매칭 버그 참고).
  - 검증: 브라우저 콘솔+실제 클릭으로 (1) 기존 시대 필터 회귀 없음(근현대 MUD 뒤 삼국 왕관 페어 여전히 null), (2) 두 신규 페어 단독 트리거·전체 4단계 플레이·두 톤 분기(근접/차이) 재현, (3) 도감 진입점에서 실제 버튼 클릭으로 모달 닫힘→시뮬레이터 뷰 전환→활동 시작까지 전체 흐름, (4) 기존 9개 페어의 출처 라인이 그대로인지(신규 `kind` 필드 부재 시 문구 안 바뀜) 확인. `node --check`(두 JS 파일), `python scripts/01_validate_game_data.py`·`06_validate_static_assets.py`, `git diff --check` 전부 통과, 콘솔 에러 0건. 캐시버스터 `?v=20260910-artifactsite1`(encyclopedia.js·artifactComparison.js).
  - **2026-09-11 §5 완료 판정 재확인(4트랙 조정 요청)**: 코드 검증만으로는 완료 보고하지 않는다는 지시에 따라, `preview_start` 이름 `artifact-site`(포트 8802, 자기 worktree)로 다시 로컬 서버를 띄워 전부 **실제 클릭**으로 재현했다 — (1) `cmp_artifact_site_1`을 관찰 옵션 클릭→유효 근거 카드 4개 클릭→빈칸 드롭다운 정답 선택까지 진행해 "👏 학계 관점과 가까운 생각이야"(근접 톤) 재현, "실물 보기 A"(museum.go.kr)·"유적 보기 B"(heritage.go.kr) 링크 href 확인. (2) `cmp_site_vs_site_1`은 **"나의 도감" 버튼을 실제로 클릭**해 모달을 열고 "🏛️ 대조실" 섹션의 "시작하기" 버튼을 클릭해 진입(이미 완료한 `cmp_artifact_site_1`은 목록에서 정상적으로 빠져 있었음) → 근거 카드 유효1+무효1 클릭, 빈칸 오답 선택으로 "💡 학자들은 이렇게 봐"(차이 톤) 재현, 두 유적 링크 모두 "유적 보기 A/B"로 정확히 렌더링. (3) `getEligibleComparison()`을 5개 시대군(선사~근현대)마다 호출해 각자 자기 시대 페어만 반환함을 확인, 2026-09-08 재발 시나리오(삼국시대 유물만 있을 때 청자 페어가 새는지)도 별도로 `noCeramicsLeak: true`로 재확인. (4) 기존 9개 페어를 각자의 실제 마커 하나씩만으로 개별 테스트해 전부 자기 자신만 반환(교차 오염 없음). `read_console_messages`로 전체 로그 0건 확인(에러·경고 모두 없음). 이 재확인 시점 기준 브랜치는 `feat/artifact-site-comparison`(다른 트랙의 조정 커밋 위로 재정렬된 뒤에도 `git diff origin/main --stat` 범위가 자기 8개 파일 그대로임을 매번 재확인함).

## P1-COLLAB-PRIVACY — Convex 개인정보·국외 처리 착수 게이트

- 작업 claim: `TASK-20260908-01 | 개인정보 처리 기록·QR 입장 보안·Preview 연결 | integration agent | 상태: DONE`
- 상태: `in-progress-preview-verified` — 교육자료 분류·공급자 공개 문서 재검토와 실제 Convex/Auth0/Vercel 가상 데이터 수직 통합 시험은 완료. 학교 개인정보 처리 근거·국외 처리 허용과 공급자 비공개 보존기간·계약 조건 확인은 대기.
- 우선순위: **P1로 상향**. 기존 `P2-COLLAB-05`를 승격한 항목이며, 실시간 협동 MUD의 학생 적용과 운영 배포를 차단한다. 현재 정적 협동 MUD 수업 검증과 가상 데이터 개발은 별도 진행할 수 있다.
- 근거: 이 프로젝트는 사용자 확인에 따라 **교사 제작 교육용 저작물**로 분류하므로 학습지원 소프트웨어 선정·학교운영위원회 심의 게이트는 적용하지 않는다. 다만 이름을 받지 않아도 모둠·역할·호·제출시각이 교사의 모둠표와 결합되면 개인정보가 될 수 있다. Convex Cloud는 미국 동부·아일랜드 리전만 제공하므로 국외 처리 검토가 필요하고, Convex DPA상 하위처리자·백업 사본의 잔존 범위도 확인해야 한다.
- 감사 문서: [`convex_elementary_school_privacy_audit.md`](./docs/audits/convex_elementary_school_privacy_audit.md)
- 해제 조건:
  1. 학교 개인정보 담당자에게 개인정보처리자, 적법 근거, 법정대리인 동의 필요 여부를 확인한다.
  2. Convex·Vercel의 처리위탁, 국외 처리 근거·고지, 리전, 하위처리자, 로그·백업 보유기간을 문서화한다.
  3. 최소수집·권리행사·수업 종료 삭제·접근통제·사고대응 테스트를 통과한다.
- 미통과 시: 실제 학생 접속을 금지한다. 국외 처리 또는 외국산 SaaS가 불가하면 [D-019](./DECISIONS.md)을 다시 열어 국내 리전/기관 승인 서비스 또는 로컬 방식을 검토한다.
- 2026-09-07 이어받기 감사 당시 교사 QR은 수동 입력과 같은 6자리 `code`를 URL에 넣었고 반복 시도 제한도 없었다. 이 결함은 2026-09-09 QR·수동 코드 보안 구현과 Preview 검증으로 해결했다.
- 2026-09-08 사용자 확정: 이 프로젝트는 학교 교육과정 운영 지원을 목적으로 외부에서 개발·보급된 소프트웨어가 아니므로 학습지원 소프트웨어 선정·학교운영위원회 심의는 적용하지 않는다([D-022](./DECISIONS.md)). 이 판단은 개인정보 처리위탁·국외 처리 확인을 면제하지 않는다.
- 2026-09-08 공급자 재검토: Convex·Vercel의 공개 DPA, 리전, 하위처리자 관리, 로그 보존 범위를 [감사 문서](./docs/audits/convex_elementary_school_privacy_audit.md)에 기록했다. Vercel DPA는 공개 문구상 Pro·Enterprise 대상이고, Hobby 런타임 로그는 1시간이지만 빌드 로그는 배포별 무기한 보관된다. Convex의 공급자 로그·백업 삭제기간과 무료/Starter 계약 적용 범위는 공개 문서만으로 수치 확정이 되지 않아 실제 학생 적용 차단 항목으로 유지한다.
- QR·수동 코드 보안 계획: [`implementation_plan_cooperative_join_security.md`](./docs/plans/implementation_plan_cooperative_join_security.md) — 상태 `completed`. QR 토큰은 URL fragment로 전달하고 서버에는 SHA-256 해시만 저장하며, 수동 코드는 요청 본문·HMAC 시도 버킷·만료를 적용했다. Convex 개발 배포에서 동일 가상 브라우저 5회 실패 후 10분 차단과 원문 비저장을 확인했고, Vercel Preview의 요청 경로·Build/Runtime 로그에도 QR 원문·코드·호·역할이 남지 않음을 확인했다.
- 2026-09-08 기술 통합 검증: Auth0 Google 전용 SPA와 Convex 미국 동부 개발 배포를 연결하고, Vercel `history-game` 프로젝트를 `apps/cooperative-live` 루트로 배포했다. 가상 학생 8명 입장→4인 모둠 2개 편성→종료 흐름을 확인했고, 정리 후 Convex의 `sessions`·`players`·`rooms`·`interventions` 테이블이 모두 비어 있음을 확인했다. Vercel 고정 주소는 기술 Preview 용도이며 실제 학생 접속 허가를 뜻하지 않는다.

## P1-COLLAB-VERTICAL — Vercel·Convex 첫 수직 슬라이스

- 상태: `implemented-preview` — `TASK-20260907-02 | apps/cooperative-live | implementation agent | 상태: DONE`. 로컬 구현과 Convex/Auth0/Vercel 가상 데이터 수직 통합을 완료했다. 교사 세션 복구, 같은 탭의 중복 입장 방지, 3~24명 균형 편성, 입장 정원 제한, 수업 코드 충돌 처리, QR·수동 코드 입장 보안을 포함한다. `TASK-20260909-03`에서 가상 학생 21명의 병렬 QR 입장→5개 모둠 편성→개입→종료 삭제까지 Convex 함수 회귀 테스트를 추가했다. 실제 학생 운영은 P1 개인정보 게이트 해제 뒤 진행한다.
- 계획서: [`implementation_plan_vercel_convex_vertical_slice.md`](./docs/plans/implementation_plan_vercel_convex_vertical_slice.md)
- 앱 위치: 같은 저장소 `apps/cooperative-live/`, 기존 정적 앱과 GitHub Pages는 유지.
- 첫 범위: 고조선 8조법, 교사 1명과 가상 학생 8명, 새 무작위 호·4인 모둠 2개 무작위 편성·진행 대시보드·힌트/심화·종료 삭제까지.
- 인증: 교사는 Auth0 Google 로그인 후 Convex 서버의 `sub` 허용목록으로 제한한다. 학생은 계정 없이 세션 한정 난수 토큰을 사용한다.
- 착수 조건: 사용자 계획 승인 완료. 운영 리전·Production·실제 학생 접속은 `P1-COLLAB-PRIVACY` 해제 뒤 진행한다.

## 2026-09-06 실시간 협동 MUD 검토 — P2-COLLAB-01

- 상태: `implemented-preview` — 첫 수직 슬라이스, Convex/Auth0 개발 연결, Vercel 기술 Preview, QR·수동 코드 보안, 가상 학생 21명 함수 회귀 테스트를 완료했다. 학교 네트워크·물리 기기·실제 학생 검증은 개인정보 게이트 뒤 진행한다. 백엔드는 Convex로 확정([D-019](./DECISIONS.md)).
- 문제·목적: 기존 고조선 협동 v0.1은 기기별 정적 활동이며, 최초 판단 전에 공유하고 모둠 수는 5개로 고정한다. 21명 학급의 40분 수업 중 **10분 이내**에 운영할 활동별 무작위 편성 및 가변 학급용 실시간 협동 구조를 별도로 설계한다.
- **실측 근거 (2026-09-04 수업, [`EXP-006`](./EXPERIMENTS.md))**: 비대칭 정보로 대면 대화가 실제로 발생했고 모둠 결과도 갈렸다. 그러나 교사가 꼽은 최대 제약은 **"모둠 진행 상황을 볼 수 없음"** 이었고, 빠른 모둠에 추가 상황을·느린 모둠에 힌트를 주는 개입이 불가능했다. 이 항목이 실시간 앱의 1순위 요구사항이다.
- 교육·사용자 영향: 개인 최초 판단의 독립성, 3/4/5인 모두의 정보·발언 기회, 교사의 수업 진행·접속 복구를 확보한다.
- 예상 범위: 신규 독립 Next.js/Convex 앱과 Vercel 배포 경계, 기존 허브의 후속 연결 링크. 기존 개인 MUD와 정적 협동 버전은 유지한다.
- 관련 파일: `cooperative-mud/gojoseon-law/{app,scenario}.js`, `cooperative-mud/index.html`, `PRD.md`, `TECH_STACK.md`, `ARCHITECTURE.md`, `ROADMAP.md`.
- 원문·인터뷰: [INBOX](./INBOX.md)의 2026-09-06 항목. 설계: [전체 계획](./docs/plans/COLLABORATIVE_MUD_PLAN.md), [아키텍처](./docs/plans/COLLABORATIVE_MUD_ARCHITECTURE.md), [MVP](./docs/plans/COLLABORATIVE_MUD_MVP.md).
- 다음 판단: 첫 수직 슬라이스의 현재 실행 기준은 [`implementation_plan_vercel_convex_vertical_slice.md`](./docs/plans/implementation_plan_vercel_convex_vertical_slice.md)다. 전체 10분 학습 루프가 아니라 입장·편성·진행판·개입·삭제를 가상 학생 8명으로 먼저 관통한다. Supabase 계획은 [D-020](./DECISIONS.md)으로 보류했으므로 두 백엔드를 혼합하지 않는다.
- 2026-09-06 입장·표시 이름 결정: 학생 입장은 **QR 우선**(일회 코드 배부 폐지)이고 학생 인증 주체를 만들지 않는다 → Convex Auth beta가 임계 경로에서 빠짐. 표시 이름은 **학생이 대기 중 고르는 호(號)** 이며 시대 무관 공용 24개를 재사용한다. 미선택자는 교사 시작 시 서버가 무작위 배정한다. 설계는 [아키텍처](./docs/plans/COLLABORATIVE_MUD_ARCHITECTURE.md) §2-1·§2-2. 학교 Wi-Fi는 기존 활동에서 문제 없었음이 확인됐으나 21대 동시 접속·실시간 구독은 미실측이다.
- 10분 활동 예산: 호 선택은 QR 입장 대기 시간에 흡수되므로 별도 시간을 배정하지 않는다. 전체 학습 루프를 후속 슬라이스로 확장할 때 법 만들기 단계의 시간 제한과 `합의 미완` 정상 종료를 결정한다.
- 후속 관찰 후보: 기존 v0.1의 공유→최초 판단 순서는 이번 의도와 다르다. 기존 정적 앱 수정은 별도 범위이며 이번에는 신규 흐름의 수용 기준으로 기록한다.
- 2026-09-06 후속 검토: Vercel로 두 앱의 화면 호스팅을 통일하는 것은 가능하다. 새 맥락에서는 같은 저장소·두 Vercel 프로젝트를 우선 검토하며, 별도 저장소는 필수가 아니다. 계획 §10~11 참조. 실제 이전 승인·설정 변경은 아직 없음.
- 후속 UX 후보: 학생 첫 화면에서 오늘의 복습과 모둠 수업 진입을 구별하고 교사는 전체 차시를 탐색하도록 한다. 실제 포털의 긴 단원 탭·MUD/허브/파일럿 용어를 검토한다. `index.html`, `js/app.js`, `css/style.css`의 최소 변경으로 별도 계획화한다.

### 관련 후속 항목

- **P2-COLLAB-02 — v0.1 화면 순서 수정 (미착수)**: `cooperative-mud/gojoseon-law/app.js`의 공유 확인 게이트가 최초 판단보다 앞서, 기록된 "최초 판단"이 이미 공유 후 값이다. `역할 확인 → 최초 판단 → 공유 → 추가 증거`로 바꾸면 판단 변경 가설을 서버 없이 측정할 수 있다. 실시간 앱과 독립적으로 진행 가능하며 작업량이 작다.
- **P2-COLLAB-03 — 협동 시나리오 확장 (진행 중, 3편 제작 완료 · 수업 검증 대기)**: 고조선 형식이 통했으므로 다른 시대로 넓힌다. 소재는 진도 순서를 기준으로 고른다.
  - 1단원 6차시 `cooperative-mud/gojoseon-law/` 고조선 8조법 — 제작·**수업 운영 완료**([`EXP-006`](./EXPERIMENTS.md))
  - 1단원 7차시 `cooperative-mud/founding-myths/` 삼국·가야 시조 설화 — 제작·**수업 운영 완료**([`EXP-007`](./EXPERIMENTS.md), 2026-09-08)
  - 1단원 8차시 `cooperative-mud/han-river/` 한강 유역 쟁탈 — 제작 완료, 수업 미운영
  - 다음 후보는 [`scenario_candidates_artifact_comparison_and_cooperative_mud.md`](./docs/plans/scenario_candidates_artifact_comparison_and_cooperative_mud.md)에서 진도에 맞춰 고른다. 폭력·아동 희생 요소가 있는 후보(살수대첩·계백과 관창)는 착수 전 별도 확인이 필요하다.
  - 세 편의 성격이 겹치지 않도록 관리한다: 고조선=이해관계로 판단, 시조 설화=예외를 만나 일반화 교정, 한강=여러 근거를 견주어 설명.
- **P2-COLLAB-07 — 타이머 예산 실측 (미착수)**: 화면별 목표 시간은 설계 추정치다. 첫 수업에서 힌트·심화 배지가 얼마나 뜨는지 관찰해 `scenario.pacing.budgets`를 조정한다. 감도는 `pacing.tuning`으로 시나리오별로 덮어쓸 수 있다.
- **P2-COLLAB-04 — 역사 비교 화면의 "정답 맞췄다" 대응 (미착수)**: 범금 8조의 절도 조항(노비·50만전)과 학생의 가혹한 처벌안이 겹칠 때 "우리가 맞췄다"로 끝나지 않도록, 누구에게 유리·불리한지 되묻는 문구를 비교 화면의 수용 기준으로 명시한다.
- **P2-COLLAB-05 — P1-COLLAB-PRIVACY로 승격**: 2026-09-07 법령·Convex 공식 문서 감사를 거쳐 문서 최상단의 **P1 착수 게이트**로 올렸다. 상세 근거와 학교 질문은 [감사 문서](./docs/audits/convex_elementary_school_privacy_audit.md)를 따른다.
  - 질문 1: 학생 이름·학번·계정을 수집하지 않고 수업 중에만 모둠 번호와 제출 여부만 서버에 두었다가 수업 종료 시 즉시 삭제하는 경우에도 사전 신고나 보호자 동의가 필요한가?
  - 질문 2: 외부 웹서비스를 수업에 활용할 때 따라야 할 학교·교육청 지침이 있는가?
  - 질문 3: 서버가 국외(Convex 미국 동부 또는 아일랜드)에 있는 서비스 사용에 제한이 있는가? → "불가" 답이면 국내 리전 또는 기관 승인 백엔드로 전환한다.
- **P2-COLLAB-06 — 네트워크·QR 실측 (Vercel 첫 배포 직후)**: 개인정보 게이트 해제 뒤 Preview를 배포해 교실 아이패드에서 여는 것까지 확인한다. `vercel.app` 도메인과 WebSocket이 학교 MDM·방화벽에서 열리는지, 앞 화면 QR을 뒷자리에서 읽을 수 있는지, 아이패드에서 탭을 닫았다 돌아올 때 복구되는지 실제 학생 적용 전에 검사한다. (2026-09-08 기준 로컬 구현만 완료)
- **미확보 입력**: 사용자가 Claude와 별도로 만들던 "다른 활동 아이디어" 문서를 찾지 못했다. 이 저장소, 발행 아티팩트 3건, 다른 Claude Code 세션 어디에도 없다. claude.ai 웹 대화로 추정되며 원문을 받으면 INBOX로 분류한다.

## 2026-09-01 기획 기준선 (기존 기록)

학생 실제 수업 결과를 반영해 우선순위를 다음처럼 재정렬한다.

```text
NOW / EARLY: 콘텐츠 정합성·선택지 편향 QA → Vercel 배포 검토 → Supabase 최소 로그 설계
NEXT: 해금 유물 2개 기반 역사적 추론 최소 실험
LATER: 선택 탐험·유물 탐구 → 익명 활동 결과·학급 집계 → 친구 비교·협력 → Anonymous Auth
FUTURE / NOT NOW: Realtime·학급 공동 이벤트·역사 타이쿤 장기 상태·공개 순위표
```

- 2026-09-01 수업에서 1단원 2·3차시 연속 활동이 4분 이내에 완료되었다. 원인은 선택지 난이도, 시뮬레이터 완료 조건, 읽기 속도, 교실 내 정보 공유를 분리해 확인해야 한다.
- 학생 의견은 즉시 구현 요구가 아니라 관찰 → 가설 → 작은 실험 → 재관찰로 처리한다.
- 상세 아이디어는 보관 문서 [`student_feedback_idea_note.md`](./docs/archive/student_feedback_idea_note.md)와 자문 보조 문서 [`student_ideas_strategy_consult_brief.md`](./docs/archive/student_ideas_strategy_consult_brief.md)를 참고하되, 실행 기준은 이 BACKLOG와 구현 계획서로 삼는다.

## 2026-09-02 Track A 런타임 안정화 묶음

TASK-20260902-03 | MUD·인터랙티브 활동 런타임 안정화 | 담당: Codex | 상태: DONE

학생 적용 전후의 진행 불가·잘못된 화면·완료 상태 불일치 문제를 먼저 봉쇄한다. 새 게임성이나 Deep-dive 콘텐츠 확장은 이 묶음에 포함하지 않는다.

- 오답 재시도 단계에 `simulator`가 없을 때 이전 단계의 시뮬레이터·안내·상태가 남을 수 있는 문제
- `gwangbok-flag`·`gwangbok-vote` 캔버스 직접 조작이 시각 상태만 바꾸고 `simulatorProgress`를 갱신하지 않아 선택지가 계속 잠길 수 있는 문제
- 스테이지별 고유 simulator action 상태가 명시적으로 초기화되지 않는 문제
- 후속 분리: 현재 코드와 감사 문서의 수치·시뮬레이터 목록 불일치는 별도 감사 문서 동기화 작업으로 남긴다.

계획서: [`implementation_plan_track_a_runtime_stabilization.md`](./docs/plans/implementation_plan_track_a_runtime_stabilization.md)

완료 조건: 정상·오답·재시도·엔딩 흐름의 상태 정리, 캔버스·대체 버튼 완료 상태 일치, 런타임 회귀 테스트 추가, 전체 정적 품질 게이트 통과, `walkthrough.md` 기록.

## 2026-09-02 Track B Deep-dive 고도화 + Regular 게이팅 감사

TASK-20260902-02~06 | Deep-dive 4종 파일럿 + Regular MUD 게이팅 감사 | 담당: Claude | 상태: DONE(Deep-dive) / 지시서 전달(Regular)

Deep-dive MUD 4종(`deep_prehistoric`/`deep_joseon`/`deep_modern`/`deep_three_kingdoms`) 전체에 다음을 적용했다.

- 판단 스테이지가 자료 확인 없이 화면을 몇 번 터치하면 통과되던 게이팅 없음 버그를 수정하고, 전부 `hotspot-discovery` 이상으로 전환했다.
- `ordered-hotspot` 전환과 함정 단서(다른 시대·주제의 진짜 역사적 사실 1개씩)를 추가해 "아무 단서나 눌러도 통과"를 막았다. 함정 판별 로직은 `js/mudSimulators.js`(`processOrderedHotspot`)에 구현했다.
- `deep_joseon`·`deep_modern`에 전용 배경 삽화 4곳을 새로 그렸고, 나머지는 기존 scene 팔레트를 재사용했다.
- `deep_modern:3`(6·25 전쟁) 스테이지의 레거시 전투 그래픽(`battle-gauge`, "⚔️ 호국 결전")을 제거했다. 서술문은 이미 자료 기반 성찰을 안내하는데 시뮬레이터가 전투 게임화 그래픽을 보여주던 모순이었다.
- 같은 레거시 그래픽 버그를 Regular MUD 9종에 전수 점검해, IF 재시도 스테이지 5곳(`regular_goryeo_founding`·`regular_three_kingdoms`·`regular_three_kingdoms_life`)에서 추가로 발견·수정했다.

결과 보고서: [`claude_track_b_deep_dive_result.md`](./docs/handoff/claude_track_b_deep_dive_result.md)(`deep_joseon`), [`claude_track_b_deep_modern_result.md`](./docs/handoff/claude_track_b_deep_modern_result.md)

이 감사 기준을 Regular MUD 28종에도 대조한 결과, 판단 스테이지 101개 중 41개(약 40%)는 게이팅이 전혀 없고 56개는 순서 없는 `hotspot-discovery`뿐임을 확인했다 — Deep-dive와 같은 문제가 훨씬 넓게 퍼져 있다. 사용자 방향에 따라 Regular는 짧은 활동 시간 설계를 유지하면서 오류만 고치고 인터랙티브 활동 시간을 소폭 늘리는 것으로 범위를 한정해, Codex에게 실행 지시서를 전달했다.

지시서: [`codex_regular_mud_activity_gating_instruction.md`](./docs/handoff/codex_regular_mud_activity_gating_instruction.md) — 상태: `ready-for-codex`. 우선순위 1(게이팅 전무 14개 파일)·우선순위 2(순서 없음 12개 파일) 목록, 원칙, 검증 명령, 완료 조건 포함.

## 학생 현장 체험 피드백 (2026-09-01)

학생들이 직접 체험한 뒤 다음과 같은 반응을 남겼다.

상세 아이디어 정리: [`student_feedback_idea_note.md`](./docs/archive/student_feedback_idea_note.md)

- 긍정: 재미있다는 반응이 있었고, 활동 자체의 흥미도는 확인됨.
- 난이도·정답 추론: 긴 문장을 고르면 정답처럼 보이며, 전반적으로 너무 쉽다는 의견이 있음. 선택지 길이와 정답 위치·표현의 단서를 점검하고, 자료를 읽고 판단해야 풀 수 있도록 난이도 개선을 검토한다.
- 유물 활용: 획득한 유물로 추가 행동을 하거나 성장할 수 있는 기능 아이디어가 필요함.
- 경쟁 요소: 유물 컬렉션을 활용해 친구들과 경쟁할 수 있는 모드 아이디어가 제안됨. 경쟁의 교육적 안전성, 협력 대안, 개인정보·점수 공개 범위를 함께 설계한다.
- 역사 타이쿤: 역사 시대·마을·국가를 운영하는 ‘역사 타이쿤’ 확장 활동 아이디어가 제안됨. 기존 Regular MUD와의 범위·학습 목표 중복을 먼저 검토한다.
- 오타·문맥 제보: 1단원 3차시 `regular_neolithic`에서 ‘신석기’ 관련 오류가 제보되었다. ‘신석기’ 표기 자체는 정상이었고, 2단계 토기·3단계 의생활 흐름에 맞지 않던 네 개의 설명 문구를 정렬해 해결했다.

### 후속 검토 항목

1. **P1 — 선택지 문장 품질 보정**: 감사·1차 보정 완료. **2026-09-07 Regular MUD 24개 스테이지의 10자 이상 편향을 전량 해소**했고, 2026-09-09 Deep-dive 잔여 3건도 `deep_joseon:1`(Claude)과 `deep_three_kingdoms:1/5`(Codex)에서 단서 인용형으로 수정했다. 모든 오답보다 긴 106개 단계는 10자 미만의 자연스러운 편차로 보고 이번 범위에서 제외. 상세 결과는 [`choice_bias_audit.md`](./docs/audits/choice_bias_audit.md) §2·§6 참조.
2. **P1 — 유물 활용 시스템 기획**: 유물 조합·전시·복원·교환 등 학습과 연결되는 사용처를 설계한다.
3. **P2 — 유물 기반 친구 경쟁/협력 모드 기획**: 실시간 네트워크 없이 가능한 비교·협력 방식부터 검토한다.
4. **P2 — 역사 타이쿤 확장 활동 기획**: 대상 시대, 핵심 자원, 역사적 제약, 예상 활동 시간을 정의한다.
6. **P1 — 최소 플레이 진단 로그 설계**: 서버·계정 없이 `mudId`, `stageId`, 단계·시뮬레이터·선택·완료 시각, 정답 여부, 재시도 횟수만 기록하는 방안을 설계한다. 개인정보·장기 추적은 금지한다.
7. **P2 — 유물 2개 기반 역사적 추론 프로토타입**: 해금 유물 2개를 관찰·비교·주장·근거로 연결하는 3~5분 활동을 설계하고, 기존 도감·미니게임 재사용 범위를 확인한다. **2026-09-08 최소 프로토타입 구현 완료** — 상세는 아래 "2026-09-08 유물 2개 비교·추론 프로토타입" 항목 참조.
8. **P2 — 콘텐츠 정합성 lint 설계**: 구조 오류는 Node/Python 검사로, narrative·choices·evidence·simulator·reward의 의미 정합성은 AI·사람 검토로 분리한다.
9. **P2 — 에이전트 작업 claim 규칙**: TASK ID·담당 역할·상태(DOING/DONE)를 작업 시작 전에 기록하고, 같은 파일 동시 수정과 중복 구현을 방지한다.
10. **P1 — Vercel 배포 경로 검토**: 현재 GitHub Pages를 유지한 채 정적 구조가 Vercel에서 동일하게 작동하는지 확인하고, 실제 이전 여부는 별도 결정한다.
11. **P1 — Supabase `play_events` 설계**: 익명 세션 UUID와 최소 이벤트 필드, RLS 정책, 보관 기간을 설계한다. 프로젝트·테이블·코드 구현은 설계 승인 후 진행한다.

## P2-DEEP-CROSSUNIT — 교차 단원 Deep-dive 등록 계약 구현

- 상태: `documented` — [D-025](./DECISIONS.md)에서 방향만 채택했다. 첫 교차 단원 Deep-dive 후보가 사용자 승인되기 전에는 구현하지 않는다.
- 목적: `unitId: null`과 단원별 `{ unitId, lessonNumbers }` 묶음인 `spansUnits`로 교육과정 범위를 정확히 표현하고, Regular 기본 차시 버튼과 분리된 확장 탐구 영역에 노출한다.
- 예상 변경 범위: `data/mud/_index.json`, 대상 MUD JSON, `scripts/04_validate_mud_contract.py`, `scripts/08_validate_mud_catalog.py`, `js/app.js`, 관련 문서·테스트.
12. **P2 — 선택 탐험 단서 실험**: 기존 MUD 한 편에 선택 탐험 1개를 추가하는 최소 설계를 만들고, 추가 단서 발견과 근거 공유가 실제로 발생하는지 관찰한다.
13. **P2 — 선사 시대 협동 MUD 정적 제작** *(상태: 콘텐츠 원본 확보, 제작 전)*: 종이 리허설 단계는 2026-09-06에 폐기했다(기기 화면이 곧 역할 카드). 막 1 구석기부터 정적 협동 MUD로 만든다. 한산도는 해당 차시 학습 시점의 후속 후보로 유지한다. 계획: [`implementation_plan_cooperative_prehistory_pilot.md`](./docs/plans/implementation_plan_cooperative_prehistory_pilot.md), 콘텐츠 원본: [`cooperative_prehistory_content_draft.md`](./docs/plans/cooperative_prehistory_content_draft.md)
## 구현 우선순위

현재 구현 순서는 학습 흐름의 안정성, 모바일 사용성, 교육 콘텐츠 품질 순으로 정한다. 아래 순서는 문서 검토 후 정한 다음 구현 후보이며, 실제 코딩은 별도 구현 계획과 사용자 확인 후 시작한다.

1. **P1-01 설계·실제 화면 정합성 대표 MUD 검증** — `regular_paleolithic`을 기준으로 포털→MUD→시뮬레이터→선택지→엔딩 흐름과 세로형 태블릿 레이아웃을 대조한다. *(완료: 820×1180 Chrome 점검 통과)*
2. **P1-02 Regular 활동 시간·무작위 탭 내성** — 실제 학생 활동 시간과 잔여 구조 후보를 검토한다. *(2026-09-07 재감사: 판단 스테이지 반복 탭 후보 0건(엔딩 스테이지 7곳만 남음, 재설계 불필요로 판정 — [`implementation_plan_tap_resistance_batch.md`](./docs/plans/implementation_plan_tap_resistance_batch.md) 참조). 구조 감사로 할 수 있는 부분은 완료. 남은 것은 실제 학생 3명 이상 교실 실측뿐(2026-09-01 1단원 2·3차시 연속 활동 4분 이내 완료 관찰 이후 추가 실측 없음) — 사용자만 가능.)*
3. **P1-03 IF 스테이지 교육적 품질** — 6개 단계의 교육적 문장을 검토한다. *(문장 보강·Codex/Claude 검토·사용자 최종 승인 완료; 후속 품질 검토는 별도 backlog로 관리)*
4. **P2-01 접근성·상태 표현** — 실제 보조기기와 색상 독립 상태 표현을 확인한다. *(정적·Chrome 키보드 검증 완료, 실제 기기 확인 대기)*
5. **P2-03 MUD 등록 경로 단순화** — *(2026-09-07 완료: 보조 MUD 노출 구현·데스크톱/태블릿 브라우저 확인 완료. `regular_myeongnyang`·`regular_korean_war`가 포털에서 전혀 도달 불가능했던 것을 발견·해결. 남은 건 실제 물리 기기 확인뿐)*
6. **P3-01 브라우저·기기 회귀 점검** — 지원 기기와 브라우저별 정기 점검을 수행한다.

### 현재 선정된 첫 구현 계획

- 대상: `P1-01`, `regular_paleolithic` 대표 수직 슬라이스
- 계획서: [`implementation_plan_design_alignment_vertical_slice.md`](./docs/plans/implementation_plan_design_alignment_vertical_slice.md)
- 상태: `completed` — 정적·브라우저 대표 흐름 검증 완료
- 구현 시작 조건: 계획 범위와 검증 결과에 대한 사용자 확인

### P1-02 첫 구현 계획

- 대상: `regular_independence` 및 `regular_modern_open` 각 1~3단계의 비장면 `text-reading`·`battle-gauge`·`culture-touch` 활동
- 계획서: [`implementation_plan_tap_resistance_batch.md`](./docs/plans/implementation_plan_tap_resistance_batch.md)
- 상태: `structural-audit-complete` — 판단 스테이지 반복 탭 후보 0건 확인(2026-09-07). 실제 학생 시간 측정만 남음(사용자 전담).
- 원칙: 장면이 있는 단계와 기존 좌표는 이번 묶음에서 변경하지 않는다.

### P1-03 IF 스테이지 1차 구현 계획

- 대상: 설명이 짧고 자료·비교 단서가 부족한 IF 단계 6개
- 계획서: [`implementation_plan_if_stage_quality_batch.md`](./docs/plans/implementation_plan_if_stage_quality_batch.md)
- 상태: `completed` — 문장 보강·Codex/Claude 검토·사용자 최종 승인 완료

### P2-01 접근성·상태 표현 1차 계획

- 계획서: [`implementation_plan_accessibility_state.md`](./docs/plans/implementation_plan_accessibility_state.md)
- 상태: `in-progress` — 정적 반영 완료, 실제 보조기기 확인 대기

### P2-03 MUD 등록 경로 단순화 계획

- 계획서: [`implementation_plan_registration_single_source.md`](./docs/plans/implementation_plan_registration_single_source.md)
- 상태: `browser-verified` — 인덱스 단일 경로·primary/supplementary·보조 노출·데스크톱/태블릿 브라우저 확인 완료(2026-09-07). 실제 물리 기기 확인만 남음(사용자 전담).
- 감사 결과: `_index.json` 32종 등록, 커리큘럼 48차시 중 39차시 매칭. `app.js`의 레거시 Regular 조건문(~140줄)은 인덱스 로드 실패 시에만 도는 안전망으로 확인, 의도적으로 유지.
- 주의할 중복: 2단원 7차시(`regular_myeongnyang`/`regular_joseon_diplomacy`), 3단원 10~12차시(`regular_korean_war`/`regular_post_war`). 주 MUD는 각각 외교·전후 재건으로 적용하고, 보조 MUD는 2026-09-07부터 카드 하단 "+확장 활동" 버튼으로 노출한다.

## 다음 기획·검토 항목

### P1 — 설계 문서와 실제 화면의 정합성 점검

- `WIREFRAMES.md`의 `[자료 보기]`가 현재 화면에 없는 이유를 확인하고, 실제 기능을 추가하지 않고 와이어프레임에서 제거한다.
- 포털의 차시 카드·단원 탭·확장 활동 영역이 와이어프레임의 정보 구조와 일치하는지 태블릿 세로 화면에서 확인한다.
- MUD 플레이 화면의 단계 표시, 자료 본문, 시뮬레이터, 피드백, 선택지 순서가 실제 학생 흐름과 일치하는지 확인한다.
- 캔버스 조작이 어려운 시뮬레이터에 버튼 대체 조작이 제공되는지 모드별로 확인한다.
- `regular_paleolithic` 6단계 성찰 시뮬레이터를 `required: true`로 적용한 뒤, 성찰 단서 3개를 확인해야 엔딩으로 진행되는지 검증한다.
- `index.html`의 인라인 반응형 레이아웃과 `css/style.css`의 별도 미디어 쿼리 부재가 세로형 태블릿에서 문제를 일으키는지 확인한다.
- 확인 결과는 코드 수정 없이 이 항목에 기록하고, 구현이 필요한 경우 별도 구현 계획으로 분리한다.

### P2 — 접근성·상태 표현 설계 검토

- 퀴즈·도감 모달의 닫기, 키보드 포커스, `aria` 상태가 화면 설계 기준을 만족하는지 확인한다.
- 선택지와 시뮬레이터 진행 상태가 색상만으로 전달되지 않는지 확인한다.
- 로딩 실패·데이터 불러오기 실패·빈 상태를 사용자에게 설명하는 흐름을 와이어프레임과 실제 화면에서 대조한다.

### P2 — 설계 산출물 유지 규칙 확정

- PRD의 수용 기준이 `USER_FLOWS.md`와 `WIREFRAMES.md`의 화면·흐름 기준에 반영되어 있는지 검토한다.
- 설계 변경 요청은 먼저 BACKLOG에 기록하고, 우선순위 검토 전까지 관련 설계 문서와 코드를 임의로 변경하지 않는다.
- 구현 완료 후 실제 동작이 설계 문서와 달라진 경우, 문서 갱신과 `walkthrough.md` 기록을 같은 작업 묶음에 포함한다.

### P1 — Regular 활동 시간·무작위 탭 내성 검증

- Regular MUD가 실제 학생 개인 활동에서 10분 이내, 설계 목표 약 9분에 들어오는지 학생 3명 이상으로 측정한다.
- 탭 가능한 요소를 학생이 순서와 의미를 확인하지 않고 연속해서 눌러 1~2분 안에 끝내는 경로를 전수 확인한다.
- 핵심 단서 읽기·비교·해석 없이 완료되는 경우에는 완료 조건, 피드백, 단계 분량을 재설계한다.
- Deep-dive MUD는 확장 탐구 활동으로 운영할 차시 수, 교사 안내, 예상 시간을 별도로 정한다.
- 결과를 `activity_duration_audit.md`와 카탈로그 메타데이터에 반영한다.

### P1 — 자동 생성 IF 스테이지 교육적 품질 보강

- 최소 재시도 화면에 실제 역사 자료와 복수의 해석 단서를 보강할 대상을 선별한다.
- Regular의 짧은 복습 목표를 넘어서지 않도록 단계 수와 문장량을 함께 검토한다.
- 구조 선별 결과는 [`if_stage_audit.md`](./docs/audits/if_stage_audit.md)를 기준으로 삼고, 실제 문장 수정은 교사 검토 후 단계별로 진행한다.
- **2026-09-07 1차 실행(Claude)**: 90개 신호 중 주제와 무관한 완전 동일 범용 문구(7개 파일의 `4-1` 스테이지)만 우선 수정, 83개로 축소. 자동 재작성이 오히려 위험할 수 있는 나머지는 교사 검토 대기 — 상세는 [`if_stage_audit.md`](./docs/audits/if_stage_audit.md) §실행 결과 참조.

### P2 — 유물·보상 설명 교육적 검수

- 유물 카드 설명의 사실 범위, 출처, 5학년 수준의 문장 난이도를 검수한다.
- 구조·표현 신호는 [`artifact_audit.md`](./docs/audits/artifact_audit.md)를 기준으로 확인한다.

### P2 — Regular MUD 등록 경로 단순화

- `app.js`의 레거시 조건문 fallback을 유지할 필요와 제거 조건을 검토한다.
- `_index.json`의 등록 차시 기준을 화면 표시 번호로 통일한 뒤 단일 등록원 전환 여부를 결정한다.
- 중복 매칭 차시는 `primary`와 `supplementary`를 구분한 뒤 포털 기본 버튼은 `primary` 하나만 사용한다.
- 계획서 [`implementation_plan_registration_single_source.md`](./docs/plans/implementation_plan_registration_single_source.md)의 순서에 따라 인덱스 계약·검증을 먼저 확정한다.

### P3 — 미확인 브라우저·기기 회귀 점검

- 변경된 시뮬레이터 장면과 터치 흐름을 지원 브라우저·태블릿에서 정기적으로 육안 확인한다.
- 실행 기준: [`BROWSER_REGRESSION_CHECKLIST.md`](./BROWSER_REGRESSION_CHECKLIST.md)

### P3 — 협동 실시간 앱 ESLint 지원 버전 갱신

- `apps/cooperative-live`의 깨끗한 설치에서 고정된 `eslint@9.39.3` 지원 종료 경고가 발생한다. 현재 lint와 `npm audit`는 통과하므로 이번 가상 부하 테스트에는 섞지 않고, Next.js 호환 범위를 확인한 뒤 별도 갱신한다.

### P2 — 감사 보고서 출력 경로 정합성

- 문제: `scripts/10_audit_if_stages.py`와 `scripts/11_audit_artifacts.py`가 루트의 `if_stage_audit.md`·`artifact_audit.md`를 생성하지만, `BACKLOG.md`와 `project_context.md`는 `docs/audits/` 경로를 기준 문서로 가리킨다. 검증 실행 뒤 루트에 untracked 보고서가 남는다.
- 영향: 감사 결과의 기준 경로가 불명확해지고, 문서 재배치 이후 링크와 생성 산출물이 분리된다.
- 예상 변경 범위: 두 스크립트의 `REPORT` 경로, 기존 감사 문서의 보존·재생성 위치, 관련 링크의 실제 파일 존재 여부를 함께 점검한다.
- 원칙: 경로를 하나로 정한 별도 계획과 사용자 확인 후 수정하며, 감사 결과의 내용·판정 기준은 이 항목에서 변경하지 않는다.

### 조작대(inquiry-console) 트랙 1-B — P0 재렌더/포커스 소실 수정 완료 (2026-09-10)

- `js/mudInquiry.js`: 재렌더 시 `panel.replaceChildren()`로 DOM을 통째로 버려 포커스가 매번 `body`로 날아가던 문제를 `data-focus-key` 기반 캡처·복원(`captureFocusKey`/`restoreFocus`)으로 해결. 순서 카드 ↑↓가 맨 위/아래에 닿아 눌렀던 방향 버튼이 disabled가 되면 같은 카드의 반대 방향 버튼으로 폴백해 연속 조작이 끊기지 않는다.
- 지시서(`docs/handoff/claude_track1b_inquiry_console_instruction.md`)의 P0 "진행도 게이지 0% 고정"은 로컬 실측 결과 **재현되지 않음** — 고려 문화 4관문 모두 `sim.type: "info"`라 `#widget-gauge`가 애초에 `display:none`이며, 파일럿 도입 커밋(`87c1b10`)부터 계속 이랬다(git history 확인). 실제 UI에 노출되는 결함이 아니므로 이번 작업에서는 별도 조치 없이 다음 항목(P1)으로 넘어간다.
- 검증: `regular_goryeo_culture` 4관문을 로컬 서버에서 실제 클릭/스크립트 혼합으로 끝까지 플레이. §3 보존 항목(3단 잠금, 완료 후 전체 잠금, D-027 카테고리 판정) 모두 유지 확인. §8 자동 검증 전부 통과, 콘솔 에러 0건.

### 조작대(inquiry-console) 트랙 1-B — P0 진행도 게이지 방어 처리 완료 (2026-09-10)

- 위 항목에서 "재현되지 않음"으로 남겼던 P0(게이지 0% 고정)를 사용자 재확인 요청에 따라 `js/mudEngine.js`에 명시적 방어 코드로 처리함. 결정과 근거는 `DECISIONS.md` D-028 참조(선택지 (b): inquiry-task는 게이지 UI 자체를 숨긴다).
- `setupSimulator`에서 `sim.interaction === 'inquiry-task'`이면 `sim.type === 'gauge'`라도 게이지 위젯을 켜지 않도록 가드 추가. 강제로 `type: 'gauge'`를 주입해도 `#widget-gauge`가 계속 `display:none`으로 남는 것을 콘솔에서 확인.
- 4관문 재플레이로 §3 보존 항목(3단 잠금, 오답 시 다음 버튼 잠금·상태 보존, 완료 후 전체 잠금) 재확인, §8 자동 검증 전부 통과, 콘솔 에러 0건.

### 조작대(inquiry-console) 트랙 1-B — P1 제출 버튼 sticky + 아이패드 가로 레이아웃 완료 (2026-09-11)

- `css/style.css`: `.inquiry-panel`에 `max-height: min(58vh, 480px)` + `overflow-y: auto`를 추가해 패널 자체를 내부 스크롤 영역으로 만들고, `.inquiry-submit`에 `position: sticky; bottom: 0`을 추가해 그 안에서 항상 하단에 붙어 있게 함. 세로로 긴 3섹션 구조(특히 4관문 claim-evidence)에서도 판단 확인 버튼을 찾아 스크롤할 필요가 없어짐.
- `index.html`의 `css/style.css` 링크에 캐시버스터(`?v=20260911-inquiry-sticky1`)를 처음으로 추가함 — 그동안 버전 쿼리가 없어 브라우저가 이전 스타일을 계속 캐시하는 문제를 실측 중 발견(로컬 정적 서버 curl 응답은 최신인데 브라우저 렌더링만 구버전 유지). 이 파일은 세 창이 공유하므로, 다른 창도 `css/style.css`를 고칠 때 이 캐시버스터 값을 함께 올려야 반영을 확인할 수 있음 — `claude_four_track_overview.md`의 공유 파일 원칙에 참고 부탁.
- `js/mudInquiry.js`: `restoreFocus`의 `preventScroll: true`를 제거함. `.inquiry-panel`이 내부 스크롤 영역이 된 뒤에는 포커스 복원 시 브라우저가 패널 내부만 필요한 만큼 스크롤해 보여줘야 하므로(막으면 포커스는 이동해도 화면에 안 보일 수 있음).
- 검증: 아이패드 가로(1180×820)·세로(820×1180) 양쪽에서 4관문 모두 실제 클릭으로 끝까지 플레이, 매 관문 제출 버튼이 뷰포트 안에 있음을 `getBoundingClientRect`로 확인. §3 보존 항목(3단 잠금, 포커스 복원, 완료 후 전체 잠금) 재확인. §8 자동 검증 전부 통과, 콘솔 에러 0건.

### P1 — 트랙 1-A(관문 설계실) `regular_neolithic` 파일럿 완료 (2026-09-10)

- 작업: `docs/handoff/claude_track1a_gate_grammar_instruction.md` §3 1차 범위 3편 중 1편째. `regular_neolithic.json`의 4개 필수 단계(1·2·3·4)를 `ordered-hotspot`/`resource-allocation`/`reflection`에서 `inquiry-task`로 전환. 배정 문법은 `sequence`(1·2·3단계, 정착→토기→의생활 과정의 앞뒤 관계)이고 4단계(종합)는 참조 구현(`regular_goryeo_culture`)과 같은 관례로 `claim-evidence`를 사용했다.
- 소유권 범위 준수: `simulator` 블록만 수정했고 `choices`·`narrative`·`glossary`·실패 분기(`1-1`/`2-1`/`3-1`)는 그대로 두었다. `js/`·`css/`·`index.html`은 건드리지 않았다.
- D-027 회귀 직접 확인: 4단계 근거 3개 중 같은 범주(`technology`) 2개만으로 `minCategories:2` 주장을 제출해 **거부됨**을 확인했다(기존 고려 문화 결함과 달리 이번엔 정상 차단). 범주는 `environment`(1개)·`technology`(2개, 토기·의생활)로 의도적으로 겹쳐 배정해 범주 다양성 조건이 실제로 걸리도록 설계했다.
- 검증: `04_validate_mud_contract.py` 포함 지시서 §8 전체 통과. 로컬 서버(격리 워크트리, 다른 세션과 포트 충돌 확인 후 8792 사용)에서 1~4단계 전부 실제 플레이: 오답 제출 시 다음 버튼 비활성 유지·정답 비노출 확인, 정답 제출 시 탐구 패널 컨트롤 전체 비활성화 + 다음 버튼만 활성화 확인, 최종 보상(`art_2` 암사동 빗살무늬 토기) 정상 지급, 콘솔 에러 0건.
- **버그 발견(트랙 1-B 소관, 수정하지 않음)**: `js/mudInquiry.js`의 `evaluateSequence()`가 완료 메시지를 `task.completion.successText`가 아니라 하드코딩된 문자열 `"인쇄 절차와 금속활자의 재사용 의미를 연결했습니다."`(고려 문화 2단계 전용 문구)로 고정 반환한다. `regular_neolithic` 1~3단계에서 정답 제출 시 이 문구가 그대로 뜨는 것을 실측으로 확인했다 — 완료 판정 자체는 정확하지만 학생이 보는 성공 메시지가 신석기 내용과 무관하다. `js/`는 이 트랙 소유가 아니므로 수정하지 않고 여기 기록만 남긴다.
- 다음: `regular_three_kingdoms.json`(`map-evidence`) 착수 전 한 편 완료 원칙에 따라 사용자 확인 대기.

### P1 — 트랙 1-A(관문 설계실) `regular_three_kingdoms` 파일럿 완료 (2026-09-10)

- 작업: §3 1차 범위 2편/3. `regular_three_kingdoms.json`의 필수 단계 1~4를 `map-evidence`(1~3단계, 장소·근거·자료 범위 연결)와 `claim-evidence`(4단계, 시대별 근거 종합)로 전환. 기존 3개 hotspot(장소)이 이미 존재해 `locations`로 그대로 재사용했다.
- 범주 설계 재검토: 처음에 4단계 두 주장(claim)의 `minCategories`를 2로 설정했으나, `04_validate_mud_contract.py`가 갱신되어 있어 **"근거 3개가 서로 다른 범주 3개라 2개만 골라도 항상 통과하는 죽은 조건"**을 자동으로 잡아냈다(에러: `minCategories=2 can never fail`). 1~3단계 각 나라(백제/고구려/신라)당 지원 근거가 정확히 1개뿐이라 같은 범주 조합 자체가 존재하지 않았던 것이 원인 — `minCategories`를 1로 낮추고, 대신 `minEvidence`(claim2는 2개 고정)와 `accepts` 멤버십 자체로 "서로 다른 나라 근거를 실제로 골라야 한다"는 요구를 걸었다.
- D-027 회귀를 4단계에서 직접 재현: 좁은 주장("5세기 고구려→6세기 신라")을 고른 뒤 그 주장의 `accepts`에 없는 백제 근거를 함께 선택해 제출 → **"선택한 주장과 직접 연결되지 않는 자료가 있습니다"로 정상 거부**됨을 확인했다. 백제 근거를 빼고 고구려+신라만 남기자 정상 완료(역사가 등급)됐다.
- 검증: 지시서 §8 전체 통과(반복 탭 회피 감사 후보가 7개→6개로 감소, `regular_three_kingdoms.json:4`가 목록에서 빠짐). 로컬 서버(포트 8801, `.claude/launch.json`의 `gate-grammar` 설정 디렉터리 고정)에서 1~4단계 전부 실제 플레이: 각 단계 오답 제출 시 다음 버튼 비활성 유지·정답 비노출, 정답 제출 시 컨트롤 전체 비활성화 + 다음 버튼만 개방, 최종 보상(`art_5` 백제 칠지도 + `art_6` 신라 북한산 순수비) 정상 지급, 콘솔 error/warning 0건.
- 다음: `regular_modern_open.json`(`commit-revise`) 착수 전 한 편 완료 원칙에 따라 사용자 확인 대기.

### P1 — 트랙 1-A(관문 설계실) 정정: "같은 문법 두 번 금지"는 편 내부 4관문 기준 (2026-09-11)

- 사용자 정정: 지시서 §3 "같은 문법을 두 번 쓰지 않는다"는 세 편 사이의 배정 문법이 아니라, **참조 구현(`regular_goryeo_culture`)처럼 한 편 안의 4관문이 서로 다른 사고 문법**(commit-revise→sequence→map-evidence→claim-evidence, 관찰→분류·순서화→인과·공간 추론→주장·근거·반례)을 요구해야 한다는 뜻이었다. 앞서 커밋한 `regular_neolithic`(1~3단계 전부 `sequence`)과 `regular_three_kingdoms`(1~3단계 전부 `map-evidence`)는 편 사이만 구분했을 뿐 편 내부는 여전히 단일 문법이라, 이 트랙이 고치려던 "배경만 다르고 조작은 동일" 문제를 그대로 재현했다.
- 두 편을 `regular_modern_open` 착수 전에 재설계한다: 각 편의 1~3단계를 서로 다른 문법(map-evidence/sequence/commit-revise, 순서는 편마다 원래 콘텐츠 성격에 맞춰 배정) + 4단계 `claim-evidence`(변경 없음, 기존 award id·category 그대로 유지해 종합 관문이 계속 작동하도록 함)로 바꾼다. 상세 결과는 아래 두 항목에 이어서 기록한다.

### P1 — 트랙 1-A(관문 설계실) `regular_neolithic` 편 내부 4관문 재설계 (2026-09-11)

- 재배정: 1단계(정착지 선택, 강가/농경지/움집 hotspot이 이미 장소 개념이라) → `map-evidence`. 2단계(토기 제작 순서) → `sequence`(변경 없음, 이미 순서 문법이 가장 자연스러웠음). 3단계(가락바퀴·뼈바늘) → `commit-revise`("어떤 도구·재료가 필요한가"라는 판단 질문에 맞음). 4단계는 `claim-evidence` 그대로, `settlement-environment`(category `environment`)·`pottery-technology`/`weaving-technology`(둘 다 category `technology`)라는 기존 award id·범주를 그대로 유지해 종합 관문 로직을 건드리지 않았다.
- 재검증: `python -c ...`로 1~4단계 interaction/task.type을 직접 출력해 `map-evidence/sequence/commit-revise/claim-evidence` 4종이 실제로 다른지 확인. 지시서 §8 전체 스크립트 재통과.
- 로컬 재플레이(포트 8801, `preview_start` 이름 `gate-grammar`): 1~4단계 전부 다시 끝까지 플레이. 3단계(신규 `commit-revise`)에서 초기 판단→근거 2종 확인→최종 판단까지 실제로 요구되는지, 4단계 D-027 가드(좁은 주장에 무관한 근거 섞으면 거부)가 재설계 이후에도 여전히 걸리는지 재확인했다. 콘솔 error/warning 0건.
- 추가 버그 확인(트랙 1-B 소관, 수정 안 함): 이전에 `evaluateSequence()`에서 발견한 하드코딩 성공 메시지 버그가 `evaluateCommitRevise()`에도 동일하게 있다 — 3단계(신석기 도구 판단)를 정답으로 완료해도 "제작 과정과 보관 환경을 함께 고려한 판단입니다."(고려 문화 1단계 전용 문구)가 그대로 뜬다. `evaluateMapEvidence`/`evaluateClaimEvidence`의 완료 메시지는 문구 자체가 MUD에 무관하게 쓸 수 있는 일반 문장이라 눈에 띄는 오류로 드러나지 않을 뿐, 4개 평가 함수 전부 `task.completion.successText`가 아니라 함수 안에 하드코딩된 문자열을 반환하는 동일한 구조다.

### P1 — 트랙 1-A(관문 설계실) `regular_three_kingdoms` 편 내부 4관문 재설계 (2026-09-11)

- 재배정: 1단계(백제, "무엇이 전성기의 핵심이었나" 판단 질문) `map-evidence`→`commit-revise`(hotspot 제거, 한강 유역 자원·칠지도 교류를 근거로 초기 판단→수정). 2단계(고구려, 평양 천도 장소 판단) `map-evidence` 유지(변경 없음, 이미 최적 문법이었음). 3단계(신라, 영토 확보→교류→기록의 시간 순서) `map-evidence`→`sequence`(hotspot 제거, 한강 확보→당항성 교류→북한산 순수비 건립 3단계 카드로 재구성). 4단계는 `claim-evidence` 그대로, `baekje-han-river-network`/`goguryeo-pyeongyang-policy`/`silla-bukhansan-record` 등 기존 award id·category를 전부 보존해 종합 관문이 계속 작동하도록 했다.
- 재검증: `python -c ...`로 1~4단계 interaction/task.type을 직접 출력해 `commit-revise/map-evidence/sequence/claim-evidence` 4종이 실제로 다른지 확인. 지시서 §8 전체 스크립트 재통과(반복 탭 감사 후보 6개 유지, 새 회귀 없음).
- 로컬 재플레이(포트 8801, `preview_start` 이름 `gate-grammar`): 1~4단계 전부 다시 끝까지 플레이. 1단계(신규 `commit-revise`)의 초기 판단→근거 2종→최종 판단, 3단계(신규 `sequence`)의 카드 순서 배열+의미 질문, 4단계 D-027 가드(좁은 주장에 백제 근거를 섞으면 거부)가 재설계 이후에도 정상 작동함을 재확인했다. 콘솔 error/warning 0건.
- 3단계에서도 동일한 하드코딩 성공 메시지 버그(`evaluateSequence()`가 "인쇄 절차와 금속활자의 재사용 의미를 연결했습니다."를 그대로 반환)를 재현했다 — 트랙 1-B 소관, 기존 기록과 동일 원인이라 새 항목은 추가하지 않는다.
- 3편 모두(신석기/삼국) 재설계 완료. 다음: `regular_modern_open.json`(`commit-revise`, 1차 배정 문법이지만 4관문 다양화 기준으로 3종 중 하나로 재배치 필요) 착수 전 사용자 확인 대기.

### 2026-09-10 「연결 공방」(activity-loop) Track 3 — P0 완료: 원인과 결과 1·2단원 세트 신규 제작

- **배경**: `docs/handoff/claude_track3_activity_loop_instruction.md`(Opus 5 기획) — 확장 역사 활동을 "MUD에서 얻은 것을 다시 쓰는 곳"으로 재정의하는 트랙. §1 미병합 커밋(`76f7cde` 버튼-결과 위치 수정, `2108f0f` 토글 스위치 도입) 정리 후 P0 착수.
- **문제**: `data/causeEffectChains.json`이 3단원(근현대) 2세트뿐이라 1·2단원 진도 중에는 원인과 결과 게임이 완전히 비어 있었다.
- **작업**: 1단원(고려)·2단원(조선) 세트를 각 1개씩 신규 제작, 총 4세트로 확장.
  - 1단원: 고려 건국 → 거란 침입·서희의 담판 → 거란 재침입·강감찬의 귀주대첩 → 몽골 침입·팔만대장경 조판 → 벽란도 국제 교류 (`regular_goryeo_founding`/`regular_goryeo_war`/`regular_goryeo_culture` MUD 내용 기준)
  - 2단원: 조선 건국 → 한양 천도·도성 설계 → 훈민정음 창제 → 임진왜란·명량대첩 → 병자호란과 전후 회복 (`regular_joseon_founding`/`regular_sejong`/`regular_myeongnyang`/`regular_joseon_diplomacy` MUD 내용 기준)
  - 기존 3단원 2세트는 그대로 두되 순서상 뒤로 배치(stage 3·4로 재번호). 새 이벤트는 모두 연도 표기 없이 인과 논리 힌트로만 구성했고, MUD에 없는 서술은 지어내지 않았다(예: 팔만대장경은 거란이 아니라 몽골 침입기 조판이라는 실제 MUD 서술을 그대로 따름).
- **검증**: `python -c "json.load(...)"`, `01_validate_game_data.py`, `06_validate_static_assets.py`, `node --check js/miniGames.js` 통과. 로컬 서버에서 두 신규 세트 모두 정답 판정·"다음 스테이지로" 흐름·배지 획득 로직까지 실제 실행 확인, 콘솔 에러 0건.
- **다음**: P1(카드 짝맞추기 해금 유물 기반 전환), P2(연표 개인화 — 설계 문서 우선), P3(스토리 위치 재정의 문서화) 순서로 진행 예정.

### 2026-09-10 「연결 공방」(activity-loop) Track 3 — P1 완료: 카드 짝맞추기를 해금 유물 기반으로 전환

- **문제**: `js/miniGames.js:62`의 `[...this.artifacts].slice(0, 6)`이 해금 여부와 무관하게 `artifacts.json`의 앞 6개를 항상 고정 출제 — 재플레이 가치가 없고, 아직 클리어하지 않은 MUD의 유물 이름이 스포일러로 노출됐다.
- **작업**: 유물 탐정(`startDetectiveGame`)과 같은 패턴으로 `window.encyclopedia.data.unlockedArtifacts` 기반 풀로 전환.
  - 최소 기준은 **3개**로 정했다(유물 탐정의 4개보다 낮음) — 카드 짝맞추기는 카드 자체가 정답을 보여주는 기억 게임이라 4지선다만큼 후보가 많이 필요하지 않고, 3쌍(6장)부터 최소한의 게임이 성립한다고 판단했다.
  - 해금 유물이 6개 미만이면 있는 만큼(3~5쌍)으로 진행, 6개 이상이면 매번 무작위로 6개를 뽑아 재플레이 가치를 확보.
  - `checkCardMatch()`의 `unlockArtifact()` 호출 제거 — 카드 풀이 이미 해금된 유물로만 구성되어 항상 no-op이었다.
- **검증**: 해금 0/3/10개 시나리오를 브라우저에서 직접 실행 — 0개는 안내 문구 표시, 3개는 3쌍(6장), 10개는 6쌍(12장)으로 상한, 완주 시 완료 화면까지 정상 동작. 카드에 노출된 이름이 전부 해금 목록에 포함됨을 확인(스포일러 없음). `node --check`, `06_validate_static_assets.py`, 콘솔 에러 0건.
- **다음**: P2(연표 개인화 — 설계 문서 우선 제안), P3(스토리 위치 재정의 문서화) 순서로 진행 예정.

### 2026-09-10 「연결 공방」(activity-loop) Track 3 — 회귀 발견 및 수정: 미니게임 전환 시 이전 결과 잔존

- **문제 발견 경위**: 4트랙 지시서(`claude_track3_activity_loop_instruction.md`) §6 완료 판정 "토글로 활동을 전환해도 이전 활동의 결과가 남아 있지 않다"를 iPad 가로(1180×820)·세로(820×1180) 뷰포트 실측 중 직접 확인하다가 발견. 4개 미니게임(`card-game-container`/`timeline-game-container`/`cause-effect-game-container`/`detective-game-container`)이 각자 독립된 `<div>`에 렌더링되는데, 하나를 시작해도 이전에 플레이한 다른 게임의 결과물이 DOM에서 지워지지 않고 계속 쌓여 "확장 역사 활동" 영역이 불필요하게 길어지고 있었다.
- **수정**: `js/miniGames.js`에 `clearMiniGameContainers()`를 추가해 4개 컨테이너(+ `card-game-stats`)를 모두 비우고, 4개 `start*Game()` 진입점 각각의 첫 줄에서 호출하도록 했다.
- **검증**: 로컬 서버에서 카드→원인결과→연표→탐정 순으로 전환하며 매번 4개 컨테이너의 `innerHTML.length`를 측정 — 항상 방금 시작한 게임 하나만 내용이 있고 나머지 3개는 0임을 확인. 콘솔 에러 0건. iPad 가로(1180×820)에서 확장 활동 섹션 높이 1231px(카드 게임), 세로(820×1180)에서 697px로 뷰포트 대비 과도하지 않음.

### 2026-09-11 「연결 공방」(activity-loop) Track 3 — §6 완료 판정 통과 + P2 설계안 작성

- **§6 완료 판정(P0·P1 대상) 실측**: `activity-loop`(포트 8803)에서 5개 활동(카드/연표/원인결과/탐정/스토리) 전부 실제 클릭으로 플레이. 4개 미니게임 각각 시작 버튼과 결과가 14px 간격으로 항상 같은 위치, 전환 시 다른 게임 컨테이너는 모두 0자(잔존 없음) 확인. 콘솔 에러 0건. 아이패드 가로(1180×820) 597.7px, 세로(820×1180) 591.3px — 두 뷰포트 모두 세로 스크롤 과도하지 않음.
- **P2 설계안**: `docs/plans/implementation_plan_personal_timeline.md` 작성. `unlockedArtifacts` 배열 순서가 곧 MUD 완료 순서임을 코드로 확인했고, `artifacts.json`의 `hint` 필드에서 (단원, 차시)를 파싱해 36개 중 31개를 역사적 순서로 재구성 가능함을 검증(Deep-dive·협동 MUD 5종은 예외 처리 필요). 옵션 A(완전 전환)/B(병행, 추천)/C(보류) 중 B를 추천하되 최종 결정은 사용자 확인 대기 — **구현하지 않음.**

### 조작대(inquiry-console) 트랙 1-B 라운드 2 — P1 근거 인벤토리 가시화 완료 (2026-09-11)

- `js/mudInquiry.js`: "이번 탐구에서 모은 근거 N장" 한 줄 텍스트를 `<details>`/`<summary>` 접기·펼치기(`renderEvidenceInventory`)로 바꿔, 펼치면 `awards[].label`을 칩 목록(`<ul class="inquiry-evidence-chips">`)으로 보여줌. 기본은 접힘(세로를 늘리지 않음), 관문 이동 시 다시 접힘, 같은 관문 안 재렌더에서는 열림 상태를 유지(`this.inventoryOpen`)해 선택 도중 확인하려고 펼쳤다가 다른 버튼을 눌러도 다시 접히지 않음. 문구는 전부 데이터에서 옴(D-029 준수, 코드에 편별 문구 없음).
- `css/style.css`: `.inquiry-run-status`를 제거하고 `.inquiry-evidence-inventory`/`-chips`/`-chip` 계열로 교체. `.inquiry-panel`의 `max-height`를 `min(58vh,480px)` → `min(54vh,440px)`로 살짝 낮춤(인벤토리가 펼쳐질 때도 4관문 제출 버튼이 뷰포트 안에 있는지 재확인하며 여유 확보).
- **다른 편 교차 확인**: `regular_three_kingdoms`(commit-revise 1관문)를 열어 인벤토리·문구가 정상 렌더링되는지 확인함 — 콘솔 에러 없음, 편별 문구 누출 없음. 4관문까지는 진행하지 않음(스테이지 ID가 "1-1" 등 분기형이라 시간상 1관문만 확인).
- **캐시버스터**: `css/style.css` → `?v=20260911-inquiry-evidence2`, `js/mudInquiry.js` → `?v=20260911-evidence2`로 갱신.
- 검증: `regular_goryeo_culture` 4관문 전체를 인벤토리를 펼친 채로 재플레이(1180×820 포함), 매 관문 제출 버튼이 뷰포트 안에 있음을 `getBoundingClientRect`로 확인. `<summary>`가 네이티브로 포커스·클릭 가능함을 확인(스크린리더 disclosure 시맨틱 그대로 사용, 별도 ARIA 불필요). §8 자동 검증 전부 통과, 콘솔 에러 0건. 이로써 원 지시서 §2 [P1] 두 항목이 모두 끝났다.

### 조작대(inquiry-console) 트랙 1-B 라운드 2 — P2 설계 문서 2건 작성 (구현 대기)

원 지시서 §5 절차대로, 아래 두 항목은 **문서만** 작성했다. 구현하지 않았고, 사용자 확인 전까지 착수하지 않는다.

- [`implementation_plan_map_evidence_canvas_role.md`](./docs/plans/implementation_plan_map_evidence_canvas_role.md) — `map-evidence`에서 Canvas가 장식이 된 문제. 접근성상 "캔버스를 반드시 봐야만 풀린다"로 만들 수 없는 이유(DOM 대체 조작과의 정보 동등성 요건)를 먼저 정리하고, 런타임만 바꾸는 옵션 A(권장, 조작대 단독 가능)와 데이터 스키마까지 바꾸는 옵션 B(관문 설계실 조율 필요, 이번 라운드 범위 밖)로 나눔.
- [`implementation_plan_inquiry_progressive_disclosure.md`](./docs/plans/implementation_plan_inquiry_progressive_disclosure.md) — 섹션 3개가 한 번에 노출되는 문제. 문법별 단계 정의, 자동 전진/명시적 "다음" 버튼을 가르는 기준, 완료 단계 접힘 요약과 `[수정]` 시 이후 단계 초기화 규칙, 3편(고려·신석기·삼국) 12개 관문이 각각 어떻게 달라지는지를 `regular_goryeo_culture` 기준으로 명시.

두 문서 모두 §3 보존 항목·D-027 회귀·1180×820 검증을 구현 후 재확인 항목으로 못박아 둠.
