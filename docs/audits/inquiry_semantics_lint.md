# inquiry-task 의미 lint

생성: `scripts/14_lint_inquiry_semantics.js` (2026-09-15)

기계가 신호로 잡을 수 있는 것만 본다. **실패가 아니라 검토 목록이다.** 문장의 뜻이 실제로 맞는지는 사람이 판단한다.

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
| 날짜 없는 카드 | 3 | cards[erect-bukhansan-monument] | 연도 표지가 없습니다 — 날짜로 확인되는 사건인지, 해석이 사건처럼 끼어 있지 않은지 검토하세요. |
| 완료·단정어 | 3 | stages.3.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |
| 완료·단정어 | 4 | stages.4.simulator.feedback | 필연·완결 표현 "완성"이(가) 있습니다 — 다른 해석 가능성을 닫는 문장인지 검토하세요. |

