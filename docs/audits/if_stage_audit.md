# Regular 재시도(IF) 단계 교육 품질 감사

> 구조 감사 보조 자료입니다. 실제 수업 관찰이나 교육과정 검토를 대신하지 않습니다.
> 장면(`simulator.scene`), 핫스팟, 상호작용, 완료조건은 이 감사에서 변경하지 않습니다.

> **문서 구성**: `## 보완 검토 신호`의 마커 구간은 `python scripts/10_audit_if_stages.py`가
> 갱신합니다. 그 밖의 절은 사람이 쓰며 스크립트가 건드리지 않습니다. 마커를 지우면
> 스크립트는 덮어쓰지 않고 실패합니다.

## 실행 결과 (2026-09-07, Claude)

90개 신호 중 **7개**(`regular_japanese_rule_2`·`regular_modern_open`·`regular_post_war`·`regular_joseon_folk`·`regular_joseon_status`·`regular_sejong`·`regular_independence`의 `4-1` 스테이지)를 우선 수정했다. 이 7곳은 단순히 "짧다"가 아니라 **역사 주제와 무관한 완전히 동일한 범용 문구**("한 자료는 과거의 한 측면을 보여 줍니다..." 등)를 그대로 복사해 쓰고 있어, 일제강점기든 세종대왕이든 서민문화든 똑같은 화면이 떴다. 각 파일의 실제 stage 4 핫스팟(비교 대상 자료 2~3개)을 인용하도록 새로 썼다 — 상세는 커밋 `3afbb21` 참고.

나머지 83개는 이번 범위에 포함하지 않았다. BACKLOG.md가 이미 "실제 문장 수정은 교사 검토 후 진행"이라고 명시하고 있고, 표본 확인 결과 상당수는 짧아도 이미 해당 스테이지 주제에 맞는 구체적 설명이라 자동 재작성이 오히려 위험할 수 있다(예: `regular_independence_army:2-1` 59자는 "역사 속 위험한 행동을 직접 재현할 필요는 없습니다..." 라는 의도된 정서 안전 문구). 다음 단계는 교사 검토 우선순위 선정 — 이번 감사의 "둘 다 미달"(120자 미만 + 단서 2개 미만) 36곳부터 시작하는 것을 권장한다.

## 보완 검토 신호

<!-- IF_STAGE_SIGNALS:START -->
- 감사 대상: Regular 재시도 단계 전체
- 보완 검토 신호: 78개
- 최소 기준: 근거 설명 120자 이상, 자료·비교 단서 2개 이상, 원 단계 복귀 선택지 1개

