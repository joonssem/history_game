# 단계 일관성 경고 목록

생성: `node scripts/18_audit_stage_coherence.js` (BACKLOG P1-STAGE-COHERENCE-A)

한 단계 안의 주변 필드(장소·배지·안내·정보·피드백·완료 문구·로드맵 라벨)와 재시도 단계의 버튼·해설이, 그 단계의 이야기·선택지·단서와 의미 있는 낱말 조각을 하나도 나누지 않는 곳을 모았다. 이야기와 정답 선택지가 서로 다른 주제인 곳도 모았다.

**실패가 아니라 검토 목록이다.** 낱말이 겹치지 않아도 뜻이 맞는 문장이 있다(예: 결과를 알리는 짧은 피드백). 화면 문구를 보고 사람이 판단한다. 판단이 끝난 항목을 허용 목록으로 만들지는 경고 수가 안정된 뒤 정한다.

<!-- STAGE_COHERENCE:START -->
- 대상: Regular 28편
- 경고: 71건 (23편)

| 편 | 단계 | 필드 | 문구 |
|---|---|---|---|
| `regular_paleolithic` | 1 | simulator.completion.successText | 🏕️ 안전한 보금자리의 단서를 모두 확인했습니다. |
| `regular_paleolithic` | 2 | narrative ↔ 정답 | 🪵 "단단한 부싯돌을 마른 풀잎 위에 강하게 내리쳐 불꽃을 튀긴다!" |
| `regular_paleolithic` | 2 | roadmap.label | 2. 불 피우기 도전 |
| `regular_paleolithic` | 3 | simulator.instruction | ⛏️  가장자리 → 돌의 면 → 뾰족한 끝을 차례로 다듬으세요! |
| `regular_paleolithic` | 3 | simulator.feedback | 돌의 세 작업 지점을 찾아보세요. |
| `regular_paleolithic` | 3-1 | simulator.instruction | ⛏️  가장자리·돌의 면·뾰족한 끝을 다시 차례로 확인하세요! |
| `regular_neolithic` | 1 | location | 한강 유역 암사동 모래톱 |
| `regular_neolithic` | 2 | location | 암사동 점토 가마터 |
| `regular_neolithic` | 3 | location | 움집 안 화덕 자리 |
| `regular_bronze_age` | 2 | location | 고인돌 축조 터 |
| `regular_bronze_age` | 2 | badge | 🔨 1단계: 받침돌 세우기 |
| `regular_bronze_age` | 2 | simulator.instruction | ⛰️  청동기 사회의 변화 단서 3가지를 확인하세요. |
| `regular_bronze_age` | 2 | roadmap.label | 2. 받침돌(지석) 세우기 |
| `regular_bronze_age` | 2-1 | simulator.instruction | 🔨  다시 받침돌을 세우세요! |
| `regular_bronze_age` | 3 | badge | 🪵 2~3단계: 거석 견인 |
| `regular_bronze_age` | 3 | simulator.instruction | 🪵  화면이나 아래 버튼으로 거석 운반의 단서 3가지를 확인하세요. |
| `regular_bronze_age` | 3-1 | simulator.instruction | 🪵  슬라이더로 인원을 늘려보세요! |
| `regular_gojoseon` | 1 | narrative ↔ 정답 | ☀️ "홍익인간 이념으로 백성을 널리 이롭게 하고 평화로운 세상을 연다!" |
| `regular_gojoseon` | 2 | narrative ↔ 정답 | ⚖️ "남을 다치게 한 자는 곡식으로 갚고, 도둑질한 자는 노비로 삼는다!" |
| `regular_gojoseon` | 2-1 | simulator.instruction | ⚖️  다시 엄정하게 판결하세요! |
| `regular_three_kingdoms` | 1 | narrative ↔ 정답 | 🗡️ "일곱 개의 칼날을 지닌 강철검 '칠지도'를 보내고 해외 무역로를 연다!" |
| `regular_three_kingdoms` | 2-1 | simulator.instruction | 🏹  고구려의 기상을 펼치세요! |
| `regular_three_kingdoms` | 3 | simulator.feedback | 과정 카드와 의미 질문을 모두 완성해야 합니다. |
| `regular_three_kingdoms_life` | 1 | narrative ↔ 정답 | 👗 "풍성한 주름치마와 긴 저고리를 입어 신분과 우아한 멋을 뽐냈다!" |
| `regular_goryeo_founding` | 1 | location | 918년 철원 송악산 기슭 |
| `regular_goryeo_founding` | 1 | badge | 👑 새로운 나라 고려의 탄생 |
| `regular_goryeo_founding` | 1 | simulator.feedback | 송악(개경)의 위치를 확인하세요! |
| `regular_goryeo_founding` | 2 | narrative ↔ 정답 | 🤝 "왕씨 성을 하사하고 벼슬과 토지를 주어 따뜻하게 포용한다!" |
| `regular_goryeo_founding` | 2 | location | 개경 성문 앞 |
| `regular_goryeo_founding` | 2 | simulator.feedback | 민족 재통일의 결단을 확인하세요! |
| `regular_goryeo_founding` | 3 | narrative ↔ 정답 | 📜 "후대 왕들이 지켜야 할 국가 통치 지침 '훈요 10조'를 반포한다!" |
| `regular_goryeo_founding` | 3 | location | 개경 본궐 정전 |
| `regular_goryeo_founding` | 3 | simulator.feedback | 불교와 서경 중시 정책을 확인하세요! |
| `regular_goryeo_society` | 2 | simulator.feedback | 남녀 균등 상속의 지혜를 확인하세요! |
| `regular_myeongnyang` | 1 | location | 1597년 진도 벽파진 군영 |
| `regular_myeongnyang` | 3 | location | 울돌목 결전 해역 |
| `regular_joseon_economy` | 1 | location | 삼남 지방 논두렁 |
| `regular_joseon_economy` | 1 | badge | 🌾 농업의 혁명 |
| `regular_joseon_economy` | 3 | location | 송파 5일장 장터 |
| `regular_joseon_silhak` | 1 | location | 담헌 홍대용의 서재 |
| `regular_joseon_silhak` | 1 | simulator.feedback | 새로운 세계관을 확인하세요! |
| `regular_joseon_silhak` | 1-1 | simulator.instruction | 🌍  과학적 사고를 다시 열어보세요! |
| `regular_sejong` | 1 | location | 경복궁 집현전 (1443년) |
| `regular_independence` | 1 | location | 서울 태화관 & 탑골공원 (1919년 3월 1일) |
| `regular_independence` | 4 | simulator.infoText | 자료마다 알려 주는 내용이 다르므로 함께 비교해야 합니다. |
| `regular_independence` | 4 | simulator.feedback | 자료의 성격과 범위를 구분해 보세요. |
| `regular_goryeo_war` | 4 | simulator.feedback | 한 사건만으로 전체 과정을 단정하지 마세요. |
| `regular_goryeo_culture` | 1 | narrative ↔ 정답 | 다음 관문에서 직지의 인쇄 과정을 살펴봅니다. |
| `regular_goryeo_culture` | 2 | narrative ↔ 정답 | 다음 관문에서 벽란도의 교류 자료를 살펴봅니다. |
| `regular_goryeo_culture` | 2 | badge | ✨ 제2관문: 절차와 기술의 의미 연결하기 |
| `regular_goryeo_culture` | 2 | simulator.infoText | 순서를 외우는 것보다 각 과정이 왜 앞뒤로 이어지는지 살펴보세요. |
| `regular_goryeo_culture` | 2 | simulator.feedback | 과정 카드와 기술 의미를 모두 완성해야 합니다. |
| `regular_goryeo_culture` | 3 | narrative ↔ 정답 | 마지막 관문에서 지금까지 모은 근거를 연결합니다. |
| `regular_goryeo_culture` | 3 | badge | ⛵ 제3관문: 공간 근거와 자료의 범위 구분하기 |
| `regular_modern_open` | 2 | simulator.feedback | 과정 카드와 의미 질문을 모두 완성해야 합니다. |
| `regular_modern_open` | 4 | simulator.instruction | 🔎  주장을 고르고 앞선 관문에서 모은 근거를 연결하세요. |
| `regular_modern_open` | 4 | simulator.infoText | 근거의 개수보다 서로 다른 성격의 자료를 연결했는지가 중요합니다. |
| `regular_independence_army` | 4 | simulator.infoText | 자료마다 알려 주는 내용이 다르므로 서로 비교할 때 더 균형 잡힌 설명을 만들 수 있습니다. |
| `regular_silla` | 1 | location | 서라벌 월성 왕궁 (681년) |
| `regular_silla` | 4 | simulator.feedback | 한 자료만으로 시대 전체를 판단하지 마세요. |
| `regular_balhae` | 3 | simulator.feedback | 각 자료가 알려 주는 범위와 한계를 함께 생각하세요. |
| `regular_balhae` | 4 | simulator.infoText | 자료마다 알려 주는 내용이 다르므로 여러 자료를 함께 비교해야 합니다. |
| `regular_joseon_status` | 1 | location | 한양 성균관 & 관청 앞 (16세기) |
| `regular_joseon_status` | 2 | location | 궁궐 내의원 & 사역원 (16세기) |
| `regular_joseon_status` | 3 | location | 삼남 지방 논밭 & 양반가 마당 (16세기) |
| `regular_japanese_rule_1` | 4 | badge | 🔎 제4관문: 제도와 삶의 변화 |
| `regular_japanese_rule_1` | 4 | simulator.feedback | 자료 하나만으로 시대 전체를 단정하지 마세요. |
| `regular_japanese_rule_2` | 4 | simulator.infoText | 자료마다 알려 주는 범위와 관점이 다릅니다. |
| `regular_post_war` | 1 | narrative ↔ 정답 | 🤝 "판잣집을 짓고 서로 돕고 나누며 잿더미 속에서 다시 일어설 희망의 씨앗을 품는다!" |
| `regular_post_war` | 3 | simulator.feedback | 평화와 화해의 따뜻한 빛이 온 강토에 비추었습니다! |
| `regular_post_war` | 4 | simulator.infoText | 자료마다 알려 주는 범위와 관점이 다릅니다. |
<!-- STAGE_COHERENCE:END -->
