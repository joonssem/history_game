# 3단원 민감 주제 표현 lint

생성: `scripts/17_lint_sensitive_wording.js` (2026-09-21)

기계가 신호로 잡을 수 있는 것만 본다. **실패가 아니라 검토 목록이다.** 문장의 뜻이 실제로 맞는지, 과장인지는 관문 설계실·대조실·연결 공방이 원문과 대조해 판단한다.

- 대상 MUD(정규 3단원 7편): regular_gwangbok, regular_independence, regular_korean_war, regular_independence_army, regular_japanese_rule_1, regular_japanese_rule_2, regular_post_war
- 퀴즈: `data/quizzes.json`의 `unit: "일제강점기 및 근현대"` 문항
- 스토리: `stories.json`·`stories_chasi2.json` 중 제목·chasi 표기로 3단원을 추정한 0편(현재 0편이면 아직 3단원 스토리가 없다는 뜻)
- 원인과 결과: `causeEffectChains.json` 중 제목으로 3단원을 추정한 세트 — 나라를 빼앗기고 되찾으려 한 사람들, 광복에서 분단까지(**unitId 필드가 없어 제목 키워드로 추정한 것이므로 사람이 재확인 필요**)
- 유물: `artifacts.json`의 지정 9종(art_15, art_16, art_17, art_18, art_20, art_24, art_independence, art_korean_war, art_deep_4)


## 신호 5종

1. 전칭 표현 — "모든/전부/누구나/전 국민/모두가" + 집단 명사
2. 확정 수치 — "정확히", 범위 표기 없는 "총 N명"
3. 인과 단정 — "때문에/그 결과/덕분에"
4. 감정 자극어 — 5학년 교재 기준을 넘는 과한 묘사(목록은 스크립트 주석에 근거와 함께 기록)
5. 인물 평가어 — 공과를 새로 판정하는 수식어

이미 "~것은 아니다", "~수 없다"처럼 한계를 밝히는 문장은 신호에서 뺐다(부정문 오탐 제거, scripts/15 C1-05와 같은 기준).

검토 신호 없음.

<details><summary>허용됨(3건) — 사람이 검토해 문제없다고 판단, 재검토 불필요</summary>

| 종류 | 출처 | 필드 | 문장 | 허용 사유 |
|---|---|---|---|---|
| 인과 단정 | regular_korean_war | regular_korean_war.stages.4.glossary[0].definition | 전쟁과 분단 때문에 서로 만나지 못하게 된 가족 | 이산가족 정의문. 인과가 정의 자체다(2026-09-21 기획 세션) |
| 인과 단정 | regular_japanese_rule_1 | regular_japanese_rule_1.stages.3.narrative | <b>1910년대에는 강한 감시와 탄압 때문에 여러 형태의 민족 운동이 비밀리에 이루어졌습니다.</b><br><br>비밀 결사와 여성 단체, 군자금 모금 등은 서로 방식이 달랐습니다. | 1910년대 무단 통치와 비밀 결사의 관계는 교과서 표준 서술(2026-09-21 기획 세션) |
| 인과 단정 | regular_japanese_rule_1 | regular_japanese_rule_1.stages.3.choices[0].feedback | 강한 탄압 때문에 공개 활동이 어려웠고, 여러 사람이 서로 다른 방식으로 독립운동을 이어 갔습니다. | 위와 같은 근거(2026-09-21 기획 세션) |

</details>

## 확장 제안 (구현하지 않음)

이번 라운드는 3단원에만 적용했다(§4 주의 — 1·2단원에 그대로 적용하면 이미 검증된 문장까지 무더기로 걸린다). 1·2단원까지 넓히려면:

- 먼저 1·2단원 각각에 대해 이 스크립트를 시험 실행해 신호 개수를 가늠하고,
- 허용 목록을 1·2단원 검증 완료 문구로 미리 채운 뒤,
- 대상 범위를 `TARGET_UNIT_ID` 하나가 아니라 배열로 넓히는 순서를 제안한다.

지금은 구현하지 않는다.