| 파일 | 단계 | 표지 | 설명 글자 수 | 단서 | 신호 |
|---|---:|---|---:|---|---|
| `regular_balhae.json` | 1-1 | ❌ 자료 해석 (건국 좌절) | 80 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_balhae.json` | 2-1 | ❌ 자료 해석 (국력 약화) | 77 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_balhae.json` | 3-1 | ❌ 자료 해석 (역사 왜곡) | 78 | 자료, 비교 | 근거 설명 120자 미만 |
| `regular_balhae.json` | 4-1 | ↩️ 근거 보완: 단정 대신 비교 | 68 | 자료, 기록 | 근거 설명 120자 미만 |
| `regular_bronze_age.json` | 1-1 | ❌ 자료 해석 (실패) | 171 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_bronze_age.json` | 2-1 | ❌ 자료 해석 (실패) | 166 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_bronze_age.json` | 3-1 | ❌ 자료 해석 (실패) | 157 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_gojoseon.json` | 2-1 | ❌ 자료 해석 (실패) | 162 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_goryeo_culture.json` | 1-1 | ❌ 자료 해석 (문화유산 상실) | 105 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_goryeo_culture.json` | 2-1 | ❌ 자료 해석 (인쇄술 발전 지체) | 60 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_goryeo_culture.json` | 3-1 | ❌ 자료 해석 (국제 고립) | 58 | 자료, 기록 | 근거 설명 120자 미만 |
| `regular_goryeo_founding.json` | 1-1 | ❌ 자료 해석 (실패) | 141 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_goryeo_founding.json` | 2-1 | ❌ 자료 해석 (실패) | 167 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_goryeo_founding.json` | 3-1 | ❌ 자료 해석 (실패) | 172 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_goryeo_society.json` | 1-1 | ❌ 자료 해석 (실패) | 165 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_goryeo_society.json` | 2-1 | ❌ 자료 해석 (실패) | 153 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_goryeo_war.json` | 1-1 | ❌ 자료 해석 (굴욕적 영토 상실) | 59 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_goryeo_war.json` | 2-1 | ❌ 자료 해석 (선봉 기습 실패) | 62 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_goryeo_war.json` | 3-1 | ❌ 자료 해석 (적의 재침략) | 62 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_gwangbok.json` | 2-1 | ❌ 자료 해석 (실패) | 148 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_gwangbok.json` | 3-1 | ❌ 자료 해석 (실패) | 165 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_independence.json` | 1-1 | ❌ 자료 해석 (독립 선포 포기) | 71 | 자료, 비교 | 근거 설명 120자 미만 |
| `regular_independence.json` | 2-1 | ❌ 자료 해석 (굴복과 체념) | 70 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_independence.json` | 3-1 | ❌ 자료 해석 (군주제 회귀) | 68 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_independence_army.json` | 1-1 | 🔄 자료 범위 다시 보기 | 61 | 기록, 단서 | 근거 설명 120자 미만 |
| `regular_independence_army.json` | 2-1 | 🔄 유물 의미 다시 보기 | 59 | 없음 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_independence_army.json` | 4-1 | 🔄 세 자료 다시 비교 | 57 | 기록 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_japanese_rule_1.json` | 1-1 | ❌ 자료 해석 (영구 복종) | 65 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_japanese_rule_1.json` | 2-1 | ❌ 자료 해석 (수탈 방조) | 58 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_japanese_rule_1.json` | 3-1 | ❌ 자료 해석 (독립운동 분쇄) | 62 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_japanese_rule_2.json` | 3-1 | ❌ 자료 해석 (한글의 소멸) | 118 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_joseon_diplomacy.json` | 1-1 | 🔄 자료를 다시 비교해 보세요 | 116 | 자료, 살펴, 단서 | 근거 설명 120자 미만 |
| `regular_joseon_diplomacy.json` | 2-1 | 🔄 자료를 다시 비교해 보세요 | 117 | 자료, 기록, 비교, 살펴 | 근거 설명 120자 미만 |
| `regular_joseon_diplomacy.json` | 4-1 | 🔄 자료를 다시 비교해 보세요 | 50 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_joseon_economy.json` | 2-1 | ❌ 자료 해석 (실패) | 182 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_joseon_economy.json` | 3-1 | ❌ 자료 해석 (실패) | 184 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_joseon_folk.json` | 1-1 | ❌ 자료 해석 (서민 풍속화 부재) | 94 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_joseon_folk.json` | 2-1 | ❌ 자료 해석 (민중 소리의 단절) | 84 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_joseon_founding.json` | 1-1 | ❌ 자료 해석 (실패) | 175 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_joseon_founding.json` | 3-1 | ❌ 자료 해석 (실패) | 189 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_joseon_silhak.json` | 1-1 | ❌ 자료 해석 (실패) | 173 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_joseon_silhak.json` | 2-1 | ❌ 자료 해석 (실패) | 165 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_joseon_status.json` | 1-1 | ❌ 자료 해석 (신분증 미소지) | 78 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_joseon_status.json` | 2-1 | ❌ 자료 해석 (기술 천대) | 119 | 자료, 비교, 살펴 | 근거 설명 120자 미만 |
| `regular_joseon_status.json` | 3-1 | ❌ 자료 해석 (민중 멸시) | 106 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_korean_war.json` | 1-1 | 🔄 피난민 관점 다시 보기 | 57 | 자료, 기록, 살펴 | 근거 설명 120자 미만 |
| `regular_korean_war.json` | 2-1 | 🔄 전쟁 속 학생 다시 보기 | 70 | 살펴 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_korean_war.json` | 3-1 | 🔄 정전과 평화 구분하기 | 118 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_korean_war.json` | 4-1 | 🔄 세 자료 다시 연결 | 63 | 없음 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_modern_open.json` | 1-1 | ❌ 자료 해석 (주권 의식 부재) | 99 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_modern_open.json` | 2-1 | ❌ 자료 해석 (문물 거부의 참상) | 105 | 자료, 비교, 살펴 | 근거 설명 120자 미만 |
| `regular_modern_open.json` | 3-1 | ❌ 자료 해석 (교통 발전 정체) | 106 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_myeongnyang.json` | 1-1 | ❌ 자료 해석 (실패) | 132 | 살펴 | 자료·비교 단서 2개 미만 |
| `regular_myeongnyang.json` | 2-1 | ❌ 자료 해석 (실패) | 180 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_myeongnyang.json` | 3-1 | ❌ 자료 해석 (실패) | 117 | 자료, 비교 | 근거 설명 120자 미만 |
| `regular_neolithic.json` | 1-1 | ❌ 자료 해석 (실패) | 149 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_neolithic.json` | 2-1 | ❌ 자료 해석 (실패) | 164 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_neolithic.json` | 3-1 | ❌ 자료 해석 (실패) | 165 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_paleolithic.json` | 1-1 | ❌ 자료 해석 (실패) | 151 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_paleolithic.json` | 2-1 | ❌ 자료 해석 (실패) | 147 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_paleolithic.json` | 3-1 | ❌ 자료 해석 (실패) | 138 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_paleolithic.json` | 4-1 | ❌ 자료 해석 (실패) | 95 | 살펴 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_paleolithic.json` | 5-1 | ❌ 자료 해석 (실패) | 89 | 없음 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_post_war.json` | 1-1 | ❌ 자료 해석 (재건 포기) | 106 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_post_war.json` | 2-1 | ❌ 자료 해석 (인재 양성 실패) | 108 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_sejong.json` | 1-1 | ❌ 자료 해석 (문자 소외) | 105 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_sejong.json` | 2-1 | ❌ 자료 해석 (자주 역법 부재) | 135 | 살펴 | 자료·비교 단서 2개 미만 |
| `regular_sejong.json` | 3-1 | ❌ 자료 해석 (과학의 독점) | 108 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_silla.json` | 1-1 | ❌ 자료 해석 (개혁 실패) | 89 | 자료, 비교 | 근거 설명 120자 미만 |
| `regular_silla.json` | 2-1 | ❌ 자료 해석 (문화유산 부재) | 84 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_silla.json` | 3-1 | ❌ 자료 해석 (과학적 설계 결여) | 84 | 자료 | 근거 설명 120자 미만, 자료·비교 단서 2개 미만 |
| `regular_silla.json` | 4-1 | ↩️ 근거 보완: 자료 하나의 한계 | 76 | 자료, 살펴 | 근거 설명 120자 미만 |
| `regular_three_kingdoms.json` | 1-1 | ❌ 자료 해석 (실패) | 156 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_three_kingdoms.json` | 2-1 | ❌ 자료 해석 (실패) | 170 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_three_kingdoms.json` | 3-1 | ❌ 자료 해석 (실패) | 182 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_three_kingdoms_life.json` | 1-1 | ❌ 자료 해석 (실패) | 157 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_three_kingdoms_life.json` | 2-1 | ❌ 자료 해석 (실패) | 140 | 자료 | 자료·비교 단서 2개 미만 |
| `regular_three_kingdoms_life.json` | 3-1 | ❌ 자료 해석 (실패) | 158 | 자료 | 자료·비교 단서 2개 미만 |
<!-- IF_STAGE_SIGNALS:END -->

## 적용 원칙

1. Regular은 10분 이내 복습이므로 실패 화면을 별도 탐구 단계로 확장하지 않습니다.
2. 보완 시 역사적 결과를 단정하기보다 원 단계의 자료·기록·비교 단서를 한두 문장으로 연결합니다.
3. 장면 단계의 좌표·핫스팟·완료조건 변경이 필요하면 Claude에 MUD·단계별 변경을 먼저 전달합니다.
4. 최종 승인 전 교사 검토와 학생 재시도 관찰을 별도로 수행합니다.
