# inquiry-task 의미 lint

생성: `scripts/14_lint_inquiry_semantics.js` (2026-09-15)

기계가 신호로 잡을 수 있는 것만 본다. **실패가 아니라 검토 목록이다.** 문장의 뜻이 실제로 맞는지는 사람이 판단한다.

> **라운드 4 지시서와 다른 점**: 지시서(§4-1)는 "기획 세션이 방금 고친 삼국 3관문은 순서 노출 경고가 사라져야 한다"고 했지만, 아래처럼 여전히 남아 있다. `b4dca60`는 `simulator.instruction`의 "영토 확보→교류→기록 순서로"만 지웠고, `meaningQuestion.options[order-random].feedback`의 같은 패턴("영토 확보→순행→기록 사이에는 앞뒤 관계가 있습니다")은 손대지 않았다. `data/mud/regular_three_kingdoms.json`은 조작대 소유가 아니라(관문 설계실) 여기서 고치지 않고 보고만 한다.

### regular_goryeo_culture

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 날짜 없는 카드 | 2 | cards[prepare-type] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 날짜 없는 카드 | 2 | cards[compose-type] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 날짜 없는 카드 | 2 | cards[print-sheet] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 날짜 없는 카드 | 2 | cards[reuse-type] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 완료·단정어 | 1 | stages.1.simulator.task.options.0.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 1 | stages.1.simulator.task.awards.1.detail | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 2 | stages.2.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |

### regular_modern_open

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 정답 장소 노출 | 3 | locations[electric-light].feedback | 오답 피드백이 정답 장소 라벨("전차 노선")을 그대로 포함합니다. |
| 완료·단정어 | 2 | stages.2.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 4 | stages.4.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |

### regular_neolithic

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 날짜 없는 카드 | 2 | cards[prepare-clay] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 날짜 없는 카드 | 2 | cards[shape-pointed-base] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 날짜 없는 카드 | 2 | cards[carve-comb-pattern] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 완료·단정어 | 2 | stages.2.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 3 | stages.3.simulator.task.options.1.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 3 | stages.3.simulator.task.options.2.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 3 | stages.3.simulator.completion.successText | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 4 | stages.4.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |

### regular_three_kingdoms

| 종류 | 관문 | 필드 | 내용 |
|---|---|---|---|
| 순서 노출 | 3 | meaningQuestion.options[order-random].feedback | 카드 수(3)만큼 화살표로 이어진 문구가 있습니다: "확보→순행→기록" |
| 날짜 없는 카드 | 3 | cards[erect-bukhansan-monument] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 완료·단정어 | 3 | stages.3.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 4 | stages.4.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |

